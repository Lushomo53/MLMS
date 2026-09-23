import { createContext, useContext } from 'react'
import type { LeagueSnapshot, Panel, Player, Team } from './types'

export interface LeagueContextValue {
  data: LeagueSnapshot
  teams: Map<number, Team>
  players: Map<number, Player>
  openPanel: (panel: Exclude<Panel, null>) => void
  closePanel: () => void
}
export const LeagueContext = createContext<LeagueContextValue | null>(null)
export function useLeague() {
  const value = useContext(LeagueContext)
  if (!value) throw new Error('League components require LeagueContext.')
  return value
}
export const positions = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' }
export function matchDate(iso: string | null, long = false) {
  return iso
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lusaka',
        weekday: long ? 'long' : 'short',
        day: 'numeric',
        month: long ? 'long' : 'short',
      }).format(new Date(iso))
    : 'Date to be confirmed'
}
export function matchTime(iso: string | null) {
  return iso
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lusaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(iso))
    : 'TBC'
}
export function signed(value: number) {
  return value > 0 ? '+' + value : String(value)
}
export function shortName(name: string) {
  const [first, ...rest] = name.split(' ')
  return first[0] + '. ' + rest.join(' ')
}
