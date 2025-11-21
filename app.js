const SERVICES = [
  {id:'carro',label:'Soccorso stradale'},
  {id:'benz',label:'Rifornimento'},
  {id:'ruote',label:'Cambio ruota'},
  {id:'vetri',label:'Vetri/inf.'},
  {id:'altro',label:'Altro'}
];

// Icons are now provided via inline SVG sprite in index.html (use <use href="#icon-id">)

// step elements
const stepPlate = document.getElementById('step-plate');
const stepCar = document.getElementById('step-car');
const stepService = document.getElementById('step-service');
const stepChoice = document.getElementById('step-choice');
const stepMaintenance = document.getElementById('step-maintenance');
const stepMap = document.getElementById('step-map');

// flag to know if user came through 'Sinistro' flow
let isSinistro = false;

// header updater
function updateHeader(){
  const header = document.getElementById('header-step');
  if(!header) return;
  const map = {
    'step-plate': 'Passaggio 1 di 5 — Targa',
    'step-car': 'Passaggio 2 di 5 — Dati macchina',
    'step-choice': 'Passaggio 3 di 5 — Scelta',
    'step-maintenance': 'Passaggio 4 di 5 — Programma manutenzione',
    'step-service': 'Passaggio 5 di 5 — Servizio'
  };
  // find active step
  for(const id in map){
    const el = document.getElementById(id);
    if(el && el.classList.contains('active')){ header.textContent = map[id]; return; }
  }
  // default
  header.textContent = map['step-plate'];
}

document.getElementById('btn-plate').addEventListener('click',()=>{
  const plate = document.getElementById('plate').value.trim();
  if(!plate){alert('Inserisci la targa');return;}
  stepPlate.classList.remove('active');
  stepCar.classList.add('active');
  updateHeader();
});

document.getElementById('btn-car').addEventListener('click',()=>{
  const model = document.getElementById('car-model').value.trim();
  const year = document.getElementById('car-year').value.trim();
  const color = document.getElementById('car-color').value.trim();
  if(!model||!year||!color){alert('Compila tutti i dati della macchina');return;}
  stepCar.classList.remove('active');
  // show choice screen between car data and services
  const stepChoice = document.getElementById('step-choice');
  stepChoice.classList.add('active');
  updateHeader();
  // set up choice buttons (added dynamically so attach listeners here)
  document.getElementById('btn-sinistro').addEventListener('click',()=>{
    stepChoice.classList.remove('active');
    stepService.classList.add('active');
    renderServices();
    updateHeader();
    isSinistro = true;
  });
  document.getElementById('btn-manutenzione').addEventListener('click',()=>{
    stepChoice.classList.remove('active');
    const stepMnt = document.getElementById('step-maintenance');
    stepMnt.classList.add('active');
    updateHeader();
    isSinistro = false;
  });
});

// Maintenance form submit handling
const maintenanceForm = document.getElementById('maintenance-form');
if(maintenanceForm){
  maintenanceForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('mnt-name').value.trim();
    const surname = document.getElementById('mnt-surname').value.trim();
    const email = document.getElementById('mnt-email').value.trim();
    const phone = document.getElementById('mnt-phone').value.trim();
    if(!name||!surname||!email||!phone){alert('Compila tutti i campi per la manutenzione');return;}
    // simulate sending
    const submitBtn = document.getElementById('btn-mnt-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Invio...';
    setTimeout(()=>{
      submitBtn.disabled = false;
      submitBtn.textContent = 'Invia richiesta';
      // close maintenance step and show modal confirmation
      document.getElementById('step-maintenance').classList.remove('active');
      modal.classList.remove('hidden');
      modalTitle.textContent = 'Richiesta inoltrata';
      modalBody.textContent = 'Richiesta inoltrata — sarai ricontattato nell\'arco di 48h per la conferma della manutenzione';
      // reset form
      maintenanceForm.reset();
      updateHeader();
    },1200);
  });
}

// Render servizi
function renderServices(){
  const grid = document.getElementById('service-grid');
  grid.innerHTML='';
  SERVICES.forEach(s=>{
    const btn = document.createElement('button');
    btn.className='service-btn';
    // make the first service (carro -> Incidente) span two columns and use danger style
    if (s.id === 'carro') btn.classList.add('incidente');

    const iconWrap = document.createElement('span');
    iconWrap.className = 'service-icon';
    // Prefer a local standalone icon file (assets/icons/<id>.svg).
    // If it fails to load, fall back to the external sprite (assets/icons/icons.svg).
    const img = document.createElement('img');
    img.src = `assets/icons/${s.id}.png`;
    img.alt = s.label + ' icon';
    img.loading = 'lazy';
    img.width = 40; img.height = 40;
    img.style.objectFit = 'contain';
    // img.onerror = function(){
    //   // replace with sprite <use> if local file not found or fails
    //   iconWrap.innerHTML = `<svg class="service-icon" aria-hidden="true"><use href="assets/icons/icons.svg#icon-${s.id}"></use></svg>`;
    // };
    iconWrap.appendChild(img);

    const label = document.createElement('span');
    label.className = 'service-label';
    label.textContent = s.label;

    btn.appendChild(iconWrap);
    btn.appendChild(label);

    btn.addEventListener('click',()=>onServiceClick(s));
    grid.appendChild(btn);
  });
}

// Modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const progressBar = document.getElementById('progress-bar');
const etaText = document.getElementById('eta');
document.getElementById('modal-close').addEventListener('click',()=>{
  // hide modal
  modal.classList.add('hidden');
  // reset progress display
  if(progressBar) progressBar.style.width = '0%';
  if(etaText) etaText.textContent = 'ETA — calcolo in corso';
  // go back to the initial step (home)
  const steps = document.querySelectorAll('.step');
  steps.forEach(s=>s.classList.remove('active'));
  stepPlate.classList.add('active');
  updateHeader();
});

function onServiceClick(service){
  // Only show the ETA modal for the 'Sinistro' flow
  if(!isSinistro){
    // non-sinistro: no modal, just acknowledge selection
    alert(`Hai selezionato: ${service.label}`);
    return;
  }

  modal.classList.remove('hidden');
  modalTitle.textContent = `Intervento: ${service.label}`;
  modalBody.textContent = 'Geolocalizzazione in corso...';
  progressBar.style.width='0%';
  etaText.textContent='ETA — calcolo in corso';

  // Geolocalizzazione
  if(!navigator.geolocation){
    modalBody.textContent='Geolocalizzazione non disponibile';
    simulateEta(5000, ()=>openMapAfterSinistro());
    return;
  }
  navigator.geolocation.getCurrentPosition(pos=>{
    modalBody.textContent=`Posizione: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
    simulateEta(5000, ()=>openMapAfterSinistro());
  }, err=>{
    modalBody.textContent='Permesso posizione negato o timeout';
    simulateEta(5000, ()=>openMapAfterSinistro());
  });
}

function openMapAfterSinistro(){
  // close modal and open the map step
  modal.classList.add('hidden');
  if(progressBar) progressBar.style.width = '0%';
  if(etaText) etaText.textContent = 'ETA — calcolo in corso';
  // show map step
  const steps = document.querySelectorAll('.step');
  steps.forEach(s=>s.classList.remove('active'));
  if(stepMap) stepMap.classList.add('active');
  // trigger truck animation
  const truck = document.querySelector('#step-map .marker.truck');
  if(truck){
    truck.classList.remove('animate');
    void truck.offsetWidth;
    truck.classList.add('animate');
  }
  // attach CID upload handler
  const cidBtn = document.getElementById('btn-cid-upload');
  if(cidBtn){
    cidBtn.addEventListener('click', ()=>{
      const fileInput = document.getElementById('cid-file');
      const status = document.getElementById('cid-status');
      if(!fileInput || !fileInput.files || fileInput.files.length===0){
        status.textContent = 'Seleziona un file prima di caricare.';
        return;
      }
      cidBtn.disabled = true;
      cidBtn.textContent = 'Caricamento...';
      setTimeout(()=>{
        cidBtn.disabled = false;
        cidBtn.textContent = 'Carica CID';
        status.textContent = 'CID caricato con successo.';
      },1200);
    });
  }
  // reset sinistro flag
  isSinistro = false;
  updateHeader();
}

// simulate ETA progress over given duration (ms) and call cb when done
function simulateEta(durationMs, cb){
  let pct = 0;
  const steps = Math.max(1, Math.floor(durationMs / 100));
  const eta = Math.floor(Math.random()*8)+5; // minutes estimate
  const increment = 100/steps;
  const interval = setInterval(()=>{
    pct = Math.min(100, pct + increment);
    if(progressBar) progressBar.style.width = Math.round(pct)+'%';
    if(etaText) etaText.textContent = `Carro soccorso stimato: ~${Math.floor(pct/100*eta)} min`;
    if(pct>=100){
      clearInterval(interval);
      if(etaText) etaText.textContent = `Il carro soccorso è in arrivo (~${eta} min)`;
      setTimeout(()=>{ if(cb) cb(); }, 500);
    }
  }, 100);
}

function simulateArrival(){
  let pct=0;
  const eta = Math.floor(Math.random()*12)+5;
  const interval = setInterval(()=>{
    pct=Math.min(100,pct+1);
    progressBar.style.width=pct+'%';
    etaText.textContent=`Carro soccorso stimato: ~${Math.floor(pct/100*eta)} min`;
    if(pct>=100){clearInterval(interval);etaText.textContent=`Il carro soccorso è in arrivo (~${eta} min)`;}
  },100);
}

// initial header update
updateHeader();

// Back button logic: navigate to previous step in the defined order
const stepOrder = ['step-plate','step-car','step-choice','step-maintenance','step-service','step-map'];
function goToStep(stepId){
  const steps = document.querySelectorAll('.step');
  steps.forEach(s=>s.classList.remove('active'));
  const target = document.getElementById(stepId);
  if(target) target.classList.add('active');
  updateHeader();
}

document.querySelectorAll('.back-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    // find current active step
    let currentIndex = -1;
    for(let i=0;i<stepOrder.length;i++){
      const el = document.getElementById(stepOrder[i]);
      if(el && el.classList.contains('active')){ currentIndex = i; break; }
    }
    if(currentIndex<=0){
      // already at first step -> do nothing
      return;
    }
    // go to previous step
    const prev = stepOrder[currentIndex-1];
    goToStep(prev);
  });
});

