export interface Coupon {
  id?: string;
  code: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  validUntil: string; // ISO Date string
  isActive: boolean;
}
