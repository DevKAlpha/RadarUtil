import { Injectable, inject } from '@angular/core';
import { NoticeService } from './notice.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly notice = inject(NoticeService);

  readArray(key: string): unknown[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }

  // Actualizamos el estado visible solo después de guardar sin errores.
  writeArray(key: string, value: unknown[]): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      this.notice.show('No se pudo guardar en este navegador. Revisa el espacio disponible o los permisos de almacenamiento.');
      return false;
    }
  }
}
