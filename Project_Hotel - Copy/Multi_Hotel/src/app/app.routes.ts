import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CouponListComponent } from './components/admin/coupons/coupon-list/coupon-list';
import { AddCouponComponent } from './components/admin/coupons/add-coupon/add-coupon';
import { HomeComponent } from './shared/home/home';

// Auth
import { Login } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password';
import { ProfileComponent } from './components/auth/profile/profile';

// Admin
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users';
import { ManageHotelsComponent } from './components/admin/manage-hotels/manage-hotels';
import { ReportsComponent } from './components/admin/reports/reports';
import { CommissionComponent } from './components/admin/commission/commission';
import { AdminTransactionsComponent } from './components/admin/transactions/transactions';
import { AdminInvoicesComponent } from './components/admin/invoices/invoices';

// Hotel
import { HotelList } from './components/hotel/hotel-list/hotel-list';
import { HotelDetails } from './components/hotel/hotel-details/hotel-details';

// Deals
import { Deals } from './components/deals/deals';

// Customer
import { CustomerDashboard } from './components/customer/dashboard/dashboard';
import { Wishlist } from './components/customer/wishlist/wishlist';

// Owner
import { OwnerDashboard } from './components/owner/dashboard/dashboard';
import { MyHotels } from './components/owner/my-hotels/my-hotels';
import { Bookings } from './components/owner/bookings/bookings';
import { ManageRooms } from './components/owner/manage-rooms/manage-rooms';
import { BookingPayment } from './components/booking/payment/payment';
import { CreateBooking } from './components/booking/create-booking/create-booking';
import { BookingList } from './components/booking/booking-list/booking-list';
import { CheckinComponent } from './components/booking/checkin/checkin';
import { CheckoutComponent } from './components/booking/checkout/checkout';
import { EarningsComponent } from './components/owner/earnings/earnings';
import { InvoiceComponent } from './components/payment/invoice/invoice';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'hotels', component: HotelList },
  { path: 'hotel/:id', component: HotelDetails },
  { path: 'deals', component: Deals },
  // Auth routes
  { path: 'login', component: Login },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'profile', component: ProfileComponent },

  // Customer routes
  { path: 'customer/dashboard', component: CustomerDashboard },
  { path: 'customer/my-bookings', component: BookingList },
  { path: 'customer/wishlist', component: Wishlist },

  // Owner routes
  { path: 'owner/dashboard', component: OwnerDashboard },
  { path: 'owner/my-hotels', component: MyHotels },
  { path: 'owner/manage-rooms', component: ManageRooms },
  { path: 'owner/bookings', component: Bookings },

  // Booking routes
  { path: 'booking/create/:id', component: CreateBooking },
  { path: 'booking/checkout', component: BookingPayment },
  { path: 'customer/check-in', component: CheckinComponent },
  { path: 'customer/check-out', component: CheckoutComponent },
  // Earnings routes
  { path: 'owner/earnings', component: EarningsComponent },
  // Admin routes
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/manage-users', component: ManageUsersComponent },
  { path: 'admin/manage-hotels', component: ManageHotelsComponent },
  { path: 'admin/reports', component: ReportsComponent },
  { path: 'admin/commission', component: CommissionComponent },
  { path: 'admin/invoices', component: AdminInvoicesComponent },
// invoice

  {
    path: 'payment/invoice/:bookingId',
    component: InvoiceComponent
  },
  { path: 'admin/coupons', component: CouponListComponent },
  { path: 'admin/coupons/add', component: AddCouponComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }