import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ModulosService } from './modulos.service';
import { environment } from '../../../environments/environment';

describe('ModulosService', () => {
  let service: ModulosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ModulosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads modules from API and caches them', () => {
    const mockResponse = {
      modulos: [
        {
          codigo: 'contratacao',
          label: 'Contratação de Serviços',
          rota: '/contratacao',
        },
      ],
    };

    service.load().subscribe((modulos) => {
      expect(modulos).toEqual(mockResponse.modulos);
      expect(service.hasModulo('contratacao')).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/v1/me/modulos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('clears cached modules', () => {
    service.clear();
    expect(service.hasModulo('contratacao')).toBeFalse();
    expect(service.getModulosSnapshot()).toEqual([]);
  });
});
