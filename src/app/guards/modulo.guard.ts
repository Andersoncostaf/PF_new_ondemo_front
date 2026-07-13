import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of, switchMap } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';
import { ModulosService } from '../core/identidade/modulos.service';

export function moduloGuard(codigo: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const modulosService = inject(ModulosService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    return authService.ensureModulosLoaded().pipe(
      switchMap(() => of(modulosService.hasModulo(codigo))),
      map((allowed) => (allowed ? true : router.createUrlTree(['/home']))),
    );
  };
}
