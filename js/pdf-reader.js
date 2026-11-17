/* Household ledger: offline PDF statement reader.
   Reads card statements on the device with PDF.js (no AI, nothing leaves the device).
   Supported layouts: Cal (Diners, Visa, Mastercard, FLY CARD) monthly statements.
   Each supported issuer has its own rules; unknown PDFs are rejected instead of guessed. */
(function (root) {
  'use strict';
  const HEB = /[֐-׿]/;
  const NUMCH = /[A-Za-z0-9.,\/:%]/;

  /* ---------- text layout: glyphs -> words -> lines ---------- */
  function wordText(cs) {
    if (cs.length === 1) return cs[0].s;
    const heb = cs.some(c => HEB.test(c.s));
    if (!heb) return cs.map(c => c.s).join('');
    // Hebrew word: glyphs read right to left, but digit runs inside stay left to right
    const rtl = cs.slice().reverse();
    const out = []; let run = [];
    const flush = () => { if (run.length) { out.push(...run.reverse()); run = []; } };
    for (const c of rtl) { if (NUMCH.test(c.s) && c.s.length === 1) run.push(c); else { flush(); out.push(c); } }
    flush();
    return out.map(c => c.s).join('');
  }
  function toWords(items) {
    const cs = items.filter(i => i.s.trim()).sort((a, b) => a.x - b.x);
    const ws = []; let cur = null;
    for (const c of cs) {
      if (cur && c.x - cur.x1 < 1.0) { cur.cs.push(c); cur.x1 = Math.max(cur.x1, c.x + c.w); }
      else { cur = { cs: [c], x0: c.x, x1: c.x + c.w }; ws.push(cur); }
    }
    return ws.map(w => ({ s: wordText(w.cs), x0: w.x0, x1: w.x1, heb: w.cs.some(c => HEB.test(c.s)) }));
  }
  // reading order for a set of words on one line (right to left, Latin/number runs kept left to right)
  function readLine(ws) {
    const out = []; let run = [];
    const flush = () => { if (run.length) { out.push(...run.reverse()); run = []; } };
    for (const w of ws.slice().sort((a, b) => b.x1 - a.x1)) { if (w.heb) { flush(); out.push(w); } else run.push(w); }
    flush();
    return out.map(w => w.s).join(' ').replace(/\s+/g, ' ').trim();
  }
  async function readPages(pdfjsLib, data) {
    const doc = await pdfjsLib.getDocument({ data, isEvalSupported: false, disableFontFace: true, verbosity: 0,
      cMapUrl: root.LEDGER_PDF_CMAPS || undefined, cMapPacked: true }).promise;
    const pages = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const pg = await doc.getPage(p); const tc = await pg.getTextContent();
      const items = tc.items.filter(i => i.str !== '').map(i => ({ x: i.transform[4], y: i.transform[5], w: i.width, s: i.str }));
      items.sort((a, b) => b.y - a.y);
      const rows = [];
      for (const it of items) {
        let r = rows.find(r => Math.abs(r.y - it.y) < 1.2);
        if (!r) { r = { y: it.y, items: [] }; rows.push(r); }
        r.items.push(it);
      }
      pages.push(rows.sort((a, b) => b.y - a.y).map(r => ({ y: r.y, ws: toWords(r.items) })).filter(r => r.ws.length));
    }
    return pages;
  }

  /* ---------- helpers ---------- */
  const DATE4 = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const iso = (d, m, y) => `${y.length === 2 ? '20' + y : y}-${m}-${d}`;
  const CUR = { '₪': 'ILS', '$': 'USD', 'EU': 'EUR', '€': 'EUR', '£': 'GBP', 'GBP': 'GBP', 'USD': 'USD', 'EUR': 'EUR' };
  function money(s) {
    const m = String(s).replace(/‎|‏/g, '').trim().match(/^([₪$€£]|[A-Z]{2,3})?\s*(-?)\s*([\d,]+\.\d{2})(-?)$/);
    if (!m) return null;
    const v = parseFloat(m[3].replace(/,/g, '')) * ((m[2] || m[4]) ? -1 : 1);
    return { v, cur: CUR[m[1] || '₪'] || m[1] || 'ILS' };
  }
  // Some statements print Latin merchant names reversed ("sserpxE eeffoC")
  function fixLatin(name, known) {
    return name.replace(/[A-Za-z0-9][A-Za-z0-9 .*'&\/\-]*[A-Za-z0-9.]/g, run => {
      const rev = run.split('').reverse().join('');
      if (known && known(run)) return run;
      if (known && known(rev)) return rev;
      const toks = run.split(' ').filter(t => /[A-Za-z]{3,}/.test(t));
      const looksRev = toks.length && toks.some(t => /^[a-z]{2,}[A-Z]$/.test(t));
      return looksRev ? rev : run;
    });
  }

  /* ---------- Cal (Diners / Visa Cal / FLY CARD) ---------- */
  function isCal(text) { return /\bCal\b|כאל|diners\.co\.il|cal-online/i.test(text) && /שם בית העסק/.test(text) && /סכום/.test(text); }
  function parseCal(pages, opts) {
    const known = opts && opts.knownName;
    const B = { date: 480, merch: [418, 503], sector: [383, 418], detail: [278, 383], orig: [195, 250], charged: [120, 195] };
    const inB = (w, b) => w.x0 >= b[0] - 0.5 && w.x0 < b[1];
    const cards = {}; let card = null, holder = null, bill = null;
    let cur = null; const out = [];
    const finish = () => { if (cur) { out.push(cur); cur = null; } };
    for (const rows of pages) {
      let inTable = false;
      for (const r of rows) {
        const all = readLine(r.ws);
        const m4 = all.match(/המסתיים ב-?\s*(\d{4})/);
        if (m4) {
          const w = r.ws.find(w => /^\d{4}$/.test(w.s)); card = (w && w.s) || m4[1];
          const h = all.match(/ע"ש\s+(.+)$/); if (h) holder = h[1].trim();
        }
        const bd = all.match(/דף חיוב חודשי ל-?\s*(\d{2})\/(\d{2})\/(\d{2,4})/); if (bd && !bill) bill = iso(bd[1], bd[2], bd[3]);
        if (/שם בית העסק/.test(all)) { inTable = true; finish(); continue; }
        const tot = all.match(/סה"כ לתאריך\s*(\d{2})\/(\d{2})\/(\d{2,4})/);
        if (tot) {
          finish(); inTable = false;
          const amt = r.ws.map(w => money(w.s)).find(x => x);
          const c = card || '?';
          cards[c] = cards[c] || { rows: [], total: null, holder };
          if (amt) cards[c].total = Math.round(((cards[c].total || 0) + amt.v) * 100) / 100;
          bill = bill || iso(tot[1], tot[2], tot[3]);
          continue;
        }
        if (!inTable) continue;
        if (/ט\.ל\.ח|אם במשך 30 יום/.test(all)) { finish(); inTable = false; continue; }
        const ws = r.ws.filter(w => w.x1 > B.charged[0]);
        const dateW = ws.find(w => w.x0 >= B.date && DATE4.test(w.s));
        if (dateW) {
          finish();
          const [, d, mo, y] = dateW.s.match(DATE4);
          cur = { date: iso(d, mo, y), merch: [], sector: [], detail: [], orig: null, charged: null, card: card || '?' };
        }
        if (!cur) continue;
        const ln = { merch: [], sector: [], detail: [] };
        for (const w of ws) {
          if (w === dateW) continue;
          const mv = money(w.s);
          if (mv && inB(w, B.charged)) { if (cur.charged == null) cur.charged = mv; continue; }
          if (mv && inB(w, B.orig)) { if (cur.orig == null) cur.orig = mv; continue; }
          if (inB(w, B.merch)) ln.merch.push(w);
          else if (inB(w, B.sector)) ln.sector.push(w);
          else if (inB(w, B.detail)) ln.detail.push(w);
        }
        for (const k of ['merch', 'sector', 'detail']) if (ln[k].length) cur[k].push(readLine(ln[k]));
        if (!dateW && cur && r.ws.some(w => w.x0 >= B.date)) finish();
      }
      finish();
    }
    // group rows per card
    const prefix = opts && opts.knownPrefix;
    for (const t of out) {
      let merchant = fixLatin(t.merch.join(' '), known).replace(/\s+/g, ' ').trim();
      // Cal prints at most 25 characters of the store name; complete it from stores you already have
      const same = !(known && known(merchant)) && opts && opts.sameLetters && opts.sameLetters(merchant);
      if (same) merchant = same;
      else if (prefix && merchant.length >= 20) { const full = prefix(merchant); if (full) merchant = full; }
      const sector = t.sector.join(' ').replace(/\s+/g, ' ').trim();
      const note = t.detail.join(' ').replace(/\s+/g, ' ').trim();
      const amount = t.charged ? t.charged.v : (t.orig && t.orig.cur === 'ILS' ? t.orig.v : null);
      if (amount == null || !merchant) continue;
      const im = note.match(/תשלום\s*(\d+)\s*מ(?:תוך)?\s*(\d+)/);
      let type = im ? 'installment' : /הוראת קבע/.test(note) ? 'standing' : amount < 0 ? 'refund' : 'regular';
      const row = { date: t.date, merchant, amount, sector, note, type, bill: bill || undefined };
      if (im) row.inst = im[1] + '/' + im[2];
      if (t.orig) { row.oa = t.orig.v; if (t.orig.cur !== 'ILS') row.oc = t.orig.cur; }
      const c = t.card;
      (cards[c] = cards[c] || { rows: [], total: null, holder }).rows.push(row);
    }
    // a fee and its discount on the same day are one net charge (as in the Excel export)
    for (const v of Object.values(cards)) {
      const keep = [];
      for (const r of v.rows) {
        const twin = r.amount < 0 && r.oa == null && keep.find(k => k.date === r.date && k.merchant === r.merchant && k.amount > 0);
        if (twin) { twin.amount = Math.round((twin.amount + r.amount) * 100) / 100; twin.oa = twin.amount; } else keep.push(r);
      }
      v.rows = keep;
    }
    return Object.entries(cards).filter(([, v]) => v.rows.length).map(([c, v]) => ({
      kind: 'PDF', issuer: 'Cal', card: c === '?' ? null : c, cardholder: v.holder || holder, bill, total: v.total, rows: v.rows
    }));
  }

  /* ---------- bank account statement (Leumi "דף חשבון" export) ---------- */
  function isBank(text) { return /דף חשבון/.test(text) && /יתרה/.test(text) && /זכות/.test(text) && /חובה/.test(text); }
  function parseBank(pages) {
    const DATE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const num = s => { const m = String(s).replace(/[₪\s‎‏]/g, '').match(/^(-?)([\d,]+\.\d{2})(-?)$/); return m ? parseFloat(m[2].replace(/,/g, '')) * ((m[1] || m[3]) ? -1 : 1) : null; };
    let acct = null; let cols = null; const rows = [];
    const mid = w => (w.x0 + w.x1) / 2;
    for (const page of pages) {
      for (const r of page) {
        const line = readLine(r.ws);
        const am = line.match(/מספר חשבון:?\s*([\d\/-]{6,})/) || (/מספר חשבון/.test(line) && r.ws.map(w => w.s.match(/^\d{2,3}-\d{5,9}(?:\/\d+)?$/)).find(Boolean));
        if (am && !acct) acct = am[1] || am[0];
        // header row: remember where the credit, debit and balance columns sit
        const fw = re => r.ws.find(w => re.test(w.s));
        if (fw(/^זכות$/) && fw(/^חובה$/)) {
          const bal = fw(/^יתרה$/) || fw(/^מצטברת$/);
          cols = { credit: mid(fw(/^זכות$/)), debit: mid(fw(/^חובה$/)), bal: bal ? Math.min(...r.ws.filter(w => /^(יתרה|מצטברת)$/.test(w.s)).map(mid)) + 20 : null, desc: mid(fw(/^סוג$/) || fw(/^תנועה$/) || fw(/^תיאור$/) || fw(/^פרטים$/) || { x0: 420, x1: 480 }) };
          continue;
        }
        if (!cols) continue;
        const ws = r.ws.slice().sort((a, b) => b.x1 - a.x1);
        const dw = ws.find(w => DATE.test(w.s) && w.x0 > cols.desc);
        if (!dw) continue;
        const [, d, m, y] = dw.s.match(DATE);
        let credit = 0, debit = 0, bal = null; const desc = [];
        for (const w of ws) {
          if (w === dw || /^₪$/.test(w.s)) continue;
          const v = num(w.s);
          if (v != null && mid(w) < cols.desc - 40) {
            const c = mid(w);
            const near = [['credit', cols.credit], ['debit', cols.debit], ['bal', cols.bal]].filter(x => x[1] != null).sort((a, b) => Math.abs(c - a[1]) - Math.abs(c - b[1]))[0][0];
            if (near === 'credit') credit = v; else if (near === 'debit') debit = Math.abs(v); else bal = v;
          } else if (mid(w) > cols.credit + 30) desc.push(w);
        }
        const a = Math.round((credit - debit) * 100) / 100;
        if (!a) continue;
        rows.push({ date: `${y}-${m}-${d}`, ds: readLine(desc), a, bal });
      }
    }
    return rows.length ? [{ bank: true, kind: 'Bank PDF', acct: acct || 'bank', rows }] : [];
  }

  /* ---------- Isracard (and cards it runs, e.g. Mastercard / Fly Card) ---------- */
  function isIsracard(text) { return /ישראכרט|isracard/i.test(text) && /פרוט פעולותיך/.test(text); }
  function parseIsracard(pages, opts) {
    const known = opts && opts.knownName, prefix = opts && opts.knownPrefix;
    const D2 = /^(\d{2})\/(\d{2})\/(\d{2})$/;
    const r2 = v => Math.round(v * 100) / 100;
    let bill = null, card = null, holder = null, sec = null, foreignTot = null, domTot = null, domNet = null, fee = null, carried = 0;
    const rows = [];
    const tidy = n => n.replace(/\s+/g, ' ').trim();
    const nameOf = raw => {
      let n = tidy(fixLatin(raw, known).replace(/\s\?\s/g, ' - '));
      if (known && known(n)) return n;
      const same = opts && opts.sameLetters && opts.sameLetters(n); if (same) return same;
      if (prefix && n.length >= 12) { const full = prefix(n); if (full) return full; }
      return n;
    };
    for (const page of pages) {
      for (const r of page) {
        const line = readLine(r.ws);
        const ws = r.ws.slice().sort((a, b) => b.x1 - a.x1);
        const bm = line.match(/פרוט פעולותיך לתאריך:?\s*(\d{2})\/(\d{2})\/(\d{2})/); if (bm && !bill) bill = iso(bm[1], bm[2], bm[3]);
        const cm = line.match(/שמסתיים בספרות:?\s*(\d{4})/); if (cm && !card) card = cm[1];
        if (!card) { const w = ws.find(w => /^\*?\d{4}\*?$/.test(w.s) && w.x0 > 500); if (w) card = w.s.replace(/\*/g, ''); }
        if (/רכישות בחו"ל/.test(line)) { sec = 'foreign'; continue; }
        if (/עסקות שחויבו/.test(line)) { sec = 'domestic'; continue; }
        if (/סה"כ חיוב בניכוי ההנחה/.test(line)) { const w = ws.find(w => money(w.s)); if (w) domNet = money(w.s).v; sec = null; continue; }
        if (/^סה"כ חיוב לתאריך/.test(line)) {
          const ms = ws.filter(w => money(w.s) && w.x0 > 140); const w = ms.sort((a, b) => b.x0 - a.x0)[0];
          if (sec === 'foreign') { foreignTot = w ? money(w.s).v : null; sec = null; }
          else { domTot = w ? money(w.s).v : null; }
          continue;
        }
        if (sec === 'domestic' && /כולל מע"מ/.test(line) && !ws.some(w => D2.test(w.s))) { const w = ws.find(w => money(w.s) && w.x0 > 215); if (w) fee = money(w.s).v; continue; }
        if (!sec) continue;
        const dw = ws.find(w => D2.test(w.s) && w.x0 > 480);
        if (!dw) continue;
        const [, d, m, y] = dw.s.match(D2);
        const date = iso(d, m, y);
        if (sec === 'foreign') {
          const merch = ws.filter(w => w.x0 >= 375 && w.x0 < 480 && w !== dw && !/^[אק]$/.test(w.s));
          const kind = ws.find(w => /^[אק]$/.test(w.s) && w.x0 > 475);
          let oa = null, oc = 'ILS'; const curW = ws.find(w => /^[$€£]$|^EU$/.test(w.s) && w.x0 > 330 && w.x0 < 380);
          const oaW = ws.find(w => money(w.s) && w.x0 >= 330 && w.x0 < 375); if (oaW) oa = money(oaW.s).v;
          if (curW) oc = CUR[curW.s] || curW.s;
          const net = ws.filter(w => money(w.s) && w.x0 < 185).sort((a, b) => a.x0 - b.x0)[0];
          const feeW = ws.find(w => money(w.s) && w.x0 >= 190 && w.x0 < 222);
          const amount = net ? money(net.s).v : (oc === 'ILS' ? oa : null);
          if (amount == null) continue;
          const row = { date, merchant: nameOf(readLine(merch)), amount, type: kind && kind.s === 'ק' ? 'standing' : 'regular', note: 'רכישה בחו"ל', bill: bill || undefined, oa, oc };
          if (feeW) row.fx = money(feeW.s).v;
          rows.push(row);
        } else {
          const kindW = ws.filter(w => w.x0 >= 445 && w.x0 < 480).map(w => w.s).join(' ');
          const merch = ws.filter(w => w.x0 >= 350 && w.x0 < 445);
          const sector = readLine(ws.filter(w => w.x0 >= 295 && w.x0 < 350));
          const txW = ws.find(w => money(w.s) && w.x0 >= 265 && w.x0 < 300);
          const chW = ws.find(w => money(w.s) && w.x0 >= 222 && w.x0 < 265);
          const det = ws.filter(w => w.x1 <= 225);
          const detail = readLine(det);
          if (!chW && !txW) continue;
          let amount = chW ? money(chW.s).v : money(txW.s).v;
          const dm = detail.match(/הנחה\s*₪?\s*([\d,]+\.\d{2})/); const disc = dm ? parseFloat(dm[1].replace(/,/g, '')) : 0;
          amount = r2(amount - disc);
          const im = detail.match(/תשלום\s*(\d+)\s*מ(?:תוך)?\s*(\d+)/);
          const type = im ? 'installment' : /ה\.?קבע/.test(kindW) ? 'standing' : amount < 0 ? 'refund' : 'regular';
          const row = { date, merchant: nameOf(readLine(merch)), amount, sector, note: tidy([kindW, detail].filter(Boolean).join(' · ')), type, bill: bill || undefined };
          if (txW) row.oa = money(txW.s).v;
          if (im) row.inst = im[1] + '/' + im[2];
          // a charge moved from the previous statement repeats purchases already listed there
          if (/חיוב ממועד קודם/.test(row.merchant)) { carried = r2(carried + amount); continue; }
          rows.push(row);
        }
      }
    }
    if (fee) {
      const [by, bmo] = (bill || '').split('-').map(Number);
      const last = bill ? new Date(Date.UTC(by, bmo - 1, 0)).toISOString().slice(0, 10) : null;
      rows.push({ date: last || bill, merchant: 'דמי כרטיס', amount: fee, sector: '', note: 'דמי כרטיס/הנפקה', type: 'regular', bill: bill || undefined });
    }
    const total = (foreignTot != null || domNet != null || domTot != null) ? r2((foreignTot || 0) + (domNet != null ? domNet : (domTot || 0)) - carried) : null;
    return rows.length ? [{ kind: 'PDF', issuer: 'Isracard', card, cardholder: holder, bill, total, carried: carried || undefined, rows }] : [];
  }

  const ISSUERS = [{ name: 'Cal', test: isCal, parse: parseCal }, { name: 'Isracard', test: isIsracard, parse: parseIsracard }, { name: 'bank statement', test: isBank, parse: parseBank }];

  async function parse(pdfjsLib, data, opts) {
    const pages = await readPages(pdfjsLib, data);
    const text = pages.map(rows => rows.map(r => readLine(r.ws)).join('\n')).join('\n');
    const iss = ISSUERS.find(i => i.test(text));
    if (!iss) {
      const e = new Error('This PDF layout is not supported yet. Supported: Cal (Diners, FLY CARD) and Isracard card statements, and Leumi bank account statements. For other cards, export the statement as Excel.');
      e.code = 'unsupported'; throw e;
    }
    const sts = iss.parse(pages, opts || {});
    if (!sts.length) { const e = new Error('No transactions were found in this ' + iss.name + ' PDF.'); e.code = 'empty'; throw e; }
    return sts;
  }

  const letters = n => String(n).replace(/\s+/g, '').split('').sort().join('');
  const api = { parse, letters, _readPages: readPages, _readLine: readLine, _fixLatin: fixLatin };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LedgerPDF = api;
})(typeof window !== 'undefined' ? window : globalThis);
