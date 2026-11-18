import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ContactMessagePayload,
  ValuationRequestPayload,
  ViewingInquiryPayload,
} from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  requestViewing(payload: ViewingInquiryPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/inquiries/`, payload);
  }

  requestValuation(payload: ValuationRequestPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/valuations/`, payload);
  }

  sendContactMessage(payload: ContactMessagePayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/contact/`, payload);
  }
}
