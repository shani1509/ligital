// ─── Database Model Types (matching Prisma schema) ──────

export type LibraryStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED';
export type UserRole = 'OWNER' | 'ADMIN';
export type SeatStatus = 'AVAILABLE' | 'OCCUPIED';
export type StudentStatus = 'ACTIVE' | 'EXPIRED' | 'LEFT';
export type PlatformPlanType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BillingStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

// ─── API Response Types ─────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ─── Dashboard Types ────────────────────────────────────

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  expiringSoon: number;
  expiredStudents: number;
  totalSeats: number;
  occupiedSeats: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface AlertItem {
  id: string;
  studentName: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  type: 'warning' | 'danger';
}

// ─── Entity Display Types ───────────────────────────────

export interface StudentWithSeat {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  aadharNumber: string | null;
  photoUrl: string | null;
  status: StudentStatus;
  joinDate: string;
  createdAt: string;
  seat: {
    id: string;
    seatNumber: number;
  } | null;
  subscriptions: {
    id: string;
    startDate: string;
    endDate: string;
    status: SubscriptionStatus;
    amountPaidPaise: number;
    plan: {
      id: string;
      name: string;
      durationDays: number;
    };
  }[];
}

export interface SeatWithStudent {
  id: string;
  seatNumber: number;
  status: SeatStatus;
  student: {
    id: string;
    name: string;
    phone: string;
    status: StudentStatus;
  } | null;
}

export interface PlanWithStats {
  id: string;
  name: string;
  durationDays: number;
  pricePaise: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    subscriptions: number;
  };
}

export interface SubscriptionDetail {
  id: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  amountPaidPaise: number;
  createdAt: string;
  student: {
    id: string;
    name: string;
    phone: string;
  };
  plan: {
    id: string;
    name: string;
    durationDays: number;
    pricePaise: number;
  };
}

export interface BillingInfo {
  id: string;
  planType: PlatformPlanType;
  amountPaise: number;
  startDate: string;
  endDate: string;
  status: BillingStatus;
  library: {
    status: LibraryStatus;
    trialEndsAt: string;
  };
}

// ─── User & Auth Types ──────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  library: {
    id: string;
    name: string;
    address: string;
    phone: string;
    maxCapacity: number;
    status: LibraryStatus;
    trialEndsAt: string;
    createdAt: string;
  };
}

// ─── Navigation Types ───────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
