'use client';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutTimer } from '../../WorkoutTimerContext';

const MOCK_EXERCISES = [
    { id: "e1", name: "Supino Reto Barra", details: "Peito • Barra Livre • 4 séries de 8-12 reps" },
    { id: "e2", name: "Supino Inclinado Halteres", details: "Peito • Halteres • 3 séries de 10-12 reps" },
    { id: "e3", name: "Crucifixo Máquina", details: "Peito • Máquina • 3 séries de 12-15 reps" },
    { id: "e4", name: "Desenvolvimento Halteres", details: "Ombro • Halteres • 4 séries de 10-12 reps" },
    { id: "e5", name: "Elevação Lateral", details: "Ombro • Halteres • 3 séries de 12-15 reps" }
];

export default function WorkoutExecution({ params }: { params: Promise<{ id: string }> }) {
    const { id: sessionId } = use(params);
    const router = useRouter();
    const { activeSeconds, startTimer, pauseTimer, resetTimer, isRunning } = useWorkoutTimer();

    const [sessionData, setSessionData] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [rpe, setRpe] = useState<number>(5);
    const [currentProgression, setCurrentProgression] = useState<any>(null);
    const [isLoadingProgression, setIsLoadingProgression] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(true);

    // Track sets: { [exerciseIndex]: { [setNumber]: { load: number, reps: number, isCompleted: boolean } } }
    const [workoutLogs, setWorkoutLogs] = useState<any>({});

    // Format activeSeconds into mm:ss
    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Fetch Session Data
    useEffect(() => {
        const fetchSession = async () => {
            setIsLoadingSession(true);
            try {
                // In a real flow, we'd fetch the specific session by ID or "today's"
                // For now, let's assume the [id] is the sessionId and we fetch its details
                const res = await fetch('/api/student/workout/today');
                const data = await res.json();
                if (data.todaySession) {
                    setSessionData(data.todaySession);
                }
            } catch (error) {
                console.error('Failed to load session', error);
            } finally {
                setIsLoadingSession(false);
            }
        };
        fetchSession();
    }, []);

    // Auto-start timer on mount if not already running
    useEffect(() => {
        if (!isRunning && !isFinished) startTimer();
    }, [isRunning, startTimer, isFinished]);

    const updateSetLog = (exerciseIdx: number, setNum: number, field: string, value: any) => {
        setWorkoutLogs((prev: any) => {
            const exerciseLogs = prev[exerciseIdx] || {};
            const setLog = exerciseLogs[setNum] || { load: 0, reps: 0, isCompleted: false };
            return {
                ...prev,
                [exerciseIdx]: {
                    ...exerciseLogs,
                    [setNum]: { ...setLog, [field]: value }
                }
            };
        });
    };

    const toggleSet = (exerciseIdx: number, setNum: number) => {
        setWorkoutLogs((prev: any) => {
            const exerciseLogs = prev[exerciseIdx] || {};
            const setLog = exerciseLogs[setNum] || { load: 0, reps: 0, isCompleted: false };
            return {
                ...prev,
                [exerciseIdx]: {
                    ...exerciseLogs,
                    [setNum]: { ...setLog, isCompleted: !setLog.isCompleted }
                }
            };
        });
    };

    const handleNext = async () => {
        if (currentIndex < sessionData.exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            pauseTimer();
            setIsFinished(true);
        }
    };

    // Load progression for current exercise
    useEffect(() => {
        const fetchProgression = async () => {
            if (!sessionData?.exercises[currentIndex]) return;

            setIsLoadingProgression(true);
            const exerciseId = sessionData.exercises[currentIndex].exerciseId;
            try {
                const res = await fetch(`/api/student/workout/progressions/${exerciseId}`);
                const data = await res.json();
                setCurrentProgression(data.progression || null);
            } catch (error) {
                console.error('Failed to load progression', error);
                setCurrentProgression(null);
            } finally {
                setIsLoadingProgression(false);
            }
        };

        if (!isFinished && sessionData) {
            fetchProgression();
        }
    }, [currentIndex, isFinished, sessionData]);

    const handleFinishWorkout = async () => {
        // Flatten logs for submission
        const allSetLogs: any[] = [];
        Object.entries(workoutLogs).forEach(([exIdx, sets]: [string, any]) => {
            const exercise = sessionData.exercises[parseInt(exIdx)];
            Object.entries(sets).forEach(([setNum, data]: [string, any]) => {
                if (data.isCompleted) {
                    allSetLogs.push({
                        workoutExerciseId: exercise.id,
                        exerciseId: exercise.exerciseId,
                        setNumber: parseInt(setNum),
                        load: parseFloat(data.load) || 0,
                        reps: parseInt(data.reps) || 0
                    });
                }
            });
        });

        try {
            await fetch('/api/student/workout/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionData.id,
                    activeSeconds,
                    rpeFinal: rpe,
                    setLogs: allSetLogs
                })
            });
            resetTimer();
            router.push('/student/today');
        } catch (error) {
            console.error('Failed to finish workout', error);
        }
    };

    if (isLoadingSession) {
        return (
            <div className="h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black p-6 text-center">
                <h1 className="text-xl font-bold text-white mb-2">Sessão não encontrada</h1>
                <Link href="/student/today" className="text-[#D4537E] font-bold">Voltar</Link>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="flex flex-col h-screen w-full bg-[#D4537E] p-6 text-center text-white space-y-6 flex-1 justify-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[#111111]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold">Treino Concluído!</h1>
                <p className="text-blue-100 text-lg mb-8">Excelente trabalho hoje. O descanso também faz parte do processo.</p>

                <div className="bg-[#111111]/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black mb-1">{Math.floor(activeSeconds / 60)}</span>
                        <span className="text-xs text-blue-200 uppercase tracking-widest font-bold">Minutos</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/20">
                        <span className="text-3xl font-black mb-1">
                            {Object.values(workoutLogs).reduce((acc: number, sets: any) =>
                                acc + Object.values(sets).reduce((sacc: number, s: any) => sacc + (s.isCompleted ? (parseFloat(s.load) || 0) * (parseInt(s.reps) || 0) : 0), 0)
                                , 0).toFixed(0)}
                        </span>
                        <span className="text-xs text-blue-200 uppercase tracking-widest font-bold">Kg Levantados</span>
                    </div>
                </div>

                <div className="bg-[#111111]/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 w-full max-w-sm mx-auto space-y-4">
                    <label className="block text-sm font-bold text-white uppercase tracking-wider text-left">
                        Qual foi a intensidade do treino? (RPE)
                    </label>
                    <input
                        type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(Number(e.target.value))}
                        className="w-full accent-white"
                    />
                    <div className="flex justify-between text-xs font-medium text-blue-200">
                        <span>1 (Leve)</span>
                        <span className="text-white font-bold text-lg">{rpe}/10</span>
                        <span>10 (Exaustivo)</span>
                    </div>
                </div>

                <div className="flex-1"></div>

                <button onClick={handleFinishWorkout} className="mt-auto bg-[#111111] text-[#D4537E] font-bold text-lg px-8 py-4 rounded-xl shadow-lg w-full mb-8 max-w-sm mx-auto hover:bg-black active:scale-95 transition-all">
                    Registrar e Voltar
                </button>
            </div>
        );
    }

    const currentWorkoutExercise = sessionData.exercises[currentIndex];
    const progressPerc = Math.round(((currentIndex + 1) / sessionData.exercises.length) * 100);

    return (
        <div className="flex flex-col h-screen w-full bg-black pb-20">
            <header className="bg-[#111111] border-b border-[#333333] px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <Link href="/student/today" onClick={() => pauseTimer()} className="text-gray-400 p-2 -ml-2 hover:bg-black rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Link>
                <div className="flex flex-col items-center flex-1">
                    <h1 className="font-bold text-white text-center">{sessionData.name}</h1>
                    <span className="text-xs font-mono text-[#D4537E] bg-[#D4537E]/10 px-2 py-0.5 rounded-full font-bold">
                        {formatTime(activeSeconds)}
                    </span>
                </div>
                <div className="w-10 flex justify-end">
                    <button onClick={isRunning ? pauseTimer : startTimer} className="p-2 text-gray-400 hover:text-[#D4537E] hover:bg-[#D4537E]/10 rounded-full transition-colors">
                        {isRunning ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-6 max-w-md mx-auto w-full">
                {/* Progress */}
                <div className="bg-[#111111] p-4 rounded-xl shadow-sm border border-[#333333]">
                    <div className="flex justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                        <span>Progresso</span>
                        <span>{currentIndex + 1}/{sessionData.exercises.length} Exercícios</span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                        <div className="bg-[#D4537E] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPerc}%` }}></div>
                    </div>
                </div>

                {/* Current Exercise */}
                <div className="bg-[#111111] rounded-xl shadow-sm border border-[#333333] overflow-hidden" key={currentIndex}>
                    <div className="aspect-video bg-[#1a1a1a] relative flex items-center justify-center border-b border-[#333333]">
                        {currentWorkoutExercise.exercise.videoUrl ? (
                            <video src={currentWorkoutExercise.exercise.videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        ) : (
                            <span className="text-gray-400 flex flex-col items-center">
                                <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Sem Vídeo
                            </span>
                        )}
                    </div>

                    <div className="p-5">
                        <h2 className="text-xl font-bold text-white mb-1">{currentWorkoutExercise.exercise.name}</h2>
                        <p className="text-sm text-gray-400 mb-6 font-medium">
                            {currentWorkoutExercise.exercise.group} • {currentWorkoutExercise.sets} séries de {currentWorkoutExercise.reps} reps
                        </p>

                        {/* Progression UI */}
                        {!isLoadingProgression && currentProgression && (
                            <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-orange-900">Evolução Sugerida</h4>
                                    <p className="text-sm text-orange-800 mt-1">
                                        Última: <strong>{currentProgression.lastLoad}kg</strong>.
                                        Meta hoje: <strong>{currentProgression.suggestedLoad}kg</strong>!
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {Array.from({ length: currentWorkoutExercise.sets }).map((_, i) => {
                                const setNum = i + 1;
                                const setLog = workoutLogs[currentIndex]?.[setNum] || { load: '', reps: currentWorkoutExercise.reps.split('-')[0], isCompleted: false };
                                return (
                                    <div key={setNum} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${setLog.isCompleted ? 'border-blue-500 bg-[#D4537E]/10' : 'border-[#333333] bg-black'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${setLog.isCompleted ? 'bg-[#D4537E] text-white' : 'bg-[#333333] text-gray-400'}`}>
                                            {setNum}
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="kg"
                                                    value={setLog.load}
                                                    onChange={(e) => updateSetLog(currentIndex, setNum, 'load', e.target.value)}
                                                    className="w-full p-2 bg-transparent border border-[#333333] rounded-lg text-center font-bold text-white focus:ring-2 focus:ring-[#D4537E] outline-none bg-[#111111]"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="reps"
                                                    value={setLog.reps}
                                                    onChange={(e) => updateSetLog(currentIndex, setNum, 'reps', e.target.value)}
                                                    className="w-full p-2 bg-transparent border border-[#333333] rounded-lg text-center font-bold text-white focus:ring-2 focus:ring-[#D4537E] outline-none bg-[#111111]"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleSet(currentIndex, setNum)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${setLog.isCompleted ? 'bg-[#D4537E] text-white shadow-sm' : 'bg-[#333333] text-gray-400 hover:bg-[#444444]'}`}
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleNext}
                    className="w-full bg-[#D4537E] hover:bg-[#993556] active:scale-[0.98] transition-all text-white py-4 rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                >
                    {currentIndex === sessionData.exercises.length - 1 ? 'Finalizar Treino' : 'Próximo Exercício'}
                </button>
                <button className="w-full bg-[#111111] text-gray-400 py-3 rounded-xl font-semibold border border-[#333333] hover:bg-black">
                    Substituir Exercício
                </button>
            </div>
        </div>
    );
}
