// src/lib/utils.js
import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getRoleIcon(role) {
  const icons = {
    government: 'Landmark',
    bank: 'Building2',
    investor: 'TrendingUp',
    citizen: 'Users'
  }
  return icons[role] || 'User'
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function getMetricColor(value, inverted = false) {
  const v = inverted ? 100 - value : value
  if (v >= 70) return 'text-green-400'
  if (v >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export function getMetricBarColor(value, inverted = false) {
  const v = inverted ? 100 - value : value
  if (v >= 70) return 'bg-green-500'
  if (v >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function calculateTimeRemaining(startedAt, duration) {
  if (!startedAt) return duration
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  return Math.max(0, duration - elapsed)
}

export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
