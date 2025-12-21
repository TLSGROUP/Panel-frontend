import { instance } from "@/api/axios"

export type SettingEntry = {
  key: string
  value: string
}

class SettingsService {
  async fetchSetting(key: string) {
    const response = await instance.get<SettingEntry | null>(`/settings/${key}`)
    return response.data
  }

  async saveSetting(key: string, value: string) {
    const response = await instance.post<SettingEntry>("/settings", {
      key,
      value,
    })
    return response.data
  }
}

export default new SettingsService()
