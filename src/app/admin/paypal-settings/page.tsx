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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import settingsService from "@/services/settings.service"

const SETTINGS_KEYS = {
  clientId: "paypal.client_id",
  secret: "paypal.secret",
  mode: "paypal.mode",
}

export default function AdminPaypalSettingsPage() {
  const [clientId, setClientId] = useState("")
  const [secret, setSecret] = useState("")
  const [mode, setMode] = useState("sandbox")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState({
    clientId: "",
    secret: "",
    mode: "sandbox",
  })

  const { data: clientData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.clientId],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.clientId),
  })

  const { data: secretData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.secret],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.secret),
  })

  const { data: modeData } = useQuery({
    queryKey: ["settings", SETTINGS_KEYS.mode],
    queryFn: () => settingsService.fetchSetting(SETTINGS_KEYS.mode),
  })

  useEffect(() => {
    if (clientData?.value) {
      setClientId(clientData.value)
      setLastSaved((prev) => ({ ...prev, clientId: clientData.value }))
    }
    if (secretData?.value) {
      setSecret(secretData.value)
      setLastSaved((prev) => ({ ...prev, secret: secretData.value }))
    }
    if (modeData?.value) {
      setMode(modeData.value)
      setLastSaved((prev) => ({ ...prev, mode: modeData.value }))
    }
  }, [clientData, secretData, modeData])

  const isDirty = useMemo(
    () =>
      clientId.trim() !== lastSaved.clientId ||
      secret.trim() !== lastSaved.secret ||
      mode !== lastSaved.mode,
    [clientId, secret, mode, lastSaved]
  )

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const [savedClient, savedSecret, savedMode] = await Promise.all([
        settingsService.saveSetting(SETTINGS_KEYS.clientId, clientId.trim()),
        settingsService.saveSetting(SETTINGS_KEYS.secret, secret.trim()),
        settingsService.saveSetting(SETTINGS_KEYS.mode, mode),
      ])
      const maskedClient = savedClient?.value ?? clientId.trim()
      const maskedSecret = savedSecret?.value ?? secret.trim()
      const savedModeValue = savedMode?.value ?? mode

      setClientId(maskedClient)
      setSecret(maskedSecret)
      setMode(savedModeValue)
      setSaveMessage("PayPal settings saved successfully.")
      setLastSaved({
        clientId: maskedClient,
        secret: maskedSecret,
        mode: savedModeValue,
      })
    } catch {
      setSaveMessage("Failed to save PayPal settings.")
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
                <BreadcrumbPage>PayPal settings</BreadcrumbPage>
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
            <CardTitle>PayPal settings</CardTitle>
            <CardDescription>
              Configure PayPal credentials and payment preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client ID</label>
              <Input
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                placeholder="PayPal client ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secret</label>
              <Input
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="PayPal secret"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardContent className="flex items-center justify-between gap-3 pt-0">
            <span className="text-sm text-muted-foreground">
              {saveMessage ?? "Save to apply PayPal settings."}
            </span>
            <Button onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? "Saving..." : "Save settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
