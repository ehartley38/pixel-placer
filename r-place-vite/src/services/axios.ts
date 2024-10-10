import axios from "axios";
import { supabase } from "./supabaseClient";

const getToken = async () => {
  const session = await supabase.auth.getSession();

  const token = session.data.session?.access_token || null;

  return token;
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + (await getToken()),
  },
});

export const axiosBinaryResInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  responseType: "arraybuffer",
});
