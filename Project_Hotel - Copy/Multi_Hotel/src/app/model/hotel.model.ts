

export interface Hotel {
  id?: string;
  name: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  type: string;
  facilities: string[];
  image?: string;        // ← single main image URL
  images?: string[];     // ← multiple images array
  videoUrl?: string;     // ← YouTube/video URL
  emoji?: string;
  approved: boolean;
  status?: string;
  deal: boolean;
  ownerId: string;
}