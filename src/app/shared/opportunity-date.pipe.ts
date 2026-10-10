import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'opportunityDate' })
export class OpportunityDatePipe implements PipeTransform {
  transform(value: string): string {
    const date = new Date(value + 'T00:00:00');
    return !value || Number.isNaN(date.getTime()) ? 'Sin fecha'
      : new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }
}
