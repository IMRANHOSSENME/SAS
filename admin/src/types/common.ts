export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
  avatarUrl?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g., ST-2023-001
  name: string;
  email?: string;
  class: string;
  section: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  fingerprintEnrolled: boolean;
}

export interface Attendance {
  id: string;
  studentId: string;
  student: Student;
  date: string; // ISO format
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  overtimeHours?: number;
}

export interface Device {
  id: string;
  name: string;
  macAddress: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE';
  lastHeartbeat: string;
}

export interface Report {
  id: string;
  name: string;
  generatedAt: string;
  type: 'DAILY' | 'MONTHLY';
  url: string;
}
