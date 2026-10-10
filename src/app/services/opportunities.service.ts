import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Opportunity, OpportunityId, PublicationInput, isOpportunity, normalizeOpportunity } from '../models/opportunity';
import { StorageService } from './storage.service';
import { FavoritesService } from './favorites.service';
import { NoticeService } from './notice.service';

@Injectable({ providedIn: 'root' })
export class OpportunitiesService {
  private readonly key = 'radar_util_publicaciones';
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly favorites = inject(FavoritesService);
  private readonly notice = inject(NoticeService);
  private readonly base = signal<Opportunity[]>([]);
  private readonly publications = signal<Opportunity[]>(this.readLocal());
  readonly local = this.publications.asReadonly();
  readonly all = computed(() => [...this.local(), ...this.base()]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    // HttpClient resuelve assets respecto al base href, incluido /RadarUtil/.
    this.http.get<unknown>('assets/data/oportunidades.json').subscribe({
      next: value => {
        if (!Array.isArray(value) || !value.every(isOpportunity)) {
          this.failLoading();
          return;
        }
        this.base.set(value.map(normalizeOpportunity));
        this.loading.set(false);
      },
      error: () => this.failLoading()
    });
    window.addEventListener('storage', event => {
      if (event.key === this.key || event.key === null) this.publications.set(this.readLocal());
    });
  }

  private readLocal(): Opportunity[] {
    return this.storage.readArray(this.key).filter(isOpportunity)
      .filter(item => typeof item.id === 'string' && item.id.startsWith('user-')).map(normalizeOpportunity);
  }

  private failLoading(): void {
    this.error.set('No se pudieron cargar las oportunidades. Intenta actualizar la página.');
    this.loading.set(false);
  }

  find(id: string): Opportunity | undefined { return this.all().find(item => String(item.id) === id); }

  create(input: PublicationInput): boolean {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const opportunity: Opportunity = normalizeOpportunity({ ...input, id: `user-${crypto.randomUUID()}`,
      titulo: input.titulo.trim(), descripcion: input.descripcion.trim(), descripcionCompleta: input.descripcion.trim(),
      costo: 'Gratis', fechaPublicacion: today, fechaApertura: today, duracion: 'Por definir',
      requisitos: ['Consultar requisitos en la convocatoria'] });
    const items = [opportunity, ...this.local()];
    if (!this.storage.writeArray(this.key, items)) return false;
    this.publications.set(items);
    this.notice.show('Oportunidad publicada correctamente.');
    return true;
  }

  deleteLocal(id: OpportunityId): void {
    // Solo elimina registros del navegador; los datos originales no se modifican.
    if (!this.local().some(item => item.id === id)) return;
    const items = this.local().filter(item => item.id !== id);
    if (!this.storage.writeArray(this.key, items)) return;
    this.publications.set(items);
    this.favorites.remove(id);
    this.notice.show('Publicación eliminada.');
  }
}
