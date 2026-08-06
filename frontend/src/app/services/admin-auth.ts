import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const runtime = (window as any).__env || {};
const API_BASE = runtime.API_URL || 'http://localhost:5000';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private http = inject(HttpClient);
  private api = `${API_BASE}/api/admin`;

  login(data: any) {
    return this.http.post(`${this.api}/login`, data);
  }
}