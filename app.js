// Acessibilidade: aumento/diminuição de fonte, alto contraste, leitura por TTS e submissão do formulário.
// Salva preferências em localStorage.

document.addEventListener('DOMContentLoaded', function () {
  const incBtn = document.getElementById('increase-font');
  const decBtn = document.getElementById('decrease-font');
  const contrastBtn = document.getElementById('toggle-contrast');
  const readBtn = document.getElementById('read-btn');
  const form = document.getElementById('needs-form');
  const feedback = document.getElementById('form-feedback');
  const yearSpan = document.getElementById('year');

  // mostra ano atual
  yearSpan.textContent = new Date().getFullYear();

  // fontes
  const root = document.documentElement;
  function setScale(scale){
    root.style.setProperty('--font-scale', scale);
    localStorage.setItem('fontScale', scale);
  }
  let currentScale = parseFloat(localStorage.getItem('fontScale')) || 1;
  setScale(currentScale);

  incBtn.addEventListener('click', () => {
    currentScale = Math.min(1.5, +(currentScale + 0.1).toFixed(2));
    setScale(currentScale);
  });
  decBtn.addEventListener('click', () => {
    currentScale = Math.max(0.8, +(currentScale - 0.1).toFixed(2));
    setScale(currentScale);
  });

  // contraste
  const body = document.body;
  let contrast = localStorage.getItem('highContrast') === 'true';
  function applyContrast(){
    if(contrast){
      body.classList.add('high-contrast');
      contrastBtn.setAttribute('aria-pressed','true');
    } else {
      body.classList.remove('high-contrast');
      contrastBtn.setAttribute('aria-pressed','false');
    }
  }
  contrastBtn.addEventListener('click', () => {
    contrast = !contrast;
    localStorage.setItem('highContrast', contrast);
    applyContrast();
  });
  applyContrast();

  // leitura de texto (text-to-speech)
  function speak(text){
    if(!('speechSynthesis' in window)) {
      alert('Leitor de texto não disponível neste navegador.');
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  readBtn.addEventListener('click', () => {
    // lê o conteúdo principal (títulos e parágrafos)
    const main = document.querySelector('main');
    const texts = [];
    main.querySelectorAll('h2,h3,h4,p,li').forEach(el => {
      texts.push(el.textContent.trim());
    });
    speak(texts.slice(0, 40).join('. '));
  });

  // formulário — exemplo simples: guarda no localStorage e mostra feedback
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    for(const [k,v] of data.entries()){
      if(obj[k]) {
        if(Array.isArray(obj[k])) obj[k].push(v);
        else obj[k] = [obj[k], v];
      } else {
        obj[k] = v;
      }
    }
    // tipos (checkbox) -> garantir array
    const types = [];
    form.querySelectorAll('input[type="checkbox"][name="type"]:checked').forEach(c => types.push(c.value));
    obj.types = types;

    // Simulação de persistência local (a escola pode integrar com backend).
    const registros = JSON.parse(localStorage.getItem('registros') || '[]');
    obj.timestamp = new Date().toISOString();
    registros.push(obj);
    localStorage.setItem('registros', JSON.stringify(registros));

    feedback.textContent = 'Registro enviado com sucesso. Obrigado!';
    feedback.style.color = '#065f46';
    form.reset();
    form.querySelector('input, textarea, button')?.focus();
  });

  // atalhos de teclado importantes
  document.addEventListener('keydown', (e) => {
    // Ctrl + Alt + H -> Alterna alto contraste
    if(e.ctrlKey && e.altKey && e.key.toLowerCase() === 'h'){
      contrast = !contrast;
      localStorage.setItem('highContrast', contrast);
      applyContrast();
    }
    // Ctrl + Alt + + -> aumentar fonte
    if(e.ctrlKey && e.altKey && (e.key === '+' || e.key === '=')){
      incBtn.click();
    }
    // Ctrl + Alt + - -> diminuir fonte
    if(e.ctrlKey && e.altKey && e.key === '-'){
      decBtn.click();
    }
  });

  // Garantir que links e botões tenham foco visível por padrão
  const style = document.createElement('style');
  style.innerHTML = `
    :focus {outline: var(--focus) solid #2b6cb0; outline-offset: 2px;}
  `;
  document.head.appendChild(style);
});