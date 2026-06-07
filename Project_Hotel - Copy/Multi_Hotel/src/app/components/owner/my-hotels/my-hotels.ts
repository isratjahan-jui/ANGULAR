import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HotelService } from '../../../services/hotel.service';
import { AuthService } from '../../../services/auth.service';
import { Hotel } from '../../../model/hotel.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OwnerLayoutComponent } from '../../../shared/owner-layout/owner-layout';

@Component({
  selector: 'app-my-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OwnerLayoutComponent],
  templateUrl: './my-hotels.html',
  styleUrl: './my-hotels.css',
})
export class MyHotels implements OnInit {
  hotels: Hotel[] = [];
  owner: any;
  
  showAddModal = false;
  
  // New Hotel Form
  newHotel: Partial<Hotel> = {
    name: '',
    location: '',
    type: 'Standard',
    price: 0,
    description: '',
    facilities: ['Free WiFi', 'TV', 'AC'],
    rating: 4.0,
    emoji: '🏨',
    deal: false,
    approved: false
  };

  constructor(
    private hotelService: HotelService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.getLoggedUser();
    if (user) {
      this.owner = user;
      this.loadHotels();
    }
  }

  loadHotels(): void {
    if (this.owner && this.owner.id) {
      const ownerId = this.owner.id.toString();
      this.hotelService.getHotelsByOwner(ownerId).subscribe(h => {
        this.hotels = h;
        this.cdr.detectChanges();
      });
    }
  }

  addHotel(): void {
    if (!this.owner || !this.owner.id) return;
    const hotelToSave: Hotel = {
      ...(this.newHotel as Hotel),
      ownerId: this.owner.id.toString()
    };

    this.hotelService.addHotel(hotelToSave).subscribe(() => {
      alert('Hotel added successfully! It will be visible once approved by Admin.');
      this.showAddModal = false;
      this.loadHotels();
      // Reset form
      this.newHotel = { name: '', location: '', type: 'Standard', price: 0, description: '', facilities: ['Free WiFi', 'TV', 'AC'], rating: 4.0, emoji: '🏨', deal: false, approved: false };
    });
  }

  deleteHotel(id: string): void {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.hotelService.deleteHotel(id).subscribe(() => {
        this.loadHotels();
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
