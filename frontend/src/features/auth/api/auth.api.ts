import { apiClient } from "@/lib/http/api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types";

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<LoginResponse, LoginRequest>("/auth/login", payload),
  register: (payload: RegisterRequest) =>
    apiClient.post<RegisterResponse, RegisterRequest>("/users", payload),
};
