import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  House,
  Shield,
  Target,
  ArrowRight,
  RotateCw,
  TriangleAlert,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { apiGet } from './lib/api'
import { LeagueContext } from './lib/league'
import type { LeagueSnapshot, Panel } from './lib/types'
import Overview from './pages/Overview'
import Standings from './pages/Standings'
import Fixtures from './pages/Fixtures'
import Teams from './pages/Teams'
import TeamProfile from './pages/TeamProfile'
import Scorers from './pages/Scorers'
import DetailPanel from './components/DetailPanel'
import { EmptyState } from './components/LeagueUI'

const navigation = [
  { to: '/', label: 'Overview', Icon: House },
  { to: '/standings', label: 'Standings', Icon: ChartNoAxesColumnIncreasing },
  { to: '/fixtures', label: 'Fixtures', Icon: CalendarDays },
  { to: '/teams', label: 'Teams', Icon: Shield },
  { to: '/scorers', label: 'Scorers', Icon: Target },
]
function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      className={mobile ? 'mobile-nav' : 'desktop-nav'}
      aria-label={mobile ? 'Mobile navigation' : 'Main navigation'}
    >
      {navigation.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
export default function App() {
  const query = useQuery({
    queryKey: ['league'],
    queryFn: ({ signal }) => apiGet<LeagueSnapshot>('league/', signal),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
  const data = query.data
  const [panel, setPanel] = useState<Panel>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const { pathname } = useLocation()
  const teams = useMemo(() => new Map(data?.teams.map((team) => [team.id, team])), [data?.teams])
  const players = useMemo(
    () => new Map(data?.players.map((player) => [player.id, player])),
    [data?.players],
  )
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setPanel(null)
  }, [pathname])
  function openPanel(next: Exclude<Panel, null>) {
    if (!panel) returnFocus.current = document.activeElement as HTMLElement | null
    setPanel(next)
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="MUSU league home">
            <span className="brand-mark">
              M<span>U</span>
            </span>
            <span className="brand-word">
              MUSU<small>STUDENT LEAGUE</small>
            </span>
          </Link>
          <Navigation />
          <span className="season-badge">
            <span className="season-dot" />
            {data?.season ? data.season.start_date.slice(0, 4) + ' SEASON' : 'MUSU FOOTBALL'}
          </span>
        </div>
      </header>
      <div className="identity-strip">
        <span>
          MULUNGUSHI UNIVERSITY <span className="identity-divider">/</span> FOOTBALL
        </span>
        {data?.season?.is_demo && (
          <span className="demo-label">
            <span>DEMO SEASON</span>
            <span className="demo-explanation">Fictional teams, players & results</span>
          </span>
        )}
      </div>
      <main id="main" tabIndex={-1}>
        {query.isPending ? (
          <div className="loading-state" role="status">
            <span className="loading-mark">M</span>
            <p>Bringing the league together…</p>
            <span>The service may take a moment to wake up.</span>
          </div>
        ) : query.isError && !data ? (
          <EmptyState title="A pause in play">
            <p>
              We couldn't reach the league service. Your connection may be interrupted, or the
              service may be waking up.
            </p>
            <button
              className="primary-button"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              <RotateCw size={16} />
              {query.isFetching ? 'Reconnecting…' : 'Try again'}
            </button>
          </EmptyState>
        ) : !data?.season ? (
          <EmptyState title="A new season is on the way">
            <p>Teams, fixtures and standings will appear here when the league is published.</p>
          </EmptyState>
        ) : (
          <LeagueContext.Provider
            value={{ data, teams, players, openPanel, closePanel: () => setPanel(null) }}
          >
            {query.isError && (
              <div className="connection-banner" role="status">
                <TriangleAlert size={17} />
                <span>Showing the last loaded records. Updates are temporarily unavailable.</span>
                <button onClick={() => void query.refetch()} disabled={query.isFetching}>
                  Retry
                </button>
              </div>
            )}
            <motion.div
              className="page-transition"
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/standings" element={<Standings />} />
                <Route path="/fixtures" element={<Fixtures />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/teams/:slug" element={<TeamProfile key={pathname} />} />
                <Route path="/scorers" element={<Scorers />} />
                <Route
                  path="*"
                  element={
                    <EmptyState title="Off the pitch">
                      <p>We couldn't find that page.</p>
                      <Link className="inline-link" to="/">
                        Return to the league
                        <ArrowRight size={16} />
                      </Link>
                    </EmptyState>
                  }
                />
              </Routes>
            </motion.div>
            <DetailPanel panel={panel} close={() => setPanel(null)} returnFocus={returnFocus} />
          </LeagueContext.Provider>
        )}
      </main>
      <footer className="site-footer">
        <Link to="/" className="footer-brand">
          MUSU<span>THE CAMPUS GAME.</span>
        </Link>
        <span>
          {data?.season?.is_demo
            ? 'Prototype · All league records are fictional.'
            : 'Mulungushi University Student League'}
        </span>
        <span>KABWE, ZAMBIA</span>
      </footer>
      <Navigation mobile />
    </div>
  )
}
