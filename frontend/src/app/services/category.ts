import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Runtime API URL injected into index.html by set-env.js (or falls back to localhost)
const runtime = (window as any).__env || {};
const API_BASE = runtime.API_URL || 'http://localhost:5000';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE}/api/categories`;

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
    // itemData can be FormData (multipart) or JSON
    return this.http.post<any>(`${this.apiUrl}/${categoryId}/items`, itemData);
  }

  // Update item in category
  updateItemInCategory(categoryId: number, itemId: number, itemData: any): Observable<any> {
    // itemData can be FormData (multipart) or JSON
    return this.http.put<any>(`${this.apiUrl}/${categoryId}/items/${itemId}`, itemData);
  }

  // Delete item from category
  deleteItem(categoryId: number, itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${categoryId}/items/${itemId}`);
  }
}