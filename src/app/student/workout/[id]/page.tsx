'use client';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutTimer } from '../../WorkoutTimerContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import WorkoutShareCard from '@/components/WorkoutShareCard';

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
    const [isStarting, setIsStarting] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const [restTime, setRestTime] = useState(0);
    const [showRestTimer, setShowRestTimer] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

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
            setFetchError(null);
            try {
                const res = await fetch(`/api/student/workout/today`);
                if (!res.ok) throw new Error('Falha ao carregar dados do servidor');
                
                const data = await res.json();
                if (data.todaySession) {
                    setSessionData({ ...data.todaySession, id: sessionId });
                } else {
                    // Fallback: se não houver today, usa o ID da URL como workoutId
                    setSessionData({ id: sessionId, name: 'Treino', exercises: [] });
                }
            } catch (error: any) {
                console.error('Failed to load session', error);
                setFetchError(error.message || 'Erro desconhecido ao carregar treino');
                setSessionData({ id: sessionId, name: 'Treino', exercises: [] });
            } finally {
                setIsLoadingSession(false);
            }
        };
        fetchSession();
    }, [sessionId]);

    // Start Countdown Logic
    useEffect(() => {
        if (!isLoadingSession && isStarting) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setTimeout(() => setIsStarting(false), 500);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isLoadingSession, isStarting]);

    // Auto-start timer when starting finishes
    useEffect(() => {
        if (!isStarting && !isRunning && !isFinished) startTimer();
    }, [isStarting, isRunning, startTimer, isFinished]);

    // Rest Timer Logic
    useEffect(() => {
        let timer: any;
        if (showRestTimer && restTime > 0) {
            timer = setInterval(() => {
                setRestTime(prev => {
                    if (prev <= 1) {
                        setShowRestTimer(false);
                        // Feedback tátil
                        if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            navigator.vibrate([200, 100, 200]);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showRestTimer, restTime]);

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
            const newState = !setLog.isCompleted;

            // Trigger rest timer if set is marked as completed
            if (newState) {
                const exercise = sessionData.exercises[exerciseIdx];
                setRestTime(exercise.restTime || 60);
                setShowRestTimer(true);
            }

            const newLogs = {
                ...prev,
                [exerciseIdx]: {
                    ...exerciseLogs,
                    [setNum]: { ...setLog, isCompleted: newState }
                }
            };
            
            // Auto-save logs
            localStorage.setItem(`mk_workout_logs_${sessionId}`, JSON.stringify(newLogs));
            return newLogs;
        });
    };

    // Load persisted state
    useEffect(() => {
        if (sessionData && sessionId) {
            const savedLogs = localStorage.getItem(`mk_workout_logs_${sessionId}`);
            const savedIndex = localStorage.getItem(`mk_workout_index_${sessionId}`);
            
            if (savedLogs) setWorkoutLogs(JSON.parse(savedLogs));
            if (savedIndex) setCurrentIndex(parseInt(savedIndex));
        }
    }, [sessionData, sessionId]);

    // Persist current index
    useEffect(() => {
        if (sessionId) {
            localStorage.setItem(`mk_workout_index_${sessionId}`, currentIndex.toString());
        }
    }, [currentIndex, sessionId]);

    const handleNext = async () => {
        if (currentIndex < (sessionData?.exercises?.length || 0) - 1) {
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
            const exerciseId = sessionData?.exercises?.[currentIndex]?.exerciseId;
            if (!exerciseId) return;

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
        try {
            pauseTimer();
            
            const allSetLogs: any[] = [];
            Object.entries(workoutLogs).forEach(([exIdx, sets]: [string, any]) => {
                const exercise = sessionData?.exercises?.[parseInt(exIdx)];
                if (!exercise) return;
                
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

            // Primeiro inicia a sessão e pega o logId
            const startRes = await fetch('/api/student/workout/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workoutId: sessionData.id })
            });
            
            if (!startRes.ok) {
                throw new Error('Failed to start workout');
            }
            
            const { logId } = await startRes.json();

            // Registra cada set
            for (const setLog of allSetLogs) {
                await fetch('/api/student/workout/log-set', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workoutLogId: logId,
                        workoutExerciseId: setLog.workoutExerciseId,
                        setNumber: setLog.setNumber,
                        reps: setLog.reps,
                        load: setLog.load
                    })
                });
            }

            // Finaliza o treino e limpa o cache local
            const endRes = await fetch('/api/student/workout/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    workoutLogId: logId,
                    activeSeconds: activeSeconds
                })
            });

            const result = await endRes.json();

            // Limpa o progresso salvo
            localStorage.removeItem(`mk_workout_logs_${sessionId}`);
            localStorage.removeItem(`mk_workout_index_${sessionId}`);
            localStorage.setItem('lastWorkoutResult', JSON.stringify(result));

            resetTimer();
            router.push(`/student/workout/complete?result=${btoa(JSON.stringify(result))}`);
        } catch (error) {
            console.error('Failed to finish workout', error);
            alert('Erro ao salvar treino. Tente novamente.');
        }
    };

    if (isLoadingSession) {
        return (
            <div className="h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (fetchError || !sessionData || !sessionData.exercises || sessionData.exercises.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black p-6 text-center">
                <div className="w-16 h-16 bg-[#D4537E]/10 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-[#D4537E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Nenhum treino disponível</h1>
                <p className="text-gray-400 mb-6 max-w-xs">Não encontramos exercícios planejados para hoje ou houve um erro no carregamento.</p>
                <Link href="/student/today" className="bg-[#D4537E] text-white px-8 py-3 rounded-xl font-bold">Voltar para Início</Link>
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
                                acc + (sets ? Object.values(sets).reduce((sacc: number, s: any) => sacc + (s?.isCompleted ? (parseFloat(s.load) || 0) * (parseInt(s.reps) || 0) : 0), 0) : 0)
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

                <div className="w-full max-w-sm mx-auto px-4">
                    <WorkoutShareCard 
                        stats={{
                            workoutName: sessionData.name,
                            duration: formatTime(activeSeconds),
                            totalWeight: Object.values(workoutLogs).reduce((acc: number, sets: any) =>
                                acc + (sets ? Object.values(sets).reduce((sacc: number, s: any) => sacc + (s?.isCompleted ? (parseFloat(s.load) || 0) * (parseInt(s.reps) || 0) : 0), 0) : 0)
                                , 0).toFixed(0),
                            date: new Date().toLocaleDateString('pt-BR'),
                            branding: sessionData.tenant ? {
                                gymName: sessionData.tenant.name,
                                logoUrl: sessionData.tenant.logoUrl,
                                primaryColor: sessionData.tenant.primaryColor,
                                secondaryColor: sessionData.tenant.secondaryColor
                            } : undefined
                        }}
                    />
                </div>

                <div className="flex-1"></div>

                <button onClick={handleFinishWorkout} className="mt-auto bg-[#111111] text-[#D4537E] font-bold text-lg px-8 py-4 rounded-xl shadow-lg w-full mb-8 max-w-sm mx-auto hover:bg-black active:scale-95 transition-all">
                    Registrar e Voltar
                </button>
            </div>
        );
    }

    const currentWorkoutExercise = sessionData.exercises[currentIndex];
    if (!currentWorkoutExercise) return null;
    
    const progressPerc = Math.round(((currentIndex + 1) / (sessionData.exercises.length || 1)) * 100);

    return (
        <ErrorBoundary>
            {/* Start Animation Overlay */}
            {isStarting && !isLoadingSession && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-500">
                    <div className="text-center">
                        <div className={`text-9xl font-black text-white transition-all duration-300 transform ${countdown === 0 ? 'scale-150 opacity-0' : 'scale-100 opacity-100 animate-pulse'}`}>
                            {countdown === 0 ? 'GO!' : countdown}
                        </div>
                        <p className="text-[#D4537E] font-display font-black tracking-widest mt-8 animate-bounce">PREPARE-SE</p>
                    </div>
                </div>
            )}

            {/* Rest Timer Floating UI */}
            {showRestTimer && (
                <div className="fixed bottom-24 left-4 right-4 z-50 bg-[#111111] border-2 border-[#D4537E]/30 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-6">
                        <div className="relative size-16 shrink-0">
                            <svg className="size-full -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#D4537E]" strokeDasharray={176} strokeDashoffset={176 - (176 * (restTime / (sessionData.exercises[currentIndex].restTime || 60)))} />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-display font-black text-white text-xl">{restTime}</span>
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="font-display font-black text-white text-lg">Descanso Ativo</h4>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Prepare-se para a próxima série</p>
                        </div>
                        <button onClick={() => setShowRestTimer(false)} className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Pular
                        </button>
                    </div>
                </div>
            )}

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
                            {currentWorkoutExercise.exercise?.group || 'Geral'} • {currentWorkoutExercise.sets} séries de {currentWorkoutExercise.reps} reps
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
                                const setLog = workoutLogs[currentIndex]?.[setNum] || { 
                                    load: '', 
                                    reps: typeof currentWorkoutExercise.reps === 'string' ? currentWorkoutExercise.reps.split('-')[0] : currentWorkoutExercise.reps, 
                                    isCompleted: false 
                                };
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
        </ErrorBoundary>
    );
}
