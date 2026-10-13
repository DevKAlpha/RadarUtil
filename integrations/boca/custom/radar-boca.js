(() => {
  'use strict';
  // Solo organiza la presentación. Los nombres, eventos y acciones de BOCA se conservan.
  const body = document.body;
  body.classList.add('radar-boca');
  const viewport = document.querySelector('meta[name="viewport"]') || document.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = 'width=device-width, initial-scale=1';
  if (!viewport.parentNode) document.head.append(viewport);
  const base = new URL('.', document.currentScript.src);
  const brand = document.createElement('header');
  brand.className = 'boca-brand';
  const icon = document.createElement('img');
  icon.src = new URL('marca-boca.svg', base).href;
  icon.alt = 'BOCA';
  const brandText = document.createElement('div');
  brandText.innerHTML = '<strong>BOCA</strong><span>Competencias de programación</span>';
  const credit = document.createElement('span');
  credit.className = 'boca-identity';
  credit.textContent = 'Interfaz Radar Útil';
  brand.append(icon, brandText, credit);
  body.prepend(brand);
  const login = document.querySelector('form[name="form1"][action="javascript:computeHASH()"]');
  if (login) {
    body.classList.add('boca-login');
    login.classList.add('boca-login-card');
    const title = document.createElement('h1');
    title.textContent = 'Acceso a la competencia';
    const intro = document.createElement('p');
    intro.className = 'boca-intro';
    intro.textContent = 'Ingresa con el usuario asignado por la administración.';
    login.prepend(title, intro);
    const name = login.elements.namedItem('name');
    const password = login.elements.namedItem('password');
    name.setAttribute('aria-label', 'Usuario');
    name.autocomplete = 'username';
    password.setAttribute('aria-label', 'Contraseña');
    password.autocomplete = 'current-password';
  } else {
    const links = [...document.querySelectorAll('a.menu')];
    const nav = links[0]?.closest('table');
    if (nav) {
      nav.classList.add('boca-nav');
      nav.setAttribute('aria-label', 'Navegación de BOCA');
      const status = nav.previousElementSibling;
      if (status?.tagName === 'TABLE') status.classList.add('boca-status');
      links.forEach(link => {
        if (new URL(link.href).pathname === location.pathname) {
          link.classList.add('boca-current');
          link.setAttribute('aria-current', 'page');
        }
      });
      const titles = {
        'contest.php': ['Competencia', 'Configuración original de la competencia y sus tiempos.'],
        'user.php': ['Usuarios y equipos', 'Administración de participantes, equipos y jueces.'],
        'problem.php': ['Problemas', 'Paquetes de problemas y datos de la competencia.'],
        'run.php': ['Envíos', 'Consulta y seguimiento de las soluciones recibidas.'],
        'runedit.php': ['Revisión de un envío', 'Evaluación del código mediante las funciones originales de BOCA.'],
        'score.php': ['Resultados', 'Clasificación calculada por BOCA.'],
        'clar.php': ['Aclaraciones', 'Comunicación sobre los problemas de la competencia.'],
        'option.php': ['Opciones', 'Configuración del usuario actual.'],
        'site.php': ['Sede', 'Administración de la sede y del desarrollo de la competencia.']
      };
      const filename = location.pathname.split('/').pop();
      const [heading, description] = titles[filename] || ['Panel de BOCA', 'Utiliza la navegación para acceder a las funciones de tu perfil.'];
      const introduction = document.createElement('section');
      introduction.className = 'boca-page-heading';
      const h1 = document.createElement('h1');
      h1.textContent = heading;
      const p = document.createElement('p');
      p.textContent = description;
      introduction.append(h1, p);
      nav.after(introduction);
    }
    document.querySelectorAll('table').forEach(table => {
      if (table.classList.contains('boca-status') || table.classList.contains('boca-nav')) return;
      if (table.getAttribute('border') === '1' && table.rows[0]?.cells.length >= 3) {
        table.classList.add('boca-data');
        const wrapper = document.createElement('div');
        wrapper.className = 'boca-table-scroll';
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', 'Tabla de BOCA; desplázate horizontalmente para ver todas las columnas');
        table.before(wrapper);
        wrapper.append(table);
      }
    });
    document.querySelectorAll('form').forEach(form => form.classList.add('boca-form'));
    document.querySelectorAll('input,select,textarea').forEach(field => {
      if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') return;
      if (!field.getAttribute('aria-label') && !field.labels?.length) {
        const cell = field.closest('td');
        const label = cell?.previousElementSibling?.textContent.trim();
        if (label) field.setAttribute('aria-label', label);
      }
    });
  }
  const copyright = [...document.querySelectorAll('font')].find(element => element.textContent.startsWith('Powered by BOCA'));
  if (copyright) copyright.classList.add('boca-copyright');
})();
