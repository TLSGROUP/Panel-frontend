"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { ChevronDown } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import settingsService from "@/services/settings.service"
import type { PlanCatalogItem } from "@/services/payment.service"

const SETTINGS_KEYS = {
  planCatalog: "plans.catalog",
  planCurrency: "plans.currency",
  planColors: "plans.colors",
}

type PlanDraft = PlanCatalogItem & { _uid: string }

const DEFAULT_PLANS: PlanCatalogItem[] = [
  {
    id: "bronze",
    name: "Bronze",
    amount: 1900,
    currency: "EUR",
    description: "Ideal for freelancers and mini teams.",
    features: ["1 project", "Basic analytics", "Email support"],
  },
  {
    id: "silver",
    name: "Silver",
    amount: 4900,
    currency: "EUR",
    description: "For teams that grow steadily.",
    features: ["5 projects", "Advanced analytics", "Priority support"],
  },
  {
    id: "gold",
    name: "Gold",
    amount: 9900,
    currency: "EUR",
    description: "Optimized for agencies and startups.",
    features: ["Unlimited projects", "Automation tools", "Account manager"],
  },
  {
    id: "brilliant",
    name: "Brilliant",
    amount: 19900,
    currency: "EUR",
    description: "Complete toolkit for enterprises.",
    features: ["All Pro features", "99.9% SLA", "Custom onboarding"],
  },
]

const CURRENCY_OPTIONS = ["EUR", "USD",]
const DEFAULT_PLAN_COLORS: Record<string, string> = {
  bronze: "#C0843A",
  silver: "#E2E8F0",
  gold: "#FACC15",
  brilliant: "#7DD3FC",
}
const COLOR_FALLBACK = "#94A3B8"

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "plan"

const createUniqueId = (base: string, existingIds: string[]) => {
  let id = base
  let counter = 1
  while (existingIds.includes(id)) {
    id = `${base}-${counter}`
    counter += 1
  }
  return id
}

const toCents = (value: string) => {
  if (!value.trim()) return 0
  const normalized = value.replace(",", ".")
  const parsed = Number.parseFloat(normalized)
  if (Number.isNaN(parsed)) return 0
  return Math.round(parsed * 100)
}

const formatAmount = (amount: number) => {
  if (!Number.isFinite(amount)) return "0"
  return `${amount / 100}`
}

const getColorValue = (color?: string) =>
  color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : COLOR_FALLBACK

const createUid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const withUids = (plans: PlanCatalogItem[]): PlanDraft[] =>
  plans.map((plan) => ({ ...plan, _uid: createUid() }))

const serializePlans = (plans: PlanDraft[]) =>
  JSON.stringify(
    plans.map(({ _uid, ...rest }) => rest)
  )

