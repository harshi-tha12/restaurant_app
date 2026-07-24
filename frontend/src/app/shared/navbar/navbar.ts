import { Component, OnInit } from '@angular/core';
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
  restaurantName: string = 'FoodieQR';

  ngOnInit() {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        this.restaurantName = admin.restaurant_name || admin.restaurantName || 'Restaurant';
      } catch (e) {
        console.error('Error parsing admin data:', e);
        this.restaurantName = 'Restaurant';
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