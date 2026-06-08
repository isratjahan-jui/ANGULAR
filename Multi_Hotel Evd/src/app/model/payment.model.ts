export interface Payment {
  id?: number | string;
  bookingId: string | number;
  userId: string | number;
  hotelName: string;
  hotelLocation: string;
  hotelEmoji?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomType: string;
  pricePerNight: number;
  grossAmount: number;
  taxAmount: number;
  totalAmount: number;
  method: string;
  status: 'paid' | 'unpaid' | 'refunded';
  invoiceNo: string;
  transactionId?: string;
  date: string;
}