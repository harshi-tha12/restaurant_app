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
  restaurantName: string = 'FoodieQR';
  cartCount: number = 0;

  ngOnInit() {
    // Try to get restaurant name from localStorage or use default
    const adminData = localStorage.getItem('restaurantData');
    if (adminData) {
      try {
        const data = JSON.parse(adminData);
        this.restaurantName = data.restaurant_name || 'FoodieQR';
      } catch (e) {
        console.log('Error parsing restaurant data');
      }
    }

    // You can update cart count from a service later
    // For now, it's just a placeholder
  }

  scrollToMenu() {
    const menuElement = document.querySelector('app-customer-menu');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}