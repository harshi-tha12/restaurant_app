import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category';
import { Navbar } from '../../../shared/navbar/navbar';
import { Footer } from '../../../shared/footer/footer';
import { HeroSlider } from '../../../shared/hero-slider/hero-slider';
import { Categories } from '../../../shared/categories/categories';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Categories, HeroSlider, Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private categoryService = inject(CategoryService);

  categories: any[] = [];

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}