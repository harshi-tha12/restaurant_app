import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrcodeService {

  generateQRCode(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
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