import * as Dialog from '@radix-ui/react-dialog'
import { ArrowUpRight, CalendarDays, MapPin, X } from 'lucide-react'
import type { CSSProperties, RefObject } from 'react'
import { Link } from 'react-router-dom'
import { matchDate, matchTime, positions, useLeague } from '../lib/league'
import type { Panel } from '../lib/types'
import { Crest } from './LeagueUI'

export default function DetailPanel({
  panel,
  close,
  returnFocus,
}: {
  panel: Panel
  close: () => void
  returnFocus: RefObject<HTMLElement | null>
}) {
  const { data, teams, players, openPanel } = useLeague()
  const match = panel?.type === 'match' ? data.fixtures.find((m) => m.id === panel.id) : null
  const player = panel?.type === 'player' ? players.get(panel.id) : null
  const home = match ? teams.get(match.home_team_id)! : null,
    away = match ? teams.get(match.away_team_id)! : null
  const club = player ? teams.get(player.team_id)! : null
  return (
    <Dialog.Root
      open={!!panel}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="detail-panel"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (returnFocus.current?.isConnected) returnFocus.current.focus()
          }}
        >
          <Dialog.Close className="icon-button panel-close" aria-label="Close details">
            <X size={22} />
          </Dialog.Close>
          {match && home && away ? (
            <>
              <p className="eyebrow">Matchweek {String(match.matchweek).padStart(2, '0')}</p>
              <Dialog.Title>
                Match centre<span className="accent">.</span>
              </Dialog.Title>
              <Dialog.Description className="panel-description">
                {matchDate(match.kickoff, true)} ·{' '}
                {match.status === 'completed'
                  ? 'Full time'
                  : match.status === 'postponed'
                    ? 'Postponed'
                    : matchTime(match.kickoff) + ' CAT'}
              </Dialog.Description>
              <div className="panel-match">
                <Link onClick={close} to={'/teams/' + home.slug}>
                  <Crest team={home} size="large" />
                  <strong>{home.name}</strong>
                </Link>
                <div className="panel-score">
                  {match.status === 'completed'
                    ? match.home_score + ' : ' + match.away_score
                    : 'VS'}
                  <small>
                    {match.status === 'completed'
                      ? 'FULL TIME'
                      : match.status === 'postponed'
                        ? 'POSTPONED'
                        : 'UPCOMING'}
                  </small>
                </div>
                <Link onClick={close} to={'/teams/' + away.slug}>
                  <Crest team={away} size="large" />
                  <strong>{away.name}</strong>
                </Link>
              </div>
              <p className="venue-line">
                <MapPin size={16} />
                {match.venue}
              </p>
              <div className="panel-section">
                <h3>{match.status === 'completed' ? 'On the scoresheet' : 'Before the whistle'}</h3>
                {match.status !== 'completed' ? (
                  <div className="match-pending">
                    <CalendarDays size={28} />
                    <p>
                      {match.status === 'postponed'
                        ? 'This match has been postponed. A new kickoff will be announced here.'
                        : 'The stage is set. The score and match events will appear here after the result is recorded.'}
                    </p>
                  </div>
                ) : match.goals.length ? (
                  <div className="goal-list">
                    {match.goals.map((goal) => {
                      const scorer = goal.player_id ? players.get(goal.player_id) : null
                      return (
                        <div className="goal-event" key={goal.id}>
                          <span className="goal-minute">{goal.minute}′</span>
                          <Crest team={teams.get(goal.credited_team_id)!} size="tiny" />
                          <div>
                            {scorer ? (
                              <button onClick={() => openPanel({ type: 'player', id: scorer.id })}>
                                {scorer.name}
                                {goal.own_goal ? ' (OG)' : ''}
                                <ArrowUpRight size={14} />
                              </button>
                            ) : (
                              <span>{goal.own_goal ? 'Own goal' : 'Scorer not recorded'}</span>
                            )}
                            <small>{teams.get(goal.credited_team_id)!.name}</small>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="muted">
                    {match.home_score === 0 && match.away_score === 0
                      ? 'A goalless draw. A point apiece.'
                      : 'Scorer details have not been recorded.'}
                  </p>
                )}
              </div>
            </>
          ) : player && club ? (
            <>
              <p className="eyebrow">Player profile</p>
              <Dialog.Title>
                {player.name}
                <span className="accent">.</span>
              </Dialog.Title>
              <Dialog.Description className="panel-description">
                {positions[player.position]} · {club.name}
              </Dialog.Description>
              <div
                className="player-feature"
                style={{ '--club-color': club.color } as CSSProperties}
              >
                <span className="shirt-number">{String(player.shirt_number).padStart(2, '0')}</span>
                <Crest team={club} size="large" />
                <span>{positions[player.position]}</span>
              </div>
              <div className="player-stat-grid">
                <div>
                  <span className="eyebrow">Season goals</span>
                  <strong>{player.goals}</strong>
                </div>
                <div>
                  <span className="eyebrow">Shirt number</span>
                  <strong>{player.shirt_number}</strong>
                </div>
              </div>
              <Link
                className="primary-button full-width"
                onClick={close}
                to={'/teams/' + club.slug}
              >
                Explore {club.short_name}
                <ArrowUpRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <Dialog.Title>Details unavailable</Dialog.Title>
              <Dialog.Description>
                This record is no longer in the published season.
              </Dialog.Description>
            </>
          )}
          {data.season?.is_demo && (
            <p className="panel-demo">DEMO RECORD · Fictional data for prototype evaluation.</p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
