export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
}

export interface GoogleLoginRequest {
  credential: string;
  // Links Google to the password account with the same email.
  password?: string;
  // Both true let the sign-in create the account.
  acceptedPrivacyPolicy: boolean;
  acceptedTermsOfUse: boolean;
}

export interface GoogleLoginResponse extends LoginResponse {
  user: { id: string; name: string; email: string };
  isNewUser: boolean;
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

export interface UpdateUserNameRequest {
  name: string;
}

export interface UpdateUserNameResponse {
  id: string;
  name: string;
  email: string;
}

export type SignInMethod = "password" | "google";

export interface Session {
  token: string;
  expiresAt: string;
  email: string;
  // How the person proves it's them again, e.g. to delete the account.
  // Missing from sessions saved before Google sign-in: those used a password.
  signInMethod?: SignInMethod;
}
