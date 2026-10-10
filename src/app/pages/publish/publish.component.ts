import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CATEGORIES, MODALITIES, Category } from '../../models/opportunity';
import { OpportunitiesService } from '../../services/opportunities.service';
import { NoticeService } from '../../services/notice.service';
import { OpportunityDatePipe } from '../../shared/opportunity-date.pipe';
import { requiredText, httpUrl, validDate, oneOf } from '../../shared/form-validators';

@Component({ selector: 'app-publish', imports: [ReactiveFormsModule, OpportunityDatePipe], templateUrl: './publish.component.html' })
export class PublishComponent {
  readonly opportunities = inject(OpportunitiesService);
  private readonly notice = inject(NoticeService);
  private readonly builder = inject(FormBuilder);
  readonly form = this.builder.nonNullable.group({
    titulo: ['', requiredText], categoria: ['', [Validators.required, oneOf(CATEGORIES)]],
    descripcion: ['', requiredText], modalidad: ['', [Validators.required, oneOf(MODALITIES)]],
    fechaLimite: ['', [Validators.required, validDate]], url: ['', [Validators.required, httpUrl]]
  });
  readonly imageError = signal('');
  readonly readingImage = signal(false);
  private image = '';
  private imageInput?: HTMLInputElement;

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  readImage(event: Event): void {
    this.imageInput = event.target as HTMLInputElement;
    this.image = '';
    this.imageError.set('');
    const file = this.imageInput.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      this.imageError.set('Selecciona una imagen PNG, JPG, WebP o GIF de máximo 2 MB.');
      return;
    }
    this.readingImage.set(true);
    const reader = new FileReader();
    reader.onload = () => { this.image = String(reader.result); this.readingImage.set(false); };
    reader.onerror = () => { this.imageError.set('No se pudo leer la imagen.'); this.readingImage.set(false); };
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.imageError() || this.readingImage()) {
      this.notice.show('Completa los campos obligatorios con datos válidos.');
      return;
    }
    const value = this.form.getRawValue();
    if (this.opportunities.create({ ...value, categoria: value.categoria as Category, imagen: this.image })) {
      this.form.reset();
      this.image = '';
      if (this.imageInput) this.imageInput.value = '';
    }
  }
}
