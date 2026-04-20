import { callOpenRouter } from './openrouter';

const DEFAULT_SECTIONS = {
    sections: [
        {
            name: 'Objetivos',
            questions: [
                { text: 'Qual o seu principal objetivo com o treinamento?', type: 'MULTIPLE_CHOICE', required: true },
                { text: 'Você tem uma meta de peso ou tempo específico?', type: 'TEXT', required: false }
            ]
        },
        {
            name: 'Saúde',
            questions: [
                { text: 'Possui alguma lesão articular?', type: 'BOOLEAN', required: true },
                { text: 'Se sim, qual?', type: 'TEXT', required: false },
                { text: 'Tem algum problema cardíaco?', type: 'BOOLEAN', required: true },
                { text: 'Toma algum medicamento de uso contínuo?', type: 'BOOLEAN', required: true }
            ]
        },
        {
            name: 'Experiência',
            questions: [
                { text: 'Já treinou musculação antes?', type: 'BOOLEAN', required: true },
                { text: 'Quantos dias por semana pode treinar?', type: 'NUMBER', required: true },
                { text: 'Pratica algum esporte?', type: 'BOOLEAN', required: true }
            ]
        }
    ]
};

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

    // Contingência: análise básica baseada em palavras-chave
    const warnings: string[] = [];
    const insights: string[] = [];
    const suggestions: string[] = [];

    for (const a of answers) {
        const q = a.question.toLowerCase();
        const r = String(a.answer).toLowerCase();
        
        if (q.includes('lesão') && r === 'true') {
            warnings.push('Atenção: Mentionou lesão. Avaliar exercícios de impacto.');
            suggestions.push('Considerar avaliação física detalhada antes de iniciar.');
        }
        if (q.includes('coração') && r === 'true') {
            warnings.push('Atenção: Problema cardíaco reportado. Supervisão médica recomendada.');
        }
        if (q.includes('medicamento') && r === 'true') {
            insights.push('Usuário faz uso de medicamento contínuo.');
        }
        if (q.includes('treinou') && r === 'false') {
            insights.push('Iniciante - atenção especial à técnica.');
            suggestions.push('Começar com cargas leves e foco na execução.');
        }
    }

    if (warnings.length === 0) {
        insights.push('Nenhum alerta crítico identificado.');
    }

    return { insights, warnings, suggestions };
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

    // Contingência: lógica básica baseada em palavras-chave
    const answerStr = answers.map(a => String(a.answer).toLowerCase()).join(' ');
    
    if (answerStr.includes('emagrec') || answerStr.includes('perder peso') || answerStr.includes('definir')) {
        return { suggested: 'EMAGRECIMENTO', reason: 'Baseado nas respostas sobre perda de peso.' };
    }
    if (answerStr.includes('hipertrof') || answerStr.includes('muscular') || answerStr.includes('volume')) {
        return { suggested: 'HIPERTROFIA', reason: 'Baseado no objetivo de ganho de massa.' };
    }
    if (answerStr.includes('condicio') || answerStr.includes('resistência') || answerStr.includes('cardio')) {
        return { suggested: 'CONDICIONAMENTO', reason: 'Baseado no foco em resistência.' };
    }
    
    return { suggested: 'HIPERTROFIA', reason: 'Objetivo mais comum - padrão.' };
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
            const result = JSON.parse(jsonMatch[0]);
            if (result.sections?.length > 0) {
                return result;
            }
        }
    } catch (e) {
        console.error('Failed to generate questions:', e);
    }

    // Contingência: retorna template padrão
    return DEFAULT_SECTIONS;
}