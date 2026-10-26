import { BrandIcon } from './brand-icons';

export interface Link {
  label: string;
  href: string;
}

export interface Profile {
  fullName: string;
  /** Name used in the hero title, e.g. "Abdelrhman Yasser". */
  displayName: string;
  initials: string;
  role: string;
  tagline: string;
  /** Short stack list shown in the hero footer bar. */
  stack: string[];
  location: string;
  languages: string[];
  email: string;
  phones: Link[];
  resume: Link;
  socials: Link[];
}

/** A run of text inside a paragraph; `mark` renders it highlighted. */
export interface TextRun {
  text: string;
  mark?: boolean;
}

export interface About {
  /** Lead paragraph; the run with `mark` is the highlighted phrase. */
  lead: TextRun[];
  current: string;
  builtOn: TextRun[];
  outro: string;
}

export interface Experience {
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  /** Accent used for the index number, company name, tags and bullets. */
  accent: string;
  summary: string;
  tags: string[];
  highlights: string[];
}

export interface TechTag {
  label: string;
  color: string;
}

export interface Project {
  slug: string;
  title: string;
  /** One-line summary for the index rows. */
  summary: string;
  /** Longer description, used when the project is featured. */
  description: string;
  kind: string;
  url: string;
  host: string;
  tags: TechTag[];
  /** 1280x800 screenshot of the live project, when one could be captured. */
  image?: string;
  /** 240x150 thumbnail of the same screenshot. */
  thumb?: string;
}

export interface Skill {
  name: string;
  ring: 'inner' | 'outer';
  /** Brand mark; skills without one render `abbr` as a monogram. */
  icon?: BrandIcon;
  abbr?: string;
  color: string;
}
