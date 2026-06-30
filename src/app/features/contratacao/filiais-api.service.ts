import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FiliaisListResponse } from './contratacao.models';

@Injectable({ providedIn: 'root' })
export class FiliaisApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/filiais`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<FiliaisListResponse> {
    return this.http.get<FiliaisListResponse>(this.baseUrl);
  }
}
