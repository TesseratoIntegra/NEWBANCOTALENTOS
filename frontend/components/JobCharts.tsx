'use client';

import { Job } from '@/types/index';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface JobChartsProps {
  jobs: Job[];
}

export default function JobCharts({ jobs }: JobChartsProps) {
  // Dados para gráfico de tipos de contrato
  const jobTypeData = jobs.reduce((acc, job) => {
    const type = job.job_type;
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        type,
        count: 1,
        label: getJobTypeLabel(type)
      });
    }
    return acc;
  }, [] as { type: string; count: number; label: string }[]);

  // Dados para gráfico de modalidades
  const typeModelsData = jobs.reduce((acc, job) => {
    const type = job.type_models;
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        type,
        count: 1,
        label: getTypeModelsLabel(type)
      });
    }
    return acc;
  }, [] as { type: string; count: number; label: string }[]);

  // Dados para gráfico de vagas por localização (top 10)
  const locationData = jobs.reduce((acc, job) => {
    const location = job.location;
    const existing = acc.find(item => item.location === location);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ location, count: 1 });
    }
    return acc;
  }, [] as { location: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Dados para gráfico de linha - vagas criadas por mês
  const monthlyData = jobs.reduce((acc, job) => {
    const date = new Date(job.created_at);
    const month = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.total++;
      if (job.is_active) {
        existing.active++;
      } else {
        existing.inactive++;
      }
    } else {
      acc.push({
        month,
        total: 1,
        active: job.is_active ? 1 : 0,
        inactive: job.is_active ? 0 : 1
      });
    }
    return acc;
  }, [] as { month: string; total: number; active: number; inactive: number }[])
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Cores para os gráficos
  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  function getJobTypeLabel(type: string) {
    const labels = {
      'full_time': 'Tempo Integral',
      'part_time': 'Meio Período',
      'contract': 'Contrato',
      'freelance': 'Freelance',
      'internship': 'Estágio'
    };
    return labels[type as keyof typeof labels] || type;
  }

  function getTypeModelsLabel(type: string) {
    const labels = {
      'in_person': 'Presencial',
      'home_office': 'Home Office',
      'hybrid': 'Híbrido'
    };
    return labels[type as keyof typeof labels] || type;
  }

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-md p-3 shadow-lg">
          <p className="text-slate-800 font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-slate-600" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Análise de Dados</h2>

      {/* Primeira linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Tipos de Contrato */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Distribuição por Tipo de Contrato
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={jobTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }) => `${label} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {jobTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Modalidades */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Vagas por Modalidade
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeModelsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras Horizontais - Localizações */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Top 10 Localizações
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                type="category"
                dataKey="location"
                tick={{ fill: '#475569', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Linha - Evolução temporal */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Evolução das Vagas por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0284c7"
                strokeWidth={2}
                name="Total"
              />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#10b981"
                strokeWidth={2}
                name="Ativas"
              />
              <Line
                type="monotone"
                dataKey="inactive"
                stroke="#ef4444"
                strokeWidth={2}
                name="Inativas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm text-center">
          <h4 className="text-sm font-medium text-slate-500">Média por Localização</h4>
          <p className="text-2xl font-bold text-slate-800">
            {locationData.length > 0 ? (jobs.length / locationData.length).toFixed(1) : '0'}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm text-center">
          <h4 className="text-sm font-medium text-slate-500">Modalidade Mais Popular</h4>
          <p className="text-lg font-bold text-slate-800">
            {typeModelsData.length > 0
              ? typeModelsData.reduce((prev, current) =>
                  prev.count > current.count ? prev : current
                ).label
              : 'N/A'
            }
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm text-center">
          <h4 className="text-sm font-medium text-slate-500">Tipo Mais Comum</h4>
          <p className="text-lg font-bold text-slate-800">
            {jobTypeData.length > 0
              ? jobTypeData.reduce((prev, current) =>
                  prev.count > current.count ? prev : current
                ).label
              : 'N/A'
            }
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm text-center">
          <h4 className="text-sm font-medium text-slate-500">Taxa de Ativação</h4>
          <p className="text-2xl font-bold text-slate-800">
            {jobs.length > 0
              ? ((jobs.filter(job => job.is_active).length / jobs.length) * 100).toFixed(1)
              : '0'
            }%
          </p>
        </div>
      </div>
    </div>
  );
}
