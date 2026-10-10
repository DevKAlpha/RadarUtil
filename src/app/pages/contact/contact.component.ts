import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { requiredText } from '../../shared/form-validators';

@Component({ selector: 'app-contact', imports: [ReactiveFormsModule, RouterLink], templateUrl: './contact.component.html' })
export class ContactComponent {
  private readonly builder = inject(FormBuilder);
  readonly sent = signal(false);
  readonly form = this.builder.nonNullable.group({
    nombre: ['', requiredText], email: ['', [Validators.required, Validators.email]],
    asunto: ['', requiredText], mensaje: ['', requiredText]
  });

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) this.sent.set(true);
  }
}
