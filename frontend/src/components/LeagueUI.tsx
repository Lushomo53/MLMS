import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, ChevronRight, MapPin, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { matchDate, matchTime, positions, signed, useLeague } from '../lib/league'
import type { Fixture, Player, Standing, Team } from '../lib/types'
import DepthSurface from './DepthSurface'
import PitchLines from './PitchLines'

export function Crest({
  team,
  size = 'normal',
}: {
  team: Team
  size?: 'tiny' | 'small' | 'normal' | 'large' | 'hero'
}) {
  return (
    <span
      className={'crest crest--' + size}
      style={{ '--club-color': team.color } as CSSProperties}
      aria-hidden="true"
    >
      <span>{team.abbreviation}</span>
    </span>
  )
}
export function Form({ results }: { results: Standing['form'] }) {
  return (
    <span
      className="form-sequence"
      aria-label={'Recent form, oldest first: ' + (results.join(', ') || 'No matches played')}
    >
      {results.length ? (
        results.map((result, i) => (
          <span
            key={i}
            className={'form-mark form-' + result}
            title={{ W: 'Win', D: 'Draw', L: 'Loss' }[result]}
          >
            {result}
          </span>
        ))
      ) : (
        <span className="muted">—</span>
      )}
    </span>
  )
}
export function SectionHeading({
  title,
  to,
  link = 'View all',
  note,
}: {
  title: string
  to?: string
  link?: string
  note?: string
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </div>
      {to && (
        <Link className="inline-link" to={to}>
          {link}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  )
}
export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {title}
          <span className="accent">.</span>
        </h1>
      </div>
      {children}
    </div>
  )
}
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <CalendarDays size={28} />
      <h2>{title}</h2>
      {children && <div>{children}</div>}
    </div>
  )
}
export function FixtureRow({ match }: { match: Fixture }) {
  const { teams, openPanel } = useLeague()
  const home = teams.get(match.home_team_id)!,
    away = teams.get(match.away_team_id)!
  const completed = match.status === 'completed'
  return (
    <button
      className="fixture-row"
      onClick={() => openPanel({ type: 'match', id: match.id })}
      aria-label={
        home.name +
        ' versus ' +
        away.name +
        ', ' +
        (completed ? match.home_score + ' to ' + match.away_score : matchDate(match.kickoff))
      }
    >
      <span className="fixture-date">
        {matchDate(match.kickoff)}
        <small>
          {match.status === 'postponed'
            ? 'Postponed'
            : completed
              ? 'Full time'
              : matchTime(match.kickoff)}
        </small>
      </span>
      <span className="fixture-team fixture-home">
        <span>{home.short_name}</span>
        <Crest team={home} size="small" />
      </span>
      <span className={'fixture-score ' + (completed ? 'is-result' : '')}>
        {completed ? (
          <>
            {match.home_score}
            <span>:</span>
            {match.away_score}
          </>
        ) : match.status === 'postponed' ? (
          'P–P'
        ) : (
          'vs'
        )}
      </span>
      <span className="fixture-team fixture-away">
        <Crest team={away} size="small" />
        <span>{away.short_name}</span>
      </span>
      <ChevronRight className="fixture-chevron" size={16} />
    </button>
  )
}
export function FeaturedMatch({ match }: { match: Fixture }) {
  const { teams, openPanel } = useLeague()
  const home = teams.get(match.home_team_id)!,
    away = teams.get(match.away_team_id)!
  return (
    <DepthSurface className="featured-depth">
      <section
        className="featured-match"
        style={{ '--home-color': home.color, '--away-color': away.color } as CSSProperties}
      >
        <div className="featured-banner" aria-hidden="true">
          <span>{home.abbreviation}</span>
          <span>{away.abbreviation}</span>
        </div>
        <PitchLines />
        <div className="featured-top">
          <span className="eyebrow">
            {match.status === 'completed' ? 'Latest result' : 'The next chapter'}
          </span>
          <span className="matchweek-label">
            MATCHWEEK {String(match.matchweek).padStart(2, '0')}
          </span>
        </div>
        <p className="featured-date">
          {matchDate(match.kickoff)} <span>/</span>{' '}
          {match.status === 'completed' ? 'Full time' : matchTime(match.kickoff) + ' CAT'}
        </p>
        <div className="featured-teams">
          <Link className="featured-team" to={'/teams/' + home.slug}>
            <Crest team={home} size="hero" />
            <h3>{home.name}</h3>
            <span>HOME</span>
          </Link>
          <div className="featured-versus">
            {match.status === 'completed' ? match.home_score + ' : ' + match.away_score : 'VS'}
            <span>MUSU LEAGUE</span>
          </div>
          <Link className="featured-team" to={'/teams/' + away.slug}>
            <Crest team={away} size="hero" />
            <h3>{away.name}</h3>
            <span>AWAY</span>
          </Link>
        </div>
        <div className="featured-footer">
          <span>
            <MapPin size={14} />
            {match.venue}
          </span>
          <button
            className="primary-button"
            onClick={() => openPanel({ type: 'match', id: match.id })}
          >
            Match details
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </DepthSurface>
  )
}
export function StandingsTable({
  compact = false,
  highlightTeamId,
}: {
  compact?: boolean
  highlightTeamId?: number
}) {
  const { data, teams } = useLeague()
  const rows = compact ? data.standings.slice(0, 5) : data.standings
  return (
    <div className={'table-scroll ' + (compact ? 'compact-table' : '')}>
      <table className="standings-table">
        <caption className="sr-only">
          League standings. Ordered by points, goal difference, then goals scored.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="rank-col">
              #
            </th>
            <th scope="col" className="club-col">
              Club
            </th>
            <th scope="col">
              <abbr title="Played">P</abbr>
            </th>
            {!compact && (
              <>
                <th scope="col">
                  <abbr title="Won">W</abbr>
                </th>
                <th scope="col">
                  <abbr title="Drawn">D</abbr>
                </th>
                <th scope="col">
                  <abbr title="Lost">L</abbr>
                </th>
                <th scope="col">
                  <abbr title="Goals for">GF</abbr>
                </th>
                <th scope="col">
                  <abbr title="Goals against">GA</abbr>
                </th>
              </>
            )}
            <th scope="col">
              <abbr title="Goal difference">GD</abbr>
            </th>
            <th scope="col" className="points-col">
              <abbr title="Points">Pts</abbr>
            </th>
            {!compact && (
              <th scope="col" className="form-col">
                Last 5
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const team = teams.get(row.team_id)!
            return (
              <tr
                key={team.id}
                className={row.rank === 1 ? 'leader-row' : ''}
                data-spotlight={highlightTeamId === team.id}
              >
                <td className="rank-col">{String(row.rank).padStart(2, '0')}</td>
                <th scope="row" className="club-col">
                  <Link to={'/teams/' + team.slug}>
                    <Crest team={team} size="small" />
                    <span>{compact ? team.short_name : team.name}</span>
                  </Link>
                </th>
                <td>{row.played}</td>
                {!compact && (
                  <>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goals_for}</td>
                    <td>{row.goals_against}</td>
                  </>
                )}
                <td>{signed(row.goal_difference)}</td>
                <td className="points-col">
                  <span className="score-reveal" key={row.points}>
                    {row.points}
                  </span>
                </td>
                {!compact && (
                  <td className="form-col">
                    <MatchForm teamId={team.id} />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export function PlayerRow({ player, ranking = false }: { player: Player; ranking?: boolean }) {
  const { teams, openPanel } = useLeague()
  const team = teams.get(player.team_id)!
  return (
    <button className="player-row" onClick={() => openPanel({ type: 'player', id: player.id })}>
      <span className="player-number">
        {ranking
          ? String(player.rank).padStart(2, '0')
          : String(player.shirt_number).padStart(2, '0')}
      </span>
      <span className="player-monogram" style={{ '--club-color': team.color } as CSSProperties}>
        {player.name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </span>
      <span className="player-name">
        {player.name}
        <small>{ranking ? team.name : positions[player.position]}</small>
      </span>
      <span className="player-goals">
        {player.goals}
        <small>GOALS</small>
      </span>
      <ChevronRight size={15} className="muted" />
    </button>
  )
}

function MatchForm({ teamId }: { teamId: number }) {
  const { data, teams, openPanel } = useLeague()
  const club = teams.get(teamId)!
  const matches = data.fixtures
    .filter(
      (match) =>
        match.status === 'completed' &&
        (match.home_team_id === teamId || match.away_team_id === teamId),
    )
    .sort((a, b) => {
      const first = a.kickoff ? Date.parse(a.kickoff) : Infinity
      const second = b.kickoff ? Date.parse(b.kickoff) : Infinity
      return first - second || a.id - b.id
    })
    .slice(-5)
  return (
    <span className="form-sequence interactive-form" aria-label="Recent matches, oldest first">
      {matches.length ? (
        matches.map((match) => {
          const home = match.home_team_id === teamId
          const scored = (home ? match.home_score : match.away_score)!
          const conceded = (home ? match.away_score : match.home_score)!
          const result = scored > conceded ? 'W' : scored === conceded ? 'D' : 'L'
          const opponent = teams.get(home ? match.away_team_id : match.home_team_id)!
          const label =
            club.name +
            ': ' +
            { W: 'win', D: 'draw', L: 'loss' }[result] +
            ', ' +
            scored +
            '–' +
            conceded +
            ' vs ' +
            opponent.name +
            ', ' +
            matchDate(match.kickoff)
          return (
            <button
              key={match.id}
              className={'form-mark form-' + result}
              aria-label={label}
              title={label}
              onClick={() => openPanel({ type: 'match', id: match.id })}
            >
              {result}
            </button>
          )
        })
      ) : (
        <span className="muted">—</span>
      )}
    </span>
  )
}
