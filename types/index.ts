export interface Hotel {
  _id: string,
  email: string,
  password: string,
  title: string;
  description: string;
  address: string;
  locationUrl: string;
  amenities: string[];
  image: string;
  key: string;
  likes: number;
  roomsAvailable: number;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  createdAt: Date
}

export interface Owner {
  _id: string,
  email: string,
  password: string
}

export interface Temple {
  _id: string;
  name: string;
  description: string;
  location: string;
  locationUrl: string;
  image: string;
  tags: string[],
  createdAt: Date,
  key: string
}

export interface News {
  _id: string;
  title: string;
  content: string;
  date: Date;
  category: string;
  image: string;
  tags: string[];
  status: 'Published' | 'Archived';
  createdAt: Date,
  isBreakingNews: boolean;
  clicks: number;
  key: string
}

export interface Query {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded';
  createdAt: Date;
}

export interface NewsFormDataType {
  title: string;
  content: string;
  category: string;
  status: string;
  date: Date;
  tags: string[];
  image: string;
  videoUrl: string
}

export interface TempleFormDataType {
  name: string;
  description: string;
  location: string,
  locationUrl: string,
  image: string,
  tags: string[]
}

export interface HotelFormDataType {
  email: string,
  password: string,
  title: string;
  description: string;
  address: string;
  locationUrl: string;
  amenities: string[];
  image: string;
  likes: number;
  roomsAvailable: number;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
}

export interface OwnerFormDataType {
  email: string,
  password: string
}

export interface Advertisement {
  _id: string;
  title: string;
  image: string;
  url: string;
  key: string;
  status: 'Archived'|'Published';
  expiry: Date;
  duration: Number;
  createdAt: Date
}

export interface AdvertisementFormDataType {
  title: string;
  image: string;
  url: string;
  key: string;
  status: 'Archived'|'Published';
  duration: number;
  expiry: Date
}