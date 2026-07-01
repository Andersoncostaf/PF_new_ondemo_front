import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { StepsModule } from 'primeng/steps';
import { filter, Subscription } from 'rxjs';

import { activeIndexFromSlug, stepBySlug } from './contratacao-wizard.steps';
import { ContratacaoWizardActionsComponent } from './contratacao-wizard-actions.component';
import { ContratacaoWizardStore } from './contratacao-wizard.store';

@Component({
  selector: 'app-contratacao-wizard-shell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
    this.syncFromRoute();
    this.routeSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncFromRoute());
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  get activeIndex(): number {
    return activeIndexFromSlug(this.store.currentSlug);
  }

  private syncFromRoute(): void {
    let route: ActivatedRoute = this.route;
    let routeUuid: string | null = null;

    while (route.firstChild) {
      route = route.firstChild;
      const uuid = route.snapshot.paramMap.get('uuid');
      if (uuid) {
        routeUuid = uuid;
      }
    }

    const slug = route.snapshot.url[0]?.path;
    if (slug && stepBySlug(slug)) {
      this.store.setCurrentSlug(slug);
    }

    if (routeUuid) {
      this.store.isNova = false;
    } else if (!this.store.uuid) {
      this.store.isNova = true;
    }
  }
}
