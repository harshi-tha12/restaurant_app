import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class Orders {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/api/orders`;

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