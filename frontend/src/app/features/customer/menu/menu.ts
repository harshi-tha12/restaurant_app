import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Orders } from '../../../services/order';

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class CustomerMenu implements OnInit, OnDestroy {

  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private orderService = inject(Orders);

  categories: any[] = [];
  cart: any[] = [];
  selectedCategory: number | null = null;
  isLoading = true;
  searchQuery = '';

  ngOnInit() {
    console.log('CustomerMenu initialized');
    this.loadCategories();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadCategories() {
    console.log('Starting to load categories...');
    this.isLoading = true;

    this.categoryService.getCategories().subscribe({
      next: (res) => {
        console.log('✅ Categories API Response:', res);

        // Handle different response formats
        if (res.data && Array.isArray(res.data)) {
          this.categories = res.data;
        } else if (Array.isArray(res)) {
          this.categories = res;
        } else {
          console.warn('Unexpected response format:', res);
          this.categories = [];
        }

        console.log('✅ Categories set to:', this.categories);

        // Select first category by default
        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0].id;
          console.log('✅ Selected category:', this.selectedCategory);
        }

        this.isLoading = false;
        console.log('✅ Loading finished');
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
        this.isLoading = false;
        this.categories = [];
      },
      complete: () => {
        console.log('✅ Observable completed');
      }
    });
  }

  selectCategory(categoryId: number) {
    console.log('Category selected:', categoryId);
    this.selectedCategory = categoryId;
  }

  getSelectedCategory() {
    return this.categories.find(c => c.id === this.selectedCategory) || null;
  }

  getSelectedCategoryName() {
    return this.getSelectedCategory()?.name || '';
  }

  getSelectedCategoryItems() {
    const category = this.categories.find(c => c.id === this.selectedCategory);
    if (!category) return [];

    if (!this.searchQuery) {
      return category.items || [];
    }

    return (category.items || []).filter((item: any) =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addToCart(item: any) {
    const cartItem = this.cart.find(c => c.id === item.id);

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      this.cart.push({
        ...item,
        quantity: 1
      });
    }

    console.log('Cart updated:', this.cart);
  }

  removeFromCart(itemId: number) {
    this.cart = this.cart.filter(item => item.id !== itemId);
  }

  updateQuantity(itemId: number, quantity: number) {
    const item = this.cart.find(c => c.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  proceedToCheckout() {
    if (!this.cart || this.cart.length === 0) {
      alert('Your cart is empty. Please add items to checkout.');
      return;
    }

    const order = {
      order_ref: 'ORD-' + String(Date.now()).slice(-6),
      table: localStorage.getItem('table') || 'T1',
      items: this.cart.map(c => ({
        id: c.id,
        name: c.name,
        price: c.price,
        quantity: c.quantity
      })),
      total: this.getCartTotal()
    };

    // Post to backend to create order
    this.orderService.createOrder(order).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          const createdOrder = res.order || { ...order, id: res.order?.id || null };
          // navigate to order-success, pass server order
          this.router.navigate(['/order-success'], { state: { order: createdOrder } });
          // optional: clear local cart after creating order
          this.cart = [];
        } else {
          alert('Failed to create order. Please try again.');
          console.error('Unexpected create order response:', res);
        }
      },
      error: (err) => {
        console.error('Error creating order:', err);
        alert('Server error creating order. Try again later.');
      }
    });
  }
}