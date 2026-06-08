import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { RoomService } from '../../../services/room.service';
import { Hotel } from '../../../model/hotel.model';
import { Booking } from '../../../model/booking.model';
import { Room } from '../../../model/room.model';
import { CouponService } from '../../../services/coupon.service';
import { Coupon } from '../../../model/coupon.model';

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-booking.html',
  styleUrl: './create-booking.css',
})
export class CreateBooking implements OnInit {
  hotel: Hotel | null = null;
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  checkIn = '';
  checkOut = '';
  guests = '1';
  requests = '';
  nights = 1;
  total = 0;
  loading = false;
  loadError = '';
  error = '';
  isAvailable: boolean | null = null;
  checkingAvailability = false;

  couponCode = '';
  appliedCoupon: Coupon | null = null;
  discountAmount = 0;
  couponError = '';
  couponSuccess = '';

  guestOptions = ['1', '2', '3', '4', '5'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private bookingService: BookingService,
    private roomService: RoomService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private couponService: CouponService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    this.checkIn = today.toISOString().split('T')[0];
    this.checkOut = tomorrow.toISOString().split('T')[0];

    this.applyPendingBooking();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError = 'Hotel not found.';
      return;
    }

    this.hotelService.getHotelById(id).subscribe({
      next: (h) => {
        this.hotel = h;
        this.loadRooms(id);
        this.calcTotal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'Could not load hotel. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  private applyPendingBooking(): void {
    const raw = sessionStorage.getItem('pending_booking');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.checkIn) this.checkIn = data.checkIn;
      if (data.checkOut) this.checkOut = data.checkOut;
      if (data.guests) this.guests = String(data.guests);
      if (data.requests) this.requests = data.requests;
      this.pendingRoomId = data.roomId ? String(data.roomId) : null;
    } catch {
      sessionStorage.removeItem('pending_booking');
    }
  }

  private pendingRoomId: string | null = null;

