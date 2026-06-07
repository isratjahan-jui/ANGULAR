import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Booking } from '../../../model/booking.model';

interface PendingBooking {
  hotelId: string;
  hotelName: string;
  hotelLocation?: string;
  hotelEmoji?: string;
  ownerId?: string;
  roomId?: string;
  roomType?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  requests?: string;
  userName?: string;
}

@Component({
  selector: 'app-booking-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class BookingPayment implements OnInit {
  bookingData: PendingBooking | null = null;
  selectedMethod = '';
  isProcessing = false;
  paymentSuccess = false;
  error = '';

  paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: '📱' },
    { id: 'nagad', name: 'Nagad', icon: '📱' },
    { id: 'rocket', name: 'Rocket', icon: '📱' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
  ];

  constructor(
    public router: Router,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private notify: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const data = sessionStorage.getItem('pending_booking');
    if (!data) {
      this.router.navigate(['/hotels']);
      return;
    }
    try {
      this.bookingData = JSON.parse(data);
    } catch {
      sessionStorage.removeItem('pending_booking');
      this.router.navigate(['/hotels']);
    }
  }

  selectMethod(methodId: string): void {
    this.selectedMethod = methodId;
    this.error = '';
  }

  processPayment(): void {
    if (!this.selectedMethod || !this.bookingData) {
      this.error = 'Please select a payment method.';
      return;
    }

    const user = this.authService.getLoggedUser();
    if (!user?.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.isProcessing = true;
    this.error = '';

    const d = this.bookingData;
    const booking: Booking = {
      userId: String(user.id),
      ownerId: d.ownerId ? String(d.ownerId) : undefined,
      hotelId: String(d.hotelId),
      hotelName: d.hotelName,
      hotelLocation: d.hotelLocation ?? '',
      hotelEmoji: d.hotelEmoji,
      roomId: String(d.roomId ?? '1'),
      roomType: d.roomType ?? 'Standard Room',
      checkIn: d.checkIn,
      checkOut: d.checkOut,
      nights: d.nights || 1,
      guests: d.guests || 1,
      totalPrice: d.totalPrice || 0,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: this.selectedMethod,
      requests: d.requests,
      createdAt: new Date().toISOString(),
    };

    this.bookingService.createBooking(booking).subscribe({
      next: (saved) => {
        const savedBooking = { ...booking, ...saved, userName: user.name };
        this.paymentService.processPayment(savedBooking, this.selectedMethod).subscribe({
          next: (txn) => {
            this.paymentService.generateInvoice(savedBooking, txn).subscribe({
              next: () => {
                this.notify
                  .sendNotification(
                    String(user.id),
                    'Booking Confirmed!',
                    `Your stay at ${booking.hotelName} is confirmed.`,
                    'success'
                  )
                  .subscribe({ error: () => undefined });

                this.isProcessing = false;
                this.paymentSuccess = true;
                this.cdr.detectChanges();
                sessionStorage.removeItem('pending_booking');
              },
              error: () => this.failPayment('Invoice could not be generated.'),
            });
          },
          error: () => this.failPayment('Payment processing failed.'),
        });
      },
      error: () => this.failPayment('Could not save your booking.'),
    });
  }

  private failPayment(message: string): void {
    this.isProcessing = false;
    this.error = message;
  }

  goToDashboard(): void {
    this.router.navigate(['/customer/my-bookings']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
