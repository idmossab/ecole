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

export interface Blog {
  idBlog?: number;
  title: string;
  content: string;
  status?: string;
  media?: string | null;
  commentCount?: number;
  likeCount?: number;
  createdAt?: string;
  updatedAt?: string | null;
  user?: UserResponse;
}

export interface Media {
  id?: number;
  url: string;
  mediaType?: string;
  createdAt?: string;
}

export interface Comment {
  id?: number;
  content: string;
  createdAt?: string;
  updatedAt?: string | null;
  user?: UserResponse;
}

export interface Like {
  id?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface LikeStatus {
  liked: boolean;
  likeCount: number;
}

export interface FollowCounts {
  following: number;
  followers: number;
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
}

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
