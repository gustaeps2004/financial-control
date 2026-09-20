import { apiClient } from "@/lib/http/api-client";
import type {
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
  register: (payload: RegisterRequest) =>
    apiClient.post<RegisterResponse, RegisterRequest>("/users", payload),
  updateName: (name: string, token: string) =>
    apiClient.patch<UpdateUserNameResponse, UpdateUserNameRequest>(
      "/users/me",
      { name },
      { headers: { Authorization: `Bearer ${token}` } },
    ),
};
