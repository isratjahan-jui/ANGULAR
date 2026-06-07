
export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'admin' | 'owner' | 'customer';
  createdAt?: string;
  image?: string;
}