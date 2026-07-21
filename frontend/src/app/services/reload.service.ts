import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReloadService {
  private reloadCategoriesSubject = new Subject<void>();
  reloadCategories$ = this.reloadCategoriesSubject.asObservable();

  triggerReloadCategories() {
    this.reloadCategoriesSubject.next();
  }
}