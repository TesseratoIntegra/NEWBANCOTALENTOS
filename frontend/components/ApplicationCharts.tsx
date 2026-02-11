'use client';

import { Application } from '@/types/index';
import {
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

interface ApplicationChartsProps {
  applications: Application[];
}

export default function ApplicationCharts({ applications }: ApplicationChartsProps) {
  // Dados para gráfico de status das candidaturas
  const statusData = applications.reduce((acc, application) => {
    const status = application.status;
    const existing = acc.find(item => item.status === status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ 
        status, 
        count: 1,
        label: getStatusLabel(status)
      });
    }
    return acc;
  }, [] as { status: string; count: number; label: string }[]);

  // Dados para gráfico de candidaturas por tipo de vaga
  const jobTypeData = applications
    .filter(app => app.job_type) // Apenas aplicações com tipo de vaga definido
    .reduce((acc, application) => {
      const jobType = application.job_type;
      if (jobType) {
        const existing = acc.find(item => item.type === jobType);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ 
            type: jobType, 
            count: 1,
            label: getJobTypeLabel(jobType)
          });
        }
      }
      return acc;
    }, [] as { type: string; count: number; label: string }[]);

  // Dados para gráfico de linha - candidaturas por mês
  const monthlyData = applications.reduce((acc, application) => {
    const date = new Date(application.applied_at);
    const month = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.total++;
      // Contar por status
      if (application.status === 'approved') existing.approved++;
      else if (application.status === 'rejected') existing.rejected++;
      else if (application.status === 'in_process') existing.in_process++;
      else if (application.status === 'interview_scheduled') existing.interview++;
      else existing.pending++;
    } else {
      acc.push({
        month,
        total: 1,
        approved: application.status === 'approved' ? 1 : 0,
        rejected: application.status === 'rejected' ? 1 : 0,
        in_process: application.status === 'in_process' ? 1 : 0,
        interview: application.status === 'interview_scheduled' ? 1 : 0,
        pending: ['submitted', 'withdrawn'].includes(application.status) ? 1 : 0
      });
    }
    return acc;
  }, [] as { 
    month: string; 
    total: number; 
    approved: number; 
    rejected: number; 
    in_process: number; 
    interview: number; 
    pending: number; 
  }[])
    .sort((a, b) => {
      const dateA = new Date(a.month + ' 01');
      const dateB = new Date(b.month + ' 01');
      return dateA.getTime() - dateB.getTime();
    });

  // Cores para os gráficos
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  function getStatusLabel(status: string) {
    const labels = {
      'submitted': 'Enviada',
      'in_process': 'Em Processo',
      'interview_scheduled': 'Entrevista Agendada',
      'approved': 'Aprovada',
      'rejected': 'Rejeitada',
      'withdrawn': 'Retirada'
    };
    return labels[status as keyof typeof labels] || status;
  }

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
        <div className="bg-white border border-slate-300 rounded-md p-3 shadow-lg">
          <p className="text-slate-700 font-medium">{label}</p>
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
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Análise de Candidaturas</h2>
      
      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Status das Candidaturas */}
        <div className="bg-white rounded-md p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Distribuição por Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }) => `${label} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Linha - Evolução temporal das candidaturas */}
        <div className="bg-white rounded-md p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Evolução das Candidaturas por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <YAxis 
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#6366f1" 
                strokeWidth={2}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Aprovadas"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Rejeitadas"
              />
              <Line 
                type="monotone" 
                dataKey="interview" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Entrevistas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-md p-4 border border-slate-200 text-center">
          <h4 className="text-sm font-medium text-slate-500">Taxa de Aprovação</h4>
          <p className="text-2xl font-bold text-slate-800">
            {applications.length > 0 
              ? ((applications.filter(app => app.status === 'approved').length / applications.length) * 100).toFixed(1)
              : '0'
            }%
          </p>
        </div>
        
        <div className="bg-white rounded-md p-4 border border-slate-200 text-center">
          <h4 className="text-sm font-medium text-slate-500">Status Mais Comum</h4>
          <p className="text-lg font-bold text-slate-800">
            {statusData.length > 0 
              ? statusData.reduce((prev, current) => 
                  prev.count > current.count ? prev : current
                ).label
              : 'N/A'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-md p-4 border border-slate-200 text-center">
          <h4 className="text-sm font-medium text-slate-500">Tipo Mais Procurado</h4>
          <p className="text-lg font-bold text-slate-800">
            {jobTypeData.length > 0 
              ? jobTypeData.reduce((prev, current) => 
                  prev.count > current.count ? prev : current
                ).label
              : 'N/A'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-md p-4 border border-slate-200 text-center">
          <h4 className="text-sm font-medium text-slate-500">Candidaturas em Processo</h4>
          <p className="text-2xl font-bold text-slate-800">
            {applications.filter(app => 
              ['in_process', 'interview_scheduled'].includes(app.status)
            ).length}
          </p>
        </div>
      </div>
    </div>
  );
}
