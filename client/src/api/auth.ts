import axios from "./axios";

export const authApi = {

  login: (data: any) =>
    axios.post("/auth/login", data),

  register: (data: any) =>
    axios.post("/auth/register", data),

  getMe: () =>
    axios.get("/auth/me"),

  logout: () =>
    axios.post("/auth/logout"),

  forgotPassword: (email: string) =>
    axios.post("/auth/forgot-password", {
      email,
    }),

  resetPassword: (
    token: string,
    password: string
  ) =>
    axios.post(`/auth/reset-password/${token}`, {
      password,
    }),

  googleAuth: (credential: string, role?: string) =>
    axios.post("/auth/google", { credential, role }),

};