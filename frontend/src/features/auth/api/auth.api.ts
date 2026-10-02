import { apiClient, withAuth } from "@/lib/http/api-client";
import type {
  AccountConfirmation,
  GoogleLoginRequest,
  GoogleLoginResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserNameRequest,
  UpdateUserNameResponse,
} from "../types";

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<LoginResponse, LoginRequest>("/auth/login", payload),
  loginWithGoogle: (payload: GoogleLoginRequest) =>
    apiClient.post<GoogleLoginResponse, GoogleLoginRequest>("/auth/google", payload),
  register: (payload: RegisterRequest) =>
    apiClient.post<RegisterResponse, RegisterRequest>("/users", payload),
  updateName: (name: string, token: string) =>
    apiClient.patch<UpdateUserNameResponse, UpdateUserNameRequest>(
      "/users/me",
      { name },
      withAuth(token),
    ),
  deleteAccount: (confirmation: AccountConfirmation, token: string) =>
    apiClient.delete("/users/me", { ...withAuth(token), body: JSON.stringify(confirmation) }),
};
