import { test, expect } from '@playwright/test'
import type { LeagueSnapshot } from '../src/lib/types'

test('overview, match panel, standings and squad share the API records', async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await request.get('/api/v1/league/')
  const data = (await response.json()) as LeagueSnapshot
  const leader = data.standings[0]
  const club = data.teams.find((team) => team.id === leader.team_id)!
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Matchweek 05/ })).toBeVisible()
  await expect(page.locator('.result-tile')).toHaveCount(4)
  const details = page.getByRole('button', { name: 'Match details', exact: true })
  await details.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Match centre.' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(details).toBeFocused()

  await page
    .getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Standings' })
    .click()
  await expect(page.locator('.standings-table tbody tr')).toHaveCount(data.teams.length)
  await expect(page.locator('.standings-table tbody tr').first().locator('.points-col')).toHaveText(
    String(leader.points),
  )
  await page.getByRole('link', { name: club.name, exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(club.name)
  await expect(page.locator('.squad-list .player-row')).toHaveCount(
    data.players.filter((p) => p.team_id === club.id).length,
  )
  await page.getByRole('button', { name: 'Forwards', exact: true }).click()
  await expect(page.locator('.squad-list .player-row')).toHaveCount(3)
  await page.locator('.squad-list .player-row').first().click()
  await expect(page.getByRole('dialog')).toContainText('Season goals')
  await page.getByRole('button', { name: 'Close details' }).click()
  expect(errors).toEqual([])
})

test('fixture filters survive reload and match results reveal scorers', async ({ page }) => {
  await page.goto('/fixtures?week=4&status=completed')
  await expect(page.locator('.fixture-row')).toHaveCount(4)
  await expect(page.getByRole('button', { name: 'MW 04', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await expect(page.locator('.fixture-row')).toHaveCount(4)
  await page.locator('.fixture-row').first().click()
  await expect(page.getByRole('dialog')).toContainText('On the scoresheet')
  await expect(page.locator('.panel-score')).toContainText('FULL TIME')
  await page.getByRole('button', { name: 'Close details' }).click()
  await page.getByLabel('Match status').selectOption('scheduled')
  await expect(page.getByRole('heading', { name: 'No matches in this view' })).toBeVisible()
  await page.getByRole('button', { name: 'Show all matches' }).click()
  await expect(page.locator('.fixture-row')).toHaveCount(28)
})

test('team search and scorer filters do not invent records', async ({ page, request }) => {
  const response = await request.get('/api/v1/league/')
  const data = (await response.json()) as LeagueSnapshot
  await page.goto('/teams')
  await expect(page.locator('.club-card')).toHaveCount(8)
  await page.getByLabel('Search teams').fill('not-a-club')
  await expect(page.getByRole('heading', { name: 'No clubs found' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(page.locator('.club-card')).toHaveCount(8)
  await page.goto('/teams/not-a-club')
  await expect(page.getByRole('heading', { name: 'Team not found' })).toBeVisible()
  await page.goto('/scorers')
  const team = data.teams[0]
  await page.getByLabel('Filter scorers by team').selectOption(String(team.id))
  await expect(page.locator('.all-scorers .player-row')).toHaveCount(
    data.scorers.filter((p) => p.team_id === team.id).length,
  )
})

test('API failure is recoverable and an unpublished season is empty', async ({ page }) => {
  await page.route('**/api/v1/league/', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: '{"detail":"Unavailable"}',
    }),
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'A pause in play' })).toBeVisible()
  await page.unroute('**/api/v1/league/')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('heading', { name: /Matchweek 05/ })).toBeVisible()
  await page.route('**/api/v1/league/', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        season: null,
        teams: [],
        players: [],
        fixtures: [],
        standings: [],
        scorers: [],
      }),
    }),
  )
  await page.reload()
  await expect(page.getByRole('heading', { name: 'A new season is on the way' })).toBeVisible()
  await expect(page.locator('.fixture-row')).toHaveCount(0)
})

test('all public pages fit desktop, tablet and phone without page overflow', async ({ page }) => {
  test.setTimeout(120_000)
  const routes = ['/', '/standings', '/fixtures', '/teams', '/teams/northside-fc', '/scorers']
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const path of routes) {
      await page.goto(path)
      await expect(page.locator('main h1')).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overflow, path + ' at ' + width + 'px').toBeLessThanOrEqual(1)
      if (width === 1440 || width === 390) {
        const name = path === '/' ? 'overview' : path.replaceAll('/', '-').slice(1)
        await page.screenshot({
          path: 'artifacts/increment-1-' + width + '-' + name + '.png',
          fullPage: true,
        })
      }
    }
  }
  expect(errors).toEqual([])
})

test('match-day depth responds to a mouse and turns off for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const surface = page.locator('.featured-depth')
  await expect(surface).toHaveAttribute('data-depth-enabled', 'true')
  await surface.scrollIntoViewIfNeeded()
  const box = await surface.boundingBox()
  if (!box) throw new Error('Featured match did not render')
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3)
  await expect(surface).toHaveAttribute('data-depth-active', 'true')
  await expect
    .poll(async () =>
      Number.parseFloat(await surface.evaluate((node) => node.style.getPropertyValue('--tilt-y'))),
    )
    .toBeGreaterThan(0)
  await page.screenshot({ path: 'artifacts/matchday-desktop-overview.png', fullPage: true })
  await page.mouse.move(0, 0)
  await expect(surface).toHaveAttribute('data-depth-active', 'false')
  await expect
    .poll(() => surface.evaluate((node) => node.style.getPropertyValue('--tilt-y')))
    .toBe('0deg')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(surface).toHaveAttribute('data-depth-enabled', 'false')
  expect(await surface.evaluate((node) => getComputedStyle(node).transform)).toBe('none')
  expect(
    await page.locator('.pitch-lines').evaluate((node) => getComputedStyle(node).animationName),
  ).toBe('none')
})

test('touch mode stays flat and standings form badges open the corresponding match', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
  })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:5173/')
    await expect(page.locator('.featured-depth')).toHaveAttribute('data-depth-enabled', 'false')
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Standings', exact: true })
      .tap()
    await page.getByLabel('Spotlight a club').selectOption({ label: 'Hillview FC' })
    const highlighted = page.locator('tr[data-spotlight="true"]')
    await expect(highlighted).toContainText('Hillview FC')
    await expect(page.locator('.spotlight-club')).toContainText('Hillview FC')
    await page.screenshot({ path: 'artifacts/matchday-mobile-standings.png', fullPage: true })
    const form = highlighted.getByRole('button').first()
    const label = await form.getAttribute('aria-label')
    await form.tap()
    await expect(page.getByRole('dialog')).toContainText('Hillview FC')
    await expect(page.locator('.panel-score')).toContainText('FULL TIME')
    expect(label).toContain('Hillview FC')
    await page.getByRole('button', { name: 'Close details' }).tap()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1)
  } finally {
    await context.close()
  }
})
