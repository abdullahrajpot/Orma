# Orma deployment guide

This project has three parts that need to be deployed for a real user install flow:

1. Backend API
2. Web app/dashboard
3. Chrome/Edge extension

## 1) Deploy the backend
Use any Node host that supports Express apps, for example Render, Railway, Fly.io, or a VPS.

### Recommended setup
- Host: Render or Railway
- Start command: `npm start`
- Port: `process.env.PORT`

### Required environment variables
Create these in your hosting panel:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
GROQ_API_KEY=your_groq_key
```

### Health check
After deploy, verify the API is live:

```bash
https://your-backend-url/api/health
```

Expected response contains:
- `status: "ok"`
- `mongoConnected: true`

---

## 2) Deploy the web app/dashboard
The dashboard is a Vite app and can be deployed on Vercel or Netlify.

### Build locally
```bash
cd orma-dashboard
npm install
npm run build
```

### Deploy
- Vercel: import the `orma-dashboard` folder
- Netlify: deploy the `orma-dashboard` folder

### Configure frontend API base
If the dashboard calls the backend directly, make sure the frontend uses your deployed API URL in the API helper file.

---

## 3) Publish the extension
Chrome and Edge require a real installable package for end users.

### Option A — Chrome Web Store (best for public users)
1. Create a Google Developer account
2. Pay the one-time $5 registration fee
3. Package the extension into a `.zip` file
4. Upload it to the Chrome Web Store dashboard
5. Fill in the listing, screenshots, privacy policy, and support URL
6. Submit for review

### Option B — Packed extension for private/company use
1. Package the extension as a `.zip`
2. Share the zip with users
3. Users open `chrome://extensions` and load the unpacked folder

### Packaging the extension
From the project root, run:

```powershell
pwsh -File .\orma-extension\pack-extension.ps1
```

This creates a file named `orma-extension-package.zip` in the project root.

---

## 4) Connect the extension to the deployed backend
The extension already supports a configurable API base URL through the popup/settings UI.

For production, make sure the extension points to your deployed backend URL such as:

```text
https://your-backend-url/api
```

If you keep the UI-based setting, users can enter this value in the popup after install.

If you want the extension to default to your production URL, update the default constant in:
- `orma-extension/popup/popup.js`
- `orma-extension/background/service-worker.js`
- `orma-extension/sidepanel/sidepanel.js`

---

## 5) Make installation easy for users
Add a landing/install page on your web app that links to:
- the Chrome Web Store listing, or
- a download page for the packed extension

Recommended install flow:
1. User lands on the web app
2. Clicks “Add to Chrome”
3. Goes to the Chrome Web Store or download page
4. Installs the extension
5. Opens the popup, signs in, and the extension starts recording

---

## 6) Final checklist
- [ ] Backend deployed and `/api/health` works
- [ ] MongoDB connected
- [ ] Dashboard deployed
- [ ] Extension packaged as a `.zip`
- [ ] Extension submitted to Chrome Web Store or shared privately
- [ ] Install link added to the web app
- [ ] Extension API base points to deployed backend
