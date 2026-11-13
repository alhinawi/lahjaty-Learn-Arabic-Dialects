import {
  BedDouble,
  Briefcase,
  CarTaxiFront,
  CloudSun,
  Coffee,
  Coins,
  Flame,
  Hand,
  HeartHandshake,
  MessageCircle,
  MessagesSquare,
  Moon,
  PartyPopper,
  Phone,
  Plane,
  Siren,
  Signpost,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  ThumbsUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
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
  doctor: Stethoscope,
  work: Briefcase,
  phone: Phone,
  taxi: CarTaxiFront,
  occasions: PartyPopper,
  compliments: ThumbsUp,
  arguing: MessagesSquare,
  slang: Flame,
  food: UtensilsCrossed,
  weather: CloudSun,
  religious: Moon,
  travel: Plane,
  hotel: BedDouble,
  emergency: Siren,
}

export default function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const Icon = icons[id] ?? MessageCircle
  return <Icon className={className} aria-hidden />
}
