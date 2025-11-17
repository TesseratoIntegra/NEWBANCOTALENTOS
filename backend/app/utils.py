import os
import uuid
from django.utils.text import slugify
from django.utils.deconstruct import deconstructible


@deconstructible
class UniqueFilePathGenerator:
    """
    Gera caminhos de arquivo únicos e seguros para uploads.
    Remove caracteres especiais e adiciona UUID para evitar conflitos.

    Uso:
        file = models.FileField(upload_to=UniqueFilePathGenerator('resumes'))
    """

    def __init__(self, sub_path):
        self.sub_path = sub_path

    def __call__(self, instance, filename):
        """
        Gera um nome de arquivo único e seguro.

        Args:
            instance: Instância do modelo
            filename: Nome original do arquivo

        Returns:
            str: Caminho completo do arquivo sanitizado
        """
        # Separa nome e extensão
        name, ext = os.path.splitext(filename)

        # Remove caracteres especiais do nome usando slugify
        # slugify converte "Meu Currículo.pdf" em "meu-curriculo.pdf"
        safe_name = slugify(name)

        # Se o nome ficou vazio após slugify (ex: arquivo com nome só em chinês/japonês)
        # usa um nome genérico
        if not safe_name:
            safe_name = 'file'

        # Limita o tamanho do nome para evitar nomes muito longos
        # Sistema de arquivos tem limite de 255 caracteres
        max_length = 100
        if len(safe_name) > max_length:
            safe_name = safe_name[:max_length]

        # Adiciona UUID único para garantir que não haverá conflito
        # Isso evita que dois arquivos com mesmo nome sobrescrevam um ao outro
        unique_id = uuid.uuid4().hex[:8]  # Usa apenas 8 caracteres do UUID

        # Monta o nome final: nome-sanitizado_uuid.extensao
        final_filename = f"{safe_name}_{unique_id}{ext.lower()}"

        # Retorna o caminho completo: sub_path/nome-sanitizado_uuid.extensao
        return os.path.join(self.sub_path, final_filename)


def sanitize_filename(filename):
    """
    Sanitiza um nome de arquivo removendo caracteres especiais.

    Args:
        filename: Nome do arquivo original

    Returns:
        str: Nome do arquivo sanitizado

    Exemplo:
        >>> sanitize_filename("Meu Currículo (2024).pdf")
        'meu-curriculo-2024.pdf'
    """
    name, ext = os.path.splitext(filename)
    safe_name = slugify(name)

    if not safe_name:
        safe_name = 'file'

    # Limita o tamanho
    if len(safe_name) > 100:
        safe_name = safe_name[:100]

    return f"{safe_name}{ext.lower()}"
