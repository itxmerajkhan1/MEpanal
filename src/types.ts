export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  createdAt: string;
  theme: 'light' | 'dark';
  role?: 'user' | 'admin';
}

export interface Order {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  serviceId: string;
  serviceName: string;
  platform: string;
  link: string;
  quantity: number;
  pricePer1000: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  platform: 'TikTok' | 'Instagram' | 'Facebook';
  description: string;
  pricePer1000: number;
  color: string;
}
