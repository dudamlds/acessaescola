// Estado do sistema
const STORE_KEY = 'sistema_acessibilidade';
let state = { students: [], interventions: [] };

function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function load(){ const raw = localStorage.getItem(STORE_KEY); if(raw){ state = JSON.parse(raw);} }
load();

// Tabs
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(btn => btn.addEventListener('click', () => {
  const panel = btn.dataset.panel;
  panels.forEach(p => p.classList.add('hidden'));
  document.getElementById(panel).classList.remove('hidden');
}));

// Student form
const studentForm = document.getElementById('studentForm');
const studentsListArea = document.getElementById('studentsListArea');

studentForm.addEventListener('submit', e => {
  e.preventDefault();
  const s = {
    id: studentId.value.trim(),
    name: studentName.value.trim(),
    class: studentClass.value.trim(),
    needs: needs.value.trim(),
    accommodations: accommodations.value.trim()
  };
  state.students.push(s);
  save();
  studentForm.reset();
  renderStudents();
});

function renderStudents(){
  if(state.students.length === 0){
    studentsListArea.innerHTML = '<p>Nenhum estudante cadastrado.</p>'; return;
  }
  let html = '<table><tr><th>ID</th><th>Nome</th><th>Turma</th><th>Necessidades</th></tr>';
  state.students.forEach(s => {
    html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.class}</td><td>${s.needs}</td></tr>`;
  });
  html += '</table>';
  studentsListArea.innerHTML = html;
}

// Interventions
const interventionForm = document.getElementById('interventionForm');
const ivStudent = document.getElementById('ivStudent');
const interventionsListArea = document.getElementById('interventionsListArea');

interventionForm.addEventListener('submit', e => {
  e.preventDefault();
  const iv = {
    studentId: ivStudent.value,
    date: ivDate.value,
    description: ivDescription.value,
    outcome: ivOutcome.value
  };
  state.interventions.push(iv);
  save();
  interventionForm.reset();
  renderInterventions();
});

function renderInterventions(){
  if(state.interventions.length === 0){
    interventionsListArea.innerHTML = '<p>Nenhuma intervenção.</p>'; return;
  }
  let html = '<table><tr><th>Data</th><th>Aluno</th><th>Descrição</th><th>Resultado</th></tr>';
  state.interventions.forEach(iv => {
    const s = state.students.find(x => x.id === iv.studentId) || {name:'(excluído)'};
    html += `<tr><td>${iv.date}</td><td>${s.name}</td><td>${iv.description}</td><td>${iv.outcome}</td></tr>`;
  });
  html += '</table>';
  interventionsListArea.innerHTML = html;
}

// Reports
const rStudent = document.getElementById('rStudent');
const reportArea = document.getElementById('reportArea');

document.getElementById('generateReport').addEventListener('click', () => {
  const studentId = rStudent.value;
  let rows = state.interventions;
  if(studentId) rows = rows.filter(r => r.studentId === studentId);
  renderReport(rows);
});

function renderReport(rows){
  if(rows.length === 0){ reportArea.innerHTML = '<p>Nenhum registro.</p>'; return; }
  let html = '<table><tr><th>Data</th><th>Aluno</th><th>Intervenção</th><th>Resultado</th></tr>';
  rows.forEach(r => {
    const s = state.students.find(x => x.id === r.studentId) || {name:'(excluído)'};
    html += `<tr><td>${r.date}</td><td>${s.name}</td><td>${r.description}</td><td>${r.outcome}</td></tr>`;
  });
  html += '</table>';
  reportArea.innerHTML = html;
}

// Clear data
const clearData = document.getElementById('clearData');
clearData.addEventListener('click', () => {
  localStorage.removeItem(STORE_KEY);
  state = { students: [], interventions: [] };
  renderStudents();
  renderInterventions();
});

// Init
function init(){
  renderStudents();
  renderInterventions();

  ivStudent.innerHTML = '';
  rStudent.innerHTML = '<option value="">Todos</option>';

  state.students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    ivStudent.appendChild(opt);

    const opt2 = opt.cloneNode(true);
    rStudent.appendChild(opt2);
  });
}
init();
