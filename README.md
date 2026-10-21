# AIVAARA — React + GSAP Landing Page

A responsive, single-page Aivaara experience built with React, Vite, GSAP, and Canvas. It includes a full-screen neural-network loader, a coordinated GSAP entrance sequence, scroll reveals, and a pointer-responsive computational network.

## Requirements
- Node.js 20.19+ or 22.12+

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## SEO included
- Descriptive title and meta description
- Canonical URL, robots directives, Open Graph and Twitter metadata
- Organization JSON-LD structured data
- `public/robots.txt` and `public/sitemap.xml`
- Semantic landmarks, single primary H1, accessible navigation, and skip link

For production, verify the canonical domain and sitemap URL, add a real social share image, submit the sitemap to Google Search Console, and consider prerendering/SSR if search visibility for page content is a priority. This Vite build is client-rendered React; metadata is present in the original HTML, but server rendering/prerendering is not enabled.
