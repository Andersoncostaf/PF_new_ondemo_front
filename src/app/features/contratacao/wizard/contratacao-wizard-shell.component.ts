import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { StepsModule } from 'primeng/steps';
import { filter, Subscription } from 'rxjs';

import { activeIndexFromSlug } from './contratacao-wizard.steps';
import { ContratacaoWizardActionsComponent } from './contratacao-wizard-actions.component';
import { ContratacaoWizardStore } from './contratacao-wizard.store';

@Component({
  selector: 'app-contratacao-wizard-shell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    CardModule,
    MessageModule,
    StepsModule,
    ContratacaoWizardActionsComponent,
  ],
  templateUrl: './contratacao-wizard-shell.component.html',
  styleUrl: './contratacao-wizard.shared.scss',
})
export class ContratacaoWizardShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(ContratacaoWizardStore);

  private routeSub?: Subscription;

  ngOnInit(): void {
    this.store.initShell();
    this.syncSlugFromRoute();
    this.routeSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncSlugFromRoute());
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  get activeIndex(): number {
    return activeIndexFromSlug(this.store.currentSlug);
  }

  private syncSlugFromRoute(): void {
    let child = this.route.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }
    const slug = child?.snapshot.url[0]?.path;
    if (slug) {
      this.store.setCurrentSlug(slug);
    }
  }
}
