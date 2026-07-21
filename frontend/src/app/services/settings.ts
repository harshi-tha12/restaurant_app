import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'http://localhost:5000/api/settings';

  constructor(private http: HttpClient) {}

  getSettings(adminId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${adminId}`);
  }

  updateSettings(adminId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${adminId}`, data);
  }
}