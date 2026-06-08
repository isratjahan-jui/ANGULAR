export interface Transaction {
  id?: number | string;
  bookingId: string | number;
  hotelId: string | number;
  ownerId: string | number;
  totalAmount: number;
  platformCommission: number;
  ownerEarnings: number;
  paymentMethod: string;
  transactionId: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Refunded';
  createdAt: string;
}

export interface Invoice {
  id?: number | string;
  bookingId: string | number;
  transactionId: string;
  invoiceNumber: string;
  customerName: string;
  hotelName: string;
  hotelLocation?: string;
  hotelEmoji?: string;
  roomType: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: string;
  pricePerNight?: number;
  amount: number;
  tax: number;
  total: number;
  issuedAt: string;
  status?: 'paid' | 'unpaid' | 'refunded';
}