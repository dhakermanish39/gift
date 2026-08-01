/* ==================================================
   CONFIG — edit these two lines to personalize
   ================================================== */
const START_DATE = '2024-01-01'; // <-- change to the date you two started talking/met (YYYY-MM-DD)
const START_LABEL = "hum baat karte hain"; // shown after the number, e.g. "125 din se hum baat karte hain"
const PASSCODE = '1122'; // <-- change this to any 4-digit code you want (e.g. an anniversary date like "0514")

/* ---------------- days-together badge ---------------- */
function updateDaysBadge(){
  const badge = document.getElementById('daysBadge');
  if(!badge) return;
  const start = new Date(START_DATE+'T00:00:00');
  if(isNaN(start.getTime())){ badge.style.display='none'; return; }
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now - start) / (1000*60*60*24)));
  badge.textContent = `💫 ${diffDays} din se ${START_LABEL}`;
}
updateDaysBadge();
setInterval(updateDaysBadge, 60000);

/* ---------------- passcode lock screen ---------------- */
(function initLockScreen(){
  const dotsWrap = document.getElementById('passcodeDots');
  const dots = dotsWrap.querySelectorAll('.dot');
  const notesWrap = document.getElementById('lockNotes');
  let entered = '';

  // faint drifting music notes in the background
  const noteChars = ['♪','♫','♬','🎵','🎶'];
  for(let i=0;i<16;i++){
    const n = document.createElement('span');
    n.textContent = noteChars[Math.floor(Math.random()*noteChars.length)];
    n.style.position='absolute';
    n.style.left = Math.random()*100+'%';
    n.style.top = Math.random()*100+'%';
    n.style.fontSize = (16+Math.random()*20)+'px';
    n.style.opacity = 0.25+Math.random()*0.4;
    n.style.animation = `bob ${4+Math.random()*3}s ease-in-out infinite`;
    n.style.animationDelay = (Math.random()*3)+'s';
    notesWrap.appendChild(n);
  }

  function updateDots(){
    dots.forEach((d,i)=> d.classList.toggle('filled', i < entered.length));
  }

  function wrongCode(){
    dotsWrap.classList.add('shake');
    setTimeout(()=>{
      dotsWrap.classList.remove('shake');
      entered='';
      updateDots();
    },400);
  }

  function tryUnlock(){
    if(entered.length !== 4) return;
    if(entered === PASSCODE){
      const lockPage = document.getElementById('page-lock');
      lockPage.style.transition='opacity .6s ease, transform .6s ease';
      lockPage.style.opacity='0';
      lockPage.style.transform='scale(1.05)';
      setTimeout(()=>{
        goToPage('page-welcome');
        lockPage.style.opacity='';
        lockPage.style.transform='';
      },600);
    } else {
      wrongCode();
    }
  }

  document.getElementById('keypad').addEventListener('click', (e)=>{
    const btn = e.target.closest('.key');
    if(!btn) return;
    const k = btn.dataset.k;
    if(k === 'back'){
      entered = entered.slice(0,-1);
      updateDots();
      return;
    }
    if(k === '*') return; // decorative key, no-op
    if(entered.length >= 4) return;
    entered += k;
    updateDots();
    if(entered.length === 4) setTimeout(tryUnlock, 150);
  });

  document.addEventListener('keydown', (e)=>{
    if(!document.getElementById('page-lock').classList.contains('active')) return;
    if(/^[0-9]$/.test(e.key) && entered.length < 4){
      entered += e.key; updateDots();
      if(entered.length===4) setTimeout(tryUnlock,150);
    } else if(e.key === 'Backspace'){
      entered = entered.slice(0,-1); updateDots();
    }
  });
})();

/* ---------------- cursor glow + trail ---------------- */
const glow = document.getElementById('cursorGlow');
let lastTrail = 0;
document.addEventListener('mousemove', e=>{
  glow.style.left = e.clientX+'px';
  glow.style.top = e.clientY+'px';
  const now = Date.now();
  if(now-lastTrail>40){
    lastTrail = now;
    const t = document.createElement('div');
    t.className='trail';
    t.style.left = e.clientX+'px';
    t.style.top = e.clientY+'px';
    document.body.appendChild(t);
    t.animate([{opacity:0.7,transform:'scale(1)'},{opacity:0,transform:'scale(0.2)'}],{duration:600,easing:'ease-out'});
    setTimeout(()=>t.remove(),620);
  }
});
document.addEventListener('touchmove', e=>{
  const touch = e.touches[0]; if(!touch) return;
  glow.style.left = touch.clientX+'px';
  glow.style.top = touch.clientY+'px';
});

