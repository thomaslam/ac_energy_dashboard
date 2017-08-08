from django.db import models

class Building(models.Model):
	name = models.CharField(max_length=50)

	def __str__(self):
		return self.name

# def get_building():
# 	return Building.objects.get_or_create(id=1)

class Feedback(models.Model):
	COLD = 'CO'
	CHILLY = 'CH'
	PERFECT = 'PE'
	WARM = 'WA'
	HOT = 'HO'
	TEMP_CHOICES = (
		(COLD, 'Cold'),
		(CHILLY, 'Chilly'),
		(PERFECT, 'Perfect'),
		(WARM, 'Warm'),
		(HOT, 'Hot'),
	)

	building = models.ForeignKey(
		Building, 
		on_delete=models.CASCADE)
	temp = models.CharField(
		max_length=2, 
		choices=TEMP_CHOICES
	)
	text = models.CharField(max_length=500)
	votes = models.IntegerField(default=0)

	def __str__(self):
		return self.temp
