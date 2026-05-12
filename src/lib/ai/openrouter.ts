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
    evolutionContext?: string; // New context field
    feedbackContext?: string;  // New context field
}): Promise<{
    name: string;
    sessions: { 
        name: string; 
        exercises: { 
            name: string; 
            sets: number; 
            reps: string; 
            restTime: number;
            rir?: string;
            cadence?: string;
            progression?: string;
            technicalNotes?: string;
        }[] 
    }[];
}> {
    const exercisesCatalog = context.exercises.map(ex => 
        `- ${ex.name} (${ex.group} | ${ex.modality}${ex.equipment ? ` | ${ex.equipment}` : ''})`
    ).join('\n');
    
    const systemPrompt = `
Você é uma IA especialista em prescrição de treinamento resistido feminino baseada em evidências científicas atualizadas sobre hipertrofia, emagrecimento, recomposição corporal, força e saúde metabólica da M&K Fitness Center.

Sua função é criar treinos 100% individualizados com base na avaliação física, anamnese e evolução da aluna.

REGRAS CIENTÍFICAS OBRIGATÓRIAS:
1. Baseie as decisões em: Sobrecarga progressiva, Volume semanal ideal, Intensidade relativa (RIR/RPE), Periodização ondulatória/linear e Recuperação muscular.
2. NUNCA gere treinos genéricos. Cada plano deve ter identidade única.
3. SELEÇÃO DE EXERCÍCIOS: Use APENAS os nomes contidos no "CATÁLOGO DE EXERCÍCIOS" abaixo.
4. FOCO FEMININO: Priorize biomecânica de glúteos e quadríceps (70% do volume), mantendo superiores elegantes e funcionais.
5. LÓGICA DE DECISÃO:
   - Se Iniciante: Técnica e adaptação.
   - Se Avançada: Periodização estratégica.
   - Se Fadiga Alta: Aplicar Deload.
   - Se Estagnação: Alterar estímulo.

PROIBIDO REPETIR TREINOS IGUAIS ENTRE ALUNAS.
`.trim();

    const userPrompt = `
DADOS DA ALUNA:
- Nome: ${context.studentName}
- Gênero: ${context.gender || 'FEMININO'}
- Objetivo: ${context.goal}
- Nível: ${context.level}
- Frequência: ${context.daysPerWeek}x na semana

AVALIAÇÃO E ANAMNESE:
${context.anamnesisContext || 'Nenhum dado adicional.'}

EVOLUÇÃO E PERFORMANCE RECENTE:
${context.evolutionContext || 'Primeiro treino ou sem dados recentes.'}

FEEDBACK E ADESÃO:
${context.feedbackContext || 'Sem feedback recente.'}

CATÁLOGO DE EXERCÍCIOS DISPONÍVEIS (USE APENAS ESTES):
${exercisesCatalog}

ESTRUTURA DE SAÍDA OBRIGATÓRIA (JSON PURO):
{
  "name": "Protocolo Premium: [Objetivo] - [Aluna]",
  "sessions": [
    {
      "name": "Sessão [A/B/C] - [Foco Muscular]",
      "exercises": [
        { 
          "name": "NOME EXATO DO CATÁLOGO", 
          "sets": 4, 
          "reps": "10-12", 
          "restTime": 60,
          "rir": "2",
          "cadence": "2-0-2",
          "progression": "+2-5% carga se concluir reps",
          "technicalNotes": "Ex: Pico de contração de 2s"
        }
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