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
    this.getLocalIP();
  }

  getLocalIP() {
    const admin = localStorage.getItem('admin');
    if (admin) {
      const adminData = JSON.parse(admin);
      // Get your machine IP - replace with your actual IP
      const ip = this.getDeviceIP();
      this.ipAddress = ip;
      this.restaurantUrl = `http://${ip}:4200/?restaurant=${adminData.id}`;
      this.generateQR();
    }
  }

  getDeviceIP(): string {
    // Replace '192.168.x.x' with your actual machine IP
    // You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
    return '192.168.1.100'; // CHANGE THIS TO YOUR IP
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
      printWindow.document.write('<img src="' + this.qrCodeUrl + '" />');
      printWindow.document.close();
      printWindow.print();
    }
  }
}