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
}
