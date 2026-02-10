import { api } from "./api";
import type { Promotor } from "@/lib/types";

interface LoginPayload {
  EMAIL: string;
  SENHA: string;
}

interface LoginResponse {
  promotor: Promotor;
  token?: string;
}

export async function loginService(
  email: string,
  senha: string
): Promise<LoginResponse> {
  const payload: LoginPayload = {
    EMAIL: email,
    SENHA: senha,
  };

  return api<LoginResponse>("promotor/login", {
    method: "POST",
    body: payload,
  });
}
