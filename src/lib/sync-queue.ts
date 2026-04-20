interface PendingSet {
    sessionId: string;
    exerciseId: string;
    setNumber: number;
    reps?: number;
    weightKg?: number;
    durationSec?: number;
    completed: boolean;
    notes?: string;
    timestamp: number;
}

const QUEUE_KEY = 'pendingSets';

export function enqueuePendingSet(set: Omit<PendingSet, 'timestamp'>): void {
    if (typeof window === 'undefined') return;
    
    const queue = getPendingQueue();
    queue.push({ ...set, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getPendingQueue(): PendingSet[] {
    if (typeof window === 'undefined') return [];
    
    try {
        const data = localStorage.getItem(QUEUE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function clearPendingQueue(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(QUEUE_KEY);
}

export async function flushPendingQueue(sessionId: string): Promise<{ success: boolean; synced: number }> {
    if (typeof window === 'undefined') {
        return { success: false, synced: 0 };
    }

    const queue = getPendingQueue().filter(s => s.sessionId === sessionId);
    let synced = 0;

    for (const set of queue) {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/sets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(set),
            });

            if (res.ok) {
                synced++;
            }
        } catch (e) {
            console.error('Failed to sync set:', e);
        }
    }

    if (synced > 0) {
        const remaining = getPendingQueue().filter(s => s.sessionId !== sessionId);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    }

    return { success: synced === queue.length, synced };
}

export function setupOnlineListener(sessionId: string): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
        flushPendingQueue(sessionId);
    });
}