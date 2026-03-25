"use client"

import { CustomerType } from "@/app/page"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { UserCheck, UserPlus, ArrowRight } from "lucide-react"

interface CustomerTypeStepProps {
  onSelect: (type: CustomerType) => void
}

export function CustomerTypeStep({ onSelect }: CustomerTypeStepProps) {
  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <div className="text-center lg:text-left space-y-3 max-w-2xl mx-auto lg:mx-0">
        <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-balance leading-snug">
          Welcome to the Claire Sailesh Car Rental Customer Portal
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Create your rental contract request in a few simple steps. Let&apos;s start by identifying your customer status.
        </p>
      </div>

      {/* Question */}
      <div className="space-y-1">
        <h3 className="text-base font-medium">Are you already a customer?</h3>
        <p className="text-sm text-muted-foreground">
          Select your customer type to proceed with the appropriate form.
        </p>
      </div>

      {/* Selection Cards */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <SelectionCard
          icon={UserCheck}
          title="Yes, I&apos;m already a customer"
          description="I have an existing account and want to create a new contract request."
          onClick={() => onSelect("existing")}
        />
        <SelectionCard
          icon={UserPlus}
          title="No, I&apos;m a new customer"
          description="I&apos;m new here and would like to register and create my first contract."
          onClick={() => onSelect("new")}
        />
      </div>
    </div>
  )
}

function SelectionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof UserCheck
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        "active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col h-full">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h4 className="text-base font-medium mb-1 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            {description}
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
