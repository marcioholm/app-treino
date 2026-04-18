import { PrismaClient } from '@prisma/client';

export async function createDefaultAnamnesisTemplate(prisma: PrismaClient | any, tenantId: string) {
    const template = await prisma.anamnesisTemplate.create({
        data: {
            tenantId,
            name: 'Anamnese Padrão',
            isDefault: true,
            sections: {
                create: [
                    {
                        name: 'Objetivos',
                        order: 1,
                        questions: {
                            create: [
                                { text: 'Qual o seu principal objetivo com o treinamento?', type: 'MULTIPLE_CHOICE', options: ['Emagrecimento', 'Hipertrofia', 'Condicionamento Físico', 'Saúde e Bem-estar'], order: 1, required: true },
                                { text: 'Você tem uma meta de peso ou tempo específico para este objetivo?', type: 'TEXT', order: 2, required: false }
                            ]
                        }
                    },
                    {
                        name: 'Saúde',
                        order: 2,
                        questions: {
                            create: [
                                { text: 'Possui alguma lesão articular (joelho, ombro, coluna etc)?', type: 'BOOLEAN', order: 1, required: true },
                                { text: 'Se sim, descreva a lesão e as recomendações médicas.', type: 'TEXT', order: 2, required: false },
                                { text: 'Tem algum problema cardíaco ou pressão alta?', type: 'BOOLEAN', order: 3, required: true },
                                { text: 'Toma algum medicamento de uso contínuo?', type: 'BOOLEAN', order: 4, required: true },
                                { text: 'Sente tonturas ou dores no peito durante exercícios?', type: 'BOOLEAN', order: 5, required: true },
                                { text: 'Fez alguma cirurgia recente?', type: 'BOOLEAN', order: 6, required: true },
                                { text: 'Existe alguma outra condição médica que eu deva saber?', type: 'TEXT', order: 7, required: false }
                            ]
                        }
                    },
                    {
                        name: 'Nutrição',
                        order: 3,
                        questions: {
                            create: [
                                { text: 'Faz acompanhamento com nutricionista?', type: 'BOOLEAN', order: 1, required: true },
                                { text: 'Como você avalia sua alimentação atual (1 a 5)?', type: 'NUMBER', order: 2, required: true }
                            ]
                        }
                    },
                    {
                        name: 'Experiência com Exercícios',
                        order: 4,
                        questions: {
                            create: [
                                { text: 'Já treinou musculação antes?', type: 'BOOLEAN', order: 1, required: true },
                                { text: 'Há quanto tempo treina ininterruptamente?', type: 'TEXT', order: 2, required: false },
                                { text: 'Como avalia sua técnica nos exercícios básicos (1 a 5)?', type: 'NUMBER', order: 3, required: true },
                                { text: 'Quais exercícios você mais gosta?', type: 'TEXT', order: 4, required: false },
                                { text: 'Quais exercícios você odeia ou não se sente confortável?', type: 'TEXT', order: 5, required: false },
                                { text: 'Já teve acompanhamento de um personal trainer antes?', type: 'BOOLEAN', order: 6, required: true },
                                { text: 'Pratica algum outro esporte?', type: 'BOOLEAN', order: 7, required: true },
                                { text: 'Atualmente é fumante?', type: 'BOOLEAN', order: 8, required: true },
                                { text: 'Frequência de consumo de álcool na semana?', type: 'NUMBER', order: 9, required: true }
                            ]
                        }
                    },
                    {
                        name: 'Disponibilidade e Preferências',
                        order: 5,
                        questions: {
                            create: [
                                { text: 'Quantos dias por semana pode treinar fixamente?', type: 'NUMBER', order: 1, required: true },
                                { text: 'Você se entedia facilmente fazendo a mesma rotina?', type: 'BOOLEAN', order: 2, required: true },
                                { text: 'Prefere maior foco em variedade ou em repetição da mesma estrutura para progredir carga?', type: 'MULTIPLE_CHOICE', options: ['Prefiro variar exercícios sempre', 'Prefiro manter os exercícios para ficar forte', 'Tanto faz, quero o que da resultado rápido'], order: 3, required: true }
                            ]
                        }
                    }
                ]
            }
        },
        include: { sections: { include: { questions: true } } }
    });

    return template;
}
