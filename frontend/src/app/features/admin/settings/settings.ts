import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [SettingsService],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  adminId: number = parseInt(localStorage.getItem('adminId') || '1', 10);
  
  settings = {
    username: '',
    restaurant_name: '',
    admin_name: '',
    password: '',
    confirmPassword: ''
  };

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    this.settingsService.getSettings(this.adminId).subscribe(
      (response) => {
        if (response.success) {
          this.settings = {
            ...response.data,
            password: '',
            confirmPassword: ''
          };
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading settings:', error);
        this.errorMessage = 'Failed to load settings';
        this.loading = false;
      }
    );
  }

  saveSettings() {
    // Validation
    if (!this.settings.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    if (!this.settings.restaurant_name.trim()) {
      this.errorMessage = 'Restaurant name is required';
      return;
    }

    if (!this.settings.admin_name.trim()) {
      this.errorMessage = 'Admin name is required';
      return;
    }

    if (this.settings.password && this.settings.password !== this.settings.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = {
      username: this.settings.username,
      restaurant_name: this.settings.restaurant_name,
      admin_name: this.settings.admin_name,
      ...(this.settings.password && { password: this.settings.password })
    };

    this.settingsService.updateSettings(this.adminId, updateData).subscribe(
      (response) => {
        if (response.success) {
          this.successMessage = 'Settings updated successfully!';
          this.settings.password = '';
          this.settings.confirmPassword = '';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error updating settings:', error);
        this.errorMessage = error.error?.message || 'Failed to update settings';
        this.loading = false;
      }
    );
  }
}