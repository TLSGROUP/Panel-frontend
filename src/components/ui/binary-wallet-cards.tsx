"use client"

import { useMemo } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Badge } from "@/components/ui/Badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import mlmEngineService from "@/services/mlm-engine.service"

type BinarySettings = {
  pairVolume: number
  pairPercent: number
  carryoverMaxRatio: number
  minActivePersonals: number
  minWeakLegBvPerDay: number
  requirePersonalsInEachLeg: boolean
  weeklyBinaryCap: number
  trackPersonalVsSpillover: boolean
  minPersonalShareInWeakLeg: number
}

function toNumber(value: unknown, fallback: number) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

function toBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") return value === "true"
  return fallback
}

export function BinaryWalletCards() {
  const { data: enabledModules } = useQuery({
    queryKey: ["mlm-enabled-modules"],
    queryFn: () => mlmEngineService.fetchEnabledModuleKeys(),
  })
  const isBinaryActive = enabledModules?.includes("binary")

  const { data: binaryModule } = useQuery({
    queryKey: ["mlm-module-settings", "binary"],
    queryFn: () => mlmEngineService.fetchModuleSettings("binary"),
    enabled: Boolean(isBinaryActive),
  })

  const settings = useMemo<BinarySettings>(() => {
    const raw = binaryModule?.settings ?? {}
    return {
      pairVolume: toNumber(raw.pairVolume, 50),
      pairPercent: toNumber(raw.pairPercent, 10),
      carryoverMaxRatio: toNumber(raw.carryoverMaxRatio, 3),
      minActivePersonals: toNumber(raw.minActivePersonals, 2),
      minWeakLegBvPerDay: toNumber(raw.minWeakLegBvPerDay, 50),
      requirePersonalsInEachLeg: toBoolean(raw.requirePersonalsInEachLeg, true),
      weeklyBinaryCap: toNumber(raw.weeklyBinaryCap, 0),
      trackPersonalVsSpillover: toBoolean(raw.trackPersonalVsSpillover, true),
      minPersonalShareInWeakLeg: toNumber(raw.minPersonalShareInWeakLeg, 30),
    }
  }, [binaryModule?.settings])

  if (!isBinaryActive) return null

  const pairBonusLabel = `${settings.pairVolume} BV × ${settings.pairPercent}%`
  const personalsLabel = `Min personals: ${settings.minActivePersonals}`
  const legRequirementLabel = settings.requirePersonalsInEachLeg
    ? "Each leg required"
    : "Each leg optional"
  const weakLegLabel = `Weak leg ≥ ${settings.minWeakLegBvPerDay} BV/day`
  const carryoverLabel = `Strong leg counts up to ${settings.carryoverMaxRatio}×`
  const capLabel =
    settings.weeklyBinaryCap > 0
      ? `${settings.weeklyBinaryCap.toLocaleString()} weekly`
      : "No weekly cap"
  const spilloverLabel = settings.trackPersonalVsSpillover
    ? `Personal share ≥ ${settings.minPersonalShareInWeakLeg}%`
    : "Personal vs spillover not tracked"

  const indicatorIcon = <TrendingUp />

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-5 lg:px-6">
      <Card className="@container/card overflow-hidden">
        <CardHeader className="min-w-0">
          <CardDescription>Pair Payout</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {pairBonusLabel}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-emerald-200"
            >
              {indicatorIcon}
              Per pair
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          One pair pays the configured percentage of BV.
        </CardContent>
      </Card>

      <Card className="@container/card overflow-hidden">
        <CardHeader className="min-w-0">
          <CardDescription>Carryover Limit</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {settings.carryoverMaxRatio}×
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-indigo-400/40 text-indigo-200"
            >
              {indicatorIcon}
              Cap
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {carryoverLabel} weak leg.
        </CardContent>
      </Card>

      <Card className="@container/card overflow-hidden">
        <CardHeader className="min-w-0">
          <CardDescription>Payout Cap</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {capLabel}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-rose-400/40 text-rose-200"
            >
              {indicatorIcon}
              Weekly
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Weekly binary earnings limit.
        </CardContent>
      </Card>

      <Card className="@container/card overflow-hidden">
        <CardHeader className="min-w-0">
          <CardDescription>Personal vs Spillover</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {settings.trackPersonalVsSpillover ? "Tracked" : "Off"}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-cyan-400/40 text-cyan-200"
            >
              {indicatorIcon}
              Rule
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {spilloverLabel}
        </CardContent>
      </Card>
    </div>
  )
}
