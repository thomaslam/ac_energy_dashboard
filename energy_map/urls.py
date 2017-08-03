from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^$', views.index, name='index'),
	url(r'^energy_data/', views.get_energy_data, name='data'),
	url(r'^feedback/', views.feedback, name='feedback'),
]