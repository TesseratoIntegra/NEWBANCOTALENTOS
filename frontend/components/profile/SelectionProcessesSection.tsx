'use client';

import { CandidateInProcess } from '@/types';
import selectionProcessService from '@/services/selectionProcessService';
import { CheckCircle } from 'lucide-react';

interface SelectionProcessesSectionProps {
  processes: CandidateInProcess[];
}

export default function SelectionProcessesSection({ processes }: SelectionProcessesSectionProps) {
  if (processes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Você não está em nenhum processo seletivo no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {processes.map((cp) => {
        const statusInfo = selectionProcessService.getCandidateStatusLabelLight(cp.status);
        const stages = cp.stages_info || [];

        return (
          <div
            key={cp.id}
            className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-800 truncate">
                {cp.process_title || `Processo #${cp.process}`}
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3 ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>

            {stages.length > 0 && (
              <div className="flex items-center gap-1">
                {stages.map((stage, idx) => (
                  <div key={stage.id} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-full h-2 rounded-full ${
                        stage.status === 'completed'
                          ? 'bg-green-500'
                          : stage.status === 'current'
                          ? 'bg-indigo-500'
                          : 'bg-slate-200'
                      }`} />
                      <span className={`text-[10px] mt-1 truncate max-w-full px-0.5 text-center ${
                        stage.status === 'completed'
                          ? 'text-green-600 font-medium'
                          : stage.status === 'current'
                          ? 'text-indigo-600 font-semibold'
                          : 'text-slate-400'
                      }`}>
                        {stage.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
                        {stage.name}
                      </span>
                    </div>
                    {idx < stages.length - 1 && (
                      <div className={`w-1 h-2 flex-shrink-0 ${
                        stage.status === 'completed' ? 'bg-green-300' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
