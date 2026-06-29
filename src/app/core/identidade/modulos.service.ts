import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { IdentidadeApiService } from './identidade-api.service';
import { ModuloItem } from './identidade.models';

@Injectable({ providedIn: 'root' })
export class ModulosService {
  private readonly modulosSubject = new BehaviorSubject<ModuloItem[]>([]);

  readonly modulos$ = this.modulosSubject.asObservable();

  constructor(private readonly identidadeApi: IdentidadeApiService) {}

  load(): Observable<ModuloItem[]> {
    return this.identidadeApi.getModulos().pipe(
      tap((response) => {
        this.modulosSubject.next(response.modulos ?? []);
      }),
      map((response) => response.modulos ?? []),
    );
  }

  hasModulo(codigo: string): boolean {
    return this.modulosSubject.value.some((modulo) => modulo.codigo === codigo);
  }

  getModulosSnapshot(): ModuloItem[] {
    return this.modulosSubject.value;
  }

  clear(): void {
    this.modulosSubject.next([]);
  }
}
