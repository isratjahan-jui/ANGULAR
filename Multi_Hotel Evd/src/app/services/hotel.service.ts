import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Hotel } from '../model/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/hotels`).pipe(
      catchError(() => of([]))
    );
  }

  getHotelById(id: string | number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/hotels/${id}`);
  }

  addHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(`${this.apiUrl}/hotels`, hotel);
  }

  updateHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/hotels/${hotel.id}`, hotel);
  }

  approveHotel(id: string | number): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/hotels/${id}`, { status: 'approved', approved: true });
  }

  rejectHotel(id: string | number): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/hotels/${id}`, { status: 'rejected', approved: false });
  }

  deleteHotel(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/hotels/${id}`);
  }

  getHotelsByOwner(ownerId: string | number): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.apiUrl}/hotels`).pipe(
      map(hotels => hotels.filter(h => h.ownerId == ownerId))
    );
  }
}