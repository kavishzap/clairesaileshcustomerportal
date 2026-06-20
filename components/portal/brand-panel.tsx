import { ShieldCheck, Smartphone, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrandPanelProps {
  className?: string
}

export function BrandPanel({ className }: BrandPanelProps) {
  return (
    <aside
      className={cn(
        "portal-panel relative overflow-hidden p-6 sm:p-8 lg:p-10",
        "bg-[linear-gradient(160deg,color-mix(in_oklch,var(--foreground)_88%,transparent)_0%,color-mix(in_oklch,var(--primary)_82%,black)_52%,color-mix(in_oklch,var(--secondary)_64%,black)_100%)] text-white",
        className
      )}
      aria-label="Portal overview"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--accent)_42%,transparent)_0%,transparent_70%)] opacity-70" />
      <div className="absolute -right-16 top-28 h-44 w-44 rounded-full border border-white/15 bg-white/8 blur-2xl" />
      <div className="absolute -left-12 bottom-12 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative flex h-full flex-col gap-8">
        <div className="space-y-5">
          <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/88">
            Claire Sailesh
          </span>
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              A cleaner rental request flow for every screen.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/78 sm:text-base">
              The portal now guides customers through verification, registration,
              contract details, and confirmation in one responsive experience.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <FeatureItem
            icon={Smartphone}
            title="Mobile-first layout"
            description="Cards, forms, and actions stack cleanly on phones while staying polished on larger screens."
          />
          <FeatureItem
            icon={ShieldCheck}
            title="Accessible interaction"
            description="Stronger contrast, visible focus rings, semantic sections, and clearer feedback support more users."
          />
          <FeatureItem
            icon={Sparkles}
            title="Branded visual tone"
            description="Warm sand, ocean, and gold accents bring the portal closer to a real customer-facing product."
          />
        </div>

        <div className="mt-auto grid gap-3 sm:grid-cols-3">
          <Metric label="Step flow" value="5 stages" />
          <Metric label="Designed for" value="Web + mobile" />
          <Metric label="Customer path" value="Guided" />
        </div>
      </div>
    </aside>
  )
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Smartphone
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/72">{description}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/12 bg-black/10 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/58">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