  loadRooms(hotelId: string): void {
    this.roomService.getRoomsByHotel(hotelId).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        if (this.rooms.length === 0) {
          this.selectedRoom = null;
          this.calcTotal();
          this.checkRoomAvailability();
          this.cdr.detectChanges();
          return;
        }
        const match = this.pendingRoomId
          ? this.rooms.find((r) => String(r.id) === this.pendingRoomId)
          : null;
        this.selectedRoom = match ?? this.rooms[0];
        this.calcTotal();
        this.checkRoomAvailability();
        this.cdr.detectChanges();
      },
      error: () => {
        this.rooms = [];
        this.selectedRoom = null;
        this.calcTotal();
        this.checkRoomAvailability();
        this.cdr.detectChanges();
      },
    });
  }

  onRoomIdChange(roomId: string): void {
    this.selectedRoom = this.rooms.find((r) => String(r.id) === roomId) ?? this.selectedRoom;
    this.calcTotal();
    this.checkRoomAvailability();
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
    this.calcTotal();
    this.checkRoomAvailability();
  }

  calcTotal(): void {
    if (!this.checkIn || !this.checkOut) return;
    this.nights = this.bookingService.calcNights(this.checkIn, this.checkOut);
    const nightly = this.selectedRoom?.price ?? this.hotel?.price ?? 0;
    const subTotal = this.nights * nightly;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.discountType === 'percentage') {
        this.discountAmount = (subTotal * this.appliedCoupon.discountAmount) / 100;
      } else {
        this.discountAmount = this.appliedCoupon.discountAmount;
      }
      this.total = Math.max(0, subTotal - this.discountAmount);
    } else {
      this.discountAmount = 0;
      this.total = subTotal;
    }
  }

  applyCoupon(): void {
    if (!this.couponCode) {
      this.couponError = 'Please enter a coupon code.';
      return;
    }
    this.couponError = '';
    this.couponSuccess = '';
    this.couponService.validateCoupon(this.couponCode).subscribe(coupon => {
      if (coupon) {
        this.appliedCoupon = coupon;
        this.couponSuccess = 'Coupon applied successfully!';
        this.calcTotal();
      } else {
        this.appliedCoupon = null;
        this.couponError = 'Invalid or expired coupon code.';
        this.calcTotal();
      }
    });
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponSuccess = '';
    this.couponError = '';
    this.calcTotal();
  }

  onDatesChange(): void {
    this.calcTotal();
    this.checkRoomAvailability();
  }

  checkRoomAvailability(): void {
    if (!this.hotel || !this.selectedRoom?.id || !this.checkIn || !this.checkOut || this.checkOut <= this.checkIn) {
      this.isAvailable = null;
      return;
    }
    this.checkingAvailability = true;
    this.cdr.detectChanges();
    this.bookingService.checkAvailability(String(this.hotel.id), String(this.selectedRoom.id), this.checkIn, this.checkOut).subscribe({
      next: (res) => {
        this.isAvailable = res;
        this.checkingAvailability = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isAvailable = null;
        this.checkingAvailability = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildBooking(paymentStatus: 'Unpaid' | 'Paid'): Booking | null {
    const user = this.auth.getLoggedUser();
    if (!user?.id || !this.hotel) return null;

    const room = this.selectedRoom;
    return {
      userId: String(user.id),
      ownerId: String(this.hotel.ownerId),
      hotelId: String(this.hotel.id),
      hotelName: this.hotel.name,
      hotelLocation: this.hotel.location,
      hotelEmoji: this.hotel.emoji,
      roomId: room?.id ? String(room.id) : '1',
      roomType: room?.roomType ?? this.hotel.type ?? 'Standard Room',
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      nights: this.nights,
      guests: parseInt(this.guests, 10) || 1,
      totalPrice: this.total,
      status: 'confirmed',
      paymentStatus,
      requests: this.requests,
      createdAt: new Date().toISOString(),
    };
  }

  private validate(): boolean {
    this.error = '';
    if (!this.hotel) {
      this.error = 'Hotel information is missing.';
      return false;
    }
    if (!this.checkIn || !this.checkOut) {
      this.error = 'Please select check-in and check-out dates.';
      return false;
    }
    if (this.checkOut <= this.checkIn) {
      this.error = 'Check-out must be after check-in.';
      return false;
    }
    if (this.nights < 1) {
      this.error = 'Stay must be at least one night.';
      return false;
    }
    if (this.rooms.length > 0 && !this.selectedRoom) {
      this.error = 'Please select a room.';
      return false;
    }
    if (this.checkingAvailability) {
      this.error = 'Still checking room availability... Please wait.';
      return false;
    }
    if (this.isAvailable === false) {
      this.error = 'Room is not available for the selected dates.';
      return false;
    }
    return true;
  }

  confirm(): void {
    if (!this.validate()) return;

    const booking = this.buildBooking('Unpaid');
    if (!booking) return;

    this.loading = true;
    this.bookingService.createBooking(booking).subscribe({
      next: () => {
        this.loading = false;
        sessionStorage.removeItem('pending_booking');
        this.router.navigate(['/customer/my-bookings']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Booking failed. Please try again.';
      },
    });
  }

  payNow(): void {
    if (!this.validate() || !this.hotel) return;

    const user = this.auth.getLoggedUser();
    sessionStorage.setItem(
      'pending_booking',
      JSON.stringify({
        hotelId: String(this.hotel.id),
        hotelName: this.hotel.name,
        hotelLocation: this.hotel.location,
        hotelEmoji: this.hotel.emoji,
        ownerId: String(this.hotel.ownerId),
        roomId: this.selectedRoom?.id ? String(this.selectedRoom.id) : '1',
        roomType: this.selectedRoom?.roomType ?? this.hotel.type,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        nights: this.nights,
        guests: parseInt(this.guests, 10) || 1,
        totalPrice: this.total,
        requests: this.requests,
        userName: user?.name,
      })
    );
    this.router.navigate(['/booking/checkout']);
  }
}
