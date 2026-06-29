import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';

import { contratacaoGuard } from './contratacao.guard';
import { AuthService } from '../core/auth/auth.service';
import { ModulosService } from '../core/identidade/modulos.service';

describe('contratacaoGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let modulosService: jasmine.SpyObj<ModulosService>;
  let router: Router;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'ensureModulosLoaded',
    ]);
    modulosService = jasmine.createSpyObj<ModulosService>('ModulosService', ['hasModulo']);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ModulosService, useValue: modulosService },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('redirects to login when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => contratacaoGuard({} as never, {} as never));

    expect(result).toEqual(router.createUrlTree(['/auth/login']));
  });

  it('allows access when contratacao module is present', (done) => {
    authService.isAuthenticated.and.returnValue(true);
    authService.ensureModulosLoaded.and.returnValue(of([]));
    modulosService.hasModulo.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => contratacaoGuard({} as never, {} as never));

    expect(result).not.toEqual(router.createUrlTree(['/auth/login']));

    (result as import('rxjs').Observable<boolean | UrlTree>).subscribe((allowed) => {
      expect(allowed).toBeTrue();
      done();
    });
  });

  it('redirects to home when contratacao module is absent', (done) => {
    authService.isAuthenticated.and.returnValue(true);
    authService.ensureModulosLoaded.and.returnValue(of([]));
    modulosService.hasModulo.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => contratacaoGuard({} as never, {} as never));

    (result as import('rxjs').Observable<boolean | UrlTree>).subscribe((allowed) => {
      expect(allowed).toEqual(router.createUrlTree(['/home']));
      done();
    });
  });
});
