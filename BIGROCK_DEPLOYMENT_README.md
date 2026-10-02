# BigRock Deployment Guide

This repository is **fully configured for automatic deployment** to **BigRock Hosting** (`akspropertychecklist.in`).

---

## ⚡ How It Works (Automatic Git Push Deployment)

You do **not** need to manually zip or upload files to cPanel. 

Whenever you make changes to your website, simply commit and push your code:

```bash
git add .
git commit -m "Update site content"
git push origin main
```

### What Happens Automatically:
1. **GitHub Actions** triggers instantly upon push (via [`.github/workflows/deploy-bigrock.yml`](.github/workflows/deploy-bigrock.yml)).
2. It installs dependencies and builds the production site (`npm run build`).
3. It automatically connects to BigRock FTP (`ftp.akspropertychecklist.in`) and syncs the built files directly into `/public_html`.
4. Your website is updated live in **under 60 seconds**!

### How to Monitor the Deployment:
You can watch the deployment progress live under the **Actions** tab on GitHub:  
👉 [https://github.com/javaarchitect2022/ak-properties-checklist/actions](https://github.com/javaarchitect2022/ak-properties-checklist/actions)

---

## 💻 Alternative: 1-Click Terminal Deployment

If you want to deploy directly from your local machine without pushing to Git:

```bash
npm run deploy
```

This single command will:
1. Rebuild the Astro production site locally.
2. Upload all updated files directly to BigRock `/public_html` via FTP.
3. Verify the deployment on the server.

---

## ⚙️ Configuration Details

* **Hosting Server**: BigRock Linux Hosting (`162.241.123.128`)
* **Domain**: [https://akspropertychecklist.in](https://akspropertychecklist.in)
* **Remote Path**: `/public_html/`
* **Workflow Config**: [`.github/workflows/deploy-bigrock.yml`](.github/workflows/deploy-bigrock.yml)
* **Local Deploy Script**: [`scripts/deploy-to-bigrock.mjs`](scripts/deploy-to-bigrock.mjs)

---

## 📦 Fallback: Manual cPanel Upload (If Ever Needed)

If GitHub Actions or FTP is ever unavailable:
1. Run `npm run build` locally.
2. Zip the contents of `dist/` into a file named `deploy.zip`.
3. Log into **BigRock cPanel** → **File Manager** → navigate to `public_html`.
4. Upload `deploy.zip` and extract it directly into `public_html`.
