from . import views
from django.conf.urls import url

urlpatterns = [
    url(r'^analyse/(?P<url>[\s\S]+)/$', views.analyse_article, name='analyse_article')
]
