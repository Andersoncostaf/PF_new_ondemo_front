import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { filter, Subscription } from 'rxjs';

import { ANALISE_STEPS, analiseStepRouterLink } from '../contratacao-aprovacao.steps';
import { AnaliseContratacaoStore } from './analise-contratacao.store';
import { ApontamentosPanelComponent } from '../components/apontamentos-panel.component';
import { AprovacaoAcoesBarComponent } from '../components/aprovacao-acoes-bar.component';

@Component({
  selector: 'app-analise-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    ButtonModule,
    CardModule,
    MessageModule,
    ApontamentosPanelComponent,
    AprovacaoAcoesBarComponent,
  ],
  templateUrl: './analise-shell.component.html',
  styleUrl: './analise-shell.component.scss',
})
export class AnaliseShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(AnaliseContratacaoStore);

  readonly steps = ANALISE_STEPS;
  private routeSub?: Subscription;

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      void this.store.init(uuid);
    }
    this.syncFromRoute();
    this.routeSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncFromRoute());
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  stepLink(routeSlug: string): string[] | null {
    if (!this.store.uuid) return null;
    return analiseStepRouterLink(this.store.uuid, routeSlug);
  }

  isActive(routeSlug: string): boolean {
    return this.store.currentRouteSlug === routeSlug;
  }

  onApontamentosChanged(): void {
    void this.store.loadApontamentos();
  }

  onAcaoConcluida(): void {
    void this.store.reloadContratacao();
  }

  private syncFromRoute(): void {
    let route: ActivatedRoute = this.route;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const slug = route.snapshot.url[0]?.path;
    if (slug) {
      this.store.setCurrentRouteSlug(slug);
    }
  }
}
