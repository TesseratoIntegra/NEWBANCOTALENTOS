from django.contrib import admin
from .models import DocumentType, CandidateDocument, AdmissionData


@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_required', 'accepted_formats', 'max_file_size_mb', 'order', 'is_active']
    list_filter = ['is_required', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']


@admin.register(CandidateDocument)
class CandidateDocumentAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'document_type', 'original_filename', 'status', 'reviewed_by', 'reviewed_at']
    list_filter = ['status', 'document_type', 'is_active']
    search_fields = ['candidate__user__name', 'original_filename', 'document_type__name']
    ordering = ['-created_at']
    raw_id_fields = ['candidate', 'reviewed_by']


@admin.register(AdmissionData)
class AdmissionDataAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'nome', 'cpf', 'status', 'filled_by', 'data_inicio_trabalho', 'created_at']
    list_filter = ['status', 'is_active']
    search_fields = ['candidate__user__name', 'nome', 'cpf', 'email']
    ordering = ['-created_at']
    raw_id_fields = ['candidate', 'filled_by']
    readonly_fields = ['protheus_response', 'sent_at', 'created_at', 'updated_at']

    fieldsets = (
        ('Informações Gerais', {
            'fields': ('candidate', 'status', 'filled_by', 'data_inicio_trabalho')
        }),
        ('Cadastrais', {
            'classes': ('collapse',),
            'fields': (
                'matricula', 'nome', 'nome_completo', 'nome_mae', 'nome_pai',
                'cod_pais_origem', 'sexo', 'raca_cor', 'data_nascimento', 'estado_civil',
                'nacionalidade', 'pais_origem', 'cod_nacion_rfb', 'bra_nasc_ext',
                'municipio_nascimento', 'naturalidade_uf', 'cod_mun_nasc',
                'nivel_escolaridade', 'email', 'defic_fisico', 'tp_deficiencia',
                'cota_def', 'beneficiario_reabilitado',
            )
        }),
        ('Funcionais', {
            'classes': ('collapse',),
            'fields': (
                'centro_custo', 'data_admissao', 'tipo_admissao', 'alt_admissao',
                'dt_op_fgts', 'perc_fgts', 'tipo_conta_salario', 'horas_mensais',
                'tp_previdencia', 'codigo_funcao', 'tp_contrato_trab', 'salario',
                'salario_base', 'ct_tempo_parcial', 'perc_adiantamento', 'cod_sindicato',
                'clau_assec', 'alt_cbo', 'tipo_pagamento', 'categoria_funcional',
                'vinc_empregado', 'cate_esocial', 'venc_exper_1', 'venc_exper_2',
                'venc_exame_med', 'contr_assistencial', 'mens_sindical', 'cargo',
                'comp_sabado', 'cod_departamento', 'contr_sindical', 'aposentado',
                'cod_processo',
            )
        }),
        ('Documentos', {
            'classes': ('collapse',),
            'fields': ('pis', 'rg', 'nr_reservista', 'titulo_eleitor', 'zona_eleitoral', 'secao_eleitoral', 'cpf')
        }),
        ('Endereço', {
            'classes': ('collapse',),
            'fields': (
                'res_exterior', 'tipo_endereco', 'tipo_logradouro', 'endereco',
                'num_endereco', 'desc_logradouro', 'municipio', 'nr_logradouro',
                'bairro', 'estado', 'cod_municipio', 'cep', 'telefone',
                'ddd_telefone', 'ddd_celular', 'numero_celular',
            )
        }),
        ('Benefícios', {
            'classes': ('collapse',),
            'fields': ('plano_saude',)
        }),
        ('Relógio Registrador', {
            'classes': ('collapse',),
            'fields': ('turno', 'nr_cracha', 'regra_apontamento', 'seq_ini_turno', 'bh_folha', 'acum_b_horas')
        }),
        ('Outras Informações', {
            'classes': ('collapse',),
            'fields': ('cod_retencao',)
        }),
        ('Cargos e Salários', {
            'classes': ('collapse',),
            'fields': ('tabela_salarial', 'nivel_tabela', 'faixa_tabela')
        }),
        ('Estrangeiro / Adicionais', {
            'classes': ('collapse',),
            'fields': ('calc_inss', 'adc_tempo_servico', 'possui_periculosidade', 'possui_insalubridade')
        }),
        ('Protheus', {
            'classes': ('collapse',),
            'fields': ('protheus_response', 'sent_at')
        }),
        ('Metadados', {
            'classes': ('collapse',),
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
