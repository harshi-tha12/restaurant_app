import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category';
import { ReloadService } from '../../../services/reload.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit, OnDestroy {

  private categoryService = inject(CategoryService);
  private reloadService = inject(ReloadService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private routerSub: Subscription | null = null;

  categories: any[] = [];
  showCategoryForm = false;
  showItemForm = false;
  selectedCategoryId: number | null = null;

  // editing state
  editingItemId: number | null = null;

  // Category form data
  categoryForm = {
    name: ''
  };

  // Item form data - ingredients as single textarea
  itemForm = {
    name: '',
    ingredientsText: '', // Single textarea for all ingredients
    price: '',
    image: '',
    vegOption: 'dont_show', // 'dont_show' | 'veg' | 'nonveg'
    isAvailable: true
  };

  itemImagePreview = '';
  isLoading = false;
  successMessage = '';
  successMessageType = ''; // 'category' or 'item'
  categoryErrorMessage = '';
  itemErrorMessage = '';

  ngOnInit() {
    console.log('Categories component initialized');
    this.loadCategories();
    
    // Subscribe to reload trigger
    this.subscription = this.reloadService.reloadCategories$.subscribe(() => {
      console.log('Reload triggered from ReloadService');
      this.loadCategories();
    });

    // Listen to router navigation to reload categories when this route becomes active
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((ev: any) => {
      if (ev.urlAfterRedirects && ev.urlAfterRedirects.includes('/categories')) {
        console.log('NavigationEnd to categories route detected - reloading');
        this.loadCategories();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private tryParseJsonMaybeArray(value: any): any {
    // If it's already an array, return it
    if (Array.isArray(value)) return value;

    // If it's a string that looks like JSON array, try parse
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('"') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          // If parsing yields an array, return it; otherwise return original string
          if (Array.isArray(parsed)) return parsed;
          // sometimes it's double-encoded like "\"[\\\"a\\\",\\\"b\\\"]\"" -> parsed becomes string
          // try parse again if parsed is string that looks like array
          if (typeof parsed === 'string') {
            const p2 = parsed.trim();
            if (p2.startsWith('[')) {
              try {
                const parsed2 = JSON.parse(p2);
                if (Array.isArray(parsed2)) return parsed2;
              } catch (_e) { /* ignore */ }
            }
          }
        } catch (_err) {
          // not JSON, fall back to original string
        }
      }
    }

    return value;
  }

  loadCategories() {
    console.log('Loading categories...');
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        console.log('API Response:', res);
        this.categories = res.data || res || [];

        // Normalize items: ensure isVeg may be null, isAvailable boolean, and ingredients is array or string
        this.categories.forEach((cat: any) => {
          cat.items = (cat.items || []).map((item: any) => {
            // normalize ingredients
            const normalizedIngredients = this.tryParseJsonMaybeArray(item.ingredients);

            return {
              ...item,
              ingredients: normalizedIngredients,
              isVeg: item.isVeg === null ? null : !!item.isVeg,
              isAvailable: item.isAvailable === undefined ? true : !!item.isAvailable
            };
          });
        });

        console.log('Categories loaded:', this.categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  // Helper used by template: returns true when value is an array
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  // Helper used by template: joins ingredients if array, otherwise returns string (or empty)
  joinIngredients(item: any): string {
    const ing = item?.ingredients;
    if (Array.isArray(ing)) return ing.join(', ');
    if (typeof ing === 'string') return ing;
    return '';
  }

  // Category Management
  openCategoryForm() {
    this.showCategoryForm = true;
    this.categoryForm = { name: '' };
    this.categoryErrorMessage = '';
  }

  closeCategoryForm() {
    this.showCategoryForm = false;
    this.categoryForm = { name: '' };
    this.categoryErrorMessage = '';
  }

  addCategory() {
    this.categoryErrorMessage = '';

    if (!this.categoryForm.name.trim()) {
      this.categoryErrorMessage = 'Category name is required';
      return;
    }

    this.isLoading = true;

    this.categoryService.addCategory(this.categoryForm).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeCategoryForm();
          this.successMessageType = 'category';
          this.successMessage = '✅ Category added successfully!';
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 2000);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.categoryErrorMessage = err.error?.message || 'Failed to add category';
        this.isLoading = false;
      }
    });
  }

  deleteCategory(categoryId: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.categoryService.deleteCategory(categoryId).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessageType = 'category';
          this.successMessage = '✅ Category deleted successfully!';
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 2000);
        }
      },
      error: (err) => {
        this.categoryErrorMessage = err.error?.message || 'Failed to delete category';
      }
    });
  }

  // Item Management
  openItemForm(categoryId: number, itemToEdit: any = null) {
    this.selectedCategoryId = categoryId;
    this.showItemForm = true;
    this.itemErrorMessage = '';
    this.itemImagePreview = '';

    if (itemToEdit) {
      // Edit mode
      this.editingItemId = itemToEdit.id;

      // Prepare ingredientsText from normalized ingredients
      let ingredientsText = '';
      if (Array.isArray(itemToEdit.ingredients)) {
        ingredientsText = itemToEdit.ingredients.join('\n');
      } else if (typeof itemToEdit.ingredients === 'string') {
        ingredientsText = itemToEdit.ingredients;
      } else {
        ingredientsText = '';
      }

      this.itemForm = {
        name: itemToEdit.name || '',
        ingredientsText: ingredientsText,
        price: itemToEdit.price || '',
        image: '',
        vegOption: itemToEdit.isVeg === null ? 'dont_show' : (itemToEdit.isVeg ? 'veg' : 'nonveg'),
        isAvailable: itemToEdit.isAvailable === undefined ? true : !!itemToEdit.isAvailable
      };
      // show current image in preview if exists
      if (itemToEdit.image) {
        this.itemImagePreview = itemToEdit.image;
      }
    } else {
      // Add mode
      this.editingItemId = null;
      this.itemForm = {
        name: '',
        ingredientsText: '',
        price: '',
        image: '',
        vegOption: 'dont_show',
        isAvailable: true
      };
    }
  }

  closeItemForm() {
    this.showItemForm = false;
    this.selectedCategoryId = null;
    this.editingItemId = null;
    this.itemForm = {
      name: '',
      ingredientsText: '',
      price: '',
      image: '',
      vegOption: 'dont_show',
      isAvailable: true
    };
    this.itemImagePreview = '';
    this.itemErrorMessage = '';
  }

  onItemImageSelect(event: any) {
    const file = event?.target?.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.itemImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.itemImagePreview = '';
    }
  }

  addItem() {
    this.itemErrorMessage = '';

    if (!this.itemForm.name.trim()) {
      this.itemErrorMessage = 'Dish name is required';
      return;
    }

    // Parse ingredients from textarea
    const ingredientsArray = this.itemForm.ingredientsText
      .split('\n')
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    if (ingredientsArray.length < 1) {
      this.itemErrorMessage = `Please add at least 1 ingredient (you have ${ingredientsArray.length})`;
      return;
    }

    if (ingredientsArray.length > 6) {
      this.itemErrorMessage = `Maximum 6 ingredients allowed (you have ${ingredientsArray.length})`;
      return;
    }

    if (!this.itemForm.price) {
      this.itemErrorMessage = 'Price is required';
      return;
    }

    // For add, require image; for edit, image can be optional
    if (!this.itemImagePreview && !this.editingItemId) {
      this.itemErrorMessage = 'Please upload an image';
      return;
    }

    this.isLoading = true;

    const vegOption = this.itemForm.vegOption; // 'dont_show' | 'veg' | 'nonveg'
    const isAvailable = this.itemForm.isAvailable ? 1 : 0;

    // Safely get file if user selected one
    const imageInput = document.querySelector('#itemImage') as HTMLInputElement | null;
    const file = imageInput?.files && imageInput.files.length ? imageInput.files[0] : null;
    const useFormData = !!file;

    if (useFormData) {
      const formData = new FormData();
      formData.append('name', this.itemForm.name);
      formData.append('ingredients', JSON.stringify(ingredientsArray));
      formData.append('price', String(this.itemForm.price));
      formData.append('vegOption', vegOption);
      formData.append('is_available', String(isAvailable));
      formData.append('image', file);

      if (this.selectedCategoryId) {
        const obs = this.editingItemId
          ? this.categoryService.updateItemInCategory(this.selectedCategoryId, this.editingItemId, formData)
          : this.categoryService.addItemToCategory(this.selectedCategoryId, formData);

        obs.subscribe({
          next: (res) => {
            console.log('Add/Update response:', res);
            if (res && res.success) {
              this.closeItemForm();
              this.successMessageType = 'item';
              this.successMessage = this.editingItemId ? '✅ Item updated successfully!' : '✅ Item added successfully!';
              this.loadCategories();
              setTimeout(() => this.successMessage = '', 2000);
            } else {
              this.itemErrorMessage = res?.message || 'Server did not return success';
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Add/Update error:', err);
            this.itemErrorMessage = err?.error?.message || 'Failed to add/update item';
            this.isLoading = false;
          }
        });
      } else {
        this.itemErrorMessage = 'Category not selected';
        this.isLoading = false;
      }
    } else {
      // JSON payload (use base64 preview if available)
      const payload: any = {
        name: this.itemForm.name,
        ingredients: JSON.stringify(ingredientsArray),
        price: String(this.itemForm.price),
        vegOption: vegOption,
        is_available: String(isAvailable)
      };
      if (this.itemImagePreview) {
        payload.image = this.itemImagePreview; // data URL
      }

      if (this.selectedCategoryId) {
        const obs = this.editingItemId
          ? this.categoryService.updateItemInCategory(this.selectedCategoryId, this.editingItemId, payload)
          : this.categoryService.addItemToCategory(this.selectedCategoryId, payload);

        obs.subscribe({
          next: (res) => {
            console.log('Add/Update (JSON) response:', res);
            if (res && res.success) {
              this.closeItemForm();
              this.successMessageType = 'item';
              this.successMessage = this.editingItemId ? '✅ Item updated successfully!' : '✅ Item added successfully!';
              this.loadCategories();
              setTimeout(() => this.successMessage = '', 2000);
            } else {
              this.itemErrorMessage = res?.message || 'Server did not return success';
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Add/Update (JSON) error:', err);
            this.itemErrorMessage = err?.error?.message || 'Failed to add/update item';
            this.isLoading = false;
          }
        });
      } else {
        this.itemErrorMessage = 'Category not selected';
        this.isLoading = false;
      }
    }
  }

  deleteItem(categoryId: number, itemId: number) {
    // keep function if you want delete API later, but no button in UI now
    if (!confirm('Are you sure you want to delete this item?')) return;

    this.categoryService.deleteItem(categoryId, itemId).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessageType = 'item';
          this.successMessage = '✅ Item deleted successfully!';
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 2000);
        }
      },
      error: (err) => {
        this.categoryErrorMessage = err.error?.message || 'Failed to delete item';
      }
    });
  }

  editItem(categoryId: number, item: any) {
    this.openItemForm(categoryId, item);
  }
}