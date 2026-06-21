# KarOrganics Uganda

Marketing & storefront website for KarOrganics Uganda, a herbal-wellness brand.
Built as a single-page React app; orders and inquiries are funneled to WhatsApp.

## Tech stack

- [Vite](https://vite.dev) — dev server & build
- React 19 + TypeScript
- [react-router-dom](https://reactrouter.com) — client-side routing
- [lucide-react](https://lucide.dev) — icons
- Plain CSS (one stylesheet per component)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## Project structure

```text
src/
  main.tsx                 App entry — mounts BrowserRouter
  pages/
    App.tsx                Shell: Header + routes + Footer + BackToTop
    Home.tsx               Long-scroll landing page (composes the sections below)
    About.tsx
    Products.tsx
    Contact.tsx            Inquiry form that opens WhatsApp with a prefilled message
    Socials.tsx
  components/ui/           Header, Footer, NewsLetter, BackToTop
  hooks/useScrollReveal.ts IntersectionObserver-based scroll animations
  assets/                  Product & hero images
public/                    Static assets served at the site root (logo1, icons)
```

## Routes

| Path        | Page     |
| ----------- | -------- |
| `/`         | Home     |
| `/about`    | About    |
| `/products` | Products |
| `/social`   | Socials  |
| `/contact`  | Contact  |

## Contact

WhatsApp: [+256 760 108564](https://wa.me/256 701 924517)

## Deployment notes

This is a client-side-routed SPA. When deploying to a static host, configure a
fallback so all routes serve `index.html` (otherwise deep links like
`/products` will 404).
