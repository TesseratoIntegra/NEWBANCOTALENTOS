"""
Serviço de conexão direta ao banco Oracle do Protheus.
Usado para consultar tabela SRA (Funcionários) e tabelas auxiliares.

Requer: pip install oracledb
"""

import oracledb
import logging
from typing import Dict, Any, List, Optional
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class ProtheusOracleError(Exception):
    """Exceção para erros de consulta ao banco Protheus."""
    pass


class ProtheusOracleService:
    """Serviço para conexão direta ao Oracle do Protheus (tabela SRA - Funcionários)."""

    # Tabelas F3 diretas (validadas no SX3 real)
    LOOKUP_TABELAS = {
        "centro_custo":      {"tabela": "CTT010", "cod": "CTT_CUSTO",  "desc": "CTT_DESC01"},
        "cargo":             {"tabela": "SQ3010", "cod": "Q3_CARGO",   "desc": "Q3_DESCSUM"},
        "codigo_funcao":     {"tabela": "SRJ010", "cod": "RJ_FUNCAO",  "desc": "RJ_DESC"},
        "cod_departamento":  {"tabela": "SQB010", "cod": "QB_DEPTO",   "desc": "QB_DESCRIC"},
        "turno":             {"tabela": "SR6010", "cod": "R6_TURNO",   "desc": "R6_DESC"},
        "cod_sindicato":     {"tabela": "RCE010", "cod": "RCE_CODIGO", "desc": "RCE_DESCRI"},
        "regra_apontamento": {"tabela": "SPA010", "cod": "PA_CODIGO",  "desc": "PA_DESC"},
    }

    # Tabelas SX5 genéricas (código da tabela no SX5010)
    LOOKUP_SX5 = {
        "estado_civil":        "33",
        "tipo_admissao":       "38",
        "tipo_pagamento":      "40",
        "categoria_funcional": "28",
        "vinc_empregado":      "25",
        "nivel_escolaridade":  "26",
        "nacionalidade":       "34",
        "estado":              "12",
        "contr_sindical":      "29",
        "cod_retencao":        "37",
    }

    # CBOX inline (parse direto, sem query ao banco)
    LOOKUP_CBOX = {
        "sexo":                  "M=Masculino;F=Feminino",
        "raca_cor":              "1=Indigena;2=Branca;4=Preta;6=Amarela;8=Parda;9=Nao Informado",
        "tp_previdencia":        "1=RGPS-Reg. Geral Prev. Social;2=RPPS-Reg. Proprio Prev. Social",
        "tp_contrato_trab":      "1=Indeterminado;2=Determinado;3=Intermitente",
        "tipo_conta_salario":    "1=Conta Corrente;2=Conta Poupanca",
        "tipo_endereco":         "1=Comercial;2=Residencial",
        "alt_cbo":               "S=SIM;N=NAO",
        "clau_assec":            "1=Sim;2=Nao",
        "mens_sindical":         "1=Sim;2=Nao",
        "contr_assistencial":    "1=Sim;2=Nao",
        "plano_saude":           "1=Sim;2=Nao",
        "bh_folha":              "S=Sim;N=Nao",
        "acum_b_horas":          "S=Sim;N=Nao",
        "ct_tempo_parcial":      "1=Sim;2=Nao",
        "possui_periculosidade": "1=Nao;2=Sim",
        "possui_insalubridade":  "1=Nao;2=Insalubridade Minima;3=Insalubridade Media;4=Insalubridade Maxima",
        "defic_fisico":          "S=Sim;N=Nao",
        "cota_def":              "S=Sim;N=Nao",
        "beneficiario_reabilitado": "S=Sim;N=Nao",
        "aposentado":            "S=Sim;N=Nao",
        "res_exterior":          "S=Sim;N=Nao",
        "comp_sabado":           "S=Sim;N=Nao",
        "calc_inss":             "S=Sim;N=Nao",
    }

    def __init__(self):
        self.host = getattr(settings, 'ORACLE_HOST', '')
        self.port = getattr(settings, 'ORACLE_PORT', '1521')
        self.service_name = getattr(settings, 'ORACLE_SERVICE_NAME', '')
        self.username = getattr(settings, 'ORACLE_USER', '')
        self.password = getattr(settings, 'ORACLE_PASSWORD', '')
        self.schema = getattr(settings, 'ORACLE_SCHEMA', '')

    def is_configured(self) -> bool:
        """Verifica se a conexão está configurada."""
        return bool(self.host and self.service_name and self.username and self.password)

    def _get_connection(self):
        """Cria conexão com o banco Oracle (modo thin — sem Oracle Client)."""
        if not self.is_configured():
            raise ProtheusOracleError("Conexão Oracle não configurada. Verifique as variáveis ORACLE_* no .env")

        try:
            dsn = f"{self.host}:{self.port}/{self.service_name}"
            connection = oracledb.connect(
                user=self.username,
                password=self.password,
                dsn=dsn
            )
            return connection
        except oracledb.Error as e:
            logger.error(f"[Oracle] Erro ao conectar: {e}")
            raise ProtheusOracleError(f"Erro de conexão Oracle: {e}")

    def _get_table_name(self, table: str) -> str:
        """Retorna nome completo da tabela com schema."""
        if self.schema:
            return f"{self.schema}.{table}"
        return table

    def test_connection(self) -> Dict[str, Any]:
        """Testa a conexão com o banco Oracle."""
        if not self.is_configured():
            return {
                "connected": False,
                "error": "Variáveis ORACLE_* não configuradas no .env",
                "config": {
                    "host": self.host or "(vazio)",
                    "port": self.port,
                    "service_name": self.service_name or "(vazio)",
                    "user": self.username or "(vazio)",
                    "schema": self.schema or "(vazio)",
                }
            }

        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM DUAL")
            row = cursor.fetchone()
            cursor.close()
            conn.close()

            return {
                "connected": True,
                "host": self.host,
                "port": self.port,
                "service_name": self.service_name,
                "schema": self.schema,
                "test_query": "OK" if row else "FAIL",
            }
        except Exception as e:
            return {
                "connected": False,
                "error": str(e),
                "host": self.host,
                "service_name": self.service_name,
            }

    def check_sra_table(self) -> Dict[str, Any]:
        """Verifica se a tabela SRA010 (Funcionários) existe e retorna contagem."""
        if not self.is_configured():
            return {"exists": False, "error": "Não configurado"}

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            sra_table = self._get_table_name("SRA010")
            cursor.execute(f"SELECT COUNT(*) FROM {sra_table} WHERE D_E_L_E_T_ = ' '")
            row = cursor.fetchone()
            count = row[0] if row else 0

            cursor.close()
            conn.close()

            return {
                "exists": True,
                "table": sra_table,
                "active_records": count,
            }
        except Exception as e:
            return {
                "exists": False,
                "error": str(e),
            }

    def list_sra_fields(self) -> List[Dict[str, Any]]:
        """Lista campos da tabela SRA no dicionário SX3."""
        if not self.is_configured():
            return []

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            sx3_table = self._get_table_name("SX3010")
            query = f"""
                SELECT
                    TRIM(X3_CAMPO) as campo,
                    TRIM(X3_TIPO) as tipo,
                    X3_TAMANHO as tamanho,
                    X3_DECIMAL as decimais,
                    TRIM(X3_TITULO) as titulo,
                    TRIM(X3_DESCRIC) as descricao
                FROM {sx3_table}
                WHERE TRIM(X3_ARQUIVO) = 'SRA'
                  AND D_E_L_E_T_ = ' '
                ORDER BY X3_ORDEM
            """

            cursor.execute(query)
            columns = [col[0].lower() for col in cursor.description]

            campos = []
            for row in cursor.fetchall():
                campos.append(dict(zip(columns, row)))

            cursor.close()
            conn.close()

            return campos
        except Exception as e:
            logger.error(f"[Oracle] Erro ao listar campos SRA: {e}")
            return []

    def search_employee(self, term: str) -> List[Dict[str, str]]:
        """Busca funcionários na SRA pelo nome ou matrícula."""
        if not self.is_configured():
            return []

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            sra_table = self._get_table_name("SRA010")
            query = f"""
                SELECT
                    TRIM(RA_MAT) as matricula,
                    TRIM(RA_NOME) as nome,
                    TRIM(RA_CIC) as cpf,
                    TRIM(RA_ADMISSA) as data_admissao,
                    TRIM(RA_CARGO) as cargo
                FROM {sra_table}
                WHERE D_E_L_E_T_ = ' '
                  AND (UPPER(RA_NOME) LIKE UPPER(:termo) OR RA_MAT LIKE :termo2)
                ORDER BY RA_NOME
                FETCH FIRST 20 ROWS ONLY
            """

            cursor.execute(query, {'termo': f'%{term}%', 'termo2': f'%{term}%'})
            rows = cursor.fetchall()

            results = [{
                "matricula": row[0],
                "nome": row[1],
                "cpf": row[2],
                "data_admissao": row[3],
                "cargo": row[4],
            } for row in rows]

            cursor.close()
            conn.close()

            return results
        except Exception as e:
            logger.error(f"[Oracle] Erro ao buscar funcionário: {e}")
            return []

    def buscar_todas_opcoes(self) -> Dict[str, List[Dict[str, str]]]:
        """Retorna TODOS os lookups para o formulário de admissão.

        Consulta 3 fontes:
        1. Tabelas F3 diretas (CTT, SQ3, SRJ, SQB, SR6, RCE, SPA)
        2. Tabela genérica SX5 (estados, nacionalidades, tipos, etc.)
        3. CBOX inline (sexo, S/N flags, etc.) — sem query

        Resultados ficam em cache por 1 hora para evitar queries repetidas ao Oracle.
        """
        if not self.is_configured():
            return {}

        cache_key = 'protheus_lookups_all'
        cached = cache.get(cache_key)
        if cached:
            logger.info("[Oracle] Lookups retornados do cache")
            return cached

        resultado: Dict[str, List[Dict[str, str]]] = {}

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # 1. Tabelas F3 diretas
            for campo, cfg in self.LOOKUP_TABELAS.items():
                tabela = self._get_table_name(cfg["tabela"])
                try:
                    cursor.execute(f"""
                        SELECT TRIM({cfg['cod']}), TRIM({cfg['desc']})
                        FROM {tabela}
                        WHERE D_E_L_E_T_ = ' '
                        ORDER BY {cfg['cod']}
                    """)
                    resultado[campo] = [
                        {"valor": str(r[0]).strip(), "descricao": str(r[1]).strip()}
                        for r in cursor.fetchall()
                        if r[0] and str(r[0]).strip()
                    ]
                except Exception as e:
                    logger.warning(f"[Oracle] Lookup {campo} ({cfg['tabela']}): {e}")
                    resultado[campo] = []

            # 2. Tabela genérica SX5
            sx5 = self._get_table_name("SX5010")
            for campo, tabnum in self.LOOKUP_SX5.items():
                try:
                    cursor.execute(f"""
                        SELECT TRIM(X5_CHAVE), TRIM(X5_DESCRI)
                        FROM {sx5}
                        WHERE TRIM(X5_TABELA) = :t AND D_E_L_E_T_ = ' '
                        ORDER BY X5_CHAVE
                    """, {"t": tabnum})
                    resultado[campo] = [
                        {"valor": str(r[0]).strip(), "descricao": str(r[1]).strip()}
                        for r in cursor.fetchall()
                        if r[0] and str(r[0]).strip()
                    ]
                except Exception as e:
                    logger.warning(f"[Oracle] Lookup SX5[{tabnum}] ({campo}): {e}")
                    resultado[campo] = []

            cursor.close()
            conn.close()

        except Exception as e:
            logger.error(f"[Oracle] Erro ao buscar lookups: {e}")

        # 3. CBOX inline (parse local, sem query)
        for campo, cbox in self.LOOKUP_CBOX.items():
            opcoes = []
            for item in cbox.split(";"):
                if "=" in item:
                    v, d = item.split("=", 1)
                    opcoes.append({"valor": v.strip(), "descricao": d.strip()})
            resultado[campo] = opcoes

        # Cache por 1 hora (lookups do Protheus nao mudam com frequencia)
        if resultado:
            cache.set(cache_key, resultado, 3600)
            logger.info(f"[Oracle] Lookups salvos no cache ({len(resultado)} campos)")

        return resultado
