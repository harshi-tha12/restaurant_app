import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrcodeService {

  generateQRCode(text: string): Promise<string> {
    // Generate a slightly larger QR (easier to scan on phones)
    return QRCode.toDataURL(encodeURI(text), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 500,   // larger for printing/scanning
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  downloadQRCode(qrUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = filename;
    link.click();
  }
}