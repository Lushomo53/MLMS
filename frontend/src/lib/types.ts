export interface Season {
  id: number
  name: string
  slug: string
  start_date: string
  is_demo: boolean
  current_matchweek: number
  total_matchweeks: number
}
export interface Team {
  id: number
  name: string
  short_name: string
  slug: string
  abbreviation: string
  color: string
  ground: string
  description: string
}
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'
export interface Player {
  id: number
  team_id: number
  name: string
  shirt_number: number
  position: Position
  goals: number
  rank?: number
}
export interface Goal {
  id: number
  player_id: number | null
  credited_team_id: number
  minute: number
  own_goal: boolean
}
export interface Fixture {
  id: number
  matchweek: number
  home_team_id: number
  away_team_id: number
  kickoff: string | null
  venue: string
  status: 'scheduled' | 'completed' | 'postponed'
  home_score: number | null
  away_score: number | null
  goals: Goal[]
}
export interface Standing {
  team_id: number
  rank: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: ('W' | 'D' | 'L')[]
}
export interface LeagueSnapshot {
  season: Season | null
  teams: Team[]
  players: Player[]
  fixtures: Fixture[]
  standings: Standing[]
  scorers: Player[]
}
export type Panel = { type: 'match'; id: number } | { type: 'player'; id: number } | null
