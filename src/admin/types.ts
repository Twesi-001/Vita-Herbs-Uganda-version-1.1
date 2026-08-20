/** Domain types shared across the admin pages. */

export interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  product: string;
  quantity: string;
  message: string | null;
  status: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  price: number | null;
  category: string | null;
  active: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  name: string;
  rating: number | null;
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  status: string;
  created_at: string;
}

export interface Video {
  id: number;
  title: string;
  description: string | null;
  category: 'company' | 'product';
  video_url: string;
  active: boolean;
  created_at: string;
}

export interface Stats {
  subscribers: number;
  contacts: number;
  products: number;
  reviews: number;
  videos: number;
}
