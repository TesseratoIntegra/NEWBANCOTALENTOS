from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date
import random

from accounts.models import UserProfile
from candidates.models import (
    CandidateProfile, CandidateEducation, CandidateExperience, 
    CandidateLanguage, CandidateSkill
)


class Command(BaseCommand):
    help = 'Popula o banco com dados de exemplo para candidatos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Número de candidatos para criar'
        )

    def handle(self, *args, **options):
        count = options['count']

        self.stdout.write(f'Criando {count} candidatos de exemplo...')

        with transaction.atomic():
            self.create_sample_candidates(count)

        self.stdout.write(
            self.style.SUCCESS(f'{count} candidatos criados com sucesso!')
        )

    def create_sample_candidates(self, count):
        """Cria candidatos de exemplo"""

        # Dados de exemplo
        positions = [
            'Desenvolvedor Python', 'Analista de Sistemas', 'Designer UX/UI',
            'Gerente de Projetos', 'Analista de Marketing', 'Contador',
            'Engenheiro de Software', 'Coordenador de Vendas', 'Especialista em RH',
            'Analista Financeiro', 'Product Manager', 'DevOps Engineer',
            'Data Scientist', 'Frontend Developer', 'Backend Developer'
        ]

        companies = [
            'Google', 'Microsoft', 'Amazon', 'Facebook', 'Apple',
            'Netflix', 'Uber', 'Airbnb', 'Spotify', 'Tesla',
            'Nubank', 'Magazine Luiza', 'Stone', 'PagSeguro', 'iFood'
        ]

        skills = [
            'Python', 'JavaScript', 'React', 'Django', 'Node.js',
            'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
            'Git', 'Agile', 'Scrum', 'Machine Learning', 'Data Analysis'
        ]

        universities = [
            'USP', 'UNICAMP', 'UFRJ', 'UFMG', 'UFRGS',
            'PUC-SP', 'Mackenzie', 'FGV', 'Insper', 'UFSC'
        ]

        courses = [
            'Ciência da Computação', 'Engenharia de Software', 'Sistemas de Informação',
            'Administração', 'Engenharia de Produção', 'Design', 'Marketing',
            'Contabilidade', 'Economia', 'Psicologia'
        ]

        languages = ['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano']

        for i in range(count):
            # Criar usuário candidato
            user = UserProfile.objects.create_user(
                email=f'candidato{i+1}@email.com',
                name=f'Candidato {i+1}',
                password='candidato123',
                user_type='candidate'
            )

            # Criar perfil
            profile = CandidateProfile.objects.create(
                user=user,
                cpf=f'{random.randint(10000000000, 99999999999)}',
                date_of_birth=date(
                    random.randint(1985, 2000),
                    random.randint(1, 12),
                    random.randint(1, 28)
                ),
                gender=random.choice(['M', 'F', 'O']),
                zip_code=f'{random.randint(10000, 99999)}-{random.randint(100, 999)}',
                street=f'Rua {random.choice(["das Flores", "Principal", "da Paz", "do Sol"])}',
                number=str(random.randint(1, 999)),
                neighborhood=random.choice(['Centro', 'Jardim', 'Vila Nova', 'Bela Vista']),
                current_position=random.choice(positions),
                current_company=random.choice(companies),
                education_level=random.choice(['superior', 'pos_graduacao', 'mestrado']),
                experience_years=random.randint(1, 15),
                desired_salary_min=random.randint(3000, 8000),
                desired_salary_max=random.randint(8000, 20000),
                professional_summary=f'Profissional experiente em {random.choice(positions)} com sólida formação e experiência prática em desenvolvimento de soluções inovadoras.',
                skills=', '.join(random.sample(skills, 5)),
                linkedin_url=f'https://linkedin.com/in/candidato{i+1}',
                available_for_work=random.choice([True, False]),
                accepts_remote_work=random.choice([True, False]),
                can_travel=random.choice([True, False])
            )

            # Criar educação
            self.create_education(profile, universities, courses)

            # Criar experiências
            self.create_experiences(profile, companies, positions)

            # Criar idiomas
            self.create_languages(profile, languages)

            # Criar habilidades detalhadas
            self.create_skills(profile, skills)

            self.stdout.write(f'Candidato {i+1} criado: {user.name}')

    def create_education(self, profile, universities, courses):
        """Cria formação acadêmica"""
        start_year = random.randint(2015, 2020)

        CandidateEducation.objects.create(
            candidate=profile,
            institution=random.choice(universities),
            course=random.choice(courses),
            degree='Bacharelado',
            start_date=date(start_year, 3, 1),
            end_date=date(start_year + 4, 12, 15),
            is_current=False,
            description=f'Graduação com foco em tecnologia e inovação.'
        )

    def create_experiences(self, profile, companies, positions):
        """Cria experiências profissionais"""

        # Experiência atual
        current_start = date(2022, random.randint(1, 12), 1)
        CandidateExperience.objects.create(
            candidate=profile,
            company=profile.current_company,
            position=profile.current_position,
            start_date=current_start,
            is_current=True,
            description=f'Atualmente trabalho como {profile.current_position}, desenvolvendo soluções inovadoras e liderando projetos estratégicos.',
            achievements='• Liderou projeto que aumentou produtividade em 30%\n• Implementou nova arquitetura de sistema\n• Mentoreou 5 desenvolvedores júnior',
            salary=profile.desired_salary_max
        )

        # Experiência anterior
        prev_start = date(2020, random.randint(1, 12), 1)
        prev_end = date(2022, random.randint(1, 11), 28)
        CandidateExperience.objects.create(
            candidate=profile,
            company=random.choice(companies),
            position=random.choice(positions),
            start_date=prev_start,
            end_date=prev_end,
            is_current=False,
            description='Experiência anterior que contribuiu significativamente para meu crescimento profissional.',
            achievements='• Desenvolveu sistema de gestão\n• Otimizou processos internos\n• Trabalhou em equipe ágil',
            salary=profile.desired_salary_min
        )

    def create_languages(self, profile, languages):
        """Cria idiomas"""
        # Sempre adiciona inglês
        CandidateLanguage.objects.create(
            candidate=profile,
            language='Inglês',
            proficiency=random.choice(['intermediate', 'advanced', 'fluent']),
            has_certificate=random.choice([True, False]),
            certificate_name='TOEFL' if random.choice([True, False]) else ''
        )

        # Adiciona outro idioma aleatório
        if random.choice([True, False]):
            other_lang = random.choice([lang for lang in languages if lang != 'Inglês'])
            CandidateLanguage.objects.create(
                candidate=profile,
                language=other_lang,
                proficiency=random.choice(['basic', 'intermediate']),
                has_certificate=False
            )

    def create_skills(self, profile, skills):
        """Cria habilidades detalhadas"""
        candidate_skills = random.sample(skills, random.randint(3, 7))

        for skill in candidate_skills:
            CandidateSkill.objects.create(
                candidate=profile,
                skill_name=skill,
                level=random.choice(['intermediate', 'advanced', 'expert']),
                years_experience=random.randint(1, profile.experience_years)
            )
