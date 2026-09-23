import { useState } from 'react'
import KitIllustration from '../components/KitIllustration'
import type { CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useLeague, shortName } from '../lib/league'
import { Crest, EmptyState, PageHeading, PlayerRow } from '../components/LeagueUI'

export default function Scorers() {
  const { data, teams, openPanel } = useLeague()
  const [teamFilter, setTeamFilter] = useState('all')
  const filtered = data.scorers.filter(
    (p) => teamFilter === 'all' || p.team_id === Number(teamFilter),
  )
  return (
    <>
      <PageHeading
        eyebrow={data.season!.name + ' / Player statistics'}
        title="The golden boot race"
      >
        <p className="heading-note">
          Big moments.
          <br />
          <span>Names to remember.</span>
        </p>
      </PageHeading>
      <div className="scoring-leaders">
        {data.scorers.slice(0, 3).map((player, index) => {
          const team = teams.get(player.team_id)!
          return (
            <button
              className={'scoring-card ' + (index === 0 ? 'scoring-card--first' : '')}
              key={player.id}
              style={{ '--club-color': team.color } as CSSProperties}
              onClick={() => openPanel({ type: 'player', id: player.id })}
            >
              <div className="scoring-card-top">
                <span className="eyebrow">RANK {String(player.rank).padStart(2, '0')}</span>
                <ArrowUpRight size={20} />
              </div>
              <div className="scoring-card-centre">
                <KitIllustration number={player.shirt_number} />
                <strong>
                  {player.goals}
                  <small>GOALS</small>
                </strong>
              </div>
              <h2>{shortName(player.name)}</h2>
              <div className="scoring-card-club">
                <Crest team={team} size="tiny" />
                {team.name}
              </div>
            </button>
          )
        })}
      </div>
      <div className="scorers-heading">
        <h2>Every scorer</h2>
        <label className="select-control">
          <span className="sr-only">Filter scorers by team</span>
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="all">All teams</option>
            {data.teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="all-scorers">
        {filtered.map((player) => (
          <PlayerRow player={player} key={player.id} ranking />
        ))}
      </div>
      {!filtered.length && (
        <EmptyState title="No scorers yet">
          <p>Recorded goals will appear here after matches are completed.</p>
        </EmptyState>
      )}
      <p className="rules-note">
        Kits are illustrative placeholders. Goals from completed, published matches only. Own goals
        are excluded; players level on goals share a rank.
      </p>
    </>
  )
}
