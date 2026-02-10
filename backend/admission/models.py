from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from app.models import Base
from app.utils import UniqueFilePathGenerator


class DocumentType(Base):
    """Tipos de documento que o recrutador cria para os candidatos enviarem."""

    name = models.CharField(max_length=100, verbose_name='Nome do Documento')
    description = models.TextField(blank=True, verbose_name='Descrição / Instruções')
    is_required = models.BooleanField(default=True, verbose_name='Obrigatório')
    accepted_formats = models.CharField(
        max_length=100,
        default='pdf,jpg,png',
        verbose_name='Formatos Aceitos',
        help_text='Extensões separadas por vírgula, ex: pdf,jpg,png'
    )
    max_file_size_mb = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name='Tamanho Máximo (MB)'
    )
    order = models.PositiveIntegerField(default=0, verbose_name='Ordem de Exibição')
    created_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_document_types',
        verbose_name='Criado por'
    )

    class Meta:
        verbose_name = 'Tipo de Documento'
        verbose_name_plural = 'Tipos de Documento'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    @property
    def accepted_formats_list(self):
        """Retorna lista de formatos aceitos."""
        return [f.strip().lower() for f in self.accepted_formats.split(',') if f.strip()]


class CandidateDocument(Base):
    """Documento enviado pelo candidato."""

    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    ]

    candidate = models.ForeignKey(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Candidato'
    )
    document_type = models.ForeignKey(
        DocumentType,
        on_delete=models.CASCADE,
        related_name='candidate_documents',
        verbose_name='Tipo de Documento'
    )
    file = models.FileField(
        upload_to=UniqueFilePathGenerator('documents'),
        verbose_name='Arquivo'
    )
    original_filename = models.CharField(max_length=255, verbose_name='Nome Original do Arquivo')
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Status'
    )
    observations = models.TextField(blank=True, verbose_name='Observações do Recrutador')
    reviewed_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_documents',
        verbose_name='Revisado por'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='Data da Revisão')

    class Meta:
        verbose_name = 'Documento do Candidato'
        verbose_name_plural = 'Documentos dos Candidatos'
        unique_together = ['candidate', 'document_type']
        ordering = ['document_type__order', 'document_type__name']

    def __str__(self):
        return f"{self.candidate} - {self.document_type.name}"


