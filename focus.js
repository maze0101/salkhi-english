/* Салхи: ⏱️ төвлөрлийн таймер (Pomodoro) — 25 мин хичээл / 5 мин амралт (15/3, 50/10 сонголттой).
   Явж буй таймер дэлгэцийн доод буланд жижиг товчоор харагдана; апп хаагдаад нээгдсэн ч дуусах цагаар нь үргэлжилнэ.
   Хичээллэх үед ядрах сануулга (fatigue.js) гарахгүй. Хичээллэх хэсэг бүрэн дуусвал +3 XP, минут нь бүртгэгдэнэ.
   Хадгалалт: localStorage "salkhi:focusRun" = {m:"work"|"break", end, w, b, n} (зөвхөн энэ төхөөрөмж), sget "focusLog" = {огноо: минут}. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var RUN="salkhi:focusRun",PRESETS=[[25,5],[15,3],[50,10]],env=null,h=null,F={t:null,pill:null};
  function run(){try{var r=JSON.parse(localStorage.getItem(RUN));return r&&r.end?r:null;}catch(e){return null;}}
  function setRun(r){try{if(r)localStorage.setItem(RUN,JSON.stringify(r));else localStorage.removeItem(RUN);}catch(e){}}
  function dk(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function log(){var l=env.sget("focusLog",{});return l&&typeof l==="object"?l:{};}
  function addLog(min){
    var l=log(),k=dk();l[k]=(l[k]||0)+min;l._n=(l._n||0)+1;
    /* 60 хоногоос хуучныг хаяна */
    var cut=dk(new Date(Date.now()-60*86400000));Object.keys(l).forEach(function(x){if(x!=="_n"&&x<cut)delete l[x];});
    env.sset("focusLog",l);
  }
  function weekMin(){var l=log(),n=0;for(var i=0;i<7;i++)n+=l[dk(new Date(Date.now()-i*86400000))]||0;return n;}
  function fmt(ms){var s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
  function beep(){
    try{var C=window.AudioContext||window.webkitAudioContext,c=new C();[0,0.25,0.5].forEach(function(t,i){var o=c.createOscillator(),g=c.createGain();o.frequency.value=i===2?988:784;
      g.gain.setValueAtTime(0.0001,c.currentTime+t);g.gain.exponentialRampToValueAtTime(0.25,c.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t+0.22);
      o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+0.25);});setTimeout(function(){try{c.close();}catch(e){}},1500);}catch(e){}
    try{if(navigator.vibrate)navigator.vibrate([200,100,200]);}catch(e){}
  }
  function notify(t){
    env.toast(t,5000);
    try{if(document.hidden&&"Notification" in window&&Notification.permission==="granted")new Notification("Салхи",{body:t,icon:"icon-192.png",tag:"salkhi-focus"});}catch(e){}
  }
  function start(w,b){setRun({m:"work",end:Date.now()+w*60000,w:w,b:b,n:0});tick();env.render();}
  function stop(){setRun(null);tick();env.render();}
  /* үе дуусахад: хичээл → амралт → (зогсоно, дараагийнхыг хэрэглэгч эхлүүлнэ) */
  function tick(){
    var r=run();
    if(r&&Date.now()>=r.end){
      if(r.m==="work"){
        addLog(r.w);env.addXP(3);beep();
        notify("🍅 "+r.w+" минут төвлөрлөө! +3 XP. Одоо "+r.b+" минут амар 🌿");
        r={m:"break",end:r.end+r.b*60000,w:r.w,b:r.b,n:(r.n||0)+1};
        if(Date.now()>=r.end)r=null;
        setRun(r);
      }else{beep();notify("⏰ Амралт дууслаа. Дахин "+r.w+" минут төвлөрөх үү?");setRun({m:"done",end:Date.now()+600000,w:r.w,b:r.b,n:r.n});}
      r=run();env.render();
    }
    if(r&&r.m==="done"&&Date.now()>=r.end){setRun(null);r=null;}
    pill(r);
    clearTimeout(F.t);
    if(r)F.t=setTimeout(tick,1000);
  }
  function pill(r){
    if(!r){if(F.pill){F.pill.remove();F.pill=null;}return;}
    if(!F.pill){
      F.pill=document.createElement("button");F.pill.type="button";
      F.pill.setAttribute("style","position:fixed;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:8500;border:1px solid var(--line);background:var(--surface);color:var(--ink);"+
        "border-radius:999px;padding:8px 14px;font:inherit;font-weight:700;font-variant-numeric:tabular-nums;box-shadow:0 4px 16px rgba(0,0,0,.18);cursor:pointer");
      F.pill.addEventListener("click",function(){
        var x=run();if(!x)return;
        if(x.m==="done"){start(x.w,x.b);return;}
        if(confirm(x.m==="work"?"Төвлөрлийг зогсоох уу? (энэ хэсэг тооцогдохгүй)":"Амралтыг алгасаад шинээр эхлэх үү?")){if(x.m==="work")stop();else start(x.w,x.b);}
      });
      document.body.append(F.pill);
    }
    var t=r.m==="work"?"🍅 "+fmt(r.end-Date.now()):r.m==="break"?"🌿 "+fmt(r.end-Date.now()):"▶️ Дахин "+r.w+" мин";
    if(F.pill.textContent!==t)F.pill.textContent=t;
    F.pill.setAttribute("aria-label",r.m==="work"?"Төвлөрөл: "+t+" үлдсэн. Дарж зогсооно":r.m==="break"?"Амралт: "+t:"Дахин төвлөрөх");
    F.pill.style.borderColor=r.m==="work"?"var(--danger,#e5484d)":r.m==="break"?"var(--ok,#2fb36d)":"var(--sky)";
  }
  function card(e){
    env=e;h=e.h;var r=run(),l=log(),today=l[dk()]||0;
    var wrap=h("div",{class:"note",style:"margin-top:12px"});
    put(wrap,h("div",{style:"display:flex;align-items:center;gap:10px"},h("span",{style:"font-size:26px","aria-hidden":"true"},"⏱️"),
      h("div",{style:"flex:1"},h("div",{style:"font-weight:700"},"Төвлөрлийн таймер"),
        h("div",{class:"muted small"},"Өнөөдөр "+today+" мин · 7 хоногт "+weekMin()+" мин · нийт "+(l._n||0)+" удаа"))));
    if(r&&r.m!=="done"){
      put(wrap,h("div",{class:"row",style:"margin-top:8px;align-items:center"},
        h("b",{style:"flex:1"},r.m==="work"?"🍅 Төвлөрч байна — "+fmt(r.end-Date.now())+" үлдлээ":"🌿 Амарч байна — "+fmt(r.end-Date.now())),
        h("button",{class:"btn",style:"flex:none",onclick:function(){if(confirm("Таймерыг зогсоох уу?"))stop();}},"⏹ Зогсоох")));
    }else{
      put(wrap,h("div",{class:"row",style:"margin-top:8px;flex-wrap:wrap"},PRESETS.map(function(p,i){
        return h("button",{class:"btn"+(i===0?" primary":""),onclick:function(){start(p[0],p[1]);env.toast("🍅 "+p[0]+" минут төвлөрье! Утсаа хажуудаа тавиарай.",2500);}},"▶️ "+p[0]+"/"+p[1]);
      })));
      put(wrap,h("p",{class:"muted small",style:"margin:6px 0 0"},"Хичээллэх — амрах ээлжээр. Хугацаа дуусахад дуугарч, мэдэгдэнэ. Бүрэн дуусгасан хэсэг бүрт +3 XP."));
    }
    return wrap;
  }
  window.Focus={card:card,
    init:function(e){env=e;h=e.h;tick();document.addEventListener("visibilitychange",function(){if(!document.hidden)tick();});},
    /* хичээллэж байх үед (ядрах сануулга гаргахгүй) */
    working:function(){var r=run();return !!(r&&r.m==="work"&&Date.now()<r.end);}};
})();
