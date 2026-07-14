const FOODS = [
  { id:'water', name:'水', icon:'💧', category:'液體', color:'#49a9e8', stomach:25, small:70, large:0, digestibility:1, note:'水不需要被消化酵素分解，通常很快離開胃並在腸道吸收。' },
  { id:'alcohol', name:'酒精飲料', icon:'🥂', category:'液體', color:'#9a63d8', stomach:35, small:85, large:0, digestibility:1, note:'酒精可快速被吸收，之後主要由肝臟代謝；它不是補充水分的健康飲料。' },
  { id:'drink', name:'一般飲料', icon:'🥤', category:'液體', color:'#ef7e8f', stomach:55, small:115, large:0, digestibility:.95, note:'含糖飲料的液體移動較快，但糖分會在小腸被吸收。' },
  { id:'rice', name:'米飯', icon:'🍚', category:'固體', color:'#e0b83f', stomach:145, small:260, large:1200, digestibility:.92, note:'米飯中的澱粉會逐步分解成較小糖類，主要在小腸完成消化與吸收。' },
  { id:'steak', name:'牛排', icon:'🥩', category:'較難消化', color:'#b94b42', stomach:260, small:390, large:1500, digestibility:.78, note:'牛排含蛋白質與脂肪，通常比米飯與液體在胃中停留更久。' },
  { id:'vegetable', name:'蔬菜', icon:'🥦', category:'高纖維', color:'#47a85b', stomach:170, small:310, large:1700, digestibility:.68, note:'蔬菜中的部分營養會被吸收，部分纖維則會進入大腸。' },
  { id:'pearl', name:'珍珠', icon:'⚫', category:'澱粉固體', color:'#684235', stomach:190, small:330, large:1380, digestibility:.83, note:'珍珠主要由澱粉組成，正常情況下可以被消化；充分咀嚼可降低後續處理負擔。' },
  { id:'bubbleTea', name:'珍珠奶茶', icon:'🧋', category:'混合食物', color:'#b9784d', stomach:150, small:280, large:1100, digestibility:.87, note:'奶茶液體、糖與珍珠不會完全同步前進；這裡以混合餐點簡化呈現。' },
  { id:'fried', name:'油炸食物', icon:'🍟', category:'高脂肪', color:'#ef8b2c', stomach:300, small:430, large:1600, digestibility:.74, note:'脂肪含量高的食物通常會讓胃排空速度變慢。' },
  { id:'easy', name:'容易消化', icon:'🥣', category:'軟質食物', color:'#73bdb5', stomach:95, small:210, large:1000, digestibility:.95, note:'軟質、低脂、顆粒小的食物通常較快形成食糜。' },
  { id:'hard', name:'難以消化', icon:'🧱', category:'粗硬固體', color:'#6d7784', stomach:330, small:470, large:1900, digestibility:.62, note:'顆粒大、脂肪高或質地粗硬的食物，通常需要更長處理時間。' }
];

const ORGANS = [
  { key:'mouth', name:'口腔', start:0, duration:3, pos:[50,14], state:'咀嚼並與唾液混合', digest:.03, absorb:0 },
  { key:'esophagus', name:'食道', start:3, duration:2, pos:[50,28], state:'食團經由蠕動向胃移動', digest:.05, absorb:0 },
  { key:'stomach', name:'胃', pos:[52,43], state:'攪拌、研磨並形成食糜', digest:.35, absorb:.03 },
  { key:'smallIntestine', name:'小腸', pos:[53,67], state:'酵素分解與營養吸收', digest:.9, absorb:.82 },
  { key:'largeIntestine', name:'大腸', pos:[44,75], state:'回收水分並形成殘渣', digest:1, absorb:.94 },
  { key:'rectum', name:'直腸', pos:[50,92], state:'儲存殘渣，準備排出', digest:1, absorb:.95 },
  { key:'out', name:'已排出體外', pos:[50,98], state:'旅程完成', digest:1, absorb:.95 }
];

const state = { selected:new Set(), meal:[], focusId:null, time:0, playing:false, timer:null };

const els = Object.fromEntries([
  'foodGrid','selectedCount','portionSelect','chewSelect','loadMealBtn','timeline','timeLabel','playBtn','prevBtn','nextBtn','speedSelect','foodParticles','mealLegend','focusFoodName','focusSwatch','focusOrgan','focusState','focusDigestion','focusAbsorption','focusNext','digestProgress','scienceNote','resetBtn','startTourBtn','tourDialog','closeTourBtn','challengeFeedback'
].map(id => [id, document.getElementById(id)]));

function renderFoodCards(){
  els.foodGrid.innerHTML = FOODS.map(food => `
    <label class="food-card" data-id="${food.id}">
      <input type="checkbox" value="${food.id}" />
      <span class="food-icon">${food.icon}</span>
      <span><strong>${food.name}</strong><small>${food.category}</small></span>
    </label>
  `).join('');
  els.foodGrid.querySelectorAll('.food-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
      card.classList.toggle('selected', state.selected.has(id));
      card.querySelector('input').checked = state.selected.has(id);
      els.selectedCount.textContent = `${state.selected.size} 種`;
    });
  });
}

