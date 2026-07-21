import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category';
import { ReloadService } from '../../../services/reload.service';
import { Subscription } from 'rxjs';

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
  private subscription: Subscription | null = null;

  categories: any[] = [];
  showCategoryForm = false;
  showItemForm = false;
  selectedCategoryId: number | null = null;

  // Category form data
  categoryForm = {
    name: ''
  };

  // Item form data - ingredients as single textarea
  itemForm = {
    name: '',
    ingredientsText: '', // Single textarea for all ingredients
    price: '',
    image: ''
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
    
    // Subscribe to reload trigger immediately
    this.subscription = this.reloadService.reloadCategories$.subscribe(() => {
      console.log('Reload triggered from Dashboard');
      this.loadCategories();
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadCategories() {
    console.log('Loading categories...');
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        console.log('API Response:', res);
        this.categories = res.data || res || [];
        console.log('Categories loaded:', this.categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
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
  openItemForm(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.showItemForm = true;
    this.itemForm = {
      name: '',
      ingredientsText: '', // Empty textarea
      price: '',
      image: ''
    };
    this.itemImagePreview = '';
    this.itemErrorMessage = '';
  }

  closeItemForm() {
    this.showItemForm = false;
    this.selectedCategoryId = null;
    this.itemForm = {
      name: '',
      ingredientsText: '',
      price: '',
      image: ''
    };
    this.itemImagePreview = '';
    this.itemErrorMessage = '';
  }

  onItemImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.itemImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
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

    if (ingredientsArray.length < 3) {
      this.itemErrorMessage = `Please add at least 3 ingredients (you have ${ingredientsArray.length})`;
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

    if (!this.itemImagePreview) {
      this.itemErrorMessage = 'Please upload an image';
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('name', this.itemForm.name);
    formData.append('ingredients', JSON.stringify(ingredientsArray));
    formData.append('price', this.itemForm.price);

    const imageInput = document.querySelector('#itemImage') as HTMLInputElement;
    if (imageInput && imageInput.files && imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    if (this.selectedCategoryId) {
      this.categoryService.addItemToCategory(this.selectedCategoryId, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.closeItemForm();
            this.successMessageType = 'item';
            this.successMessage = '✅ Item added successfully!';
            this.loadCategories();
            setTimeout(() => this.successMessage = '', 2000);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.itemErrorMessage = err.error?.message || 'Failed to add item';
          this.isLoading = false;
        }
      });
    }
  }

  deleteItem(categoryId: number, itemId: number) {
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
}