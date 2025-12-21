'use client'

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
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const invoices = [
  { id: "INV-2401", date: "2024-04-01", amount: "$89.00", status: "Paid" },
  { id: "INV-2390", date: "2024-03-01", amount: "$89.00", status: "Paid" },
  { id: "INV-2379", date: "2024-02-01", amount: "$89.00", status: "Paid" },
]

export default function BillingPage() {
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
                  <BreadcrumbPage>Billing</BreadcrumbPage>
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
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Current plan: Pro</CardTitle>
                <CardDescription>
                  Unlimited projects with automation and dedicated manager.
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold">$89</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 @md:grid-cols-2">
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  Next billing date
                </p>
                <p className="text-lg font-medium">May 30, 2024</p>
              </div>
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  Payment method
                </p>
                <p className="text-lg font-medium">**** 4242 · Visa</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="default">Upgrade plan</Button>
              <Button variant="outline">Update payment method</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent invoices</CardTitle>
              <CardDescription>Download receipts for your records.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-white/5">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-2 py-4 @md:flex-row @md:items-center @md:justify-between"
                >
                  <div>
                    <p className="font-semibold">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold">{invoice.amount}</span>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-muted-foreground">
                      {invoice.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
    </SidebarInset>
  )
}