class AdmissionData(Base):
    """Dados de admissão para cadastro no Protheus ERP."""

    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('completed', 'Preenchido'),
        ('sent', 'Enviado ao Protheus'),
        ('error', 'Erro no Envio'),
        ('confirmed', 'Confirmado'),
    ]

    candidate = models.OneToOneField(
        'candidates.CandidateProfile',
        on_delete=models.CASCADE,
        related_name='admission_data',
        verbose_name='Candidato'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Status')
    filled_by = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='filled_admissions',
        verbose_name='Preenchido por'
    )
    protheus_response = models.JSONField(null=True, blank=True, verbose_name='Resposta Protheus')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Enviado em')

    # ============================================
    # ABA CADASTRAIS (23 campos)
    # ============================================
    matricula = models.CharField(max_length=6, blank=True, verbose_name='Matrícula')  # RA_MAT
    nome = models.CharField(max_length=100, blank=True, verbose_name='Nome')  # RA_NOME
    nome_completo = models.CharField(max_length=200, blank=True, verbose_name='Nome Completo')  # RA_NOMECMP
    nome_mae = models.CharField(max_length=100, blank=True, verbose_name='Nome da Mãe')  # RA_MAE
    nome_pai = models.CharField(max_length=100, blank=True, verbose_name='Nome do Pai')  # RA_PAI
    cod_pais_origem = models.CharField(max_length=10, blank=True, verbose_name='Cód. País Origem')  # RA_CPAISOR
    sexo = models.CharField(max_length=1, blank=True, verbose_name='Sexo')  # RA_SEXO
    raca_cor = models.CharField(max_length=20, blank=True, verbose_name='Raça/Cor')  # RA_RACACOR
    data_nascimento = models.DateField(null=True, blank=True, verbose_name='Data Nascimento')  # RA_NASC
    estado_civil = models.CharField(max_length=20, blank=True, verbose_name='Estado Civil')  # RA_ESTCIV
    nacionalidade = models.CharField(max_length=50, blank=True, verbose_name='Nacionalidade')  # RA_NACIONA
    pais_origem = models.CharField(max_length=50, blank=True, verbose_name='País Origem')  # RA_PAISORI
    cod_nacion_rfb = models.CharField(max_length=20, blank=True, verbose_name='C. Nacion. RFB')  # RA_NACIONC
    bra_nasc_ext = models.CharField(max_length=5, blank=True, verbose_name='Bra. Nasc. Ext.')  # RA_BRNASEX
    municipio_nascimento = models.CharField(max_length=100, blank=True, verbose_name='Município Nascimento')  # RA_MUNNASC
    naturalidade_uf = models.CharField(max_length=2, blank=True, verbose_name='Naturalidade UF')  # RA_NATURAL
    cod_mun_nasc = models.CharField(max_length=10, blank=True, verbose_name='Cód. Mun. Nasc.')  # RA_CODMUNN
    nivel_escolaridade = models.CharField(max_length=30, blank=True, verbose_name='Nível Escolaridade')  # RA_GRINRAI
    email = models.EmailField(blank=True, verbose_name='Email Principal')  # RA_EMAIL
    defic_fisico = models.CharField(max_length=5, blank=True, verbose_name='Defic. Físico')  # RA_DEFIFIS
    tp_deficiencia = models.CharField(max_length=30, blank=True, verbose_name='Tipo Deficiência')  # RA_TPDEFFI
    cota_def = models.CharField(max_length=5, blank=True, verbose_name='Cota Def.')  # RA_CTPCD
    beneficiario_reabilitado = models.CharField(max_length=5, blank=True, verbose_name='Benef. Reabilitado')  # RA_BRPDH

    # ============================================
    # ABA FUNCIONAIS (32 campos)
    # ============================================
    centro_custo = models.CharField(max_length=20, blank=True, verbose_name='Centro de Custo')  # RA_CC
    data_admissao = models.DateField(null=True, blank=True, verbose_name='Data Admissão')  # RA_ADMISSA
    tipo_admissao = models.CharField(max_length=20, blank=True, verbose_name='Tipo de Admissão')  # RA_TIPOADM
    alt_admissao = models.CharField(max_length=20, blank=True, verbose_name='Alt. Admissão')  # RA_ALTADM
    dt_op_fgts = models.DateField(null=True, blank=True, verbose_name='Dt. Op. FGTS')  # RA_OPCAO
    perc_fgts = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='% FGTS')  # RA_PERFGTS
    tipo_conta_salario = models.CharField(max_length=20, blank=True, verbose_name='Tipo Conta Salário')  # RA_TPCTSAL
    horas_mensais = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name='Horas Mensais')  # RA_HRSMES
    tp_previdencia = models.CharField(max_length=20, blank=True, verbose_name='Tp. Previdência')  # RA_TPPREVI
    codigo_funcao = models.CharField(max_length=20, blank=True, verbose_name='Código da Função')  # RA_CODFUNC
    tp_contrato_trab = models.CharField(max_length=20, blank=True, verbose_name='Tp. Cont. Trab.')  # RA_TPCONTR
    salario = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='Salário')  # RA_SALARIO
    salario_base = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='Salário Base')  # RA_ANTEAUM
    ct_tempo_parcial = models.CharField(max_length=5, blank=True, verbose_name='Ct. T. Parcial')  # RA_HOPARC
    perc_adiantamento = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='% Adiantamento')  # RA_PERCADT
    cod_sindicato = models.CharField(max_length=20, blank=True, verbose_name='C. Sindicato')  # RA_SINDICA
    clau_assec = models.CharField(max_length=20, blank=True, verbose_name='Cláu. Assec.')  # RA_CLAURES
    alt_cbo = models.CharField(max_length=20, blank=True, verbose_name='Alt. CBO')  # RA_ALTCBO
    tipo_pagamento = models.CharField(max_length=20, blank=True, verbose_name='Tipo Pgt.')  # RA_TIPOPGT
    categoria_funcional = models.CharField(max_length=20, blank=True, verbose_name='Categoria Funcional')  # RA_CATFUNC
    vinc_empregado = models.CharField(max_length=20, blank=True, verbose_name='Vínc. Empregado')  # RA_VIEMRAI
    cate_esocial = models.CharField(max_length=20, blank=True, verbose_name='Cate. eSocial')  # RA_CATEFD
    venc_exper_1 = models.DateField(null=True, blank=True, verbose_name='Venc. Exper. 1')  # RA_VCTOEXP
    venc_exper_2 = models.DateField(null=True, blank=True, verbose_name='Venc. Exper. 2')  # RA_VCTEXP2
    venc_exame_med = models.DateField(null=True, blank=True, verbose_name='Ven. Exa. Méd.')  # RA_EXAMEDI
    contr_assistencial = models.CharField(max_length=20, blank=True, verbose_name='Contr. Assistencial')  # RA_ASSIST
    mens_sindical = models.CharField(max_length=20, blank=True, verbose_name='Mens. Sindical')  # RA_MENSIND
    cargo = models.CharField(max_length=50, blank=True, verbose_name='Cargo')  # RA_CARGO
    comp_sabado = models.CharField(max_length=5, blank=True, verbose_name='Comp. Sábado')  # RA_COMPSAB
    cod_departamento = models.CharField(max_length=20, blank=True, verbose_name='Cód. Dpto')  # RA_DEPTO
    contr_sindical = models.CharField(max_length=20, blank=True, verbose_name='Con. Sindical')  # RA_PGCTSIN
    aposentado = models.CharField(max_length=5, blank=True, verbose_name='Aposentado')  # RA_EAPOSEN
    cod_processo = models.CharField(max_length=20, blank=True, verbose_name='Cód. Processo')  # RA_PROCES

    # ============================================
    # ABA Nº DOCUMENTOS (7 campos)
    # ============================================
    pis = models.CharField(max_length=20, blank=True, verbose_name='PIS')  # RA_PIS
    rg = models.CharField(max_length=20, blank=True, verbose_name='RG')  # RA_RG
    nr_reservista = models.CharField(max_length=20, blank=True, verbose_name='Nr. Reservista')  # RA_RESERVI
    titulo_eleitor = models.CharField(max_length=20, blank=True, verbose_name='Tít. Eleitor')  # RA_TITULOE
    zona_eleitoral = models.CharField(max_length=10, blank=True, verbose_name='Zona Eleitoral')  # RA_ZONASEC
    secao_eleitoral = models.CharField(max_length=10, blank=True, verbose_name='Seção Eleitoral')  # RA_SECAO
    cpf = models.CharField(max_length=14, blank=True, verbose_name='CPF')  # RA_CIC

    # ============================================
    # ABA ENDEREÇO (16 campos)
    # ============================================
    res_exterior = models.CharField(max_length=5, blank=True, verbose_name='Res. Exterior')  # RA_RESEXT
    tipo_endereco = models.CharField(max_length=20, blank=True, verbose_name='Tipo Endereço')  # RA_TIPENDE
    tipo_logradouro = models.CharField(max_length=20, blank=True, verbose_name='Tipo Logradouro')  # RA_LOGRTP
    endereco = models.CharField(max_length=255, blank=True, verbose_name='Endereço')  # RA_ENDEREC
    num_endereco = models.CharField(max_length=10, blank=True, verbose_name='Num. Endereço')  # RA_NUMENDE
    desc_logradouro = models.CharField(max_length=100, blank=True, verbose_name='Desc. Logradouro')  # RA_LOGRDSC
    municipio = models.CharField(max_length=100, blank=True, verbose_name='Município')  # RA_MUNICIP
    nr_logradouro = models.CharField(max_length=10, blank=True, verbose_name='Nr. Logradouro')  # RA_LOGRNUM
    bairro = models.CharField(max_length=100, blank=True, verbose_name='Bairro')  # RA_BAIRRO
    estado = models.CharField(max_length=2, blank=True, verbose_name='Estado')  # RA_ESTADO
    cod_municipio = models.CharField(max_length=10, blank=True, verbose_name='Cód. Município')  # RA_CODMUN
    cep = models.CharField(max_length=10, blank=True, verbose_name='CEP')  # RA_CEP
    telefone = models.CharField(max_length=20, blank=True, verbose_name='Telefone')  # RA_TELEFON
    ddd_telefone = models.CharField(max_length=5, blank=True, verbose_name='DDD Telefone')  # RA_DDDFONE
    ddd_celular = models.CharField(max_length=5, blank=True, verbose_name='DDD Celular')  # RA_DDDCELU
    numero_celular = models.CharField(max_length=20, blank=True, verbose_name='Número Celular')  # RA_NUMCELU

    # ============================================
    # ABA BENEFÍCIOS (1 campo)
    # ============================================
    plano_saude = models.CharField(max_length=50, blank=True, verbose_name='Plano de Saúde')  # RA_PLSAUDE

    # ============================================
    # ABA RELÓGIO REGISTRADOR (6 campos)
    # ============================================
    turno = models.CharField(max_length=20, blank=True, verbose_name='Turno')  # RA_TNOTRAB
    nr_cracha = models.CharField(max_length=20, blank=True, verbose_name='Nr. Crachá')  # RA_CRACHA
    regra_apontamento = models.CharField(max_length=20, blank=True, verbose_name='Regra Apontamento')  # RA_REGRA
    seq_ini_turno = models.CharField(max_length=10, blank=True, verbose_name='Seq. Ini. Turno')  # RA_SEQTURN
    bh_folha = models.CharField(max_length=10, blank=True, verbose_name='B.H.P/Folha')  # RA_BHFOL
    acum_b_horas = models.CharField(max_length=10, blank=True, verbose_name='Acum. B. Horas')  # RA_ACUMBH

    # ============================================
    # ABA OUTRAS INFORMAÇÕES (1 campo)
    # ============================================
    cod_retencao = models.CharField(max_length=20, blank=True, verbose_name='Cód. Retenção')  # RA_CODRET

    # ============================================
    # ABA CARGOS E SALÁRIOS (3 campos)
    # ============================================
    tabela_salarial = models.CharField(max_length=20, blank=True, verbose_name='Tabela Salarial')  # RA_TABELA
    nivel_tabela = models.CharField(max_length=20, blank=True, verbose_name='Nível Tabela')  # RA_TABNIVE
    faixa_tabela = models.CharField(max_length=20, blank=True, verbose_name='Faixa Tabela')  # RA_TABFAIX

    # ============================================
    # ESTRANGEIRO (1 campo)
    # ============================================
    calc_inss = models.CharField(max_length=5, blank=True, verbose_name='Calc. INSS')  # RA_INSSAUT

    # ============================================
    # ABA ADICIONAIS (3 campos)
    # ============================================
    adc_tempo_servico = models.CharField(max_length=20, blank=True, verbose_name='Adc. Tempo Serviço')  # RA_ADTPOSE
    possui_periculosidade = models.CharField(max_length=5, blank=True, verbose_name='Periculosidade')  # RA_ADCPERI
    possui_insalubridade = models.CharField(max_length=5, blank=True, verbose_name='Insalubridade')  # RA_ADCINS

    # ============================================
    # FINALIZAÇÃO
    # ============================================
    data_inicio_trabalho = models.DateField(null=True, blank=True, verbose_name='Data Início Trabalho')

    class Meta:
        verbose_name = 'Dados de Admissão'
        verbose_name_plural = 'Dados de Admissão'

    def __str__(self):
        return f"Admissão - {self.candidate}"
