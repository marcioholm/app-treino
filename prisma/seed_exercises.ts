import { PrismaClient, Modality, ExerciseType } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // MEMBROS INFERIORES - AGACHAMENTOS
  { name: 'Agachamento Livre com Barra', group: 'Pernas', subgroup: 'Agachamentos', level: 'intermediário', description: 'Mantenha a coluna ereta e desça até as coxas ficarem paralelas ao chão.', defaultSets: 4, defaultReps: '8-12', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre', tags: ['composto', 'quadríceps', 'glúteos'] },
  { name: 'Agachamento Sumô com Halter', group: 'Pernas', subgroup: 'Agachamentos', level: 'iniciante', description: 'Pés afastados além da largura dos ombros, pontas para fora. Foco em adutores e glúteos.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['adutores', 'glúteos'] },
  { name: 'Agachamento Búlgaro', group: 'Pernas', subgroup: 'Agachamentos', level: 'avançado', description: 'Um pé elevado atrás no banco. Desça o quadril verticalmente.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['unilateral', 'glúteos', 'estabilidade'] },
  { name: 'Agachamento Hack', group: 'Pernas', subgroup: 'Agachamentos', level: 'intermediário', description: 'Agachamento controlado na máquina hack.', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['quadríceps'] },
  { name: 'Goblet Squat', group: 'Pernas', subgroup: 'Agachamentos', level: 'iniciante', description: 'Segure um halter ou kettlebell junto ao peito.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['iniciante', 'quadríceps'] },
  
  // LEG PRESS
  { name: 'Leg Press 45°', group: 'Pernas', subgroup: 'Leg Press', level: 'intermediário', description: 'Empurre a plataforma mantendo os calcanhares apoiados.', defaultSets: 4, defaultReps: '10-12', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['quadríceps', 'glúteos'] },
  { name: 'Leg Press Horizontal', group: 'Pernas', subgroup: 'Leg Press', level: 'iniciante', description: 'Versão mais estável do leg press.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['iniciante', 'quadríceps'] },
  { name: 'Leg Press Unilateral', group: 'Pernas', subgroup: 'Leg Press', level: 'avançado', description: 'Foco em correção de assimetrias.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['unilateral', 'correção'] },

  // EXTENSORA / FLEXORA
  { name: 'Cadeira Extensora', group: 'Pernas', subgroup: 'Isolados', level: 'iniciante', description: 'Extensão total de joelhos para isolar o quadríceps.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['isolado', 'quadríceps'] },
  { name: 'Cadeira Flexora', group: 'Pernas', subgroup: 'Isolados', level: 'iniciante', description: 'Foco em posteriores de coxa sentada.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['isolado', 'posteriores'] },
  { name: 'Mesa Flexora', group: 'Pernas', subgroup: 'Isolados', level: 'intermediário', description: 'Posteriores de coxa deitada.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['isolado', 'posteriores'] },

  // PASSADA / AVANÇO
  { name: 'Passada com Halteres', group: 'Pernas', subgroup: 'Passadas', level: 'intermediário', description: 'Caminhe dando passos largos, descendo o joelho de trás.', defaultSets: 3, defaultReps: '20 passos', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['dinâmico', 'glúteos', 'pernas'] },
  { name: 'Avanço no Step', group: 'Pernas', subgroup: 'Passadas', level: 'intermediário', description: 'Aumenta a amplitude do movimento.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['glúteos', 'amplitude'] },
  { name: 'Afundo Unilateral', group: 'Pernas', subgroup: 'Passadas', level: 'iniciante', description: 'Estático, subindo e descendo no mesmo lugar.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['unilateral', 'estabilidade'] },
  { name: 'Passada Lateral', group: 'Pernas', subgroup: 'Passadas', level: 'iniciante', description: 'Foco em glúteo médio e adutores.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['glúteo médio', 'adutores'] },

  // POSTERIORES E TERRA
  { name: 'Stiff com Barra', group: 'Pernas', subgroup: 'Posteriores', level: 'intermediário', description: 'Mantenha pernas quase retas e coluna neutra.', defaultSets: 4, defaultReps: '10-12', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre', tags: ['posteriores', 'lombar'] },
  { name: 'Terra Romeno (RDL)', group: 'Pernas', subgroup: 'Posteriores', level: 'intermediário', description: 'Foco total em glúteos e posteriores.', defaultSets: 4, defaultReps: '8-10', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['glúteos', 'posteriores'] },
  { name: 'Levantamento Terra Sumô', group: 'Pernas', subgroup: 'Posteriores', level: 'avançado', description: 'Base aberta, mãos por dentro das pernas.', defaultSets: 4, defaultReps: '6-8', defaultRest: 120, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre', tags: ['força', 'glúteos', 'composto'] },

  // ABDUÇÃO E GLÚTEOS ESPECÍFICOS
  { name: 'Elevação Pélvica com Barra', group: 'Pernas', subgroup: 'Glúteos', level: 'intermediário', description: 'Melhor exercício para isolamento de glúteo máximo.', defaultSets: 4, defaultReps: '10-12', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre', tags: ['glúteo máximo', 'força'] },
  { name: 'Hip Thrust Unilateral', group: 'Pernas', subgroup: 'Glúteos', level: 'avançado', description: 'Desafio extra de estabilidade.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['unilateral', 'glúteos'] },
  { name: 'Cadeira Abdutora', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', description: 'Abdução de quadril na máquina.', defaultSets: 3, defaultReps: '15-20', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['isolado', 'glúteo médio'] },
  { name: 'Cadeira Adutora', group: 'Pernas', subgroup: 'Isolados', level: 'iniciante', description: 'Fechamento de pernas na máquina.', defaultSets: 3, defaultReps: '15-20', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['isolado', 'adutores'] },
  { name: 'Abdução de Quadril no Cabo', group: 'Pernas', subgroup: 'Glúteos', level: 'intermediário', description: 'Polia baixa, chute lateral.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['glúteo médio', 'cabo'] },
  { name: 'Coice no Cabo (Crossover)', group: 'Pernas', subgroup: 'Glúteos', level: 'intermediário', description: 'Extensão de quadril na polia.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['glúteo máximo'] },
  { name: 'Extensão de Quadril 4 Apoios', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', description: 'Exercício clássico no solo.', defaultSets: 3, defaultReps: '15-20', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['iniciante', 'glúteo máximo'] },
  { name: 'Clamshell (Ostra)', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', description: 'Deitada de lado, abrir o joelho mantendo calcanhares unidos.', defaultSets: 3, defaultReps: '20', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['fisioterapia', 'glúteo médio'] },
  { name: 'Monster Walk com Elástico', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', description: 'Caminhada lateral com miniband nos tornozelos.', defaultSets: 3, defaultReps: '15 passos/lado', defaultRest: 45, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Mini-band', tags: ['ativação', 'glúteo médio'] },
  { name: 'Agachamento no Smith (Pé Avançado)', group: 'Pernas', subgroup: 'Agachamentos', level: 'intermediário', description: 'Pés à frente para maior foco em glúteos.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['smith', 'glúteos'] },

  // PANTURRILHA
  { name: 'Panturrilha em Pé na Máquina', group: 'Pernas', subgroup: 'Panturrilha', level: 'iniciante', description: 'Extensão de tornozelos em pé.', defaultSets: 4, defaultReps: '15-20', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['panturrilha'] },
  { name: 'Panturrilha Sentada', group: 'Pernas', subgroup: 'Panturrilha', level: 'iniciante', description: 'Foco no músculo sóleo.', defaultSets: 3, defaultReps: '15-20', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['panturrilha'] },
  { name: 'Panturrilha no Leg Press', group: 'Pernas', subgroup: 'Panturrilha', level: 'intermediário', description: 'Utilize a plataforma do leg press para o movimento.', defaultSets: 3, defaultReps: '15-20', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['panturrilha'] },
  { name: 'Step Up (Subida no Banco)', group: 'Pernas', subgroup: 'Glúteos', level: 'intermediário', description: 'Suba no banco com uma perna, focando no glúteo.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['funcional', 'glúteos'] },

  // MEMBROS SUPERIORES - PEITO
  { name: 'Supino Reto com Barra', group: 'Peito', subgroup: 'Supinos', level: 'intermediário', description: 'Empurre a barra verticalmente a partir do peito.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre', tags: ['peito', 'composto'] },
  { name: 'Supino Inclinado com Halteres', group: 'Peito', subgroup: 'Supinos', level: 'intermediário', description: 'Foco na parte superior do peitoral.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['peito superior'] },
  { name: 'Crucifixo Reto com Halteres', group: 'Peito', subgroup: 'Isolados', level: 'intermediário', description: 'Movimento de abertura lateral dos braços.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['peito', 'isolado'] },
  { name: 'Peck Deck (Voador)', group: 'Peito', subgroup: 'Isolados', level: 'iniciante', description: 'Adução de peitoral na máquina.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['peito', 'isolado'] },
  
  // COSTAS
  { name: 'Puxada Frontal Aberta', group: 'Costas', subgroup: 'Puxadas', level: 'iniciante', description: 'Puxe a barra em direção ao peito.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['costas', 'largura'] },
  { name: 'Remada Curvada com Barra', group: 'Costas', subgroup: 'Remadas', level: 'intermediário', description: 'Tronco inclinado, puxe a barra no umbigo.', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre', tags: ['costas', 'densidade'] },
  { name: 'Remada Baixa (Triângulo)', group: 'Costas', subgroup: 'Remadas', level: 'iniciante', description: 'Remada sentada no cabo.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['costas'] },
  { name: 'Remada Unilateral (Serrote)', group: 'Costas', subgroup: 'Remadas', level: 'intermediário', description: 'Apoiada no banco, puxe o halter.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['unilateral', 'costas'] },
  { name: 'Pulldown com Corda', group: 'Costas', subgroup: 'Puxadas', level: 'intermediário', description: 'Braços esticados, puxe a corda até as coxas.', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['costas', 'isolado'] },

  // OMBROS
  { name: 'Desenvolvimento com Halteres', group: 'Ombros', subgroup: 'Desenvolvimentos', level: 'intermediário', description: 'Empurre os halteres acima da cabeça.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['ombros', 'deltoides'] },
  { name: 'Elevação Lateral', group: 'Ombros', subgroup: 'Isolados', level: 'iniciante', description: 'Braços lateralmente até a linha dos ombros.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['ombro lateral', 'estética'] },
  { name: 'Elevação Frontal', group: 'Ombros', subgroup: 'Isolados', level: 'iniciante', description: 'Braços à frente até a linha dos ombros.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['ombro frontal'] },

  // BRAÇOS
  { name: 'Rosca Direta com Barra W', group: 'Braços', subgroup: 'Roscas', level: 'iniciante', description: 'Flexão de cotovelos com barra.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre', tags: ['bíceps'] },
  { name: 'Rosca Alternada com Halteres', group: 'Braços', subgroup: 'Roscas', level: 'iniciante', description: 'Um braço de cada vez com rotação.', defaultSets: 3, defaultReps: '10-12 cada', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['bíceps', 'unilateral'] },
  { name: 'Tríceps Pulley (Corda)', group: 'Braços', subgroup: 'Tríceps', level: 'iniciante', description: 'Extensão de cotovelos na polia alta.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos', tags: ['tríceps'] },
  { name: 'Tríceps Francês Unilateral', group: 'Braços', subgroup: 'Tríceps', level: 'intermediário', description: 'Halter atrás da cabeça.', defaultSets: 3, defaultReps: '12-15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['tríceps'] },
  { name: 'Mergulho no Banco', group: 'Braços', subgroup: 'Tríceps', level: 'iniciante', description: 'Apoiado no banco, desça o quadril.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['tríceps', 'corporal'] },

  // CORE E ABDÔMEN
  { name: 'Prancha Frontal', group: 'Core', subgroup: 'Estabilidade', level: 'iniciante', description: 'Mantenha o corpo reto apoiado nos antebraços.', defaultSets: 3, defaultReps: '30-60 seg', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['isometria', 'core'] },
  { name: 'Prancha Lateral', group: 'Core', subgroup: 'Estabilidade', level: 'intermediário', description: 'Apoio lateral para oblíquos.', defaultSets: 3, defaultReps: '30 seg/lado', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['oblíquos', 'isometria'] },
  { name: 'Abdominal Supra (Crunch)', group: 'Core', subgroup: 'Supra', level: 'iniciante', description: 'Encurtamento da parte superior do abdômen.', defaultSets: 3, defaultReps: '20', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['abs'] },
  { name: 'Abdominal Infra (Elevação Pernas)', group: 'Core', subgroup: 'Infra', level: 'intermediário', description: 'Eleve as pernas mantendo a lombar no chão.', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['abs inferior'] },
  { name: 'Dead Bug (Inseto Morto)', group: 'Core', subgroup: 'Estabilidade', level: 'iniciante', description: 'Coordenação e controle de core.', defaultSets: 3, defaultReps: '16 total', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['controle', 'core'] },
  { name: 'Vacuum Abdominal', group: 'Core', subgroup: 'Estabilidade', level: 'intermediário', description: 'Expulsar o ar e sugar o abdômen.', defaultSets: 3, defaultReps: '5 x 20 seg', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal', tags: ['estética', 'transverso'] },

  // FUNCIONAIS E CARDIO
  { name: 'Burpee', group: 'Cardio', subgroup: 'Funcional', level: 'avançado', description: 'Agachamento, prancha e salto.', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'BODYWEIGHT', type: 'CARDIO', equipment: 'Peso Corporal', tags: ['metabólico', 'intenso'] },
  { name: 'Mountain Climber', group: 'Cardio', subgroup: 'Funcional', level: 'intermediário', description: 'Posição de prancha, correndo com joelhos ao peito.', defaultSets: 3, defaultReps: '40 seg', defaultRest: 30, modality: 'BODYWEIGHT', type: 'CARDIO', equipment: 'Peso Corporal', tags: ['agilidade', 'core'] },
  { name: 'Kettlebell Swing', group: 'Cardio', subgroup: 'Funcional', level: 'intermediário', description: 'Pêndulo com kettlebell usando o quadril.', defaultSets: 3, defaultReps: '15-20', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres', tags: ['explosão', 'glúteos'] },
  { name: 'Polichinelo', group: 'Cardio', subgroup: 'Cardio', level: 'iniciante', description: 'Salto abrindo braços e pernas.', defaultSets: 3, defaultReps: '45 seg', defaultRest: 30, modality: 'AEROBIC', type: 'CARDIO', equipment: 'Peso Corporal', tags: ['cardio', 'aquecimento'] },
  { name: 'Agachamento com Salto', group: 'Cardio', subgroup: 'Funcional', level: 'avançado', description: 'Agache e salte explosivamente.', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, modality: 'BODYWEIGHT', type: 'CARDIO', equipment: 'Peso Corporal', tags: ['potência', 'pernas'] },
];

const extraExercises = [
    // COSTAS / PULL
    { name: 'Puxada Triângulo', group: 'Costas', subgroup: 'Puxadas', level: 'iniciante', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Remada Cavalinho', group: 'Costas', subgroup: 'Remadas', level: 'intermediário', defaultSets: 3, defaultReps: '10', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre' },
    { name: 'Puxada nuca', group: 'Costas', subgroup: 'Puxadas', level: 'intermediário', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Remada curvada supinada', group: 'Costas', subgroup: 'Remadas', level: 'intermediário', defaultSets: 3, defaultReps: '10', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre' },
    
    // PEITO / PUSH
    { name: 'Crucifixo Inclinado', group: 'Peito', subgroup: 'Isolados', level: 'intermediário', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Flexão de Braços', group: 'Peito', subgroup: 'Push', level: 'iniciante', defaultSets: 3, defaultReps: 'falha', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Supino Smith', group: 'Peito', subgroup: 'Supinos', level: 'intermediário', defaultSets: 3, defaultReps: '10', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    
    // OMBROS
    { name: 'Desenvolvimento Smith', group: 'Ombros', subgroup: 'Desenvolvimentos', level: 'intermediário', defaultSets: 3, defaultReps: '10', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Remada Alta no Cabo', group: 'Ombros', subgroup: 'Isolados', level: 'iniciante', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Crucifixo Inverso no Cabo', group: 'Ombros', subgroup: 'Isolados', level: 'intermediário', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    
    // BRAÇOS
    { name: 'Tríceps Testa', group: 'Braços', subgroup: 'Tríceps', level: 'intermediário', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre' },
    { name: 'Rosca Scott', group: 'Braços', subgroup: 'Roscas', level: 'intermediário', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Rosca Martelo', group: 'Braços', subgroup: 'Roscas', level: 'iniciante', defaultSets: 3, defaultReps: '12', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Rosca Concentrada', group: 'Braços', subgroup: 'Roscas', level: 'iniciante', defaultSets: 3, defaultReps: '12', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Tríceps Coice no Cabo', group: 'Braços', subgroup: 'Tríceps', level: 'iniciante', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    
    // CORE
    { name: 'Prancha com Toque no Ombro', group: 'Core', subgroup: 'Estabilidade', level: 'intermediário', defaultSets: 3, defaultReps: '20', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Bird Dog (Perdigueiro)', group: 'Core', subgroup: 'Estabilidade', level: 'iniciante', defaultSets: 3, defaultReps: '16', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Abdominal Bicicleta', group: 'Core', subgroup: 'Infra', level: 'intermediário', defaultSets: 3, defaultReps: '20', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Abdominal Oblíquo Alternado', group: 'Core', subgroup: 'Oblíquos', level: 'iniciante', defaultSets: 3, defaultReps: '20', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Abdominal infra no banco', group: 'Core', subgroup: 'Infra', level: 'intermediário', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Prancha com elevação de perna', group: 'Core', subgroup: 'Estabilidade', level: 'avançado', defaultSets: 3, defaultReps: '45 seg', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Abdominal Rollout (Rodinha)', group: 'Core', subgroup: 'Estabilidade', level: 'avançado', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Rodinha Abs' },
    
    // PERNAS - VARIAÇÕES
    { name: 'Cadeira Flexora Unilateral', group: 'Pernas', subgroup: 'Isolados', level: 'avançado', defaultSets: 3, defaultReps: '12', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Extensora Unilateral', group: 'Pernas', subgroup: 'Isolados', level: 'avançado', defaultSets: 3, defaultReps: '12', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Sumô no Smith', group: 'Pernas', subgroup: 'Agachamentos', level: 'intermediário', defaultSets: 4, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Terra com Barra Trap', group: 'Pernas', subgroup: 'Posteriores', level: 'intermediário', defaultSets: 4, defaultReps: '8', defaultRest: 120, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre' },
    { name: 'Stiff com Halteres', group: 'Pernas', subgroup: 'Posteriores', level: 'iniciante', defaultSets: 3, defaultReps: '15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Ponte de Glúteo (Solo)', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', defaultSets: 3, defaultReps: '20', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Elevação de Gêmeos Sentado', group: 'Pernas', subgroup: 'Panturrilha', level: 'iniciante', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Agachamento Cossaco', group: 'Pernas', subgroup: 'Lateral', level: 'intermediário', defaultSets: 3, defaultReps: '12 total', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Elevação pélvica no banco unilateral', group: 'Pernas', subgroup: 'Glúteos', level: 'avançado', defaultSets: 3, defaultReps: '12 cada', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Afundo no Smith', group: 'Pernas', subgroup: 'Passadas', level: 'intermediário', defaultSets: 3, defaultReps: '10 cada', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Glúteo 4 apoios com perna estendida', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', defaultSets: 3, defaultReps: '20 cada', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Adutor no cabo', group: 'Pernas', subgroup: 'Isolados', level: 'iniciante', defaultSets: 3, defaultReps: '15 cada', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Extensão de lombar (Banco Romano)', group: 'Pernas', subgroup: 'Posteriores', level: 'iniciante', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },

    // CARDIO / FUNCIONAL
    { name: 'Jumping Jack', group: 'Cardio', subgroup: 'Cardio', level: 'iniciante', defaultSets: 3, defaultReps: '60 seg', defaultRest: 30, modality: 'AEROBIC', type: 'CARDIO', equipment: 'Peso Corporal' },
    { name: 'Esteira (Caminhada)', group: 'Cardio', subgroup: 'Cardio', level: 'iniciante', defaultSets: 1, defaultReps: '10 min', defaultRest: 0, modality: 'AEROBIC', type: 'CARDIO', equipment: 'Esteira' },
    { name: 'Bicicleta (Moderada)', group: 'Cardio', subgroup: 'Cardio', level: 'iniciante', defaultSets: 1, defaultReps: '15 min', defaultRest: 0, modality: 'AEROBIC', type: 'CARDIO', equipment: 'Bicicleta Ergométrica' },
    { name: 'Elíptico', group: 'Cardio', subgroup: 'Cardio', level: 'iniciante', defaultSets: 1, defaultReps: '15 min', defaultRest: 0, modality: 'AEROBIC', type: 'CARDIO', equipment: 'Elíptico' },
    { name: 'Corda Naval', group: 'Cardio', subgroup: 'Funcional', level: 'intermediário', defaultSets: 4, defaultReps: '30 seg', defaultRest: 30, modality: 'GYM', type: 'CARDIO', equipment: 'Corda Naval' },
    { name: 'Pular Corda', group: 'Cardio', subgroup: 'Cardio', level: 'iniciante', defaultSets: 3, defaultReps: '1 min', defaultRest: 30, modality: 'BODYWEIGHT', type: 'CARDIO', equipment: 'Corda' },
    { name: 'Salto na Caixa (Box Jump)', group: 'Cardio', subgroup: 'Funcional', level: 'avançado', defaultSets: 3, defaultReps: '10', defaultRest: 60, modality: 'GYM', type: 'CARDIO', equipment: 'Caixa' },
    { name: 'Sled Push (Empurrar Trenó)', group: 'Cardio', subgroup: 'Funcional', level: 'avançado', defaultSets: 4, defaultReps: '20 metros', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Trenó' },
    
    // MAIS VARIAÇÕES PARA CHEGAR EM 120
    { name: 'Supino halteres neutro', group: 'Peito', subgroup: 'Supinos', level: 'iniciante', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Rosca concentrada no cabo', group: 'Braços', subgroup: 'Roscas', level: 'intermediário', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Tríceps corda unilateral', group: 'Braços', subgroup: 'Tríceps', level: 'avançado', defaultSets: 3, defaultReps: '12 cada', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Elevação lateral no cabo', group: 'Ombros', subgroup: 'Isolados', level: 'intermediário', defaultSets: 3, defaultReps: '15 cada', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Remada alta com halteres', group: 'Ombros', subgroup: 'Isolados', level: 'iniciante', defaultSets: 3, defaultReps: '12', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Crucifixo inverso com halteres', group: 'Ombros', subgroup: 'Isolados', level: 'iniciante', defaultSets: 3, defaultReps: '15', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Puxada fechada supinada', group: 'Costas', subgroup: 'Puxadas', level: 'iniciante', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Barra fixa assistida (Gravitron)', group: 'Costas', subgroup: 'Puxadas', level: 'iniciante', defaultSets: 3, defaultReps: '10', defaultRest: 90, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Abdominal infra na paralela', group: 'Core', subgroup: 'Infra', level: 'avançado', defaultSets: 3, defaultReps: '15', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Paralela' },
    { name: 'Abdominal remador', group: 'Core', subgroup: 'Geral', level: 'intermediário', defaultSets: 3, defaultReps: '20', defaultRest: 45, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Abdominal canivete', group: 'Core', subgroup: 'Geral', level: 'avançado', defaultSets: 3, defaultReps: '15', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Superman (Extensão lombar solo)', group: 'Core', subgroup: 'Lombar', level: 'iniciante', defaultSets: 3, defaultReps: '15', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Agachamento com isometria na parede', group: 'Pernas', subgroup: 'Agachamentos', level: 'iniciante', defaultSets: 3, defaultReps: '45 seg', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Peso Corporal' },
    { name: 'Ponte de glúteo com elástico', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', defaultSets: 3, defaultReps: '20', defaultRest: 45, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Mini-band' },
    { name: 'Abdução de quadril com mini-band', group: 'Pernas', subgroup: 'Glúteos', level: 'iniciante', defaultSets: 3, defaultReps: '20 cada', defaultRest: 30, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Mini-band' },
    { name: 'Flexão de perna com bola (Swiss Ball)', group: 'Pernas', subgroup: 'Posteriores', level: 'intermediário', defaultSets: 3, defaultReps: '15', defaultRest: 60, modality: 'BODYWEIGHT', type: 'STRENGTH', equipment: 'Bola Suíça' },
    { name: 'Elevação pélvica na máquina', group: 'Pernas', subgroup: 'Glúteos', level: 'intermediário', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Prensa de sóleo (Panturrilha sentada)', group: 'Pernas', subgroup: 'Panturrilha', level: 'iniciante', defaultSets: 3, defaultReps: '20', defaultRest: 45, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Agachamento frontal com halteres', group: 'Pernas', subgroup: 'Agachamentos', level: 'intermediário', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Halteres' },
    { name: 'Agachamento no smith com pés juntos', group: 'Pernas', subgroup: 'Agachamentos', level: 'intermediário', defaultSets: 3, defaultReps: '12', defaultRest: 60, modality: 'GYM', type: 'STRENGTH', equipment: 'Máquina / Cabos' },
    { name: 'Levantamento terra convencional', group: 'Pernas', subgroup: 'Geral', level: 'intermediário', defaultSets: 3, defaultReps: '8', defaultRest: 120, modality: 'GYM', type: 'STRENGTH', equipment: 'Barra Livre' },
];

const allExercises = [...exercises, ...extraExercises];

async function main() {
  console.log(`Starting seed with ${allExercises.length} exercises...`);

  for (const exerciseItem of allExercises) {
    const ex = exerciseItem as any;
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {
        group: ex.group,
        subgroup: ex.subgroup || null,
        level: ex.level || 'iniciante',
        description: ex.description || null,
        defaultSets: ex.defaultSets || 3,
        defaultReps: ex.defaultReps || '12',
        defaultRest: ex.defaultRest || 60,
        modality: ex.modality as Modality,
        type: ex.type as ExerciseType,
        equipment: ex.equipment || null,
        tags: ex.tags || []
      },
      create: {
        name: ex.name,
        group: ex.group,
        subgroup: ex.subgroup || null,
        level: ex.level || 'iniciante',
        description: ex.description || null,
        defaultSets: ex.defaultSets || 3,
        defaultReps: ex.defaultReps || '12',
        defaultRest: ex.defaultRest || 60,
        modality: ex.modality as Modality,
        type: ex.type as ExerciseType,
        equipment: ex.equipment || null,
        tags: ex.tags || []
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
