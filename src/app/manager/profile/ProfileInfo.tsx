'use client'

import { Check, Copy, Pencil } from "lucide-react"
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { languageLabels, type Language } from "@/i18n/config"
import { useProfile } from "@/hooks/useProfile"
import { FileService } from "@/services/file.service"
import userService, { type UpdateProfilePayload } from "@/services/user.service"
import { getMediaUrl } from "@/utils/get-media-url"
import { useMutation, useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"

const flags: Record<Language, string> = {
  en: "🇺🇸",
  de: "🇩🇪",
}

const DEFAULT_VALUE = "Not provided"
const EDITABLE_FIELDS = [
  "lastName",
  "phone",
  "country",
  "city",
  "avatarPath",
] as const

const humanize = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const getNameParts = (name?: string | null) => {
  if (!name) {
    return { firstName: DEFAULT_VALUE, lastName: DEFAULT_VALUE }
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return { firstName: DEFAULT_VALUE, lastName: DEFAULT_VALUE }
  }

  const [firstName, ...rest] = parts

  return {
    firstName,
    lastName: rest.length ? rest.join(" ") : DEFAULT_VALUE,
  }
}

type EditableField = (typeof EDITABLE_FIELDS)[number]
type EditableValues = Record<EditableField, string>

const buildEditableValues = (
  user?: Partial<Record<EditableField, string | null>> | null
): EditableValues => ({
  lastName: user?.lastName ?? "",
  phone: user?.phone ?? "",
  country: user?.country ?? "",
  city: user?.city ?? "",
  avatarPath: user?.avatarPath ?? "",
})

export function ProfileInfo() {
  const { isLoading, user, refetch } = useProfile()
  const initialValues = useMemo(
    () =>
      buildEditableValues(
        user && {
          lastName: user.lastName,
          phone: user.phone,
          country: user.country,
          city: user.city,
          avatarPath: user.avatarPath,
        }
      ),
    [user?.id, user?.lastName, user?.phone, user?.country, user?.city, user?.avatarPath]
  )
  const [formValues, setFormValues] = useState<EditableValues>(initialValues)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasCopiedReferral, setHasCopiedReferral] = useState(false)

  const hasChanges = useMemo(
    () =>
      EDITABLE_FIELDS.some((field) => formValues[field] !== initialValues[field]),
    [formValues, initialValues]
  )

  const handleInputChange = useCallback((field: EditableField, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const { mutate: submitProfile, isPending: isSaving } = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: async () => {
      await refetch()
      toast.success("Profile updated")
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while updating your profile"
      toast.error(message)
    },
  })

  const handleSave = () => {
    if (!hasChanges) {
      return
    }

    const payload = EDITABLE_FIELDS.reduce<UpdateProfilePayload>((acc, field) => {
      if (formValues[field] === initialValues[field]) {
        return acc
      }

      const trimmed = formValues[field].trim()
      acc[field] = trimmed ? trimmed : null

      return acc
    }, {})

    submitProfile(payload)
  }

  useEffect(() => {
    setFormValues((prev) => {
      const matches = EDITABLE_FIELDS.every(
        (field) => prev[field] === initialValues[field]
      )

      return matches ? prev : initialValues
    })
  }, [initialValues])

  const avatarPreview = getMediaUrl(formValues.avatarPath || user?.avatarPath || "")
  const referralLink = user?.referralLink ?? ""

  const handleAvatarUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target
      const file = input.files?.[0]
      if (!file) {
        return
      }

      const formData = new FormData()
      formData.append("media", file)

      try {
        setIsAvatarUploading(true)
        const response = await FileService.upload(formData, "users")
        const uploadedUrl = response.data?.[0]?.url

        if (!uploadedUrl) {
          toast.error("Failed to upload photo")
          return
        }

        setFormValues((prev) => ({
          ...prev,
          avatarPath: uploadedUrl,
        }))
        toast.success("Photo uploaded. Click Save to update your profile.")
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to upload photo"
        toast.error(message)
      } finally {
        input.value = ""
        setIsAvatarUploading(false)
      }
    },
    []
  )

  const handleCopyReferralLink = useCallback(async () => {
    if (!referralLink || typeof navigator === "undefined") {
      return
    }

    try {
      await navigator.clipboard.writeText(referralLink)
      setHasCopiedReferral(true)
      setTimeout(() => setHasCopiedReferral(false), 1500)
      toast.success("Referral link copied")
    } catch (error: any) {
      const message = error?.message || "Failed to copy referral link"
      toast.error(message)
    }
  }, [referralLink])

  const shouldDetectCountry = !user?.country

  const { data: detectedCountry } = useQuery({
    queryKey: ["detected-country", user?.id],
    enabled: shouldDetectCountry,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        const response = await userService.detectCountryByIp()
        if (response.data?.countryCode) {
          return response.data.countryCode
        }
      } catch (error) {
        console.warn("Failed to detect country from backend", error)
      }

      try {
        const result = await fetch("https://ipapi.co/json/")
        if (!result.ok) {
          throw new Error(`IP API request failed with ${result.status}`)
        }
        const payload = (await result.json()) as { country_code?: string }
        return payload.country_code ?? null
      } catch (error) {
        console.warn("Failed to detect country via ipapi", error)
        return null
      }
    },
  })

  useEffect(() => {
    if (!detectedCountry) {
      return
    }

    setFormValues((prev) => {
      if (prev.country) {
        return prev
      }
      if (prev.country === detectedCountry) {
        return prev
      }

      return {
        ...prev,
        country: detectedCountry,
      }
    })
  }, [detectedCountry])

  if (isLoading || !user) {
    return (
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <Skeleton className="h-5 w-28 rounded-full" />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 rounded-full" />
                  <Skeleton className="h-4 w-56 rounded-full" />
                </div>
              </div>
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-9 rounded-full" />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-full" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((col) => (
            <Card key={col}>
              <CardHeader className="flex items-center justify-between">
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const initials = (user.name || user.email || "User").slice(0, 2).toUpperCase()
  const rights =
    user.rights && user.rights.length > 0 ? user.rights : ["Standard access"]
  const readableRights = rights.map((right) =>
    right === "Standard access" ? right : humanize(right.replace(/_/g, " "))
  )
  const activePlanLabel = user.activePlanName
    ? `Plan: ${user.activePlanName}`
    : null
  const verificationStatus = user.verificationToken
    ? "Verification required"
    : "Verified"
  const fallbackNameParts = getNameParts(user.name)
  const firstNameValue = user.name || fallbackNameParts.firstName
  const languageLabel = user.language
    ? languageLabels[user.language]
    : DEFAULT_VALUE
  const fullName =
    [user.name, user.lastName].filter(Boolean).join(" ") || firstNameValue
  const locationParts = [user.city, user.country].filter(Boolean)

  const personalInformation: Array<{
    label: string
    value?: string
    type?: string
    editable?: boolean
    field?: EditableField
  }> = [
    { label: "First Name", value: firstNameValue, editable: false },
    { label: "Last Name", field: "lastName" },
    {
      label: "Email address",
      value: user.email,
      type: "email",
      editable: false,
    },
    { label: "Phone", field: "phone", type: "tel" },
    { label: "Country", field: "country" },
    { label: "City", field: "city" },
  ]

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarUploading}
                  className={cn(
                    "group relative rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isAvatarUploading ? "cursor-wait opacity-70" : "cursor-pointer hover:scale-[1.02]"
                  )}
                  aria-label="Update profile photo"
                  title="Update profile photo"
                >
                    <Avatar className="size-20 rounded-2xl border border-border/60">
                      {avatarPreview && (
                        <AvatarImage src={avatarPreview} alt={user.name || "Avatar"} />
                      )}
                      <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition group-hover:border-primary/40" />
                  {!avatarPreview && !isAvatarUploading && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 text-xs font-medium opacity-0 transition group-hover:opacity-100">
                      Upload photo
                    </span>
                  )}
                  {isAvatarUploading && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 text-sm font-medium">
                      Uploading...
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Upload
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold leading-tight">{fullName}</p>
                {locationParts.length > 0 && (
                  <p className="text-base text-muted-foreground">
                    {locationParts.join(", ")}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {readableRights.map((right) => (
                    <Badge key={right} variant="outline">
                      {right}
                    </Badge>
                  ))}
                  {activePlanLabel && (
                    <Badge variant="outline">{activePlanLabel}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full max-w-xl rounded-2xl border border-border/50 p-4">
              <p className="text-sm font-medium text-emerald-500">Referral link</p>
              <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="flex-1 rounded-xl border border-border/40 px-3 py-2 text-sm text-muted-foreground">
                  <p className="line-clamp-1 break-all">
                    {referralLink || "Link will appear once it is generated"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-emerald-500 text-emerald-500 px-4 hover:bg-emerald-500/10"
                  onClick={handleCopyReferralLink}
                  disabled={!referralLink}
                >
                  {hasCopiedReferral ? (
                    <>
                      <Check className="size-4" aria-hidden />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" aria-hidden />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-base font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account status</p>
              <p
                className={cn(
                  "text-base font-medium",
                  verificationStatus === "Verified"
                    ? "text-emerald-400"
                    : "text-red-400"
                )}
              >
                {verificationStatus}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preferred language</p>
              <p className="text-base font-medium flex items-center gap-2">
                <span>{flags[user.language as Language] ?? "🌐"}</span>
                <span>{languageLabel}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="space-y-0">
        <CardHeader className="flex flex-col gap-2 border-b border-border/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Personal Information</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-emerald-500 text-emerald-500 px-5 hover:bg-emerald-500/10"
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
          >
            <Pencil className="size-4" aria-hidden />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
          {personalInformation.map(({ label, value, type, editable = true, field }) => {
            const resolvedValue = field ? formValues[field] : value
            const inputValue =
              !resolvedValue || resolvedValue === DEFAULT_VALUE ? "" : resolvedValue
            const isMissingValue =
              Boolean(editable && field) && inputValue.trim().length === 0

            return (
              <div key={label} className="space-y-2">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Input
                  type={type ?? "text"}
                  value={inputValue}
                  placeholder={DEFAULT_VALUE}
                  readOnly={!editable}
                  aria-invalid={isMissingValue || undefined}
                  onChange={
                    editable && field
                      ? (event) => handleInputChange(field, event.target.value)
                      : undefined
                  }
                  className={cn(
                    !editable && "cursor-not-allowed bg-muted/10",
                  )}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
