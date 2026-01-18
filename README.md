# Wardrobe

Applicazione di gestione e visualizzazione di un database di costumi.

## Getting started

```bash
cd wardrobe-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```