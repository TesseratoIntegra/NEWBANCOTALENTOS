from django.db import models


class Base(models.Model):
    """Modelo base para os campos pertinentes."""
    is_active = models.BooleanField(default=True, verbose_name='Está Ativo?')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado Em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado Em')

    class Meta:
        abstract = True
