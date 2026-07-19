// ============================================================
// Shared TypeScript interfaces for SkillSphere
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  avatar?: string;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface Milestone {
  title: string;
  description?: string;
  amount: number;
  completed: boolean;
}

export interface Gig {
  _id: string;
  client: ClientProfile | string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: number;
  deadline?: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Expert';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  attachments?: string[];
  milestones?: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  _id: string;
  user: User | string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  experience: number;
  availability: 'Available' | 'Busy' | 'Offline';
  languages: string[];
  resume?: string;
  profileCompleted: boolean;
  averageRating: number;
  totalReviews: number;
  portfolio: PortfolioItem[];
  certifications: Certification[];
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

export interface PortfolioItem {
  title: string;
  description?: string;
  projectUrl?: string;
  image?: string;
}

export interface Certification {
  name: string;
  organization: string;
  issueDate?: string;
}

export interface ClientProfile {
  _id: string;
  user: User | string;
  company?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface Proposal {
  _id: string;
  gig: Gig | string;
  freelancer: FreelancerProfile | string;
  coverLetter: string;
  bidAmount: number;
  estimatedDays: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn' | 'Completed' | 'Approved';
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User | string;
  message: string;
  attachments?: string[];
  seen: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  client: User;
  freelancer: User;
  gig?: Gig;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  _id: string;
  client: ClientProfile | string;
  freelancer: FreelancerProfile | string;
  gig: Gig | string;
  proposal: string;
  amount: number;
  /** 10% platform commission */
  platformFee: number;
  /** amount minus platformFee — what the freelancer receives */
  freelancerAmount: number;
  currency: string;
  paymentMethod: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Released';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  reviewer: User | string;
  freelancer: string;
  gig: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminDashboard {
  users: number;
  clients: number;
  freelancers: number;
  gigs: number;
  payments: number;
  reviews: number;
  revenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedGigs {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  gigs: Gig[];
}
