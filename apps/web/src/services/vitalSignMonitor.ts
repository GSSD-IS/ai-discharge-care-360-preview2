// Mock Service for L1 Sense Layer (HIS Vital Signs)

type VitalCallback = (data: { temp: number; spo2: number; isCritical: boolean }) => void;

class VitalSignMonitor {
    private intervalId: any;
    private listeners: VitalCallback[] = [];
    private isRunning = false;

    // Default normal range
    private currentTemp = 36.5;
    private currentSpo2 = 98;

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[L1 Sense] Vital Sign Monitor Started');

        this.intervalId = setInterval(() => {
            // Slight random fluctuation
            this.currentTemp += (Math.random() - 0.5) * 0.2;
            this.currentSpo2 += (Math.random() - 0.5) * 1;

            // Cap values
            if (this.currentSpo2 > 100) this.currentSpo2 = 100;
            if (this.currentSpo2 < 90) this.currentSpo2 = 90; // Don't drop too low automatically

            this.notify();
        }, 2000);
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.isRunning = false;
        console.log('[L1 Sense] Vital Sign Monitor Stopped');
    }

    subscribe(callback: VitalCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    private notify() {
        const isCritical = this.currentTemp > 38.0 || this.currentSpo2 < 92;
        this.listeners.forEach(cb => cb({
            temp: parseFloat(this.currentTemp.toFixed(1)),
            spo2: Math.floor(this.currentSpo2),
            isCritical
        }));
    }

    // Tool for us to manually trigger deterioration (Simulate Phase 6 scenario)
    forceDeterioration() {
        this.currentTemp = 39.2;
        this.currentSpo2 = 88;
        this.notify();
    }

    // Tool to recover
    forceRecovery() {
        this.currentTemp = 36.5;
        this.currentSpo2 = 98;
        this.notify();
    }
}

export const vitalMonitor = new VitalSignMonitor();