/* ---------------- ambient floating hearts (global) ---------------- */
function spawnAmbientHeart(){
  const h = document.createElement('div');
  h.className='heart-float';
  h.textContent = ['💗','💕','🌸','✨'][Math.floor(Math.random()*4)];
  h.style.left = Math.random()*100+'vw';
  h.style.setProperty('--drift',(Math.random()*80-40)+'px');
  h.style.animationDuration = (6+Math.random()*5)+'s';
  h.style.fontSize = (14+Math.random()*14)+'px';
  document.body.appendChild(h);
  setTimeout(()=>h.remove(),12000);
}
setInterval(spawnAmbientHeart, 900);

/* ---------------- floating bubbles (global, subtle) ---------------- */
function spawnBubble(){
  const b = document.createElement('div');
  b.className='bubble';
  const size = 8+Math.random()*22;
  b.style.width=size+'px';b.style.height=size+'px';
  b.style.left = Math.random()*100+'vw';
  b.style.setProperty('--bx',(Math.random()*60-30)+'px');
  b.style.animationDuration=(7+Math.random()*6)+'s';
  document.body.appendChild(b);
  setTimeout(()=>b.remove(),14000);
}
setInterval(spawnBubble, 1400);

/* ---------------- simple ambient music via WebAudio ---------------- */
let audioCtx=null, musicOn=false, musicNodes=[];
function startMusic(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') audioCtx.resume();
  const notes = [523.25,587.33,659.25,698.46,783.99,659.25,587.33]; // gentle piano-ish scale loop
  let i=0;
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.06;
  masterGain.connect(audioCtx.destination);
  musicNodes.push(masterGain);
  function playNote(){
    if(!musicOn) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type='sine';
    osc.frequency.value = notes[i % notes.length];
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+0.9);
    osc.connect(g); g.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime+0.95);
    i++;
    if(musicOn) setTimeout(playNote, 480);
  }
  playNote();
}
function stopMusic(){ musicOn=false; }

const bgSong = document.getElementById('bgSong');
let realSongAvailable = null; // null = unknown, true/false once checked
document.getElementById('musicToggle').addEventListener('click', function(){
  musicOn = !musicOn;
  this.textContent = musicOn ? '🔊' : '🔈';
  if(!musicOn){
    bgSong.pause();
    stopMusic();
    return;
  }
  // try the real song.mp3 first; if it fails to load, fall back to synthesized music
  bgSong.volume = 0.5;
  const playPromise = bgSong.play();
  if(playPromise && playPromise.then){
    playPromise.then(()=>{ realSongAvailable = true; })
    .catch(()=>{ realSongAvailable = false; if(musicOn) startMusic(); });
  }
  bgSong.onerror = ()=>{ realSongAvailable = false; if(musicOn && bgSong.paused) startMusic(); };
});

/* ---------------- petals helper ---------------- */
function spawnPetals(count, container){
  for(let k=0;k<count;k++){
    setTimeout(()=>{
      const p = document.createElement('div');
      p.className='petal';
      p.textContent = Math.random()>0.5 ? '🌹' : '🌸';
      p.style.left = Math.random()*100+'vw';
      p.style.setProperty('--px',(Math.random()*120-60)+'px');
      p.style.animationDuration = (4+Math.random()*3)+'s';
      p.style.fontSize=(14+Math.random()*12)+'px';
      document.body.appendChild(p);
      setTimeout(()=>p.remove(),7500);
    }, k*90);
  }
}

/* ---------------- page navigation ---------------- */
function goToPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

/* ================= PAGE 1: Welcome ================= */
setTimeout(()=>{
  document.getElementById('loaderWrap').style.display='none';
  const wc = document.getElementById('welcome-content');
  wc.classList.add('show');
},2200);

document.getElementById('openSurpriseBtn').addEventListener('click', ()=>{
  goToPage('page-balloons');
});