function buildMeal(){
  if(!state.selected.size){
    alert('請至少選擇一種食物。');
    return;
  }
  const portion = Number(els.portionSelect.value);
  const chew = Number(els.chewSelect.value);
  const mixFactor = 1 + Math.max(0, state.selected.size - 2) * .04;
  state.meal = [...state.selected].map((id, index) => {
    const food = FOODS.find(f => f.id === id);
    const variance = 0.94 + ((index * 7) % 11) / 100;
    const factor = portion * chew * mixFactor * variance;
    const mouthEnd = 3;
    const esophagusEnd = 5;
    const stomachEnd = esophagusEnd + food.stomach * factor;
    const smallEnd = stomachEnd + food.small * factor;
    const largeEnd = smallEnd + food.large * factor;
    const rectumEnd = Math.min(4320, largeEnd + 300 * factor);
    return { ...food, times:{ mouthEnd, esophagusEnd, stomachEnd, smallEnd, largeEnd, rectumEnd } };
  });
  state.focusId = state.meal[0].id;
  state.time = 0;
  els.timeline.value = 0;
  renderLegend();
  renderSimulation();
}

function getFoodStage(food, t){
  const x = food.times;
  if(t <= x.mouthEnd) return stageData(ORGANS[0], t / x.mouthEnd, food);
  if(t <= x.esophagusEnd) return stageData(ORGANS[1], (t-x.mouthEnd)/(x.esophagusEnd-x.mouthEnd), food);
  if(t <= x.stomachEnd) return stageData(ORGANS[2], (t-x.esophagusEnd)/(x.stomachEnd-x.esophagusEnd), food);
  if(t <= x.smallEnd) return stageData(ORGANS[3], (t-x.stomachEnd)/(x.smallEnd-x.stomachEnd), food);
  if(food.large === 0 || t <= x.largeEnd) return stageData(ORGANS[4], food.large===0 ? 1 : (t-x.smallEnd)/(x.largeEnd-x.smallEnd), food);
  if(t <= x.rectumEnd) return stageData(ORGANS[5], (t-x.largeEnd)/(x.rectumEnd-x.largeEnd), food);
  return stageData(ORGANS[6], 1, food);
}

function stageData(organ, progress, food){
  progress = Math.max(0, Math.min(1, progress));
  let digest = organ.digest;
  let absorb = organ.absorb;
  if(organ.key === 'stomach') digest = .05 + progress * .3;
  if(organ.key === 'smallIntestine') { digest = .35 + progress * (.55 * food.digestibility); absorb = .03 + progress * (.79 * food.digestibility); }
  if(organ.key === 'largeIntestine') { digest = .88 + progress * .12; absorb = .78 + progress * .16; }
  const jitter = hashOffset(food.id);
  const pos = [organ.pos[0] + jitter.x, organ.pos[1] + jitter.y];
  return { organ, progress, digest:Math.min(1,digest), absorb:Math.min(.98,absorb), pos };
}

function hashOffset(id){
  const n = [...id].reduce((a,c)=>a+c.charCodeAt(0),0);
  return { x:(n%9)-4, y:((n*3)%7)-3 };
}

function renderSimulation(){
  els.timeLabel.textContent = formatTime(state.time);
  els.foodParticles.innerHTML = state.meal.map(food => {
    const data = getFoodStage(food, state.time);
    const opacity = data.organ.key === 'out' ? .25 : 1;
    const scale = Math.max(.65, 1 - data.digest * .28);
    return `<button class="food-particle ${food.id===state.focusId?'focused':''}" data-id="${food.id}" style="left:${data.pos[0]}%;top:${data.pos[1]}%;background:${food.color};opacity:${opacity};transform:translate(-50%,-50%) scale(${scale})" title="${food.name}">${food.icon}</button>`;
  }).join('');
  els.foodParticles.querySelectorAll('.food-particle').forEach(btn => btn.addEventListener('click', () => { state.focusId = btn.dataset.id; renderSimulation(); renderLegend(); }));
  renderFocus();
}

function renderFocus(){
  const food = state.meal.find(f => f.id === state.focusId);
  if(!food){
    els.focusFoodName.textContent='尚未開始';
    els.focusOrgan.textContent='—';
    els.focusState.textContent='—';
    els.focusDigestion.textContent='—';
    els.focusAbsorption.textContent='—';
    els.focusNext.textContent='—';
    els.digestProgress.style.width='0%';
    els.scienceNote.textContent='先選擇食物，再開始模擬。';
    return;
  }
  const data = getFoodStage(food, state.time);
  els.focusFoodName.textContent = `${food.icon} ${food.name}`;
  els.focusSwatch.style.background = food.color;
  els.focusOrgan.textContent = data.organ.name;
  els.focusState.textContent = getStateText(food, data);
  els.focusDigestion.textContent = `${Math.round(data.digest*100)}%`;
  els.focusAbsorption.textContent = `${Math.round(data.absorb*100)}%`;
  els.focusNext.textContent = getNextText(food, data.organ.key);
  els.digestProgress.style.width = `${Math.round(data.digest*100)}%`;
  els.scienceNote.textContent = food.note;
}

