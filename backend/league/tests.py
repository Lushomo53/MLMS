from io import StringIO
from datetime import date
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings

from .models import Fixture, Goal, Player, Season, Team
from .services import build_standings, league_snapshot


@override_settings(ALLOWED_HOSTS=["testserver"])
class LeagueTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo", stdout=StringIO())

    def test_seed_is_complete_idempotent_and_has_unique_pairings(self):
        fixture = Fixture.objects.filter(status="completed").first()
        fixture.venue = "User-edited venue"
        fixture.save()
        call_command("seed_demo", stdout=StringIO())
        self.assertEqual((Team.objects.count(), Player.objects.count(), Fixture.objects.count()), (8, 88, 28))
        fixture.refresh_from_db()
        self.assertEqual(fixture.venue, "User-edited venue")
        matches = list(Fixture.objects.all())
        self.assertEqual(len({tuple(sorted([m.home_team_id, m.away_team_id])) for m in matches}), 28)
        for week in range(1, 8):
            ids = [team_id for m in matches if m.matchweek == week for team_id in [m.home_team_id, m.away_team_id]]
            self.assertEqual(len(set(ids)), 8)

    def test_snapshot_is_public_read_only_and_bounded(self):
        with self.assertNumQueries(5):
            response = self.client.get("/api/v1/league/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["season"]["is_demo"])
        self.assertEqual(response.json()["season"]["current_matchweek"], 5)
        self.assertEqual(self.client.post("/api/v1/league/", {}).status_code, 405)

    def test_draft_season_and_fixture_do_not_leak(self):
        fixture = Fixture.objects.filter(status="completed").first()
        fixture.is_published = False
        fixture.save()
        snapshot = league_snapshot()
        self.assertNotIn(fixture.id, [match["id"] for match in snapshot["fixtures"]])
        self.assertEqual(sum(row["played"] for row in snapshot["standings"]), 30)
        Season.objects.update(is_published=False)
        self.assertIsNone(league_snapshot()["season"])
        self.assertEqual(league_snapshot()["players"], [])

    def test_standings_totals_and_seed_scores_agree(self):
        snapshot = league_snapshot()
        rows = snapshot["standings"]
        self.assertEqual(sum(r["goals_for"] for r in rows), sum(r["goals_against"] for r in rows))
        self.assertEqual(sum(r["won"] for r in rows), sum(r["lost"] for r in rows))
        self.assertEqual(sum(p["goals"] for p in snapshot["players"]), sum(r["goals_for"] for r in rows))
        self.assertEqual(rows[0]["points"], 12)
        self.assertTrue(all(row["played"] == 4 for row in rows))
        self.assertEqual(rows[0]["form"], ["W", "W", "W", "W"])

    def test_correction_recalculates_without_double_counting(self):
        match = Fixture.objects.filter(status="completed").first()
        teams = list(match.season.teams.all())
        match.home_score, match.away_score = 2, 0
        match.save()
        first = {r["team_id"]: r for r in build_standings(teams, [match])}
        self.assertEqual(first[match.home_team_id]["points"], 3)
        match.home_score, match.away_score = 0, 2
        match.save()
        second = {r["team_id"]: r for r in build_standings(teams, [match])}
        self.assertEqual(second[match.home_team_id]["points"], 0)
        self.assertEqual(second[match.away_team_id]["points"], 3)
        self.assertEqual(second[match.home_team_id]["played"], 1)

    def test_exact_ties_share_rank_and_use_stable_name_order(self):
        rows = build_standings(list(Team.objects.all()), [])
        self.assertEqual([row["rank"] for row in rows], [1] * 8)
        self.assertEqual([row["team_id"] for row in rows], list(Team.objects.values_list("id", flat=True)))

    def test_own_and_unattributed_goals_are_not_player_goals(self):
        goal = Goal.objects.first()
        player_id = goal.player_id
        before = {p["id"]: p["goals"] for p in league_snapshot()["players"]}[player_id]
        opponent_id = goal.fixture.away_team_id if goal.credited_team_id == goal.fixture.home_team_id else goal.fixture.home_team_id
        goal.player = Player.objects.filter(team_id=opponent_id).first()
        goal.own_goal = True
        goal.full_clean()
        goal.save()
        snapshot = league_snapshot()
        self.assertEqual(next(p["goals"] for p in snapshot["players"] if p["id"] == player_id), before - 1)
        goal.player = None
        goal.own_goal = False
        goal.save()
        self.assertEqual(sum(p["goals"] for p in league_snapshot()["players"]), Goal.objects.count() - 1)

    def test_goal_rejects_wrong_team_and_excess_events(self):
        fixture = Fixture.objects.filter(status="completed", home_score__gt=0).first()
        goal = Goal(fixture=fixture, credited_team=fixture.home_team, player=Player.objects.filter(team=fixture.home_team).first(), minute=20)
        with self.assertRaises(ValidationError):
            goal.full_clean()
        goal.credited_team = Team.objects.exclude(pk__in=[fixture.home_team_id, fixture.away_team_id]).first()
        with self.assertRaises(ValidationError):
            goal.full_clean()

    def test_database_rejects_self_match_and_missing_completed_score(self):
        fixture = Fixture.objects.first()
        with self.assertRaises(IntegrityError), transaction.atomic():
            Fixture.objects.filter(pk=fixture.pk).update(away_team_id=fixture.home_team_id)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Fixture.objects.filter(pk=fixture.pk).update(status="completed", home_score=None)

    def test_scheduled_matches_do_not_affect_stats(self):
        season = Season.objects.get()
        teams = list(season.teams.all())
        rows = build_standings(teams, list(Fixture.objects.filter(status="scheduled")))
        self.assertTrue(all(row["played"] == 0 and row["points"] == 0 for row in rows))


class EmptyLeagueTests(TestCase):
    def test_empty_league_is_a_valid_empty_response(self):
        self.assertIsNone(league_snapshot()["season"])

    def test_demo_seed_refuses_existing_real_data(self):
        Season.objects.create(name="Real season", slug="real", start_date=date(2026, 1, 1))
        with self.assertRaises(CommandError):
            call_command("seed_demo", stdout=StringIO())
        self.assertEqual(Team.objects.count(), 0)
