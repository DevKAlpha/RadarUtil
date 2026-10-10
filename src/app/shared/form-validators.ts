import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { safeLink } from '../models/opportunity';

export const requiredText = [Validators.required, Validators.pattern(/\S/)];
export const httpUrl: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  safeLink(String(control.value || '').trim()) === '#' ? { httpUrl: true } : null;

export const validDate: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value || '');
  const date = new Date(value + 'T00:00:00Z');
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? null : { date: true };
};

export function oneOf(values: readonly string[]): ValidatorFn {
  return (control: AbstractControl) => values.includes(control.value) ? null : { option: true };
}
