import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);
  private apiUrl = 'https://foodie-qr-restaurant-app.onrender.com/api/categories';

  // Get all categories
  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Add new category
  addCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, categoryData);
  }

  // Update category
  updateCategory(id: number, categoryData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoryData);
  }

  // Delete category
  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Add item to category
  addItemToCategory(categoryId: number, itemData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${categoryId}/items`, itemData);
  }

  // Delete item from category
  deleteItem(categoryId: number, itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${categoryId}/items/${itemId}`);
  }
}
