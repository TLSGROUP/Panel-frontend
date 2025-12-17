import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Referals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Referals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}

const plans = [
  {
    name: "Bronze",
    color: "text-amber-700",
    price: "$19/mo",
    description: "Ideal for freelancers and mini teams.",
    features: ["1 project", "Basic analytics", "Email support"],
  },
  {
    name: "Silver",
    color: "text-slate-200",
    price: "$49/mo",
    description: "For teams that grow steadily.",
    features: ["5 projects", "Advanced analytics", "Priority support"],
  },
  {
    name: "Gold",
    color: "text-yellow-400",
    price: "$99/mo",
    description: "Optimized for agencies and startups.",
    features: ["Unlimited projects", "Automation tools", "Account manager"],
    featured: true,
  },
  {
    name: "Brilliant",
    color: "text-sky-200",
    price: "$199/mo",
    description: "Complete toolkit for enterprises.",
    features: ["All Pro features", "99.9% SLA", "Custom onboarding"],
  },
]

export function PlanCards() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <h2 className="text-center text-xl font-semibold uppercase tracking-wide text-muted-foreground">
        Plans
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className="flex flex-col border border-primary/10 bg-card/80 backdrop-blur @container/plan"
          >
            <CardHeader>
              <div className="flex items-baseline justify-between gap-2">
                <CardTitle className={`text-xl font-semibold ${plan.color}`}>
                  {plan.name}
                </CardTitle>
                <span className="text-lg font-semibold text-primary">
                  {plan.price}
                </span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <div key={feature} className="text-muted-foreground">
                  {feature}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                variant="default"
              >
                Buy
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
