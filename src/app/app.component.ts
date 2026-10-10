import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NoticeService } from './services/notice.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `<app-header /><main><router-outlet /></main><app-footer />
    <div class="toast" [class.show]="notice.message()" role="status" aria-live="polite">{{ notice.message() }}</div>`
})
export class AppComponent {
  readonly notice = inject(NoticeService);
}
