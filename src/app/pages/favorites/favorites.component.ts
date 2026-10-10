import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OpportunityCardComponent } from '../../components/opportunity-card/opportunity-card.component';
import { FavoritesService } from '../../services/favorites.service';
import { OpportunitiesService } from '../../services/opportunities.service';

@Component({ selector: 'app-favorites', imports: [RouterLink, OpportunityCardComponent], templateUrl: './favorites.component.html' })
export class FavoritesComponent {
  readonly opportunities = inject(OpportunitiesService);
  private readonly favorites = inject(FavoritesService);
  readonly saved = computed(() => this.opportunities.all().filter(item => this.favorites.has(item.id)));
}
