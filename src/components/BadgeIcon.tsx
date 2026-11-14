'use client'

import { BookOpen, Compass, Crown, Flame, Heart, Layers, Medal, Star, Type } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BadgeIcon as BadgeIconId } from '../lib/achievements'

const ICONS: Record<BadgeIconId, LucideIcon> = {
  lesson: BookOpen,
  words: Type,
  flame: Flame,
  quiz: Medal,
  star: Star,
  crown: Crown,
  compass: Compass,
  heart: Heart,
  layers: Layers,
}

export default function BadgeIcon({ icon, className }: { icon: BadgeIconId; className?: string }) {
  const Icon = ICONS[icon]
  return <Icon className={className} aria-hidden />
}
