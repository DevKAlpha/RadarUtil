import { Component, computed, inject, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { OpportunitiesService } from '../../services/opportunities.service';
import { FavoritesService } from '../../services/favorites.service';
import { NoticeService } from '../../services/notice.service';
import { Opportunity } from '../../models/opportunity';
import { OpportunityDatePipe } from '../../shared/opportunity-date.pipe';

@Component({ selector: 'app-detail', imports: [RouterLink, OpportunityDatePipe], templateUrl: './detail.component.html' })
export class DetailComponent {
  readonly opportunities = inject(OpportunitiesService);
  readonly favorites = inject(FavoritesService);
  private readonly notice = inject(NoticeService);
  private readonly title = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly opportunity = computed(() => this.opportunities.find(this.params().get('id') || ''));

  constructor() {
    effect(() => this.title.setTitle(`${this.opportunity()?.titulo || 'Detalle'} | Radar Útil`));
  }

  openCall(event: Event, opportunity: Opportunity): void {
    if (opportunity.url === '#') {
      event.preventDefault();
      this.notice.show('En esta versión académica la convocatoria es demostrativa.');
    }
  }
}
