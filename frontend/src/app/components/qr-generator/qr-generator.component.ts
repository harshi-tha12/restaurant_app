import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrcodeService } from '../../services/qrcode.service';
import { environment } from '../../../environment/environment'; // optional: use if you have environments

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-generator.component.html',
  styleUrls: ['./qr-generator.component.css'] // fixed property name
})
export class QrGeneratorComponent implements OnInit {

  private qrcodeService = inject(QrcodeService);
  
  qrCodeUrl: string = '';
  restaurantUrl: string = '';
  ipAddress: string = '';

  // If you deploy, set a BASE_URL in your environment files and use it instead of computing origin.
  // e.g. environment.baseUrl = 'https://myrestaurant.example.com'
  private getBaseUrl(): string {
    // Prefer configured production base url if available
    if ((environment as any).baseUrl) {
      return (environment as any).baseUrl.replace(/\/$/, ''); // remove trailing slash
    }

    // Otherwise use current origin (protocol + hostname + port)
    // Note: if you're running a dev server with port 4200, that origin will be encoded
    return window.location.origin;
  }

  ngOnInit() {
    this.generateQRWithCurrentBase();
  }

  generateQRWithCurrentBase() {
    const admin = localStorage.getItem('admin');
    if (!admin) return;

    const adminData = JSON.parse(admin);
    const base = this.getBaseUrl();

    // Build a URL that points to a mobile-friendly route (optional)
    // You can change /admin to the route you want users to open from QR
    // adding mobile=true allows you to show a simplified UI for scan users
    const mobileParam = 'mobile=true';
    const connector = base.includes('?') ? '&' : '?';
    this.restaurantUrl = `${base}${connector}restaurant=${encodeURIComponent(adminData.id)}&${mobileParam}`;

    this.generateQR();
  }

  generateQR() {
    if (!this.restaurantUrl) return;
    // Ensure the URL is fully encoded
    const url = encodeURI(this.restaurantUrl);
    this.qrcodeService.generateQRCode(url).then(qrUrl => {
      this.qrCodeUrl = qrUrl;
    }).catch(err => {
      console.error('Error generating QR code:', err);
    });
  }

  downloadQR() {
    if (!this.qrCodeUrl) return;
    this.qrcodeService.downloadQRCode(this.qrCodeUrl, 'restaurant-qr-code.png');
  }

  printQR() {
    if (!this.qrCodeUrl) return;
    const printWindow = window.open('', '', 'height=700, width=700');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print QR</title></head><body style="margin:0; padding:20px; text-align:center;">');
      printWindow.document.write('<img src="' + this.qrCodeUrl + '" style="max-width:100%; height:auto;" />');
      printWindow.document.write('<p style="text-align:center; margin-top:20px; word-break:break-all;">' + this.restaurantUrl + '</p>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }
}