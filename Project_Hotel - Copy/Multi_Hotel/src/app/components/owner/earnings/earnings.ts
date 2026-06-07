import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { User } from '../../../model/user.model';
import { Hotel } from '../../../model/hotel.model';
import { Booking } from '../../../model/booking.model';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { HotelService } from '../../../services/hotel.service';
import { PaymentService } from '../../../services/payment.service';
import { OwnerLayoutComponent } from '../../../shared/owner-layout/owner-layout';
import { Transaction } from '../../../model/transaction.model';
import { AnalyticsService } from '../../../services/analytics.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OwnerLayoutComponent],
  templateUrl: './earnings.html',
  styleUrl: './earnings.css'
})
export class EarningsComponent implements OnInit {

  owner: User | null = null;
  myHotels: Hotel[] = [];
  allBookings: Booking[] = [];
  myBookings: Booking[] = [];
  
  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];

  String = String;

  grossRevenue = 0;
  commission = 0;
  netEarnings = 0;
  totalBookings = 0;
  totalNights = 0;
  commissionRate = 0.10;

  filterMonth = '';
  filterHotelId = '';
  filterStatus = '';

  months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  constructor(
    private auth: AuthService,
    private bookingService: BookingService,
    private hotelService: HotelService,
    private paymentService: PaymentService,
    private router: Router,
    private analyticsService: AnalyticsService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.owner = this.auth.getLoggedUser();
    this.cdr.detectChanges();
    if (!this.owner) { this.router.navigate(['/auth/login']); return; }

    this.hotelService.getHotelsByOwner(this.owner.id!).subscribe(hotels => {
      this.myHotels = hotels;

      // Fetch actual transactions
      this.paymentService.getTransactionsByOwner(this.owner!.id!).subscribe(txns => {
        this.allTransactions = txns.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.filteredTransactions = [...this.allTransactions];
        this.calcMetricsFromTxns(this.filteredTransactions);
      });

      this.bookingService.getBookings().subscribe((bookings: Booking[]) => {
        const hotelIds = hotels.map(h => h.id);
        this.allBookings = bookings.filter(b => hotelIds.includes(b.hotelId));
        this.myBookings = [...this.allBookings];
      });
    });
  }

  applyFilters(): void {
    let list = [...this.allTransactions];

    if (this.filterHotelId) {
      list = list.filter(t => String(t.hotelId) === this.filterHotelId);
    }
    if (this.filterMonth) {
      list = list.filter(t => t.createdAt.substring(5, 7) === this.filterMonth);
    }

    this.filteredTransactions = list;
    this.calcMetricsFromTxns(list);

    // Also filter bookings for the other table if needed
    let bList = [...this.allBookings];
    if (this.filterHotelId) bList = bList.filter(b => b.hotelId === this.filterHotelId);
    if (this.filterStatus) bList = bList.filter(b => b.status === this.filterStatus);
    this.myBookings = bList;
  }

  resetFilters(): void {
    this.filterMonth = '';
    this.filterHotelId = '';
    this.filterStatus = '';
    this.filteredTransactions = [...this.allTransactions];
    this.myBookings = [...this.allBookings];
    this.calcMetricsFromTxns(this.filteredTransactions);
  }

  calcMetricsFromTxns(txns: Transaction[]): void {
    const successful = txns.filter(t => t.status === 'Success');
    this.grossRevenue = successful.reduce((s, t) => s + t.totalAmount, 0);
    this.commission = successful.reduce((s, t) => s + t.platformCommission, 0);
    this.netEarnings = successful.reduce((s, t) => s + t.ownerEarnings, 0);
    this.totalBookings = successful.length;
    
    // Total nights still needs to come from bookings or be added to transaction
    this.totalNights = this.myBookings
      .filter(b => b.status === 'confirmed' || b.status === 'checkedIn' || b.status === 'checkedOut')
      .reduce((s, b) => s + (b.nights || 1), 0);
    
    this.cdr.detectChanges();
    setTimeout(() => this.initChart(), 0);
  }

  initChart() {
    const canvas = document.getElementById('earningsChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Use AnalyticsService to group net earnings by month
    const successfulTxns = this.filteredTransactions.filter(t => t.status === 'Success');
    const chartData = this.analyticsService.aggregateByMonth(successfulTxns, 'createdAt', 'ownerEarnings');

    // Make sure we replace existing chart if it exists
    if ((this as any).chartInstance) {
      (this as any).chartInstance.destroy();
    }

    (this as any).chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Net Earnings (৳)',
          data: chartData.values,
          backgroundColor: '#059669',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  getHotelName(hotelId: string): string {
    return this.myHotels.find(h => h.id === hotelId)?.name || 'Unknown Hotel';
  }

  getHotelEmoji(hotelId: string): string {
    return this.myHotels.find(h => h.id === hotelId)?.emoji || '🏨';
  }

  perHotelStats(): { hotel: Hotel; bookings: number; gross: number; net: number }[] {
    return this.myHotels.map(hotel => {
      const hTxns = this.allTransactions.filter(
        t => String(t.hotelId) === hotel.id && t.status === 'Success'
      );
      const gross = hTxns.reduce((s, t) => s + t.totalAmount, 0);
      const net = hTxns.reduce((s, t) => s + t.ownerEarnings, 0);
      return {
        hotel,
        bookings: hTxns.length,
        gross,
        net
      };
    });
  }

  logout(): void {
    this.auth.logout();
  }
}