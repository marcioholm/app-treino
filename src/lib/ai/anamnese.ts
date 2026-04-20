import { callOpenRouter } from './openrouter';

export async function analyzeAnamneseAnswers(answers: {
    question: string;
    answer: string | boolean | string[];
}[], studentName: string): Promise<{
    insights: string[];
    warnings: string[];
    suggestions: string[];
}> {
    const answersText = answers
        .map(a => `- ${a.question}: ${Array.isArray(a.answer) ? a.answer.join(', ') : a.answer}`)
        .join('\n');

    const prompt = `
Analise as respostas da anamnese de ${studentName} e forneça:

Respostas:
${answersText}

Retorne em formato JSON válido (sem markdown):
{
  "insights": ["insight 1", "insight 2"],
  "warnings": ["atenção se houver"],
  "suggestions": ["sugestão 1", "sugestão 2"]
}

Se não houver warnings, retorne array vazio.
`.trim();

    try {
        const response = await callOpenRouter(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to analyze anamnese:', e);
    }

    return { insights: [], warnings: [], suggestions: [] };
}

export async function suggestObjective(answers: {
    question: string;
    answer: string | boolean | string[];
}[]): Promise<{
    suggested: string;
    reason: string;
}> {
    const answersText = answers
        .map(a => `- ${a.question}: ${Array.isArray(a.answer) ? a.answer.join(', ') : a.answer}`)
        .join('\n');

    const prompt = `
Com base nas respostas da anamnese abaixo, sugira o melhor objetivo de treino e explique o motivo:

${answersText}

Retorne em formato JSON válido:
{
  "suggested": "HIPERTROFIA" ou "EMAGRECIMENTO" ou "CONDICIONAMENTO" ou "DEFINICAO",
  "reason": "explicação curta em português"
}
`.trim();

    try {
        const response = await callOpenRouter(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to suggest objective:', e);
    }

    return { suggested: 'HIPERTROFIA', reason: 'Objetivo padrão' };
}

export async function generateAnamneseQuestions(goal: string, level: string): Promise<{
    sections: { name: string; questions: { text: string; type: string; required: boolean }[] }[]
}> {
    const prompt = `
Gere um formulário de anamnese para uma aluna com objetivo de ${goal} e nível ${level}.

Retorne em formato JSON válido:
{
  "sections": [
    {
      "name": "Nome da seção",
      "questions": [
        { "text": "texto da pergunta", "type": "TEXT|NUMBER|BOOLEAN|MULTIPLE_CHOICE", "required": true|false }
      ]
    }
  ]
}

Inclua seções sobre: Saúde, Experiência com exercícios, Objetivos específicos do ${goal}, Disponibilidade.
`.trim();

    try {
        const response = await callOpenRouter(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to generate questions:', e);
    }

    return { sections: [] };
}