/* ================= PAGE 2: Balloons ================= */
const balloonMessages = [
  {emoji:'😊', text:'Aapki smile bahut pyari hai 😊', color:'#ff8fb3'},
  {emoji:'🌹', text:'Ye virtual rose sirf aapke liye 🌹', color:'#ff5f96'},
  {emoji:'🍫', text:'Chocolate time 🍫', color:'#e8467e'},
  {emoji:'🔓', text:'Secret page unlock ho gaya 🔓', color:'#c1547c'},
  {emoji:'🌙', text:'Aap jitni sochti hain, us se zyada khaas hain 🌙', color:'#a8447a'},
  {emoji:'⭐', text:'Har din aapke saath thoda aur roshan lagta hai ⭐', color:'#ff5f96'},
];
const balloonColors = ['#ff8fb3','#ff5f96','#e8467e','#c1547c','#ffb3c9','#e35d95'];
const balloonField = document.getElementById('balloonField');
let poppedCount = 0;

function layoutBalloons(){
  balloonField.innerHTML='';
  const positions = [];
  const cols = window.innerWidth < 600 ? 3 : 6;
  balloonMessages.forEach((m,idx)=>{
    const b = document.createElement('div');
    b.className='balloon';
    b.style.background = `radial-gradient(circle at 32% 28%, #ffffff55, ${balloonColors[idx%balloonColors.length]})`;
    const col = idx % cols;
    const row = Math.floor(idx/cols);
    const leftPct = (col+0.5)/cols*100;
    b.style.left = `calc(${leftPct}% - 39px)`;
    b.style.top = (10 + row*46 + Math.random()*8) + '%';
    b.style.animationDelay = (Math.random()*2)+'s';
    b.dataset.idx = idx;
    b.addEventListener('click', ()=>popBalloon(b, idx));
    balloonField.appendChild(b);
  });
}
layoutBalloons();

function popBalloon(b, idx){
  if(b.classList.contains('popped')) return;
  b.classList.add('popped');
  poppedCount++;
  document.getElementById('balloonProgress').textContent = `${poppedCount} / ${balloonMessages.length} popped`;
  // burst particles
  for(let i=0;i<10;i++){
    const p = document.createElement('div');
    p.style.position='absolute';
    p.style.left = b.style.left; p.style.top = b.style.top;
    p.style.width='6px';p.style.height='6px';p.style.borderRadius='50%';
    p.style.background = balloonColors[idx%balloonColors.length];
    p.style.zIndex=15;
    balloonField.appendChild(p);
    const ang = Math.random()*Math.PI*2, dist=40+Math.random()*60;
    p.animate([
      {transform:'translate(0,0)',opacity:1},
      {transform:`translate(${Math.cos(ang)*dist}px, ${Math.sin(ang)*dist}px)`,opacity:0}
    ],{duration:600,easing:'ease-out'});
    setTimeout(()=>p.remove(),650);
  }
  // message card
  const msg = balloonMessages[idx];
  const card = document.createElement('div');
  card.className='msg-card glass';
  card.style.background = `linear-gradient(135deg, ${msg.color}dd, #5b2148cc)`;
  card.innerHTML = `<p>${msg.text}</p>`;
  balloonField.appendChild(card);
  requestAnimationFrame(()=>card.classList.add('show'));
  setTimeout(()=>{
    card.classList.remove('show');
    setTimeout(()=>card.remove(),450);
  },1900);

  if(poppedCount === balloonMessages.length){
    setTimeout(()=>{
      document.getElementById('toTeddyBtn').style.display='inline-block';
    },800);
  }
}
document.getElementById('toTeddyBtn').addEventListener('click', ()=>{
  goToPage('page-teddy');
  startTeddyGame();
});

