const PAGE_SIZE = 50;
const REQUIRED = ['CLIENTE','NOMBRE','CREDITO','MONTO ORIGINAL','SALDO ACTUAL','USUARIO','FECHA DE PAGO'];
const db = supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseKey);
const $ = id => document.getElementById(id);
let page = 0, total = 0, searchTerm = '', role = '', searchTimer, loadRequestId = 0;

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  const {data: {session}} = await db.auth.getSession();
  if (!session) return window.location.replace('index.html');
  const {data: profile, error} = await db.from('perfiles_gestor').select('usuario,rol,activo').single();
  if (error || !profile?.activo) {
    await db.auth.signOut();
    return window.location.replace('index.html');
  }
  role = profile.rol;
  $('roleBadge').textContent = role === 'administrador' ? 'Administrador' : 'Consulta';
  $('adminTab').hidden = role !== 'administrador';
  configureEvents();
  await Promise.all([loadStatus(), loadRows()]);
}

function configureEvents() {
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    tab.classList.add('active'); $(tab.dataset.panel).classList.add('active');
  }));
  $('logoutBtn').onclick = async () => { await db.auth.signOut(); window.location.replace('index.html'); };
  $('searchBtn').onclick = () => { clearTimeout(searchTimer); searchTerm = $('searchInput').value.trim(); page = 0; loadRows(); };
  $('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTerm = $('searchInput').value.trim();
      page = 0;
      loadRows();
    }, 350);
  });
  $('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('searchBtn').click(); });
  $('allBtn').onclick = () => { clearTimeout(searchTimer); $('searchInput').value = ''; searchTerm = ''; page = 0; loadRows(); };
  $('prevBtn').onclick = () => { if (page > 0) { page--; loadRows(); } };
  $('nextBtn').onclick = () => { if ((page + 1) * PAGE_SIZE < total) { page++; loadRows(); } };
  $('uploadBtn').onclick = uploadPortfolio;
}

async function loadStatus() {
  const {data, error} = await db.from('estado_cartera').select('archivo,total_registros,actualizado_at').eq('id', 1).maybeSingle();
  if (error || !data) {
    $('statusText').textContent = error ? 'No disponible' : 'Sin cartera cargada';
    return;
  }
  $('statusText').textContent = data.actualizado_at ? `Actualizada ${new Date(data.actualizado_at).toLocaleDateString('es-GT')}` : 'Disponible';
  $('totalRecords').textContent = new Intl.NumberFormat('es-GT').format(data.total_registros || 0);
  $('currentFile').textContent = data.archivo || 'Sin información';
}

async function loadRows() {
  const requestId = ++loadRequestId;
  $('tbody').innerHTML = '<tr><td colspan="8" class="empty">Cargando…</td></tr>';
  const from = page * PAGE_SIZE, to = from + PAGE_SIZE - 1;
  let query = db.from('cartera_creditos').select('cliente,nombre,credito,monto_original,saldo_actual,usuario,fecha_pago', {count: 'exact'});
  if (searchTerm) {
    const safe = searchTerm.replace(/[%,]/g, ' ').trim();
    query = query.or(`nombre.ilike.%${safe}%,credito.ilike.%${safe}%,cliente.ilike.%${safe}%`);
  }
  const {data, error, count} = await query.order('nombre').range(from, to);
  if (requestId !== loadRequestId) return;
  if (error) return showMessage('searchMessage', `No fue posible consultar la cartera: ${error.message}`, 'error');
  total = count || 0; renderRows(data || []); updatePager();
}

