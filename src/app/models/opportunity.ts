export const CATEGORIES = ['Educación', 'Empleo', 'Tecnología', 'Eventos', 'Beneficios'] as const;
export const MODALITIES = ['Virtual', 'Presencial', 'Híbrida'] as const;
export type Category = typeof CATEGORIES[number];
export type OpportunityId = number | string;

export interface Opportunity {
  id: OpportunityId;
  titulo: string;
  categoria: Category;
  descripcion: string;
  descripcionCompleta: string;
  modalidad: string;
  costo: string;
  fechaPublicacion: string;
  fechaApertura: string;
  fechaLimite: string;
  duracion: string;
  requisitos: string[];
  imagen: string;
  url: string;
  etiqueta?: string;
  icono?: string;
}

export interface PublicationInput {
  titulo: string;
  categoria: Category;
  descripcion: string;
  modalidad: string;
  fechaLimite: string;
  url: string;
  imagen: string;
}

// Acepta los registros locales de la versión anterior, que no siempre tenían imagen.
export function isOpportunity(value: unknown): value is Opportunity {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (typeof item['id'] === 'string' || typeof item['id'] === 'number')
    && ['titulo', 'categoria', 'descripcion', 'modalidad', 'costo', 'fechaPublicacion', 'fechaApertura', 'fechaLimite', 'url']
      .every(field => typeof item[field] === 'string')
    && CATEGORIES.includes(item['categoria'] as Category)
    && Array.isArray(item['requisitos']) && item['requisitos'].every(entry => typeof entry === 'string');
}

export function normalizeOpportunity(item: Opportunity): Opportunity {
  return { ...item, imagen: safeImage(item.imagen), url: safeLink(item.url),
    descripcionCompleta: item.descripcionCompleta || item.descripcion, duracion: item.duracion || 'Por definir' };
}

export function safeLink(value: string): string {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '#';
  } catch { return '#'; }
}

export function safeImage(value: string): string {
  return /^(assets\/[\w.-]+\.(svg|webp|png|jpg)|data:image\/(png|jpeg|webp|gif);base64,)/i.test(value || '')
    ? value : 'assets/card-tech.svg';
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
