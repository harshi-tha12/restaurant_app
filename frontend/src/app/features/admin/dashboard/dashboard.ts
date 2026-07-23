import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Categories } from '../categories/categories';
import { Settings } from '../settings/settings';
import { ReloadService } from '../../../services/reload.service';
import { HttpClient } from '@angular/common/http';
import { Orders } from '../../../services/order';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, Categories, Settings, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private router = inject(Router);
  private reloadService = inject(ReloadService);
  private http = inject(HttpClient);
  private orderService = inject(Orders);
  
  isSidebarOpen = true;
  selectedPage = 'dashboard';
  adminName: string = '';
  restaurantName: string = '';
  adminId: number = 1;
  newOrders: any[] = [];
  pastOrders: any[] = [];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  openPage(page: string) {
    this.selectedPage = page;

    if (page === 'categories') {
      setTimeout(() => this.reloadService.triggerReloadCategories(), 0);
    }

    if (page === 'orders') {
      // load orders when admin navigates to orders
      this.loadOrders();
    }
  }

  ngOnInit() {
    // Get admin data from localStorage
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        this.adminName = admin.admin_name || admin.full_name || 'Admin';
        this.restaurantName = admin.restaurant_name || 'Restaurant';
        this.adminId = admin.id || 1;
        localStorage.setItem('adminId', this.adminId.toString());
      } catch (e) {
        console.log('Error parsing admin data');
      }
    }
  }

  logout() {
    localStorage.removeItem('admin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminId');
    this.router.navigate(['/admin/login']);
  }

  loadOrders() {
    // New orders
    this.orderService.getOrders('new').subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.newOrders = res.data || [];
          console.log('New Orders loaded:', this.newOrders);
        } else {
          this.newOrders = [];
        }
      },
      error: (err) => {
        console.error('Failed to load new orders', err);
        this.newOrders = [];
      }
    });

    // Past orders
    this.orderService.getOrders('past').subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.pastOrders = res.data || [];
        } else {
          this.pastOrders = [];
        }
      },
      error: (err) => {
        console.error('Failed to load past orders', err);
        this.pastOrders = [];
      }
    });
  }

  markOrderCompleted(orderId: number) {
    this.orderService.updateOrderStatus(orderId, 'completed').subscribe({
      next: () => {
        console.log('Order marked completed');
        this.loadOrders();
      },
      error: (err) => console.error('Failed to update order status', err)
    });
  }
}
