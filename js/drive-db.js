/*
 * Household ledger: Google Drive storage, encryption and the statements inbox.
 *
 * Drive layout (created by the app in your My Drive):
 *   Household ledger/
 *     Statements to import/   <- you upload Excel/CSV statements here (Drive app, Finder, web)
 *     Encrypted data/         <- the ledger itself, one encrypted file per month
 *
 * Sign in uses Google's redirect flow, which works inside an iPhone home screen app.
 * Data is encrypted on the device (AES-GCM 256, key from your passphrase, PBKDF2-SHA256)
 * before upload. Google only stores unreadable data. There is no server.
 */
(function () {
  "use strict";
  const CFG = window.LEDGER_CONFIG || {};
  // Full Drive access is needed so each person in the household can save into a folder someone else owns.
  const SCOPES = ["https://www.googleapis.com/auth/drive"];
  const TOKEN_V = 2; // bump when SCOPES change, so everyone approves the new permission once
  const API = "https://www.googleapis.com/drive/v3/files";
  const UP = "https://www.googleapis.com/upload/drive/v3/files";
  const FOLDER_MIME = "application/vnd.google-apps.folder";
  const KEYFILE = "ledger.key.json";
  const ITER = 310000;
  const NAMES = { root: CFG.folderName || "Household ledger", inbox: "Statements to import", data: "Encrypted data" };
  const REDIRECT = location.origin + location.pathname.replace(/index\.html$/, "");

  let token = null, tokenExp = 0, key = null;
  const ids = { root: null, inbox: null, data: null };
  const files = {}; // data file name -> drive id

  /* ---------- helpers ---------- */
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (buf) => { let s = ""; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i += 32768) s += String.fromCharCode.apply(null, a.subarray(i, i + 32768)); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const err = (code, msg) => Object.assign(new Error(msg || code), { code });
  const fname = (path) => path.split("/").join("~") + ".json";
  const q = (s) => encodeURIComponent(s);

  /* ---------- device storage (IndexedDB) ---------- */
  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("household-ledger-drive", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function kv(op, k, v) {
    try {
      const db = await idb();
      return await new Promise((res, rej) => {
        const t = db.transaction("kv", op === "get" || op === "keys" ? "readonly" : "readwrite");
        const s = t.objectStore("kv");
        const r = op === "get" ? s.get(k) : op === "keys" ? s.getAllKeys() : op === "put" ? s.put(v, k) : s.delete(k);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    } catch (e) { return undefined; }
  }

  /* ---------- crypto ---------- */
  async function deriveKey(pass, salt) {
    const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function seal(k, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, enc.encode(JSON.stringify(obj)));
    return JSON.stringify({ v: 1, iv: b64(iv), ct: b64(ct) });
  }
  async function unseal(k, text) {
    const o = JSON.parse(text);
    return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(o.iv) }, k, unb64(o.ct))));
  }

  /* ---------- Google sign in (redirect flow) ---------- */
  function readTokenFromUrl() {
    if (!location.hash || location.hash.indexOf("access_token=") < 0 && location.hash.indexOf("error=") < 0) return null;
    const p = new URLSearchParams(location.hash.slice(1));
    history.replaceState(null, "", REDIRECT + location.search);
    const expected = sessionStorage.getItem("ledger-oauth-state");
    sessionStorage.removeItem("ledger-oauth-state");
    if (p.get("error")) return { error: p.get("error") === "access_denied" ? "Access to Google Drive was not given." : p.get("error") };
    if (!expected || p.get("state") !== expected) return { error: "Sign in could not be verified. Try again." };
    const granted = (p.get("scope") || "").split(" ");
    if (!SCOPES.every((s) => granted.includes(s))) return { error: "Google Drive access is needed: tick the Google Drive box on Google's screen." };
    return { token: p.get("access_token"), exp: Date.now() + (+p.get("expires_in") || 3600) * 1000, v: TOKEN_V };
  }
  function redirectToGoogle() {
    const state = b64(crypto.getRandomValues(new Uint8Array(16))).replace(/[^a-zA-Z0-9]/g, "");
    sessionStorage.setItem("ledger-oauth-state", state);
    localStorage.setItem("ledger-signed-in", "1");
    const u = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
      client_id: CFG.googleClientId, redirect_uri: REDIRECT, response_type: "token", scope: SCOPES.join(" "),
      include_granted_scopes: "true", state, ...(localStorage.getItem("ledger-email") ? { login_hint: localStorage.getItem("ledger-email") } : {}),
    });
    location.assign(u);
    return new Promise(() => {}); // the page is leaving
  }
  function loadSavedToken() {
    try { const t = JSON.parse(localStorage.getItem("ledger-token") || "null"); if (t && t.v === TOKEN_V && t.exp > Date.now() + 120000) { token = t.token; tokenExp = t.exp; return true; } } catch (e) {}
    return false;
  }
  function saveToken(t) { token = t.token; tokenExp = t.exp; localStorage.setItem("ledger-token", JSON.stringify(t)); }
  // When the hour runs out while the app is open, ask for one tap; pending saves are kept on the device.
  let reconnecting = null;
  function reconnect() {
    if (!reconnecting) reconnecting = new Promise(() => {
      screen(`<h1>Reconnect to Google Drive</h1><p>Google sign in lasts about an hour. Your last changes are kept on this device and finish saving after you reconnect.</p>
        <button class="g-btn pri" id="gReconnect">Reconnect</button>`);
      document.getElementById("gReconnect").onclick = () => redirectToGoogle();
    });
    return reconnecting;
  }
  async function ensureToken() { if (!token || Date.now() > tokenExp - 60000) await reconnect(); }

  /* ---------- Drive REST ---------- */
  async function api(url, opts = {}) {
    await ensureToken();
    let res;
    try { res = await fetch(url, Object.assign({}, opts, { headers: Object.assign({}, opts.headers, { Authorization: "Bearer " + token }) })); }
    catch (e) { throw err("unavailable", "No connection to Google Drive. Check your internet."); }
    if (res.status === 401) { token = null; localStorage.removeItem("ledger-token"); await reconnect(); }
    if (!res.ok) throw err(res.status === 403 ? "permission_denied" : res.status === 404 ? "not_found" : res.status === 429 ? "resource_exhausted" : "unavailable", "Google Drive error " + res.status);
    return res;
  }
  async function findOrCreateFolder(role, parent) {
    const query = `mimeType='${FOLDER_MIME}' and trashed=false and appProperties has { key='ledger' and value='${role}' }` + (parent ? ` and '${parent}' in parents` : "");
    const r = await (await api(`${API}?q=${q(query)}&fields=files(id,ownedByMe,createdTime)&spaces=drive&orderBy=createdTime`)).json();
    if (r.files && r.files.length) {
      // a household folder someone shared with you comes first, so you see the same ledger as them
      const shared = !parent && r.files.find((f) => !f.ownedByMe);
      return (shared || r.files[0]).id;
    }
    const body = { name: NAMES[role], mimeType: FOLDER_MIME, appProperties: { ledger: role } };
    if (parent) body.parents = [parent];
    const c = await (await api(API + "?fields=id", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
    return c.id;
  }
  async function listData() {
    for (const k of Object.keys(files)) delete files[k];
    let page = "";
    do {
      const r = await (await api(`${API}?q=${q(`'${ids.data}' in parents and trashed=false`)}&fields=nextPageToken,files(id,name)&pageSize=1000${page ? "&pageToken=" + page : ""}`)).json();
      (r.files || []).forEach((f) => { files[f.name] = f.id; });
      page = r.nextPageToken || "";
    } while (page);
  }
  async function readRaw(name) { return files[name] ? (await api(`${API}/${files[name]}?alt=media`)).text() : undefined; }
  async function uploadRaw(name, text) {
    if (files[name]) { await api(`${UP}/${files[name]}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: text }); return; }
    const bd = "ledger" + Math.random().toString(36).slice(2);
    const body = `--${bd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [ids.data], mimeType: "application/json" })}\r\n--${bd}\r\nContent-Type: application/json\r\n\r\n${text}\r\n--${bd}--`;
    const r = await (await api(`${UP}?uploadType=multipart&fields=id`, { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + bd }, body })).json();
    files[name] = r.id;
  }
  async function deleteRaw(name) { if (files[name]) { await api(`${API}/${files[name]}`, { method: "DELETE" }); delete files[name]; } }

  /* ---------- saves go through a device queue first, so nothing is lost on reconnect ---------- */
  async function queued(name, text) {
    await kv("put", "pend:" + name, text === null ? { del: true } : { text });
    if (text === null) await deleteRaw(name); else await uploadRaw(name, text);
    await kv("del", "pend:" + name);
  }
  async function flushPending() {
    const keys = ((await kv("keys")) || []).filter((k) => String(k).startsWith("pend:"));
    for (const k of keys) { const v = await kv("get", k); const name = k.slice(5); if (v && v.del) await deleteRaw(name); else if (v) await uploadRaw(name, v.text); await kv("del", k); }
    return keys.length;
  }
  const readDoc = async (name) => {
    const p = await kv("get", "pend:" + name);
    if (p) return p.del ? undefined : unseal(key, p.text);
    const t = await readRaw(name); return t === undefined ? undefined : unseal(key, t);
  };
  async function pool(items, n, fn) {
    const out = new Array(items.length); let i = 0;
    await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const j = i++; out[j] = await fn(items[j]); } }));
    return out;
  }

  /* ---------- the document API the app uses ---------- */
  function doc(path) {
    const name = fname(path);
    return {
      get: async () => { const d = await readDoc(name); return { exists: d !== undefined, data: () => d }; },
      set: async (data) => queued(name, await seal(key, data)),
      update: async (patch) => queued(name, await seal(key, Object.assign((await readDoc(name)) || {}, patch))),
      delete: async () => queued(name, null),
      collection: (c) => collection(path + "/" + c),
    };
  }
  function collection(path) {
    const pre = fname(path).replace(/\.json$/, "") + "~";
    return {
      get: async () => {
        const names = Object.keys(files).filter((n) => n.startsWith(pre) && !n.slice(pre.length, -5).includes("~"));
        const docs = await pool(names, 6, async (n) => { const d = await readDoc(n); return { id: n.slice(pre.length, -5), exists: d !== undefined, data: () => d }; });
        return { docs: docs.filter((d) => d.exists) };
      },
      doc: (id) => doc(path + "/" + id),
    };
  }
  const downloads = {
    save: async ({ filename, data }) => {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename || "export";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return { status: "saved" };
    },
  };
  window.claude = { use: async (n) => ({ db: { doc }, user: { id: async () => "me", can: async () => true }, downloads }[n] || null) };

  /* ---------- statements inbox ---------- */
  const SHEET_TYPES = /\.(xlsx|xls|csv)$/i;
  const inbox = {
    folderName: () => `${NAMES.root} → ${NAMES.inbox}`,
    list: async () => {
      const r = await (await api(`${API}?q=${q(`'${ids.inbox}' in parents and trashed=false`)}&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc&pageSize=200`)).json();
      return (r.files || []).filter((f) => f.mimeType !== FOLDER_MIME).map((f) => ({
        id: f.id, name: f.name, modified: f.modifiedTime, size: +f.size || 0,
        kind: f.mimeType === "application/vnd.google-apps.spreadsheet" ? "gsheet" : SHEET_TYPES.test(f.name) ? "sheet" : /\.pdf$/i.test(f.name) ? "pdf" : "other",
      }));
    },
    download: async (f) => {
      const url = f.kind === "gsheet" ? `${API}/${f.id}/export?mimeType=${q("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}` : `${API}/${f.id}?alt=media`;
      const blob = await (await api(url)).blob();
      const file = new File([blob], f.kind === "gsheet" ? f.name + ".xlsx" : f.name, { type: blob.type });
      file.driveId = f.id;
      return file;
    },
  };

  /* ---------- screens ---------- */
  function screen(html) {
    let el = document.getElementById("gate");
    if (!el) { el = document.createElement("div"); el.id = "gate"; document.body.appendChild(el); }
    el.innerHTML = `<div class="g-card"><div class="g-logo" aria-hidden="true"></div>${html}</div>`;
    el.hidden = false;
  }
  const hide = () => { const el = document.getElementById("gate"); if (el) el.hidden = true; };
  const setErr = (m) => { const e = document.getElementById("gErr"); if (e) e.textContent = m || ""; };
  const busy = (b, on, label) => { if (!b) return; b.disabled = on; if (label) b.textContent = label; };

  async function signIn() {
    if (!CFG.googleClientId || /PASTE/.test(CFG.googleClientId)) {
      screen(`<h1>One setup step left</h1><p>Open <code>config.js</code> and paste your Google client ID. The README explains how to create it (free, about 15 minutes).</p>`);
      throw err("not_configured");
    }
    if (!window.isSecureContext || !crypto.subtle) { screen(`<h1>Open the app from its https address</h1><p>Encryption and Google sign in need a secure page.</p>`); throw err("insecure"); }
    const fromUrl = readTokenFromUrl();
    if (fromUrl && fromUrl.token) saveToken(fromUrl);
    else if (!loadSavedToken()) {
      if (localStorage.getItem("ledger-signed-in") && !(fromUrl && fromUrl.error)) { screen(`<h1>Connecting to Google Drive…</h1>`); return redirectToGoogle(); }
      await new Promise(() => {
        screen(`<h1>Household ledger</h1><p>Your ledger is saved encrypted in your Google Drive, in a folder called “${esc(NAMES.root)}”. You add statements by uploading them to that folder.</p>
          <button class="g-btn pri" id="gSign">Sign in with Google</button><p class="g-err" id="gErr" role="alert">${fromUrl && fromUrl.error ? esc(fromUrl.error) : ""}</p>`);
        document.getElementById("gSign").onclick = () => redirectToGoogle();
      });
    }
    screen(`<h1>Opening your ledger…</h1><p>Connecting to Google Drive.</p>`);
    ids.root = await findOrCreateFolder("root");
    [ids.inbox, ids.data] = await Promise.all([findOrCreateFolder("inbox", ids.root), findOrCreateFolder("data", ids.root)]);
    await listData();
  }

  async function unlock() {
    const kt = await readRaw(KEYFILE);
    if (!kt) return createPassphrase();
    const kf = JSON.parse(kt);
    const remembered = await kv("get", "key:" + kf.salt);
    if (remembered) {
      try { if ((await unseal(remembered, kf.check)) === "household-ledger") { key = remembered; return; } } catch (e) {}
      await kv("del", "key:" + kf.salt);
    }
    await new Promise((res) => {
      screen(`<h1>Unlock your ledger</h1><p>Enter your passphrase.</p>
        <form id="gForm"><label class="g-lbl" for="gPass">Passphrase</label><input class="g-inp" id="gPass" type="password" autocomplete="current-password" required>
        <label class="g-chk"><input type="checkbox" id="gRem" checked> Remember on this device</label>
        <button class="g-btn pri" id="gGo" type="submit">Unlock</button></form><p class="g-err" id="gErr" role="alert"></p>`);
      document.getElementById("gPass").focus();
      document.getElementById("gForm").onsubmit = async (e) => {
        e.preventDefault();
        const b = document.getElementById("gGo"); busy(b, true, "Unlocking…"); setErr("");
        try {
          const k = await deriveKey(document.getElementById("gPass").value, unb64(kf.salt));
          if ((await unseal(k, kf.check)) !== "household-ledger") throw new Error();
          key = k;
          if (document.getElementById("gRem").checked) await kv("put", "key:" + kf.salt, k);
          res();
        } catch (x) { busy(b, false, "Unlock"); setErr("That passphrase is not right."); }
      };
    });
  }

  function createPassphrase() {
    return new Promise((res) => {
      screen(`<h1>Choose a passphrase</h1><p>Your ledger is encrypted with it before it reaches Google Drive. Use at least 10 characters and write it down: <b>if you lose it, the data cannot be recovered.</b></p>
        <form id="gForm"><label class="g-lbl" for="gPass">Passphrase</label><input class="g-inp" id="gPass" type="password" autocomplete="new-password" minlength="10" required>
        <label class="g-lbl" for="gPass2">Type it again</label><input class="g-inp" id="gPass2" type="password" autocomplete="new-password" minlength="10" required>
        <label class="g-chk"><input type="checkbox" id="gRem" checked> Remember on this device</label>
        <button class="g-btn pri" id="gGo" type="submit">Create encrypted ledger</button></form><p class="g-err" id="gErr" role="alert"></p>`);
      document.getElementById("gPass").focus();
      document.getElementById("gForm").onsubmit = async (e) => {
        e.preventDefault();
        const p = document.getElementById("gPass").value, p2 = document.getElementById("gPass2").value;
        if (p.length < 10) return setErr("Use at least 10 characters.");
        if (p !== p2) return setErr("The two passphrases are different.");
        const b = document.getElementById("gGo"); busy(b, true, "Setting up…"); setErr("");
        try {
          const salt = crypto.getRandomValues(new Uint8Array(16));
          key = await deriveKey(p, salt);
          await uploadRaw(KEYFILE, JSON.stringify({ v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: b64(salt), check: await seal(key, "household-ledger") }));
          if (document.getElementById("gRem").checked) await kv("put", "key:" + b64(salt), key);
          res();
        } catch (x) { busy(b, false, "Create encrypted ledger"); setErr(x.message || "Could not save to Google Drive."); }
      };
    });
  }

  function firstRun() {
    if (Object.keys(files).some((n) => n !== KEYFILE)) return Promise.resolve();
    return new Promise((res) => {
      screen(`<h1>Bring in your data</h1><p>Import the backup file from your old ledger, or start empty.</p>
        <label class="g-btn pri" for="gFile">Import backup file…</label><input id="gFile" type="file" accept=".json,application/json" hidden>
        <button class="g-btn" id="gEmpty">Start empty</button><p class="g-note" id="gProg"></p><p class="g-err" id="gErr" role="alert"></p>`);
      document.getElementById("gEmpty").onclick = () => res();
      document.getElementById("gFile").onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return; setErr("");
        try {
          const b = JSON.parse(await f.text());
          if (b.format !== "household-ledger-backup") throw new Error("This is not a household ledger backup file.");
          const jobs = [["household/ledger", b.meta || {}]];
          for (const [m, d] of Object.entries(b.tx || {})) jobs.push(["household/ledger/tx/" + m, d]);
          for (const [m, d] of Object.entries(b.bank || {})) jobs.push(["household/ledger/bank/" + m, d]);
          let done = 0;
          await pool(jobs, 4, async ([p, d]) => { await uploadRaw(fname(p), await seal(key, d)); done++; document.getElementById("gProg").textContent = `Encrypting and saving ${done} of ${jobs.length}…`; });
          res();
        } catch (x) { setErr(x.message || "Import failed."); }
      };
    });
  }

  /* ---------- household (sharing the folder by email) ---------- */
  const household = {
    me: async () => (await (await api("https://www.googleapis.com/drive/v3/about?fields=user(emailAddress,displayName)")).json()).user || {},
    list: async () => {
      const r = await (await api(`${API}/${ids.root}/permissions?fields=permissions(id,emailAddress,displayName,role,type)`)).json();
      return (r.permissions || []).filter((p) => p.type === "user").map((p) => ({ id: p.id, email: p.emailAddress || "", name: p.displayName || "", role: p.role }));
    },
    add: async (email) => {
      email = String(email || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw err("invalid", "That email address does not look right.");
      const msg = "I added you to our Household ledger. Open the app, sign in with this Google account, and I will tell you the passphrase in person.";
      await api(`${API}/${ids.root}/permissions?sendNotificationEmail=true&emailMessage=${q(msg)}&fields=id`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "writer", type: "user", emailAddress: email }) });
    },
    remove: async (id) => { await api(`${API}/${ids.root}/permissions/${id}`, { method: "DELETE" }); },
    isOwner: async () => (await (await api(`${API}/${ids.root}?fields=ownedByMe`)).json()).ownedByMe,
  };

  /* ---------- public ---------- */
  window.LedgerGate = {
    inbox,
    household,
    ready: async () => {
      try {
        await signIn(); await unlock();
        const n = await flushPending(); if (n) await listData();
        await firstRun(); hide();
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && token && Date.now() > tokenExp - 60000) reconnect(); });
      } catch (e) {
        if (e.code === "not_configured" || e.code === "insecure") throw e;
        screen(`<h1>Could not open the ledger</h1><p>${esc(e.message || e.code)}</p><button class="g-btn pri" id="gRetry">Try again</button>`);
        document.getElementById("gRetry").onclick = () => location.reload();
        throw e;
      }
    },
    lock: async () => {
      const kt = await readRaw(KEYFILE).catch(() => null);
      if (kt) await kv("del", "key:" + JSON.parse(kt).salt);
      localStorage.removeItem("ledger-token"); localStorage.removeItem("ledger-signed-in");
      if (token) fetch("https://oauth2.googleapis.com/revoke?token=" + q(token), { method: "POST" }).catch(() => {});
      location.reload();
    },
    backup: async () => {
      const b = { format: "household-ledger-backup", version: 1, exported: new Date().toISOString().slice(0, 10), meta: (await readDoc(fname("household/ledger"))) || {}, tx: {}, bank: {} };
      for (const c of ["tx", "bank"]) { const r = await collection("household/ledger/" + c).get(); r.docs.forEach((d) => { b[c][d.id] = d.data(); }); }
      await downloads.save({ filename: `household-ledger-backup-${b.exported}.json`, data: new Blob([JSON.stringify(b)], { type: "application/json" }) });
    },
  };
})();
