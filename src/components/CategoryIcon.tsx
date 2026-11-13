import { Coffee, Coins, Hand, HeartHandshake, MessageCircle, Signpost, ShoppingBag, Sparkles, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  greetings: Hand,
  introductions: Sparkles,
  cafe: Coffee,
  shopping: ShoppingBag,
  directions: Signpost,
  numbers: Coins,
  family: Users,
  feelings: HeartHandshake,
  expressions: MessageCircle,
}

export default function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const Icon = icons[id] ?? MessageCircle
  return <Icon className={className} aria-hidden />
}
