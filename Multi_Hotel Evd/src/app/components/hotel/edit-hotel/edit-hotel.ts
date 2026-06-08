import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { Hotel } from '../../../model/hotel.model';

@Component({
  selector: 'app-edit-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-hotel.html',
  styleUrls: ['./edit-hotel.css']
})
export class EditHotelComponent implements OnInit {

  hotel: Hotel | null = null;
  facilitiesInput = '';
  error = '';
  loading = false;
  success = false;

  locations = ['Dhaka', "Cox's Bazar", 'Sylhet', 'Chittagong', 'Khulna', 'Rajshahi'];
  types = ['Standard', 'Deluxe', 'Suite', 'Presidential'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.hotelService.getHotelById(Number(id)).subscribe((h: Hotel) => {
        this.hotel = h;
        this.facilitiesInput = h.facilities.join(', ');
      });
    }
  }

  update(): void {
    if (!this.hotel) return;
    if (!this.hotel.name || !this.hotel.location || !this.hotel.price) {
      this.error = 'Please fill all required fields.';
      return;
    }
    this.loading = true;
    this.hotel.facilities = this.facilitiesInput
      .split(',').map(f => f.trim()).filter(Boolean);

    this.hotelService.updateHotel(this.hotel).subscribe(() => {
      this.loading = false;
      this.success = true;
      setTimeout(() => this.router.navigate(['/owner/my-hotels']), 1500);
    }, () => {
      this.loading = false;
      this.error = 'Update failed. Try again.';
    });
  }
}