import csv
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from spontaneous.models import Occupation


class Command(BaseCommand):
    hel = 'Importa ocupações do arquivo ocupacoes.csv'

    def handle(self, *args, **options):
        file_path = os.path.join(settings.BASE_DIR, 'data', 'ocupacoes.csv')

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'Arquivo não encontrado em: {file_path}'))
            return

        with open(file_path, newline='', encoding='latin-1') as csvfile:
            reader = csv.DictReader(csvfile, delimiter=';')
            total = 0
            for row in reader:
                code = row['CODIGO'].strip()
                title = row['TITULO'].strip()

                if not Occupation.objects.filter(code=code).exists():
                    Occupation.objects.create(code=code, title=title)
                    total += 1

        self.stdout.write(self.style.SUCCESS(f'{total} ocupações importadas com sucesso.'))
