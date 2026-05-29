import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, NEVER } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.api_url;
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return NEVER;

    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      params: httpParams,
      headers: this.defaultHeaders,
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return NEVER;
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.defaultHeaders
    });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return NEVER;
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.defaultHeaders
    });
  }

  putFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return NEVER;
    // Don't set Content-Type header for FormData
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, formData, {
      headers: new HttpHeaders({ 'Accept': 'application/json' })
    });
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return NEVER;
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      headers: new HttpHeaders({ 'Accept': 'application/json' })
    });
  }

  patch<T>(endpoint: string, body: any, params?: any): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return NEVER;
    const httpParams = this.buildParams(params);
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.defaultHeaders,
      params: httpParams
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return NEVER;
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.defaultHeaders
    });
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }
}