/* ================= PAGE 3: Teddy heart game ================= */
let teddyHeartsCollected = 0;
let teddyGameActive = false;
let teddySpawnInterval = null;
function startTeddyGame(){
  if(teddyGameActive) return;
  teddyGameActive = true;
  teddyHeartsCollected = 0;
  document.getElementById('heartCounter').textContent = 'Hearts collected: 0 / 5';
  document.getElementById('teddyEmoji').textContent = '🧸';
  const stage = document.getElementById('teddyStage');
  teddySpawnInterval = setInterval(()=>{
    if(!teddyGameActive) return;
    const h = document.createElement('div');
    h.className='falling-heart';
    h.textContent = '💖';
    h.style.left = (Math.random()*85)+'%';
    h.style.animationDuration = (2.6+Math.random()*1.4)+'s';
    stage.appendChild(h);
    h.addEventListener('click', ()=>{
      if(!teddyGameActive) return;
      teddyHeartsCollected++;
      document.getElementById('heartCounter').textContent = `Hearts collected: ${teddyHeartsCollected} / 5`;
      h.remove();
      if(teddyHeartsCollected>=5){
        finishTeddyGame();
      }
    });
    setTimeout(()=>h.remove(), 4200);
  }, 700);
}
function finishTeddyGame(){
  teddyGameActive=false;
  clearInterval(teddySpawnInterval);
  document.getElementById('teddyEmoji').textContent = '🥰';
  document.querySelectorAll('.falling-heart').forEach(el=>el.remove());
  setTimeout(()=>{
    goToPage('page-gift');
  },1400);
}

/* ================= PAGE 4: Gift box ================= */
const giftBox = document.getElementById('giftBox');
let giftOpened=false;
giftBox.addEventListener('click', ()=>{
  if(giftOpened) return;
  giftOpened = true;
  giftBox.classList.add('shaking');
  document.getElementById('giftHint').textContent = 'Opening…';
  setTimeout(()=>{
    giftBox.textContent = '🎉';
    giftBox.classList.remove('shaking');
    spawnPetals(24);
    setTimeout(()=>{
      goToPage('page-bouquet');
      renderBouquet();
    },1100);
  },900);
});

/* ================= PAGE 5: Bouquet of Reasons ================= */
const bouquetReasons = [
  { icon:'🌸', color:'#ffd6e6', text:'aap ghar jaisi feel deti ho' },
  { icon:'🌺', color:'#ffe3ee', text:'aapki hansi meri favorite awaaz hai' },
  { icon:'💐', color:'#e6ddff', text:'aap ordinary din ko khaas bana deti ho' },
  { icon:'🌷', color:'#dcd0ff', text:'aap meri calm aur meri spark ho' },
  { icon:'🌻', color:'#ffe8d6', text:'aap mujhe better banne ke liye inspire karti ho' },
  { icon:'🌼', color:'#fff2c9', text:"ye hamesha aap hi ho, aap hi rahogi" },
];
let bouquetRendered = false;
function renderBouquet(){
  if(bouquetRendered) return;
  bouquetRendered = true;
  const grid = document.getElementById('bouquetGrid');
  bouquetReasons.forEach((r,i)=>{
    const item = document.createElement('div');
    item.className='bouquet-item';
    item.style.opacity='0';
    item.style.transform='translateY(10px)';
    item.style.transition='opacity .5s ease, transform .5s ease';
    item.innerHTML = `<div class="bloom" style="background:${r.color};">${r.icon}</div><p>${r.text}</p>`;
    grid.appendChild(item);
    setTimeout(()=>{ item.style.opacity='1'; item.style.transform='translateY(0)'; }, 150*i);
  });
}
document.getElementById('toLetterBtn').addEventListener('click', ()=>{
  goToPage('page-letter');
  startLetter();
});

/* ================= PAGE 6: Love Letter typewriter ================= */
const letterFull = `Dear Anuksha Ji,

Kabhi kabhi kuch alfaaz kaafi nahi hote jo hum mehsoos karte hain,
par phir bhi main koshish zaroor karna chahta hoon.

Aapki hansi, aapki baatein, aur aapka andaaz — sab kuch is choti si duniya ko thoda aur roshan bana deta hai.

Ye chand balloons, ye teddy, ye chota sa gift — sirf ek bahana hai ye batane ka ki aap kitni khaas hain.

Umeed hai ye surprise aapke chehre par ek muskaan le aaya hoga 🌸

Hamesha khush rahiye.

Aapka,
Ek shubhchintak 🧸❤️`;

