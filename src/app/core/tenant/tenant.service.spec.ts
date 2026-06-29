import { TestBed } from '@angular/core/testing';

import { TenantService } from './tenant.service';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantService);
  });

  it('extracts slug from tenant hostname', () => {
    expect(service.getSlugFromHostname('portalfornecedor.clientex.local')).toBe('clientex');
    expect(service.getSlugFromHostname('portalfornecedor.empresaalpha.com.br')).toBe('empresaalpha');
  });

  it('returns null for unknown hostnames', () => {
    expect(service.getSlugFromHostname('api.portalfornecedor.local')).toBeNull();
    expect(service.getSlugFromHostname('localhost')).toBeNull();
  });
});
