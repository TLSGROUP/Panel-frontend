"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

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
import settingsService from "@/services/settings.service"

const SETTINGS_KEYS = {
  publicKey: "stripe.public_key",
  secretKey: "stripe.secret_key",
  webhookSecret: "stripe.webhook_secret",
  planCatalog: "plans.catalog",
}

const defaultPlanCatalog = `[
  {
    "id": "bronze",
    "name": "Bronze",
    "amount": 1900,
    "currency": "EUR",
    "description": "Ideal for freelancers and mini teams.",
    "features": ["1 project", "Basic analytics", "Email support"]
  },
  {
    "id": "silver",
    "name": "Silver",
    "amount": 4900,
    "currency": "EUR",
    "description": "For teams that grow steadily.",
    "features": ["5 projects", "Advanced analytics", "Priority support"]
  },
  {
    "id": "gold",
    "name": "Gold",
    "amount": 9900,
    "currency": "EUR",
    "description": "Optimized for agencies and startups.",
    "features": ["Unlimited projects", "Automation tools", "Account manager"]
  },
  {
    "id": "brilliant",
    "name": "Brilliant",
    "amount": 19900,
    "currency": "EUR",
    "description": "Complete toolkit for enterprises.",
    "features": ["All Pro features", "99.9% SLA", "Custom onboarding"]
  }
]`

export default function AdminSettingsPage() {
  const [publicKey, setPublicKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [webhookSecret, setWebhookSecret] = useState("")
  const [planCatalog, setPlanCatalog] = useState(defaultPlanCatalog)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPlans, setIsSavingPlans] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [planSaveMessage, setPlanSaveMessage] = useState<string | null>(null)
  const [lastSavedKeys, setLastSavedKeys] = useState({
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
  })
  const [lastSavedPlanCatalog, setLastSavedPlanCatalog] =
    useState(defaultPlanCatalog)

  const { data: publicKeyData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.publicKey],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.publicKey),
  })

  const { data: secretKeyData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.secretKey],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.secretKey),
  })

  const { data: webhookData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.webhookSecret],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.webhookSecret),
  })

  const { data: planCatalogData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.planCatalog],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.planCatalog),
  })

  useEffect(() => {
    if (publicKeyData?.value) {
      setPublicKey(publicKeyData.value)
      setLastSavedKeys((prev) => ({ ...prev, publicKey: publicKeyData.value }))
    }
    if (secretKeyData?.value) {
      setSecretKey(secretKeyData.value)
      setLastSavedKeys((prev) => ({ ...prev, secretKey: secretKeyData.value }))
    }
    if (webhookData?.value) {
      setWebhookSecret(webhookData.value)
      setLastSavedKeys((prev) => ({
        ...prev,
        webhookSecret: webhookData.value,
      }))
    }
    if (planCatalogData?.value) {
      setPlanCatalog(planCatalogData.value)
      setLastSavedPlanCatalog(planCatalogData.value)
    }
  }, [publicKeyData, secretKeyData, webhookData, planCatalogData])

  const keysDirty = useMemo(
    () =>
      publicKey.trim() !== lastSavedKeys.publicKey ||
      secretKey.trim() !== lastSavedKeys.secretKey ||
      webhookSecret.trim() !== lastSavedKeys.webhookSecret,
    [publicKey, secretKey, webhookSecret, lastSavedKeys]
  )

  const planCatalogDirty = useMemo(
    () => planCatalog.trim() !== lastSavedPlanCatalog.trim(),
    [planCatalog, lastSavedPlanCatalog]
  )

  const handleSaveKeys = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const [savedPublic, savedSecret, savedWebhook] = await Promise.all([
        settingsService.saveSetting(SETTINGS_KEYS.publicKey, publicKey.trim()),
        settingsService.saveSetting(SETTINGS_KEYS.secretKey, secretKey.trim()),
        settingsService.saveSetting(SETTINGS_KEYS.webhookSecret, webhookSecret.trim()),
      ])
      const maskedPublic = savedPublic?.value ?? publicKey.trim()
      const maskedSecret = savedSecret?.value ?? secretKey.trim()
      const maskedWebhook = savedWebhook?.value ?? webhookSecret.trim()

      setPublicKey(maskedPublic)
      setSecretKey(maskedSecret)
      setWebhookSecret(maskedWebhook)
      setSaveMessage("Settings saved successfully.")
      setLastSavedKeys({
        publicKey: maskedPublic,
        secretKey: maskedSecret,
        webhookSecret: maskedWebhook,
      })
    } catch {
      setSaveMessage("Failed to save settings. Check the values and try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePlanCatalog = async () => {
    setIsSavingPlans(true)
    setPlanSaveMessage(null)

    try {
      JSON.parse(planCatalog)
    } catch {
      setPlanSaveMessage("Plan catalog JSON is invalid.")
      setIsSavingPlans(false)
      return
    }

    try {
      await settingsService.saveSetting(
        SETTINGS_KEYS.planCatalog,
        planCatalog.trim()
      )
      setPlanSaveMessage("Plan catalog saved successfully.")
      setLastSavedPlanCatalog(planCatalog.trim())
    } catch {
      setPlanSaveMessage("Failed to save plan catalog. Check the values and try again.")
    } finally {
      setIsSavingPlans(false)
    }
  }

  const maskedSecretKey = secretKey ? `${secretKey.slice(0, 6)}••••••••` : ""

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
                <BreadcrumbPage>Settings</BreadcrumbPage>
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
            <CardTitle>Stripe keys</CardTitle>
            <CardDescription>
              Configure Stripe credentials used for embedded payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Publishable key</label>
              <Input
                value={publicKey}
                onChange={(event) => setPublicKey(event.target.value)}
                placeholder="pk_live_..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secret key</label>
              <Input
                value={secretKey}
                onChange={(event) => setSecretKey(event.target.value)}
                placeholder={maskedSecretKey || "sk_live_..."}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook secret</label>
              <Input
                value={webhookSecret}
                onChange={(event) => setWebhookSecret(event.target.value)}
                placeholder="whsec_..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {saveMessage ?? "Save to apply updated Stripe credentials."}
            </span>
            {keysDirty && (
              <span className="text-xs font-medium text-amber-400">
                Unsaved changes
              </span>
            )}
            <Button onClick={handleSaveKeys} disabled={isSaving || !keysDirty}>
              {isSaving ? "Saving..." : "Save keys"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan catalog</CardTitle>
            <CardDescription>
              Prices are stored in cents and default currency is EUR.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={14}
              value={planCatalog}
              onChange={(event) => setPlanCatalog(event.target.value)}
              className="font-mono text-xs"
            />
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {planSaveMessage ?? "Save to apply updates for new checkouts."}
            </span>
            {planCatalogDirty && (
              <span className="text-xs font-medium text-amber-400">
                Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSavePlanCatalog}
              disabled={isSavingPlans || !planCatalogDirty}
            >
              {isSavingPlans ? "Saving..." : "Save catalog"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SidebarInset>
  )
}
