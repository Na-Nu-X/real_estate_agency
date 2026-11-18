import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Agent, PropertyDetail, PropertyFilters, PropertyListItem } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(filters: PropertyFilters = {}): Observable<PropertyListItem[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PropertyListItem[]>(`${this.baseUrl}/properties/`, { params });
  }

  get(slug: string): Observable<PropertyDetail> {
    return this.http.get<PropertyDetail>(`${this.baseUrl}/properties/${encodeURIComponent(slug)}/`);
  }

  agents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.baseUrl}/agents/`);
  }
}
