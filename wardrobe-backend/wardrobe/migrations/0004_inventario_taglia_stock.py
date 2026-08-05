from django.db import migrations, models
import django.db.models.deletion


def distribute_quantita(total: int, n: int) -> list[int]:
    if n <= 0:
        return []
    base, resto = divmod(total, n)
    return [base + (1 if i < resto else 0) for i in range(n)]


def migrate_stock_from_json(apps, schema_editor):
    Inventario = apps.get_model('wardrobe', 'Inventario')
    InventarioTaglia = apps.get_model('wardrobe', 'InventarioTaglia')
    ammesse = ('S', 'M', 'L', 'XL')

    for item in Inventario.objects.all():
        raw_taglie = item.taglie if isinstance(item.taglie, list) else []
        taglie = [t for t in raw_taglie if t in ammesse]
        # dedupe preserving order
        seen = set()
        taglie = [t for t in taglie if not (t in seen or seen.add(t))]
        qty = int(item.quantita or 0)

        if not taglie:
            if qty > 0:
                InventarioTaglia.objects.create(costume=item, taglia='M', quantita=qty)
            continue

        parts = distribute_quantita(qty, len(taglie))
        for taglia, part in zip(taglie, parts):
            if part > 0:
                InventarioTaglia.objects.create(
                    costume=item,
                    taglia=taglia,
                    quantita=part,
                )


def noop_reverse(apps, schema_editor):
    InventarioTaglia = apps.get_model('wardrobe', 'InventarioTaglia')
    InventarioTaglia.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('wardrobe', '0003_costume_immagine_blob'),
    ]

    operations = [
        migrations.CreateModel(
            name='InventarioTaglia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('taglia', models.CharField(choices=[('S', 'S'), ('M', 'M'), ('L', 'L'), ('XL', 'XL')], max_length=4)),
                ('quantita', models.PositiveIntegerField(default=0)),
                (
                    'costume',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='stock_taglie',
                        to='wardrobe.inventario',
                    ),
                ),
            ],
            options={
                'verbose_name': 'Stock taglia',
                'verbose_name_plural': 'Stock per taglia',
                'ordering': ['taglia'],
            },
        ),
        migrations.AddConstraint(
            model_name='inventariotaglia',
            constraint=models.UniqueConstraint(fields=('costume', 'taglia'), name='uniq_inventario_taglia'),
        ),
        migrations.RunPython(migrate_stock_from_json, noop_reverse),
        migrations.RemoveField(
            model_name='inventario',
            name='quantita',
        ),
        migrations.RemoveField(
            model_name='inventario',
            name='taglie',
        ),
    ]
