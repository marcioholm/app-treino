'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Workout {
    id: string;
    name: string;
    studentName: string;
    sessions: Array<{
        id: string;
        name: string;
        exercises: Array<{
            name: string;
            group: string;
            equipment: string;
            sets: number;
            reps: string;
            restTime: number;
            notes?: string;
        }>;
    }>;
}

const mockWorkout: Workout = {
    id: '1',
    name: 'Treino A - Push',
    studentName: 'João',
    sessions: [
        {
            id: '1',
            name: 'A - Push',
            exercises: [
                { name: 'Supino Reto Barra', group: 'Peito', equipment: 'Barra Livre', sets: 4, reps: '8-12', restTime: 90 },
                { name: 'Supino Inclinado Halteres', group: 'Peito', equipment: 'Halteres', sets: 3, reps: '10-12', restTime: 75 },
                { name: 'Desenvolvimento Arnold', group: 'Ombros', equipment: 'Halteres', sets: 3, reps: '10-12', restTime: 75 },
                { name: 'Elevação Lateral', group: 'Ombros', equipment: 'Halteres', sets: 3, reps: '12-15', restTime: 60 },
                { name: 'Tríceps Pulley', group: 'Braços', equipment: 'Máquina', sets: 3, reps: '12-15', restTime: 60 },
                { name: 'Tríceps Testa', group: 'Braços', equipment: 'Halteres', sets: 3, reps: '10-12', restTime: 60 },
            ]
        }
    ]
};

const groupColors: Record<string, string> = {
    'Peito': 'bg-pink-100 text-pink-700',
    'Costas': 'bg-blue-100 text-blue-700',
    'Pernas': 'bg-green-100 text-green-700',
    'Ombros': 'bg-purple-100 text-purple-700',
    'Braços': 'bg-orange-100 text-orange-700',
    'Core': 'bg-yellow-100 text-yellow-700',
};

export default function WorkoutPreview() {
    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    const workout = mockWorkout;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/personal/students" className="text-blue-200 hover:text-white">
                        ← Voltar
                    </Link>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                        Rascunho
                    </span>
                </div>
                <h1 className="text-2xl font-bold mb-1">{workout.name}</h1>
                <p className="text-blue-200 text-sm">Aluno: {workout.studentName}</p>
            </div>

            {/* Stats */}
            <div className="px-4 -mt-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-around">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{workout.sessions[0].exercises.length}</p>
                        <p className="text-xs text-gray-500">Exercícios</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            {workout.sessions[0].exercises.reduce((acc, ex) => acc + ex.sets, 0)}
                        </p>
                        <p className="text-xs text-gray-500">Séries Totais</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">~50</p>
                        <p className="text-xs text-gray-500">Minutos</p>
                    </div>
                </div>
            </div>

            {/* Exercises */}
            <div className="p-4 space-y-3">
                <h2 className="font-bold text-gray-900">Exercícios</h2>
                {workout.sessions[0].exercises.map((exercise, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div 
                            className="p-4 flex items-center gap-4 cursor-pointer"
                            onClick={() => setExpandedExercise(expandedExercise === exercise.name ? null : exercise.name)}
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${groupColors[exercise.group] || 'bg-gray-100 text-gray-700'}`}>
                                        {exercise.group}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{exercise.equipment}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{exercise.sets}x{exercise.reps}</p>
                                <p className="text-xs text-gray-500">{exercise.restTime}s pausa</p>
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedExercise === exercise.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        
                        {expandedExercise === exercise.name && (
                            <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                                <div className="mt-3 grid grid-cols-3 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Séries</p>
                                        <p className="font-bold text-gray-900">{exercise.sets}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Repetições</p>
                                        <p className="font-bold text-gray-900">{exercise.reps}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-gray-500">Pausa</p>
                                        <p className="font-bold text-gray-900">{exercise.restTime}s</p>
                                    </div>
                                </div>
                                {exercise.notes && (
                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                        <p className="text-xs text-yellow-800">{exercise.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="p-4 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="flex gap-3">
                    <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                        Editar
                    </button>
                    <button className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                        Publicar
                    </button>
                </div>
            </div>
        </div>
    );
}