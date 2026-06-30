import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../identidade/identidade.models';

@Injectable({ providedIn: 'root' })
export class TenantService {
  getSlugFromHostname(hostname: string = window.location.hostname): string | null {
    const host = hostname.toLowerCase().split(':')[0];
    const match = host.match(/^portalfornecedor\.([a-z0-9-]+)\.(local|com\.br)$/);

    return match ? match[1] : null;
  }

  getSlug(): string | null {
    return this.getSlugFromHostname();
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
