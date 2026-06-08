import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Payment } from '../model/payment.model';
import { Transaction, Invoice } from '../model/transaction.model';
import { Booking } from '../model/booking.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ═══════════════════════════════════════════
  // PAYMENT CRUD
  // ═══════════════════════════════════════════

  // Payment create করো
  createPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.api}/payments`, payment);
  }

  // User এর সব payment
  getPaymentsByUser(userId: string | number): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.api}/payments?userId=${userId}`
    );
  }

  // Booking ID দিয়ে payment খোঁজো
  getPaymentByBooking(bookingId: string | number): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.api}/payments?bookingId=${bookingId}`
    );
  }

  // সব payments — Admin এর জন্য
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/payments`);
  }

  // ═══════════════════════════════════════════
  // TRANSACTION SYSTEM
  // তোমার file থেকে — Commission সহ
  // ═══════════════════════════════════════════

  // Payment process করো — Commission calculate করে Transaction তৈরি
  processPayment(
    bookingData: any,
    method: string
  ): Observable<Transaction> {
    const transactionId =
      'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // DB থেকে commission rate আনো
    return this.http.get<any>(`${this.api}/commission_settings`).pipe(
      switchMap(settings => {
        const rate = settings?.defaultRate || 10;
        const commission = bookingData.totalPrice * (rate / 100);
        const earnings = bookingData.totalPrice - commission;

        const transaction: Transaction = {
          bookingId: bookingData.id,
          hotelId: bookingData.hotelId,
          ownerId: bookingData.ownerId || '2',
          totalAmount: bookingData.totalPrice,
          platformCommission: commission,
          ownerEarnings: earnings,
          paymentMethod: method,
          transactionId: transactionId,
          status: 'Success',
          createdAt: new Date().toISOString()
        };

        return this.http.post<Transaction>(
          `${this.api}/transactions`,
          transaction
        );
      }),
      delay(1500) // Payment processing simulate করতে
    );
  }

  // সব Transactions — Admin এর জন্য
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.api}/transactions`);
  }

  // Owner ID দিয়ে Transactions খোঁজো
  getTransactionsByOwner(ownerId: string | number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.api}/transactions?ownerId=${ownerId}`);
  }

  // ═══════════════════════════════════════════
  // INVOICE SYSTEM
  // দুটো file এর সেরা অংশ একসাথে
  // ═══════════════════════════════════════════

  // Invoice তৈরি করো — Booking + Transaction থেকে
  generateInvoice(
    booking: any,
    transaction: Transaction
  ): Observable<Invoice> {
    const baseAmount = booking.totalPrice / 1.05; // 5% tax বাদ দিয়ে base
    const tax = booking.totalPrice * 0.05;

    const invoice: Invoice = {
      bookingId: booking.id,
      transactionId: transaction.transactionId,
      invoiceNumber: this.generateInvoiceNo(),
      customerName: booking.userName || 'Valued Guest',
      hotelName: booking.hotelName,
      hotelLocation: booking.hotelLocation || '',
      hotelEmoji: booking.hotelEmoji || '🏨',
      roomType: booking.roomType || 'Standard',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      pricePerNight: booking.pricePerNight || 0,
      amount: Math.round(baseAmount),
      tax: Math.round(tax),
      total: booking.totalPrice,
      issuedAt: new Date().toISOString(),
      status: 'paid'
    };

    return this.http.post<Invoice>(`${this.api}/invoices`, invoice);
  }

  // Booking ID দিয়ে Invoice খোঁজো
  getInvoiceByBookingId(bookingId: string | number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.api}/invoices?bookingId=${bookingId}`
    );
  }

  // সব Invoices — Admin এর জন্য
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.api}/invoices`);
  }

  // ═══════════════════════════════════════════
  // HELPER METHODS
  // আমার দেওয়া code থেকে
  // ═══════════════════════════════════════════

  // Unique Invoice Number — SS-202506-12345 format
  generateInvoiceNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 90000) + 10000;
    return `SS-${year}${month}-${random}`;
  }

  // Booking থেকে Payment object তৈরি
  buildPayment(
    booking: Booking,
    method: string,
    roomType: string,
    pricePerNight: number
  ): Payment {
    const tax = Math.round(booking.totalPrice * 0.05);
    const total = booking.totalPrice + tax;
    const transactionId =
      'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    return {
      bookingId: booking.id!,
      userId: booking.userId,
      hotelName: booking.hotelName,
      hotelLocation: booking.hotelLocation,
      hotelEmoji: booking.hotelEmoji || '🏨',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      roomType: roomType,
      pricePerNight: pricePerNight,
      grossAmount: booking.totalPrice,
      taxAmount: tax,
      totalAmount: total,
      method: method,
      status: 'paid',
      invoiceNo: this.generateInvoiceNo(),
      transactionId: transactionId,
      date: new Date().toISOString().split('T')[0]
    };
  }

  // Commission calculate করো — শুধু calculation দরকার হলে
  calculateCommission(
    amount: number,
    rate: number = 10
  ): { commission: number; ownerEarnings: number } {
    const commission = Math.round(amount * (rate / 100));
    const ownerEarnings = amount - commission;
    return { commission, ownerEarnings };
  }
}