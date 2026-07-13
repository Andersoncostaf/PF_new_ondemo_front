import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TenantService } from '../tenant/tenant.service';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tenantService = inject(TenantService);
  const token = authService.getToken();
  const tenantSlug = tenantService.getSlugForApi();

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  if (!isApiRequest) {
    return next(req).pipe(
      catchError((error: unknown) => throwError(() => error)),
    );
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (tenantSlug) {
    headers['X-Tenant-Slug'] = tenantSlug;
  }

  const authReq =
    Object.keys(headers).length > 0
      ? req.clone({ setHeaders: headers })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !req.url.endsWith('/v1/auth/login')
      ) {
        authService.handleUnauthorized();
      }

      return throwError(() => error);
    }),
  );
};
