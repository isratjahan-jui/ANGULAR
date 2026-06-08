import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { HotelService } from '../../../services/hotel.service';
import { Payment } from '../../../model/payment.model';
import { Booking } from '../../../model/booking.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css']
})
export class InvoiceComponent implements OnInit {

  // Normalized display data
  displayData: any = null;
  loading = true;
  error = '';

  // Invoice generate date/time
  generatedAt = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private auth: AuthService,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.generatedAt = new Date().toLocaleString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const bookingId = this.route.snapshot.paramMap.get('bookingId');

    if (!bookingId) {
      this.error = 'Invalid booking ID.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadInvoiceData(bookingId);
  }

  loadInvoiceData(bookingId: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    // 1. First check Invoices table
    this.paymentService.getInvoiceByBookingId(bookingId).subscribe({
      next: (invoices) => {
        if (invoices && invoices.length > 0) {
          try {
            this.mapInvoiceToDisplay(invoices[0]);
            this.loading = false;
          } catch (e) {
            console.error('Mapping error:', e);
            this.checkPaymentsTable(bookingId);
          }
        } else {
          this.checkPaymentsTable(bookingId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Invoice load error:', err);
        this.checkPaymentsTable(bookingId);
      }
    });
  }

  private checkPaymentsTable(bookingId: string): void {
    this.paymentService.getPaymentByBooking(bookingId).subscribe({
      next: (payments) => {
        if (payments && payments.length > 0) {
          try {
            this.mapPaymentToDisplay(payments[0]);
            this.loading = false;
          } catch (e) {
            this.createFromBooking(bookingId);
          }
        } else {
          this.createFromBooking(bookingId);
        }
        this.cdr.detectChanges();
      },
      error: () => this.createFromBooking(bookingId)
    });
  }

  createFromBooking(bookingId: string): void {
    this.bookingService.getBookings().subscribe({
      next: (bookings: Booking[]) => {
        const booking = bookings.find(b => String(b.id) === bookingId);
        if (!booking) {
          this.error = 'Booking details not found in the system.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.hotelService.getHotelById(booking.hotelId).subscribe({
          next: (hotel) => {
            const payment = this.paymentService.buildPayment(
              booking,
              'Digital Payment',
              hotel.type || 'Standard',
              hotel.price
            );

            this.paymentService.createPayment(payment).subscribe({
              next: (saved) => {
                this.mapPaymentToDisplay(saved);
                this.loading = false;
                this.cdr.detectChanges();
              },
              error: () => {
                this.error = 'Failed to generate a new payment record.';
                this.loading = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: () => {
            this.error = 'Associated hotel information not found.';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.error = 'Failed to synchronize with booking records.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private formatDate(dateStr: any): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return 'N/A';
    }
  }

  private mapInvoiceToDisplay(inv: any): void {
    this.displayData = {
      invoiceNo: inv.invoiceNumber,
      date: this.formatDate(inv.issuedAt),
      status: inv.status || 'paid',
      method: 'Digital Payment',
      hotelName: inv.hotelName,
      hotelLocation: inv.hotelLocation,
      hotelEmoji: inv.hotelEmoji || '🏨',
      roomType: inv.roomType,
      checkIn: inv.checkIn,
      checkOut: inv.checkOut,
      nights: inv.nights,
      guests: inv.guests,
      pricePerNight: inv.pricePerNight || (inv.total / (inv.nights || 1)) || 0,
      grossAmount: inv.amount,
      taxAmount: inv.tax,
      totalAmount: inv.total,
      transactionId: inv.transactionId
    };
  }

  private mapPaymentToDisplay(p: any): void {
    this.displayData = {
      invoiceNo: p.invoiceNo,
      date: p.date,
      status: p.status,
      method: p.method,
      hotelName: p.hotelName,
      hotelLocation: p.hotelLocation,
      hotelEmoji: p.hotelEmoji,
      roomType: p.roomType,
      checkIn: p.checkIn,
      checkOut: p.checkOut,
      nights: p.nights,
      guests: p.guests,
      pricePerNight: p.pricePerNight,
      grossAmount: p.grossAmount,
      taxAmount: p.taxAmount,
      totalAmount: p.totalAmount,
      transactionId: p.transactionId
    };
  }

  printInvoice(): void {
    window.print();
  }

  downloadPDF(): void {
    // PDF download logic using browser's print-to-PDF
    // Changing document title sets the default filename in the print dialog
    const originalTitle = document.title;
    const invoiceNo = this.displayData?.invoiceNo || 'INV-000';
    document.title = `StaySphere-Invoice-${invoiceNo}`;
    
    // Wait for the title change to propagate
    setTimeout(() => {
      window.print();
      
      // Restore title after a delay
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }, 100);
  }

  goBack(): void {
    this.router.navigate(['/customer/my-bookings']);
  }
}