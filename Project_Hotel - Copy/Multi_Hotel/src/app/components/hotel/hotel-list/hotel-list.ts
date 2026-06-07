import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { Hotel } from '../../../model/hotel.model';

import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './hotel-list.html',
  styleUrl: './hotel-list.css',
})
export class HotelList implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];

  // Filter models
  searchQuery = '';
  selectedLocation = '';
  maxPrice = 20000;
  minRating = 0;
  selectedFacilities: string[] = [];
  showOnlyDeals = false;

  locations = ['Dhaka', "Cox's Bazar", 'Sylhet', 'Chittagong', 'Khulna', 'Rajshahi', 'Barisal'];
  facilitiesList = ['WiFi', 'Pool', 'Gym', 'Spa', 'Parking', 'Restaurant'];

  constructor(
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private wishlistService: WishlistService
  ) { }

  toggleWishlist(event: Event, hotel: Hotel) {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(hotel);
    this.cdr.detectChanges();
  }

  isInWishlist(id: string | undefined): boolean {
    return this.wishlistService.isInWishlist(id);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] || '';
      this.selectedLocation = params['location'] || '';
      this.showOnlyDeals = params['deal'] === 'true';
      
      if (this.selectedLocation) {
        localStorage.setItem('ss_last_search', this.selectedLocation);
      }
      
      this.loadHotels();
    });
  }

  loadHotels() {
    this.hotelService.getHotels().subscribe(hotels => {
      this.hotels = hotels;
      this.applyFilters();
       this.cdr.detectChanges();
    });
  }

  applyFilters() {
    this.filteredHotels = this.hotels.filter(h => {
      const matchSearch = h.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchLocation = this.selectedLocation 
        ? h.location.toLowerCase() === this.selectedLocation.toLowerCase() 
        : true;
      const matchPrice = h.price <= this.maxPrice;
      const matchRating = h.rating >= this.minRating;
      const matchDeal = this.showOnlyDeals ? h.deal === true : true;
      const matchFacilities = this.selectedFacilities.length > 0
        ? this.selectedFacilities.every(f => (h.facilities || []).includes(f))
        : true;

      return matchSearch && matchLocation && matchPrice && matchRating && matchDeal && matchFacilities;
    });
  }

  toggleFacility(facility: string) {
    const index = this.selectedFacilities.indexOf(facility);
    if (index > -1) {
      this.selectedFacilities.splice(index, 1);
    } else {
      this.selectedFacilities.push(facility);
    }
    this.applyFilters();
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.floor(rating || 0));
  }
}
