import axios from "axios";

// En el servidor (Docker) la API no está en localhost. Ver docs/probar-el-flujo.md
export const resolveBaseURL = () =>
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: resolveBaseURL(),
});
