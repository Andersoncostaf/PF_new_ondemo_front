import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError, switchMap, of } from 'rxjs';

import { IdentidadeApiService } from '../identidade/identidade-api.service';
import { ModulosService } from '../identidade/modulos.service';
import { AuthResponse, AuthTenant, AuthUsuario, CadastroPayload } from '../identidade/identidade.models';

const TOKEN_KEY = 'pf_jwt_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(this.readStoredToken());
  private readonly usuarioSubject = new BehaviorSubject<AuthUsuario | null>(null);
  private readonly tenantSubject = new BehaviorSubject<AuthTenant | null>(null);

  readonly token$ = this.tokenSubject.asObservable();

  constructor(
    private readonly identidadeApi: IdentidadeApiService,
    private readonly modulosService: ModulosService,
    private readonly router: Router,
  ) {}

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getUsuario(): AuthUsuario | null {
    return this.usuarioSubject.value;
  }

  getTenant(): AuthTenant | null {
    return this.tenantSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.identidadeApi.login(email, password).pipe(
      tap((response) => this.applyAuthResponse(response)),
      switchMap((response) =>
        this.modulosService.load().pipe(
          catchError(() => of([])),
          switchMap(() => of(response)),
        ),
      ),
    );
  }

  cadastro(payload: CadastroPayload): Observable<AuthResponse> {
    return this.identidadeApi.cadastro(payload).pipe(
      tap((response) => this.applyAuthResponse(response)),
      switchMap((response) =>
        this.modulosService.load().pipe(
          catchError(() => of([])),
          switchMap(() => of(response)),
        ),
      ),
    );
  }

  logout(): Observable<unknown> {
    const request$ = this.isAuthenticated()
      ? this.identidadeApi.logout().pipe(catchError(() => of(null)))
      : of(null);

    return request$.pipe(
      tap(() => {
        this.clearSession();
        void this.router.navigate(['/auth/login']);
      }),
    );
  }

  clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.tokenSubject.next(null);
    this.usuarioSubject.next(null);
    this.tenantSubject.next(null);
    this.modulosService.clear();
  }

  handleUnauthorized(): void {
    this.clearSession();
    void this.router.navigate(['/auth/login']);
  }

  ensureModulosLoaded(): Observable<unknown> {
    if (!this.isAuthenticated()) {
      return of([]);
    }

    if (this.modulosService.getModulosSnapshot().length > 0) {
      return of(this.modulosService.getModulosSnapshot());
    }

    return this.modulosService.load().pipe(catchError(() => of([])));
  }

  private applyAuthResponse(response: AuthResponse): void {
    sessionStorage.setItem(TOKEN_KEY, response.token);
    this.tokenSubject.next(response.token);
    this.usuarioSubject.next(response.usuario);
    this.tenantSubject.next(response.tenant);
  }

  private readStoredToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }
}
