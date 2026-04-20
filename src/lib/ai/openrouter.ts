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
    restrictions?: string[];
}): Promise<{
    name: string;
    sessions: { name: string; exercises: { name: string; sets: number; reps: string }[] }[];
}> {
    const exercisesList = context.exercises.slice(0, 20).join(', ');
    
    const prompt = `
Gere um treino de musculação para uma aluna chamada ${context.studentName}.

Objetivo: ${context.goal}
Nível: ${context.level}
Dias por semana: ${context.daysPerWeek}
Restrições: ${context.restrictions?.join(', ') || 'nenhuma'}

Exercícios disponíveis:
${exercisesList}

Retorne em formato JSON válido (sem markdown):
{
  "name": "Nome do Treino",
  "sessions": [
    {
      "name": "Nome da sessão",
      "exercises": [
        { "name": "Nome do exercício", "sets": 3, "reps": "8-12" }
      ]
    }
  ]
}
`.trim();

    const response = await callOpenRouter(prompt);
    
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