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
            messages: options?.messages || [
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
    exercises: { name: string; group: string; modality: string; equipment?: string }[];
    weight?: number;
    fatPercent?: number;
    restrictions?: string[];
    anamnesisContext?: string;
}): Promise<{
    name: string;
    sessions: { name: string; exercises: { name: string; sets: number; reps: string; restTime: number }[] }[];
}> {
    const exercisesCatalog = context.exercises.map(ex => 
        `- ${ex.name} (${ex.group} | ${ex.modality}${ex.equipment ? ` | ${ex.equipment}` : ''})`
    ).join('\n');
    
    const systemPrompt = `
Você é um Personal Trainer Especialista da Academia M&K Fitness Center, focado em alta performance feminina e biomecânica.

DIRETRIZES DE OURO:
1. SELEÇÃO DE EXERCÍCIOS: Use APENAS os nomes contidos no "CATÁLOGO DE EXERCÍCIOS" abaixo. É PROIBIDO inventar exercícios ou usar nomes diferentes dos fornecidos.
2. FOCO FEMININO (ESTRATÉGICO):
   - Priorize Inferiores (Glúteos, Quadríceps, Posterior) em 70% do volume total.
   - Treinos de Superiores devem ser elegantes e funcionais, sem volume excessivo de ombros/braços a menos que solicitado.
3. PERSONALIZAÇÃO (ANAMNESE): Leia atentamente a anamnese. Se ela odeia um exercício ou equipamento, NÃO o use. Se ela ama, coloque no treino.
4. ESTRUTURA: Gere EXATAMENTE 8 exercícios por sessão. Use sessões A, B, C (ou mais conforme os dias da semana).
5. VARIEDADE: Garanta que cada sessão tenha exercícios únicos. Não repita exercícios em dias diferentes.
`.trim();

    const userPrompt = `
Gere o Protocolo de Treinamento para: ${context.studentName}

CONTEXTO BIOMÉTRICO:
- Gênero: ${context.gender || 'FEMININO'}
- Nível: ${context.level}
- Objetivo: ${context.goal}
- Frequência: ${context.daysPerWeek}x na semana

CONTEXTO DA ANAMNESE (LEITURA OBRIGATÓRIA):
${context.anamnesisContext || 'Nenhum dado adicional.'}

CATÁLOGO DE EXERCÍCIOS DISPONÍVEIS (ESCOLHA APENAS DESTA LISTA):
${exercisesCatalog}

INSTRUÇÕES DE SAÍDA:
Retorne APENAS um JSON puro (sem explicações) seguindo este formato:
{
  "name": "Protocolo M&K: [Nome da Aluna] - [Objetivo]",
  "sessions": [
    {
      "name": "Sessão [A/B/C] - [Foco Muscular]",
      "exercises": [
        { "name": "NOME EXATO DO CATÁLOGO", "sets": 4, "reps": "10-12", "restTime": 60 }
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