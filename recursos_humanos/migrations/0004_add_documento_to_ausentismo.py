from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('recursos_humanos', '0003_contact_alter_empleado_area_alter_empleado_cargo_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='ausentismo',
            name='documento',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ] 