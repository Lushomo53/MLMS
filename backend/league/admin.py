from django.contrib import admin
from .models import Fixture, Goal, Player, Season, Team


class ReadOnlyLeagueAdmin(admin.ModelAdmin):
    """Public-data increment: edits open with the validated organiser workflows."""

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Season)
class SeasonAdmin(ReadOnlyLeagueAdmin):
    list_display = ["name", "is_active", "is_published", "is_demo"]


@admin.register(Team)
class TeamAdmin(ReadOnlyLeagueAdmin):
    list_display = ["name", "abbreviation", "ground"]
    search_fields = ["name"]


@admin.register(Player)
class PlayerAdmin(ReadOnlyLeagueAdmin):
    list_display = ["name", "team", "shirt_number", "position", "is_active"]
    list_filter = ["team", "position"]
    search_fields = ["name"]
    list_select_related = ["team"]


@admin.register(Fixture)
class FixtureAdmin(ReadOnlyLeagueAdmin):
    list_display = ["matchweek", "home_team", "away_team", "status", "home_score", "away_score", "is_published"]
    list_filter = ["season", "matchweek", "status"]
    list_select_related = ["season", "home_team", "away_team"]


@admin.register(Goal)
class GoalAdmin(ReadOnlyLeagueAdmin):
    list_display = ["fixture", "player", "minute", "own_goal"]
    list_select_related = ["fixture__home_team", "fixture__away_team", "player"]

