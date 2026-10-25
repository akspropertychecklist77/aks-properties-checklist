# AKS Property Checklist

Modern, ultra-lightweight website for **AKS Property Checklist (AKSPCL)**, built with **Astro 5 + Tailwind CSS**.

- **Live Production (Cloudflare)**: [https://akspropertychecklist.in](https://akspropertychecklist.in)
- **Alternate Domain**: [https://akspropertychecklist.com](https://akspropertychecklist.com)

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

## 📦 Deployment

- **Cloudflare Pages / Workers**:  
  Connected directly to GitHub repository `akspropertychecklist77/aks-properties-checklist` on branch `main`. Auto-deploys upon every `git push`.

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

