import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  Router,
  RouterModule
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import { Hotel } from '../../model/hotel.model';
import { Booking } from '../../model/booking.model';

import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  selectedDest = 'all';
  searchDest = '';
  recentSearches: string[] = [];
  filteredRecentSearches: string[] = [];
  showRecentSearches = false;
  searchCheckin = '';
  searchCheckout = '';

  // Booking Modal
  showBookingModal = false;
  showLoginModal = false;
  showRegisterModal = false;
  selectedHotel: Hotel | null = null;
  bkCheckin = '';
  bkCheckout = '';
  bkGuests = '1 Guest';
  bkRequests = '';
  bookingTotal = 0;
  bookingNights = 0;

  // Login
  loginEmail = '';
  loginPass = '';
  loginError = '';

  // Register
  regName = '';
  regEmail = '';
  regPhone = '';
  regPass = '';
  regRole = 'customer';
  regError = '';

  destinations = [
    'all',
    'Dhaka',
    "Cox's Bazar",
    'Sylhet',
    'Chittagong',
    'Khulna',
    'Rajshahi',
    'Barisal'
  ];

  reviews = [
    {
      name: 'Rashida K.',
      loc: 'Dhaka',
      rating: 5,
      text: 'StaySphere made our anniversary trip absolutely magical.',
      avatar: 'RK'
    },
    {
      name: 'Tanvir A.',
      loc: 'Chittagong',
      rating: 5,
      text: 'Booked Ocean Breeze Resort for our family vacation.',
      avatar: 'TA'
    },
    {
      name: 'Nusrat J.',
      loc: 'Sylhet',
      rating: 5,
      text: 'Tea Garden Retreat exceeded all expectations.',
      avatar: 'NJ'
    }
  ];

  roomTypes = [
    {
      type: 'Standard Room',
      desc: 'Comfortable & affordable.',
      price: '৳2,500/night',
      emoji: '🛏'
    },
    {
      type: 'Deluxe Room',
      desc: 'Spacious premium room.',
      price: '৳5,500/night',
      emoji: '✨'
    },
    {
      type: 'Suite',
      desc: 'Luxury suite with lounge.',
      price: '৳9,000/night',
      emoji: '🛋'
    },
    {
      type: 'Presidential Suite',
      desc: 'Ultimate luxury experience.',
      price: '৳18,000/night',
      emoji: '👑'
    }
  ];

  constructor(
    private hotelService: HotelService,
    private auth: AuthService,
    private bookingService: BookingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private wishlistService: WishlistService
  ) { }

  ngOnInit(): void {

    // LOAD HOTELS

    this.hotelService
      .getHotels()
      .subscribe({

        next: (hotels: Hotel[]) => {

          console.log('Hotels:', hotels);

          this.hotels = hotels || [];
          this.filterByDest('all');
          this.cdr.detectChanges();

          // SHOW FIRST 6 HOTELS

          // this.filteredHotels = [...this.hotels].slice(0, 10);

          // console.log(
          //   'Filtered Hotels:',
          //   this.filteredHotels
          // );
        },

        error: (err) => {

          console.error(
            'Hotel Load Error:',
            err
          );
        }

      });

    // LOAD RECENT SEARCHES
    try {
      const raw = JSON.parse(localStorage.getItem('ss_recent_search') || '[]') as string[];
      // Extreme deduplication: lower case everything, trim, remove empty, then take unique
      const unique = Array.from(new Set(raw.filter(s => typeof s === 'string').map(s => s.trim().toLowerCase()))).filter(s => s);
      // Normalize to Title Case
      this.recentSearches = unique.map(s => s.charAt(0).toUpperCase() + s.slice(1));
      localStorage.setItem('ss_recent_search', JSON.stringify(this.recentSearches));
    } catch (e) {
      this.recentSearches = [];
    }
    
    this.filteredRecentSearches = [...this.recentSearches];

    // DATE SETUP
    const today = new Date();
    const tom = new Date(today.getTime() + 86400000);

    this.searchCheckin = today.toISOString().split('T')[0];
    this.searchCheckout = tom.toISOString().split('T')[0];
    this.bkCheckin = this.searchCheckin;
    this.bkCheckout = this.searchCheckout;
  }

  // DESTINATION FILTER
  filterByDest(dest: string): void {
    this.selectedDest = dest;
    if (dest === 'all') {
      this.filteredHotels = this.hotels.slice(0, 6);
    } else {
      this.filteredHotels = this.hotels.filter(h =>
        h.approved && h.location?.toLowerCase().includes(dest.toLowerCase())
      ).slice(0, 6);
    }
  }

  // SEARCH
  doSearch(): void {
    const params: any = {};
    if (this.searchDest && this.searchDest.trim()) {
      const term = this.searchDest.trim();
      params.location = term;

      // Save to recent searches - Case-insensitive deduplication
      const cleanTerm = term.replace(/\s+/g, ' ').trim();
      const normalized = cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1).toLowerCase();
      
      // Remove any existing instance of this term (case-insensitive)
      const otherSearches = this.recentSearches.filter(
        s => s.toLowerCase() !== normalized.toLowerCase()
      );
      
      // Add to front
      this.recentSearches = [normalized, ...otherSearches];
      
      if (this.recentSearches.length > 5) {
        this.recentSearches.pop();
      }
      
      localStorage.setItem('ss_recent_search', JSON.stringify(this.recentSearches));
      localStorage.setItem('ss_last_search', normalized);
      this.filteredRecentSearches = [...this.recentSearches];
    }

    this.router.navigate(
      ['/hotels'],
      { queryParams: params }
    );
  }

  hideRecentSearches(): void {
    setTimeout(() => {
      this.showRecentSearches = false;
      this.cdr.detectChanges();
    }, 200);
  }

  selectRecent(term: string): void {
    this.searchDest = term;
    this.showRecentSearches = false;
    // Sync suggestions to current input
    this.filterRecentSearches();
    this.cdr.detectChanges();
  }
  
  filterRecentSearches(): void {

    const value = this.searchDest
      .toLowerCase()
      .trim();

    // Empty হলে সব দেখাবে
    if (!value) {

      this.filteredRecentSearches = [
        ...this.recentSearches
      ];

      return;
    }

    // Match suggestion with extra safety deduplication
    const seen = new Set<string>();
    this.filteredRecentSearches = this.recentSearches
      .filter(term => {
        const lower = term.toLowerCase().trim();
        const matches = lower.includes(value);
        if (matches && !seen.has(lower)) {
          seen.add(lower);
          return true;
        }
        return false;
      });
  }


  // RATING STARS

  getStars(rating: number): string {

    return '★'.repeat(
      Math.floor(rating || 0)
    );
  }

  // WISHLIST

  toggleWish(
    event: Event,
    hotel: Hotel
  ): void {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(hotel);
    this.cdr.detectChanges();
  }

  inWish(id: string): boolean {
    return this.wishlistService.isInWishlist(id);
  }

  // BOOKING

  openBooking(hotel: Hotel): void {

    if (!this.auth.isLoggedIn()) {

      this.showLoginModal = true;

      return;
    }

    this.selectedHotel = hotel;

    this.showBookingModal = true;

    this.calcTotal();
  }

  calcTotal(): void {

    if (
      !this.selectedHotel ||
      !this.bkCheckin ||
      !this.bkCheckout
    ) {
      return;
    }

    this.bookingNights =
      this.bookingService.calcNights(
        this.bkCheckin,
        this.bkCheckout
      );

    this.bookingTotal =
      this.bookingNights *
      (this.selectedHotel.price || 0);
  }

  confirmBooking(): void {

    const user =
      this.auth.getLoggedUser();

    if (
      !user ||
      !this.selectedHotel
    ) {
      return;
    }

    const booking: Booking = {
      userId: String(user.id),
      ownerId: this.selectedHotel.ownerId ? String(this.selectedHotel.ownerId) : undefined,
      hotelId: String(this.selectedHotel.id),

      hotelName: this.selectedHotel.name,

      hotelLocation:
        this.selectedHotel.location,

      hotelEmoji:
        this.selectedHotel.emoji,
      roomId: '1', // Default room for quick booking from home
      roomType: 'Standard Room',

      checkIn: this.bkCheckin,

      checkOut: this.bkCheckout,

      nights: this.bookingNights,

      guests: parseInt(this.bkGuests) || 1,

      totalPrice: this.bookingTotal,

      status: 'Confirmed',
      paymentStatus: 'Unpaid',

      requests: this.bkRequests
    };

    this.bookingService
      .createBooking(booking)
      .subscribe(() => {

        this.showBookingModal = false;

        alert(
          `✅ Booking confirmed! Enjoy your stay at ${this.selectedHotel?.name}`
        );

      });
  }

  // LOGIN

  doLogin(): void {

    this.router.navigate(['/login']);
  }

  // REGISTER

  doRegister(): void {

    if (
      !this.regName ||
      !this.regEmail ||
      !this.regPass
    ) {

      this.regError =
        'Please fill all required fields.';

      return;
    }

    const user = {

      name: this.regName,

      email: this.regEmail,

      phone: this.regPhone,

      password: this.regPass,

      role: this.regRole as
        'customer' |
        'owner' |
        'admin'
    };

    this.auth
      .register(user)
      .subscribe((res: any) => {

        this.auth.saveUser(res);

        this.showRegisterModal = false;

        window.location.reload();

      });
  }

}