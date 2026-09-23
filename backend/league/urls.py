from django.urls import path

from .views import LeagueSnapshotView

urlpatterns = [path("league/", LeagueSnapshotView.as_view(), name="league-snapshot")]
