import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Hotel } from '../../../model/hotel.model';
import { AuthService } from '../../../services/auth.service';
import { CustomerLayoutComponent } from '../../../shared/customer-layout/customer-layout';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerLayoutComponent],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  wishlist: Hotel[] = [];
  user: any;

  constructor(
    private auth: AuthService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getLoggedUser();
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.wishlist = this.wishlistService.getWishlist();
  }

  removeFromWishlist(id: string | undefined): void {
    this.wishlistService.removeFromWishlist(id);
    this.loadWishlist();
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.floor(rating || 0));
  }
}
