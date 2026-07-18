import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  private categoryService = inject(CategoryService);

  categories: any[] = [];
  showCategoryForm = false;
  showItemForm = false;
  selectedCategoryId: number | null = null;

  // Category form data - ONLY category name, no items in form
  categoryForm = {
    name: ''
  };

  // Item form data
  itemForm = {
    name: '',
    ingredients: ['', '', '', '', '', ''],
    price: '',
    image: ''
  };

  itemImagePreview = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || res || [];
        console.log('Categories loaded:', this.categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  // Category Management
  openCategoryForm() {
    this.showCategoryForm = true;
    this.categoryForm = { name: '' };
  }

  closeCategoryForm() {
    this.showCategoryForm = false;
    this.categoryForm = { name: '' };
  }

  addCategory() {
    if (!this.categoryForm.name.trim()) {
      this.errorMessage = 'Category name is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.categoryService.addCategory(this.categoryForm).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Category added successfully!';
          this.closeCategoryForm();
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to add category';
        this.isLoading = false;
      }
    });
  }

  deleteCategory(categoryId: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.categoryService.deleteCategory(categoryId).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Category deleted successfully!';
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete category';
      }
    });
  }

  // Item Management
  openItemForm(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.showItemForm = true;
    this.itemForm = {
      name: '',
      ingredients: ['', '', '', '', '', ''],
      price: '',
      image: ''
    };
    this.itemImagePreview = '';
  }

  closeItemForm() {
    this.showItemForm = false;
    this.selectedCategoryId = null;
    this.itemForm = {
      name: '',
      ingredients: ['', '', '', '', '', ''],
      price: '',
      image: ''
    };
    this.itemImagePreview = '';
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
    if (!this.itemForm.name.trim()) {
      this.errorMessage = 'Dish name is required';
      return;
    }

    const filledIngredients = this.itemForm.ingredients.filter(ing => ing.trim());
    if (filledIngredients.length < 3) {
      this.errorMessage = 'Please add at least 3 ingredients';
      return;
    }

    if (!this.itemForm.price) {
      this.errorMessage = 'Price is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('name', this.itemForm.name);
    formData.append('ingredients', JSON.stringify(filledIngredients));
    formData.append('price', this.itemForm.price);

    const imageInput = document.querySelector('#itemImage') as HTMLInputElement;
    if (imageInput && imageInput.files && imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    if (this.selectedCategoryId) {
      this.categoryService.addItemToCategory(this.selectedCategoryId, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = 'Item added successfully!';
            this.closeItemForm();
            this.loadCategories();
            setTimeout(() => this.successMessage = '', 3000);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to add item';
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
          this.successMessage = 'Item deleted successfully!';
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete item';
      }
    });
  }
}
