import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Opportunity } from '../../models/opportunity';
import { FavoritesService } from '../../services/favorites.service';
import { OpportunityDatePipe } from '../../shared/opportunity-date.pipe';

@Component({
  selector: 'app-opportunity-card',
  imports: [RouterLink, OpportunityDatePipe],
  templateUrl: './opportunity-card.component.html',
  styles: [':host { display: block; min-width: 0; } .opportunity-card { height: 100%; }']
})
export class OpportunityCardComponent {
  readonly opportunity = input.required<Opportunity>();
  readonly mode = input<'home' | 'explore' | 'favorite'>('explore');
  readonly favorites = inject(FavoritesService);
}
