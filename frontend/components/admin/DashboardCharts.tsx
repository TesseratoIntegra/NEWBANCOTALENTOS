'use client';

import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  appPieData: ChartDataItem[];
  pipelineChartData: ChartDataItem[];
  totalApplications: number;
}

export default function DashboardCharts({ appPieData, pipelineChartData, totalApplications }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Candidaturas Pie */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Candidaturas por Status</h2>
        <p className="text-xs text-slate-400 mb-4">
          {totalApplications} candidaturas no total
        </p>
        {appPieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={appPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {appPieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
            Nenhuma candidatura encontrada
          </div>
        )}
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {appPieData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name} ({d.value})
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Pipeline — Distribuição</h2>
        <p className="text-xs text-slate-400 mb-4">Candidatos por fase</p>
        {pipelineChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pipelineChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} candidato(s)`]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                {pipelineChartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
            Nenhum dado disponível
          </div>
        )}
      </div>
    </div>
  );
}
