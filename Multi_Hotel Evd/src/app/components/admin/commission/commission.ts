import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Booking } from '../../../model/booking.model';
import { BookingService } from '../../../services/booking.service';
import { CommissionService } from '../../../services/commission.service';

@Component({
  selector: 'app-commission',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './commission.html',
  styleUrls: ['./commission.css']
})
export class CommissionComponent implements OnInit {

  bookings: Booking[] = [];
  totalRevenue = 0;
  totalCommission = 0;
  ownerEarnings = 0;
  rate = 10;
  tempRate = 10;

  constructor(
    private bookingService: BookingService,
    private commissionService: CommissionService
  ) {}

  ngOnInit(): void {
    this.commissionService.getSettings().subscribe(settings => {
      if (settings && settings.defaultRate) {
        this.rate = settings.defaultRate;
        this.tempRate = this.rate;
      }
      this.loadData();
    });
  }

  loadData(): void {
    this.bookingService.getBookings().subscribe({
      next: (b) => {
        this.bookings = b || [];
        this.calculateMetrics();
      },
      error: (err) => console.error('Commission: Load failed', err)
    });
  }

  calculateMetrics(): void {
    this.totalRevenue = this.bookings.reduce((s, x) => s + (Number(x.totalPrice) || 0), 0);
    this.totalCommission = Math.round(this.totalRevenue * this.rate / 100);
    this.ownerEarnings = this.totalRevenue - this.totalCommission;
  }

  updateRate(): void {
    if (this.tempRate < 0 || this.tempRate > 100) {
      alert('Rate must be between 0 and 100');
      return;
    }
    this.commissionService.updateSettings({ defaultRate: this.tempRate }).subscribe(() => {
      this.rate = this.tempRate;
      this.calculateMetrics();
      alert('Commission rate updated successfully in system!');
    });
  }
}