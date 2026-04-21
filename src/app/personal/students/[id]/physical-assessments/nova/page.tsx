'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Scale, Ruler, Activity, Target, Save, ChevronDown, ChevronUp, Sparkles, Binary } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import { calculateBMI, classifyBMI } from '@/lib/body-calculator';
import { cn } from '@/lib/utils';

export default function NewPhysicalAssessment({ params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = use(params);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [showBioimpedance, setShowBioimpedance] = useState(true);
    const [showMeasurements, setShowMeasurements] = useState(false);
    
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        label: 'Avaliação Periódica',
        weight: '',
        height: '',
        age: '',
        bioimpedanceDevice: '',
        conditions: '',
        fatPercent: '',
        fatMassKg: '',
        leanMassKg: '',
        muscleMassKg: '',
        waterPercent: '',
        boneMassKg: '',
        basalMetabolism: '',
        metabolicAge: '',
        fatGoalPercent: '',
        muscleGoalKg: '',
        weightGoalKg: '',
        notes: '',
    });

    const [measurements, setMeasurements] = useState({
        neckCm: '',
        shoulderCm: '',
        chestCm: '',
        waistCm: '',
        abdomenCm: '',
        hipCm: '',
        rightArmCm: '',
        leftArmCm: '',
        rightArmContractedCm: '',
        leftArmContractedCm: '',
        rightForearmCm: '',
        leftForearmCm: '',
        rightThighCm: '',
        leftThighCm: '',
        rightCalfCm: '',
        leftCalfCm: '',
    });

    const bmiValue = calculateBMI(
        form.weight ? parseFloat(form.weight) : null,
        form.height ? parseFloat(form.height) : null
    );
    const bmiClass = classifyBMI(bmiValue);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const payload: any = {
                date: form.date,
                label: form.label,
                weight: form.weight ? parseFloat(form.weight) : null,
                height: form.height ? parseFloat(form.height) : null,
                bmi: bmiValue ? parseFloat(bmiValue) : null,
            };

            if (form.age) payload.age = parseInt(form.age);
            
            if (showBioimpedance) {
                if (form.bioimpedanceDevice) payload.bioimpedanceDevice = form.bioimpedanceDevice;
                if (form.conditions) payload.conditions = form.conditions;
                if (form.fatPercent) payload.fatPercent = parseFloat(form.fatPercent);
                if (form.fatMassKg) payload.fatMassKg = parseFloat(form.fatMassKg);
                if (form.leanMassKg) payload.leanMassKg = parseFloat(form.leanMassKg);
                if (form.muscleMassKg) payload.muscleMassKg = parseFloat(form.muscleMassKg);
                if (form.waterPercent) payload.waterPercent = parseFloat(form.waterPercent);
                if (form.boneMassKg) payload.boneMassKg = parseFloat(form.boneMassKg);
                if (form.basalMetabolism) payload.basalMetabolism = parseInt(form.basalMetabolism);
                if (form.metabolicAge) payload.metabolicAge = parseInt(form.metabolicAge);
                if (form.fatGoalPercent) payload.fatGoalPercent = parseFloat(form.fatGoalPercent);
                if (form.muscleGoalKg) payload.muscleGoalKg = parseFloat(form.muscleGoalKg);
                if (form.weightGoalKg) payload.weightGoalKg = parseFloat(form.weightGoalKg);
            }

            if (form.notes) payload.notes = form.notes;

            if (showMeasurements) {
                const m: any = {};
                Object.keys(measurements).forEach(key => {
                    if (measurements[key as keyof typeof measurements]) {
                        m[key] = parseFloat(measurements[key as keyof typeof measurements]);
                    }
                });
                if (Object.keys(m).length > 0) payload.measurements = m;
            }

            const res = await fetch(`/api/students/${studentId}/physical-assessments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push(`/personal/students/${studentId}/physical-assessments`);
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Erro ao salvar');
            }
        } finally {
            setSaving(false);
        }
    };

    const inputWrapper = "space-y-2";
    const labelStyle = "px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest";
    const inputStyle = "w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold focus:border-primary-light focus:bg-white/[0.08] transition-all outline-none placeholder:text-white/20 placeholder:font-medium";

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <section className="relative overflow-hidden pt-12 pb-12">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <Link href={`/personal/students/${studentId}/physical-assessments`} className="inline-flex items-center gap-2.5 text-muted-foreground hover:text-white transition-all mb-10 group p-2 rounded-xl hover:bg-white/5">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Ver Histórico</span>
                    </Link>

                    <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tighter animate-fade-up">Registro de <span className="text-gradient-brand">Métricas</span></h1>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="container mx-auto px-4 md:px-6 space-y-10 animate-fade-up stagger-1">
                {/* Basic Info Container */}
                <div className="bg-glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center text-primary-light">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-black text-white tracking-tight">Dados Vitais</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Informações Básicas da Atleta</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className={inputWrapper}>
                            <label className={labelStyle}>Data do Registro</label>
                            <input
                                type="date"
                                required
                                value={form.date}
                                onChange={(e) => setForm({...form, date: e.target.value})}
                                className={cn(inputStyle, "appearance-none")}
                            />
                        </div>
                        <div className={inputWrapper}>
                            <label className={labelStyle}>Identificador</label>
                            <input
                                type="text"
                                value={form.label}
                                onChange={(e) => setForm({...form, label: e.target.value})}
                                placeholder="E.g. Janeiro 2026"
                                className={inputStyle}
                            />
                        </div>
                        <div className={inputWrapper}>
                            <label className={labelStyle}>Peso Atual (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.weight}
                                onChange={(e) => setForm({...form, weight: e.target.value})}
                                placeholder="00.0"
                                className={inputStyle}
                            />
                        </div>
                        <div className={inputWrapper}>
                            <label className={labelStyle}>Altura (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={form.height}
                                onChange={(e) => setForm({...form, height: e.target.value})}
                                placeholder="000"
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    {bmiValue && (
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-[60px] -z-10 group-hover:bg-primary/20 transition-colors" />
                            <div>
                                <p className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1.5">IMC Analítico</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="font-display text-4xl font-black text-white leading-none">{bmiValue}</span>
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{bmiClass}</span>
                                </div>
                            </div>
                            <Binary size={40} className="text-white/5" />
                        </div>
                    )}
                </div>

                {/* Bioimpedance Section */}
                <div className="bg-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <button
                        type="button"
                        onClick={() => setShowBioimpedance(!showBioimpedance)}
                        className="flex items-center justify-between w-full p-10 hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-secondary/10 border border-secondary/20 grid place-items-center text-secondary-light">
                                <Target size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h2 className="font-display text-2xl font-black text-white tracking-tight">Bioimpedância</h2>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Métricas de Composição</p>
                            </div>
                        </div>
                        <div className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground">
                            {showBioimpedance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </button>
                    
                    {showBioimpedance && (
                        <div className="px-10 pb-10 space-y-10 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className={inputWrapper}>
                                    <label className={labelStyle}>Equipamento Utilizado</label>
                                    <input
                                        type="text"
                                        value={form.bioimpedanceDevice}
                                        onChange={(e) => setForm({...form, bioimpedanceDevice: e.target.value})}
                                        placeholder="Ex: InBody 270"
                                        className={inputStyle}
                                    />
                                </div>
                                <div className={inputWrapper}>
                                    <label className={labelStyle}>Condições Pré-Exame</label>
                                    <input
                                        type="text"
                                        value={form.conditions}
                                        onChange={(e) => setForm({...form, conditions: e.target.value})}
                                        placeholder="Ex: Jejum 4h, sem cafeína"
                                        className={inputStyle}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { k: 'fatPercent', l: '% Gordura', p: '00.0' },
                                    { k: 'fatMassKg', l: 'Massa Gorda (kg)', p: '00.0' },
                                    { k: 'leanMassKg', l: 'Massa Magra (kg)', p: '00.0' },
                                    { k: 'muscleMassKg', l: 'Massa Muscular (kg)', p: '00.0' },
                                    { k: 'waterPercent', l: '% Água Corporal', p: '00.0' },
                                    { k: 'boneMassKg', l: 'Massa Óssea (kg)', p: '0.0' },
                                    { k: 'basalMetabolism', l: 'Metab. Basal (kcal)', p: '0000' },
                                    { k: 'metabolicAge', l: 'Idade Metabólica', p: '00' },
                                ].map((field) => (
                                    <div key={field.k} className={inputWrapper}>
                                        <label className={labelStyle}>{field.l}</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={(form as any)[field.k]}
                                            onChange={(e) => setForm({...form, [field.k]: e.target.value})}
                                            placeholder={field.p}
                                            className={inputStyle}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Goals for this Athlete */}
                            <div className="pt-10 border-t border-white/5">
                                <div className="flex items-center gap-3 mb-8">
                                    <Sparkles size={18} className="text-primary-light" />
                                    <h3 className="font-display text-xl font-bold text-white tracking-tight uppercase tracking-wider text-xs">Metas Definidas</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className={inputWrapper}>
                                        <label className={labelStyle}>Meta % Gordura</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.fatGoalPercent}
                                            onChange={(e) => setForm({...form, fatGoalPercent: e.target.value})}
                                            placeholder="Ex: 22.0"
                                            className={cn(inputStyle, "border-primary/20 bg-primary/5")}
                                        />
                                    </div>
                                    <div className={inputWrapper}>
                                        <label className={labelStyle}>Meta Massa Muscular</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.muscleGoalKg}
                                            onChange={(e) => setForm({...form, muscleGoalKg: e.target.value})}
                                            placeholder="Ex: 52.0"
                                            className={cn(inputStyle, "border-primary/20 bg-primary/5")}
                                        />
                                    </div>
                                    <div className={inputWrapper}>
                                        <label className={labelStyle}>Meta de Peso Final</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.weightGoalKg}
                                            onChange={(e) => setForm({...form, weightGoalKg: e.target.value})}
                                            placeholder="Ex: 65.0"
                                            className={cn(inputStyle, "border-primary/20 bg-primary/5")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Measurements Section */}
                <div className="bg-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <button
                        type="button"
                        onClick={() => setShowMeasurements(!showMeasurements)}
                        className="flex items-center justify-between w-full p-10 hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-success/10 border border-success/20 grid place-items-center text-success">
                                <Ruler size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h2 className="font-display text-2xl font-black text-white tracking-tight">Medidas Perimétricas</h2>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Perímetros e Circunferências</p>
                            </div>
                        </div>
                        <div className="size-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground">
                            {showMeasurements ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </button>
                    
                    {showMeasurements && (
                        <div className="px-10 pb-10 space-y-12 animate-fade-in">
                            {[
                                { 
                                    group: 'Tronco Superior', 
                                    fields: [
                                        { k: 'neckCm', l: 'Pescoço' },
                                        { k: 'shoulderCm', l: 'Ombro' },
                                        { k: 'chestCm', l: 'Peitoral' },
                                        { k: 'waistCm', l: 'Cintura (Umbilical)' },
                                        { k: 'abdomenCm', l: 'Abdômen' },
                                        { k: 'hipCm', l: 'Quadril' }
                                    ]
                                },
                                { 
                                    group: 'Membros Superiores', 
                                    fields: [
                                        { k: 'rightArmCm', l: 'Braço D (Relax)' },
                                        { k: 'leftArmCm', l: 'Braço E (Relax)' },
                                        { k: 'rightArmContractedCm', l: 'Braço D (Contraído)' },
                                        { k: 'leftArmContractedCm', l: 'Braço E (Contraído)' },
                                        { k: 'rightForearmCm', l: 'Antebraço D' },
                                        { k: 'leftForearmCm', l: 'Antebraço E' }
                                    ]
                                },
                                { 
                                    group: 'Membros Inferiores', 
                                    fields: [
                                        { k: 'rightThighCm', l: 'Coxa D' },
                                        { k: 'leftThighCm', l: 'Coxa E' },
                                        { k: 'rightCalfCm', l: 'Panturrilha D' },
                                        { k: 'leftCalfCm', l: 'Panturrilha E' }
                                    ]
                                }
                            ].map((group) => (
                                <div key={group.group} className="space-y-6">
                                    <div className="label-caps opacity-50 px-4">{group.group}</div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                        {group.fields.map((f) => (
                                            <div key={f.k} className={inputWrapper}>
                                                <label className={cn(labelStyle, "px-2")}>{f.l}</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={(measurements as any)[f.k]}
                                                    onChange={(e) => setMeasurements({...measurements, [f.k]: e.target.value})}
                                                    placeholder="00.0"
                                                    className={cn(inputStyle, "px-4 py-3 text-sm h-12")}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes Container */}
                <div className="bg-glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-6">
                    <label className={labelStyle}>Observações & Anotações Técnicas</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm({...form, notes: e.target.value})}
                        placeholder="Descreva nuances observadas, assimetrias ou feedback da atleta..."
                        className={cn(inputStyle, "min-h-[160px] py-6 resize-none")}
                    />
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-10">
                    <Link href={`/personal/students/${studentId}/physical-assessments`} className="font-bold text-muted-foreground hover:text-white transition-colors px-6">
                        Cancelar Alterações
                    </Link>
                    <GradientButton 
                        type="submit" 
                        size="lg" 
                        disabled={saving}
                        className="w-full md:w-auto h-16 px-16 shadow-pink-lg text-lg"
                    >
                        {saving ? (
                            <Activity className="animate-spin mr-3" />
                        ) : (
                            <Save className="mr-3" />
                        )}
                        {saving ? 'Registrando...' : 'Finalizar Avaliação'}
                    </GradientButton>
                </div>
            </form>
        </div>
    );
}