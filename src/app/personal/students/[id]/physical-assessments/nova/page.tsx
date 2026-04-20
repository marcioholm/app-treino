'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateBMI, classifyBMI } from '@/lib/body-calculator';

export default function NewPhysicalAssessment({ params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = use(params);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [showBioimpedance, setShowBioimpedance] = useState(false);
    const [showMeasurements, setShowMeasurements] = useState(false);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        label: 'Avaliação Inicial',
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

    const bmi = calculateBMI(
        form.weight ? parseFloat(form.weight) : null,
        form.height ? parseFloat(form.height) : null
    );
    const bmiClass = classifyBMI(bmi);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const payload: any = {
                date: form.date,
                label: form.label,
            };

            if (form.weight) payload.weight = parseFloat(form.weight);
            if (form.height) payload.height = parseFloat(form.height);
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

    const inputClass = "w-full border border-[#444444] rounded-lg p-2.5 bg-black text-white outline-none focus:border-[#D4537E]";

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/personal/students/${studentId}/physical-assessments`} className="text-gray-400 hover:text-gray-400">
                    &larr; Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Nova Avaliação Física</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Gerais */}
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Dados Gerais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Data da avaliação</label>
                            <input
                                type="date"
                                required
                                value={form.date}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setForm({...form, date: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Rótulo</label>
                            <input
                                type="text"
                                value={form.label}
                                onChange={(e) => setForm({...form, label: e.target.value})}
                                placeholder="Avaliação Inicial"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Peso (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.weight}
                                onChange={(e) => setForm({...form, weight: e.target.value})}
                                placeholder="65.50"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Altura (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.height}
                                onChange={(e) => setForm({...form, height: e.target.value})}
                                placeholder="165.0"
                                className={inputClass}
                            />
                        </div>
                        {bmi && (
                            <div className="md:col-span-2 bg-[#1a1a1a] p-4 rounded-lg">
                                <p className="text-gray-400 text-sm">IMC calculado</p>
                                <p className="text-2xl font-bold text-white">
                                    {bmi} — {bmiClass}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bioimpedância */}
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    <button
                        type="button"
                        onClick={() => setShowBioimpedance(!showBioimpedance)}
                        className="flex items-center justify-between w-full"
                    >
                        <h2 className="text-lg font-bold text-white">Bioimpedância</h2>
                        <span className="text-gray-400">{showBioimpedance ? '−' : '+'}</span>
                    </button>
                    
                    {showBioimpedance && (
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Aparelho</label>
                                    <input
                                        type="text"
                                        value={form.bioimpedanceDevice}
                                        onChange={(e) => setForm({...form, bioimpedanceDevice: e.target.value})}
                                        placeholder="InBody 270"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Condições</label>
                                    <input
                                        type="text"
                                        value={form.conditions}
                                        onChange={(e) => setForm({...form, conditions: e.target.value})}
                                        placeholder="Jejum de 4h"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">% Gordura</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.fatPercent}
                                        onChange={(e) => setForm({...form, fatPercent: e.target.value})}
                                        placeholder="28.50"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Massa Gordura (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.fatMassKg}
                                        onChange={(e) => setForm({...form, fatMassKg: e.target.value})}
                                        placeholder="18.52"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Massa Magra (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.leanMassKg}
                                        onChange={(e) => setForm({...form, leanMassKg: e.target.value})}
                                        placeholder="46.98"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Massa Muscular (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.muscleMassKg}
                                        onChange={(e) => setForm({...form, muscleMassKg: e.target.value})}
                                        placeholder="44.30"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">% Água Corporal</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.waterPercent}
                                        onChange={(e) => setForm({...form, waterPercent: e.target.value})}
                                        placeholder="52.40"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Massa Óssea (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.boneMassKg}
                                        onChange={(e) => setForm({...form, boneMassKg: e.target.value})}
                                        placeholder="2.40"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Metabolismo Basal (kcal)</label>
                                    <input
                                        type="number"
                                        value={form.basalMetabolism}
                                        onChange={(e) => setForm({...form, basalMetabolism: e.target.value})}
                                        placeholder="1420"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Idade Metabólica</label>
                                    <input
                                        type="number"
                                        value={form.metabolicAge}
                                        onChange={(e) => setForm({...form, metabolicAge: e.target.value})}
                                        placeholder="35"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Metas */}
                            <div className="pt-4 border-t border-[#333333]">
                                <h3 className="text-white font-medium mb-3">Metas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1">Meta % Gordura</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.fatGoalPercent}
                                            onChange={(e) => setForm({...form, fatGoalPercent: e.target.value})}
                                            placeholder="22.00"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1">Meta Massa Muscular</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.muscleGoalKg}
                                            onChange={(e) => setForm({...form, muscleGoalKg: e.target.value})}
                                            placeholder="50.00"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1">Meta Peso</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.weightGoalKg}
                                            onChange={(e) => setForm({...form, weightGoalKg: e.target.value})}
                                            placeholder="62.00"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Medidas Corporais */}
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    <button
                        type="button"
                        onClick={() => setShowMeasurements(!showMeasurements)}
                        className="flex items-center justify-between w-full"
                    >
                        <h2 className="text-lg font-bold text-white">Medidas Corporais</h2>
                        <span className="text-gray-400">{showMeasurements ? '−' : '+'}</span>
                    </button>
                    
                    {showMeasurements && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <h3 className="text-gray-400 text-sm mb-2">Tronco</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Pescoço</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.neckCm}
                                            onChange={(e) => setMeasurements({...measurements, neckCm: e.target.value})}
                                            placeholder="33.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Ombro</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.shoulderCm}
                                            onChange={(e) => setMeasurements({...measurements, shoulderCm: e.target.value})}
                                            placeholder="100.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Peitoral</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.chestCm}
                                            onChange={(e) => setMeasurements({...measurements, chestCm: e.target.value})}
                                            placeholder="90.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Cintura</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.waistCm}
                                            onChange={(e) => setMeasurements({...measurements, waistCm: e.target.value})}
                                            placeholder="72.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Abdômen</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.abdomenCm}
                                            onChange={(e) => setMeasurements({...measurements, abdomenCm: e.target.value})}
                                            placeholder="80.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Quadril</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.hipCm}
                                            onChange={(e) => setMeasurements({...measurements, hipCm: e.target.value})}
                                            placeholder="98.0"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-400 text-sm mb-2">Braços</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Braço D (relax)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.rightArmCm}
                                            onChange={(e) => setMeasurements({...measurements, rightArmCm: e.target.value})}
                                            placeholder="29.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Braço E (relax)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.leftArmCm}
                                            onChange={(e) => setMeasurements({...measurements, leftArmCm: e.target.value})}
                                            placeholder="28.5"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Braço D (cont)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.rightArmContractedCm}
                                            onChange={(e) => setMeasurements({...measurements, rightArmContractedCm: e.target.value})}
                                            placeholder="32.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Braço E (cont)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.leftArmContractedCm}
                                            onChange={(e) => setMeasurements({...measurements, leftArmContractedCm: e.target.value})}
                                            placeholder="31.5"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Antebraço D</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.rightForearmCm}
                                            onChange={(e) => setMeasurements({...measurements, rightForearmCm: e.target.value})}
                                            placeholder="26.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Antebraço E</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.leftForearmCm}
                                            onChange={(e) => setMeasurements({...measurements, leftForearmCm: e.target.value})}
                                            placeholder="25.5"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-400 text-sm mb-2">Pernas</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Coxa D</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.rightThighCm}
                                            onChange={(e) => setMeasurements({...measurements, rightThighCm: e.target.value})}
                                            placeholder="55.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Coxa E</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.leftThighCm}
                                            onChange={(e) => setMeasurements({...measurements, leftThighCm: e.target.value})}
                                            placeholder="54.5"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Panturrilha D</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.rightCalfCm}
                                            onChange={(e) => setMeasurements({...measurements, rightCalfCm: e.target.value})}
                                            placeholder="36.0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Panturrilha E</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements.leftCalfCm}
                                            onChange={(e) => setMeasurements({...measurements, leftCalfCm: e.target.value})}
                                            placeholder="35.5"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Observações */}
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Observações</h2>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm({...form, notes: e.target.value})}
                        placeholder="Observações gerais..."
                        className={`${inputClass} h-32`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#D4537E] hover:bg-[#993556] disabled:opacity-50 text-white font-bold py-3 rounded-xl"
                >
                    {saving ? 'Salvando...' : 'Salvar Avaliação'}
                </button>
            </form>
        </div>
    );
}