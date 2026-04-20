import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const students = await prisma.student.findMany({ include: { goals: true, assessments: true } });
    console.log("Students:", students.map(s => ({ id: s.id, goals: s.goals.length, asm: s.assessments.length })));
    const exercises = await prisma.exercise.groupBy({ by: ['group'], _count: { id: true } });
    console.log("Exercise Groups:", exercises);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
