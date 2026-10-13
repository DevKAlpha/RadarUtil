import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = new URL(process.env.BOCA_TEST_URL || 'http://localhost:8088/boca/');
if (!['localhost', '127.0.0.1'].includes(base.hostname)) throw new Error('Las pruebas que crean datos solo se ejecutan en localhost.');
const password = process.env.BOCA_TEST_PASSWORD || 'boca';
const hash = value => createHash('sha256').update(value).digest('hex');
const checks = [];
function pass(name) { checks.push({ name, passed: true }); console.log(`OK: ${name}`); }
class Session {
  cookies = new Map();
  async request(path, options = {}) {
    const headers = new Headers(options.headers);
    if (this.cookies.size) headers.set('Cookie', [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; '));
    const response = await fetch(new URL(path, base), { ...options, headers, redirect: 'manual', signal: AbortSignal.timeout(30000) });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';')[0];
      const split = pair.indexOf('=');
      this.cookies.set(pair.slice(0, split), pair.slice(split + 1));
    }
    const text = await response.text();
    assert.equal(response.status, 200, `Respuesta HTTP en ${path}`);
    assert.doesNotMatch(text, /Fatal error:|Warning:|Unable to exec SQL|Unable to connect to database/);
    return text;
  }
  async login(user, role) {
    await this.request('index.php');
    const sessionId = (await this.request('index.php?getsessionid=1')).trim();
    assert.match(sessionId, /^[a-zA-Z0-9,-]+$/);
    await this.request(`index.php?${new URLSearchParams({ name: user, password: hash(hash(password) + sessionId) })}`);
    const html = await this.request(`${role}/index.php`);
    assert.match(html, new RegExp(`Username: ${user}`));
    return html;
  }
  post(path, values) { return this.request(path, { method: 'POST', body: new URLSearchParams(values) }); }
  multipart(path, values, files) {
    const body = new FormData();
    for (const [key, value] of Object.entries(values)) body.append(key, value);
    for (const [key, file] of Object.entries(files)) body.append(key, new Blob([file.bytes], { type: file.type }), file.name);
    return this.request(path, { method: 'POST', body });
  }
}
function inputValues(html) {
  const result = {};
  for (const [tag] of html.matchAll(/<input\b[^>]*>/gi)) {
    const attributes = {};
    for (const match of tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
    if (attributes.name && !['submit', 'reset', 'button', 'file'].includes(attributes.type)) result[attributes.name] = attributes.value || '';
  }
  return result;
}

const guest = new Session();
const loginPage = await guest.request('index.php');
assert.match(loginPage, /BOCA.*1\.5\.24/);
assert.match(loginPage, /custom\/radar-boca\.js/);
pass('Login real y punto de carga JavaScript');
const css = await guest.request('Css.php');
assert.match(css, /--boca-blue/);
const javascript = await guest.request('custom/radar-boca.js');
assert.match(javascript, /boca-login-card/);
const svg = await guest.request('custom/marca-boca.svg');
assert.match(svg, /<svg/);
await guest.request('sha256.js');
await guest.request('hex.js');
pass('CSS, JavaScript propio, JavaScript original y recurso gráfico');
const denied = await fetch(new URL('private/conf.php', base));
assert.equal(denied.status, 403);
const unauthorized = await guest.request('admin/user.php');
assert.doesNotMatch(unauthorized, /Username: admin/);
pass('Configuración privada protegida y acceso administrativo sin sesión rechazado');

const system = new Session();
await system.login('system', 'system');
pass('Autenticación system con el algoritmo original de BOCA');
const newContest = await system.request('system/contest.php?new=1');
const contest = newContest.match(/contest\.php\?contest=(\d+)/)?.[1];
assert.ok(contest, 'BOCA debe devolver el ID de la nueva competencia');
let contestPage = await system.request(`system/contest.php?contest=${contest}`);
const values = inputValues(contestPage);
const contestStart = new Date(Date.UTC(Number(values.startdatey), Number(values.startdatem) - 1, Number(values.startdated), Number(values.startdateh), Number(values.startdatemin)) - 15 * 60000);
Object.assign(values, { contest, name: 'Entrega Front-end BOCA', duration: '360', confirmation: 'confirm', Submit3: 'Send' });
Object.assign(values, { startdatey: String(contestStart.getUTCFullYear()), startdatem: String(contestStart.getUTCMonth() + 1),
  startdated: String(contestStart.getUTCDate()), startdateh: String(contestStart.getUTCHours()), startdatemin: String(contestStart.getUTCMinutes()) });
// BOCA acepta una actualización solo si su timestamp supera al de creación.
await new Promise(resolve => setTimeout(resolve, 1100));
await system.post('system/contest.php', values);
contestPage = await system.request(`system/contest.php?contest=${contest}`);
assert.match(contestPage, /Entrega Front-end BOCA/);
assert.equal(inputValues(contestPage).duration, '360');
pass('Creación y edición persistente de competencia por el formulario original');
await system.post('system/contest.php', { ...values, Submit3: 'Activate' });
const activated = await system.request(`system/contest.php?contest=${contest}`);
assert.match(activated, new RegExp(`<option[^>]*value="${contest}"[^>]*>${contest}\\*`));
pass('Activación de competencia');

const admin = new Session();
await admin.login('admin', 'admin');
for (const path of ['admin/user.php', 'admin/problem.php', 'admin/contest.php', 'admin/run.php', 'admin/score.php', 'admin/clar.php']) {
  const page = await admin.request(path);
  assert.match(page, /Username: admin/);
}
pass('Login admin y navegación de usuarios, problemas, competencia, envíos, resultados y aclaraciones');
const siteValues = inputValues(await admin.request('admin/site.php?site=1'));
const siteStart = new Date(Date.UTC(Number(siteValues.startdatey), Number(siteValues.startdatem) - 1, Number(siteValues.startdated), Number(siteValues.startdateh), Number(siteValues.startdatemin)) - 15 * 60000);
delete siteValues.autojudge;
Object.assign(siteValues, { site: '1', confirmation: 'confirm', Submit1: 'Send', active: 't', autoend: 't',
  startdatey: String(siteStart.getUTCFullYear()), startdatem: String(siteStart.getUTCMonth() + 1), startdated: String(siteStart.getUTCDate()),
  startdateh: String(siteStart.getUTCHours()), startdatemin: String(siteStart.getUTCMinutes()) });
await new Promise(resolve => setTimeout(resolve, 1100));
await admin.post('admin/site.php', siteValues);
assert.match(await admin.request('admin/run.php'), /&nbsp;[^<]*left&nbsp;/);
pass('Configuración de la sede y competencia realmente en curso');
const users = `[user]\nusersitenumber=1\nusernumber=101\nusername=teamradar\nusericpcid=101\nusertype=team\nuserenabled=t\nusermultilogin=t\nuserfullname=Equipo Radar\nuserdesc=Equipo de prueba universitario\nuserip=\nuserpassword=${password}\nuserchangepassword=f\n\nusersitenumber=1\nusernumber=102\nusername=juezradar\nusericpcid=102\nusertype=judge\nuserenabled=t\nusermultilogin=t\nuserfullname=Juez de prueba\nuserdesc=Juez de prueba universitario\nuserip=\nuserpassword=${password}\nuserchangepassword=f\n`;
await admin.multipart('admin/user.php', { confirmation: 'confirm', Submit: 'Import' }, { importfile: { bytes: users, type: 'text/plain', name: 'usuarios-prueba.txt' } });
const userPage = await admin.request('admin/user.php');
assert.match(userPage, /teamradar/);
assert.match(userPage, /juezradar/);
pass('Importación real y persistencia de un equipo y un juez');
const problemZip = readFileSync(new URL('../upstream/doc/problemexamples/bits.zip', import.meta.url));
await admin.multipart('admin/problem.php', { confirmation: 'confirm', Submit3: 'Send', problemnumber: '1', problemname: 'A',
  colorname: 'Azul Radar', color: '087BF0', autojudge_new_sel: 'none' }, {
  probleminput: { bytes: problemZip, type: 'application/zip', name: 'bits.zip' }
});
const problems = await admin.request('admin/problem.php');
assert.match(problems, /bits\.zip/);
assert.doesNotMatch(problems, /PROBLEM PACKAGE SEEMS INVALID|ERROR READING FROM DATABASE/);
pass('Carga multipart y lectura del paquete oficial de problema bits.zip');

const team = new Session();
await team.login('teamradar', 'team');
let teamPage = await team.request('team/run.php');
assert.match(teamPage, /<select name="problem"[^>]*>[\s\S]*?<option value="1">A<\/option>/);
pass('Login del equipo y acceso al formulario original de envío');
const source = '#include <stdio.h>\nint main(void) { unsigned n; while(scanf("%u",&n)==1) { unsigned count=0; for(;n;n>>=1) count+=n&1; printf("%u\\n",count); } return 0; }\n';
const submissionResponse = await team.multipart('team/run.php', { confirmation: 'confirm', Submit: 'Send', problem: '1', language: '1' }, {
  sourcefile: { bytes: source, type: 'text/plain', name: 'solucion.c' }
});
assert.doesNotMatch(submissionResponse, /contest is not started|File size exceeds|Could not save/);
teamPage = await team.request('team/run.php');
const runs = await admin.request('admin/run.php');
const runMatch = runs.match(/runedit\.php\?runnumber=(\d+)&(?:amp;)?runsitenumber=(\d+)/);
assert.ok(runMatch, 'El administrador debe poder abrir el envío recibido');
pass('Envío real de código y consulta desde administración');
const judge = new Session();
await judge.login('juezradar', 'judge');
const judgePage = await judge.request('judge/run.php');
assert.match(judgePage, /Username: juezradar/);
pass('Login del juez y acceso al listado original de envíos');
const review = await admin.request(`admin/runedit.php?runnumber=${runMatch[1]}&runsitenumber=${runMatch[2]}`);
assert.match(review, /solucion\.c/);
await admin.post('admin/runedit.php', { confirmation: 'confirm', Submit: 'Judge', answer: '1', number: runMatch[1], sitenumber: runMatch[2] });
const result = await admin.request('admin/run.php');
assert.match(result, /YES/);
const scoreboard = await team.request('team/score.php');
assert.match(scoreboard, /Equipo Radar/);
pass('Evaluación manual original y actualización de resultados');
await team.request('index.php');
const loggedOut = await team.request('team/run.php');
assert.doesNotMatch(loggedOut, /Username: teamradar/);
pass('Cierre de sesión y protección del área del equipo');

const report = { date: new Date().toISOString(), baseUrl: base.href, bocaVersion: '1.5.24', contest: Number(contest), run: Number(runMatch[1]),
  testUsers: ['system', 'admin', 'teamradar', 'juezradar'], automaticJudgingTested: false, checks };
const resultDirectory = fileURLToPath(new URL('./resultados-locales/', import.meta.url));
mkdirSync(resultDirectory, { recursive: true });
writeFileSync(`${resultDirectory}/verificacion.json`, JSON.stringify(report, null, 2));
console.log(`Verificación completada: ${checks.length} comprobaciones; competencia ${contest}, envío ${runMatch[1]}.`);
