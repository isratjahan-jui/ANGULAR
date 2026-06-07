import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HotelService } from '../../../services/hotel.service';
import { AuthService } from '../../../services/auth.service';
import { Hotel } from '../../../model/hotel.model';

@Component({
  selector: 'app-add-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-hotel.html',
  styleUrls: ['./add-hotel.css']
})
export class AddHotelComponent {

  name = '';
  location = '';
  description = '';
  price = 0;
  type = 'Standard';
  facilitiesInput = '';
  videoUrl = '';
  error = '';
  loading = false;
  success = false;

  selectedImages: string[] = [];
  imageUrls: string[] = [];
  newImageUrl = '';
  mainImagePreview = '';

  locations = [
    'Dhaka', "Cox's Bazar", 'Sylhet',
    'Chittagong', 'Khulna', 'Rajshahi', 'Barisal'
  ];
  types = ['Standard', 'Deluxe', 'Suite', 'Presidential'];
  emojiMap: Record<string, string> = {
    'Dhaka': '🏙',
    "Cox's Bazar": '🌊',
    'Sylhet': '🍃',
    'Chittagong': '⚓',
    'Khulna': '🌿',
    'Rajshahi': '🌅',
    'Barisal': '🏡'
  };

  constructor(
    private hotelService: HotelService,
    private auth: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
    // ↑ শুধু FileReader async এর জন্য দরকার
  ) {}

  // ══════════════════════════════════════
   // ── File থেকে Image Select ──
  // IMAGE — File Upload
  // শুধু এখানেই CDR দরকার কারণ
  // FileReader একটা async browser API
  // Angular এর zone এর বাইরে কাজ করে
  // ══════════════════════════════════════
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    let processed = 0;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`"${file.name}" valid image নয়।`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" 5MB এর বেশি।`);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedImages.push(e.target.result);
        if (!this.mainImagePreview) {
          this.mainImagePreview = e.target.result;
        }
        processed++;
        if (processed === files.length) {
          // ─────────────────────────────────────
          // শুধু এক জায়গায় markForCheck() call
          // কারণ FileReader.onload Angular Zone
          // এর বাইরে run করে, তাই Angular
          // automatically detect করতে পারে না
          // ─────────────────────────────────────
          this.cdr.detectChanges();
        }
      };

      reader.onerror = () => {
        processed++;
        if (processed === files.length) {
          this.cdr.detectChanges();
          // ↑ error এও একবার — view জানাতে
        }
      };

      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  // ══════════════════════════════════════
  // IMAGE — URL Add
  // এখানে CDR দরকার নেই কারণ
  // এটা synchronous — Angular নিজেই
  // detect করতে পারে
  // ══════════════════════════════════════
  addImageUrl(): void {
    const url = this.newImageUrl.trim();
    if (!url) {
      this.error = 'Please enter an image URL.';
      return;
    }
    if (!url.startsWith('http')) {
      this.error = 'URL must start with http or https.';
      return;
    }
    this.imageUrls.push(url);
    if (!this.mainImagePreview) {
      this.mainImagePreview = url;
    }
    this.newImageUrl = '';
    this.error = '';
    // CDR নেই — synchronous বলে Angular নিজে detect করবে
  }

  // ══════════════════════════════════════
  // IMAGE — Remove
  // Synchronous — CDR দরকার নেই
  // ══════════════════════════════════════
  removeImage(index: number, type: 'file' | 'url'): void {
    if (type === 'file') {
      this.selectedImages.splice(index, 1);
    } else {
      this.imageUrls.splice(index, 1);
    }
    const all = this.allImages;
    this.mainImagePreview = all.length > 0 ? all[0] : '';
    // CDR নেই — synchronous
  }

  // ══════════════════════════════════════
  // IMAGE — Set Main
  // Synchronous — CDR দরকার নেই
  // ══════════════════════════════════════
  setMainImage(img: string): void {
    this.mainImagePreview = img;
    // CDR নেই — synchronous
  }

  get allImages(): string[] {
    return [...this.selectedImages, ...this.imageUrls];
  }

  // ══════════════════════════════════════
  // VIDEO
  // ══════════════════════════════════════
  getEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  isValidVideoUrl(): boolean {
    return this.videoUrl.includes('youtube.com') ||
           this.videoUrl.includes('youtu.be');
  }

  // ══════════════════════════════════════
  // SUBMIT
  // HTTP Observable — CDR দরকার নেই
  // কারণ HttpClient Angular Zone এর
  // ভেতরে থাকে, নিজেই detect করে
  // ══════════════════════════════════════
  submit(): void {
    this.error = '';

    if (!this.name.trim()) {
      this.error = 'Hotel name is required.'; return;
    }
    if (!this.location) {
      this.error = 'Please select a location.'; return;
    }
    if (!this.description.trim()) {
      this.error = 'Description is required.'; return;
    }
    if (!this.price || this.price <= 0) {
      this.error = 'Please enter a valid price.'; return;
    }

    this.loading = true;
    const user = this.auth.getLoggedUser();
    const facilities = this.facilitiesInput
      .split(',').map(f => f.trim()).filter(Boolean);

    const hotel: Hotel = {
      name: this.name.trim(),
      location: this.location,
      description: this.description.trim(),
      price: this.price,
      rating: 4.0,
      type: this.type,
      facilities: facilities.length ? facilities : ['WiFi'],
      image: this.mainImagePreview || '',
      images: this.allImages,
      videoUrl: this.videoUrl.trim() || '',
      emoji: this.emojiMap[this.location] || '🏨',
      approved: false,
      deal: false,
      ownerId: user?.id || '2'
    };

    this.hotelService.addHotel(hotel).subscribe(
      () => {
        this.loading = false;
        this.success = true;
        // CDR নেই — HttpClient Angular Zone এ আছে
        setTimeout(() => {
          this.router.navigate(['/owner/my-hotels']);
        }, 1800);
      },
      (err) => {
        this.loading = false;
        this.error = 'Failed to add hotel. Please try again.';
        // CDR নেই — synchronous property change
        console.error('Hotel add error:', err);
      }
    );
  }
}