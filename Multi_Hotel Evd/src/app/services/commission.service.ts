import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/commission_settings`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/commission_settings`, settings);
  }

  // Calculate earnings for Admin
  getAdminEarnings(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions`).pipe(
      map(txns => {
        const total = txns.reduce((sum, t) => sum + (t.platformCommission || 0), 0);
        return { totalEarnings: total, count: txns.length };
      })
    );
  }

  // Calculate earnings for specific Owner
  getOwnerEarnings(ownerId: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions`).pipe(
      map(txns => {
        const ownerTxns = txns.filter(t => t.ownerId == ownerId);
        const total = ownerTxns.reduce((sum, t) => sum + (t.ownerEarnings || 0), 0);
        return { totalEarnings: total, count: ownerTxns.length, transactions: ownerTxns };
      })
    );
  }
}
