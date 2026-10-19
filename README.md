# Household ledger

Your household finance app (bank account, credit cards, trends, budgets, alerts) as your own code,
installed as an app on your **iPhone** and your **Mac**. No AI and no server of your own.

## How it works

```
You, on phone or Mac                  Your Google Drive                        The app (iPhone + Mac)
Drive app / Finder / drive.google ──▶ Household ledger/
                                      ├─ Statements to import/  ◀── finds new Excel/CSV files, imports them
                                      └─ Encrypted data/        ◀── saves the ledger, encrypted
```

1. You upload a statement to **Household ledger → Statements to import** the normal way: the Google Drive app on your phone, Finder on your Mac, or drive.google.com.
2. You open the ledger app. It shows **Upload (2)** when new files are waiting. Tap it, check the totals, press Save.
3. The ledger is saved in **Encrypted data**, so the phone and the Mac always show the same thing.

| What | How |
|---|---|
| Your data | Encrypted on the device (AES-GCM 256) before it reaches Drive. Google only stores unreadable data. |
| The key | Made from **your passphrase**. It is never stored in Drive or sent anywhere. |
| Drive access | The app reads the files in your Drive only to find statements in its folder, and only from your own phone or Mac. There is no server in between. |
| The code | Every library and font is inside this folder. The page may only talk to Google Drive (Content Security Policy). |

**If you lose the passphrase, the data cannot be recovered.** Write it down somewhere safe.

## Setup (about 25 minutes, once)

You need: your Gmail account and a free GitHub account. Nothing is paid.

### 1. Let the app use your Drive (Google Cloud, free)

This is the only way Google allows an app to read and save files in your Drive. It works with a normal Gmail account.

1. Go to <https://console.cloud.google.com>, sign in, and create a project called **Household ledger**.
2. **APIs & Services → Library** → search **Google Drive API** → **Enable**.
3. **Google Auth Platform** (or **OAuth consent screen**): app name *Household ledger*, your email as support email, audience **External**. Leave it in **Testing**.
4. **Audience → Test users**: add your Gmail (and Shiraz's if she will sign in with her own account).
5. **Data access → Add scopes**: tick `.../auth/drive` (needed so everyone in the household can save into the shared folder).
6. **Clients → Create client → Web application**:
   - **Authorized JavaScript origins:** `https://YOUR-GITHUB-NAME.github.io`
   - **Authorized redirect URIs:** `https://YOUR-GITHUB-NAME.github.io/household-ledger/` (exactly, with the slash at the end)
7. Copy the **Client ID** into `config.js` in this folder.

The client ID is not a secret. It only tells Google which app is asking.

### 2. Put the app online (GitHub Pages, free)

Your phone needs an https address to install the app. Only the code goes there, never your data.

1. On github.com create a new repository named **household-ledger** (public is fine: it contains no data and no passwords).
2. **Add file → Upload files** → drag in everything inside this folder (index.html, config.js, css, js, vendor, icons, …) → **Commit**.
3. **Settings → Pages** → Source **Deploy from a branch**, branch **main**, folder **/ (root)** → **Save**.
4. After a minute your app is at `https://YOUR-GITHUB-NAME.github.io/household-ledger/`.

### 3. Install it

- **iPhone:** open the address in **Safari** → Share button → **Add to Home Screen**.
- **Mac:** open the address in **Chrome** → the install icon at the right of the address bar (or menu → *Cast, save and share → Install page as app*). In Safari: **File → Add to Dock**.

### 4. First run (on either device)

1. **Sign in with Google.** Google shows *“Google hasn't verified this app”*: tap **Continue** (it is your own app). Tick the Google Drive box.
2. **Choose a passphrase** (at least 10 characters, twice). Keep *Remember on this device* ticked on your own phone and Mac.
3. **Import backup file…** → choose `household-ledger-backup.json`. On iPhone, put the file in Files first (AirDrop it or save it from the chat). Everything comes over: 1,781 card and 45 bank transactions, comments, categories, budgets, planned payments.
4. **Delete `household-ledger-backup.json`** everywhere afterwards. It is not encrypted.

On the second device: sign in with the same Google account, type the same passphrase. Done.

## Monthly use

1. Download each statement as **Excel, CSV or PDF** (PDF works for Cal / Diners / FLY CARD statements) from Cal, Max, Isracard and Leumi.
2. Upload them to **Household ledger → Statements to import** in Google Drive (phone or Mac).
3. Open the app → **Upload (n)** → **Import selected** → check the totals → **Save to ledger**.

Files stay in the Drive folder; the app remembers which ones it imported. PDFs are read on the device with PDF.js (no AI): Cal statements are supported, and the app checks that the transactions add up to the statement total. Other PDF layouts are refused rather than guessed: use the Excel export for those. Screenshots cannot be read. **Choose files…** in the same sheet still lets you pick a file directly from the device.

## Good to know

- **Google sign in lasts about an hour.** When it runs out the app shows **Reconnect**; changes made just before are kept on the device and finish saving after you reconnect.
- **Settings → Download unencrypted backup** saves a plain copy of everything. **Lock and sign out on this device** forgets the remembered passphrase and the Google session there.
- **Shared household:** Settings → Household → Add person shares the ledger folder with that Gmail address. Add them as a test user in Google Cloud (Audience → Test users), then tell them the passphrase in person. They sign in with their own Google account and see the same ledger. Remove takes the access away.
- **Updating the app later:** upload the changed files to the same GitHub repository. The installed apps pick up the new version the next time they open online.

## What is in the folder

```
index.html            the app
config.js             your Google client ID (step 1)
js/app.js             the ledger: views, statement reading, card matching, alerts
js/drive-db.js        Google sign in, encryption, Drive storage, statements inbox, household sharing
js/pdf-reader.js      offline PDF statement reader (Cal)
css/                  styles
vendor/               Chart.js, SheetJS, PDF.js, IBM Plex fonts (local copies)
sw.js, manifest       makes it installable on phone and Mac
```
