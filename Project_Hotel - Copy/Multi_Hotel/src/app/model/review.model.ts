export interface Review {
  id?: number;
  hotelId: number | string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date?: string;
  verified?: boolean;
  bookingId?: string | number;
}