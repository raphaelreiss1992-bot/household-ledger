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

  const ISSUERS = [{ name: 'Cal', test: isCal, parse: parseCal }];

  async function parse(pdfjsLib, data, opts) {
    const pages = await readPages(pdfjsLib, data);
    const text = pages.map(rows => rows.map(r => readLine(r.ws)).join('\n')).join('\n');
    const iss = ISSUERS.find(i => i.test(text));
    if (!iss) {
      const e = new Error('This PDF layout is not supported yet. Supported: Cal (Diners, FLY CARD) statements. For other cards, export the statement as Excel.');
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
