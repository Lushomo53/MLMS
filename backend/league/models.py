from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.db import models
from django.db.models import F, Q


class Season(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    start_date = models.DateField()
    is_active = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    is_demo = models.BooleanField(default=False)
    teams = models.ManyToManyField("Team", related_name="seasons", blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["is_active"], condition=Q(is_active=True), name="one_active_season")]

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=30)
    slug = models.SlugField(unique=True)
    abbreviation = models.CharField(max_length=3)
    color = models.CharField(max_length=7, validators=[RegexValidator(r"^#[0-9a-fA-F]{6}$")])
    ground = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Player(models.Model):
    class Position(models.TextChoices):
        GOALKEEPER = "GK", "Goalkeeper"
        DEFENDER = "DEF", "Defender"
        MIDFIELDER = "MID", "Midfielder"
        FORWARD = "FWD", "Forward"

    team = models.ForeignKey(Team, on_delete=models.PROTECT, related_name="players")
    name = models.CharField(max_length=100)
    shirt_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(99)])
    position = models.CharField(max_length=3, choices=Position.choices)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["shirt_number", "name"]
        constraints = [models.UniqueConstraint(fields=["team", "shirt_number"], condition=Q(is_active=True), name="unique_active_shirt")]

    def __str__(self):
        return self.name


class Fixture(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Full time"
        POSTPONED = "postponed", "Postponed"

    season = models.ForeignKey(Season, on_delete=models.PROTECT, related_name="fixtures")
    matchweek = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    home_team = models.ForeignKey(Team, on_delete=models.PROTECT, related_name="home_fixtures")
    away_team = models.ForeignKey(Team, on_delete=models.PROTECT, related_name="away_fixtures")
    kickoff = models.DateTimeField(null=True, blank=True)
    venue = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SCHEDULED)
    home_score = models.PositiveSmallIntegerField(null=True, blank=True)
    away_score = models.PositiveSmallIntegerField(null=True, blank=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ["matchweek", "kickoff", "id"]
        constraints = [
            models.CheckConstraint(condition=~Q(home_team=F("away_team")), name="different_match_teams"),
            models.CheckConstraint(condition=Q(matchweek__gte=1), name="positive_matchweek"),
            models.CheckConstraint(condition=(Q(status="completed", home_score__isnull=False, away_score__isnull=False) | Q(status__in=["scheduled", "postponed"], home_score__isnull=True, away_score__isnull=True)), name="scores_only_when_completed"),
            models.UniqueConstraint(fields=["season", "home_team", "away_team"], name="unique_home_away_fixture"),
        ]

    def clean(self):
        if self.season_id and self.home_team_id and self.away_team_id:
            if self.season.teams.filter(pk__in=[self.home_team_id, self.away_team_id]).count() != 2:
                raise ValidationError("Both teams must belong to the season.")
            if Fixture.objects.filter(season_id=self.season_id, home_team_id=self.away_team_id, away_team_id=self.home_team_id).exclude(pk=self.pk).exists():
                raise ValidationError("This pairing already exists in the single round-robin season.")

    def __str__(self):
        return f"MW {self.matchweek}: {self.home_team} v {self.away_team}"


class Goal(models.Model):
    fixture = models.ForeignKey(Fixture, on_delete=models.CASCADE, related_name="goals")
    credited_team = models.ForeignKey(Team, on_delete=models.PROTECT)
    player = models.ForeignKey(Player, on_delete=models.PROTECT, null=True, blank=True, related_name="goals")
    minute = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(130)])
    own_goal = models.BooleanField(default=False)

    class Meta:
        ordering = ["minute", "id"]

    def clean(self):
        if not self.fixture_id:
            return
        fixture = self.fixture
        if fixture.status != Fixture.Status.COMPLETED:
            raise ValidationError("Goals require a completed match.")
        participants = {fixture.home_team_id, fixture.away_team_id}
        if self.credited_team_id not in participants:
            raise ValidationError("The credited team must participate in the match.")
        if self.player_id:
            if self.player.team_id not in participants:
                raise ValidationError("The scorer must belong to a participating team.")
            if (self.player.team_id == self.credited_team_id) == self.own_goal:
                raise ValidationError("Own goals must be credited to the opposing team.")
        limit = fixture.home_score if self.credited_team_id == fixture.home_team_id else fixture.away_score
        if fixture.goals.filter(credited_team_id=self.credited_team_id).exclude(pk=self.pk).count() >= (limit or 0):
            raise ValidationError("Recorded goals cannot exceed the match score.")
