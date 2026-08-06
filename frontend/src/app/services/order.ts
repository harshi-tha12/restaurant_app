import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const runtime = (window as any).__env || {};
const API_BASE = runtime.API_URL || 'http://localhost:5000';

@Injectable({
  providedIn: 'root',
})
export class Orders {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/api/orders`;

  createOrder(order: any): Observable<any> {
    return this.http.post(this.apiUrl, order);
  }

  getOrders(status: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?status=${status}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/status`, { status });
  }
}