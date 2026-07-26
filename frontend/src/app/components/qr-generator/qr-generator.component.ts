import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrcodeService } from '../../services/qrcode.service';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.css'
})
export class QrGeneratorComponent implements OnInit {

  private qrcodeService = inject(QrcodeService);
  
  qrCodeUrl: string = '';
  restaurantUrl: string = '';
  ipAddress: string = '';

  ngOnInit() {
    this.generateQRWithCurrentIP();
  }

  generateQRWithCurrentIP() {
    const admin = localStorage.getItem('admin');
    if (admin) {
      const adminData = JSON.parse(admin);
      
      // Get current IP dynamically
      fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
          // Use public IP for production
          this.ipAddress = data.ip;
          this.restaurantUrl = `http://${data.ip}:4200/?restaurant=${adminData.id}`;
          this.generateQR();
        })
        .catch(() => {
          // Fallback: use window location
          const hostname = window.location.hostname;
          this.ipAddress = hostname;
          this.restaurantUrl = `http://${hostname}:4200/?restaurant=${adminData.id}`;
          this.generateQR();
        });
    }
  }

  generateQR() {
    this.qrcodeService.generateQRCode(this.restaurantUrl).then(qrUrl => {
      this.qrCodeUrl = qrUrl;
    }).catch(err => {
      console.error('Error generating QR code:', err);
    });
  }

  downloadQR() {
    this.qrcodeService.downloadQRCode(this.qrCodeUrl, 'restaurant-qr-code.png');
  }

  printQR() {
    const printWindow = window.open('', '', 'height=500, width=500');
    if (printWindow) {
      printWindow.document.write('<img src="' + this.qrCodeUrl + '" style="width:100%; padding:20px;" />');
      printWindow.document.write('<p style="text-align:center; margin-top:20px;">' + this.restaurantUrl + '</p>');
      printWindow.document.close();
      printWindow.print();
    }
  }
}