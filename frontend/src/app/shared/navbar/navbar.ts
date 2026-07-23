import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  restaurantName: string = 'Restaurant';

  // frontend/src/app/shared/navbar/navbar.ts
ngOnInit() {
  const adminData = localStorage.getItem('admin');
  console.log('Raw admin data from localStorage:', adminData);
  
  if (adminData) {
    try {
      const admin = JSON.parse(adminData);
      console.log('Parsed admin object:', admin);
      this.restaurantName = admin.restaurant_name || 'Restaurant';
      console.log('Restaurant name set to:', this.restaurantName);
    } catch (e) {
      console.error('Error parsing admin data:', e);
    }
  }
}
  scrollToMenu() {
    const menuElement = document.querySelector('app-customer-menu');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}