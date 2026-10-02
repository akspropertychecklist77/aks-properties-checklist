# AKS Property Checklist

Modern, ultra-lightweight website for **AKS Property Checklist (AKSPCL)**, built with **Astro 5 + Tailwind CSS**.

- **Live Staging (Cloudflare)**: [https://ak-properties-checklist.vellingirid.workers.dev](https://ak-properties-checklist.vellingirid.workers.dev)
- **Production Domain**: [https://akspropertychecklist.in](https://akspropertychecklist.in)
- **Deployment Guide for BigRock**: See [`BIGROCK_DEPLOYMENT_README.md`](./BIGROCK_DEPLOYMENT_README.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed

### Development Server
```powershell
cd C:\ak-properties-checklist
npm install
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser.

### Production Build
```powershell
npm run build
```
Static output is compiled to the `dist/` directory.

### Preview Production Build
```powershell
npm run preview
```

---

## 📦 Deployment Guides

- **BigRock cPanel (Hosting Plan: Single Domain Linux Hosting)**:  
  Follow the complete instructions in **[`BIGROCK_DEPLOYMENT_README.md`](./BIGROCK_DEPLOYMENT_README.md)**.  
  Ready-to-upload ZIP package: `C:\ak-properties-checklist\akspropertychecklist-deploy.zip`.

- **Cloudflare Pages / Workers**:  
  Connected directly to GitHub repository `javaarchitect2022/ak-properties-checklist` on branch `main`. Auto-deploys upon every `git push`.

---

## 📂 Project Structure

```
C:\ak-properties-checklist\
├── public/
│   ├── .htaccess        # Apache/cPanel HTTPS, caching, compression rules
│   ├── images/          # 3D isometric service icons, hero graphics, logos
│   └── videos/          # Pan-Tamil Nadu buffer zone & operations MP4 videos
├── src/
│   ├── components/      # Header, Hero, StatsCounter, ServicesGrid, Testimonials, Footer, etc.
│   ├── layouts/         # BaseLayout.astro
│   ├── pages/           # index.astro, 6 service pages, faq.astro, blog/, coimbatore-investment.astro
│   └── styles/          # global.css (Tailwind directives)
├── dist/                # Production static build output
├── akspropertychecklist-deploy.zip # Pre-packaged archive for cPanel File Manager upload
└── BIGROCK_DEPLOYMENT_README.md   # Detailed step-by-step cPanel guide
```

