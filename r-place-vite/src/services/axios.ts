import axios from "axios";

const getToken = () => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
  const storageKey = `sb-${projectId}-auth-token`
  const sessionDataString = localStorage.getItem(storageKey)
  const sessionData = JSON.parse(sessionDataString || "null")
  const token = sessionData?.access_token

  return token
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getToken()
  },
});

export const axiosBinaryResInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  responseType: "arraybuffer",
});

