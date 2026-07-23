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

  private auth = inject(AdminAuthService);
  private router = inject(Router);

  login() {
    if (!this.username || !this.password) {
      alert('Please enter username and password');
      return;
    }

    this.isLoading = true;

    this.auth.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        if (res.success) {
          // Save complete admin data to localStorage
          localStorage.setItem('admin', JSON.stringify(res.admin));
          localStorage.setItem('isLoggedIn', 'true');
          
          console.log('Admin logged in:', res.admin);
          alert(res.message || 'Login successful');
          
          // Navigate to dashboard
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert(res.message || 'Login failed');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        alert(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}