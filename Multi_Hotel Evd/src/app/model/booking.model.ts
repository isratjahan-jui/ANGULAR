export interface Booking {
  id?: string;
  userId: string;
  ownerId?: string;
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  hotelEmoji?: string;
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checkedIn' | 'checkedOut';
  requests?: string;
  paymentStatus: 'Unpaid' | 'Paid';
  paymentMethod?: string;
  cancellationReason?: string;
  createdAt?: string;
  extraCharges?: {
    item: string;
    amount: number;
  }[];
}