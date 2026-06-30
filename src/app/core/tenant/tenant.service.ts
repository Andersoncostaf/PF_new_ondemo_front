import { Injectable } from '@angular/core';

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

  isCadastroHost(): boolean {
    return this.getSlug() === 'cadastro';
  }

  getCadastroPortalUrl(): string {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//portalfornecedor.cadastro.local${port}/auth/cadastro`;
  }

  getTenantPortalUrl(slug: string): string {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//portalfornecedor.${slug}.local${port}`;
  }
}
