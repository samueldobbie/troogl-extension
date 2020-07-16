from . import views
from django.conf.urls import url

urlpatterns = [
    url(r'^analyse/$', views.analyse_article, name='analyse_article')
]
