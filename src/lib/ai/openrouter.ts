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
    anamnesisContext?: string;
}): Promise<{
    name: string;
    sessions: { name: string; exercises: { name: string; sets: number; reps: string; restTime: number }[] }[];
}> {
    const exercisesList = context.exercises.join(', ');
    
    const systemPrompt = `
Você é um personal trainer especialista em treinamento de força e hipertrofia para mulheres, com base em evidências científicas atualizadas.

PRINCÍPIOS CIENTÍFICOS PARA MULHERES (METODOLOGIA M&K):
- PRIORIDADE MÁXIMA: Membros inferiores e Glúteos. O volume de treino para glúteos e pernas deve ser O DOBRO do volume de membros superiores.
- DIVISÃO DE TREINO: Mesmo em divisões como Push/Pull, garanta que existam exercícios de membros inferiores em todas as sessões se o objetivo for focado em pernas.
- Ênfase em Glúteo Máximo e Médio, Quadríceps e Posteriores.
- Membros superiores devem ser incluídos de forma equilibrada, sem excesso de volume para peitorais.
- Preferir exercícios que favoreçam a biomecânica feminina.
- Se a aluna expressar preferência por uma área (ex: Pernas), 70% do treino deve ser focado nessa área.
- Descanso: Mulheres recuperam mais rápido, manter entre 45-90 segundos.
`.trim();

    const userPrompt = `
Gere um treino personalizado para a aluna ${context.studentName}.

DADOS DA ALUNA:
- Peso: ${context.weight || 'Não informado'} kg
- % Gordura: ${context.fatPercent || 'Não informado'}%
- Objetivo Principal: ${context.goal}
- Nível de Condicionamento: ${context.level}
- Frequência: ${context.daysPerWeek} dias por semana
- Restrições Iniciais: ${context.restrictions?.join(', ') || 'Nenhuma'}

RESPOSTAS DETALHADAS DA ANAMNESE (ANALISE COM CUIDADO):
${context.anamnesisContext || 'Nenhum dado adicional informado.'}

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