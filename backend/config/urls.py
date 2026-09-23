from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "MUSU League Administration"
admin.site.site_title = "MUSU"
admin.site.index_title = "League administration"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("core.urls")),
    path("api/v1/", include("league.urls")),
]
