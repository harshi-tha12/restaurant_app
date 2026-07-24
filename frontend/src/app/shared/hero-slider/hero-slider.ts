import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css'
})
export class HeroSlider implements OnInit, OnDestroy {

  images = [
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=500&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=500&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=500&fit=crop'
  ];

  currentImage = 0;
  private intervalId: any;

  ngOnInit() {
    this.startSlider();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startSlider() {
    this.intervalId = setInterval(() => {
      this.currentImage = (this.currentImage + 1) % this.images.length;
    }, 4000);
  }

  nextImage() {
    this.currentImage = (this.currentImage + 1) % this.images.length;
    this.resetInterval();
  }

  prevImage() {
    this.currentImage = (this.currentImage - 1 + this.images.length) % this.images.length;
    this.resetInterval();
  }

  goToImage(index: number) {
    this.currentImage = index;
    this.resetInterval();
  }

  resetInterval() {
    clearInterval(this.intervalId);
    this.startSlider();
  }
}