import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css'
})
export class HeroSlider {

  images = [
    'assests/images/hero/hero1.jpg',
     'assests/images/hero/hero1.jpg',
      'assests/images/hero/hero1.jpg'
    
  ];

  currentImage = 0;

  constructor() {
    setInterval(() => {
      this.currentImage = (this.currentImage + 1) % this.images.length;
    }, 3000);
  }
}