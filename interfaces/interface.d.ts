export interface Session {
  id: string;
  token: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress?: string | null; // ✅ optional
  userAgent?: string | null; // ✅ optional
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: "TEACHER" | "STUDENT" | null; // or widen if needed
  createdAt: Date;
  updatedAt: Date;
  isOnboarded: boolean;
}

export interface UserObject {
  user: User;
  session: Session;
}

export type exam = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string | null;
  isPublished: boolean;
  creatorId: string;
  startDate: Date;
  endDate: Date;
};
