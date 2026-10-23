export type UserRole = 'admin' | 'technician' | 'user';

export type TicketCategory =
  | 'computer_laptop'
  | 'printer'
  | 'network_internet'
  | 'software'
  | 'email_account'
  | 'other_equipment';

export type TicketPriority = 'low' | 'normal' | 'high' | 'critical';

export type TicketStatus =
  | 'new'
  | 'accepted'
  | 'in_progress'
  | 'waiting_user'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export type AssetStatus = 'active' | 'in_repair' | 'retired' | 'reserved';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash?: string;
  fullName: string;
  role: UserRole;
  departmentId?: number | null;
  departmentName?: string;
  phone?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  departmentId?: number | null;
  departmentName?: string;
  phone?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Asset {
  id: number;
  assetNumber: string;
  name: string;
  category: TicketCategory;
  brandModel?: string;
  serialNumber?: string;
  departmentId?: number | null;
  departmentName?: string;
  assignedUserId?: number | null;
  assignedUserName?: string;
  status: AssetStatus;
  purchaseDate?: string;
  warrantyExpire?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketAttachment {
  id: number;
  ticketId: number;
  uploaderId: number;
  uploaderName?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  createdAt: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  isInternal: boolean;
  comment: string;
  createdAt: string;
}

export interface TicketStatusHistory {
  id: number;
  ticketId: number;
  changedByUserId: number;
  changedByName: string;
  fromStatus?: TicketStatus | null;
  toStatus: TicketStatus;
  notes?: string;
  createdAt: string;
}

export interface TicketFeedback {
  id: number;
  ticketId: number;
  userId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  requesterId: number;
  requesterName?: string;
  requesterEmail?: string;
  requesterRole?: UserRole;
  departmentId?: number | null;
  departmentName?: string;
  assetId?: number | null;
  assetNumber?: string;
  assetName?: string;
  assetNumberCustom?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  description: string;
  location: string;
  contactPhone: string;
  assignedTechnicianId?: number | null;
  assignedTechnicianName?: string;
  diagnosis?: string;
  repairActions?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  attachments?: TicketAttachment[];
  comments?: TicketComment[];
  history?: TicketStatusHistory[];
  feedback?: TicketFeedback | null;
}

export interface AuditLog {
  id: number;
  userId?: number | null;
  userName?: string;
  userRole?: string;
  action: string;
  targetType: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTickets: number;
  newTickets: number;
  inProgressTickets: number;
  waitingUserTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  overdueTickets: number;
  averageResolutionHours: number;
  criticalPending: number;
  categoryBreakdown: { category: TicketCategory; count: number }[];
  statusBreakdown: { status: TicketStatus; count: number }[];
  priorityBreakdown: { priority: TicketPriority; count: number }[];
  departmentBreakdown: { departmentName: string; count: number }[];
  technicianWorkload: { technicianName: string; activeCount: number; resolvedCount: number }[];
}
