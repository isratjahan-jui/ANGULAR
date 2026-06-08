import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review } from '../model/review.model';
import { Booking } from '../model/booking.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReviewsByHotel(hotelId: string | number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews?hotelId=${hotelId}`);
  }

  addReview(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, review);
  }

  checkIfBooked(userId: string | number, hotelId: string | number): Observable<Booking | null> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings?userId=${userId}&hotelId=${hotelId}`).pipe(
      map(bookings => {
        if (bookings && bookings.length > 0) {
          return bookings[0];
        }
        return null;
      })
    );
  }
}
