'use client';

import { useState, useEffect } from 'react';
import { InsightStatus, InsightType } from '@prisma/client';
import { Bell, Filter, ChevronRight, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Insight {
  id: string;
  type: InsightType;
  status: InsightStatus;
  title: string;
  summary: string;
  suggestion?: string;
  score?: number;
  createdAt: string;
  studentName: string;
  workoutSession?: {
    id: string;
    workoutId: string;
    completedPercentage: number;
  };
}

const statusConfig = {
  GREEN: { label: 'Tudo certo', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  YELLOW: { label: 'Atenção', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertTriangle },
  RED: { label: 'Ação necessária', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle }
};

const typeLabels: Record<InsightType, string> = {
  WORKOUT_COMPLETED: 'Treino concluído',
  WORKOUT_INCOMPLETE: 'Treino incompleto',
  EXERCISE_SKIPPED: 'Exercício pulado',
  EXERCISE_SKIPPED_RECURRENTLY: 'Exercício pulado recorrente',
  EXERCISE_REPS_FAILED: 'Falha em repetições',
  EXERCISE_LOAD_INCREASED: 'Carga aumentada',
  EXERCISE_LOAD_DECREASED: 'Carga reduzida',
  STUDENT_LOW_ADHERENCE: 'Baixa aderência',
  STUDENT_PERFORMANCE_DROP: 'Queda de desempenho',
  STUDENT_NEEDS_ATTENTION: 'Atenção needed',
  STUDENT_PROGRESS_DETECTED: 'Evolução detectada'
};

export default function AlertsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    setLoading(true);
    try {
      const res = await fetch('/api/insights');
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    if (filter === 'green') return insight.status === 'GREEN';
    if (filter === 'yellow') return insight.status === 'YELLOW';
    if (filter === 'red') return insight.status === 'RED';
    if (filter === 'completed') return insight.type === 'WORKOUT_COMPLETED';
    if (filter === 'incomplete') return insight.type === 'WORKOUT_INCOMPLETE';
    if (filter === 'skipped') return insight.type === 'EXERCISE_SKIPPED' || insight.type === 'EXERCISE_SKIPPED_RECURRENTLY';
    if (filter === 'load_increased') return insight.type === 'EXERCISE_LOAD_INCREASED';
    if (filter === 'load_decreased') return insight.type === 'EXERCISE_LOAD_DECREASED';
    if (filter === 'low_adherence') return insight.type === 'STUDENT_LOW_ADHERENCE';
    return true;
  });

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'green', label: 'Tudo certo' },
    { id: 'yellow', label: 'Atenção' },
    { id: 'red', label: 'Ação necessária' },
    { id: 'completed', label: 'Treinos concluídos' },
    { id: 'incomplete', label: 'Treinos incompletos' },
    { id: 'skipped', label: 'Exercícios pulados' },
    { id: 'load_increased', label: 'Carga evoluiu' },
    { id: 'load_decreased', label: 'Carga regrediu' },
    { id: 'low_adherence', label: 'Baixa aderência' }
  ];

  const stats = {
    total: insights.length,
    green: insights.filter(i => i.status === 'GREEN').length,
    yellow: insights.filter(i => i.status === 'YELLOW').length,
    red: insights.filter(i => i.status === 'RED').length
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="pt-8 pb-6 px-4 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-2xl bg-gradient-brand flex items-center justify-center">
            <Bell size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black text-white">Alertas Inteligentes</h1>
            <p className="text-muted-foreground">Análise de IA dos treinos das suas alunas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-glass rounded-2xl p-4 border border-white/5">
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total de alertas</div>
          </div>
          <div className="bg-glass rounded-2xl p-4 border border-green-500/20">
            <div className="text-2xl font-black text-green-400">{stats.green}</div>
            <div className="text-sm text-muted-foreground">Tudo certo</div>
          </div>
          <div className="bg-glass rounded-2xl p-4 border border-yellow-500/20">
            <div className="text-2xl font-black text-yellow-400">{stats.yellow}</div>
            <div className="text-sm text-muted-foreground">Atenção</div>
          </div>
          <div className="bg-glass rounded-2xl p-4 border border-red-500/20">
            <div className="text-2xl font-black text-red-400">{stats.red}</div>
            <div className="text-sm text-muted-foreground">Ação necessária</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={18} className="text-muted-foreground shrink-0" />
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.id 
                  ? 'bg-gradient-brand text-white' 
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum alerta encontrado</h3>
            <p className="text-muted-foreground">Os alertas serão gerados automaticamente conforme as alunas realizam os treinos.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInsights.map(insight => {
              const StatusIcon = statusConfig[insight.status].icon;
              return (
                <div
                  key={insight.id}
                  className="bg-glass rounded-[2rem] p-6 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => setSelectedInsight(insight)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[insight.status].color}`}>
                          <StatusIcon size={12} className="inline mr-1" />
                          {statusConfig[insight.status].label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[insight.type]}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-black text-white mb-2">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{insight.summary}</p>
                      {insight.suggestion && (
                        <p className="text-sm text-primary-light">💡 {insight.suggestion}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white mb-1">{insight.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(insight.createdAt).toLocaleDateString('pt-BR', { 
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      {insight.score !== null && insight.score !== undefined && (
                        <div className="mt-2 text-xs font-bold text-muted-foreground">
                          Score: {insight.score}/10
                        </div>
                      )}
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedInsight && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedInsight(null)}>
          <div className="bg-[#1a1a1a] rounded-[2rem] p-8 max-w-lg w-full border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-black text-white">Detalhes do Alerta</h2>
              <button onClick={() => setSelectedInsight(null)} className="text-muted-foreground hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Aluna</label>
                <p className="text-white font-medium">{selectedInsight.studentName}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${statusConfig[selectedInsight.status].color}`}>
                  {statusConfig[selectedInsight.status].label}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Tipo</label>
                <p className="text-white">{typeLabels[selectedInsight.type]}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Título</label>
                <p className="text-white">{selectedInsight.title}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Resumo</label>
                <p className="text-muted-foreground">{selectedInsight.summary}</p>
              </div>

              {selectedInsight.suggestion && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Sugestão da IA</label>
                  <p className="text-primary-light">{selectedInsight.suggestion}</p>
                </div>
              )}

              {selectedInsight.score !== null && selectedInsight.score !== undefined && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Score de Performance</label>
                  <p className="text-white font-bold text-2xl">{selectedInsight.score}/10</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <button className="w-full py-3 rounded-xl bg-gradient-brand text-white font-bold hover:opacity-90 transition-opacity">
                  Notificar Treinador (N8N)
                </button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  webhook N8N ainda não configurado. O alerta foi salvo para envio futuro.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}