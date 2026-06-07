import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HotelService } from './hotel.service';
import { environment } from '../../environments/environment';
import { Booking } from '../model/booking.model';
import { Room } from '../model/room.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private hotelService: HotelService) {}

  createBooking(booking: Booking): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, booking);
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${id}`);
  }

  getBookingsByUser(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`).pipe(
      map(bookings => bookings.filter(b => b.userId == userId))
    );
  }

  getBookingsByOwner(ownerId: string): Observable<Booking[]> {
    return this.hotelService.getHotelsByOwner(ownerId).pipe(
      switchMap(hotels => {
        const hotelIds = hotels.map(h => h.id);
        return this.http.get<Booking[]>(`${this.apiUrl}/bookings`).pipe(
          map(bookings => bookings.filter(b => hotelIds.includes(b.hotelId)))
        );
      })
    );
  }

  updateBookingStatus(id: string, status: string, additionalData: any = {}): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}`, { status, ...additionalData });
  }

  cancelBooking(id: string, reason: string): Observable<any> {
    return this.updateBookingStatus(id, 'cancelled', { cancellationReason: reason });
  }

  checkIn(id: string): Observable<any> {
    return this.updateBookingStatus(id, 'checkedIn');
  }

  checkOut(id: string, extraCharges: any[] = []): Observable<any> {
    return this.updateBookingStatus(id, 'checkedOut', { extraCharges });
  }

  checkAvailability(hotelId: string, roomId: string, checkIn: string, checkOut: string): Observable<boolean> {
    return this.http.get<Room>(`${this.apiUrl}/rooms/${roomId}`).pipe(
      switchMap(room => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (room.availabilityDates && room.availabilityDates.length > 0) {
          let current = new Date(start);
          while (current < end) {
            const dateStr = current.toISOString().split('T')[0];
            if (!room.availabilityDates.includes(dateStr)) {
              return of(false);
            }
            current.setDate(current.getDate() + 1);
          }
        }

        return this.http.get<Booking[]>(`${this.apiUrl}/bookings?roomId=${roomId}`).pipe(
          map(bookings => {
            const activeBookings = bookings.filter(b => b.status !== 'cancelled');
            const overlaps = activeBookings.filter(b => {
              const bStart = new Date(b.checkIn);
              const bEnd = new Date(b.checkOut);
              return (start < bEnd && end > bStart);
            });
            return overlaps.length === 0;
          })
        );
      })
    );
  }

  calcNights(checkIn: string, checkOut: string): number {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = outDate.getTime() - inDate.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  }
}