let letterStarted=false;
function startLetter(){
  if(letterStarted) return;
  letterStarted = true;
  spawnPetals(14);
  const el = document.getElementById('letterText');
  el.innerHTML='';
  const cursorSpan = document.createElement('span');
  cursorSpan.className='cursor-blink';
  cursorSpan.textContent='\u00A0';
  let i=0;
  function typeChar(){
    if(i<=letterFull.length){
      el.textContent = letterFull.slice(0,i);
      el.appendChild(cursorSpan);
      i++;
      setTimeout(typeChar, 26);
    } else {
      document.getElementById('toQuizBtn').style.display='inline-block';
    }
  }
  typeChar();
}
document.getElementById('toQuizBtn').addEventListener('click', ()=>{
  goToPage('page-quiz');
  startQuiz();
});

/* ================= PAGE 6: Love Quiz ================= */
const quizQuestions = [
  { q:"Aapko sabse zyada kya pasand hai?", opts:["Lambi baaton wali raatein 🌙","Achanak wale surprises 🎁","Ek dusre ko tease karna 😏","Comfortable silence 🤍"] },
  { q:"Ek perfect din kaisa hoga?", opts:["Ghar par movie + snacks 🍿","Kahin ghumne jaana 🚗","Baatein karte karte time nikal jaye 💬","Kuch naya try karna ✨"] },
  { q:"Sabse pyara gesture kaunsa lagta hai?", opts:["Good morning/night message 🌸","Chhoti chhoti cheezon ka khayal 🎀","Achanak tareef karna 💐","Bas saath hona 🤗"] },
  { q:"Agar ek gift choose karna ho?", opts:["Handwritten letter 💌","Teddy bear 🧸","Chocolates 🍫","Surprise plan 🎈"] },
];
let quizIndex = 0;
let quizStarted = false;
function startQuiz(){
  if(quizStarted) return;
  quizStarted = true;
  quizIndex = 0;
  renderQuizQuestion();
}
function renderQuizQuestion(){
  const body = document.getElementById('quizBody');
  const dots = quizQuestions.map((_,i)=>`<span class="quiz-dot ${i<quizIndex?'done':''}"></span>`).join('');
  const q = quizQuestions[quizIndex];
  body.innerHTML = `
    <div class="quiz-progress-dots">${dots}</div>
    <p class="quiz-question">${q.q}</p>
    <div class="quiz-options">
      ${q.opts.map((o,i)=>`<button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}
    </div>
  `;
  body.querySelectorAll('.quiz-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      body.querySelectorAll('.quiz-opt').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>{
        quizIndex++;
        if(quizIndex < quizQuestions.length){
          renderQuizQuestion();
        } else {
          renderQuizResult();
        }
      },350);
    });
  });
}
function renderQuizResult(){
  const body = document.getElementById('quizBody');
  const pct = 96 + Math.floor(Math.random()*4); // always a sweet high score
  body.innerHTML = `
    <div class="quiz-result">
      <div class="pct">${pct}%</div>
      <p>Match Compatibility 💞</p>
      <div class="quiz-meter"><div class="quiz-meter-fill" id="meterFill"></div></div>
      <p style="font-size:14px;opacity:.85;">Result thoda biased ho sakta hai… kyunki aap dono ka connection waise hi kaafi special hai 🌸</p>
      <button class="btn" id="toFramesBtn" style="margin-top:16px;">Next 🖼️</button>
    </div>
  `;
  requestAnimationFrame(()=>{
    document.getElementById('meterFill').style.width = pct+'%';
  });
  document.getElementById('toFramesBtn').addEventListener('click', ()=>{
    goToPage('page-frames');
    startFrames();
  });
}

/* ================= PAGE 8: Us in a Few Frames (carousel) ================= */
const framesData = [
  { icon:'💬', src:'photos/frame1.jpg', caption:'hamari har baat mujhe pyari lagti hai' },
  { icon:'🤍', src:'photos/frame2.jpg', caption:'har chhota, quiet pal aapke saath sabse accha lagta hai' },
  { icon:'🌹', src:'photos/frame3.jpg', caption:"main hamesha yehi choose karunga — hum, bilkul aise hi, har baar" },
];
let framesIndex = 0;
let framesStarted = false;
function startFrames(){
  if(framesStarted){ renderFrame(); return; }
  framesStarted = true;
  framesIndex = 0;
  const thumbs = document.getElementById('framesThumbs');
  thumbs.innerHTML = framesData.map((f,i)=>`<span data-i="${i}">${f.icon}</span>`).join('');
  thumbs.querySelectorAll('span').forEach(s=>{
    s.addEventListener('click', ()=>{ framesIndex = parseInt(s.dataset.i); renderFrame(); });
  });
  document.getElementById('framesPrev').addEventListener('click', ()=>{
    framesIndex = (framesIndex - 1 + framesData.length) % framesData.length;
    renderFrame();
  });
  document.getElementById('framesNext').addEventListener('click', ()=>{
    framesIndex = (framesIndex + 1) % framesData.length;
    renderFrame();
  });
  renderFrame();
}
function renderFrame(){
  const f = framesData[framesIndex];
  const imgWrap = document.getElementById('framesImage');
  imgWrap.innerHTML = `<img src="${f.src}" alt="" onerror="this.parentElement.innerHTML='${f.icon}';">`;
  document.getElementById('framesCounter').textContent = `${String(framesIndex+1).padStart(2,'0')} / ${String(framesData.length).padStart(2,'0')}`;
  document.getElementById('framesCaption').textContent = f.caption;
  document.querySelectorAll('#framesThumbs span').forEach((s,i)=>{
    s.classList.toggle('active', i===framesIndex);
  });
}
document.getElementById('toGalleryBtn2').addEventListener('click', ()=>{
  goToPage('page-gallery');
  renderGallery();
});

/* ================= PAGE 9: Memory Gallery ================= */
const memoryPhotos = [
  { src:'WhatsApp Image 2026-08-01 at 1.43.57 PM (1).jpeg', caption:'Memory 1' },
  { src:'WhatsApp Image 2026-08-01 at 1.43.57 PM.jpeg', caption:'Memory 2' },
  { src:'WhatsApp Image 2026-08-01 at 1.43.58 PM (1).jpeg', caption:'Memory 3' },
  { src:'WhatsApp Image 2026-08-01 at 1.43.58 PM.jpeg', caption:'Memory 4' },
  { src:'WhatsApp Image 2026-08-01 at 1.44.01 PM.jpeg', caption:'Memory 5' },
  { src:'WhatsApp Image 2026-08-01 at 1.44.43 PM.jpeg', caption:'Memory 6' },
];
let galleryRendered = false;
function renderGallery(){
  if(galleryRendered) return;
  galleryRendered = true;
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML='';
  memoryPhotos.forEach(photo=>{
    const item = document.createElement('div');
    item.className='gallery-item';
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.caption;
    img.onerror = ()=>{
      item.innerHTML = `<span class="fallback">🌸</span><div class="cap">${photo.caption}</div>`;
    };
    item.appendChild(img);
    const cap = document.createElement('div');
    cap.className='cap';
    cap.textContent = photo.caption;
    item.appendChild(cap);
    item.addEventListener('click', ()=>openLightbox(photo));
    grid.appendChild(item);
  });
}
function openLightbox(photo){
  let lb = document.getElementById('lightbox');
  if(!lb){
    lb = document.createElement('div');
    lb.id='lightbox';
    lb.className='lightbox';
    lb.innerHTML = `<span class="lightbox-close">&times;</span><div><img id="lightboxImg"><p class="cap-big" id="lightboxCap"></p></div>`;
    document.body.appendChild(lb);
    lb.querySelector('.lightbox-close').addEventListener('click', ()=>lb.classList.remove('show'));
    lb.addEventListener('click', (e)=>{ if(e.target===lb) lb.classList.remove('show'); });
  }
  lb.querySelector('#lightboxImg').src = photo.src;
  lb.querySelector('#lightboxCap').textContent = photo.caption;
  lb.classList.add('show');
}
document.getElementById('toWishBtn').addEventListener('click', ()=>{
  goToPage('page-wish');
  startStars();
});

/* ================= PAGE 8: Falling Stars + Wish ================= */
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');
let stars = [];
let starsAnimId = null;
function resizeStarsCanvas(){
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
}
function initStars(){
  resizeStarsCanvas();
  stars = [];
  const count = window.innerWidth < 600 ? 60 : 110;
  for(let i=0;i<count;i++){
    stars.push({
      x:Math.random()*starsCanvas.width,
      y:Math.random()*starsCanvas.height,
      r:0.6+Math.random()*1.6,
      tw:Math.random()*Math.PI*2,
      speed:0.02+Math.random()*0.03
    });
  }
}
let shootingStars = [];
function spawnShootingStar(){
  shootingStars.push({
    x:Math.random()*starsCanvas.width*0.6,
    y:Math.random()*starsCanvas.height*0.3,
    vx:6+Math.random()*4,
    vy:3+Math.random()*2,
    life:1
  });
}
function spawnShootingStarFrom(x,y){
  const angle = Math.PI*0.15 + Math.random()*Math.PI*0.2; // gentle downward-right burst
  const speed = 7+Math.random()*3;
  shootingStars.push({
    x, y,
    vx: Math.cos(angle)*speed,
    vy: Math.sin(angle)*speed,
    life:1
  });
}
let sparkleBursts = [];
function spawnSparkleBurst(x,y){
  for(let i=0;i<10;i++){
    const ang = Math.random()*Math.PI*2;
    const spd = 1+Math.random()*2.5;
    sparkleBursts.push({ x, y, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, life:1 });
  }
}
let starsStarted=false;
function startStars(){
  if(starsStarted) return;
  starsStarted = true;
  initStars();
  window.addEventListener('resize', resizeStarsCanvas);
  setInterval(()=>{ if(Math.random()<0.5) spawnShootingStar(); }, 2200);
  starsCanvas.addEventListener('click', (e)=>{
    const rect = starsCanvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    // find nearest star within a comfortable tap radius
    let nearest = null, nearestDist = 45;
    stars.forEach(s=>{
      const d = Math.hypot(s.x-cx, s.y-cy);
      if(d < nearestDist){ nearest = s; nearestDist = d; }
    });
    if(nearest){
      spawnShootingStarFrom(nearest.x, nearest.y);
      spawnSparkleBurst(nearest.x, nearest.y);
      // that star "breaks" — respawn it elsewhere so the sky stays full
      nearest.x = Math.random()*starsCanvas.width;
      nearest.y = Math.random()*starsCanvas.height*0.6;
    } else {
      // tapped empty sky — still send a little wish-sparkle from there
      spawnSparkleBurst(cx, cy);
    }
  });
  animateStars();
}
function animateStars(){
  starsCtx.clearRect(0,0,starsCanvas.width,starsCanvas.height);
  stars.forEach(s=>{
    s.tw += s.speed;
    const alpha = 0.4 + Math.abs(Math.sin(s.tw))*0.6;
    starsCtx.globalAlpha = alpha;
    starsCtx.fillStyle = '#fff';
    starsCtx.beginPath();
    starsCtx.arc(s.x,s.y,s.r,0,Math.PI*2);
    starsCtx.fill();
  });
  starsCtx.globalAlpha = 1;
  shootingStars.forEach(sh=>{
    sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.02;
    starsCtx.strokeStyle = `rgba(255,255,255,${Math.max(sh.life,0)})`;
    starsCtx.lineWidth = 2;
    starsCtx.beginPath();
    starsCtx.moveTo(sh.x, sh.y);
    starsCtx.lineTo(sh.x - sh.vx*4, sh.y - sh.vy*4);
    starsCtx.stroke();
  });
  shootingStars = shootingStars.filter(sh=>sh.life>0);

  sparkleBursts.forEach(p=>{
    p.x += p.vx; p.y += p.vy; p.life -= 0.03;
    starsCtx.globalAlpha = Math.max(p.life,0);
    starsCtx.fillStyle = '#ffe9c7';
    starsCtx.beginPath();
    starsCtx.arc(p.x,p.y,1.6,0,Math.PI*2);
    starsCtx.fill();
  });
  starsCtx.globalAlpha = 1;
  sparkleBursts = sparkleBursts.filter(p=>p.life>0);

  starsAnimId = requestAnimationFrame(animateStars);
}
document.getElementById('sendWishBtn').addEventListener('click', ()=>{
  const input = document.getElementById('wishInput');
  const text = input.value.trim();
  const confirm = document.getElementById('wishConfirm');
  if(!text){
    confirm.textContent = 'Pehle apni wish likhiye 🌸';
    return;
  }
  spawnShootingStar(); spawnShootingStar();
  confirm.textContent = 'Aapki wish sitaron tak bhej di gayi ✨🌠';
  input.value='';
});
document.getElementById('toProposalBtn').addEventListener('click', ()=>{
  goToPage('page-proposal');
});

/* ================= PAGE 9: Proposal ================= */
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
function dodgeNo(){
  const container = document.querySelector('#page-proposal .prop-buttons');
  const rect = container.getBoundingClientRect();
  const maxX = Math.max(0, rect.width - noBtn.offsetWidth - 10);
  const maxY = Math.max(0, 60);
  const randX = (Math.random()*maxX) - maxX/2;
  const randY = (Math.random()*maxY) - maxY/2;
  noBtn.style.transform = `translate(${randX}px, ${randY}px)`;
}
noBtn.addEventListener('mouseenter', dodgeNo);
noBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); dodgeNo(); });
yesBtn.addEventListener('click', ()=>{
  goToPage('page-celebrate');
  startCelebration();
});

/* ================= PAGE 7: Celebration ================= */
let celebrationStarted=false;
function startCelebration(){
  if(celebrationStarted) return;
  celebrationStarted = true;
  spawnPetals(30);
  // butterflies
  for(let i=0;i<6;i++){
    const bfly = document.createElement('div');
    bfly.className='butterfly';
    bfly.textContent='🦋';
    bfly.style.left = (10+Math.random()*80)+'vw';
    bfly.style.top = (60+Math.random()*20)+'vh';
    bfly.style.animationDuration = (7+Math.random()*4)+'s';
    document.body.appendChild(bfly);
    setTimeout(()=>bfly.remove(), 20000);
  }
  runFireworks();
  runConfetti();
}

/* Fireworks + confetti on canvas */
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
function createFirework(x,y){
  const colors = ['#ff8fb3','#ff5f96','#ffd9a0','#fff','#e8467e'];
  const color = colors[Math.floor(Math.random()*colors.length)];
  const count = 40;
  for(let i=0;i<count;i++){
    const angle = (Math.PI*2*i)/count;
    const speed = 2+Math.random()*3;
    particles.push({
      x,y,
      vx:Math.cos(angle)*speed,
      vy:Math.sin(angle)*speed,
      alpha:1, color, size:2+Math.random()*2, grav:0.03, type:'firework'
    });
  }
}
let confettiParticles=[];
function createConfettiBatch(){
  const colors = ['#ff8fb3','#ff5f96','#ffd9a0','#fff','#e8467e','#c1547c'];
  for(let i=0;i<10;i++){
    confettiParticles.push({
      x:Math.random()*canvas.width, y:-10,
      vx:(Math.random()-0.5)*2, vy:2+Math.random()*2,
      color:colors[Math.floor(Math.random()*colors.length)],
      w:6+Math.random()*5, h:10+Math.random()*6,
      rot:Math.random()*360, rotSpeed:(Math.random()-0.5)*10, alpha:1
    });
  }
}
let fireworkTimer=null, confettiTimer=null, animId=null;
function runFireworks(){
  fireworkTimer = setInterval(()=>{
    createFirework(Math.random()*canvas.width, canvas.height*0.2+Math.random()*canvas.height*0.35);
  }, 700);
  animate();
}
function runConfetti(){
  confettiTimer = setInterval(createConfettiBatch, 300);
  setTimeout(()=>{ if(confettiTimer) clearInterval(confettiTimer); }, 12000);
}
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy; p.vy+=p.grav; p.alpha-=0.012;
    ctx.globalAlpha = Math.max(p.alpha,0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
  });
  particles = particles.filter(p=>p.alpha>0);

  confettiParticles.forEach(c=>{
    c.x+=c.vx; c.y+=c.vy; c.rot+=c.rotSpeed;
    ctx.save();
    ctx.globalAlpha=1;
    ctx.translate(c.x,c.y);
    ctx.rotate(c.rot*Math.PI/180);
    ctx.fillStyle=c.color;
    ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h);
    ctx.restore();
  });
  confettiParticles = confettiParticles.filter(c=>c.y < canvas.height+20);
  ctx.globalAlpha=1;

  animId = requestAnimationFrame(animate);
}