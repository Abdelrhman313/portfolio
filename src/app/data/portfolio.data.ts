import { About, Experience, Profile, Project, Skill, TechTag } from './portfolio.models';

// All content comes from Abdelrhman's CV; project descriptions also draw on the
// live deployments linked from it.

export const PROFILE: Profile = {
  fullName: 'Abdelrhman Yasser Ibrahim',
  displayName: 'Abdelrhman Yasser',
  initials: 'AY',
  role: 'Front End Developer',
  tagline: 'Building dynamic, user-friendly web applications with Angular, TypeScript & RxJS.',
  stack: ['Angular', 'TypeScript', 'RxJS'],
  location: 'Giza, Egypt',
  languages: ['Arabic', 'English'],
  email: 'abdelrhmanyasser77@gmail.com',
  phones: [
    { label: '+20 112 847 9486', href: 'tel:+201128479486' },
    { label: '+20 106 789 5230', href: 'tel:+201067895230' },
  ],
  resume: { label: 'My Resume', href: 'assets/Abdelrhman-Yasser-Ibrahim-Resume.pdf' },
  socials: [
    { label: 'GitHub', href: 'https://github.com/Abdelrhman313' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abdelrhman-yasser-0650421b2/' },
    { label: 'Behance', href: 'https://www.behance.net/AbdelrhmanYasser' },
  ],
};

export const ABOUT: About = {
  lead: [
    { text: "I'm a " },
    { text: 'frontend developer', mark: true },
    {
      text:
        ' with 4+ years of experience building and optimizing web applications. I specialize in Angular — creating dynamic, user-friendly interfaces that enhance user experience and engagement, on a deep understanding of JavaScript, HTML and CSS.',
    },
  ],
  current:
    'Currently a Frontend Developer at RETM in Riyadh, Saudi Arabia — building Angular and Angular Material interfaces, REST API integrations and RxJS-powered data flows.',
  builtOn: [
    { text: 'Built on ' },
    { text: '4+ years of frontend craft', mark: true },
    { text: ', ' },
    { text: 'a 5-star freelance rating', mark: true },
    { text: ', and a ' },
    { text: 'Bachelor of Software Engineering', mark: true },
    { text: ' — with high-quality, maintainable code as the standard.' },
  ],
  outro: 'Based in Giza, Egypt — working in Arabic and English.',
};

export const EXPERIENCE: Experience[] = [
  {
    role: 'Frontend Developer',
    company: 'RETM',
    companyUrl: 'https://retm.com.sa/',
    location: 'Riyadh, Saudi Arabia',
    period: 'Apr 2023 – Present',
    accent: '#d7733f',
    summary:
      'Building application UI in Angular and Angular Material — from forms and validation to REST API integration and RxJS-driven communication between client and server.',
    tags: ['Active', 'Angular', 'RxJS', 'REST APIs'],
    highlights: [
      'Build UI with HTML5, CSS3, TypeScript, JavaScript, Angular and Angular Material',
      'Make REST API calls through Angular services and HTTP requests',
      'Work across Angular forms and validation, modules, components and directives',
      'Implement RxJS to handle asynchronous request and response communication between client and server for a better user experience',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Flexi International e-School',
    companyUrl: 'https://flexiacademy.com/',
    location: 'Florida, USA',
    period: 'Feb 2023 – Apr 2023',
    accent: '#60a5fa',
    summary: 'Optimized user interaction workflows and refined UI/UX components together with the design team.',
    tags: ['EdTech', 'UI/UX', 'Performance'],
    highlights: [
      'Optimized user interaction workflows, increasing overall system performance',
      'Collaborated with designers to enhance UI/UX components, raising user satisfaction',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Codeikoo Software',
    companyUrl: 'https://codeikoo.com/home',
    location: 'Saudi Arabia',
    period: 'Oct 2022 – Mar 2023',
    accent: '#f0a500',
    summary:
      'Built Angular web components and custom directives for a more modular codebase, and helped raise code quality through reviews and mentoring.',
    tags: ['Angular', 'Components', 'Code Review', 'Mentoring'],
    highlights: [
      'Created web components using Angular',
      'Developed custom directives and components, enhancing modularity and reducing future development time',
      'Spearheaded code reviews and mentoring sessions, increasing code quality and team efficiency',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Semicolon Ltd',
    companyUrl: 'https://semicolon-ltd.com/',
    location: 'Cairo, Egypt',
    period: 'Aug 2022 – Oct 2022',
    accent: '#52b788',
    summary: 'Contributed to Angular web component development, testing and troubleshooting, and project documentation.',
    tags: ['Angular', 'Testing', 'Documentation'],
    highlights: [
      'Assisted in developing Angular web components, contributing to faster module loading times',
      'Conducted thorough testing and troubleshooting of web applications, decreasing reported bugs',
      'Created comprehensive documentation for future project references, improving onboarding efficiency',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Nafezly · Mostaql',
    companyUrl: 'https://nafezly.com/u/Abdelrhman_Yasser',
    location: 'Freelance',
    period: 'Jul 2020 – Present',
    accent: '#a685ff',
    summary: 'Freelance frontend work for clients on Nafezly and Mostaql — designing and building small-scale web applications.',
    tags: ['Active', 'Freelance', 'Responsive', '5-Star Rating'],
    highlights: [
      'Designed and built small-scale web applications for clients, earning a 5-star average rating',
      'Enhanced client websites with responsive design techniques',
    ],
  },
];

const ANGULAR: TechTag = { label: 'Angular', color: '#e1956e' };
const ANGULAR_MATERIAL: TechTag = { label: 'Angular Material', color: '#e1956e' };
const NG_BOOTSTRAP: TechTag = { label: 'ng-bootstrap', color: '#e1956e' };
const FIREBASE: TechTag = { label: 'Firebase', color: '#52b788' };
const TAILWIND: TechTag = { label: 'Tailwind CSS', color: '#52b788' };
const BOOTSTRAP: TechTag = { label: 'Bootstrap', color: '#52b788' };
const JQUERY: TechTag = { label: 'jQuery', color: '#52b788' };
const HTML: TechTag = { label: 'HTML', color: '#60a5fa' };
const CSS: TechTag = { label: 'CSS', color: '#60a5fa' };
const JS: TechTag = { label: 'JavaScript', color: '#60a5fa' };

const shot = (slug: string) => ({
  image: `assets/images/projects/${slug}.webp`,
  thumb: `assets/images/projects/thumbs/${slug}.webp`,
});

export const FEATURED_PROJECT: Project = {
  slug: 'tameer-cloud',
  title: 'Tameer Cloud Dashboard',
  summary: 'Dashboard for the Tameer platform for engineering consultancy.',
  description:
    'Tameer Cloud is the dashboard of the Tameer platform for engineering consultancy — built in Angular with Angular Material and ng-bootstrap components, with sign-in, password recovery and the platform’s electronic services.',
  kind: 'Dashboard',
  url: 'https://tameer-cloud.vercel.app/',
  host: 'vercel.app',
  tags: [ANGULAR, ANGULAR_MATERIAL, NG_BOOTSTRAP],
  ...shot('tameer-cloud'),
};

export const PROJECTS: Project[] = [
  {
    slug: 'labiek-dashboard',
    title: 'Labiek Dashboard',
    summary: 'Arabic dashboard for the Labiek technical-support services platform.',
    description: 'Arabic (RTL) dashboard for the Labiek platform for technical-support services.',
    kind: 'Dashboard',
    url: 'https://labik-dash-vkew.vercel.app/',
    host: 'vercel.app',
    tags: [ANGULAR, ANGULAR_MATERIAL, NG_BOOTSTRAP],
    ...shot('labiek-dashboard'),
  },
  {
    slug: 'bazartk',
    title: 'Bazartk',
    summary: 'Arabic ordering platform with offers, a price calculator and a cart.',
    description: 'Arabic (RTL) ordering platform with offers, a price calculator and a shopping cart.',
    kind: 'Web App',
    url: 'https://bazartk-theta.vercel.app/',
    host: 'vercel.app',
    tags: [ANGULAR, ANGULAR_MATERIAL, NG_BOOTSTRAP],
    ...shot('bazartk'),
  },
  {
    slug: 'first-e-learning',
    title: 'First E-learning',
    summary: 'E-learning website styled with Tailwind CSS.',
    description: 'E-learning website built with HTML, CSS, JavaScript and Tailwind CSS.',
    kind: 'Website',
    url: 'https://first-e-learning.netlify.app/',
    host: 'netlify.app',
    tags: [HTML, CSS, JS, TAILWIND],
  },
  {
    slug: 'elite',
    title: 'Elite',
    summary: 'Bilingual website for Elite, a real-estate development company.',
    description: 'Arabic/English website for Elite, a real-estate development company.',
    kind: 'Website',
    url: 'https://elite-kohl.vercel.app/',
    host: 'vercel.app',
    tags: [ANGULAR, HTML, CSS],
    ...shot('elite'),
  },
  {
    slug: 'daily-notes',
    title: 'Daily Notes App',
    summary: 'A daily notes app powered by Firebase.',
    description: 'Daily notes app built with Angular and Firebase.',
    kind: 'Web App',
    url: 'https://daily-notes-e716f.web.app/',
    host: 'web.app',
    tags: [ANGULAR, FIREBASE],
    ...shot('daily-notes'),
  },
  {
    slug: 'market-app',
    title: 'Market App',
    summary: 'Grocery market storefront with product listings and a cart.',
    description: 'Grocery market storefront with product listings, accounts and a cart, built with Angular and Firebase.',
    kind: 'Web App',
    url: 'https://market-c6f9f.web.app/',
    host: 'web.app',
    tags: [ANGULAR, FIREBASE],
    ...shot('market-app'),
  },
  {
    slug: 'creative-agency',
    title: 'Creative Agency',
    summary: 'Website for a creative digital agency.',
    description: 'Website for a creative digital agency.',
    kind: 'Website',
    url: 'https://creative-agancy-2.netlify.app/',
    host: 'netlify.app',
    tags: [HTML, CSS, JS, JQUERY, BOOTSTRAP],
    ...shot('creative-agency'),
  },
  {
    slug: 'landing-page',
    title: 'Landing Page',
    summary: 'Landing page for Consulto, a consulting and finance theme.',
    description: 'Landing page for Consulto, a consulting and finance theme.',
    kind: 'Landing Page',
    url: 'https://consulto-themr-simulation.netlify.app/',
    host: 'netlify.app',
    tags: [HTML, CSS, JS, BOOTSTRAP],
    ...shot('landing-page'),
  },
  {
    slug: 'construction',
    title: 'Construction',
    summary: 'Website for a construction company.',
    description: 'Website for a construction company.',
    kind: 'Website',
    url: 'https://consstruction-site.netlify.app/',
    host: 'netlify.app',
    tags: [HTML, CSS, JS, JQUERY, BOOTSTRAP],
    ...shot('construction'),
  },
  {
    slug: 'charity',
    title: 'Charity',
    summary: 'Website for a charity fund and its donation campaigns.',
    description: 'Website for a charity fund and its donation campaigns.',
    kind: 'Website',
    url: 'https://charity-site.netlify.app/',
    host: 'netlify.app',
    tags: [HTML, CSS, JS, JQUERY, BOOTSTRAP],
    ...shot('charity'),
  },
  {
    slug: 'italian-restaurant',
    title: 'Italian Restaurant',
    summary: 'Website for an Italian restaurant.',
    description: 'Website for an Italian restaurant.',
    kind: 'Website',
    url: 'https://italen-food.netlify.app/',
    host: 'netlify.app',
    tags: [HTML, CSS, JS, JQUERY, BOOTSTRAP],
  },
  {
    slug: 'sportively',
    title: 'Sportively',
    summary: 'Website for an international sporting club.',
    description: 'Website for an international sporting club.',
    kind: 'Website',
    url: 'https://sport-club.netlify.app/',
    host: 'netlify.app',
    tags: [HTML, CSS, JS],
    ...shot('sportively'),
  },
];

export const SKILLS: Skill[] = [
  { name: 'Angular', ring: 'inner', icon: 'angular', color: '#dd0031' },
  { name: 'TypeScript', ring: 'inner', icon: 'typescript', color: '#3178c6' },
  { name: 'JavaScript', ring: 'inner', icon: 'javascript', color: '#f7df1e' },
  { name: 'RxJS', ring: 'inner', icon: 'rxjs', color: '#e535ab' },
  { name: 'Angular Material', ring: 'inner', abbr: 'AM', color: '#e1956e' },
  { name: 'HTML5', ring: 'outer', icon: 'html5', color: '#e34f26' },
  { name: 'CSS', ring: 'outer', icon: 'css', color: '#2965f1' },
  { name: 'Sass', ring: 'outer', icon: 'sass', color: '#cc6699' },
  { name: 'Tailwind CSS', ring: 'outer', icon: 'tailwind', color: '#38bdf8' },
  { name: 'Bootstrap', ring: 'outer', icon: 'bootstrap', color: '#8c6ad6' },
  { name: 'jQuery', ring: 'outer', icon: 'jquery', color: '#3b9ae1' },
  { name: 'Firebase', ring: 'outer', icon: 'firebase', color: '#ffca28' },
  { name: 'Git / GitHub', ring: 'outer', icon: 'git', color: '#f05033' },
  { name: 'JSON', ring: 'outer', icon: 'json', color: '#f5f0e8' },
  { name: 'Agile', ring: 'outer', abbr: 'AG', color: '#60a5fa' },
];
