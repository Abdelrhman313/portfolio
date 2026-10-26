# Abdelrhman Yasser — Portfolio

Personal portfolio built with Angular 16 (standalone components), SCSS, GSAP + ScrollTrigger, Lenis smooth scrolling and a Spline 3D scene.

## Run

```bash
npm install
npm start          # dev server on http://localhost:4200
npm run build      # production build in dist/portfolio
npm test           # unit tests (Karma)
```

## Editing content

All text, links and project data live in `src/app/data/`:

- `portfolio.data.ts` — profile, about copy, experience, projects and skills.
- `site.config.ts` — the hero's Spline scene URL and the optional contact-form endpoint.
- `brand-icons.ts` — skill logos (Simple Icons, CC0).

Images are in `src/assets/images/` (avatar, project screenshots and thumbnails, social preview), and the downloadable résumé is `src/assets/Abdelrhman-Yasser-Ibrahim-Resume.pdf`.

## Contact form

With `contactEndpoint` empty, submitting the form opens the visitor's email app with the message pre-filled. To deliver messages directly, set `contactEndpoint` to a service that accepts a JSON `POST` of `{ name, email, message }` (for example a Formspree form URL).

## Structure

- `src/app/core` — GSAP setup, Lenis, media queries, active-section tracking, intro and toast services.
- `src/app/layout` — preloader, nav, scroll progress, section rail, custom cursor, footer, toaster.
- `src/app/sections` — hero, about, experience, projects, skills, contact.
- `src/app/shared` — section heading, icons, text-reveal and magnetic directives.
