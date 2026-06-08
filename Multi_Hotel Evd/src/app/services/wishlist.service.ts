import { Injectable } from '@angular/core';
import { Hotel } from '../model/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private storageKey = 'wishlist';

  constructor() {}

  getWishlist(): Hotel[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  toggleWishlist(hotel: Hotel): void {
    let list = this.getWishlist();
    const index = list.findIndex(h => h.id === hotel.id);
    
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(hotel);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  isInWishlist(id: string | undefined): boolean {
    if (!id) return false;
    const list = this.getWishlist();
    return list.some(h => h.id === id);
  }

  removeFromWishlist(id: string | undefined): void {
    if (!id) return;
    let list = this.getWishlist();
    list = list.filter(h => h.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }
}
