export interface Room {
  id?: string;
  hotelId: string;
  roomType: string;
  price: number;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
  description: string;
  amenities: string[];
  images: string[];
  availabilityDates?: string[];
}