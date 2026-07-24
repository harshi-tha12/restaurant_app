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
  
  // Carousel
  carouselIndex = 0;
  visibleCount = 5;

  ngOnInit() {
    console.log('🎬 CustomerMenu initialized');
    this.loadCategories();
    this.updateVisibleCount();
    window.addEventListener('resize', () => this.updateVisibleCount());
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.updateVisibleCount());
  }

  updateVisibleCount() {
    const width = window.innerWidth;
    if (width < 640) this.visibleCount = 2;
    else if (width < 1024) this.visibleCount = 3;
    else if (width < 1400) this.visibleCount = 4;
    else this.visibleCount = 5;
  }

  loadCategories() {
  console.log('📥 Starting to load categories...');
  this.isLoading = true;

  this.categoryService.getCategories().subscribe({
    next: (res: any) => {
      console.log('✅ Categories API Response:', res);

      this.categories =
        Array.isArray(res) ? res :
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.categories) ? res.categories :
        [];

      console.log('✅ Categories loaded:', this.categories.length);

      this.selectedCategory = this.categories.length > 0 ? this.categories[0].id : null;
      this.carouselIndex = 0;
      this.updateVisibleCount();
      this.isLoading = false;
    },
    error: (err) => {
      console.error('❌ Error loading categories:', err);
      this.categories = [];
      this.selectedCategory = null;
      this.isLoading = false;
    }
  });
}
  selectCategory(categoryId: number) {
    this.selectedCategory = categoryId;
  }

  previousCategories() {
    if (this.carouselIndex > 0) this.carouselIndex--;
  }

  nextCategories() {
    const maxIndex = Math.max(0, this.categories.length - this.visibleCount);
    if (this.carouselIndex < maxIndex) this.carouselIndex++;
  }

  canScrollLeft() {
    return this.carouselIndex > 0;
  }

  canScrollRight() {
    const maxIndex = Math.max(0, this.categories.length - this.visibleCount);
    return this.carouselIndex < maxIndex;
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
      this.cart.push({ ...item, quantity: 1 });
    }
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

    this.orderService.createOrder(order).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          const createdOrder = res.order || { ...order, id: res.order?.id || null };
          this.router.navigate(['/order-success'], { state: { order: createdOrder } });
          this.cart = [];
        } else {
          alert('Failed to create order. Please try again.');
        }
      },
      error: (err) => {
        console.error('Error creating order:', err);
        alert('Server error creating order. Try again later.');
      }
    });
  }
}