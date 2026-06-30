import { TestBed } from '@angular/core/testing';

import { AuthResponse } from '../identidade/identidade.models';
import { TenantService } from './tenant.service';

describe('TenantService', () => {
  let service: TenantService;

  const authResponse = {
    token: 'jwt-test',
    token_type: 'Bearer',
    expires_in: 3600,
    usuario: {
      id: '1',
      nome: 'Test',
      email: 't@t.com',
      perfil: 'admin_tenant',
    },
    tenant: {
      id: '1',
      slug: 'andersoncosta',
      razao_social: 'Teste',
      status: 'ativo',
      subscription_status: 'trial',
    },
    portal_url: 'http://portalfornecedor.andersoncosta.local:4200',
  } satisfies AuthResponse;

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

  it('redirects handoff to cadastro.local in dev (sem hosts por tenant)', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'http:',
        hostname: 'portalfornecedor.cadastro.local',
        port: '4200',
        pathname: '/auth/cadastro',
      },
    });

    expect(service.buildPostCadastroRedirectUrl(authResponse)).toBe(
      'http://portalfornecedor.cadastro.local:4200/auth/handoff?token=jwt-test',
    );
  });
});
