export interface State {
  id: number;
  sigla: string;
  nome: string;
}

export interface City {
  id: number;
  nome: string;
}

// Lista fixa de estados brasileiros (não muda, evita chamada API desnecessária)
const BRAZILIAN_STATES: State[] = [
  { id: 12, sigla: 'AC', nome: 'Acre' },
  { id: 27, sigla: 'AL', nome: 'Alagoas' },
  { id: 16, sigla: 'AP', nome: 'Amapá' },
  { id: 13, sigla: 'AM', nome: 'Amazonas' },
  { id: 29, sigla: 'BA', nome: 'Bahia' },
  { id: 23, sigla: 'CE', nome: 'Ceará' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 52, sigla: 'GO', nome: 'Goiás' },
  { id: 21, sigla: 'MA', nome: 'Maranhão' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 15, sigla: 'PA', nome: 'Pará' },
  { id: 25, sigla: 'PB', nome: 'Paraíba' },
  { id: 41, sigla: 'PR', nome: 'Paraná' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco' },
  { id: 22, sigla: 'PI', nome: 'Piauí' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 11, sigla: 'RO', nome: 'Rondônia' },
  { id: 14, sigla: 'RR', nome: 'Roraima' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 35, sigla: 'SP', nome: 'São Paulo' },
  { id: 28, sigla: 'SE', nome: 'Sergipe' },
  { id: 17, sigla: 'TO', nome: 'Tocantins' }
];

class LocationService {
  private readonly API_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';
  private citiesCache = new Map<number, City[]>();

  getStates(): State[] {
    return BRAZILIAN_STATES;
  }

  getStateByUF(uf: string): State | undefined {
    return BRAZILIAN_STATES.find(s => s.sigla === uf);
  }

  async getCitiesByState(stateId: number): Promise<City[]> {
    const cached = this.citiesCache.get(stateId);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.API_BASE_URL}/estados/${stateId}/municipios?orderBy=nome`);
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades');
      }
      const cities: City[] = await response.json();
      this.citiesCache.set(stateId, cities);
      return cities;
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      return [];
    }
  }
}

const locationService = new LocationService();
export default locationService;
