export interface UserResponse {
  userId: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface CertificateProgress {
  certificateId: number;
  totalVideos: number;
  watchedVideos: number;
  percentage: number;
  remainingVideos: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface CertificateClaimResponse {
  certificateId: number;
  message: string;
  claimedAt: string;
  serialNumber?: string | null;
}

export interface MyCertificateProgress {
  certificateId: number;
  title: string;
  totalVideos: number;
  watchedVideos: number;
  percentage: number;
  remainingVideos: number;
  isCompleted: boolean;
  isClaimed: boolean;
  status: 'In progress' | 'Completed' | 'Claimed' | string;
  firstCourseId?: number | null;
}

export interface DiplomaSummary {
  id: number;
  title: string;
  requiredCount: number;
  mode: DiplomasMode;
}

export type DiplomasMode = 'SPECIALIZED_TECHNICIAN' | 'TECHNICIAN' | 'QUALIFICATION';

export interface DiplomaCertificateStatus {
  certificateId: number;
  title: string;
  done: boolean;
}

export interface DiplomaProgress {
  diplomaId: number;
  title: string;
  requiredCount: number;
  completedCount: number;
  percentage: number;
  remainingCertificates: number;
  isCompleted: boolean;
  isClaimed: boolean;
  serialNumber?: string | null;
  claimedAt?: string | null;
  requiredCertificates: DiplomaCertificateStatus[];
}

export interface DiplomaClaimResponse {
  diplomaId: number;
  message: string;
  claimedAt: string;
  serialNumber?: string | null;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadNotificationCount {
  unreadCount: number;
}
