import { test, expect } from '@playwright/test';

async function navigate(page, label) {
  const toggle = page.getByRole('button', { name: 'Abrir menú' });
  if (await toggle.isVisible()) await toggle.click();
  await page.locator('.main-nav').getByRole('link', { name: label, exact: true }).click();
}

test('Inicio, navegación, recursos y distribución responsive', async ({ page, request }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  await page.goto('');
  await expect(page.locator('#featured-grid .opportunity-card')).toHaveCount(6);
  await expect(page.getByRole('heading', { name: 'Encuentra oportunidades que sí te sirven' })).toBeVisible();
  await expect(page.locator('.hero-banner img')).toHaveAttribute('src', 'assets/hero-banner-hd.webp');
  for (const [label, route] of [['Explorar', 'explorar'], ['Favoritos', 'favoritos'], ['Publicar', 'publicar'], ['Contacto', 'contacto'], ['Inicio', '']]) {
    await navigate(page, label);
    await expect(page).toHaveURL(new RegExp(`#/${route}$`));
    await expect(page.locator('.main-nav a.active')).toHaveText(label);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (route === '') await expect(page.locator('.opportunity-card')).toHaveCount(6);
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath(`${route || 'inicio'}.png`), fullPage: true });
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  }
  expect((await request.get('assets/favicon.svg')).status()).toBe(200);
  expect((await request.get('assets/data/oportunidades.json')).status()).toBe(200);
  expect(await page.locator('base').getAttribute('href')).toBe('/RadarUtil/');
  expect(errors).toEqual([]);
});

