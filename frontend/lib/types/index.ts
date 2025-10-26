// User Types
export enum UserRole {
  FARMER = 'FARMER',
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  ADMIN = 'ADMIN',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  MICROSOFT = 'MICROSOFT',
}

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  state?: string | null;
  lga?: string | null;
  role: UserRole;
  provider: AuthProvider;
  isVerified: boolean;
  profileImage?: string | null;
  createdAt: string;
  lastLogin?: string | null;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  state: string;
  lga: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  parentId?: string | null;
  createdAt: string;
  subcategories?: Category[];
  _count?: {
    equipment: number;
  };
}

// Equipment Types
export enum EquipmentCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export interface Equipment {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  categoryId: string;
  pricePerDay: number;
  currency: string;
  condition: EquipmentCondition;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry: string;
  latitude?: number | null;
  longitude?: number | null;
  isAvailable: boolean;
  images?: string[] | null;
  specifications?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  owner?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
  };
  _count?: {
    reviews: number;
    bookings: number;
  };
}

export interface CreateEquipmentData {
  name: string;
  description?: string;
  categoryId: string;
  pricePerDay: number;
  currency?: string;
  condition?: EquipmentCondition;
  locationAddress?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  specifications?: Record<string, any>;
}

export interface EquipmentFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  locationState?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: EquipmentCondition;
  isAvailable?: boolean;
  search?: string;
  tags?: string;
  ownerId?: string;
}

// Booking Types
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export interface Booking {
  id: string;
  equipmentId: string;
  farmerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  equipment?: Equipment;
  farmer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
  };
  review?: Review | null;
}

export interface CreateBookingData {
  equipmentId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

// Group Booking Types
export enum GroupBookingStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface GroupParticipant {
  id: string;
  groupBookingId: string;
  farmerId: string;
  shareAmount: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  joinedAt: string;
  paidAt?: string | null;
  notes?: string | null;
  farmer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
  };
}

export interface GroupBooking {
  id: string;
  equipmentId: string;
  initiatorId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  minParticipants: number;
  maxParticipants: number;
  status: GroupBookingStatus;
  isPublic: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  equipment?: Equipment;
  initiator?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phoneNumber?: string | null;
  };
  participants?: GroupParticipant[];
}

export interface CreateGroupBookingData {
  equipmentId: string;
  startDate: string;
  endDate: string;
  minParticipants: number;
  maxParticipants: number;
  isPublic?: boolean;
  expiresAt?: string;
  notes?: string;
}

export interface JoinGroupBookingData {
  notes?: string;
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  equipmentId: string;
  reviewerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
  };
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  status: 'error';
  message: string;
  errors?: string[];
}

// Nigerian States (for location dropdown)
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
] as const;

export type NigerianState = typeof NIGERIAN_STATES[number];
