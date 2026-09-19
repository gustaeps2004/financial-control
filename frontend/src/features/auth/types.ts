export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  acceptedPrivacyPolicy: boolean;
  acceptedTermsOfUse: boolean;
}

export interface RegisterResponse {
  id: string;
  createdAt?: string;
}

export interface Session {
  token: string;
  expiresAt: string;
  email: string;
}
