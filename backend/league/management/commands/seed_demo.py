from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from league.models import Fixture, Goal, Player, Season, Team

TEAM_DATA = [
    ("Northside FC", "Northside", "NTH", "#83a9ff", "North Ground", "A bold attacking side with its eyes on the top of the table."),
    ("Riverside United", "Riverside", "RVU", "#80d0b8", "Riverside Pitch", "Together from the first whistle to the last. United by the game."),
    ("Campus Rovers", "Campus Rovers", "CPR", "#efb39c", "University Sports Ground", "The roaming spirit of campus football, at home on every pitch."),
    ("Hostel City", "Hostel City", "HSC", "#b9a1ef", "City Ground", "Built on friendship, fuelled by the noise from the touchline."),
    ("Pioneer Athletic", "Pioneer", "PNA", "#e4c882", "Pioneer Field", "First to the ball. First to believe. A team with something to prove."),
    ("Hillview FC", "Hillview", "HLV", "#83cedf", "Hillview Pitch", "Hard work, close games and a never-say-die team spirit."),
    ("Central United", "Central", "CTU", "#ed939e", "Central Ground", "At the heart of campus, with football at the heart of everything."),
    ("Greenfield SC", "Greenfield", "GSC", "#b9d18e", "Greenfield Pitch", "New energy. Fresh ambition. Every match is another chance."),
]
FIRST_NAMES = ["Kelvin", "Chanda", "Brian", "Emmanuel", "Moses", "Daniel", "Joseph", "Patrick", "Isaac", "Samuel", "David"]
LAST_NAMES = ["Mwansa", "Banda", "Phiri", "Tembo", "Chileshe", "Zulu", "Mumba", "Lungu"]
POSITIONS = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]


class Command(BaseCommand):
    help = "Create a labelled fictional demo once; never overwrite existing league data."

    @transaction.atomic
    def handle(self, *args, **options):
        if Season.objects.filter(slug="campus-league-demo-2026").exists():
            self.stdout.write("Demo season already exists; no records changed.")
            return
        if Season.objects.exists() or Team.objects.exists():
            raise CommandError("Existing league data detected. Demo seeding requires an empty league database.")
        season = Season.objects.create(name="2026 Campus League", slug="campus-league-demo-2026", start_date=date(2026, 8, 29), is_active=True, is_published=True, is_demo=True)
        teams, squads = [], {}
        for index, (name, short, abbreviation, color, ground, description) in enumerate(TEAM_DATA):
            team = Team.objects.create(name=name, short_name=short, slug=name.lower().replace(" ", "-"), abbreviation=abbreviation, color=color, ground=ground, description=description)
            teams.append(team)
            squads[team.id] = [Player.objects.create(team=team, name=f"{FIRST_NAMES[(shirt + index) % 11]} {LAST_NAMES[index]}", shirt_number=shirt + 1, position=POSITIONS[shirt]) for shirt in range(11)]
        season.teams.set(teams)
        rotation = list(teams)
        for week in range(1, 8):
            for slot in range(4):
                home, away = rotation[slot], rotation[-slot - 1]
                if (week + slot) % 2 == 0:
                    home, away = away, home
                completed = week <= 4
                home_score, away_score = ((week + slot * 2) % 4, (week * 2 + slot) % 3) if completed else (None, None)
                if completed and teams[0] in (home, away):
                    home_score, away_score = (3, 1) if home == teams[0] else (0, 2)
                kickoff = datetime(2026, 8, 29, 13 + slot % 2 * 2, 0, tzinfo=ZoneInfo("Africa/Lusaka")) + timedelta(weeks=week - 1, days=slot // 2)
                fixture = Fixture.objects.create(season=season, matchweek=week, home_team=home, away_team=away, kickoff=kickoff, venue=home.ground, status=Fixture.Status.COMPLETED if completed else Fixture.Status.SCHEDULED, home_score=home_score, away_score=away_score, is_published=True)
                if completed:
                    for team, count in [(home, home_score), (away, away_score)]:
                        for goal_index in range(count):
                            player = squads[team.id][8 if goal_index < 2 else 9]
                            Goal.objects.create(fixture=fixture, credited_team=team, player=player, minute=17 + goal_index * 24 + slot * 3 + (8 if team == away else 0))
            rotation = [rotation[0], rotation[-1], *rotation[1:-1]]
        self.stdout.write(self.style.SUCCESS("Created demo season: 8 teams, 88 players, 28 fixtures (16 completed). All records are fictional."))
