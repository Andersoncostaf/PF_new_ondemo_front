import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { ContratacaoApiService } from '../contratacao-api.service';
import { Contratacao } from '../contratacao.models';
import { ContratacaoWizardStore } from './contratacao-wizard.store';

export const contratacaoResolver: ResolveFn<Contratacao | null> = (route) => {
  const uuid = route.paramMap.get('uuid');
  if (!uuid) {
    return of(null);
  }

  const api = inject(ContratacaoApiService);
  const store = inject(ContratacaoWizardStore);

  if (store.hydrated && store.uuid === uuid) {
    return of(null);
  }

  return api.get(uuid).pipe(
    tap((data) => store.hydrateFromContratacao(data)),
    catchError(() => {
      store.errorMessage = 'Solicitação não encontrada.';
      return of(null);
    }),
  );
};
