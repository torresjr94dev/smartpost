import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'

export function timeAgo(dateStr) {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es })
}

export function formatMessageTime(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Ayer ' + format(d, 'HH:mm')
  return format(d, 'dd MMM HH:mm', { locale: es })
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d))     return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  return format(d, "d 'de' MMMM", { locale: es })
}
