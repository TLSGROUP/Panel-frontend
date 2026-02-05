import { instance } from "@/api/axios"

export type MlmFieldSchema = {
  key: string
  label: string
  type: "text" | "number" | "select" | "checkbox"
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  min?: number
  max?: number
}

export type MlmModuleConfig = {
  key: string
  label: string
  description?: string
  fields: MlmFieldSchema[]
  settings: Record<string, MlmSettingValue>
}

export type MlmModuleSettings = {
  key: string
  label: string
  settings: Record<string, MlmSettingValue>
}

export type MlmSettingValue =
  | string
  | number
  | boolean
  | MlmSettingValue[]
  | { [key: string]: MlmSettingValue }

class MlmEngineService {
  async fetchModules() {
    const response = await instance.get<MlmModuleConfig[]>("/mlm-engine/modules")
    return response.data
  }

  async saveModuleSettings(
    key: string,
    settings: Record<string, MlmSettingValue>
  ) {
    const response = await instance.post("/mlm-engine/modules/settings", {
      key,
      settings,
    })
    return response.data
  }

  async fetchEnabledModuleKeys() {
    const response = await instance.get<string[]>("/mlm-engine/enabled")
    return response.data
  }

  async fetchModuleSettings(key: string) {
    const response = await instance.get<MlmModuleSettings>(`/mlm-engine/modules/${key}`)
    return response.data
  }
}

export default new MlmEngineService()
