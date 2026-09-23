import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import MatchdayIdentity from '../components/MatchdayIdentity'
import { useLeague } from '../lib/league'
import {
  FeaturedMatch,
  FixtureRow,
  PlayerRow,
  SectionHeading,
  StandingsTable,
  EmptyState,
} from '../components/LeagueUI'

export default function Overview() {
  const { data, teams, openPanel } = useLeague()
  const upcoming = data.fixtures.filter((m) => m.status === 'scheduled')
  const completed = data.fixtures.filter((m) => m.status === 'completed')
  const lastWeek = Math.max(0, ...completed.map((m) => m.matchweek))
  const latest = completed.filter((m) => m.matchweek === lastWeek).slice(0, 4)
  const featured = upcoming[0] || completed.at(-1)
  const playedWeeks = Array.from(new Set(data.fixtures.map((m) => m.matchweek))).filter((week) =>
    data.fixtures.filter((m) => m.matchweek === week).every((m) => m.status === 'completed'),
  ).length
  return (
    <>
      <MatchdayIdentity playedWeeks={playedWeeks} />
      {!!latest.length && (
        <section className="result-strip" aria-label="Latest results">
          <div className="result-strip-label">
            <span className="eyebrow">Last time out</span>
            <strong>MW {String(lastWeek).padStart(2, '0')}</strong>
          </div>
          {latest.map((match) => (
            <button
              className="result-tile"
              key={match.id}
              onClick={() => openPanel({ type: 'match', id: match.id })}
              aria-label={'View ' + teams.get(match.home_team_id)!.name + ' result'}
            >
              <span className="result-tile-teams">
                <span>
                  {teams.get(match.home_team_id)!.abbreviation}
                  <b>{match.home_score}</b>
                </span>
                <span>
                  {teams.get(match.away_team_id)!.abbreviation}
                  <b>{match.away_score}</b>
                </span>
              </span>
              <span className="result-tile-status">
                FT
                <ArrowUpRight size={14} />
              </span>
            </button>
          ))}
        </section>
      )}
      <div className="overview-grid">
        <div>
          {featured ? (
            <FeaturedMatch match={featured} />
          ) : (
            <EmptyState title="Fixtures on the way">
              <p>The schedule will appear once it is published.</p>
            </EmptyState>
          )}
        </div>
        <section className="table-panel">
          <SectionHeading title="The table" to="/standings" link="Full table" />
          <StandingsTable compact />
          <div className="table-panel-footer">
            <span>Every point counts.</span>
            <span>{data.teams.length} CLUBS</span>
          </div>
        </section>
      </div>
      <div className="overview-grid lower-grid">
        <section>
          <SectionHeading
            title="Around the grounds"
            to="/fixtures"
            link="All fixtures"
            note={'Coming up in matchweek ' + data.season!.current_matchweek}
          />
          <div className="fixture-list">
            {upcoming
              .filter(
                (m) => m.id !== featured?.id && m.matchweek === data.season!.current_matchweek,
              )
              .map((match) => (
                <FixtureRow key={match.id} match={match} />
              ))}
            {!upcoming.length && (
              <EmptyState title="The season is complete">
                <p>Explore the results from every matchweek.</p>
                <Link to="/fixtures?week=all&status=completed" className="inline-link">
                  View results
                  <ArrowRight size={16} />
                </Link>
              </EmptyState>
            )}
          </div>
        </section>
        <section>
          <SectionHeading
            title="Golden boot race"
            to="/scorers"
            link="All scorers"
            note="The names making the difference"
          />
          <div className="scorer-list">
            {data.scorers.slice(0, 4).map((player) => (
              <PlayerRow key={player.id} player={player} ranking />
            ))}
            {!data.scorers.length && <EmptyState title="Who will score first?" />}
          </div>
        </section>
      </div>
      <div className="league-footnote">
        <span>{data.teams.length} teams. One campus.</span>
        <p>Everything to play for.</p>
        <Link to="/teams" className="inline-link">
          Meet the clubs
          <ArrowRight size={16} />
        </Link>
      </div>
    </>
  )
}
