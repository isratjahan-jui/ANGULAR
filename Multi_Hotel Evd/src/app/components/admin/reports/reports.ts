import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Booking } from '../../../model/booking.model';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent implements OnInit {
  bookings: Booking[] = [];
  filterStatus = '';

  constructor(private bookingService: BookingService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bookingService.getBookings().subscribe({
      next: (b: Booking[]) => {
        this.bookings = b || [];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Reports: Failed to load', err)
    });
  }

  get filteredBookings(): Booking[] {
    if (!this.filterStatus) return this.bookings;
    return this.bookings.filter(b => b.status === this.filterStatus);
  }

  getTotalRevenue(): number {
    return this.filteredBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  }
}
