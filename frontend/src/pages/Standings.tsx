import { useState } from 'react'
import { Trophy, Crosshair } from 'lucide-react'
import { useLeague } from '../lib/league'
import { Crest, PageHeading, StandingsTable } from '../components/LeagueUI'

export default function Standings() {
  const { data, teams } = useLeague()
  const [spotlight, setSpotlight] = useState('all')
  const played = data.fixtures.filter((m) => m.status === 'completed').length
  const selected = data.standings.find((row) => row.team_id === Number(spotlight))
  const leader = data.standings[0]
  const featured = selected || leader
  const club = featured ? teams.get(featured.team_id) : undefined
  return (
    <>
      <PageHeading eyebrow={data.season!.name} title="The standings">
        <div className="heading-aside">
          <Trophy size={20} />
          <span>
            {played} matches played
            <br />
            <small>One table. Every story.</small>
          </span>
        </div>
      </PageHeading>
      <div className="standings-spotlight">
        {club && featured && (
          <div className="spotlight-club" key={club.id}>
            <Crest team={club} size="normal" />
            <div>
              <span className="eyebrow">{selected ? 'Club spotlight' : 'Setting the pace'}</span>
              <strong>{club.name}</strong>
            </div>
            <div className="spotlight-points">
              <strong>{featured.points}</strong>
              <span>POINTS</span>
            </div>
            <p>
              {featured.won} wins <span>/</span> {featured.played} played
            </p>
          </div>
        )}
        <label className="select-control spotlight-select">
          <Crosshair size={17} />
          <span className="sr-only">Spotlight a club</span>
          <select value={spotlight} onChange={(event) => setSpotlight(event.target.value)}>
            <option value="all">Spotlight a club</option>
            {data.teams.map((team) => (
              <option value={team.id} key={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section className="full-table-panel">
        <div className="table-context">
          <span className="eyebrow">League table</span>
          <span>3 points for a win · 1 for a draw</span>
        </div>
        <StandingsTable highlightTeamId={selected?.team_id} />
        <div className="table-legend">
          <span>
            <i />
            League leader
          </span>
          <span>Select a form badge to open the match · Oldest → newest</span>
        </div>
      </section>
      <p className="rules-note">
        Ranked by points, goal difference, then goals scored. Exact ties share a rank. These are
        prototype rules, pending confirmation of the MUSU competition rules.
      </p>
    </>
  )
}
