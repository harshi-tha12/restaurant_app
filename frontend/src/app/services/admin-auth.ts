import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  private http = inject(HttpClient);

  private api = 'https://foodie-qr-restaurant-app.onrender.com/api/admin';

  login(data: any) {
    return this.http.post(`${this.api}/login`, data);
  }

}