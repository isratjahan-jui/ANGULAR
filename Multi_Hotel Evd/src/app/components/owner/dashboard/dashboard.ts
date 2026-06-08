import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OwnerLayoutComponent } from '../../../shared/owner-layout/owner-layout';
import { HotelService } from '../../../services/hotel.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { CommissionService } from '../../../services/commission.service';
import { Hotel } from '../../../model/hotel.model';
import { Booking } from '../../../model/booking.model';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, OwnerLayoutComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class OwnerDashboard implements OnInit {
  ownerName: string = '';
  myHotels: Hotel[] = [];
  myBookings: Booking[] = [];
  
  totalEarnings: number = 0;
  monthlyIncome: number = 0;
  totalBookings: number = 0;
  activeGuests: number = 0;

  constructor(
    private hotelService: HotelService,
    private bookingService: BookingService,
    private auth: AuthService,
    private commissionService: CommissionService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.getLoggedUser();
    if (user) {
      this.ownerName = user.name;
      const ownerId = user.id!.toString();

      this.hotelService.getHotelsByOwner(ownerId).subscribe(hotels => {
        this.myHotels = hotels;
      });

      this.bookingService.getBookingsByOwner(ownerId).subscribe(bookings => {
        this.myBookings = bookings;
        this.totalBookings = bookings.length;
        this.activeGuests = bookings.filter(b => b.status === 'checkedIn').length;
        this.cdr.detectChanges();
        this.commissionService.getOwnerEarnings(ownerId).subscribe(res => {
          this.totalEarnings = res.totalEarnings;
          // Simulated monthly income (last 30 days)
          this.monthlyIncome = res.totalEarnings; // For demo purposes
        });
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
