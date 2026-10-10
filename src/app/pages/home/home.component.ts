import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OpportunityCardComponent } from '../../components/opportunity-card/opportunity-card.component';
import { OpportunitiesService } from '../../services/opportunities.service';

@Component({ selector: 'app-home', imports: [FormsModule, RouterLink, OpportunityCardComponent], templateUrl: './home.component.html' })
export class HomeComponent {
  readonly opportunities = inject(OpportunitiesService);
  private readonly router = inject(Router);
  readonly featured = computed(() => this.opportunities.all().filter(item => [1, 2, 3, 4, 5, 6].includes(Number(item.id))));
  query = '';

  search(): void { void this.router.navigate(['/explorar'], { queryParams: { q: this.query.trim() || null } }); }
}
