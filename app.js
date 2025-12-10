/* Protótipo: funcionalidades alinhadas ao Documento de Requisitos.
 - Autenticação simulada (email+senha+perfil) com roles.
 - RF02, RF03, RF04, RF05, RF06, RF07 (notificações básicas), RF08 (anexos via base64).
 - Logs de ações (simulados).
 - Persistência via localStorage.
*/

const STORE_KEY = 'sistema_acessibilidade_v2';
let state = {
  users: [], // usuários simulados
  students: [],
  interventions: [],
  perceptions: [],
  files: [], // {id, studentId, name, mime, dataBase64}
  logs: []
};

// ---------- helpers ----------
function now(){ return new Date().toISOString(); }
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function load(){ const raw = localStorage.getItem(STORE_KEY); if(raw){ state = JSON.parse(raw); } else seed(); }
function seed(){
  state.users = [
    {id:'u_ped',email:'ped@escola.edu',password:'ped123',role:'pedagogico',name:'Setor Pedagógico'},
    {id:'u_prof',email:'prof@escola.edu',password:'prof123',role:'professor',name:'Prof. João'},
    {id:'u_coord',email:'coord@escola.edu',password:'coord123',role:'coordenacao',name:'Coordenação'},
    {id:'u_est',email:'est1@escola.edu',password:'est123',role:'estudante',name:'Aluno Exemplo',studentId:'S100'}
  ];
  state.students = [
    {id:'S100',name:'Aluno Exemplo',class:'6A',needs:'TDAH',accommodations:'Tempo adicional'},
    {id:'S101',name:'João Silva',class:'7B',needs:'Deficiência visual',accommodations:'Material em áudio'}
  ];
  state.interventions = [
    {id:'iv1',studentId:'S100',date:now().slice(0,10),description:'Avaliação adaptada',outcome:'Bom desempenho',createdBy:'u_prof',dueDate:null}
  ];
  state.perceptions = [];
  state.files = [];
  state.logs = [];
  save();
}

// escape for HTML
function esc(s){ if(!s) return ''; return String(s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

// ---------- auth ----------
let currentUser = null;
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const roleSelect = document.getElementById('loginRole');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userBox = document.getElementById('userBox');
const loginBox = document.getElementById('loginBox');
const userBadge = document.getElementById('userBadge');
const statusRole = document.getElementById('statusRole');
const notifCount = document.getElementById('notifCount');

loginBtn.addEventListener('click', ()=> {
  const email = emailInput.value.trim();
  const pwd = passInput.value;
  const role = roleSelect.value;
  const u = state.users.find(x => x.email === email && x.password === pwd && x.role === role);
  if(u){ currentUser = u; onAuthChange(); log(`login:${u.id}`, `Login efetuado como ${u.role}`); showMessage(`Bem-vindo, ${u.name}`); }
  else { alert('Credenciais inválidas. (teste: ped@escola.edu / ped123 )'); }
});

logoutBtn.addEventListener('click', ()=> { if(currentUser){ log(`logout:${currentUser.id}`, 'Logout'); currentUser=null; onAuthChange(); showMessage('Logout efetuado'); } });

function onAuthChange(){
  if(currentUser){
    loginBox.classList.add('hidden'); userBox.classList.remove('hidden');
    userBadge.textContent = `${currentUser.name} — ${currentUser.role}`;
    statusRole.textContent = currentUser.role;
    // if estudante, preselect student id in perception panel
    if(currentUser.role === 'estudante' && currentUser.studentId){
      document.getElementById('pStudent').value = currentUser.studentId;
    }
  } else {
    loginBox.classList.remove('hidden'); userBox.classList.add('hidden');
    statusRole.textContent = 'Anônimo';
  }
  updateUIByRole();
  renderAll();
}

// ---------- UI: tabs ----------
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
    const id = btn.dataset.panel;
    document.getElementById(id).classList.remove('hidden');
  });
});

// ---------- Student CRUD ----------
const studentForm = document.getElementById('studentForm');
const studentFileInput = document.getElementById('studentFile');
const studentsListArea = document.getElementById('studentsListArea');

studentForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!requireRole(['pedagogico','coordenacao'])){ alert('Permissão negada.'); return; }
  const id = document.getElementById('studentId').value.trim() || `S${Date.now()}`;
  const student = {
    id,
    name: document.getElementById('studentName').value.trim(),
    class: document.getElementById('studentClass').value.trim(),
    needs: document.getElementById('needs').value.trim(),
    accommodations: document.getElementById('accommodations').value.trim()
  };
  state.students.push(student);
  // file handling (optional)
  const f = studentFileInput.files[0];
  if(f){
    const b64 = await fileToBase64(f);
    state.files.push({id:`file-${Date.now()}`, studentId: student.id, name: f.name, mime: f.type, dataBase64: b64});
    log('file:add', `Arquivo ${f.name} anexado ao estudante ${student.id}`);
  }
  save(); renderAll();
  studentForm.reset();
  showMessage('Estudante salvo com sucesso');
  log('student:add', `Aluno ${student.id} cadastrado por ${currentUser?currentUser.id:'anon'}`);
});

// render students list
function renderStudents(){
  if(state.students.length === 0){ studentsListArea.innerHTML = '<p>Nenhum estudante cadastrado.</p>'; return; }
  let html = '<div class="table-responsive"><table><thead><tr><th>ID</th><th>Nome</th><th>Turma</th><th>Necessidades</th><th>Ações</th></tr></thead><tbody>';
  state.students.forEach(s=>{
    html += `<tr>
      <td>${esc(s.id)}</td>
      <td>${esc(s.name)}</td>
      <td>${esc(s.class)}</td>
      <td>${esc(s.needs)}</td>
      <td>
        <button data-id="${s.id}" class="btn-view">Ver</button>
        <button data-id="${s.id}" class="btn-del">Excluir</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  studentsListArea.innerHTML = html;
  studentsListArea.querySelectorAll('.btn-del').forEach(b=> b.addEventListener('click', ()=>{
    if(!requireRole(['pedagogico','coordenacao'])){ alert('Permissão negada.'); return; }
    const id = b.dataset.id;
    if(confirm('Excluir estudante e registros relacionados?')){
      state.students = state.students.filter(x=>x.id!==id);
      state.interventions = state.interventions.filter(iv=>iv.studentId!==id);
      state.perceptions = state.perceptions.filter(p=>p.studentId!==id);
      state.files = state.files.filter(f=>f.studentId!==id);
      save(); renderAll(); showMessage('Estudante excluído'); log('student:delete', `Aluno ${id} excluído`);
    }
  }));
  studentsListArea.querySelectorAll('.btn-view').forEach(b=> b.addEventListener('click', ()=> {
    const id = b.dataset.id; const s = state.students.find(x=>x.id===id);
    alert(`Aluno: ${s.name}\nID: ${s.id}\nTurma: ${s.class}\nNecessidades: ${s.needs}\nAdaptações: ${s.accommodations}`);
  }));
}

// ---------- Interventions ----------
const interventionForm = document.getElementById('interventionForm');
const ivStudent = document.getElementById('ivStudent');
const interventionsListArea = document.getElementById('interventionsListArea');

interventionForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  if(!requireRole(['professor','pedagogico','coordenacao'])){ alert('Permissão negada.'); return; }
  const iv = {
    id: `iv${Date.now()}`,
    studentId: ivStudent.value,
    date: document.getElementById('ivDate').value || (new Date().toISOString().slice(0,10)),
    description: document.getElementById('ivDescription').value.trim(),
    outcome: document.getElementById('ivOutcome').value.trim(),
    createdBy: currentUser ? currentUser.id : 'anon',
    dueDate: document.getElementById('ivDueDate').value || null
  };
  state.interventions.push(iv); save(); renderAll(); interventionForm.reset();
  showMessage('Intervenção registrada'); log('intervention:add', `Intervenção ${iv.id} p/ ${iv.studentId}`);
});

function renderInterventions(){
  if(state.interventions.length === 0){ interventionsListArea.innerHTML = '<p>Nenhuma intervenção registrada.</p>'; return; }
  let html = '<div class="table-responsive"><table><thead><tr><th>Data</th><th>Aluno</th><th>Descrição</th><th>Resultado</th><th>Prazo</th></tr></thead><tbody>';
  state.interventions.slice().reverse().forEach(iv=>{
    const s = state.students.find(x=>x.id===iv.studentId) || {name:'(excluído)'};
    html += `<tr><td>${esc(iv.date)}</td><td>${esc(s.name)}</td><td>${esc(iv.description)}</td><td>${esc(iv.outcome)}</td><td>${esc(iv.dueDate || '')}</td></tr>`;
  });
  html += '</tbody></table></div>';
  interventionsListArea.innerHTML = html;
}

// ---------- Perceptions (RF04) ----------
const perceptionForm = document.getElementById('perceptionForm');
const pStudent = document.getElementById('pStudent');
const perceptionsListArea = document.getElementById('perceptionsListArea');

perceptionForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  // any logged-in user can submit a perception as long as role is estudante or professor/ped
  if(!currentUser){ alert('Necessário login para enviar percepção.'); return; }
  const studentId = pStudent.value;
  const p = { id:`p${Date.now()}`, studentId, date: document.getElementById('pDate').value || (new Date().toISOString().slice(0,10)), text: document.getElementById('pText').value.trim(), createdBy: currentUser.id };
  state.perceptions.push(p); save(); renderPerceptions(); perceptionForm.reset();
  showMessage('Percepção enviada'); log('perception:add', `Percepção ${p.id} p/ ${p.studentId}`);
});

function renderPerceptions(){
  if(state.perceptions.length === 0){ perceptionsListArea.innerHTML = '<p>Nenhuma percepção.</p>'; return; }
  let html = '<ul>';
  state.perceptions.slice().reverse().forEach(p=>{
    const s = state.students.find(x=>x.id===p.studentId) || {name:'(excluído)'};
    html += `<li><strong>${esc(s.name)}</strong> (${esc(p.date)}): ${esc(p.text)}</li>`;
  });
  html += '</ul>';
  perceptionsListArea.innerHTML = html;
}

// ---------- Files (RF08) ----------
const filesArea = document.getElementById('filesArea');

function fileToBase64(file){
  return new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = ()=> res(reader.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

function renderFiles(){
  if(state.files.length === 0){ filesArea.innerHTML = '<p>Nenhum anexo.</p>'; return; }
  let html = '<ul>';
  state.files.forEach(f=>{
    html += `<li>${esc(f.name)} — <button data-id="${f.id}" class="btn-download">Abrir/Download</button></li>`;
  });
  html += '</ul>';
  filesArea.innerHTML = html;
  filesArea.querySelectorAll('.btn-download').forEach(b=> b.addEventListener('click', ()=>{
    const id = b.dataset.id; const f = state.files.find(x=>x.id===id);
    if(!f) return;
    // create blob and open in new window/tab
    const blob = b64toBlob(f.dataBase64, f.mime); const url = URL.createObjectURL(blob);
    window.open(url,'_blank');
    URL.revokeObjectURL(url);
  }));
}
function b64toBlob(b64, mime){
  const binary = atob(b64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for(let i=0;i<len;i++) u8[i]=binary.charCodeAt(i);
  return new Blob([u8], {type:mime});
}

// ---------- Reports (RF06) ----------
const rStudent = document.getElementById('rStudent');
const rClass = document.getElementById('rClass');
const rFrom = document.getElementById('rFrom');
const rTo = document.getElementById('rTo');
const reportArea = document.getElementById('reportArea');

document.getElementById('generateReport').addEventListener('click', ()=> {
  if(!requireRole(['coordenacao','pedagogico'])){ alert('Permissão negada para gerar relatórios.'); return; }
  let rows = state.interventions.slice();
  const sId = rStudent.value; const cls = rClass.value.trim(); const from = rFrom.value; const to = rTo.value;
  if(sId) rows = rows.filter(r=>r.studentId===sId);
  if(cls) rows = rows.filter(r=> (state.students.find(s=>s.id===r.studentId)||{}).class === cls);
  if(from) rows = rows.filter(r=> r.date >= from);
  if(to) rows = rows.filter(r=> r.date <= to);
  renderReportRows(rows);
});

function renderReportRows(rows){
  if(rows.length===0){ reportArea.innerHTML = '<p>Nenhum registro encontrado.</p>'; return; }
  let html = '<div class="table-responsive"><table><thead><tr><th>Data</th><th>Aluno</th><th>Turma</th><th>Descrição</th><th>Resultado</th></tr></thead><tbody>';
  rows.forEach(iv=>{
    const s = state.students.find(x=>x.id===iv.studentId) || {name:'(excluído)', class:''};
    html += `<tr><td>${esc(iv.date)}</td><td>${esc(s.name)}</td><td>${esc(s.class)}</td><td>${esc(iv.description)}</td><td>${esc(iv.outcome)}</td></tr>`;
  });
  html += '</tbody></table></div>';
  reportArea.innerHTML = html;
}

// export CSV
document.getElementById('exportCsv').addEventListener('click', ()=>{
  if(!requireRole(['coordenacao','pedagogico'])){ alert('Permissão negada.'); return; }
  const rows = state.interventions.slice();
  if(rows.length===0){ alert('Nenhum registro para exportar.'); return; }
  const csv = [['Data','Aluno','Turma','Descrição','Resultado']];
  rows.forEach(iv=>{
    const s = state.students.find(x=>x.id===iv.studentId) || {name:'(excluído)', class:''};
    csv.push([iv.date, s.name, s.class, iv.description, iv.outcome]);
  });
  const csvStr = csv.map(r=> r.map(c=> `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csvStr], {type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `relatorio_intervencoes_${Date.now()}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  log('report:export', 'Export CSV');
});

// ---------- Logs ----------
const logsArea = document.getElementById('logsArea');
function log(type, msg){
  const entry = {id:`log${Date.now()}`, type, msg, time: now(), by: currentUser?currentUser.id:'anon'};
  state.logs.push(entry); save(); renderLogs();
}
function renderLogs(){
  if(state.logs.length===0){ logsArea.innerHTML = '<p>Nenhum log.</p>'; return; }
  let html = '<ul>';
  state.logs.slice().reverse().forEach(l => { html += `<li>[${esc(l.time)}] ${esc(l.type)} — ${esc(l.msg)} (by ${esc(l.by)})</li>`; });
  html += '</ul>';
  logsArea.innerHTML = html;
}

// ---------- Notifications (RF07 small prototype) ----------
function checkDueNotifications(){
  // find interventions with dueDate today or past and not yet flagged => create a notification count
  const today = new Date().toISOString().slice(0,10);
  const pending = state.interventions.filter(iv => iv.dueDate && iv.dueDate <= today);
  notifCount.textContent = pending.length;
  // optionally, push an alert for coordinators/pedagógico
  if(pending.length>0 && currentUser && (currentUser.role==='coordenacao' || currentUser.role==='pedagogico')){
    showMessage(`${pending.length} intervenção(ões) com prazo vencido ou para revisão`);
  }
}

// ---------- Utilities ----------
function updateUIByRole(){
  const role = currentUser ? currentUser.role : null;
  // simple role-driven control: students cannot create students or interventions
  const studentPanel = document.getElementById('panel-students');
  const interventionPanel = document.getElementById('panel-interventions');
  const perceptionsPanel = document.getElementById('panel-perceptions');
  const reportsPanel = document.getElementById('panel-reports');
  const filesPanel = document.getElementById('panel-files');

  // show/hide panels minimally: always available but actions inside will validate permission
  // (this approach helps test roles in protótipo)
}

function requireRole(allowed){
  if(!currentUser) return false;
  return allowed.includes(currentUser.role);
}

function showMessage(text){
  const main = document.querySelector('main');
  const d = document.createElement('div');
  d.className = 'card';
  d.style.borderLeft = '4px solid #bbf7d0';
  d.textContent = text;
  main.prepend(d);
  setTimeout(()=>d.remove(),3500);
}

// ---------- Init render / populate selects ----------
function populateSelects(){
  // ivStudent, rStudent, pStudent
  [ivStudent, rStudent, pStudent].forEach(sel=>{
    sel.innerHTML = '';
    if(sel === rStudent) sel.innerHTML = '<option value="">Todos</option>';
    state.students.forEach(s=>{
      const opt = document.createElement('option'); opt.value = s.id; opt.textContent = `${s.name} — ${s.class}`; sel.appendChild(opt);
    });
  });
  // perception default date
  document.getElementById('pDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('ivDate').value = new Date().toISOString().slice(0,10);
}

function renderAll(){
  renderStudents(); renderInterventions(); renderPerceptions(); renderFiles(); renderLogs(); populateSelects(); checkDueNotifications();
}

// ---------- Clear data ----------
document.getElementById('clearData').addEventListener('click', ()=>{
  if(confirm('Tem certeza? Isso apagará todos os dados locais.')){ localStorage.removeItem(STORE_KEY); state = {users:[],students:[],interventions:[],perceptions:[],files:[],logs:[]}; load(); renderAll(); showMessage('Dados limpos'); }
});

// ---------- Startup ----------
load();
onAuthChange();
renderAll();
