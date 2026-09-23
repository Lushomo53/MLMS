import { useId } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useLeague } from '../lib/league'
import { Crest } from './LeagueUI'

/** Original vector artwork; no image request, canvas or animation loop. */
function Football() {
  const id = useId()
  return (
    <svg className="matchday-ball" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id={id + 'light'} cx="30%" cy="22%" r="80%">
          <stop offset="0" stopColor="#fffdf4" />
          <stop offset=".6" stopColor="#d9e2eb" />
          <stop offset="1" stopColor="#586f94" />
        </radialGradient>
        <clipPath id={id + 'clip'}>
          <circle cx="200" cy="200" r="158" />
        </clipPath>
      </defs>
      <circle cx="200" cy="200" r="158" fill={'url(#' + id + 'light)'} />
      <g clipPath={'url(#' + id + 'clip)'} stroke="#627189" strokeWidth="2" strokeLinejoin="round">
        <path d="M167 134 231 130 262 185 224 236 163 221 140 171Z" fill="#172940" />
        <path
          d="M81 75 123 49 157 56 166 90 120 120 86 106Z M295 71 335 103 346 149 316 162 283 119Z M360 218 354 266 314 300 286 277 305 230Z M179 335 217 312 252 332 245 366 191 373Z M43 220 68 185 101 207 104 255 73 274 43 259Z"
          fill="#1d304b"
        />
        <path
          d="M166 90 167 134 M231 130 283 119 M262 185 305 230 M224 236 217 312 M163 221 104 255 M140 171 120 120 M157 56 219 42 295 71 M86 106 56 145 68 185 M316 162 355 177 360 218 M314 300 286 335 252 332 M179 335 123 312 73 274"
          fill="none"
        />
        <path d="M43 220 24 165 M123 312 110 361 M219 42 226 16 M355 177 388 169" fill="none" />
      </g>
      <ellipse
        cx="149"
        cy="88"
        rx="65"
        ry="17"
        fill="#fff"
        opacity=".15"
        transform="rotate(-25 149 88)"
      />
    </svg>
  )
}

export default function MatchdayIdentity({ playedWeeks }: { playedWeeks: number }) {
  const { data } = useLeague()
  const season = data.season!
  return (
    <>
      <section className="matchday-poster" aria-labelledby="matchday-title">
        <div className="poster-copy">
          <div className="poster-edition">
            <span className="eyebrow">MULUNGUSHI / THE CAMPUS GAME</span>
            <span>VOL. {season.start_date.slice(0, 4)}</span>
          </div>
          <h1 id="matchday-title">
            Matchweek {String(season.current_matchweek).padStart(2, '0')}
            <span>.</span>
          </h1>
          <p className="poster-statement">
            THIS IS
            <br />
            <em>OUR GAME.</em>
          </p>
          <div className="poster-bottom">
            <p>One campus. Every point matters.</p>
            <Link to="/fixtures" className="poster-link">
              Explore the fixtures <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
        <div className="poster-art" aria-hidden="true">
          <span className="poster-orbit orbit-one" />
          <span className="poster-orbit orbit-two" />
          <span className="poster-coordinate">FOOTBALL / CAMPUS CULTURE</span>
          <span className="poster-giant-number">
            {String(season.current_matchweek).padStart(2, '0')}
          </span>
          <Football />
          <span className="poster-art-label">
            KABWE. ZAMBIA.
            <br />
            BUILT ON CAMPUS PRIDE.
          </span>
        </div>
        <div className="poster-season">
          <span>
            <b>{String(playedWeeks).padStart(2, '0')}</b> /{' '}
            {String(season.total_matchweeks).padStart(2, '0')} MATCHWEEKS PLAYED
          </span>
          <div
            className="poster-progress"
            role="img"
            aria-label={playedWeeks + ' of ' + season.total_matchweeks + ' matchweeks played'}
          >
            <span
              style={{
                width:
                  Math.min(100, (playedWeeks / Math.max(season.total_matchweeks, 1)) * 100) + '%',
              }}
            />
          </div>
          <span>{data.teams.length} CLUBS. ONE LEAGUE.</span>
        </div>
      </section>
      <nav className="club-ribbon" aria-label="Explore league clubs">
        <span className="eyebrow">
          Pick your
          <br />
          colours <ArrowUpRight size={15} />
        </span>
        <div className="club-ribbon-scroll">
          {data.teams.map((team) => (
            <Link
              key={team.id}
              to={'/teams/' + team.slug}
              style={{ '--club-color': team.color } as CSSProperties}
              aria-label={'Explore ' + team.name}
            >
              <Crest team={team} size="small" />
              <span>{team.short_name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
