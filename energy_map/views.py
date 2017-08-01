from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import json, csv, os

def index(request):
	energy_type = request.GET.get('type')
	if energy_type:
		energy_type = energy_type.title()
	else:
		energy_type = 'Electricity'
	
	context = {
		'energy_type': energy_type,
		'demo_data': json.dumps([45, 21, 10, 12, 20, 25, 40, 45, 50, 60, 75, 80])
	}
	return render(request, 'energy_map/index.html', context)

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
