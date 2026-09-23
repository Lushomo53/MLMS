import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { signed, useLeague } from '../lib/league'
import {
  Crest,
  EmptyState,
  FixtureRow,
  Form,
  PlayerRow,
  SectionHeading,
} from '../components/LeagueUI'
import type { Position } from '../lib/types'

export default function TeamProfile() {
  const { slug } = useParams()
  const { data } = useLeague()
  const [position, setPosition] = useState<Position | 'all'>('all')
  const team = data.teams.find((t) => t.slug === slug)
  if (!team)
    return (
      <EmptyState title="Team not found">
        <p>This club is not part of the published season.</p>
        <Link to="/teams" className="inline-link">
          Return to teams
        </Link>
      </EmptyState>
    )
  const record = data.standings.find((row) => row.team_id === team.id)!
  const players = data.players
    .filter((p) => p.team_id === team.id)
    .sort((a, b) => a.shirt_number - b.shirt_number)
  const filtered = players.filter((p) => position === 'all' || p.position === position)
  const matches = data.fixtures.filter(
    (m) => m.home_team_id === team.id || m.away_team_id === team.id,
  )
  const next = matches.find((m) => m.status === 'scheduled')
  const recent = matches
    .filter((m) => m.status === 'completed')
    .slice(-3)
    .reverse()
  return (
    <>
      <Link className="back-link" to="/teams">
        <ArrowLeft size={16} />
        All clubs
      </Link>
      <section
        className="team-profile-header"
        style={{ '--club-color': team.color } as CSSProperties}
      >
        <Crest team={team} size="hero" />
        <div>
          <p className="eyebrow">MUSU STUDENT LEAGUE / CLUB PROFILE</p>
          <h1>
            {team.name}
            <span>.</span>
          </h1>
          <p>{team.description}</p>
          <span className="venue-line">
            <MapPin size={14} />
            {team.ground}
          </span>
        </div>
      </section>
      <div className="team-stats">
        <div>
          <span className="eyebrow">League position</span>
          <strong>
            {String(record.rank).padStart(2, '0')}
            <small> / {data.teams.length}</small>
          </strong>
        </div>
        <div>
          <span className="eyebrow">Points</span>
          <strong>{record.points}</strong>
        </div>
        <div>
          <span className="eyebrow">Goals scored</span>
          <strong>{record.goals_for}</strong>
        </div>
        <div>
          <span className="eyebrow">Goal difference</span>
          <strong>{signed(record.goal_difference)}</strong>
        </div>
        <div className="team-form">
          <span className="eyebrow">Recent form</span>
          <Form results={record.form} />
        </div>
      </div>
      <div className="profile-grid">
        <section>
          <SectionHeading title="Meet the squad" note={players.length + ' players. One badge.'} />
          <div className="position-filter" aria-label="Filter squad by position">
            {(['all', 'GK', 'DEF', 'MID', 'FWD'] as const).map((p) => (
              <button
                key={p}
                aria-pressed={position === p}
                className={position === p ? 'selected' : ''}
                onClick={() => setPosition(p)}
              >
                {
                  {
                    all: 'All players',
                    GK: 'Keepers',
                    DEF: 'Defenders',
                    MID: 'Midfielders',
                    FWD: 'Forwards',
                  }[p]
                }
              </button>
            ))}
          </div>
          <div className="squad-list">
            {filtered.map((player) => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </div>
          {!filtered.length && <EmptyState title="No players in this position" />}
        </section>
        <aside>
          <SectionHeading title="Next up" />
          {next ? (
            <div className="team-next-match">
              <span className="eyebrow">MATCHWEEK {String(next.matchweek).padStart(2, '0')}</span>
              <FixtureRow match={next} />
            </div>
          ) : (
            <EmptyState title="No upcoming fixture" />
          )}
          <div className="profile-results">
            <SectionHeading
              title="Recent results"
              to="/fixtures?week=all&status=completed"
              link="League results"
            />
            <div className="fixture-list">
              {recent.map((match) => (
                <FixtureRow key={match.id} match={match} />
              ))}
            </div>
            {!recent.length && <EmptyState title="Results on the way" />}
          </div>
        </aside>
      </div>
    </>
  )
}
