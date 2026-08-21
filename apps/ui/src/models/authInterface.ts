export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LogInInput {
  email: string;
  password: string;
}
