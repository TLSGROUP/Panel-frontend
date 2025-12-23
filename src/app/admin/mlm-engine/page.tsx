"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"

import { LanguagePicker } from "@/components/language/LanguagePicker"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import mlmEngineService, {
  type MlmModuleConfig,
  type MlmSettingValue,
} from "@/services/mlm-engine.service"
import paymentService, { type PlanCatalogItem } from "@/services/payment.service"

type ModuleState = {
  settings: Record<string, MlmSettingValue>
}

function coerceValue(value: string, type: "text" | "number") {
  if (type === "number") {
    const parsed = Number.parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return value
}

const DEFAULT_UNILEVEL_LEVELS = [5, 3, 2]

type UnilevelPlanLevels = Record<string, number[]>

function ensureNumberArray(value: MlmSettingValue | undefined) {
  if (Array.isArray(value) && value.every((level) => typeof level === "number")) {
    return value as number[]
  }
  return null
}

function getLegacyUnilevelLevels(settings: Record<string, MlmSettingValue>) {
  const levelsValue = ensureNumberArray(settings.levelsPercent)
  if (levelsValue) return levelsValue

  const maxDepth = typeof settings.maxDepth === "number" ? settings.maxDepth : 0
  const bonusPercent =
    typeof settings.bonusPercent === "number" ? settings.bonusPercent : 0
  if (maxDepth > 0 && bonusPercent > 0) {
    return Array.from({ length: maxDepth }, () => bonusPercent)
  }

  return DEFAULT_UNILEVEL_LEVELS
}

function getUnilevelPlanLevels(
  settings: Record<string, MlmSettingValue>,
  plans: PlanCatalogItem[]
) {
  const planLevelsValue = settings.planLevels
  const planLevels: UnilevelPlanLevels = {}

  if (
    planLevelsValue &&
    typeof planLevelsValue === "object" &&
    !Array.isArray(planLevelsValue)
  ) {
    Object.entries(planLevelsValue as Record<string, MlmSettingValue>).forEach(
      ([planId, value]) => {
        const levels = ensureNumberArray(value)
        if (levels) {
          planLevels[planId] = levels
        }
      }
    )
  }

  const fallbackLevels = getLegacyUnilevelLevels(settings)
  plans.forEach((plan) => {
    if (!planLevels[plan.id]) {
      planLevels[plan.id] = fallbackLevels
    }
  })

  return planLevels
}

export default function AdminMlmEnginePage() {
  const [modules, setModules] = useState<MlmModuleConfig[]>([])
  const [moduleState, setModuleState] = useState<Record<string, ModuleState>>({})
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ["mlm-engine"],
    queryFn: () => mlmEngineService.fetchModules(),
  })
  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => paymentService.fetchPlans(),
  })

  useEffect(() => {
    if (!data) return
    setModules(data)
    const initialState: Record<string, ModuleState> = {}
    data.forEach((module) => {
      const baseSettings = { ...module.settings }
      if (module.key === "unilevel" && plans) {
        baseSettings.planLevels = getUnilevelPlanLevels(baseSettings, plans)
      }
      initialState[module.key] = {
        settings: baseSettings,
      }
    })
    setModuleState(initialState)
  }, [data, plans])

  const updateSetting = (
    moduleKey: string,
    fieldKey: string,
    value: MlmSettingValue
  ) => {
    setModuleState((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        settings: {
          ...prev[moduleKey].settings,
          [fieldKey]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)

    try {
      await Promise.all(
        Object.entries(moduleState).map(([key, state]) =>
          mlmEngineService.saveModuleSettings(key, state.settings)
        )
      )
      setSaveMessage("MLM engine settings saved.")
      toast.success("Changes saved successfully")
    } catch {
      setSaveMessage("Failed to save MLM settings.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>MLM Engine</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto">
          <LanguagePicker inline />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {modules.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No active MLM modules</CardTitle>
              <CardDescription>
                Activate modules in backend config (MLM_ENABLED).
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          modules.map((module) => {
            const state = moduleState[module.key]
            if (!state) return null
            const isUnilevel = module.key === "unilevel"
            const planList = plans ?? []
            const unilevelPlanLevels =
              isUnilevel && planList.length > 0
                ? getUnilevelPlanLevels(state.settings, planList)
                : {}

            return (
              <Card key={`${module.key}-settings`}>
                <CardHeader>
                  <CardTitle>{module.label} settings</CardTitle>
                  <CardDescription>
                    Configure parameters for this engine.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {isUnilevel ? (
                    <div className="md:col-span-2 space-y-3">
                      {planList.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No plans available. Configure plans first to set Unilevel
                          payouts.
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          {planList.map((plan) => {
                            const levels =
                              unilevelPlanLevels[plan.id] ?? DEFAULT_UNILEVEL_LEVELS
                            return (
                              <div
                                key={`unilevel-plan-${plan.id}`}
                                className="space-y-3 rounded-lg border border-white/10 p-4"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <div className="text-sm font-medium">
                                      {plan.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {plan.amount / 100} {plan.currency}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateSetting(module.key, "planLevels", {
                                        ...unilevelPlanLevels,
                                        [plan.id]: [...levels, 0],
                                      })
                                    }
                                  >
                                    Add level
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {levels.map((levelPercent, index) => (
                                    <div
                                      key={`unilevel-${plan.id}-level-${index + 1}`}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="w-20 text-sm text-muted-foreground">
                                        Level {index + 1}
                                      </div>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={levelPercent.toString()}
                                        onChange={(event) => {
                                          const updated = [...levels]
                                          const nextValue = Number.parseFloat(
                                            event.target.value
                                          )
                                          updated[index] = Number.isNaN(nextValue)
                                            ? 0
                                            : nextValue
                                          updateSetting(module.key, "planLevels", {
                                            ...unilevelPlanLevels,
                                            [plan.id]: updated,
                                          })
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated = levels.filter(
                                            (_, levelIndex) =>
                                              levelIndex !== index
                                          )
                                          updateSetting(module.key, "planLevels", {
                                            ...unilevelPlanLevels,
                                            [plan.id]:
                                              updated.length > 0 ? updated : [0],
                                          })
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    module.fields.map((field) => {
                      const value = state.settings[field.key]
                      if (field.type === "checkbox") {
                        return (
                          <label
                            key={field.key}
                            className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3"
                          >
                            <span className="text-sm">{field.label}</span>
                            <Checkbox
                              checked={Boolean(value)}
                              onCheckedChange={(checked) =>
                                updateSetting(module.key, field.key, Boolean(checked))
                              }
                            />
                          </label>
                        )
                      }

                      return (
                        <div key={field.key} className="space-y-2">
                          <label className="text-sm font-medium">
                            {field.label}
                          </label>
                          <Input
                            type={field.type === "number" ? "number" : "text"}
                            value={value?.toString() ?? ""}
                            onChange={(event) =>
                              updateSetting(
                                module.key,
                                field.key,
                                coerceValue(
                                  event.target.value,
                                  field.type === "number" ? "number" : "text"
                                )
                              )
                            }
                            placeholder={field.placeholder}
                            min={field.min}
                            max={field.max}
                          />
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )
          })
        )}

        <Card>
          <CardFooter className="flex items-center justify-between gap-3 pt-6">
            <span className="text-sm text-muted-foreground">
              {saveMessage ?? "Save to apply module changes."}
            </span>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SidebarInset>
  )
}
