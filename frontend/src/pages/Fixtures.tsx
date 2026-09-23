import { useSearchParams } from 'react-router-dom'
import { CalendarDays, SlidersHorizontal } from 'lucide-react'
import { useLeague } from '../lib/league'
import { EmptyState, FixtureRow, PageHeading } from '../components/LeagueUI'

export default function Fixtures() {
  const { data } = useLeague()
  const [search, setSearch] = useSearchParams()
  const weeks = Array.from(new Set(data.fixtures.map((m) => m.matchweek))).sort((a, b) => a - b)
  const rawWeek = search.get('week')
  const week =
    rawWeek === 'all'
      ? 'all'
      : rawWeek && weeks.includes(Number(rawWeek))
        ? Number(rawWeek)
        : data.season!.current_matchweek
  const rawStatus = search.get('status')
  const status = ['scheduled', 'completed', 'postponed'].includes(rawStatus || '')
    ? rawStatus!
    : 'all'
  const filtered = data.fixtures.filter(
    (m) => (week === 'all' || m.matchweek === week) && (status === 'all' || m.status === status),
  )
  function update(key: string, value: string) {
    const next = new URLSearchParams(search)
    next.set(key, value)
    setSearch(next, { replace: true })
  }
  return (
    <>
      <PageHeading eyebrow={data.season!.name} title="Fixtures & results">
        <div className="heading-aside">
          <CalendarDays size={20} />
          <span>
            From kickoff to full time
            <br />
            <small>All times in Central Africa Time</small>
          </span>
        </div>
      </PageHeading>
      <div className="filter-bar">
        <div className="week-picker" aria-label="Filter by matchweek">
          <button
            className={week === 'all' ? 'selected' : ''}
            aria-pressed={week === 'all'}
            onClick={() => update('week', 'all')}
          >
            All weeks
          </button>
          {weeks.map((w) => (
            <button
              key={w}
              className={week === w ? 'selected' : ''}
              aria-pressed={week === w}
              onClick={() => update('week', String(w))}
            >
              MW {String(w).padStart(2, '0')}
            </button>
          ))}
        </div>
        <label className="select-control">
          <SlidersHorizontal size={15} />
          <span className="sr-only">Match status</span>
          <select value={status} onChange={(e) => update('status', e.target.value)}>
            <option value="all">All matches</option>
            <option value="scheduled">Upcoming</option>
            <option value="completed">Results</option>
            <option value="postponed">Postponed</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="matchweek-groups">
          {weeks
            .filter((w) => filtered.some((m) => m.matchweek === w))
            .map((w) => (
              <section className="matchweek-group" key={w}>
                <div className="matchweek-heading">
                  <h2>
                    Matchweek <span>{String(w).padStart(2, '0')}</span>
                  </h2>
                  <span className="eyebrow">
                    {filtered.filter((m) => m.matchweek === w).length} matches
                  </span>
                </div>
                <div className="fixture-list">
                  {filtered
                    .filter((m) => m.matchweek === w)
                    .map((match) => (
                      <FixtureRow key={match.id} match={match} />
                    ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <EmptyState title="No matches in this view">
          <p>Try a different matchweek or match status.</p>
          <button
            className="secondary-button"
            onClick={() => setSearch({ week: 'all', status: 'all' }, { replace: true })}
          >
            Show all matches
          </button>
        </EmptyState>
      )}
    </>
  )
}
