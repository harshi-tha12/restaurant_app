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

    this.auth.login({

      username: this.username,

      password: this.password

    }).subscribe({

      next: (res: any) => {

        alert(res.message);

        this.router.navigate(['/admin/dashboard']);

      },

      error: (err) => {

        alert(err.error.message);

      }

      

    });

    

  }

}