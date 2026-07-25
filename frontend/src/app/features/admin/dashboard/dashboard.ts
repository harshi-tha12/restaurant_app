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
import { QrGeneratorComponent } from '../../../components/qr-generator/qr-generator.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, Categories, Settings, RouterModule, QrGeneratorComponent],
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
  showLogoutConfirm = false;
  
  // Statistics
  totalOrders: number = 0;
  totalRevenue: number = 0;
  completedOrders: number = 0;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  openPage(page: string) {
    this.selectedPage = page;

    if (page === 'categories') {
      setTimeout(() => this.reloadService.triggerReloadCategories(), 0);
    }

    if (page === 'orders') {
      this.loadOrders();
    }
  }

  ngOnInit() {
    // Get admin data from localStorage
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        this.adminName = admin.admin_name || 'Admin';
        this.restaurantName = admin.restaurant_name || 'Restaurant';
        this.adminId = admin.id || 1;
        localStorage.setItem('adminId', this.adminId.toString());
      } catch (e) {
        console.log('Error parsing admin data');
      }
    }

    // Load statistics on init
    this.loadStatistics();
    this.loadNewOrders();
  }

  loadStatistics() {
    console.log('📊 Loading statistics...');
    
    this.http.get<any>('http://localhost:5000/api/orders/statistics').subscribe({
      next: (res) => {
        console.log('✅ Statistics loaded:', res);
        
        if (res.success) {
          this.totalOrders = res.data.totalOrders || 0;
          this.totalRevenue = res.data.totalRevenue || 0;
          this.completedOrders = res.data.completedOrders || 0;
          console.log('Total Orders:', this.totalOrders);
          console.log('Total Revenue:', this.totalRevenue);
          console.log('Completed Orders:', this.completedOrders);
        }
      },
      error: (err) => {
        console.error('❌ Failed to load statistics:', err);
      }
    });
  }

  logout() {
    // ✅ Show confirmation dialog
    this.showLogoutConfirm = true;
  }

  confirmLogout() {
    localStorage.removeItem('admin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminId');
    this.showLogoutConfirm = false;
    this.router.navigate(['']);
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  loadNewOrders() {
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
        this.loadStatistics();
      },
      error: (err) => console.error('Failed to update order status', err)
    });
  }
}