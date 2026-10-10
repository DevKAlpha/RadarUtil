import { Injectable, inject, signal } from '@angular/core';
import { OpportunityId } from '../models/opportunity';
import { StorageService } from './storage.service';
import { NoticeService } from './notice.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly key = 'radar_util_favoritos';
  private readonly storage = inject(StorageService);
  private readonly notice = inject(NoticeService);
  private readonly storedIds = signal<string[]>(this.read());
  readonly ids = this.storedIds.asReadonly();

  constructor() {
    // Conserva la clave anterior y sincroniza cambios realizados en otras pestañas.
    window.addEventListener('storage', event => {
      if (event.key === this.key || event.key === null) this.storedIds.set(this.read());
    });
  }

  private read(): string[] {
    return [...new Set(this.storage.readArray(this.key)
      .filter(id => typeof id === 'string' || typeof id === 'number').map(String))];
  }

  has(id: OpportunityId): boolean { return this.ids().includes(String(id)); }

  add(id: OpportunityId): boolean {
    if (this.has(id)) return true;
    return this.save([...this.ids(), String(id)]);
  }

  remove(id: OpportunityId): boolean { return this.save(this.ids().filter(value => value !== String(id))); }

  toggle(id: OpportunityId): void {
    const saved = this.has(id);
    if (saved ? this.remove(id) : this.add(id)) {
      this.notice.show(saved ? 'Oportunidad eliminada de favoritos.' : 'Oportunidad agregada a favoritos.');
    }
  }

  private save(ids: string[]): boolean {
    if (!this.storage.writeArray(this.key, ids)) return false;
    this.storedIds.set(ids);
    return true;
  }
}
