import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Hotel } from '../../../model/hotel.model';
import { HotelService } from '../../../services/hotel.service';

@Component({
  selector: 'app-manage-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-hotels.html',
  styleUrls: ['./manage-hotels.css']
})
export class ManageHotelsComponent implements OnInit {

  hotels: Hotel[] = [];
  search = '';

  constructor(private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadHotels();

  }

  loadHotels(): void {
    this.hotelService.getHotels().subscribe({
      next: (h) => {
        this.hotels = h || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading hotels', err)
    });
  }


  get filtered(): Hotel[] {
    const s = this.search.toLowerCase().trim();
    if (!s) return this.hotels;
    return this.hotels.filter(h =>
      h.name.toLowerCase().includes(s) ||
      h.location.toLowerCase().includes(s)
    );
  }

  approveHotel(id: string | undefined): void {
    if (!id) return;
    this.hotelService.approveHotel(id).subscribe(() => {
      alert(`Hotel has been approved!`);
      this.loadHotels();
    });
  }

  rejectHotel(id: string | undefined): void {
    if (!id) return;
    this.hotelService.rejectHotel(id).subscribe(() => {
      alert(`Hotel has been rejected!`);
      this.loadHotels();
    });
  }

  deleteHotel(id: string | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this hotel?')) return;
    this.hotelService.deleteHotel(id).subscribe(() => {
      this.hotels = this.hotels.filter(h => h.id !== id);
    });
  }
}