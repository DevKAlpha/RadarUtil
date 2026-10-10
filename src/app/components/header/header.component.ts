import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { NoticeService } from '../../services/notice.service';

@Component({ selector: 'app-header', imports: [RouterLink, RouterLinkActive], templateUrl: './header.component.html' })
export class HeaderComponent {
  readonly router = inject(Router);
  readonly activeOptions = { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' } as const;
  readonly favorites = inject(FavoritesService);
  readonly notice = inject(NoticeService);
  menuOpen = false;
}
