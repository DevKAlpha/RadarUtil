import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CATEGORIES, Category, normalizeSearch } from '../../models/opportunity';
import { OpportunityCardComponent } from '../../components/opportunity-card/opportunity-card.component';
import { OpportunitiesService } from '../../services/opportunities.service';

@Component({ selector: 'app-explore', imports: [FormsModule, OpportunityCardComponent], templateUrl: './explore.component.html' })
export class ExploreComponent {
  readonly opportunities = inject(OpportunitiesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly query = signal('');
  readonly category = signal('Todas');
  readonly sort = signal('recientes');

  // Las señales recalculan resultados sin recargar; la búsqueda ignora tildes y mayúsculas.
  readonly filtered = computed(() => {
    const query = normalizeSearch(this.query());
    return this.opportunities.all().filter(item =>
      (this.category() === 'Todas' || item.categoria === this.category())
      && normalizeSearch(`${item.titulo} ${item.descripcion} ${item.categoria}`).includes(query))
      .sort((a, b) => this.sort() === 'antiguas'
        ? a.fechaPublicacion.localeCompare(b.fechaPublicacion) : b.fechaPublicacion.localeCompare(a.fechaPublicacion));
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.query.set(params.get('q') || '');
      const category = params.get('categoria') || 'Todas';
      this.category.set(CATEGORIES.includes(category as Category) ? category : 'Todas');
    });
  }

  selectCategory(category: string): void { this.category.set(category); this.syncQuery(); }

  syncQuery(): void {
    void this.router.navigate([], { relativeTo: this.route, replaceUrl: true,
      queryParams: { q: this.query() || null, categoria: this.category() === 'Todas' ? null : this.category() } });
  }
}
