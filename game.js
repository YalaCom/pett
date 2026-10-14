'use strict';
/* Arizona Pet: standalone, dependency-free, persistent virtual pet. */
(() => {
  const KEY = 'arizona-pet-save-v1';
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const limit = (v,min=0,max=100) => Math.min(max,Math.max(min,Number(v)||0));
  const today = () => { const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
  const number = n => Math.floor(n).toLocaleString('ru-RU');
  const rand = n => Math.floor(Math.random()*n);
  const pick = a => a[rand(a.length)];
  const ESC = str => String(str).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const items = [
    {id:'kibble',icon:'🥣',name:'Сытный корм',detail:'+18 сытости',price:12,boost:18},
    {id:'burger',icon:'🍔',name:'Бургер «Аризона»',detail:'+32 сытости',price:29,boost:32},
    {id:'pizza',icon:'🍕',name:'Пицца с сыром',detail:'+45 сытости',price:42,boost:45},
    {id:'steak',icon:'🥩',name:'Премиум-ужин',detail:'+65 сытости',price:67,boost:65}
  ];
  const outfits = [
    {id:'classic',icon:'🧥',name:'Стартовый костюм',detail:'Фирменное худи AZ',price:0},
    {id:'street',icon:'🧢',name:'Уличный стиль',detail:'Кепка и тёмный образ',price:120},
    {id:'sheriff',icon:'⭐',name:'Шериф Аризоны',detail:'Значок и форма',price:210},
    {id:'neon',icon:'⚡',name:'Неоновый гонщик',detail:'Бирюзовая куртка',price:280},
    {id:'king',icon:'👑',name:'Король штата',detail:'Корона и роскошь',price:420}
  ];
  const rooms = [
    {id:'loft',icon:'🌆',name:'Пентхаус',detail:'Закат над Аризоной',price:0},
    {id:'desert',icon:'🌵',name:'Пустынная вилла',detail:'Солнце и песок',price:160},
    {id:'pool',icon:'🏝️',name:'Особняк у бассейна',detail:'Бирюзовый рай',price:260},
    {id:'casino',icon:'🎰',name:'Ночной Лас-Вентурас',detail:'Неон и огни казино',price:400}
  ];
  const games = [
    {id:'catch',icon:'💰',name:'Лови монеты',detail:'Собери как можно больше за 20 секунд',reward:'до 80 AZ'},
    {id:'reaction',icon:'⚡',name:'Молниеносная реакция',detail:'Нажми сразу после зелёного сигнала',reward:'до 52 AZ'},
    {id:'memory',icon:'🃏',name:'Найди пары',detail:'Открой все одинаковые картинки',reward:'до 100 AZ'}
  ];
  const achievements = [
    {id:'hello',icon:'🤝',name:'Первое знакомство',desc:'Погладить кота 1 раз',amount:1,stat:'pet',bonus:20},
    {id:'food',icon:'🍔',name:'Шеф-повар',desc:'Покормить кота 10 раз',amount:10,stat:'feed',bonus:55},
    {id:'bath',icon:'🫧',name:'Чистюля',desc:'Искупать кота 5 раз',amount:5,stat:'bath',bonus:45},
    {id:'player',icon:'🎮',name:'Игровой босс',desc:'Сыграть в 10 мини-игр',amount:10,stat:'play',bonus:90},
    {id:'friend',icon:'💖',name:'Лучшие друзья',desc:'Погладить кота 50 раз',amount:50,stat:'pet',bonus:125},
    {id:'voice',icon:'🎤',name:'Говорящий Томик',desc:'Поговорить 5 раз',amount:5,stat:'talk',bonus:60},
    {id:'shopping',icon:'🛍️',name:'Модник штата',desc:'Купить 3 улучшения',amount:3,stat:'buy',bonus:75},
    {id:'veteran',icon:'🏆',name:'Легенда Аризоны',desc:'Достичь 10 уровня',amount:10,stat:'level',bonus:200}
  ];
  const missions = [
    {id:'feed',icon:'🍔',name:'Перекусить',caption:'Покорми 1 раз',target:1,stat:'feed',bonus:25},
    {id:'bath',icon:'🫧',name:'Освежиться',caption:'Помой 1 раз',target:1,stat:'bath',bonus:25},
    {id:'play',icon:'🎮',name:'Время игр',caption:'Сыграй в мини-игру',target:1,stat:'play',bonus:40},
    {id:'pet',icon:'💖',name:'Забота и любовь',caption:'Погладь 5 раз',target:5,stat:'pet',bonus:30}
  ];
  const emptyStats = () => ({feed:0,bath:0,play:0,pet:0,talk:0,buy:0});
  const blank = () => ({
    version:1,name:'Томик',level:1,xp:0,coins:250,food:86,fun:90,energy:84,clean:94,
    sleeping:false,sound:true,room:'loft',outfit:'classic',ownedRooms:['loft'],ownedOutfits:['classic'],
    createdAt:Date.now(),updatedAt:Date.now(),lastDaily:'',dailyDate:today(),
    total:emptyStats(),daily:emptyStats(),missionRewards:[],awards:{}
  });
  function load() {
    const s=blank();
    try {
      const raw=localStorage.getItem(KEY); if (!raw) return s;
      const v=JSON.parse(raw); if(!v || typeof v!=='object')return s;
      for (const k of ['food','fun','energy','clean']) s[k]=limit(v[k]??s[k]);
      for (const k of ['coins','xp','level','createdAt','updatedAt']) s[k]=Number.isFinite(+v[k])?+v[k]:s[k];
      s.coins=limit(Math.floor(s.coins),0,99999999);s.level=limit(Math.floor(s.level),1,999);
      s.xp=limit(Math.floor(s.xp),0,999999);s.createdAt=Math.min(Date.now(),Math.max(1,s.createdAt));
      s.updatedAt=Math.min(Date.now(),Math.max(s.createdAt,s.updatedAt));
      s.name=typeof v.name==='string'?v.name.replace(/[<>]/g,'').trim().slice(0,17)||s.name:s.name;
      s.sleeping=!!v.sleeping;s.sound=typeof v.sound==='boolean'?v.sound:true;
      s.ownedRooms=Array.isArray(v.ownedRooms)?rooms.filter(x=>v.ownedRooms.includes(x.id)).map(x=>x.id):['loft'];
      s.ownedOutfits=Array.isArray(v.ownedOutfits)?outfits.filter(x=>v.ownedOutfits.includes(x.id)).map(x=>x.id):['classic'];
      if(!s.ownedRooms.includes('loft'))s.ownedRooms.push('loft');
      if(!s.ownedOutfits.includes('classic'))s.ownedOutfits.push('classic');
      s.room=s.ownedRooms.includes(v.room)?v.room:'loft';
      s.outfit=s.ownedOutfits.includes(v.outfit)?v.outfit:'classic';
      s.lastDaily=typeof v.lastDaily==='string'?v.lastDaily:'';
      s.dailyDate=typeof v.dailyDate==='string'?v.dailyDate:today();
      for(const k of Object.keys(s.total)){s.total[k]=limit(v.total?.[k],0,10000000);s.daily[k]=limit(v.daily?.[k],0,100000);}
      s.missionRewards=Array.isArray(v.missionRewards)?v.missionRewards.filter(x=>missions.some(m=>m.id===x)):[];
      s.awards=v.awards&&typeof v.awards==='object'?Object.fromEntries(achievements.map(a=>[a.id,!!v.awards[a.id]])):{};
    } catch(e){console.warn('Сохранение повреждено, начинаем заново',e);}
    return s;
  }
  let s=load(),section='home',motion={name:'idle',start:0,end:0},bubbleTimer=0,activeGame=null;
  let lastRender=0,lastTick=performance.now(),lastPet=0,saveTimer=0,recognition=null,voiceBusy=false;
  function save(){s.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){console.warn('Не удалось сохранить питомца',e);}}
  function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,800);}
  function resetDaily(){
    if(s.dailyDate===today())return;
    s.dailyDate=today();s.daily=emptyStats();s.missionRewards=[];save();
  }
  function elapsed(now=Date.now()) {
    const hours=Math.min(Math.max(0,(now-s.updatedAt)/3600000),48);
    if(hours<=0)return;
    s.food=limit(s.food-hours*2.2);
    s.fun=limit(s.fun-hours*(s.sleeping?.32:1.4));
    s.clean=limit(s.clean-hours*(s.sleeping?.43:1.12));
    s.energy=limit(s.energy+hours*(s.sleeping?11:-1.8));
    s.updatedAt=now;
  }
  elapsed();resetDaily();
  function expNeed(lvl=s.level){return 80+lvl*34;}
  function gainXP(value){
    s.xp+=value;
    let leveled=false;
    while(s.xp>=expNeed()&&s.level<999){s.xp-=expNeed();s.level++;s.coins+=30+s.level*6;leveled=true;}
    if(leveled){toast('Новый уровень!', 'Уровень '+s.level+' · получены бонусные AZ');particles('⭐',8);say('Я стал сильнее! Уровень '+s.level+'!');chime('level');}
  }
  function addStat(key,n){s[key]=limit(s[key]+n);}
  function count(key,amount=1){s.total[key]+=amount;resetDaily();s.daily[key]+=amount;}
  function awardIfEarned(){
    for(const a of achievements){
      const value=a.stat==='level'?s.level:s.total[a.stat];
      if(value>=a.amount&&!s.awards[a.id]){
        s.awards[a.id]=true;s.coins+=a.bonus;toast('Достижение: '+a.name,'Награда: +'+a.bonus+' AZ');particles('🏆',6);
      }
    }
  }
  function finishAction(){
    awardIfEarned();render();scheduleSave();
  }
  function toast(title,description=''){
    const root=$('#toastArea');if(!root)return;
    const el=document.createElement('div');el.className='toast';
    el.textContent=title;
    if(description){const small=document.createElement('small');small.textContent=description;el.append(small);}
    root.append(el);setTimeout(()=>el.remove(),3400);
  }
  function say(message,timeout=3300){
    const el=$('#speechBubble');if(!el)return;
    clearTimeout(bubbleTimer);el.textContent=message;el.classList.add('visible');
    bubbleTimer=setTimeout(()=>el.classList.remove('visible'),timeout);
  }
  function particles(char,count=5){
    const root=$('#petParticles');if(!root)return;
    for(let i=0;i<count;i++){
      const p=document.createElement('span');p.className='particle';p.textContent=char;
      p.style.left=(24+rand(52))+'%';p.style.top=(30+rand(38))+'%';
      p.style.setProperty('--dx',(rand(270)-135)+'px');
      p.style.setProperty('--dy',(-70-rand(190))+'px');
      p.style.setProperty('--rot',(rand(120)-60)+'deg');
      p.style.animationDelay=(i*65)+'ms';
      root.append(p);setTimeout(()=>p.remove(),1600+i*65);
    }
  }
  let soundCtx;
  function chime(kind='click'){
    if(!s.sound)return;
    try{
      soundCtx=soundCtx||new(window.AudioContext||window.webkitAudioContext)();
      if(soundCtx.state==='suspended')soundCtx.resume();
      const hz=kind==='level'?[550,660,880]:kind==='bad'?[190,145]:kind==='coin'?[650,900]:[440,570];
      hz.forEach((f,i)=>{const o=soundCtx.createOscillator(),g=soundCtx.createGain(),t=soundCtx.currentTime+i*.075;o.type='sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(soundCtx.destination);o.start(t);o.stop(t+.2);});
    }catch(_){}
  }
  function setMotion(name,ms=1600){motion={name,start:performance.now(),end:performance.now()+ms}; const art=$('#petArt');if(art&&!art.hidden){art.dataset.motion=name;clearTimeout(art._motionTimer);art._motionTimer=setTimeout(()=>{art.dataset.motion='idle';},ms);}}
  function wake(){
    if(!s.sleeping)return;
    s.sleeping=false;document.body.classList.remove('is-sleeping');s.energy=limit(s.energy+3);say('Я проснулся! Где мои вкусняшки? 😺');setMotion('happy',1600);
  }
  function pet(){
    if(performance.now()-lastPet<320)return;
    lastPet=performance.now();wake();addStat('fun',3);addStat('energy',.4);
    count('pet');gainXP(2);setMotion('happy',1550);say(pick(['Мур-р-р! Это приятно! 💕','Ещё погладь! 😻','Ты мой лучший друг!','Я тебя обожаю! ❤️']),2200);
    particles('💖',4);chime();finishAction();
  }
  function dance(){
    wake();
    if(s.energy<7){say('Я устал, дай поспать! 😴');setMotion('sad',1700);return;}
    addStat('energy',-6);addStat('fun',11);addStat('clean',-2);gainXP(6);setMotion('dance',4200);
    say('Танцпол мой! ARIZONA! 🕺',3600);particles('🎵',9);chime('coin');finishAction();
  }
  function feed(id){
    const item=items.find(x=>x.id===id);if(!item)return;
    if(s.coins<item.price){toast('Не хватает AZ','Выиграй монеты в мини-играх');chime('bad');return;}
    wake();if(s.food>=99){say('Я уже наелся! 🥹');return;}
    s.coins-=item.price;addStat('food',item.boost);addStat('fun',4);
    count('feed');gainXP(8);setMotion('eat',2300);
    $('#petScene').classList.add('eat-active');setTimeout(()=>$('#petScene').classList.remove('eat-active'),2100);
    say(pick(['Ам-ням! Очень вкусно! 😋','Обожаю эту еду! 🍔','Спасибо, хозяин!','Вот это вкуснятина!']));
    particles(item.icon,4);chime();finishAction();
  }
  function bath(premium=false){
    wake();if(s.clean>98){say('Я и так чистенький! ✨');return;}
    if(premium&&s.coins<25){toast('Не хватает AZ');return;}
    if(premium)s.coins-=25;
    addStat('clean',premium?70:38);addStat('fun',premium?7:2);count('bath');gainXP(premium?14:9);
    setMotion('bath',2700);const sc=$('#petScene');sc.classList.add('bath-active');setTimeout(()=>sc.classList.remove('bath-active'),2500);
    say(premium?'Спа-день! Вот это кайф! 🫧':'Буль-буль! Теперь я чистый! 💦');particles('🫧',8);chime();finishAction();
  }
  function toggleSleep(){
    if(s.sleeping){wake();toast('Томик проснулся');}
    else{s.sleeping=true;setMotion('sleep',4000);say('Спокойной ночи… 💤',1200);toast('Питомец отдыхает','Энергия восстанавливается даже вне сайта');}
    finishAction();
  }
  function dailyBonus(){
    resetDaily();
    if(s.lastDaily===today()){toast('Бонус уже получен','Заходи завтра');return;}
    s.lastDaily=today();s.coins+=110;gainXP(15);particles('🎁',7);chime('coin');toast('+110 AZ и 15 XP','Ежедневный подарок получен');say('Ура! Подарочки! 🎁');finishAction();
  }
  function claimMission(id){
    const m=missions.find(x=>x.id===id);if(!m||s.missionRewards.includes(id))return;
    if(s.daily[m.stat]<m.target){toast('Задание ещё не выполнено');return;}
    s.missionRewards.push(id);s.coins+=m.bonus;gainXP(8);chime('coin');toast('Задание выполнено!','+'+m.bonus+' AZ и +8 XP');finishAction();
  }
  function setOutfit(id){
    const item=outfits.find(x=>x.id===id);if(!item)return;
    if(!s.ownedOutfits.includes(id)){
      if(s.coins<item.price){toast('Недостаточно AZ');chime('bad');return;}
      s.coins-=item.price;s.ownedOutfits.push(id);count('buy');toast('Новый костюм!',item.name);chime('coin');
    }
    s.outfit=id;setMotion('happy',1800);say('Как тебе мой новый образ? 😎');particles('✨',5);finishAction();
  }
  function setRoom(id){
    const room=rooms.find(x=>x.id===id);if(!room)return;
    if(!s.ownedRooms.includes(id)){
      if(s.coins<room.price){toast('Недостаточно AZ');chime('bad');return;}
      s.coins-=room.price;s.ownedRooms.push(id);count('buy');toast('Новая комната!',room.name);chime('coin');
    }
    s.room=id;setMotion('happy',1600);say('Вау! Вот это хоромы! 🏠');finishAction();
  }
  function changeName(){
    openModal('ИМЯ ПИТОМЦА','СОЗДАЙ ПЕРСОНАЖА',`<p class="modal-copy">Как зовут твоего маленького аризоновца?</p><input class="dialog-input" id="nameInput" placeholder="Имя котика" maxlength="17" value="${ESC(s.name)}"><button class="primary-button" id="saveName">Сохранить имя</button>`);
    $('#saveName').onclick=()=>{
      const name=$('#nameInput').value.trim().replace(/[<>]/g,'').slice(0,17);
      if(!name){toast('Введите имя');return;}
      s.name=name;closeModal();say('Теперь меня зовут '+name+'!');render();save();
    };
    $('#nameInput').focus();
  }
  function gameResult(coins,xp,fun,energy,label,completed=true){
    if(!activeGame)return;
    stopGame();s.coins+=coins;gainXP(xp);addStat('fun',fun);addStat('energy',-energy);addStat('clean',-2);
    count('play');setMotion('happy',2700);particles('💰',7);
    say('Вот это победа! +'+coins+' AZ!');chime('coin');finishAction();
    openModal('ИГРА ОКОНЧЕНА','ТВОЯ НАГРАДА',`<div style="text-align:center;font-size:62px">🏆</div><p class="modal-copy" style="text-align:center">${ESC(label)}</p><div class="game-hud"><span>Получено монет</span><b>+${coins} AZ</b></div><div class="game-hud"><span>Опыт и настроение</span><b>+${xp} XP · +${fun}%</b></div><button id="playAgain" class="primary-button" style="width:100%">Ещё раз</button>`);
    $('#playAgain').onclick=()=>startGame(completed);
  }
  function stopGame(){
    if(!activeGame)return;
    if(activeGame.intervals)activeGame.intervals.forEach(clearInterval);
    if(activeGame.timeouts)activeGame.timeouts.forEach(clearTimeout);
    activeGame=null;
  }
  function openModal(title,kicker,html){
    stopGame();
    $('#modalTitle').textContent=title;$('#modalKicker').textContent=kicker;
    $('#modalContent').innerHTML=html;$('#gameOverlay').classList.remove('hidden');
    document.body.style.overflow='hidden';
  }
  function closeModal(){
    stopGame();if(recognition){try{recognition.stop()}catch(_){}recognition=null;}
    $('#gameOverlay').classList.add('hidden');document.body.style.overflow='';
  }
  function session(kind){activeGame={kind,intervals:[],timeouts:[]};return activeGame;}
  function startGame(id){
    wake();
    if(s.energy<8){toast('Питомец устал','Дай ему поспать перед игрой');return;}
    if(id==='catch')startCatch();
    else if(id==='reaction')startReaction();
    else if(id==='memory')startMemory();
  }
  function startCatch(){
    openModal('ЛОВИ МОНЕТЫ','МИНИ-ИГРА · АРИЗОНА',`<div class="game-hud"><span>⏱ Осталось: <b id="gameSeconds">20</b> сек</span><span>💰 Поймано: <b id="gameScore">0</b></span></div><div class="coin-grid" id="coinGrid">${Array.from({length:12},(_,i)=>`<button class="coin-target" data-coin="${i}">·</button>`).join('')}</div><p class="mini-info">Жми на сияющую монету, пока она не исчезла! Новая появляется каждые 0,8 секунды.</p>`);
    const g=session('catch');g.score=0;g.target=-1;g.ends=Date.now()+20000;
    const move=()=>{
      if(activeGame!==g)return;
      let next=rand(12);if(next===g.target)next=(next+1+rand(10))%12;
      g.target=next;$$('[data-coin]').forEach((b,i)=>{b.classList.toggle('hot',i===next);b.textContent=i===next?'💰':'·';});
    };
    move();g.intervals.push(setInterval(move,800));
    g.intervals.push(setInterval(()=>{if(activeGame!==g)return;const sec=Math.max(0,Math.ceil((g.ends-Date.now())/1000));$('#gameSeconds').textContent=sec;if(sec===0){const reward=Math.min(80,8+g.score*3);gameResult(reward,15+g.score,13,8,'Ты поймал '+g.score+' монет!', 'catch');}},140));
    $('#coinGrid').onclick=e=>{const b=e.target.closest('[data-coin]');if(!b||activeGame!==g)return;if(+b.dataset.coin===g.target){g.score++;$('#gameScore').textContent=g.score;g.target=-1;chime('coin');move();}else{chime('bad');}};
  }
  function startReaction(){
    openModal('ПРОВЕРКА РЕАКЦИИ','МИНИ-ИГРА · АРИЗОНА',`<div class="game-hud"><span>Не торопись</span><b>Сначала дождись зелёного!</b></div><button class="reaction-zone" id="reactionZone" style="width:100%">ЖДИ СИГНАЛА…</button><p class="mini-info">Нажимай только когда поле загорится зелёным. Чем быстрее реакция, тем больше монет!</p>`);
    const g=session('reaction');g.phase='wait';
    g.timeouts.push(setTimeout(()=>{
      if(activeGame!==g)return;g.phase='go';g.started=performance.now();const zone=$('#reactionZone');zone.classList.add('go');zone.textContent='ЖМИ! ⚡';
      g.timeouts.push(setTimeout(()=>{if(activeGame!==g||g.phase!=='go')return;if(g.phase==='go'){g.phase='late';zone.textContent='СЛИШКО ПОЗДНО';zone.classList.remove('go');}},1800));
    },1300+rand(2600)));
    $('#reactionZone').onclick=()=>{
      if(activeGame!==g)return;
      if(g.phase==='wait'){g.phase='early';$('#reactionZone').textContent='РАНО! 😅';$('#reactionZone').classList.add('early');chime('bad');g.timeouts.push(setTimeout(()=>{if(activeGame===g)startReaction();},850));return;}
      if(g.phase!=='go')return;
      g.phase='done';const ms=Math.round(performance.now()-g.started);
      const reward=Math.max(9,Math.min(52,Math.round(60-ms/15)));
      gameResult(reward,19,10,4,'Твоя реакция: '+ms+' мс!','reaction');
    };
  }
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=rand(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
  function startMemory(){
    const deck=shuffle(['🚗','🌵','💎','🎰','🍔','🏆','🧢','💵'].flatMap(x=>[x,x]));
    openModal('НАЙДИ ПАРЫ','МИНИ-ИГРА · АРИЗОНА',`<div class="game-hud"><span>Открыто пар: <b id="pairsCount">0 / 8</b></span><span>Ходы: <b id="movesCount">0</b></span></div><div class="memory-grid" id="memoryGrid">${deck.map((_,i)=>`<button class="memory-tile" data-card="${i}" aria-label="Открыть карточку ${i+1}">?</button>`).join('')}</div><p class="mini-info">Найди 8 пар. Чем меньше ходов, тем выше награда.</p>`);
    const g=session('memory');g.deck=deck;g.flipped=[];g.matched=new Set();g.moves=0;g.lock=false;
    $('#memoryGrid').onclick=e=>{
      const b=e.target.closest('[data-card]');if(!b||activeGame!==g||g.lock)return;
      const i=+b.dataset.card;if(g.flipped.includes(i)||g.matched.has(i))return;
      b.textContent=deck[i];b.classList.add('flipped');g.flipped.push(i);
      if(g.flipped.length!==2)return;
      g.moves++;$('#movesCount').textContent=g.moves;
      const [a,c]=g.flipped;g.lock=true;
      g.timeouts.push(setTimeout(()=>{
        if(activeGame!==g)return;
        if(deck[a]===deck[c]){g.matched.add(a);g.matched.add(c);$$('[data-card]').filter(x=>[a,c].includes(+x.dataset.card)).forEach(x=>x.classList.add('matched'));$('#pairsCount').textContent=(g.matched.size/2)+' / 8';chime('coin');}
        else{[a,c].forEach(n=>{const el=$('[data-card="'+n+'"]');el.textContent='?';el.classList.remove('flipped');});}
        g.flipped=[];g.lock=false;
        if(g.matched.size===16){const reward=Math.max(24,Math.min(100,120-g.moves*4));gameResult(reward,34,17,9,'Ты нашёл все 8 пар за '+g.moves+' ходов!','memory');}
      },650));
    };
  }
  function speakPhrase(text){
    if(!('speechSynthesis' in window))return;
    try{
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.pitch=1.58;u.rate=1.12;u.volume=.9;
      window.speechSynthesis.speak(u);
    }catch(e){console.warn('Озвучка не поддерживается',e);}
  }
  function repeat(text){
    text=String(text).trim().slice(0,140);if(!text)return;
    wake();count('talk');gainXP(4);addStat('fun',3);
    setMotion('talk',Math.max(1900,Math.min(7000,text.length*100)));
    say(text,Math.max(3000,Math.min(6500,text.length*95)));
    speakPhrase(text);chime();finishAction();
  }
  function talkModal(){
    openModal('ГОВОРЯЩИЙ ТОМИК','СКАЖИ ЧТО-НИБУДЬ',`<p class="modal-copy">Я повторю твои слова смешным голосом. Можно говорить в микрофон или написать фразу.</p><button id="micButton" class="primary-button" style="width:100%">🎤 Нажми и говори</button><p id="voiceState" class="mini-info">Для микрофона нужен HTTPS и разрешение браузера. Текст работает без него.</p><div style="display:flex;gap:9px;margin-top:16px"><input id="sayInput" class="dialog-input" maxlength="140" placeholder="Напиши что-нибудь котику…"><button id="sayButton" class="secondary-button">Сказать</button></div>`);
    const sayText=()=>{const v=$('#sayInput').value;if(!v.trim())return;closeModal();repeat(v);};
    $('#sayButton').onclick=sayText;$('#sayInput').onkeydown=e=>{if(e.key==='Enter')sayText();};
    $('#micButton').onclick=()=>{
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){$('#voiceState').textContent='В этом браузере распознавание голоса недоступно. Введи текст ниже.';return;}
      if(!window.isSecureContext){$('#voiceState').textContent='Микрофон требует HTTPS или localhost. Введи текст ниже.';return;}
      if(voiceBusy)return;
      try{
        recognition=new SR();recognition.lang='ru-RU';recognition.interimResults=false;recognition.maxAlternatives=1;voiceBusy=true;
        $('#voiceState').textContent='🎙️ Слушаю тебя…';
        recognition.onresult=e=>{const text=e.results[0][0].transcript;voiceBusy=false;recognition=null;closeModal();repeat(text);};
        recognition.onerror=e=>{voiceBusy=false;$('#voiceState').textContent='Не получилось распознать голос: '+e.error+'. Попробуй текстовый ввод.';recognition=null;};
        recognition.onend=()=>{voiceBusy=false;if($('#voiceState'))$('#voiceState').textContent='Запись завершена. Можешь попробовать ещё раз.';};
        recognition.start();
      }catch(e){voiceBusy=false;$('#voiceState').textContent='Микрофон недоступен. Попробуй написать фразу.';}
    };
  }
  function card({icon,name,desc,badge='',badgeClass='',footer='',attrs='',extraClass=''}) {
    return `<button class="item-card ${extraClass}" ${attrs}><span class="item-icon">${icon}</span>${badge?`<span class="item-badge ${badgeClass}">${badge}</span>`:''}<strong class="item-title">${ESC(name)}</strong><span class="item-desc">${ESC(desc)}</span>${footer?`<span class="item-footer">${footer}</span>`:''}</button>`;
  }
  function renderSection(){
    $$('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.section===section));
    const captions={
      home:['ТВОЙ ИГРОВОЙ МИР','ДОБРО ПОЖАЛОВАТЬ ДОМОЙ','Играй, развивай питомца и открывай новые возможности'],
      food:['РЕСТОРАН ARIZONA','ВРЕМЯ ПОДКРЕПИТЬСЯ','Выбирай еду — сытый питомец счастливее'],
      bath:['СПА И УХОД','ЧИСТОТА — ЗАЛОГ УСПЕХА','Купай и заботься о пушистом друге'],
      wardrobe:['СТИЛЬ АРИЗОНЫ','ОДЕНЬ СВОЕГО ПИТОМЦА','Открывай необычные образы за AZ'],
      games:['МИНИ-ИГРЫ','ЗАРАБОТАЙ МОНЕТЫ','Настоящие мини-игры, награды и опыт'],
      shop:['НЕДВИЖИМОСТЬ','ВЫБЕРИ СВОЙ ДОМ','Новые локации меняют обстановку комнаты'],
      awards:['ТВОЯ ИСТОРИЯ','ДОСТИЖЕНИЯ ШТАТА','Собирай редкие награды за заботу о питомце']
    };
    const [a,b,c]=captions[section]||captions.home;
    $('#contextKicker').textContent=a;$('#contextTitle').textContent=b;$('#contextSubtitle').textContent=c;
    const root=$('#sectionContent');
    if(section==='home'){
      root.innerHTML=`<div class="banner-card"><span class="banner-icon">🐱</span><div><h3>ПРИВЕТ, ДРУГ!</h3><p>Ухаживай за ${ESC(s.name)}, зарабатывай AZ и прокачивай его уровень.</p><button data-action="pet">Погладить питомца ♥</button></div></div>
      <div class="banner-card"><span class="banner-icon">💰</span><div><h3>ПОРА ЗАРАБАТЫВАТЬ</h3><p>Зарабатывай в мини-играх и покупай уникальные костюмы.</p><button data-action="games">К мини-играм →</button></div></div>
      ${card({icon:'🧢',name:'Новые костюмы',desc:'Пять разных образов',attrs:'data-go="wardrobe"'})}
      ${card({icon:'🏡',name:'Крутые комнаты',desc:'Четыре локации',attrs:'data-go="shop"'})}
      ${card({icon:'🎤',name:'Говорящий Томик',desc:'Повторяет твой голос',attrs:'data-action="talk"'})}
      ${card({icon:'🏆',name:'Награды',desc:'Выполняй достижения',attrs:'data-go="awards"'})}`;
    } else if(section==='food'){
      root.innerHTML=items.map(i=>card({icon:i.icon,name:i.name,desc:i.detail,badge:i.price+' AZ',footer:`<span>КУПИТЬ И СЪЕСТЬ</span><span class="buy-tag">→</span>`,attrs:`data-food="${i.id}"`})).join('');
    } else if(section==='bath'){
      root.innerHTML=card({icon:'🚿',name:'Душ',desc:'+38 чистоты · бесплатно',badge:'БЕСПЛАТНО',attrs:'data-wash="free"',footer:'<span>ИСКУПАТЬ</span><span>→</span>'})+
      card({icon:'🫧',name:'Премиум SPA',desc:'+70 чистоты, +7 счастья',badge:'25 AZ',attrs:'data-wash="premium"',footer:'<span>СПА-ПРОЦЕДУРА</span><span>→</span>'})+
      card({icon:'💖',name:'Погладить',desc:'Прибавляет счастье',attrs:'data-action="pet"'})+
      card({icon:'🌙',name:'Тихий час',desc:'Восстановить энергию',attrs:'data-action="sleep"'});
    } else if(section==='wardrobe'){
      root.innerHTML=outfits.map(i=>{const owned=s.ownedOutfits.includes(i.id),chosen=s.outfit===i.id;
        return card({icon:i.icon,name:i.name,desc:i.detail,badge:chosen?'НАДЕТО':owned?'КУПЛЕНО':i.price+' AZ',badgeClass:owned?'owned':'',footer:`<span>${chosen?'ТЕКУЩИЙ ОБРАЗ':owned?'НАДЕТЬ':'КУПИТЬ'}</span><span>→</span>`,attrs:`data-outfit="${i.id}"`,extraClass:chosen?'selected':''});
      }).join('');
    } else if(section==='games'){
      root.innerHTML=games.map(i=>card({icon:i.icon,name:i.name,desc:i.detail,badge:i.reward,footer:'<span>НАЧАТЬ ИГРУ</span><span>▶</span>',attrs:`data-game="${i.id}"`})).join('')+
      card({icon:'🎁',name:'Подарок за вход',desc:'110 AZ каждый день',attrs:'data-action="daily"',footer:'<span>ЗАБРАТЬ</span><span>→</span>'});
    } else if(section==='shop'){
      root.innerHTML=rooms.map(i=>{const owned=s.ownedRooms.includes(i.id),chosen=s.room===i.id;
        return card({icon:i.icon,name:i.name,desc:i.detail,badge:chosen?'ВЫБРАНО':owned?'КУПЛЕНО':i.price+' AZ',badgeClass:owned?'owned':'',footer:`<span>${chosen?'ТВОЙ ДОМ':owned?'ПЕРЕЕХАТЬ':'КУПИТЬ ДОМ'}</span><span>→</span>`,attrs:`data-room="${i.id}"`,extraClass:chosen?'selected':''});
      }).join('');
    } else if(section==='awards'){
      root.innerHTML=achievements.map(a=>{const done=!!s.awards[a.id];return card({icon:done?a.icon:'🔒',name:a.name,desc:a.desc,badge:done?'ПОЛУЧЕНО':'+'+a.bonus+' AZ',badgeClass:done?'owned':'',footer:`<span>${done?'ВЫПОЛНЕНО':Math.min(a.amount,a.stat==='level'?s.level:s.total[a.stat])+' / '+a.amount}</span></span>`,extraClass:'award-card'+(done?'':' locked')});}).join('');
    }
  }
  function renderMissions(){
    $('#missionsList').innerHTML=missions.map(m=>{
      const progress=Math.min(m.target,s.daily[m.stat]),done=s.missionRewards.includes(m.id);
      return `<button class="mission-item" data-mission="${m.id}" title="${done?'Награда получена':progress===m.target?'Забрать награду':'Продолжай выполнять'}" style="background:none;border:0;padding:0;color:inherit;text-align:left;width:100%"><span class="mission-check ${done?'done':''}">${done?'✓':m.icon}</span><span class="mission-details"><strong>${m.name}</strong><small>${done?'Награда получена':progress+'/'+m.target+' · '+m.caption}</small></span><span class="mission-reward">${done?'✓':'+'+m.bonus}</span></button>`;
    }).join('');
  }
  function applyOutfit(){
    $('#petHat').style.display=s.outfit==='street'||s.outfit==='neon'?'':'none';
    $('#petCrown').style.display=s.outfit==='king'?'':'none';
    $('#petSheriff').style.display=s.outfit==='sheriff'?'':'none';
    const colors={classic:'url(#jacket)',street:'#262934',sheriff:'#4f4038',neon:'#156d87',king:'#673c75'};
    $('#shirtShape').setAttribute('fill',colors[s.outfit]||'url(#jacket)');
  }
  function render(){
    for(const k of ['food','fun','energy','clean']){
      $('#'+k+'Number').textContent=Math.round(s[k])+'%';
      $('#'+k+'Bar').style.width=s[k]+'%';
    }
    $('#coinValue').textContent=number(s.coins);$('#levelBadge').textContent=s.level;$('#levelNumber').textContent=s.level;
    $('#petDisplayName').textContent=s.name.toUpperCase();$('#profileName').textContent=s.name;
    const days=Math.max(1,Math.floor((Date.now()-s.createdAt)/86400000)+1);
    $('#profileAge').textContent=days+' '+(days%10===1&&days%100!==11?'день':[2,3,4].includes(days%10)&&![12,13,14].includes(days%100)?'дня':'дней');
    const xpPct=s.xp/expNeed()*100;$('#xpBar').style.width=xpPct+'%';$('#dashXpBar').style.width=xpPct+'%';$('#xpText').textContent=s.xp+' / '+expNeed()+' XP';
    $('#roomLabel').textContent=rooms.find(x=>x.id===s.room)?.name||'Пентхаус';
    $('#petScene').dataset.room=s.room;document.body.classList.toggle('is-sleeping',s.sleeping);
    $('#sleepLetters').classList.toggle('active',s.sleeping);
    $('#sleepButtonText').textContent=s.sleeping?'Разбудить':'Спать';
    $('#soundButton').textContent=s.sound?'♫':'♪̸';$('#soundButton').title=s.sound?'Выключить звук':'Включить звук';
    $('#dailySubtitle').textContent=s.lastDaily===today()?'Уже забрано · приходи завтра':'Забери 110 монет и 15 XP';
    $('#dailyBonus').classList.toggle('claimed',s.lastDaily===today());
    const value=Math.min(s.food,s.fun,s.energy,s.clean);
    $('#moodDescription').textContent=s.sleeping?'Отдыхает и набирается сил':value<25?'Мне срочно нужна твоя помощь!':value<50?'Что-то я немного приуныл…':s.fun>82?'Я сегодня просто счастлив!':'Мне нравится жить в Аризоне!';
    $('#sceneHint').textContent=s.sleeping?'Тсс… котик спит!':'Нажми на котика — он отреагирует!';
    $('#sceneTime').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    const time=new Date();$('#clockText').textContent=time.toLocaleDateString('ru-RU',{day:'numeric',month:'long'}).toUpperCase();
    applyOutfit();renderMissions();renderSection();
    $('#tipText').textContent=value<32?'Срочно подними низкие показатели котика. Они снижаются со временем.':'Совет: сон повышает энергию даже когда ты закрыл сайт. Мини-игры помогают заработать AZ!';
  }
  function navigate(to){
    if(!['home','food','bath','wardrobe','games','shop','awards'].includes(to))return;
    section=to;renderSection();$('#controlPanel').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  document.addEventListener('click',e=>{
    const n=e.target.closest('[data-section]');if(n){navigate(n.dataset.section);return;}
    const food=e.target.closest('[data-food]');if(food){feed(food.dataset.food);return;}
    const wash=e.target.closest('[data-wash]');if(wash){bath(wash.dataset.wash==='premium');return;}
    const outfit=e.target.closest('[data-outfit]');if(outfit){setOutfit(outfit.dataset.outfit);return;}
    const room=e.target.closest('[data-room]');if(room){setRoom(room.dataset.room);return;}
    const game=e.target.closest('[data-game]');if(game){startGame(game.dataset.game);return;}
    const mission=e.target.closest('[data-mission]');if(mission){claimMission(mission.dataset.mission);return;}
    const go=e.target.closest('[data-go]');if(go){navigate(go.dataset.go);return;}
    const action=e.target.closest('[data-action]');if(action){
      const a=action.dataset.action;
      if(a==='food')navigate('food');else if(a==='bath')bath();else if(a==='games')navigate('games');else if(a==='pet')pet();
      else if(a==='dance')dance();else if(a==='sleep')toggleSleep();else if(a==='talk')talkModal();else if(a==='daily')dailyBonus();
    }
  });
  $('#petSvg').addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;pet();});
  $('#petArt').addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;pet();});
  $('#roomButton').onclick=()=>navigate('shop');
  $('#renameButton').onclick=changeName;$('#dailyBonus').onclick=dailyBonus;
  $('#soundButton').onclick=()=>{s.sound=!s.sound;render();save();if(s.sound)chime('coin');};
  $('#closeModal').onclick=closeModal;
  $('#gameOverlay').addEventListener('click',e=>{if(e.target.id==='gameOverlay')closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#gameOverlay').classList.contains('hidden'))closeModal();});
  window.addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{elapsed();resetDaily();render();}});
  setInterval(()=>{elapsed();resetDaily();if(s.sleeping&&s.energy>=100){s.sleeping=false;toast('Котик выспался!');say('С добрым утром! ☀️');setMotion('happy',1200);}render();save();},60000);
  /* Frame-accurate animator: eyes, ears, head, hands, tail and body are independent vector layers.
     No sprite-sheet cropping, bleed or switching-frame jitter. */
  const part={head:$('#petHead'),body:$('#petBody'),left:$('#petLeftArm'),right:$('#petRightArm'),tail:$('#petTail'),float:$('#petFloat'),leftEye:$('#eyeLeft'),rightEye:$('#eyeRight'),irisLeft:$('#irisLeft'),irisRight:$('#irisRight'),pupilLeft:$('#pupilLeft'),pupilRight:$('#pupilRight'),mouth:$('#mouthPath'),openMouth:$('#openMouth'),browLeft:$('#browLeft'),browRight:$('#browRight')};
  let lookX=0,lookY=0,targetX=0,targetY=0;
  $('#petScene').addEventListener('pointermove',e=>{
    const rect=$('#petScene').getBoundingClientRect();
    targetX=limit((e.clientX-(rect.left+rect.width*.5))/rect.width*25,-10,10);
    targetY=limit((e.clientY-(rect.top+rect.height*.46))/rect.height*18,-7,7);
  });
  $('#petScene').addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
  function animate(now){
    const t=now/1000,elapsed=now-motion.start,progress=limit(elapsed/(motion.end-motion.start),0,1);
    const active=now<motion.end?motion.name:'idle';
    const h=Math.sin(t*1.45)*2.6;
    let bounce=Math.sin(t*2.4)*3.5,tilt=h,armL=Math.sin(t*1.35)*3,armR=-armL,tail=Math.sin(t*2.8)*11,scale=1+Math.sin(t*1.8)*.011;
    let blink=(t%4.9<.115||t%4.9>.135&&t%4.9<.17),mouthOpen=false,sad=false,angry=false;
    if(s.sleeping){bounce=-9;tilt=12+Math.sin(t*1.2)*2;armL=-8;armR=8;tail=Math.sin(t*.7)*3;blink=true;scale=1+Math.sin(t*1.2)*.02;}
    else if(active==='happy'){bounce=-Math.abs(Math.sin(t*11))*17;tilt=Math.sin(t*10)*7;armL=-25-Math.sin(t*12)*15;armR=-(35+Math.sin(t*16)*17);mouthOpen=true;tail=Math.sin(t*9)*21;}
    else if(active==='eat'){bounce=Math.sin(t*15)*2;tilt=Math.sin(t*15)*6;armR=-18;mouthOpen=Math.sin(t*18)>-.25;tail=Math.sin(t*5)*13;}
    else if(active==='dance'){bounce=-Math.abs(Math.sin(t*10))*21;tilt=Math.sin(t*9)*16;armL=-58+Math.sin(t*10)*27;armR=-57-Math.sin(t*10)*27;mouthOpen=true;tail=Math.sin(t*12)*23;scale=1+Math.sin(t*8)*.06;}
    else if(active==='bath'){bounce=Math.sin(t*15)*4;tilt=Math.sin(t*24)*8;armL=-30;armR=30;blink=Math.sin(t*8)>.5;}
    else if(active==='talk'){tilt=Math.sin(t*5)*4;mouthOpen=Math.sin(t*14)>-.4;armR=-25+Math.sin(t*7)*17;}
    else if(active==='sad'){bounce=-10;tilt=-10;armL=10;armR=-4;sad=true;}
    else if(active==='angry'){tilt=Math.sin(t*26)*7;armL=25;armR=-25;angry=true;}
    if(!s.sleeping&&Math.min(s.food,s.fun,s.energy,s.clean)<23&&active==='idle'){sad=true;tilt=-6;bounce=-5;}
    lookX+=(targetX-lookX)*.08;lookY+=(targetY-lookY)*.08;
    part.float.style.transform=`translateY(${bounce}px) scale(${scale})`;
    part.head.style.transform=`rotate(${tilt}deg) translateY(${Math.sin(t*1.4)*2}px)`;
    part.body.style.transform=`scaleY(${1+Math.sin(t*1.9)*.01})`;
    part.left.style.transform=`rotate(${armL}deg)`;
    part.right.style.transform=`rotate(${armR}deg)`;
    part.tail.style.transform=`rotate(${tail}deg)`;
    part.leftEye.style.transform=part.rightEye.style.transform=`scaleY(${blink?.045:angry?.68:sad?.72:1})`;
    for(const p of [part.irisLeft,part.irisRight,part.pupilLeft,part.pupilRight])p.style.transform=`translate(${lookX}px,${lookY}px)`;
    part.mouth.style.opacity=mouthOpen?'0':'1';part.openMouth.style.opacity=mouthOpen?'1':'0';
    if(sad){part.mouth.setAttribute('d','M188 305 Q210 276 235 306');part.browLeft.setAttribute('d','M137 163 Q164 163 187 181');part.browRight.setAttribute('d','M230 181 Q253 163 276 163');}
    else if(angry){part.mouth.setAttribute('d','M184 305 Q209 286 237 305');part.browLeft.setAttribute('d','M135 156 L189 184');part.browRight.setAttribute('d','M227 184 L279 156');}
    else{part.mouth.setAttribute('d','M210 287 Q194 310 183 290 M210 287 Q227 310 239 290');part.browLeft.setAttribute('d','M137 172 Q161 160 187 174');part.browRight.setAttribute('d','M230 174 Q254 160 276 173');}
    requestAnimationFrame(animate);
  }
  render();
  say('Привет! Я '+s.name+'! Погладь меня! ❤️',4700);
  requestAnimationFrame(animate);
})();
