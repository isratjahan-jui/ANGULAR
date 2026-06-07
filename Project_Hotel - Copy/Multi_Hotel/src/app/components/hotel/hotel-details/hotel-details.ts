import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HotelService } from '../../../services/hotel.service';
import { BookingService } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { RoomService } from '../../../services/room.service';

import { Hotel } from '../../../model/hotel.model';
import { Room } from '../../../model/room.model';

import { WishlistService } from '../../../services/wishlist.service';
import { ReviewService } from '../../../services/review.service';
import { Review } from '../../../model/review.model';
import { AddReviewComponent } from '../../review/add-review/add-review.component';

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AddReviewComponent],
  templateUrl: './hotel-details.html',
  styleUrl: './hotel-details.css',
})
export class HotelDetails implements OnInit {

  hotel: Hotel | null = null;
  rooms: Room[] = [];
  reviews: Review[] = [];
  loading = true;

  // Gallery
  activeImage = '';

  // Booking details
  checkIn = '';
  checkOut = '';
  guests = 1;

  selectedRoom: Room | null = null;
  selectedExtraServices: any[] = [];

  nights = 0;
  totalPrice = 0;

  extraServices = [
    { id: 's1', name: 'Breakfast Buffet', price: 1200, selected: false },
    { id: 's2', name: 'Airport Shuttle', price: 2500, selected: false },
    { id: 's3', name: 'Spa Access', price: 3000, selected: false }
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private hotelService: HotelService,
    private roomService: RoomService,
    private bookingService: BookingService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private wishlistService: WishlistService,
    private reviewService: ReviewService
  ) {}

  toggleWishlist() {
    if (this.hotel) {
      this.wishlistService.toggleWishlist(this.hotel);
      this.cdr.detectChanges();
    }
  }

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.hotel?.id);
  }

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {

      this.hotelService.getHotelById(id).subscribe({
        next: (h) => {

          this.hotel = h;

          // Load rooms
          this.loadRooms(id.toString());
          
          // Load reviews
          this.loadReviews(id);

          // Initialize dates
          this.initDates();

          // Set first image
          if (h.images && h.images.length > 0) {
            this.activeImage = h.images[0];
          }

          this.loading = false;

          this.cdr.detectChanges();

          console.log('Hotel:', h);
        },

        error: (err) => {
          console.error('Error loading hotel', err);
          this.loading = false;
        }
      });
    }
  }

  loadRooms(hotelId: string): void {

    this.roomService.getRoomsByHotel(hotelId).subscribe({
      next: (rooms) => {

        this.rooms = rooms || [];

        if (this.rooms.length > 0) {
          this.selectedRoom = this.rooms[0];
          this.calcTotal();
        }

        this.cdr.detectChanges();

        console.log('Rooms:', rooms);
      },

      error: (err) => {
        console.error('Error loading rooms', err);
      }
    });
  }

  loadReviews(hotelId: string | number): void {
    this.reviewService.getReviewsByHotel(hotelId).subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading reviews', err)
    });
  }

  onReviewAdded(newReview: Review): void {
    this.reviews.unshift(newReview);
    this.cdr.detectChanges();
  }

  initDates(): void {

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);

    this.checkIn = today.toISOString().split('T')[0];
    this.checkOut = tomorrow.toISOString().split('T')[0];

    this.calcTotal();
  }

  calcTotal(): void {

    if (!this.selectedRoom || !this.checkIn || !this.checkOut) {
      return;
    }

    this.nights = this.bookingService.calcNights(
      this.checkIn,
      this.checkOut
    );

    const basePrice = this.nights * this.selectedRoom.price;

    const extraPrice = this.extraServices
      .filter(service => service.selected)
      .reduce((sum, service) => sum + service.price, 0);

    this.totalPrice = basePrice + extraPrice;
  }

  toggleService(service: any): void {

    service.selected = !service.selected;

    this.calcTotal();
  }

  selectRoom(room: Room): void {

    this.selectedRoom = room;

    this.calcTotal();

    console.log('Selected Room:', room);
  }

  proceedToBooking(): void {

    if (!this.auth.isLoggedIn()) {

      alert('Please login to continue.');

      this.router.navigate(['/login']);

      return;
    }

    if (!this.selectedRoom) {

      alert('Please select a room.');

      return;
    }

    const bookingData = {

      hotelId: this.hotel?.id,
      hotelName: this.hotel?.name,
      hotelLocation: this.hotel?.location,

      roomId: this.selectedRoom.id,
      roomType: this.selectedRoom.roomType,

      checkIn: this.checkIn,
      checkOut: this.checkOut,

      nights: this.nights,
      guests: this.guests,

      totalPrice: this.totalPrice,

      ownerId: this.hotel?.ownerId,

      extraServices: this.extraServices.filter(s => s.selected),

      hotelEmoji: this.hotel?.emoji
    };

    sessionStorage.setItem(
      'pending_booking',
      JSON.stringify(bookingData)
    );

    this.router.navigate(['/booking/create', this.hotel!.id]);
  }

  getStars(rating: number): string {

    return '★'.repeat(Math.floor(rating || 0));
  }

  // Change active gallery image
  setActiveImage(image: string): void {

    this.activeImage = image;
  }

  // YouTube embed URL
  getEmbedUrl(url: string): SafeResourceUrl {

    let videoId = '';

    if (url.includes('youtube.com/watch?v=')) {

      videoId = url.split('v=')[1]?.split('&')[0];

    } else if (url.includes('youtu.be/')) {

      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }
}