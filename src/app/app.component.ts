import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { IntroService } from './core/intro.service';
import { SmoothScrollService } from './core/smooth-scroll.service';
import { PROFILE } from './data/portfolio.data';
import { CustomCursorComponent } from './layout/custom-cursor/custom-cursor.component';
import { PreloaderComponent } from './layout/preloader/preloader.component';
import { ScrollProgressComponent } from './layout/scroll-progress/scroll-progress.component';
import { SectionRailComponent } from './layout/section-rail/section-rail.component';
import { SiteFooterComponent } from './layout/site-footer/site-footer.component';
import { SiteNavComponent } from './layout/site-nav/site-nav.component';
import { ToasterComponent } from './layout/toaster/toaster.component';
import { AboutComponent } from './sections/about/about.component';
import { ContactComponent } from './sections/contact/contact.component';
import { ExperienceComponent } from './sections/experience/experience.component';
import { HeroComponent } from './sections/hero/hero.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { SkillsComponent } from './sections/skills/skills.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgIf,
    PreloaderComponent,
    ScrollProgressComponent,
    CustomCursorComponent,
    SectionRailComponent,
    SiteNavComponent,
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    ProjectsComponent,
    SkillsComponent,
    ContactComponent,
    SiteFooterComponent,
    ToasterComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  readonly profile = PROFILE;
  showPreloader: boolean;

  constructor(
    intro: IntroService,
    private readonly smoothScroll: SmoothScrollService,
  ) {
    this.showPreloader = intro.showPreloader;
  }

  ngOnInit(): void {
    // Before any child hooks run, so the preloader can pause scrolling.
    this.smoothScroll.init();
  }
}
