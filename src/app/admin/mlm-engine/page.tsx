"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { HelpCircle } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [placementHelpOpen, setPlacementHelpOpen] = useState(false)
  const [placementHelpTopic, setPlacementHelpTopic] = useState<string>("")

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

            const isBinary = module.key === "binary"
            const gridCols = isBinary ? "md:grid-cols-4" : "md:grid-cols-2"

            return (
              <Card key={`${module.key}-settings`}>
                <CardHeader>
                  <CardTitle>{module.label} settings</CardTitle>
                  <CardDescription>
                    Configure parameters for this engine.
                  </CardDescription>
                </CardHeader>
                <CardContent className={`grid gap-4 ${gridCols}`}>
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
                  ) : isBinary ? (
                    <>
                      <div className="space-y-4 md:col-start-1">
                        {module.fields
                          .filter((field) => field.type === "select")
                          .map((field) => {
                            const value = state.settings[field.key]
                            const selectValue =
                              typeof value === "string"
                                ? value
                                : field.options?.[0]?.value
                            return (
                              <div key={field.key} className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <span>{field.label}</span>
                                  {field.key ? (
                                    <button
                                      type="button"
                                      className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                                      aria-label={`${field.label} help`}
                                      onClick={() => {
                                        setPlacementHelpTopic(field.key)
                                        setPlacementHelpOpen(true)
                                      }}
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </button>
                                  ) : null}
                                </label>
                                <Select
                                  value={selectValue ?? ""}
                                  onValueChange={(nextValue) =>
                                    updateSetting(module.key, field.key, nextValue)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )
                          })}
                      </div>
                      <div className="space-y-4 md:col-start-2">
                        {module.fields
                          .filter(
                            (field) =>
                              field.type !== "checkbox" &&
                              field.type !== "select"
                          )
                          .filter((_, index) => index % 2 === 0)
                          .map((field) => {
                            const value = state.settings[field.key]
                            return (
                              <div key={field.key} className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <span>{field.label}</span>
                                  {field.key ? (
                                    <button
                                      type="button"
                                      className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                                      aria-label={`${field.label} help`}
                                      onClick={() => {
                                        setPlacementHelpTopic(field.key)
                                        setPlacementHelpOpen(true)
                                      }}
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </button>
                                  ) : null}
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
                          })}
                      </div>
                      <div className="space-y-4 md:col-start-3">
                        {module.fields
                          .filter(
                            (field) =>
                              field.type !== "checkbox" &&
                              field.type !== "select"
                          )
                          .filter((_, index) => index % 2 === 1)
                          .map((field) => {
                            const value = state.settings[field.key]
                            return (
                              <div key={field.key} className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <span>{field.label}</span>
                                  {field.key ? (
                                    <button
                                      type="button"
                                      className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                                      aria-label={`${field.label} help`}
                                      onClick={() => {
                                        setPlacementHelpTopic(field.key)
                                        setPlacementHelpOpen(true)
                                      }}
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </button>
                                  ) : null}
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
                          })}
                      </div>
                      <div className="space-y-4 md:col-start-4">
                        {module.fields
                          .filter((field) => field.type === "checkbox")
                          .map((field) => {
                            const value = state.settings[field.key]
                            if (
                              field.key === "requirePersonalsInEachLeg" ||
                              field.key === "trackPersonalVsSpillover"
                            ) {
                              const labelText =
                                field.key === "requirePersonalsInEachLeg"
                                  ? "Require personals in each leg"
                                  : "Track personal vs spillover"
                              const selectValue = Boolean(value) ? "yes" : "no"
                              return (
                                <div key={field.key} className="space-y-2">
                                  <label className="text-sm font-medium">
                                    {labelText}
                                  </label>
                                  <Select
                                    value={selectValue}
                                    onValueChange={(nextValue) =>
                                      updateSetting(
                                        module.key,
                                        field.key,
                                        nextValue === "yes"
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">YES</SelectItem>
                                      <SelectItem value="no">NO</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )
                            }
                            return (
                              <label
                                key={field.key}
                                className="flex items-center justify-between gap-3 rounded-md border border-white/10 p-3"
                              >
                                <span className="text-sm">{field.label}</span>
                                <Checkbox
                                  checked={Boolean(value)}
                                  onCheckedChange={(checked) =>
                                    updateSetting(
                                      module.key,
                                      field.key,
                                      Boolean(checked)
                                    )
                                  }
                                />
                              </label>
                            )
                          })}
                      </div>
                    </>
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

                      if (field.type === "select") {
                        const selectValue =
                          typeof value === "string"
                            ? value
                            : field.options?.[0]?.value
                        return (
                          <div key={field.key} className="space-y-2 md:col-start-1">
                            <label className="text-sm font-medium">
                              {field.label}
                            </label>
                            <Select
                              value={selectValue ?? ""}
                              onValueChange={(nextValue) =>
                                updateSetting(module.key, field.key, nextValue)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      }

                      const forceRightColumn = new Set([
                        "pairVolume",
                        "minActivePersonals",
                        "maxPercentFromOneLegForRank",
                      ])
                      const columnClass = forceRightColumn.has(field.key)
                        ? "md:col-start-2"
                        : ""

                      return (
                        <div
                          key={field.key}
                          className={`space-y-2 ${columnClass}`}
                        >
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
                {isBinary ? (
                  <Dialog
                    open={placementHelpOpen}
                    onOpenChange={setPlacementHelpOpen}
                  >
                    <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md">
                      <DialogHeader>
                        <DialogTitle>
                          {(() => {
                            const helpTitleMap: Record<string, string> = {
                              pairVolume: "Pair volume (BV)",
                              pairPercent: "Pair percent",
                              carryoverMaxRatio: "Carryover max ratio",
                              minActivePersonals: "Minimum active personals",
                              minWeakLegBvPerDay: "Min weak leg BV per day",
                              dailyBinaryCap: "Daily binary cap",
                              weeklyBinaryCap: "Weekly binary cap",
                              maxPercentFromOneLegForRank:
                                "Max percent from one leg for rank",
                              minPersonalShareInWeakLeg:
                                "Min personal share in weak leg (%)",
                              placementMode: "Placement mode",
                              spilloverMode: "Spillover mode",
                              alternateMode: "Alternate mode",
                              weakMetric: "Weak metric",
                              tieBreaker: "Tie breaker",
                              maxBfsVisited: "Max BFS visited",
                            }
                            return helpTitleMap[placementHelpTopic] ?? "Setting"
                          })()}
                        </DialogTitle>
                        <DialogDescription>
                          {(() => {
                            const helpDescriptionMap: Record<string, string> = {
                              pairVolume:
                                "The amount of business volume required on both legs to form one matching pair. Example: if Pair volume is 50 BV, then each time you have 50 BV on the weaker leg, it counts as 1 pair (matched against the other leg).",
                              pairPercent:
                                "The payout percentage applied to each matched pair’s volume. Binary bonus per pair = Pair volume × Pair percent (paid in your payout currency, e.g. EUR).",
                              carryoverMaxRatio:
                                "Limits how much the strong leg can affect payouts compared to the weak leg. Only up to Weak leg × Ratio is considered from the strong leg. Example: Ratio = 3. If the weak leg has 100 BV, the strong leg is counted up to 300 BV for matching (any extra strong-leg volume is ignored until the weak leg grows).",
                              minActivePersonals:
                                "Minimum number of personally enrolled active partners required to qualify for the binary bonus. “Active” usually means the partner has an active plan/package.",
                              minWeakLegBvPerDay:
                                "Minimum new BV in the weaker leg for the current day required to qualify for the binary bonus. If the weaker leg does not reach this daily volume, no binary bonus is paid for that day (volume can still carry over, depending on your system rules).",
                              dailyBinaryCap:
                                "Maximum total binary bonus a user can receive in a single day (in currency). If the calculated binary bonus exceeds this limit, the payout is reduced or stopped until the next day starts.",
                              weeklyBinaryCap:
                                "Maximum total binary bonus a user can receive within a single week (in currency). If the calculated binary bonuses exceed this limit, payouts are reduced or stopped until the next week starts.",
                              maxPercentFromOneLegForRank:
                                "Limits how much of the required rank/qualification volume can come from a single leg. Example: if set to 40%, then at most 40% of the volume used to qualify for a rank may be counted from one leg — the remaining volume must come from the other leg.",
                              minPersonalShareInWeakLeg:
                                "Minimum percentage of the weak leg’s BV that must come from the user’s personal structure (not spillover) to qualify for full binary bonus. Example: 30% means at least 30% of the weak leg volume must be personal; otherwise the binary bonus can be reduced or not paid (depending on implementation).",
                              placementMode:
                                "How new users are placed under the sponsor.",
                              spilloverMode:
                                "How spillover searches for a free slot.",
                              alternateMode:
                                "How alternating chooses the next leg.",
                              weakMetric:
                                "Which metric defines the weaker leg.",
                              tieBreaker:
                                "How to break ties when legs are equal.",
                              maxBfsVisited:
                                "Safety limit for spillover placement search. Defines the maximum number of nodes the system will check while looking for a free slot. If the limit is reached, placement stops to prevent long searches or timeouts.",
                            }
                            return (
                              helpDescriptionMap[placementHelpTopic] ??
                              "Details for this setting."
                            )
                          })()}
                        </DialogDescription>
                      </DialogHeader>
                      {placementHelpTopic === "placementMode" ? (
                        <div className="space-y-3 text-sm">
                          <div className="text-muted-foreground">
                            Defines how the system places new users into the LEFT
                            or RIGHT leg under their sponsor (when a direct slot
                            is available). If the sponsor has no free direct slot,
                            the system continues placement using the configured
                            Spillover mode.
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              Auto weak
                            </div>
                            <div className="text-muted-foreground">
                              Places the user into the sponsor’s weaker leg based
                              on the selected weak metric (Count or BV). If both
                              legs are equal, the system uses the Tie breaker
                              rule.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              Alternate
                            </div>
                            <div className="text-muted-foreground">
                              Places users left and right in turn to keep
                              distribution balanced. Depending on configuration,
                              it alternates using the sponsor’s last placement
                              history or a stable automatic rule.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              Strict left
                            </div>
                            <div className="text-muted-foreground">
                              Always tries LEFT first. If LEFT is full, places to
                              RIGHT.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              Strict right
                            </div>
                            <div className="text-muted-foreground">
                              Always tries RIGHT first. If RIGHT is full, places
                              to LEFT.
                            </div>
                          </div>
                        </div>
                      ) : placementHelpTopic === "spilloverMode" ? (
                        <div className="space-y-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Defines how the system finds a free slot when the
                              sponsor’s direct LEFT and RIGHT positions are already
                              taken.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              BFS (level-by-level)
                            </div>
                            <div className="text-muted-foreground">
                              Searches level-by-level through the sponsor’s
                              downline and places the user into the first
                              available free slot.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              Weak leg first
                            </div>
                            <div className="text-muted-foreground">
                              Searches the sponsor’s weaker leg first (based on
                              the selected weak metric), then searches the other
                              leg if no slot is found.
                            </div>
                          </div>
                        </div>
                      ) : placementHelpTopic === "weakMetric" ? (
                        <div className="space-y-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Defines how the system determines which leg is
                              “weaker” for Auto weak placement and Weak leg first
                              spillover.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              Count
                            </div>
                            <div className="text-muted-foreground">
                              Compares the number of users in the LEFT and RIGHT
                              legs.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              BV (Business Volume)
                            </div>
                            <div className="text-muted-foreground">
                              Compares the total accumulated business volume in
                              the LEFT and RIGHT legs (requires BV tracking from
                              purchases).
                            </div>
                          </div>
                        </div>
                      ) : placementHelpTopic === "alternateMode" ? (
                        <div className="space-y-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Defines how the system decides which leg is next when
                              using the Alternate placement mode.
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              By sponsor history
                            </div>
                            <div className="text-muted-foreground">
                              Alternates based on the sponsor’s last placement
                              (the next user goes to the opposite leg).
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-emerald-400">
                              Stable automatic
                            </div>
                            <div className="text-muted-foreground">
                              Alternates using a stable automatic rule derived
                              from the new user’s ID, so distribution stays
                              consistent and balanced even without sponsor
                              history.
                            </div>
                          </div>
                        </div>
                      ) : (
                        placementHelpTopic === "tieBreaker" ? (
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="text-muted-foreground">
                                Defines what the system should do when both legs
                                are equal by the selected weak metric.
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-emerald-400">
                                Left
                              </div>
                              <div className="text-muted-foreground">
                                Chooses the LEFT leg when both legs are equal.
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-emerald-400">
                                Right
                              </div>
                              <div className="text-muted-foreground">
                                Chooses the RIGHT leg when both legs are equal.
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-emerald-400">
                                Stable automatic
                              </div>
                              <div className="text-muted-foreground">
                                Chooses a leg using a stable automatic rule
                                based on the new user’s ID to keep distribution
                                balanced and consistent.
                              </div>
                            </div>
                          </div>
                        ) : null
                      )}
                    </DialogContent>
                  </Dialog>
                ) : null}
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
