import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ProgressStepperProps {
  steps: string[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full" aria-label="Progress">
      <div className="lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="max-w-[14rem] truncate text-right text-sm text-muted-foreground">
            {steps[currentStep - 1]}
          </span>
        </div>
        <div className="overflow-hidden rounded-full bg-secondary/65">
          <div
            className="h-2 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--primary),var(--secondary))] transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden lg:flex items-center justify-between" aria-label="Portal steps">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = currentStep > stepNumber
          const isCurrent = currentStep === stepNumber
          const isUpcoming = currentStep < stepNumber

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                    isCompleted && "border-primary bg-primary text-primary-foreground shadow-[0_12px_24px_-16px_rgba(15,36,74,0.65)]",
                    isCurrent && "border-accent bg-white text-foreground ring-4 ring-accent/30",
                    isUpcoming && "border-border bg-white/55 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>

                <span
                  className={cn(
                    "hidden text-sm font-semibold transition-colors duration-300 xl:block",
                    isCompleted && "text-foreground",
                    isCurrent && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-1 overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className={cn(
                        "h-full bg-[linear-gradient(90deg,var(--accent),var(--primary))] transition-all duration-500 ease-out",
                        isCompleted ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