test('Buscador, categorías, contador y ordenamiento sin recarga', async ({ page }) => {
  await page.goto('');
  await page.locator('#home-search input').fill('excel');
  await page.locator('#home-search').getByRole('button', { name: 'Buscar' }).click();
  await expect(page).toHaveURL(/#\/explorar\?q=excel$/);
  await expect(page.locator('.opportunity-card')).toHaveCount(2);
  await expect(page.locator('#result-count')).toHaveText('2 oportunidades encontradas');
  await page.locator('#explore-search-input').fill('');
  await expect(page.locator('.opportunity-card')).toHaveCount(12);
  const counts = { Educación: 4, Empleo: 2, Tecnología: 2, Eventos: 2, Beneficios: 2, Todas: 12 };
  await page.evaluate(() => { window.navigationMarker = 'same-document'; });
  for (const [category, count] of Object.entries(counts)) {
    await page.getByRole('button', { name: category, exact: true }).click();
    await expect(page.locator('.opportunity-card')).toHaveCount(count);
    await expect(page.locator('.main-nav a.active')).toHaveText('Explorar');
    await expect(page.getByRole('button', { name: category, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(page.locator('.card-title').first()).toHaveText('Curso de Excel avanzado');
  await page.getByRole('combobox', { name: 'Ordenar por fecha' }).selectOption('antiguas');
  await expect(page.locator('.card-title').first()).toHaveText('Hackathon Universitario 2026');
  await page.locator('#explore-search-input').fill('tecnologia');
  await expect(page.locator('.opportunity-card')).toHaveCount(2);
  await page.locator('#explore-search-input').fill('sin-resultados-000');
  await expect(page.locator('#result-count')).toHaveText('0 oportunidades encontradas');
  expect(await page.evaluate(() => window.navigationMarker)).toBe('same-document');
});

test('Detalle por ID y favoritos persistentes entre sesiones', async ({ page, browser }, testInfo) => {
  await page.goto('#/detalle/1');
  await expect(page.locator('#detail-title')).toHaveText('Beca de Excelencia 2026');
  await expect(page.locator('#requirements li')).toHaveCount(4);
  await expect(page.locator('#detail-modality')).toHaveText('Virtual');
  await expect(page.locator('#detail-cost')).toHaveText('Gratis');
  await expect(page.locator('#detail-open')).toContainText('septiembre');
  await page.locator('.detail-bottom-actions .apply-btn').click();
  await expect(page.getByRole('status')).toContainText('convocatoria es demostrativa');
  await page.locator('.detail-bottom-actions .detail-favorite').click();
  await expect(page.locator('.detail-favorite').first()).toContainText('Guardado en favoritos');
  await page.screenshot({ path: testInfo.outputPath('detalle.png'), fullPage: true });
  await page.reload();
  await expect(page.locator('.detail-favorite').first()).toContainText('Guardado en favoritos');
  const state = await page.context().storageState();
  const reopened = await browser.newContext({ storageState: state, viewport: page.viewportSize() });
  const reopenedPage = await reopened.newPage();
  await reopenedPage.goto(new URL('#/favoritos', testInfo.project.use.baseURL).href);
  await expect(reopenedPage.locator('.favorite-item')).toHaveCount(1);
  await expect(reopenedPage.locator('.favorite-item h3')).toHaveText('Beca de Excelencia 2026');
  await reopenedPage.getByRole('button', { name: 'Eliminar de favoritos' }).click();
  await expect(reopenedPage.locator('.empty-state')).toContainText('Todavía no tienes oportunidades guardadas.');
  await reopened.close();
  await page.goto('#/detalle/no-existe');
  await expect(page.getByRole('heading', { name: 'Oportunidad no encontrada' })).toBeVisible();
});

test('Publicar, validar, consultar y eliminar solo registros locales', async ({ page }) => {
  await page.goto('#/publicar');
  await page.getByRole('button', { name: 'Publicar oportunidad' }).click();
  await expect(page.locator('#publish-form .invalid')).toHaveCount(6);
  await page.getByLabel('Título de la oportunidad').fill('Oportunidad de prueba');
  await page.getByLabel('Modalidad').selectOption('Virtual');
  await page.getByLabel('Fecha límite').fill('2027-01-20');
  await page.getByLabel('Categoría', { exact: true }).selectOption('Tecnología');
  await page.getByLabel('Descripción', { exact: true }).fill('Aprende Angular en un taller universitario.');
  await page.getByLabel('Enlace de la convocatoria').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Publicar oportunidad' }).click();
  await expect(page.locator('#publish-url')).toHaveClass(/invalid/);
  await expect(page.locator('.published-item')).toHaveCount(0);
  await page.getByLabel('Enlace de la convocatoria').fill('https://example.com/convocatoria');
  await page.getByLabel('Imagen (opcional)').setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64') });
  await page.getByRole('button', { name: 'Publicar oportunidad' }).click();
  await expect(page.locator('.published-item')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.published-item')).toContainText('Oportunidad de prueba');
  await navigate(page, 'Explorar');
  await expect(page.locator('.opportunity-card')).toHaveCount(13);
  const card = page.locator('.opportunity-card').filter({ hasText: 'Oportunidad de prueba' });
  await card.getByRole('link', { name: 'Ver más' }).click();
  await expect(page.locator('#detail-title')).toHaveText('Oportunidad de prueba');
  await expect(page.locator('#detail-image')).toHaveAttribute('src', /^data:image\/png/);
  await expect(page.locator('.apply-btn').first()).toHaveAttribute('href', 'https://example.com/convocatoria');
  await page.locator('.detail-favorite').first().click();
  await navigate(page, 'Publicar');
  await expect(page.locator('.published-item')).toHaveCount(1);
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await expect(page.locator('.published-item')).toHaveCount(0);
  await navigate(page, 'Explorar');
  await expect(page.locator('.opportunity-card')).toHaveCount(12);
  await page.reload();
  await expect(page.locator('.opportunity-card')).toHaveCount(12);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('radar_util_publicaciones')))).toEqual([]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('radar_util_favoritos')))).toEqual([]);
});

test('Contacto con campos obligatorios y correo válido', async ({ page }) => {
  await page.goto('#/contacto');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.locator('#contact-form .invalid')).toHaveCount(4);
  await page.getByLabel('Nombre', { exact: true }).fill('   ');
  await page.getByLabel('Correo electrónico').fill('correo-invalido');
  await page.getByLabel('Asunto').fill('Consulta');
  await page.getByLabel('Mensaje', { exact: true }).fill('Información sobre oportunidades.');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.locator('#contact-form .invalid')).toHaveCount(2);
  await page.getByLabel('Nombre', { exact: true }).fill('Estudiante');
  await page.getByLabel('Correo electrónico').fill('estudiante@example.com');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.getByRole('heading', { name: 'Tu mensaje fue enviado correctamente.' })).toBeVisible();
});

test('Recuperación ante localStorage corrupto y fallo de JSON', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('radar_util_favoritos', '{roto');
    localStorage.setItem('radar_util_publicaciones', '{}');
  });
  await page.goto('#/explorar');
  await expect(page.locator('.opportunity-card')).toHaveCount(12);
  await page.route('**/assets/data/oportunidades.json', route => route.fulfill({ status: 503, body: '' }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar las oportunidades.');
});