function renderRows(rows) {
  const body = $('tbody'); body.replaceChildren();
  if (!rows.length) body.innerHTML = '<tr><td colspan="8" class="empty">No se encontraron registros.</td></tr>';
  rows.forEach(item => {
    const tr = document.createElement('tr');
    const labels = ['Cliente','Nombre','Crédito','Monto original','Saldo actual','Usuario','Fecha de pago'];
    [item.cliente,item.nombre,formatCredit(item.credito),money(item.monto_original),money(item.saldo_actual),item.usuario,item.fecha_pago].forEach((value, index) => {
      const td = document.createElement('td'); td.dataset.label = labels[index]; td.textContent = value ?? ''; tr.appendChild(td);
    });
    const td = document.createElement('td'), button = document.createElement('button');
    button.className = 'copy'; button.textContent = 'Copiar';
    button.onclick = async () => { await navigator.clipboard.writeText(`CREDITO ${formatCredit(item.credito)} ${item.nombre || ''}`); button.textContent = '¡Copiado!'; setTimeout(() => button.textContent = 'Copiar', 1500); };
    td.dataset.label = 'Acción'; td.appendChild(button); tr.appendChild(td); body.appendChild(tr);
  });
}

function updatePager() {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  $('resultsCount').textContent = `${total} registro${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`;
  $('pageInfo').textContent = `Página ${page + 1} de ${pages}`;
  $('prevBtn').disabled = page === 0; $('nextBtn').disabled = page + 1 >= pages;
}

async function uploadPortfolio() {
  if (role !== 'administrador') return showMessage('uploadMessage', 'No tienes permiso para cargar la cartera.', 'error');
  const file = $('excelFile').files[0];
  if (!file) return showMessage('uploadMessage', 'Selecciona un archivo Excel.', 'error');
  $('uploadBtn').disabled = true; showMessage('uploadMessage', 'Procesando archivo…', 'info');
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), {type: 'array', cellDates: false});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(worksheet, {defval: '', raw: true});
    if (!rows.length) throw new Error('El archivo no contiene registros.');
    rows = rows.map(normalizeRow);
    const missing = REQUIRED.filter(column => !(column in rows[0]));
    if (missing.length) throw new Error(`Faltan columnas: ${missing.join(', ')}`);
    const payload = rows.map(row => ({
      cliente: clean(row.CLIENTE), nombre: clean(row.NOMBRE), credito: clean(row.CREDITO),
      monto_original: numberValue(row['MONTO ORIGINAL']), saldo_actual: numberValue(row['SALDO ACTUAL']),
      usuario: clean(row.USUARIO), fecha_pago: excelDate(row['FECHA DE PAGO'])
    }));
    if (!confirm(`Se reemplazará la cartera actual con ${payload.length} registros. ¿Deseas continuar?`)) return;
    const {data, error} = await db.rpc('reemplazar_cartera_autenticada', {p_filas: payload, p_archivo: file.name});
    if (error) throw error;
    showMessage('uploadMessage', `Cartera actualizada correctamente: ${data} registros.`, 'success');
    page = 0; searchTerm = ''; $('searchInput').value = ''; await Promise.all([loadStatus(), loadRows()]);
  } catch (error) { showMessage('uploadMessage', `No se pudo cargar: ${error.message}`, 'error'); }
  finally { $('uploadBtn').disabled = false; }
}

function normalizeRow(row) { const out = {}; Object.entries(row).forEach(([k,v]) => out[normalizeHeader(k)] = v); return out; }
function normalizeHeader(v) { return clean(v).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' '); }
function clean(v) { return v == null ? '' : String(v).trim(); }
function numberValue(v) { const n = typeof v === 'number' ? v : Number(clean(v).replace(/[^0-9.-]/g,'')); return Number.isFinite(n) ? n : 0; }
function money(v) { const n = Number(v); return Number.isFinite(n) ? new Intl.NumberFormat('es-GT',{style:'currency',currency:'GTQ'}).format(n).replace('GTQ','Q') : ''; }
function formatCredit(v) { const original=clean(v), s=original.replace(/[\s-]/g,''); return /^\d{14}$/.test(s)?`${s.slice(0,3)}-${s.slice(3,7)}-${s.slice(7,11)}-${s.slice(11)}`:original; }
function excelDate(v) { if(typeof v==='number'&&v>20000){const d=XLSX.SSF.parse_date_code(v);if(d)return `${String(d.d).padStart(2,'0')}/${String(d.m).padStart(2,'0')}/${d.y}`;}return clean(v); }
function showMessage(id,text,type){const el=$(id);el.textContent=text;el.className=`message ${type}`;}
