import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CouponService } from '../../../../services/coupon.service';
import { Coupon } from '../../../../model/coupon.model';

@Component({
  selector: 'app-add-coupon',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-coupon.html',
  styleUrl: './add-coupon.css'
})
export class AddCouponComponent {
  coupon: Coupon = {
    code: '',
    discountAmount: 0,
    discountType: 'percentage',
    validUntil: '',
    isActive: true
  };
  loading = false;
  error = '';
  isSidebarOpen = false;

  constructor(private couponService: CouponService, private router: Router) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  save(): void {
    if (!this.coupon.code || this.coupon.discountAmount <= 0 || !this.coupon.validUntil) {
      this.error = 'Please fill out all required fields properly.';
      return;
    }
    this.loading = true;
    this.couponService.addCoupon(this.coupon).subscribe({
      next: () => {
        this.router.navigate(['/admin/coupons']);
      },
      error: () => {
        this.error = 'Failed to create coupon.';
        this.loading = false;
      }
    });
  }
}
