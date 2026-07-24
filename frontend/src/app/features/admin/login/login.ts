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

  private auth = inject(AdminAuthService);
  private router = inject(Router);

  login() {
    if (!this.username || !this.password) {
      alert('Please enter username and password');
      return;
    }

    this.auth.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        console.log('Login response:', res);
        
        if (res.success && res.admin) {
          // ✅ SAVE ADMIN DATA TO LOCALSTORAGE
          localStorage.setItem('admin', JSON.stringify(res.admin));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('adminId', res.admin.id?.toString());
          
          console.log('Admin data saved:', res.admin);
          alert(res.message);
          
          // Navigate to dashboard
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert(res.message || 'Login failed');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        alert(err.error?.message || 'Login failed');
      }
    });
  }
}