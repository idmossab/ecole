import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  AuthResponse,
  CertificateClaimResponse,
  CertificateProgress,
  DiplomaCertificateStatus,
  DiplomaClaimResponse,
  DiplomaProgress,
  DiplomaSummary,
  MyCertificateProgress,
  NotificationItem,
  UnreadNotificationCount,
  UserResponse
} from './models';
import { Certificate, Course } from './certificates.data';

export type AdminCertificate = {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCourse = {
  id: number;
  certificateId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  mode: 'ONLINE' | 'ONSITE';
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

  createCertificate(payload: { title: string; description: string }) {
    return this.http.post<AdminCertificate>(`${this.baseUrl}/api/admin/certificates`, payload);
  }

  updateCertificate(id: number, payload: { title: string; description: string }) {
    return this.http.put<AdminCertificate>(`${this.baseUrl}/api/admin/certificates/${id}`, payload);
  }

  deleteCertificate(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/certificates/${id}`);
  }

  createCourse(certificateId: number, payload: {
    title: string;
    description: string;
    imageUrl: string;
    mode: 'ONLINE' | 'ONSITE';
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
    imageUrl: string;
    mode: 'ONLINE' | 'ONSITE';
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
}
