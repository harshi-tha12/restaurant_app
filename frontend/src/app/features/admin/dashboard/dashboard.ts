import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Categories } from '../categories/categories';
import { Settings } from '../settings/settings';
import { ReloadService } from '../../../services/reload.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, Categories, Settings, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private router = inject(Router);
  private reloadService = inject(ReloadService);
  isSidebarOpen = true;

  selectedPage = 'dashboard';
  adminName: string = '';
  restaurantName: string = '';
  adminId: number = 1;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  openPage(page: string) {
    this.selectedPage = page;
    
    // Trigger reload for categories when switching to that page
    if (page === 'categories') {
      setTimeout(() => this.reloadService.triggerReloadCategories(), 0);
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
}