from collections import Counter

from .models import Fixture, Player, Season


def build_standings(teams, fixtures):
    """Recompute from published results, so corrections never accumulate."""
    table = {team.id: dict(team_id=team.id, played=0, won=0, drawn=0, lost=0, goals_for=0, goals_against=0, goal_difference=0, points=0, form=[]) for team in teams}
    completed = sorted(
        [match for match in fixtures if match.status == Fixture.Status.COMPLETED and match.is_published],
        key=lambda match: (match.kickoff is None, match.kickoff, match.id),
    )
    for match in completed:
        for team_id, scored, conceded in [(match.home_team_id, match.home_score, match.away_score), (match.away_team_id, match.away_score, match.home_score)]:
            row = table[team_id]
            result = "W" if scored > conceded else "D" if scored == conceded else "L"
            row["played"] += 1
            row[{"W": "won", "D": "drawn", "L": "lost"}[result]] += 1
            row["goals_for"] += scored
            row["goals_against"] += conceded
            row["goal_difference"] = row["goals_for"] - row["goals_against"]
            row["points"] += {"W": 3, "D": 1, "L": 0}[result]
            row["form"] = (row["form"] + [result])[-5:]
    names = {team.id: team.name.casefold() for team in teams}
    rows = sorted(table.values(), key=lambda row: (-row["points"], -row["goal_difference"], -row["goals_for"], names[row["team_id"]]))
    previous_key, rank = None, 0
    for index, row in enumerate(rows, 1):
        key = (row["points"], row["goal_difference"], row["goals_for"])
        if key != previous_key:
            rank = index
        row["rank"] = rank
        previous_key = key
    return rows


def league_snapshot():
    """A bounded read model for the one-season, eight-team prototype."""
    season = Season.objects.filter(is_active=True, is_published=True).first()
    if not season:
        return {"season": None, "teams": [], "players": [], "fixtures": [], "standings": [], "scorers": []}
    teams = list(season.teams.all())
    players = list(Player.objects.filter(team__in=teams, is_active=True).order_by("name", "id"))
    fixtures = list(season.fixtures.filter(is_published=True).prefetch_related("goals"))
    standings = build_standings(teams, fixtures)
    goals = Counter(goal.player_id for match in fixtures if match.status == Fixture.Status.COMPLETED for goal in match.goals.all() if goal.player_id and not goal.own_goal)
    upcoming = [match.matchweek for match in fixtures if match.status == Fixture.Status.SCHEDULED]
    current_week = min(upcoming) if upcoming else max((match.matchweek for match in fixtures), default=1)
    player_rows = [dict(id=player.id, team_id=player.team_id, name=player.name, shirt_number=player.shirt_number, position=player.position, goals=goals[player.id]) for player in players]
    scorers = sorted([dict(player) for player in player_rows if player["goals"] > 0], key=lambda player: (-player["goals"], player["name"], player["id"]))
    previous_goals, rank = None, 0
    for index, player in enumerate(scorers, 1):
        if player["goals"] != previous_goals:
            rank = index
        player["rank"] = rank
        previous_goals = player["goals"]
    return {
        "season": dict(id=season.id, name=season.name, slug=season.slug, start_date=season.start_date.isoformat(), is_demo=season.is_demo, current_matchweek=current_week, total_matchweeks=max((match.matchweek for match in fixtures), default=0)),
        "teams": [dict(id=team.id, name=team.name, short_name=team.short_name, slug=team.slug, abbreviation=team.abbreviation, color=team.color, ground=team.ground, description=team.description) for team in teams],
        "players": player_rows,
        "fixtures": [dict(id=match.id, matchweek=match.matchweek, home_team_id=match.home_team_id, away_team_id=match.away_team_id, kickoff=match.kickoff.isoformat() if match.kickoff else None, venue=match.venue, status=match.status, home_score=match.home_score, away_score=match.away_score, goals=[dict(id=goal.id, player_id=goal.player_id, credited_team_id=goal.credited_team_id, minute=goal.minute, own_goal=goal.own_goal) for goal in match.goals.all()] if match.status == Fixture.Status.COMPLETED else []) for match in fixtures],
        "standings": standings,
        "scorers": scorers,
    }
