// frontend/src/app/services/admin-auth.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  private http = inject(HttpClient);

  // Use the backend base URL from environment
  private api = `${environment.baseUrl.replace(/\/$/, '')}/api/admin`;

  login(data: any) {
    // If your backend uses cookies for auth, you might need { withCredentials: true }
    return this.http.post(`${this.api}/login`, data /*, { withCredentials: true } */);
  }

}