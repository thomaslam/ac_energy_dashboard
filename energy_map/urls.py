from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^$', views.index, name='index'),
	url(r'^energy_data/', views.get_energy_data, name='data'),
	url(r'^contact/', views.contact, name='contact'),
	url(r'^feedback/', views.feedback, name='feedback'),
	url(r'^view_feedbacks/', views.view_feedbacks, name='view_feedbacks'),
	url(r'^leave_feedback/', views.leave_feedback, name='leave_feedback'),
]