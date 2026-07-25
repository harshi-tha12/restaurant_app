import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminAuthService } from '../../../services/admin-auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';
  isLoading = false;
  isLoginSuccess = false;
  errorMessage = '';

  private auth = inject(AdminAuthService);
  private router = inject(Router);

  login() {
    // Clear previous error
    this.errorMessage = '';

    // Validation: Empty fields
    if (!this.username || !this.password) {
      this.errorMessage = '⚠️ Please enter username and password';
      return;
    }

    // Prevent double-tap
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.auth.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('Login response:', res);
        
        if (res.success && res.admin) {
          // ✅ SUCCESS CASE
          localStorage.setItem('admin', JSON.stringify(res.admin));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('adminId', res.admin.id?.toString());
          
          console.log('Admin data saved:', res.admin);
          
          // Show success state
          this.isLoginSuccess = true;
          
          // Trigger confetti
          this.triggerConfetti();
          
          // Auto navigate after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 3000);
        } else {
          // ❌ FAILED CASE (Invalid credentials)
          this.errorMessage = '❌ ' + (res.message || 'Invalid username or password');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        
        // ❌ ERROR CASE (Network or server error)
        const errorMsg = err.error?.message || 'Login failed. Please try again.';
        this.errorMessage = '❌ ' + errorMsg;
      }
    });
  }

  triggerConfetti() {
    for (let i = 0; i < 50; i++) {
      this.createConfetti();
    }
  }

  createConfetti() {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-piece');
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = this.getRandomColor();
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }

  getRandomColor(): string {
    const colors = ['#B71C1C', '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}