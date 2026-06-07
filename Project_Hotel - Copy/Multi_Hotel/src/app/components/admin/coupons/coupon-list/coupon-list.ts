import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CouponService } from '../../../../services/coupon.service';
import { Coupon } from '../../../../model/coupon.model';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './coupon-list.html',
  styleUrl: './coupon-list.css'
})
export class CouponListComponent implements OnInit {
  coupons: Coupon[] = [];
  isSidebarOpen = false;

  constructor(private couponService: CouponService) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.couponService.getCoupons().subscribe(res => {
      this.coupons = res;
    });
  }

  deleteCoupon(id: string | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this coupon?')) return;
    this.couponService.deleteCoupon(id).subscribe(() => {
      this.loadCoupons();
    });
  }

  toggleStatus(coupon: Coupon): void {
    this.couponService.toggleCouponStatus(coupon).subscribe(() => {
      this.loadCoupons();
    });
  }
}
