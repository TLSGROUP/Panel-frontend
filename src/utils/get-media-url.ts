import { API_URL } from "@/constants"

const API_BASE_URL = API_URL.replace(/\/api\/?$/, "")

export const getMediaUrl = (value?: string | null) => {
  if (!value) {
    return ""
  }

  return value.startsWith("http") ? value : `${API_BASE_URL}${value}`
}
