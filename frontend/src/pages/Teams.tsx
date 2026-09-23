import { useState } from 'react'
import DepthSurface from '../components/DepthSurface'
import type { CSSProperties } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { signed, useLeague } from '../lib/league'
import { Crest, EmptyState, Form, PageHeading } from '../components/LeagueUI'

export default function Teams() {
  const { data } = useLeague()
  const [search, setSearch] = useState('')
  const filtered = data.teams.filter((team) =>
    team.name.toLowerCase().includes(search.trim().toLowerCase()),
  )
  return (
    <>
      <PageHeading eyebrow="The clubs / the community" title="Meet the clubs">
        <label className="search-control">
          <Search size={17} />
          <span className="sr-only">Search teams</span>
          <input
            placeholder="Find your team…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </PageHeading>
      <div className="club-grid">
        {filtered.map((team) => {
          const record = data.standings.find((row) => row.team_id === team.id)!
          return (
            <DepthSurface key={team.id} className="club-depth">
              <Link
                className="club-card"
                to={'/teams/' + team.slug}
                key={team.id}
                style={{ '--club-color': team.color } as CSSProperties}
              >
                <div className="club-card-top">
                  <span className="eyebrow">
                    {String(record.rank).padStart(2, '0')} / IN THE TABLE
                  </span>
                  <ArrowUpRight size={19} />
                </div>
                <span className="club-card-watermark" aria-hidden="true">
                  {team.abbreviation}
                </span>
                <Crest team={team} size="large" />
                <h2>{team.name}</h2>
                <p>{team.ground}</p>
                <div className="club-card-stats">
                  <span>
                    <strong>{record.points}</strong>POINTS
                  </span>
                  <span>
                    <strong>{signed(record.goal_difference)}</strong>GOAL DIFF.
                  </span>
                </div>
                <div className="club-card-bottom">
                  <span className="eyebrow">Recent form</span>
                  <Form results={record.form} />
                </div>
              </Link>
            </DepthSurface>
          )
        })}
      </div>
      {!filtered.length && (
        <EmptyState title="No clubs found">
          <p>Try another team name.</p>
          <button className="secondary-button" onClick={() => setSearch('')}>
            Clear search
          </button>
        </EmptyState>
      )}
    </>
  )
}
