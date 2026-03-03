# 🚗 Bro Cars — Backend Deployment Guide

Complete step-by-step guide to get your contact form sending real emails.

---

## 📁 File Structure

```
brocars-backend/          ← backend (deploy to Railway/Render)
  server.js               ← Express + Nodemailer API
  package.json
  .env.example            ← copy to .env with your real values
  .gitignore
  DEPLOY.md               ← this file

brocars-v2/               ← frontend (your website files)
  index.html
  about.html
  cars.html
  services.html
  contact.html
  style.css
  script.js               ← already updated to call your API
  logo.png                ← add your logo here
```

---

## STEP 1 — Get a Gmail App Password

> Skip if using another email provider (see bottom of this guide)

1. Go to **myaccount.google.com**
2. Click **Security** → enable **2-Step Verification** if not already on
3. Back on Security page → search **"App Passwords"**
4. Select app: **Mail** → Select device: **Other** → type `Bro Cars`
5. Click **Generate** → copy the **16-character password** (e.g. `abcd efgh ijkl mnop`)

> ⚠️ Use this App Password in `.env`, NOT your real Gmail password.

---

## STEP 2 — Deploy Backend to Railway (Free)

Railway gives you a free server with a public URL in under 5 minutes.

### 2a. Push code to GitHub

```bash
# In your brocars-backend folder:
git init
git add .
git commit -m "Initial backend"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/brocars-backend.git
git push -u origin main
```

### 2b. Deploy on Railway

1. Go to **railway.app** → Sign up with GitHub (free)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `brocars-backend` repo
4. Railway auto-detects Node.js and deploys ✅

### 2c. Add Environment Variables on Railway

In Railway dashboard → your project → **Variables** tab → add each:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `EMAIL_PROVIDER` | `gmail` |
| `EMAIL_USER` | `your@gmail.com` |
| `EMAIL_PASS` | `abcd efgh ijkl mnop` |
| `EMAIL_TO` | `info@brocars.lk` |
| `ALLOWED_ORIGINS` | `https://brocars.lk,https://www.brocars.lk` |

### 2d. Get your API URL

In Railway → your project → **Settings** → **Domains** → Generate a domain.
It will look like: `https://brocars-backend-production.up.railway.app`

---

## STEP 3 — Update script.js with Your API URL

Open `brocars-v2/script.js` and find line:

```js
const API_URL = 'https://brocars-api.railway.app/send';
```

Replace with your actual Railway URL:

```js
const API_URL = 'https://YOUR-PROJECT-NAME.up.railway.app/send';
```

---

## STEP 4 — Test It

1. Visit your contact page
2. Fill in the form and submit
3. Check your email — you should receive:
   - ✅ A formatted enquiry email to `info@brocars.lk`
   - ✅ An auto-reply confirmation to the customer's email

### Test via curl (optional)

```bash
curl -X POST https://YOUR-URL.up.railway.app/send \
  -H "Content-Type: application/json" \
  -d '{
    "fname": "Test User",
    "femail": "test@example.com",
    "fphone": "+94 77 123 4567",
    "fsubject": "Test enquiry",
    "fmsg": "This is a test message from the Bro Cars contact form."
  }'
```

Expected response: `{"success":true,"message":"Your message has been sent successfully!"}`

---

## Alternative Deployment Options

### Render (also free)

1. render.com → New → Web Service → Connect GitHub repo
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add environment variables under **Environment** tab
5. Deploy → get your URL (e.g. `https://brocars-backend.onrender.com`)

> ⚠️ Render free tier spins down after 15min inactivity (first request is slow). Upgrade to Starter ($7/mo) for always-on.

### VPS / cPanel Hosting

If your website host supports Node.js (SiteGround, Namecheap, Hostinger):

```bash
# SSH into your server
ssh user@yourserver.com

# Upload brocars-backend/ folder, then:
cd brocars-backend
npm install --production
cp .env.example .env
nano .env         # fill in your values

# Run with PM2 (keeps it alive)
npm install -g pm2
pm2 start server.js --name brocars-api
pm2 save
pm2 startup
```

---

## Email Provider Options

### Outlook / Hotmail
```
EMAIL_PROVIDER=outlook
EMAIL_USER=your@outlook.com
EMAIL_PASS=your-password
```

### Custom SMTP (cPanel / Zoho / SendGrid)
```
EMAIL_PROVIDER=smtp
EMAIL_USER=info@brocars.lk
EMAIL_PASS=your-email-password
SMTP_HOST=mail.brocars.lk
SMTP_PORT=587
SMTP_SECURE=false
```

---

## Security Notes

- ✅ Rate limited to **5 submissions per IP per 15 minutes** (prevents spam)
- ✅ All inputs are **sanitized** before processing
- ✅ Server-side validation runs independently of frontend
- ✅ Helmet.js sets secure HTTP headers
- ✅ CORS locked to your domain only
- ✅ `.env` is in `.gitignore` — credentials never go to GitHub

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `CORS blocked` | Add your frontend URL to `ALLOWED_ORIGINS` in Railway variables |
| `Invalid login` (Gmail) | Make sure you're using the **App Password**, not your real password |
| `ECONNREFUSED` | Your server isn't running — check Railway logs |
| Form submits but no email | Check `EMAIL_TO` is correct; check spam folder |
| `535 Authentication failed` | Gmail: enable 2FA first, then regenerate App Password |

---

**Support:** info@brocars.lk | +94 11 234 5678
