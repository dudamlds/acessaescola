/* ========= ESTADO DO SISTEMA ========= */
const STORE_KEY = "sistema_acessibilidade";

let state = {
  users: [],          // lista de usuários
  students: [],
  interventions: [],
  perceptions: [],
  logs: [],
  files: []
};

function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function load(){
  const raw = localStorage.getItem(STORE_KEY);
  if(raw){ state = JSON.parse(raw); }
  else seed();
}
function seed(){
  state.users = [
    {id:"u1", email:"ped@escola.edu", password:"ped123", role:"pedagogico", name:"Setor Pedagógico"},
    {id:"u2", email:"prof@escola.edu", password:"prof123", role:"professor", name:"Professor Exemplo"},
    {id:"u3", email:"coord@escola.edu", password:"coord123", role:"coordenacao", name:"Coordenação"},
    {id:"u4", email:"aluno@escola.edu", password:"aluno123", role:"estudante", name:"Aluno Exemplo", studentId:"S100"},
  ];

  state.students = [
    {id:"S100",name:"Aluno Exemplo",class:"6A",needs:"TDAH",accommodations:"Tempo adicional"}
  ];

  state.interventions = [];
  state.perceptions = [];
  state.logs = [];
  state.files = [];

  save();
}


/* ========= LOGIN ========= */
let currentUser = null;

document.getElementById("loginBtn").addEventListener("click", ()=>{
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  const role = document.getElementById("loginRole").value;

  const u = state.users.find(x => x.email === email && x.password === pass && x.role === role);

  if(u){
    currentUser = u;
    afterLogin();
  } else {
    alert("Credenciais inválidas");
  }
});

function afterLogin(){
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("userBox").classList.remove("hidden");
  document.getElementById("userBadge").textContent = `${currentUser.name} — ${currentUser.role}`;
  document.getElementById("statusRole").textContent = currentUser.role;

  updateRoleRestrictions();
  renderAll();
}

document.getElementById("logoutBtn").addEventListener("click", ()=>{
  currentUser = null;
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("userBox").classList.add("hidden");
  document.getElementById("statusRole").textContent = "Nenhum";
});


/* ========= CRIAR CONTA ========= */
document.getElementById("openRegisterBtn").addEventListener("click", ()=>{
  document.getElementById("registerBox").classList.remove("hidden");
});

document.getElementById("cancelRegisterBtn").addEventListener("click", ()=>{
  document.getElementById("registerBox").classList.add("hidden");
});

document.getElementById("regRole").addEventListener("change", (e)=>{
  if(e.target.value === "estudante"){
    document.getElementById("regStudentIdLabel").classList.remove("hidden");
    document.getElementById("regStudentId").classList.remove("hidden");
  } else {
    document.getElementById("regStudentIdLabel").classList.add("hidden");
    document.getElementById("regStudentId").classList.add("hidden");
  }
});

document.getElementById("registerForm").addEventListener("submit", (e)=>{
  e.preventDefault();

  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const name = document.getElementById("regName").value.trim();
  const role = document.getElementById("regRole").value;
  const studentId = document.getElementById("regStudentId").value.trim();

  const exists = state.users.some(u => u.email === email);
  if(exists){
    alert("Já existe conta com esse email.");
    return;
  }

  const newUser = {
    id: "u" + Date.now(),
    email, password, name, role
  };

  if(role === "estudante"){
    newUser.studentId = studentId || ("S" + Date.now());
  }

  state.users.push(newUser);
  save();

  alert("Conta criada com sucesso!");
  document.getElementById("registerBox").classList.add("hidden");
});


/* ========= PERMISSÕES POR FUNÇÃO ========= */
function updateRoleRestrictions(){
  const role = currentUser.role;

  // estudante não pode registrar estudante, intervenção nem relatórios
  document.querySelector("[data-panel='panel-students']").style.display =
      (role === "estudante") ? "none" : "block";

  document.querySelector("[data-panel='panel-interventions']").style.display =
      (role === "estudante") ? "none" : "block";

  document.querySelector("[data-panel='panel-reports']").style.display =
      (role === "estudante") ? "none" : "block";

  // estudantes só veem percepções
}


/* ========= MUDANÇA DE ABA ========= */
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".panel").forEach(p=>p.classList.add("hidden"));
    document.getElementById(btn.dataset.panel).classList.remove("hidden");
  });
});


/* ========= CRUD ESTUDANTES (idem versão anterior) ========= */
/* (mantido igual para não ficar enorme aqui, já está funcional no seu projeto)
   Se quiser, posso reescrever tudo menor */
function renderAll(){}


/* ========= INICIALIZAR ========= */
load();
renderAll();
