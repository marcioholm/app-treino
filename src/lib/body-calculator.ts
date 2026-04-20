export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
    if (!weightKg || !heightCm || heightCm === 0) return null;
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
}

export function classifyBMI(imc: number | null): string | null {
    if (imc === null) return null;
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    if (imc < 35) return "Obesidade grau I";
    if (imc < 40) return "Obesidade grau II";
    return "Obesidade grau III";
}

export function calculateWaistHipRatio(waistCm: number | null, hipCm: number | null): number | null {
    if (!waistCm || !hipCm || hipCm === 0) return null;
    return Math.round((waistCm / hipCm) * 1000) / 1000;
}

export function calculateChange(current: number | null, previous: number | null): { value: number; direction: "up" | "down" | "same" } | null {
    if (current === null || previous === null) return null;
    const diff = Math.round((current - previous) * 100) / 100;
    return {
        value: Math.abs(diff),
        direction: diff > 0 ? "up" : diff < 0 ? "down" : "same"
    };
}

export function isImprovement(metric: string, direction: "up" | "down" | "same"): boolean {
    const inverseMetrics = ["fatPercent", "fatMassKg", "waistCm", "abdomenCm", "hipCm"];
    if (direction === "same") return true;
    if (inverseMetrics.includes(metric)) {
        return direction === "down";
    }
    return direction === "up";
}