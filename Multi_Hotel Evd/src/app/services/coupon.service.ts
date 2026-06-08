import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Coupon } from '../model/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/coupons`);
  }

  addCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}/coupons`, coupon);
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/coupons/${id}`);
  }

  validateCoupon(code: string): Observable<Coupon | null> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/coupons?code=${code}`).pipe(
      map(coupons => {
        if (coupons.length > 0) {
          const c = coupons[0];
          // Check if active and valid
          if (c.isActive && new Date(c.validUntil) >= new Date()) {
            return c;
          }
        }
        return null;
      })
    );
  }

  toggleCouponStatus(coupon: Coupon): Observable<Coupon> {
    const updated = { ...coupon, isActive: !coupon.isActive };
    return this.http.put<Coupon>(`${this.apiUrl}/coupons/${coupon.id}`, updated);
  }
}
