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
    // Forçamos o gpt-4o-mini para garantir qualidade, ignorando variáveis de ambiente instáveis
    const MODEL = 'openai/gpt-4o-mini';

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
    gender?: string;
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

PRINCÍPIOS CIENTÍFICOS (METODOLOGIA PROFISSIONAL) - REGRAS INEGOCIÁVEIS:
1. GÊNERO: Se 'FEMININO', o treino deve ser 70% focado em Glúteos/Pernas. Se 'MASCULINO', foco em Superiores.
2. VOLUME OBRIGATÓRIO: Cada sessão DEVE conter EXATAMENTE 8 exercícios. Nem mais, nem menos.
3. VARIEDADE TOTAL: É PROIBIDO repetir o mesmo exercício em sessões diferentes. Cada sessão (A, B, C) deve ter exercícios ÚNICOS.
4. SELEÇÃO DA LISTA: Você deve escolher exercícios APENAS da 'LISTA DE EXERCÍCIOS DISPONÍVEIS' abaixo. Nunca invente nomes.
5. ESTRUTURA 3 DIAS (FEMININO):
   - SESSÃO A: Quadríceps e Glúteo Máximo (Mínimo 6 de perna + 2 core).
   - SESSÃO B: Membros Superiores (Costas, Ombro, Bíceps) + Cardio.
   - SESSÃO C: Posterior de Coxa e Glúteo Médio (Mínimo 6 de perna + 2 core).
6. SEPARAÇÃO: Nunca misture treino de peito/tríceps em sessões focadas em glúteo para o público feminino M&K.
7. PENALIDADE: Se o resultado contiver menos de 8 exercícios ou exercícios repetidos, ele será invalidado. Seja rigoroso.
`.trim();

    const userPrompt = `
Gere um treino personalizado para o aluno(a) ${context.studentName}.
 
 DADOS DO ALUNO:
 - Gênero: ${context.gender || 'Não informado'}
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