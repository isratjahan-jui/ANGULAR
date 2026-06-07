import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../services/auth.service';
import { Review } from '../../../model/review.model';
import { Booking } from '../../../model/booking.model';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css'
})
export class AddReviewComponent implements OnInit {
  @Input() hotelId!: string | number;
  @Output() reviewAdded = new EventEmitter<Review>();

  newReview: Partial<Review> = {
    rating: 5,
    comment: ''
  };

  canReview = false;
  hasReviewed = false;
  bookingInfo: Booking | null = null;
  loading = true;
  submitting = false;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkReviewEligibility();
  }

  checkReviewEligibility(): void {
    const user = this.authService.getLoggedUser();
    if (!user || !user.id) {
      this.loading = false;
      return;
    }

    this.reviewService.checkIfBooked(user.id, this.hotelId).subscribe((booking: Booking | null) => {
      if (booking) {
        this.canReview = true;
        this.bookingInfo = booking;
      }
      this.loading = false;
    });
  }

  submitReview(): void {
    if (!this.canReview || !this.newReview.comment || !this.bookingInfo) return;

    this.submitting = true;
    const user = this.authService.getLoggedUser();
    
    if (!user || !user.id) {
      this.submitting = false;
      return;
    }

    const reviewToSubmit: Review = {
      hotelId: this.hotelId,
      userId: Number(user.id),
      userName: user.name || 'Guest',
      rating: Number(this.newReview.rating) || 5,
      comment: this.newReview.comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      bookingId: this.bookingInfo.id
    };

    this.reviewService.addReview(reviewToSubmit).subscribe({
      next: (res: Review) => {
        this.submitting = false;
        this.hasReviewed = true;
        this.reviewAdded.emit(res);
        this.newReview = { rating: 5, comment: '' };
      },
      error: () => {
        this.submitting = false;
        alert('Failed to submit review.');
      }
    });
  }
}
