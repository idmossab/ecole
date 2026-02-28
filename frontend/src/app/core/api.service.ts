import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  AuthResponse,
  CertificateClaimResponse,
  CertificateProgress,
  DiplomaCertificateStatus,
  DiplomaClaimResponse,
  DiplomasMode,
  DiplomaProgress,
  DiplomaSummary,
  SpecializationSummary,
  MyCertificateProgress,
  JoinRequestStatus,
  NotificationItem,
  UnreadNotificationCount,
  UserResponse
} from './models';
import { Certificate, Course } from './certificates.data';

export type AdminCertificate = {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCourse = {
  id: number;
  certificateId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  mode: 'ONLINE' | 'ONSITE' | 'IN_PERSON' | 'HYBRID';
  teacherName?: string | null;
  teacherBio?: string | null;
  durationText?: string | null;
  phoneContact?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminStats = {
  totalStudents: number;
  totalCourses: number;
  totalCertificates: number;
  totalDiplomas: number;
};

export type AdminDiploma = {
  id: number;
  title: string;
  imageUrl?: string | null;
  mode: DiplomasMode;
  requiredCount: number;
};

export type AdminSpecialization = {
  id: number;
  title: string;
  description?: string | null;
  programOverview?: string | null;
  durationText?: string | null;
  certificateAwarded?: string | null;
  entryRequirements?: string | null;
  programFeatures?: string | null;
  diplomaId: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminJoinRequest = {
  id: number;
  requestType: 'CERTIFICATE' | 'DIPLOMA';
  userId: number;
  studentUserName?: string | null;
  studentEmail?: string | null;
  certificateId?: number | null;
  certificateTitle?: string | null;
  courseId?: number | null;
  courseTitle?: string | null;
  diplomaId?: number | null;
  diplomaTitle?: string | null;
  specializationId?: number | null;
  specializationTitle?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
};

export type IssueStudentSearchItem = {
  userId: number;
  name: string;
  userName: string;
  email: string;
};

export type IssueIssuedStudent = {
  userId: number;
  name: string;
  userName: string;
  email: string;
  status?: 'ACTIVE' | 'BANNED' | 'DELETED' | string;
  issuedCertificates: number;
  issuedDiplomas: number;
  latestIssuedId?: number | null;
  lastIssueDate: string;
};

export type IssueStudentInfo = {
  userId: number;
  name: string;
  userName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
};

export type IssueCertificateOption = {
  certificateId: number;
  title: string;
  accepted: boolean;
  completed: boolean;
  eligible: boolean;
  alreadyIssued: boolean;
  courses: string[];
};

export type IssueDiplomaOption = {
  diplomaId: number;
  title: string;
  accepted: boolean;
  completed: boolean;
  eligible: boolean;
  alreadyIssued: boolean;
  specializations: string[];
  summaryCourses: string[];
};

export type IssueRecentItem = {
  id: number;
  title: string;
  studentName: string;
  serialNumber: string;
  issueDate: string;
  type: string;
};

export type IssueStudentContext = {
  student: IssueStudentInfo;
  certificates: IssueCertificateOption[];
  diplomas: IssueDiplomaOption[];
  recentlyIssued: IssueRecentItem[];
};

export type IssueGenerateResponse = {
  issuedId: number;
  serialNumber: string;
  issueDate: string;
  qrPreview: string;
  qrImageUrl: string;
  documentUrl: string;
};

export type IssuedCredentialVerify = {
  verified: boolean;
  statusMessage: string;
  serialNumber: string;
  type: 'CERTIFICATE' | 'DIPLOMA' | string;
  title: string;
  issueDate: string;
  userId: number;
  fullName: string;
  userName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
};

export type IssueStats = {
  activeCertificates: number;
  activeDiplomas: number;
  issuedDiplomas: number;
  issuedCertificates: number;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  register(payload: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
  }) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/register`, payload);
  }

  login(payload: { emailOrUsername: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/login`, payload);
  }

  getUsers() {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/users`);
  }

  getAdminUsers() {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/api/admin/users`);
  }

  getMe() {
    return this.http.get<UserResponse>(`${this.baseUrl}/api/users/me`);
  }

  getUserById(userId: number) {
    return this.http.get<UserResponse>(`${this.baseUrl}/users/${userId}`);
  }

  updateUser(userId: number, payload: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
  }) {
    return this.http.put<UserResponse>(`${this.baseUrl}/users/${userId}`, payload);
  }

  deleteUser(userId: number) {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}`);
  }

  adminChangeUserRole(userId: number, role: 'ADMIN' | 'USER') {
    return this.http.put<UserResponse>(`${this.baseUrl}/api/admin/users/${userId}/role`, { role });
  }

  adminToggleUserStatus(userId: number) {
    return this.http.post<UserResponse>(`${this.baseUrl}/api/admin/users/${userId}/toggle-status`, {});
  }

  adminDeleteUser(userId: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/users/${userId}`);
  }

  getNotifications() {
    return this.http.get<NotificationItem[]>(`${this.baseUrl}/api/notifications`);
  }

  getUnreadNotificationCount() {
    return this.http.get<UnreadNotificationCount>(`${this.baseUrl}/api/notifications/unread-count`);
  }

  markNotificationRead(id: number) {
    return this.http.post<NotificationItem>(`${this.baseUrl}/api/notifications/${id}/read`, {});
  }

  // PUBLIC CERTIFICATES
  getCertificates() {
    return this.http.get<Certificate[]>(`${this.baseUrl}/certificates`);
  }

  getDiplomas() {
    return this.http.get<DiplomaSummary[]>(`${this.baseUrl}/diplomas`);
  }

  getDiplomaById(id: number) {
    return this.http.get<DiplomaSummary>(`${this.baseUrl}/diplomas/${id}`);
  }

  getDiplomaCertificates(id: number) {
    return this.http.get<DiplomaCertificateStatus[]>(`${this.baseUrl}/diplomas/${id}/certificates`);
  }

  getDiplomaSpecializations(id: number) {
    return this.http.get<SpecializationSummary[]>(`${this.baseUrl}/diplomas/${id}/specializations`);
  }

  getCertificateById(id: number) {
    return this.http.get<Certificate>(`${this.baseUrl}/certificates/${id}`);
  }

  getCertificateCourses(id: number) {
    return this.http.get<Course[]>(`${this.baseUrl}/certificates/${id}/courses`);
  }

  getCourseById(courseId: number) {
    return this.http.get<Course>(`${this.baseUrl}/courses/${courseId}`);
  }

  getCertificateProgress(certificateId: number) {
    return this.http.get<CertificateProgress>(`${this.baseUrl}/api/certificates/${certificateId}/progress`);
  }

  markVideoWatched(videoId: number, watched = true) {
    return this.http.post<CertificateProgress>(`${this.baseUrl}/api/videos/${videoId}/watched`, { watched });
  }

  claimCertificate(certificateId: number) {
    return this.http.post<CertificateClaimResponse>(`${this.baseUrl}/api/certificates/${certificateId}/claim`, {});
  }

  getMyCertificatesProgress() {
    return this.http.get<MyCertificateProgress[]>(`${this.baseUrl}/api/certificates/my-progress`);
  }

  getDiplomasProgress() {
    return this.http.get<DiplomaProgress[]>(`${this.baseUrl}/api/diplomas/progress`);
  }

  getDiplomaProgress(diplomaId: number) {
    return this.http.get<DiplomaProgress>(`${this.baseUrl}/api/diplomas/${diplomaId}/progress`);
  }

  claimDiploma(diplomaId: number) {
    return this.http.post<DiplomaClaimResponse>(`${this.baseUrl}/api/diplomas/${diplomaId}/claim`, {});
  }

  // ADMIN
  getAdminStats() {
    return this.http.get<AdminStats>(`${this.baseUrl}/api/admin/stats`);
  }

  getAdminCertificates() {
    return this.http.get<AdminCertificate[]>(`${this.baseUrl}/api/admin/certificates`);
  }

  getAdminCourses(certificateId: number) {
    return this.http.get<AdminCourse[]>(`${this.baseUrl}/api/admin/certificates/${certificateId}/courses`);
  }

  getAdminDiplomas() {
    return this.http.get<AdminDiploma[]>(`${this.baseUrl}/api/admin/diplomas`);
  }

  createAdminDiploma(payload: { title: string; imageUrl: string; mode: DiplomasMode }) {
    return this.http.post<AdminDiploma>(`${this.baseUrl}/api/admin/diplomas`, payload);
  }

  updateAdminDiploma(id: number, payload: { title: string; imageUrl: string; mode: DiplomasMode }) {
    return this.http.put<AdminDiploma>(`${this.baseUrl}/api/admin/diplomas/${id}`, payload);
  }

  deleteAdminDiploma(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/diplomas/${id}`);
  }

  createCertificate(payload: { title: string; description: string; imageUrl: string }) {
    return this.http.post<AdminCertificate>(`${this.baseUrl}/api/admin/certificates`, payload);
  }

  updateCertificate(id: number, payload: { title: string; description: string; imageUrl: string }) {
    return this.http.put<AdminCertificate>(`${this.baseUrl}/api/admin/certificates/${id}`, payload);
  }

  deleteCertificate(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/certificates/${id}`);
  }

  createCourse(certificateId: number, payload: {
    title: string;
    description: string;
    mode: 'ONLINE' | 'ONSITE' | 'IN_PERSON' | 'HYBRID';
    teacherName: string;
    teacherBio: string;
    durationText: string;
    phoneContact: string;
  }) {
    return this.http.post<AdminCourse>(`${this.baseUrl}/api/admin/certificates/${certificateId}/courses`, payload);
  }

  updateCourse(courseId: number, payload: {
    title: string;
    description: string;
    mode: 'ONLINE' | 'ONSITE' | 'IN_PERSON' | 'HYBRID';
    teacherName: string;
    teacherBio: string;
    durationText: string;
    phoneContact: string;
  }) {
    return this.http.put<AdminCourse>(`${this.baseUrl}/api/admin/courses/${courseId}`, payload);
  }

  deleteCourse(courseId: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/courses/${courseId}`);
  }

  getAdminSpecializations(diplomaId: number) {
    return this.http.get<AdminSpecialization[]>(`${this.baseUrl}/api/admin/diplomas/${diplomaId}/specializations`);
  }

  getAdminJoinRequests() {
    return this.http.get<AdminJoinRequest[]>(`${this.baseUrl}/api/admin/join-requests`);
  }

  acceptAdminJoinRequest(requestId: number) {
    return this.http.post<AdminJoinRequest>(`${this.baseUrl}/api/admin/join-requests/${requestId}/accept`, {});
  }

  rejectAdminJoinRequest(requestId: number) {
    return this.http.post<AdminJoinRequest>(`${this.baseUrl}/api/admin/join-requests/${requestId}/reject`, {});
  }

  acceptAdminDiplomaJoinRequest(requestId: number) {
    return this.http.post<AdminJoinRequest>(`${this.baseUrl}/api/admin/diploma-join-requests/${requestId}/accept`, {});
  }

  rejectAdminDiplomaJoinRequest(requestId: number) {
    return this.http.post<AdminJoinRequest>(`${this.baseUrl}/api/admin/diploma-join-requests/${requestId}/reject`, {});
  }

  createSpecialization(diplomaId: number, payload: {
    title: string;
    description: string;
    programOverview: string;
    durationText: string;
    certificateAwarded: string;
    entryRequirements: string;
    programFeatures: string;
  }) {
    return this.http.post<AdminSpecialization>(`${this.baseUrl}/api/admin/diplomas/${diplomaId}/specializations`, payload);
  }

  updateSpecialization(specializationId: number, payload: {
    title: string;
    description: string;
    programOverview: string;
    durationText: string;
    certificateAwarded: string;
    entryRequirements: string;
    programFeatures: string;
  }) {
    return this.http.put<AdminSpecialization>(`${this.baseUrl}/api/admin/specializations/${specializationId}`, payload);
  }

  deleteSpecialization(specializationId: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/specializations/${specializationId}`);
  }

  uploadAdminImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/api/admin/uploads/image`, formData);
  }

  createCertificateJoinRequest(certificateId: number, payload?: { courseId?: number | null }) {
    return this.http.post<AdminJoinRequest>(`${this.baseUrl}/api/certificates/${certificateId}/join-requests`, payload || {});
  }

  getMyCertificateJoinRequestStatus(certificateId: number) {
    return this.http.get<JoinRequestStatus | null>(`${this.baseUrl}/api/certificates/${certificateId}/join-requests/me`);
  }

  createDiplomaJoinRequest(diplomaId: number, payload: { specializationId: number }) {
    return this.http.post<AdminJoinRequest>(`${this.baseUrl}/api/diplomas/${diplomaId}/join-requests`, payload);
  }

  getMyDiplomaJoinRequestStatus(diplomaId: number) {
    return this.http.get<JoinRequestStatus | null>(`${this.baseUrl}/api/diplomas/${diplomaId}/join-requests/me`);
  }

  searchIssueStudents(query: string) {
    return this.http.get<IssueStudentSearchItem[]>(`${this.baseUrl}/api/admin/issue/students/search`, {
      params: { q: query }
    });
  }

  getIssueStudentsWithIssued() {
    return this.http.get<IssueIssuedStudent[]>(`${this.baseUrl}/api/admin/issue/students/with-issued`);
  }

  deleteIssuedCredential(issuedId: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/issue/issued/${issuedId}`);
  }

  getIssueStudentContext(userId: number) {
    return this.http.get<IssueStudentContext>(`${this.baseUrl}/api/admin/issue/students/${userId}/context`);
  }

  generateIssue(payload: {
    userId: number;
    type: 'CERTIFICATE' | 'DIPLOMA';
    certificateId?: number | null;
    diplomaId?: number | null;
    issueDate: string;
  }) {
    return this.http.post<IssueGenerateResponse>(`${this.baseUrl}/api/admin/issue/generate`, payload);
  }

  getIssueStats() {
    return this.http.get<IssueStats>(`${this.baseUrl}/api/admin/issue/stats`);
  }

  verifyIssuedCredential(serialNumber: string) {
    return this.http.get<IssuedCredentialVerify>(`${this.baseUrl}/api/issued/verify/${encodeURIComponent(serialNumber)}`);
  }
}
