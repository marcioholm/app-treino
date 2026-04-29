interface OpenRouterMessage {
    role: 'system' | 'user';
    content: string;
}

interface OpenRouterOptions {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
}

export async function callOpenRouter(prompt: string, options?: Partial<OpenRouterOptions>): Promise<string> {
    const API_KEY = process.env.OPENROUTER_API_KEY;
    const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-2024-11-20';

    if (!API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured');
    }

    const url = BASE_URL + '/chat/completions';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://traineros.vercel.app',
            'X-Title': 'TrainerOS',
        },
        body: JSON.stringify({
            model: options?.model || MODEL,
            messages: [
                { role: 'system', content: 'Você é um assistente útil de fitness. Responda em português brasileiro.' },
                { role: 'user', content: prompt }
            ],
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.max_tokens ?? 2048,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

export async function generateWorkoutWithAI(context: {
    studentName: string;
    goal: string;
    level: string;
    daysPerWeek: number;
    exercises: string[];
    weight?: number;
    fatPercent?: number;
    restrictions?: string[];
}): Promise<{
    name: string;
    sessions: { name: string; exercises: { name: string; sets: number; reps: string; restTime: number }[] }[];
}> {
    const exercisesList = context.exercises.join(', ');
    
    const systemPrompt = `
Você é um personal trainer especialista em treinamento de força e hipertrofia para mulheres, com base em evidências científicas atualizadas.

PRINCÍPIOS CIENTÍFICOS PARA MULHERES:
- Mulheres respondem bem a volumes moderados-altos (12-20 séries/semana por grupo muscular)
- Maior tolerância ao volume e menor necessidade de descanso que homens (geralmente 45-90 segundos)
- Ênfase em membros inferiores e glúteos (objetivo mais comum)
- Incluir variações unilaterais para correção de assimetrias
- Progressão de carga deve ser gradual e consistente
- Exercícios multiarticulares como base, isolados como complemento
- Considerar fase do ciclo menstrual se informada (fase folicular: maior força; fase lútea: priorizar técnica)

AO MONTAR O TREINO:
- Use OBRIGATORIAMENTE os dados da avaliação física fornecidos.
- Adapte o volume e intensidade ao nível:
  - Iniciante: 3x/semana, foco em técnica e base.
  - Intermediário: 4x/semana, divisões como Upper/Lower ou Push/Pull/Legs.
  - Avançado: 5-6x/semana, maior volume e intensidade.
- Estratégias por objetivo:
  - "Emagrecimento": Priorizar compostos, circuitos, menor descanso (45s).
  - "Hipertrofia/Definição": Foco em mecânica, tempo sob tensão, descanso moderado (60-90s).
  - "Condicionamento": Mix de força e cardio funcional.
- NUNCA gere treino sem considerar as restrições e dados de peso/objetivo.
- Selecione exercícios APENAS da lista de exercícios disponíveis fornecida.
`.trim();

    const userPrompt = `
Gere um treino personalizado para a aluna ${context.studentName}.

DADOS DA ALUNA:
- Peso: ${context.weight || 'Não informado'} kg
- % Gordura: ${context.fatPercent || 'Não informado'}%
- Objetivo Principal: ${context.goal}
- Nível de Condicionamento: ${context.level}
- Frequência: ${context.daysPerWeek} dias por semana
- Restrições: ${context.restrictions?.join(', ') || 'Nenhuma'}

LISTA DE EXERCÍCIOS DISPONÍVEIS:
${exercisesList}

INSTRUÇÕES DE SAÍDA:
Retorne OBRIGATORIAMENTE em formato JSON puro, sem blocos de código markdown, seguindo esta estrutura:
{
  "name": "Nome do Treino (Ex: Protocolo Hipertrofia Feminina)",
  "sessions": [
    {
      "name": "Nome da Sessão (Ex: Inferiores A)",
      "exercises": [
        { "name": "Nome Exato do Exercício da Lista", "sets": 4, "reps": "10-12", "restTime": 60 }
      ]
    }
  ]
}
`.trim();

    const response = await callOpenRouter(userPrompt, {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]
    });
    
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid JSON response');
    } catch (e) {
        console.error('Failed to parse AI response:', e);
        throw new Error('Resposta inválida da IA');
    }
}