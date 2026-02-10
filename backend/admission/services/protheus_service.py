import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class ProtheusService:
    """Serviço para integração com API REST do Protheus ERP."""

    def __init__(self):
        self.base_url = getattr(settings, 'PROTHEUS_API_BASE_URL', '')
        self.api_key = getattr(settings, 'PROTHEUS_API_KEY', '')
        self.timeout = getattr(settings, 'PROTHEUS_API_TIMEOUT', 30)

    def _format_date(self, date_value):
        """Converte data para formato Protheus YYYYMMDD."""
        if date_value:
            return date_value.strftime('%Y%m%d')
        return ""

    def map_to_protheus_payload(self, admission_data):
        """Mapeia AdmissionData para o formato JSON esperado pelo Protheus."""
        return {
            # ============================================
            # ABA CADASTRAIS
            # ============================================
            "RA_MAT": admission_data.matricula,
            "RA_NOME": admission_data.nome,
            "RA_NOMECMP": admission_data.nome_completo,
            "RA_MAE": admission_data.nome_mae,
            "RA_PAI": admission_data.nome_pai,
            "RA_CPAISOR": admission_data.cod_pais_origem,
            "RA_SEXO": admission_data.sexo,
            "RA_RACACOR": admission_data.raca_cor,
            "RA_NASC": self._format_date(admission_data.data_nascimento),
            "RA_ESTCIV": admission_data.estado_civil,
            "RA_NACIONA": admission_data.nacionalidade,
            "RA_PAISORI": admission_data.pais_origem,
            "RA_NACIONC": admission_data.cod_nacion_rfb,
            "RA_BRNASEX": admission_data.bra_nasc_ext,
            "RA_MUNNASC": admission_data.municipio_nascimento,
            "RA_NATURAL": admission_data.naturalidade_uf,
            "RA_CODMUNN": admission_data.cod_mun_nasc,
            "RA_GRINRAI": admission_data.nivel_escolaridade,
            "RA_EMAIL": admission_data.email,
            "RA_DEFIFIS": admission_data.defic_fisico,
            "RA_TPDEFFI": admission_data.tp_deficiencia,
            "RA_CTPCD": admission_data.cota_def,
            "RA_BRPDH": admission_data.beneficiario_reabilitado,

            # ============================================
            # ABA FUNCIONAIS
            # ============================================
            "RA_CC": admission_data.centro_custo,
            "RA_ADMISSA": self._format_date(admission_data.data_admissao),
            "RA_TIPOADM": admission_data.tipo_admissao,
            "RA_ALTADM": admission_data.alt_admissao,
            "RA_OPCAO": self._format_date(admission_data.dt_op_fgts),
            "RA_PERFGTS": str(admission_data.perc_fgts) if admission_data.perc_fgts else "",
            "RA_TPCTSAL": admission_data.tipo_conta_salario,
            "RA_HRSMES": str(admission_data.horas_mensais) if admission_data.horas_mensais else "",
            "RA_TPPREVI": admission_data.tp_previdencia,
            "RA_CODFUNC": admission_data.codigo_funcao,
            "RA_TPCONTR": admission_data.tp_contrato_trab,
            "RA_SALARIO": str(admission_data.salario) if admission_data.salario else "",
            "RA_ANTEAUM": str(admission_data.salario_base) if admission_data.salario_base else "",
            "RA_HOPARC": admission_data.ct_tempo_parcial,
            "RA_PERCADT": str(admission_data.perc_adiantamento) if admission_data.perc_adiantamento else "",
            "RA_SINDICA": admission_data.cod_sindicato,
            "RA_CLAURES": admission_data.clau_assec,
            "RA_ALTCBO": admission_data.alt_cbo,
            "RA_TIPOPGT": admission_data.tipo_pagamento,
            "RA_CATFUNC": admission_data.categoria_funcional,
            "RA_VIEMRAI": admission_data.vinc_empregado,
            "RA_CATEFD": admission_data.cate_esocial,
            "RA_VCTOEXP": self._format_date(admission_data.venc_exper_1),
            "RA_VCTEXP2": self._format_date(admission_data.venc_exper_2),
            "RA_EXAMEDI": self._format_date(admission_data.venc_exame_med),
            "RA_ASSIST": admission_data.contr_assistencial,
            "RA_MENSIND": admission_data.mens_sindical,
            "RA_CARGO": admission_data.cargo,
            "RA_COMPSAB": admission_data.comp_sabado,
            "RA_DEPTO": admission_data.cod_departamento,
            "RA_PGCTSIN": admission_data.contr_sindical,
            "RA_EAPOSEN": admission_data.aposentado,
            "RA_PROCES": admission_data.cod_processo,

            # ============================================
            # ABA Nº DOCUMENTOS
            # ============================================
            "RA_PIS": admission_data.pis,
            "RA_RG": admission_data.rg,
            "RA_RESERVI": admission_data.nr_reservista,
            "RA_TITULOE": admission_data.titulo_eleitor,
            "RA_ZONASEC": admission_data.zona_eleitoral,
            "RA_SECAO": admission_data.secao_eleitoral,
            "RA_CIC": admission_data.cpf,

            # ============================================
            # ABA ENDEREÇO
            # ============================================
            "RA_RESEXT": admission_data.res_exterior,
            "RA_TIPENDE": admission_data.tipo_endereco,
            "RA_LOGRTP": admission_data.tipo_logradouro,
            "RA_ENDEREC": admission_data.endereco,
            "RA_NUMENDE": admission_data.num_endereco,
            "RA_LOGRDSC": admission_data.desc_logradouro,
            "RA_MUNICIP": admission_data.municipio,
            "RA_LOGRNUM": admission_data.nr_logradouro,
            "RA_BAIRRO": admission_data.bairro,
            "RA_ESTADO": admission_data.estado,
            "RA_CODMUN": admission_data.cod_municipio,
            "RA_CEP": admission_data.cep,
            "RA_TELEFON": admission_data.telefone,
            "RA_DDDFONE": admission_data.ddd_telefone,
            "RA_DDDCELU": admission_data.ddd_celular,
            "RA_NUMCELU": admission_data.numero_celular,

            # ============================================
            # ABA BENEFÍCIOS
            # ============================================
            "RA_PLSAUDE": admission_data.plano_saude,

            # ============================================
            # ABA RELÓGIO REGISTRADOR
            # ============================================
            "RA_TNOTRAB": admission_data.turno,
            "RA_CRACHA": admission_data.nr_cracha,
            "RA_REGRA": admission_data.regra_apontamento,
            "RA_SEQTURN": admission_data.seq_ini_turno,
            "RA_BHFOL": admission_data.bh_folha,
            "RA_ACUMBH": admission_data.acum_b_horas,

            # ============================================
            # ABA OUTRAS INFORMAÇÕES
            # ============================================
            "RA_CODRET": admission_data.cod_retencao,

            # ============================================
            # ABA CARGOS E SALÁRIOS
            # ============================================
            "RA_TABELA": admission_data.tabela_salarial,
            "RA_TABNIVE": admission_data.nivel_tabela,
            "RA_TABFAIX": admission_data.faixa_tabela,

            # ============================================
            # ESTRANGEIRO
            # ============================================
            "RA_INSSAUT": admission_data.calc_inss,

            # ============================================
            # ABA ADICIONAIS
            # ============================================
            "RA_ADTPOSE": admission_data.adc_tempo_servico,
            "RA_ADCPERI": admission_data.possui_periculosidade,
            "RA_ADCINS": admission_data.possui_insalubridade,
        }

    def send_employee_registration(self, admission_data):
        """
        POST para API REST do Protheus - Cadastro de Funcionário (GPEA010).
        Endpoint: POST {base_url}/rest/fwmodel/GPEA010
        Tabela: SRA (SRA010) — Funcionários

        Formato FWModel:
        {
            "operation": 3,  // 3=inclusão, 4=alteração
            "fields": { "RA_MAT": "...", "RA_NOME": "...", ... }
        }
        """
        fields = self.map_to_protheus_payload(admission_data)

        # Payload no formato FWModel do Protheus
        payload = {
            "operation": 3,  # 3 = Inclusão
            "fields": fields,
        }

        url = f"{self.base_url}/rest/fwmodel/GPEA010"

        logger.info(
            f"[Protheus] Payload preparado para candidato "
            f"{admission_data.candidate.user.name} (ID: {admission_data.candidate.id}) "
            f"| Endpoint: {url} | Campos: {len(fields)}"
        )

        # ==========================================================
        # TODO: Descomentar quando API Protheus estiver disponível
        # ==========================================================
        # import requests
        #
        # try:
        #     response = requests.post(
        #         url,
        #         json=payload,
        #         headers={
        #             "Authorization": f"Bearer {self.api_key}",
        #             "Content-Type": "application/json",
        #         },
        #         timeout=self.timeout,
        #     )
        #     response.raise_for_status()
        #     logger.info(f"[Protheus] Funcionário cadastrado com sucesso: {response.status_code}")
        #     return response.json()
        # except requests.exceptions.RequestException as e:
        #     logger.error(f"[Protheus] Erro ao cadastrar funcionário: {e}")
        #     return {"status": "error", "message": str(e)}
        # ==========================================================

        return {"status": "prepared", "payload": payload}
