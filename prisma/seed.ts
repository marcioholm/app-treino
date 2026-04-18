import { PrismaClient, Modality, ExerciseType } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { createDefaultAnamnesisTemplate } from '../src/lib/engine/anamnesis-seeder';

const prisma = new PrismaClient();

const subgroupsKeywords: Record<string, string> = {
  'supino': 'Supinos',
  'remada': 'Remadas',
  'puxada': 'Puxadas',
  'desenvolvimento': 'Desenvolvimentos',
  'rosca': 'Roscas',
  'tríceps': 'Extensões de Tríceps',
  'agachamento': 'Agachamentos',
  'infra': 'Infra',
  'supra': 'Supra',
};

const tagsKeywords: Record<string, string[]> = {
  'terra': ['lombar', 'composto'],
  'stiff': ['lombar', 'posterior'],
  'salto': ['joelho', 'impacto'],
  'agachamento': ['joelho', 'composto'],
  'prancha': ['core', 'isometria'],
};

function inferSubgroup(name: string): string | null {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(subgroupsKeywords)) {
    if (lowerName.includes(key)) return value;
  }
  return null;
}

function inferTags(name: string): string[] {
  const lowerName = name.toLowerCase();
  const tags: Set<string> = new Set();
  for (const [key, values] of Object.entries(tagsKeywords)) {
    if (lowerName.includes(key)) {
      values.forEach(v => tags.add(v));
    }
  }
  return Array.from(tags);
}

function inferModalityAndType(name: string, group: string): { modality: Modality, type: ExerciseType, equipment: string | null } {
  const lowerName = name.toLowerCase();
  let type: ExerciseType = ExerciseType.STRENGTH;
  let modality: Modality = Modality.GYM;
  let equipment: string | null = null;

  if (group.toLowerCase() === 'cardio') {
    type = ExerciseType.CARDIO;
    modality = Modality.AEROBIC;
    if (lowerName.includes('esteira')) equipment = 'Esteira';
    else if (lowerName.includes('bicicleta')) equipment = 'Bicicleta Ergométrica';
    else if (lowerName.includes('elíptico')) equipment = 'Elíptico';
    return { modality, type, equipment };
  }

  if (lowerName.includes('máquina') || lowerName.includes('extensora') || lowerName.includes('flexora') || lowerName.includes('press') || lowerName.includes('polia') || lowerName.includes('cross')) {
    equipment = 'Máquina / Cabos';
  } else if (lowerName.includes('halteres') || lowerName.includes('halter')) {
    equipment = 'Halteres';
  } else if (lowerName.includes('barra')) {
    equipment = 'Barra Livre';
  } else if (lowerName.includes('prancha') || lowerName.includes('abdominal') || lowerName.includes('salto') || lowerName.includes('livre')) {
    modality = Modality.BODYWEIGHT;
    equipment = 'Peso Corporal';
  } else {
    equipment = 'Variado';
  }

  return { modality, type, equipment };
}

async function main() {
  console.log('Reading exercises_raw.txt...');
  const rawPath = path.join(__dirname, '../exercises_raw.txt');
  const rawData = fs.readFileSync(rawPath, 'utf8');

  // Safest splitting independent of backslash escaping in JSON tool calls:
  const lines = rawData.split(String.fromCharCode(10)).map(l => l.trim()).filter(l => l.length > 0);

  const exercises = [];
  let currentGroup = '';

  const seen = new Set();

  for (const line of lines) {
    if (!line.includes(' ')) {
      const knownGroups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio'];
      if (knownGroups.includes(line)) {
        currentGroup = line;
        continue;
      }
    }

    // Check duplicates
    if (seen.has(line.toLowerCase())) continue;
    seen.add(line.toLowerCase());

    const { modality, type, equipment } = inferModalityAndType(line, currentGroup);
    const subgroup = inferSubgroup(line);
    const tags = inferTags(line);

    exercises.push({
      name: line,
      group: currentGroup,
      subgroup,
      modality,
      type,
      equipment,
      tags
    });
  }

  const jsonPath = path.join(__dirname, '../exercises.json');
  fs.writeFileSync(jsonPath, JSON.stringify(exercises, null, 2));
  console.log(`Generated exercises.json with ${exercises.length} exercises.`);

  console.log('Seeding database with exercises...');
  for (const ex of exercises) {
    await prisma.exercise.create({
      data: {
        name: ex.name,
        group: ex.group,
        subgroup: ex.subgroup,
        modality: ex.modality,
        type: ex.type,
        equipment: ex.equipment,
        tags: ex.tags,
        tenantId: null // Global exercises
      }
    });
  }

  // Also create a demo tenant, personal and student to make it easier to test
  console.log('Creating Demo Tenant and Users...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Treinos Demo Ltda'
    }
  });

  await createDefaultAnamnesisTemplate(prisma, tenant.id);

  const bcrypt = require('bcrypt'); // or import if module allows
  const hashedPassword = await bcrypt.hash('testpassword', 10);

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Marci Personal',
      email: 'admin@traineros.com',
      password: hashedPassword,
      role: 'OWNER_PERSONAL'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
