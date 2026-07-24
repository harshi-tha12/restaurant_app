import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category';
import { Navbar } from '../../../shared/navbar/navbar';
import { Footer } from '../../../shared/footer/footer';
import { HeroSlider } from '../../../shared/hero-slider/hero-slider';
import { CustomerMenu } from '../menu/menu';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroSlider, Navbar, Footer, CustomerMenu],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private categoryService = inject(CategoryService);

  categories: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    console.log('🏠 Home component initialized');
    this.loadCategories();
  }

  loadCategories() {
    console.log('🔄 Home: Starting to load categories...');
    this.isLoading = true;

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('✅ Home: Categories loaded successfully:', data);
        
        // Handle different response formats
        if (data && Array.isArray(data)) {
          this.categories = data;
        } else if (data?.data && Array.isArray(data.data)) {
          this.categories = data.data;
        } else {
          console.warn('⚠️ Unexpected data format:', data);
          this.categories = [];
        }
        
        this.isLoading = false;
        console.log('✅ Home: isLoading set to false, categories ready:', this.categories);
      },
      error: (err) => {
        console.error('❌ Home: Error loading categories:', err);
        this.isLoading = false;
        this.categories = [];
      }
    });
  }
}