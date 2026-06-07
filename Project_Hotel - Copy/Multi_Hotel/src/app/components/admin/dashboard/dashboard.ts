import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../../model/user.model';
import { Hotel } from '../../../model/hotel.model';
import { Booking } from '../../../model/booking.model';
import { AuthService } from '../../../services/auth.service';
import { HotelService } from '../../../services/hotel.service';
import { BookingService } from '../../../services/booking.service';
import { CommissionService } from '../../../services/commission.service';
import { AnalyticsService } from '../../../services/analytics.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  admin: User | null = null;
  hotels: Hotel[] = [];
  bookings: Booking[] = [];
  users: User[] = [];
  isSidebarOpen = false;

  totalRevenue: number = 0;
  platformEarnings: number = 0;
  occupancyRate: number = 0;
  
  today: string = '';

  constructor(
    private auth: AuthService,
    private hotelService: HotelService,
    private bookingService: BookingService,
    private commissionService: CommissionService,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.admin = this.auth.getLoggedUser();
    this.today = new Date().toLocaleDateString('en-BD', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    this.auth.getAllUsers().subscribe(u => this.users = u);
    this.hotelService.getHotels().subscribe(h => this.hotels = h);
    
    this.bookingService.getBookings().subscribe(b => {
      this.bookings = b;
      this.totalRevenue = b.reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0);
        this.cdr.detectChanges();
      this.commissionService.getAdminEarnings().subscribe(res => {
        this.platformEarnings = res.totalEarnings;
        this.cdr.detectChanges();
      });

      this.calculateOccupancy();
      
      // Initialize Chart after data loads
      setTimeout(() => this.initChart(), 0);
    });
  }

  initChart() {
    const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!canvas) return;

    // We'll chart the bookings' totalPrice by month using the checkIn date 
    // (since mock bookings often don't have createdAt, but they have checkIn)
    const chartData = this.analyticsService.aggregateByMonth(this.bookings, 'checkIn', 'totalPrice');

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Platform Revenue (৳)',
          data: chartData.values,
          borderColor: '#1e3a8a',
          backgroundColor: 'rgba(30, 58, 138, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  calculateOccupancy() {
    // Occupancy simulation: percentage of hotels with at least one active booking
    const activeHotelIds = new Set(this.bookings.filter(b => b.status === 'CheckedIn').map(b => b.hotelId));
    this.occupancyRate = this.hotels.length > 0 ? Math.round((activeHotelIds.size / this.hotels.length) * 100) : 0;
  }

  approveHotel(id: string | undefined) {
    if (id) {
      this.hotelService.getHotelById(id).subscribe(hotel => {
        hotel.approved = true;
        this.hotelService.updateHotel(hotel).subscribe(() => {
          this.hotels = this.hotels.map(h => h.id === hotel.id ? hotel : h);
        });
      });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.auth.logout();
  }
}