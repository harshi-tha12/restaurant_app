import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const runtime = (window as any).__env || {};
const API_BASE = runtime.API_URL || 'http://localhost:5000';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${API_BASE}/api/settings`;

  constructor(private http: HttpClient) {}

  getSettings(adminId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${adminId}`);
  }

  updateSettings(adminId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${adminId}`, data);
  }
}