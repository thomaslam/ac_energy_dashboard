# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-08-08 03:10
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('energy_map', '0004_auto_20170807_2234'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feedback',
            name='temp',
            field=models.CharField(choices=[('CO', 'Cold'), ('CH', 'Chilly'), ('PE', 'Perfect'), ('WA', 'Warm'), ('HO', 'Hot')], max_length=2),
        ),
    ]
