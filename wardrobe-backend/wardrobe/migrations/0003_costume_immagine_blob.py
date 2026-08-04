from pathlib import Path

from django.db import migrations, models


SEED_IMAGES_DIR = Path(__file__).resolve().parent.parent / 'fixtures' / 'seed_images'

CONTENT_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
}


def load_seed_images(apps, schema_editor):
    Inventario = apps.get_model('wardrobe', 'Inventario')
    if not SEED_IMAGES_DIR.is_dir():
        return

    for path in sorted(SEED_IMAGES_DIR.iterdir()):
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        content_type = CONTENT_TYPES.get(suffix)
        if not content_type:
            continue
        codice = path.stem
        Inventario.objects.filter(codice=codice).update(
            immagine=path.read_bytes(),
            immagine_content_type=content_type,
        )


def unload_seed_images(apps, schema_editor):
    Inventario = apps.get_model('wardrobe', 'Inventario')
    if not SEED_IMAGES_DIR.is_dir():
        return
    codici = [
        path.stem
        for path in SEED_IMAGES_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in CONTENT_TYPES
    ]
    Inventario.objects.filter(codice__in=codici).update(
        immagine=None,
        immagine_content_type='',
    )


class Migration(migrations.Migration):

    dependencies = [
        ('wardrobe', '0002_seed_costumi'),
    ]

    operations = [
        migrations.AddField(
            model_name='inventario',
            name='immagine',
            field=models.BinaryField(
                blank=True,
                editable=False,
                help_text='Blob binario dell’immagine del costume',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='inventario',
            name='immagine_content_type',
            field=models.CharField(
                blank=True,
                default='',
                help_text='MIME type dell’immagine (es. image/jpeg)',
                max_length=64,
            ),
        ),
        migrations.RunPython(load_seed_images, unload_seed_images),
        migrations.RemoveField(
            model_name='inventario',
            name='immagine_url',
        ),
    ]
