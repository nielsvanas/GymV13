// entries.js — listing & manage workout entries
const today = new Date().toISOString().split('T')[0];
const dateInput = document.getElementById('date');
dateInput.value = today;

let log = JSON.parse(localStorage.getItem('weightliftingLog')) || [];

// hamburger
function toggleMenu() {
  const m=document.getElementById('menu');
  m.classList.toggle('hidden');
  if(!toggleMenu.bound){
    document.querySelectorAll('#menu a').forEach(a=>a.addEventListener('click',()=>m.classList.add('hidden')));
    toggleMenu.bound=true;
  }
}

// dropdown populate
function refreshExerciseFilter(){
  const filterSel=document.getElementById('exerciseFilter');
  const unique=[...new Set(log.map(e=>e.exercise))].sort();
  filterSel.innerHTML='<option value="">— Show All —</option>';
  unique.forEach(ex=>{
    const opt=document.createElement('option'); opt.value=ex; opt.textContent=ex; filterSel.appendChild(opt);
  });
}

// render
function renderByDate(filtered){
  const ul=document.getElementById('log'); ul.innerHTML='';
  if(filtered.length===0){ul.innerHTML='<li>No entries yet.</li>'; return;}
  const group={};
  filtered.forEach(e=>(group[e.date]=group[e.date]||[]).push(e));
  Object.keys(group).sort((a,b)=>new Date(b)-new Date(a)).forEach(date=>{
    const h=document.createElement('li'); h.innerHTML=`<strong>🗓 ${date}</strong>`; ul.appendChild(h);
    group[date].forEach(e=>{
      const li=document.createElement('li');
      li.textContent=`- ${e.exercise} — ${e.sets} sets x ${e.reps} reps @ ${e.w} kg`;
      ul.appendChild(li);
    });
  });
}

function renderByExercise(filtered){
  const ul=document.getElementById('log'); ul.innerHTML='';
  if(filtered.length===0){ul.innerHTML='<li>No entries yet.</li>'; return;}
  const group={};
  filtered.forEach(e=>(group[e.exercise]=group[e.exercise]||[]).push(e));
  Object.keys(group).sort().forEach(ex=>{
    const h=document.createElement('li'); h.innerHTML=`<strong>🏋️ ${ex}</strong>`; ul.appendChild(h);
    group[ex].sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(e=>{
      const li=document.createElement('li');
      li.textContent=`- ${e.date} — ${e.sets} sets x ${e.reps} reps @ ${e.w} kg`;
      ul.appendChild(li);
    });
  });
}

function switchView(){
  const filter=document.getElementById('exerciseFilter').value;
  const filtered=log.filter(e=>!filter||e.exercise===filter);
  document.getElementById('viewMode').value==='exercise'?renderByExercise(filtered):renderByDate(filtered);
}

// clear date
function clearEntriesByDate(){
  const d=dateInput.value;
  if(!d){alert('Pick a date.');return;}
  const original=log.length;
  log=log.filter(e=>e.date!==d);
  if(log.length===original){alert('No entries for that date.');return;}
  localStorage.setItem('weightliftingLog',JSON.stringify(log));
  refreshExerciseFilter(); switchView();
  alert(`Cleared entries for ${d}`);
}

function exportLog(){
  if(log.length===0){alert('No entries to export.');return;}
  const blob=new Blob([JSON.stringify(log,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='workout_log.json'; a.click();
  URL.revokeObjectURL(a.href);
}

function importLog(evt){
  const file=evt.target.files[0]; if(!file)return;
  const r=new FileReader();
  r.onload=e=>{
    try{const imp=JSON.parse(e.target.result); if(!Array.isArray(imp))throw'err';
      log=log.concat(imp); localStorage.setItem('weightliftingLog',JSON.stringify(log));
      refreshExerciseFilter(); switchView(); alert('Imported!');}
    catch(err){alert('Import failed.');}
  };
  r.readAsText(file);
}

// init
refreshExerciseFilter(); switchView();
