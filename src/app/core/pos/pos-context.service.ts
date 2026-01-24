import { Injectable, computed, signal } from '@angular/core';

export type PosContext = {
  sucursalId?: number;
  cajaId?: number;
  turnoId?: number;
};

const STORAGE_KEY = 'pos.context';

@Injectable({ providedIn: 'root' })
export class PosContextService {
  private _ctx = signal<PosContext>(this.load());
  ctx = this._ctx.asReadonly();

  // helpers para templates (devuelven null si no está seteado)
  sucursalId = computed(() => this._ctx().sucursalId ?? null);
  cajaId = computed(() => this._ctx().cajaId ?? null);
  turnoId = computed(() => this._ctx().turnoId ?? null);

  setSucursalId(sucursalId: number | null | undefined) {
    this.patch({ sucursalId: sucursalId ?? undefined });
  }

  setCajaId(cajaId: number | null | undefined) {
    this.patch({ cajaId: cajaId ?? undefined });
  }

  setTurnoId(turnoId: number | null | undefined) {
    this.patch({ turnoId: turnoId ?? undefined });
  }

  clearTurno() {
    this.patch({ turnoId: undefined });
  }

  private patch(partial: Partial<PosContext>) {
    const next = { ...this._ctx(), ...partial };
    this._ctx.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private load(): PosContext {
    // Backward compatible: some older builds stored only cajaId in 'pos.cajaId'
    const legacyCajaId = localStorage.getItem('pos.cajaId');
    let legacyCaja: number | undefined;
    if (legacyCajaId) {
      const n = Number(legacyCajaId);
      if (!Number.isNaN(n) && n > 0) legacyCaja = n;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return legacyCaja ? { cajaId: legacyCaja } : {};
      const parsed = JSON.parse(raw) as PosContext;
      return {
        sucursalId: parsed?.sucursalId,
        cajaId: parsed?.cajaId ?? legacyCaja,
        turnoId: parsed?.turnoId,
      };
    } catch {
      return legacyCaja ? { cajaId: legacyCaja } : {};
    }
  }
}
