// frontend/src/app/features/customer/order-success/order-success.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-success.html',
  styleUrls: ['./order-success.css'],
})
export class OrderSuccess implements OnInit {
  order: any = {
    id: 'TEST-0001',
    table: 'T1',
    items: [
      { id: 1, name: 'Gobi Manchuri', price: 150, quantity: 1 },
      { id: 2, name: 'Chicken Pizza', price: 300, quantity: 1 },
    ],
    createdAt: new Date().toISOString(),
  };

  tip = 0;
  paid = false;
  showConfetti = false;
  confettiPieces = Array.from({ length: 40 });

  ngOnInit() {
    const navOrder = (history && history.state && (history.state as any).order) ? (history.state as any).order : null;
    if (navOrder) {
      this.order = navOrder;
    }
  }

  getSubtotal() {
    return (this.order.items || []).reduce((s: number, it: any) => s + (it.price * (it.quantity || 1)), 0);
  }

  getTax() {
    return +(this.getSubtotal() * 0.05).toFixed(2);
  }

  getTotal() {
    return +(this.getSubtotal() + this.getTax() + (+this.tip || 0)).toFixed(2);
  }

  addTip(amount: number) {
    this.tip = amount;
  }

  pay() {
    if (this.paid) return;
    this.paid = true;
    this.showConfetti = true;

    setTimeout(() => {
      this.showConfetti = false;
    }, 4500);

    console.log('Payment completed for order:', {
      orderId: this.order.id,
      total: this.getTotal(),
      paidAt: new Date().toISOString()
    });
  }

  // NEW — called from template (avoids using global window in template)
  printReceipt() {
    window.print();
  }

  // NEW — navigate back to menu (simple client-side redirect)
  goHome() {
    window.location.href = '/';
  }
}