export default function AdminPlanSettingsPage() {
  const queryClient = useQueryClient()
  const [plans, setPlans] = useState<PlanDraft[]>(withUids(DEFAULT_PLANS))
  const [currency, setCurrency] = useState("EUR")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [lastSavedPlans, setLastSavedPlans] = useState<PlanDraft[]>(
    withUids(DEFAULT_PLANS)
  )
  const [lastSavedCurrency, setLastSavedCurrency] = useState("EUR")

  const { data: planCatalogData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.planCatalog],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.planCatalog),
  })

  const { data: planCurrencyData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.planCurrency],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.planCurrency),
  })

  const { data: planColorsData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.planColors],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.planColors),
  })

  useEffect(() => {
    let parsedPlans = DEFAULT_PLANS
    let colors: Record<string, string> = {}
    if (planCatalogData?.value) {
      try {
        const parsed = JSON.parse(planCatalogData.value) as PlanCatalogItem[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedPlans = parsed
        }
      } catch {
        parsedPlans = DEFAULT_PLANS
      }
    }

    if (planColorsData?.value) {
      try {
        const parsed = JSON.parse(planColorsData.value) as Record<string, string>
        if (parsed && typeof parsed === "object") {
          colors = parsed
        }
      } catch {
        colors = {}
      }
    }

    const initialCurrency =
      planCurrencyData?.value?.trim() || parsedPlans[0]?.currency || "EUR"

    setCurrency(initialCurrency)
    const hydratedPlans = withUids(
      parsedPlans.map((plan) => ({
        ...plan,
        currency: initialCurrency,
        color: colors[plan.id] || DEFAULT_PLAN_COLORS[plan.id] || COLOR_FALLBACK,
      }))
    )
    setPlans(hydratedPlans)
    setLastSavedPlans(hydratedPlans)
    setLastSavedCurrency(initialCurrency)
  }, [planCatalogData, planCurrencyData, planColorsData])

  const planCountLabel = useMemo(
    () => `${plans.length} ${plans.length === 1 ? "plan" : "plans"}`,
    [plans.length]
  )

  const isDirty = useMemo(() => {
    return (
      currency !== lastSavedCurrency ||
      serializePlans(plans) !== serializePlans(lastSavedPlans)
    )
  }, [plans, currency, lastSavedPlans, lastSavedCurrency])

  const updatePlan = (index: number, updates: Partial<PlanDraft>) => {
    setPlans((prev) =>
      prev.map((plan, idx) => (idx === index ? { ...plan, ...updates } : plan))
    )
  }

  const handleCurrencyChange = (value: string) => {
    setCurrency(value)
    setPlans((prev) => prev.map((plan) => ({ ...plan, currency: value })))
  }

  const handleAddPlan = () => {
    setPlans((prev) => {
      const baseId = slugify("new-plan")
      const existingIds = prev.map((plan) => plan.id)
      const id = createUniqueId(baseId, existingIds)
      return [
        ...prev,
        {
          id,
          name: "New plan",
          amount: 0,
          currency,
          color: COLOR_FALLBACK,
          description: "",
          features: [],
          _uid: createUid(),
        },
      ]
    })
  }

  const handleRemovePlan = (index: number) => {
    setPlans((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAddFeature = (index: number) => {
    setPlans((prev) =>
      prev.map((plan, idx) =>
        idx === index
          ? { ...plan, features: [...(plan.features ?? []), ""] }
          : plan
      )
    )
  }

  const handleUpdateFeature = (
    planIndex: number,
    featureIndex: number,
    value: string
  ) => {
    setPlans((prev) =>
      prev.map((plan, idx) => {
        if (idx !== planIndex) return plan
        const features = [...(plan.features ?? [])]
        features[featureIndex] = value
        return { ...plan, features }
      })
    )
  }

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    setPlans((prev) =>
      prev.map((plan, idx) => {
        if (idx !== planIndex) return plan
        const features = [...(plan.features ?? [])]
        features.splice(featureIndex, 1)
        return { ...plan, features }
      })
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    if (!plans.length) {
      setSaveMessage("Add at least one plan before saving.")
      setIsSaving(false)
      return
    }

    const ids = new Set<string>()
    for (const plan of plans) {
      if (!plan.name.trim()) {
        setSaveMessage("Each plan needs a name.")
        setIsSaving(false)
        return
      }
      if (!plan.id?.trim()) {
        setSaveMessage("Each plan needs an internal ID.")
        setIsSaving(false)
        return
      }
      if (ids.has(plan.id)) {
        setSaveMessage("Plan IDs must be unique.")
        setIsSaving(false)
        return
      }
      if (!Number.isFinite(plan.amount) || plan.amount < 0) {
        setSaveMessage("Plan prices must be 0 or higher.")
        setIsSaving(false)
        return
      }
      ids.add(plan.id)
    }

    const payload = plans.map((plan) => {
      const { color, _uid, ...rest } = plan
      return {
        ...rest,
        id: plan.id.trim(),
        name: plan.name.trim(),
        description: plan.description?.trim() || "",
        currency,
        features: (plan.features ?? [])
          .map((feature) => feature.trim())
          .filter(Boolean),
      }
    })

    const colorsPayload = plans.reduce<Record<string, string>>((acc, plan) => {
      const color = plan.color?.trim()
      if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
        acc[plan.id.trim()] = color
      }
      return acc
    }, {})

    try {
      await Promise.all([
        settingsService.saveSetting(
          SETTINGS_KEYS.planCatalog,
          JSON.stringify(payload, null, 2)
        ),
        settingsService.saveSetting(SETTINGS_KEYS.planCurrency, currency),
        settingsService.saveSetting(
          SETTINGS_KEYS.planColors,
          JSON.stringify(colorsPayload, null, 2)
        ),
      ])
      const updatedPlans = payload.map((plan) => ({
        ...plan,
        color: colorsPayload[plan.id],
        _uid: createUid(),
      }))
      const updatedPlansPayload = updatedPlans.map(({ _uid, ...rest }) => rest)

      setSaveMessage("Plan catalog saved.")
      toast.success("Changes saved successfully")
      setPlans(updatedPlans)
      setLastSavedPlans(updatedPlans)
      setLastSavedCurrency(currency)
      queryClient.setQueryData(["plans"], updatedPlansPayload)
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      if (typeof window !== "undefined") {
        const payloadForSync = JSON.stringify({
          updatedAt: Date.now(),
          plans: updatedPlansPayload,
        })
        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("plans-updated")
          channel.postMessage(payloadForSync)
          channel.close()
        }
        window.localStorage.setItem("plans-updated", payloadForSync)
      }
    } catch {
      setSaveMessage("Failed to save plan catalog. Try again.")
    } finally {
      setIsSaving(false)
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
                <BreadcrumbPage>Plan settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto">
          <LanguagePicker inline />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Global currency</CardTitle>
            <CardDescription>
              The selected currency is applied to every plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Currency</div>
              <div className="text-xs text-muted-foreground">
                Base currency affects all plan prices.
              </div>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between md:w-15"
                >
                  <span>{currency}</span>
                  <ChevronDown className="size-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="center"
                className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                <DropdownMenuRadioGroup
                  value={currency}
                  onValueChange={handleCurrencyChange}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem key={option} value={option}>
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Plans</h2>
            <p className="text-sm text-muted-foreground">{planCountLabel}</p>
          </div>
          <Button variant="outline" onClick={handleAddPlan}>
            Add plan
          </Button>
        </div>

        <div className="grid gap-4">
          {plans.map((plan, index) => (
            <Card key={plan._uid}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-base">
                    {plan.name || "Untitled plan"}
                  </CardTitle>
                  <CardDescription>
                    ID: <span className="font-mono">{plan.id}</span>
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemovePlan(index)}
                >
                  Remove
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plan name</label>
                  <Input
                    value={plan.name}
                    onChange={(event) =>
                      updatePlan(index, { name: event.target.value })
                    }
                    placeholder="Plan name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Price ({currency})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formatAmount(plan.amount)}
                    onChange={(event) =>
                      updatePlan(index, {
                        amount: toCents(event.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    rows={3}
                    value={plan.description ?? ""}
                    onChange={(event) =>
                      updatePlan(index, { description: event.target.value })
                    }
                    placeholder="Plan summary"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Features</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddFeature(index)}
                    >
                      Add feature
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(plan.features ?? []).length === 0 && (
                      <div className="text-xs text-muted-foreground">
                        No features yet.
                      </div>
                    )}
                    {(plan.features ?? []).map((feature, featureIndex) => (
                      <div
                        key={`${plan.id}-feature-${featureIndex}`}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={feature}
                          onChange={(event) =>
                            handleUpdateFeature(
                              index,
                              featureIndex,
                              event.target.value
                            )
                          }
                          placeholder="Feature description"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={() =>
                            handleRemoveFeature(index, featureIndex)
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name color</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={getColorValue(plan.color)}
                      onChange={(event) =>
                        updatePlan(index, { color: event.target.value })
                      }
                      className="h-9 w-14 p-1"
                    />
                    <Input
                      value={plan.color ?? ""}
                      onChange={(event) =>
                        updatePlan(index, { color: event.target.value })
                      }
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plan ID</label>
                  <Input
                    value={plan.id}
                    onChange={(event) =>
                      updatePlan(index, { id: event.target.value })
                    }
                    placeholder="unique-plan-id"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="flex flex-col items-start justify-between gap-3 pt-6 md:flex-row md:items-center">
            {saveMessage ? (
              <span className="text-sm text-muted-foreground">
                {saveMessage}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Updates are applied to the plan catalog used by Stripe payments.
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