function getStateText(food, data){
  if(data.organ.key==='mouth') return food.category.includes('液體') ? '液體準備吞嚥' : '被切碎並形成食團';
  if(data.organ.key==='esophagus') return '經由食道蠕動前進';
  if(data.organ.key==='stomach') return data.progress < .5 ? '與胃液混合、逐漸軟化' : '形成較細緻的食糜';
  if(data.organ.key==='smallIntestine') return data.progress < .5 ? '酵素持續分解' : '大量營養進入吸收階段';
  if(data.organ.key==='largeIntestine') return food.id==='water' || food.id==='alcohol' ? '大部分已在前段吸收' : '回收水分，保留纖維與殘渣';
  return data.organ.state;
}

function getNextText(food, key){
  const order=['mouth','esophagus','stomach','smallIntestine','largeIntestine','rectum','out'];
  const names=['食道','胃','小腸','大腸','直腸','排出體外','旅程完成'];
  return names[order.indexOf(key)] || '旅程完成';
}

function renderLegend(){
  els.mealLegend.innerHTML = state.meal.map(food => `<button class="legend-item ${food.id===state.focusId?'active':''}" data-id="${food.id}"><span class="legend-dot" style="background:${food.color}"></span>${food.icon} ${food.name}</button>`).join('');
  els.mealLegend.querySelectorAll('.legend-item').forEach(btn => btn.addEventListener('click',()=>{ state.focusId=btn.dataset.id; renderLegend(); renderSimulation(); }));
}

function formatTime(minutes){
  const m = Math.round(minutes);
  if(m < 60) return `${m} 分鐘`;
  const h = Math.floor(m/60), rest = m%60;
  if(h < 24) return rest ? `${h} 小時 ${rest} 分` : `${h} 小時`;
  const d = Math.floor(h/24), rh = h%24;
  return rh ? `${d} 天 ${rh} 小時` : `${d} 天`;
}

function togglePlay(){
  state.playing = !state.playing;
  els.playBtn.textContent = state.playing ? '⏸' : '▶';
  if(state.playing){
    clearInterval(state.timer);
    state.timer = setInterval(()=>{
      const speed = Number(els.speedSelect.value);
      state.time = Math.min(4320, state.time + speed/10);
      els.timeline.value = state.time;
      renderSimulation();
      if(state.time >= 4320){ state.playing=false; els.playBtn.textContent='▶'; clearInterval(state.timer); }
    },100);
  } else clearInterval(state.timer);
}

function jumpStage(direction){
  if(!state.meal.length) return;
  const points = [...new Set(state.meal.flatMap(f => Object.values(f.times).map(Math.round)))].sort((a,b)=>a-b);
  const target = direction > 0 ? points.find(p => p > state.time + 1) : [...points].reverse().find(p => p < state.time - 1);
  state.time = target ?? (direction > 0 ? 4320 : 0);
  els.timeline.value = state.time;
  renderSimulation();
}

function resetAll(){
  state.selected.clear(); state.meal=[]; state.focusId=null; state.time=0; state.playing=false;
  clearInterval(state.timer);
  document.querySelectorAll('.food-card').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.food-card input').forEach(i=>i.checked=false);
  els.selectedCount.textContent='0 種'; els.timeline.value=0; els.playBtn.textContent='▶'; els.mealLegend.innerHTML='';
  renderSimulation();
}

els.loadMealBtn.addEventListener('click', buildMeal);
els.timeline.addEventListener('input', e => { state.time=Number(e.target.value); renderSimulation(); });
els.playBtn.addEventListener('click', togglePlay);
els.prevBtn.addEventListener('click',()=>jumpStage(-1));
els.nextBtn.addEventListener('click',()=>jumpStage(1));
els.resetBtn.addEventListener('click',resetAll);
els.startTourBtn.addEventListener('click',()=>els.tourDialog.showModal());
els.closeTourBtn.addEventListener('click',()=>els.tourDialog.close());
document.querySelectorAll('.challenge-options button').forEach(btn => btn.addEventListener('click',()=>{
  document.querySelectorAll('.challenge-options button').forEach(b=>b.classList.remove('correct','wrong'));
  if(btn.dataset.answer==='water'){
    btn.classList.add('correct');
    els.challengeFeedback.textContent='答對了！水通常最早離開胃部。';
  } else {
    btn.classList.add('wrong');
    els.challengeFeedback.textContent='再想想看：液體通常比固體更快離開胃部。';
  }
}));

renderFoodCards();
renderSimulation();
