import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../identidade/identidade.models';

const DEV_TENANT_SLUG_KEY = 'pf_dev_tenant_slug';

@Injectable({ providedIn: 'root' })
export class TenantService {
  getSlugFromHostname(hostname: string = window.location.hostname): string | null {
    const host = hostname.toLowerCase().split(':')[0];
    const match = host.match(/^portalfornecedor\.([a-z0-9-]+)\.(local|com\.br)$/);

    return match ? match[1] : null;
  }

  getSlug(): string | null {
    const fromHost = this.getSlugFromHostname();
    if (fromHost) {
      return fromHost;
    }

    // Dev em 127.0.0.1/localhost: permite ?tenant={slug} (ou último slug usado).
    if (!this.isLocalDevHost()) {
      return null;
    }

    const fromQuery = this.getSlugFromQueryParam();
    if (fromQuery) {
      sessionStorage.setItem(DEV_TENANT_SLUG_KEY, fromQuery);
      return fromQuery;
    }

    return sessionStorage.getItem(DEV_TENANT_SLUG_KEY);
  }

  /** Slug efetivo para header X-Tenant-Slug nas chamadas à API. */
  getSlugForApi(): string | null {
    return this.getSlug();
  }

  private getSlugFromQueryParam(): string | null {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('tenant')?.trim().toLowerCase() ?? '';
    return /^[a-z0-9-]+$/.test(raw) ? raw : null;
  }

  /** Dev sem entrada no hosts: localhost/127.0.0.1 na rota de cadastro. */
  isLocalDevHost(hostname: string = window.location.hostname): boolean {
    const host = hostname.toLowerCase().split(':')[0];
    return host === 'localhost' || host === '127.0.0.1';
  }

  isCadastroHost(): boolean {
    if (this.getSlug() === 'cadastro') {
      return true;
    }

    return this.isLocalDevHost() && window.location.pathname.startsWith('/auth/cadastro');
  }

  getCadastroPortalUrl(): string {
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;

    if (this.isLocalDevHost()) {
      return `${protocol}//${window.location.hostname}${port}/auth/cadastro`;
    }

    return `${protocol}//portalfornecedor.cadastro.local${port}/auth/cadastro`;
  }

  getTenantPortalUrl(slug: string): string {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//portalfornecedor.${slug}.local${port}`;
  }

  /**
   * Produção: portal do tenant (subdomínio).
   * Dev local: handoff no mesmo host do cadastro (cadastro.local ou 127.0.0.1),
   * sem exigir entrada no hosts para cada slug novo.
   */
  buildPostCadastroRedirectUrl(response: AuthResponse): string {
    const token = encodeURIComponent(response.token);
    const base = this.resolveHandoffBaseUrl(response).replace(/\/$/, '');
    return `${base}/auth/handoff?token=${token}`;
  }

  private resolveHandoffBaseUrl(response: AuthResponse): string {
    if (environment.production) {
      return response.portal_url ?? this.getTenantPortalUrl(response.tenant.slug);
    }

    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;

    if (this.getSlug() === 'cadastro') {
      return `${protocol}//portalfornecedor.cadastro.local${port}`;
    }

    if (this.isLocalDevHost()) {
      return `${protocol}//${window.location.hostname}${port}`;
    }

    return `${protocol}//127.0.0.1${port}`;
  }
}
