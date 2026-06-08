import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { HotelService } from '../../../services/hotel.service';
import { AuthService } from '../../../services/auth.service';
import { Room } from '../../../model/room.model';
import { Hotel } from '../../../model/hotel.model';
import { OwnerLayoutComponent } from '../../../shared/owner-layout/owner-layout';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, OwnerLayoutComponent],
  templateUrl: './manage-rooms.html',
  styleUrl: './manage-rooms.css',
})
export class ManageRooms implements OnInit {
  ownerName: string = '';
  rooms: Room[] = [];
  myHotels: Hotel[] = [];
  selectedHotelId: string = '';

  showModal = false;
  isEditing = false;

  currentRoom: Room = this.getEmptyRoom();
  newImageUrl: string = '';

  constructor(
    private roomService: RoomService,
    private hotelService: HotelService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const user = this.authService.getLoggedUser();
    if (user) {
      this.ownerName = user.name;
      this.hotelService.getHotelsByOwner(user.id!).subscribe(hotels => {
        this.myHotels = hotels;
        if (this.myHotels.length > 0) {
          this.selectedHotelId = this.myHotels[0].id?.toString() || '';
          this.loadRooms();
        }
        this.cdr.detectChanges();
      });
    }
  }

  loadRooms() {
    if (!this.selectedHotelId) return;
    this.roomService.getRoomsByHotel(this.selectedHotelId).subscribe(rooms => {
      this.rooms = rooms;
      this.cdr.detectChanges();
    });
  }

  getEmptyRoom(): Room {
    return {
      hotelId: this.selectedHotelId,
      roomType: 'Standard',
      price: 0,
      capacity: 2,
      totalRooms: 1,
      availableRooms: 1,
      description: '',
      amenities: [],
      images: []
    };
  }

  openAddModal() {
    this.isEditing = false;
    this.currentRoom = this.getEmptyRoom();
    this.currentRoom.hotelId = this.selectedHotelId;
    this.showModal = true;
  }

  openEditModal(room: Room) {
    this.isEditing = true;
    this.currentRoom = { ...room };
    this.showModal = true;
  }

  saveRoom() {
    if (this.currentRoom.price <= 0 || this.currentRoom.totalRooms <= 0 || this.currentRoom.capacity <= 0) {
      alert('Please enter valid positive values for price, capacity, and total rooms.');
      return;
    }

    if (!this.isEditing) {
      this.currentRoom.availableRooms = this.currentRoom.totalRooms;
    } else {
      if (this.currentRoom.availableRooms > this.currentRoom.totalRooms) {
        this.currentRoom.availableRooms = this.currentRoom.totalRooms;
      }
    }

    if (this.isEditing) {
      this.roomService.updateRoom(this.currentRoom).subscribe({
        next: () => {
          this.loadRooms();
          this.showModal = false;
        },
        error: (err) => {
          console.error('Error updating room:', err);
          alert('Failed to update room. See console for details.');
        }
      });
    } else {
      this.roomService.addRoom(this.currentRoom).subscribe({
        next: () => {
          this.loadRooms();
          this.showModal = false;
        },
        error: (err) => {
          console.error('Error adding room:', err);
          alert('Failed to add room. The image size might be too large, or there is a server error.');
        }
      });
    }
  }

  deleteRoom(id: string | undefined) {
    if (id && confirm('Are you sure you want to delete this room?')) {
      this.roomService.deleteRoom(id).subscribe(() => this.loadRooms());
    }
  }

  // 🔑 New: Handle local file upload and compress
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    this.currentRoom.images = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress heavily to prevent json-server "Payload Too Large" (100kb limit)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
            this.currentRoom.images.push(compressedBase64);
          } else {
            this.currentRoom.images.push(e.target.result);
          }
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  // 🔑 Optional: Upload to backend
  uploadImages(files: FileList) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    this.roomService.uploadRoomImages(formData).subscribe((res: any) => {
      console.log("Upload success", res);
    });
  }

  addImage() {
    if (this.newImageUrl) {
      this.currentRoom.images.push(this.newImageUrl);
      this.newImageUrl = '';
    }
  }

  removeImage(index: number) {
    this.currentRoom.images.splice(index, 1);
  }

  toggleAmenity(amenity: string) {
    const index = this.currentRoom.amenities.indexOf(amenity);
    if (index > -1) {
      this.currentRoom.amenities.splice(index, 1);
    } else {
      this.currentRoom.amenities.push(amenity);
    }
  }

  hasAmenity(amenity: string): boolean {
    return this.currentRoom.amenities.includes(amenity);
  }

  logout() {
    this.authService.logout();
  }
}
