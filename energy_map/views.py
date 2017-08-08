from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.core import serializers
from .models import Building, Feedback
import json, csv, os

def index(request):
	energy_type = request.GET.get('type')
	if energy_type:
		energy_type = energy_type.title()
	else:
		energy_type = 'Electricity'
	
	context = {
		'page_type': 'energy_map',
		'energy_type': energy_type
	}
	return render(request, 'energy_map/index.html', context)

def contact(request):
	context = { 'page_type': 'contact' }
	return render(request, 'energy_map/contact.html', context)

def feedback(request):
	context = { 'page_type': 'feedback'}
	return render(request, 'energy_map/feedback.html', context)

def get_energy_data(request):
	# Process corresponding CSV files to bld_name 
	bld_name = request.GET.get('bld')

	csv_filepath = os.path.join(settings.BASE_DIR, bld_name + '.csv')

	with open(csv_filepath, 'r') as f:
		reader = csv.reader(f)
		next(reader)
		next(reader) # skips first 2 rows
		raw_data = list(reader)

	print()
	print("\tLength of raw_data", len(raw_data))
	display_data = [ raw_data[i] for i in range(0, len(raw_data), 10)]
	time_data, _, energy_data = zip(*display_data)

	print()
	print("\t", time_data)
	print()
	print("\t", energy_data)
	print()

	return JsonResponse({
		'time_data': time_data,
		'energy_data': energy_data
		})

def view_feedbacks(request):
	bld_name = request.GET.get('bld')
	print(bld_name)
	bld_obj = Building.objects.get(name=bld_name)

	# Search for feedback with non-empty text field
	# and then serialize into json format
	feedbacks = serializers.serialize('json', bld_obj.feedback_set.filter(text__gt='')) 
	print(json.dumps(json.loads(feedbacks), indent=4))

	doughnut_data = []
	num_cold = bld_obj.feedback_set.filter(temp=Feedback.COLD).count()
	num_chilly = bld_obj.feedback_set.filter(temp=Feedback.CHILLY).count()
	num_perfect = bld_obj.feedback_set.filter(temp=Feedback.PERFECT).count()
	num_warm = bld_obj.feedback_set.filter(temp=Feedback.WARM).count()
	num_hot = bld_obj.feedback_set.filter(temp=Feedback.HOT).count()
	num_total = num_cold + num_chilly + num_perfect + num_warm + num_hot

	doughnut_data.append(num_cold)
	doughnut_data.append(num_chilly)
	doughnut_data.append(num_perfect)
	doughnut_data.append(num_warm)
	doughnut_data.append(num_hot)

	max_num = max(doughnut_data) 
	percentage = 'NA' if num_total == 0 else str("{:.1%}".format(max_num / num_total))
	majority = doughnut_data.index(max_num)

	return JsonResponse({
		'doughnut_data': doughnut_data,
		'feedbacks': feedbacks,
		'percentage': percentage,
		'majority': majority
		});

def leave_feedback(request):
	bld_name = request.GET.get('bld')
	print(bld_name)
	bld_obj = Building.objects.get(name=bld_name)

	return JsonResponse({})
