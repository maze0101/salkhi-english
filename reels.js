/* Салхи: 🎬 Богино хичээл — TikTok шиг дээш гүйлгэдэг бүтэн дэлгэцийн бичил картууд.
   Карт бүр нэг л зүйл: 🆕 үг (дуудлага, жишээ), ❓ утгыг таах, 🎧 сонсоод таах, 📘 дүрмийн нэг санаа.
   Карт дэлгэцэнд гармагц үгийг автоматаар уншина (🔇 товчоор унтраана). Төгсгөлд нь ойртоход шинэ картууд нэмэгдэнэ.
   XP: зөв хариулт бүр +1, 10 карт үзэх бүрт +2. Давтах хугацаа болсон үгс эхэнд орно. */
(function(){
  var env=null,h=null,R=null,BATCH=["word","word","quiz","gram","word","hear","word","quiz"];
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function css(){
    if(document.getElementById("reels-css"))return;
    var s=document.createElement("style");s.id="reels-css";
    s.textContent=
      ".reels{position:fixed;inset:0;z-index:9000;background:var(--bg,#0F1A1C);color:var(--ink,#fff)}"+
      ".reels .feed{position:absolute;inset:0;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none}"+
      ".reels .feed::-webkit-scrollbar{display:none}"+
      ".reels .rc{height:100%;height:100dvh;scroll-snap-align:start;scroll-snap-stop:always;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:70px 24px 90px;box-sizing:border-box;position:relative}"+
      ".reels .rc .tag{font-size:13px;font-weight:700;letter-spacing:.04em;opacity:.7;margin-bottom:14px}"+
      ".reels .rc .big{font-size:clamp(34px,9vw,56px);font-weight:800;line-height:1.15;word-break:break-word;max-width:100%}"+
      ".reels .rc .rd{font-size:18px;opacity:.7;margin-top:6px}"+
      ".reels .rc .mn{font-size:22px;font-weight:600;margin-top:14px;color:var(--sky,#4aa3ff)}"+
      ".reels .rc .ex{font-size:18px;margin-top:22px;max-width:520px;line-height:1.45}"+
      ".reels .rc .exm{font-size:15px;opacity:.7;margin-top:4px;max-width:520px}"+
      ".reels .rc .rule{font-size:17px;margin-top:14px;max-width:520px;line-height:1.5;padding:12px 14px;border-radius:14px;background:var(--surface,#1b2a2e);border:1px solid var(--line,#2c3d42)}"+
      ".reels .opts{display:flex;flex-direction:column;gap:8px;width:100%;max-width:420px;margin-top:22px}"+
      ".reels .opts button{font:inherit;font-size:17px;padding:13px 14px;border-radius:14px;border:1px solid var(--line,#2c3d42);background:var(--surface,#1b2a2e);color:inherit;cursor:pointer}"+
      ".reels .opts button.ok{border-color:var(--ok,#2fb36d);background:color-mix(in srgb,var(--ok,#2fb36d) 18%,var(--surface,#1b2a2e))}"+
      ".reels .opts button.bad{border-color:var(--danger,#e5484d);background:color-mix(in srgb,var(--danger,#e5484d) 18%,var(--surface,#1b2a2e))}"+
      ".reels .side{position:absolute;right:12px;bottom:110px;display:flex;flex-direction:column;gap:14px}"+
      ".reels .side button,.reels .top button{width:48px;height:48px;border-radius:50%;border:1px solid var(--line,#2c3d42);background:color-mix(in srgb,var(--surface,#1b2a2e) 85%,transparent);color:inherit;font-size:22px;cursor:pointer}"+
      ".reels .top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) 12px 10px;z-index:2;background:linear-gradient(var(--bg,#0F1A1C),transparent)}"+
      ".reels .top .st{flex:1;font-weight:700;font-size:15px;text-align:center}"+
      ".reels .hint{position:absolute;bottom:max(24px,env(safe-area-inset-bottom));left:0;right:0;text-align:center;font-size:13px;opacity:.55;pointer-events:none}";
    document.head.appendChild(s);
  }
  /* ---------- картын дараалал ---------- */
  function words(){
    var due=env.due(30),seen={},out=[];
    due.forEach(function(w){if(!seen[w[1]]){seen[w[1]]=1;out.push(w);}});
    shuffle(env.pool()).forEach(function(w){if(!seen[w[1]]&&w[1].length<=40){seen[w[1]]=1;out.push(w);}});
    return out;
  }
  function opts(w,field){
    var pool=shuffle(env.pool()),seen={},o=[];seen[w[field]]=1;
    for(var i=0;i<pool.length&&o.length<2;i++){var x=pool[i];if(!x[field]||seen[x[field]]||x[1]===w[1])continue;seen[x[field]]=1;o.push(x[field]);}
    return shuffle([w[field]].concat(o));
  }
  function nextWord(){
    if(R.wi>=R.ws.length){R.ws=words();R.wi=0;}
    return R.ws[R.wi++];
  }
  function more(){
    var cards=[];
    BATCH.forEach(function(k){
      if(k==="gram"){
        if(!R.ls.length)R.ls=shuffle(env.lessons());
        var l=R.ls.pop();if(l){cards.push({k:"gram",l:l});return;}
        k="word";
      }
      var w=nextWord();if(!w)return;
      if(k==="quiz")cards.push({k:"quiz",w:w,o:opts(w,2)});
      else if(k==="hear")cards.push({k:"hear",w:w,o:opts(w,1)});
      else cards.push({k:"word",w:w});
    });
    return cards;
  }
  /* ---------- зурах ---------- */
  function sayBtn(text){return h("button",{type:"button","aria-label":"Дахин сонсох",onclick:function(e){e.stopPropagation();env.speak(text);}},"🔊");}
  function saveBtn(w){
    var b=h("button",{type:"button","aria-pressed":String(env.isSaved(w)),"aria-label":"Үгийг хадгалах",onclick:function(e){
      e.stopPropagation();env.toggleSave(w);var on=env.isSaved(w);b.setAttribute("aria-pressed",String(on));b.textContent=on?"🔖":"📑";
      env.toast(on?"🔖 Хадгалсан үгсэд нэмлээ":"Хадгалсан үгсээс хаслаа",1500);}},env.isSaved(w)?"🔖":"📑");
    return b;
  }
  function answer(c,box,pick,btn){
    if(c.done)return;c.done=true;
    var ok=pick===(c.k==="quiz"?c.w[2]:c.w[1]);
    Array.prototype.forEach.call(box.children,function(b){if(b.textContent===(c.k==="quiz"?c.w[2]:c.w[1]))b.classList.add("ok");});
    if(!ok)btn.classList.add("bad");
    if(ok){R.ok++;env.addXP(1);R.xp++;}
    env.logAct("reel",c.w[1]);
    env.speak(c.w[1]);
    if(c.k==="hear"){var rv=box.parentNode.querySelector(".mn");if(rv)rv.hidden=false;}
    status();
  }
  function card(c){
    var el=h("section",{class:"rc"});c.el=el;
    if(c.k==="word"){
      var w=c.w;
      put(el,h("div",{class:"tag"},"🆕 ШИНЭ ҮГ"),h("div",{class:"big",lang:env.lang()},w[1]),w[7]?h("div",{class:"rd"},w[7]):null,h("div",{class:"mn"},w[2]),
        w[3]?h("div",{class:"ex",lang:env.lang()},w[3]):null,w[3]&&w[8]?h("div",{class:"exm"},w[8]):null);
      put(el,h("div",{class:"side"},sayBtn(w[1]),saveBtn(w)));
      c.say=[w[1]].concat(w[3]?[w[3]]:[]);
    }else if(c.k==="quiz"||c.k==="hear"){
      var box=h("div",{class:"opts"});
      c.o.forEach(function(o){var b=h("button",{type:"button",onclick:function(){answer(c,box,o,b);}},o);box.append(b);});
      if(c.k==="quiz"){
        put(el,h("div",{class:"tag"},"❓ УТГЫГ НЬ ТААГААРАЙ"),h("div",{class:"big",lang:env.lang()},c.w[1]),c.w[7]?h("div",{class:"rd"},c.w[7]):null,box);
        c.say=[c.w[1]];
      }else{
        put(el,h("div",{class:"tag"},"🎧 СОНСООД ТААГААРАЙ"),
          h("button",{type:"button",class:"big",style:"background:none;border:0;color:inherit;font-size:72px;cursor:pointer","aria-label":"Сонсох",onclick:function(){env.speak(c.w[1]);}},"🔊"),
          h("div",{class:"mn",hidden:true},c.w[2]),box);
        c.say=[c.w[1]];
      }
      put(el,h("div",{class:"side"},saveBtn(c.w)));
    }else{
      var l=c.l,ex=(l.ex||[]).slice(0,2);
      put(el,h("div",{class:"tag"},"📘 ДҮРМИЙН НЭГ САНАА"),h("div",{class:"big",style:"font-size:clamp(24px,6vw,34px)"},l.t),
        l.rule?h("div",{class:"rule",lang:env.lang()},l.rule):null);
      ex.forEach(function(x){put(el,h("div",{class:"ex",lang:env.lang()},x[0]),h("div",{class:"exm"},x[1]));});
      if(ex[0])put(el,h("div",{class:"side"},sayBtn(ex[0][0])));
      c.say=ex.map(function(x){return x[0];}).slice(0,1);
    }
    return el;
  }
  function append(){
    more().forEach(function(c){R.cards.push(c);var el=card(c);R.feed.append(el);R.io.observe(el);});
  }
  function status(){
    if(R.st)R.st.textContent="🎬 "+R.seen+" карт · ✅ "+R.ok+(R.xp?" · +"+R.xp+" XP":"");
  }
  function onShow(el){
    var i=R.cards.findIndex(function(c){return c.el===el;});if(i<0||i===R.cur)return;
    R.cur=i;var c=R.cards[i];
    if(!c.seen){c.seen=true;R.seen++;if(R.seen%10===0){env.addXP(2);R.xp+=2;}}
    status();
    env.stop();
    if(!R.mute&&c.say&&c.say.length)setTimeout(function(){if(R&&R.cur===i)env.speakList(c.say);},250);
    if(i>=R.cards.length-3)append();
  }
  function close(){
    if(!R)return;
    env.stop();try{R.io.disconnect();}catch(e){}
    document.removeEventListener("keydown",R.key);
    R.root.remove();document.body.style.overflow=R.ov;
    var n=R.seen;R=null;
    if(n)env.toast("🎬 "+n+" карт үзлээ. Гайхалтай!",2000);
    env.render();
  }
  function open(e){
    env=e;h=e.h;css();
    if(R)return true;
    var ws=words();
    if(ws.length<4){e.toast("Богино хичээл гаргахад үг хүрэлцэхгүй байна");return false;}
    R={ws:ws,wi:0,ls:[],cards:[],cur:-1,seen:0,ok:0,xp:0,mute:!!e.sget("reelMute",false)};
    var mute=h("button",{type:"button","aria-label":"Автомат уншлага","aria-pressed":String(!R.mute),onclick:function(){
      R.mute=!R.mute;e.sset("reelMute",R.mute);mute.textContent=R.mute?"🔇":"🔊";mute.setAttribute("aria-pressed",String(!R.mute));if(R.mute)env.stop();}},R.mute?"🔇":"🔊");
    R.st=h("div",{class:"st","aria-live":"polite"});
    R.feed=h("div",{class:"feed"});
    R.root=h("div",{class:"reels",role:"dialog","aria-modal":"true","aria-label":"Богино хичээл"},
      R.feed,h("div",{class:"top"},h("button",{type:"button","aria-label":"Хаах",onclick:close},"✕"),R.st,mute),
      h("div",{class:"hint"},"⬆️ Дээш гүйлгэж дараагийнх"));
    R.io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting&&x.intersectionRatio>=0.6)onShow(x.target);});},{root:R.feed,threshold:[0.6]});
    R.key=function(ev){
      if(ev.key==="Escape")close();
      else if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ev.preventDefault();R.feed.scrollBy({top:(ev.key==="ArrowDown"?1:-1)*R.feed.clientHeight,behavior:"smooth"});}
    };
    document.addEventListener("keydown",R.key);
    R.ov=document.body.style.overflow;document.body.style.overflow="hidden";
    document.body.append(R.root);
    append();status();
    return true;
  }
  window.Reels={
    open:open,close:close,active:function(){return !!R;},
    card:function(e){
      env=e;h=e.h;
      return h("button",{class:"gamecard",type:"button",style:"margin:10px 0 0",onclick:function(){open(e);}},
        h("i",{"aria-hidden":"true"},"🎬"),h("div",null,h("b",null,"Богино хичээл"),h("span",null,"Дээш гүйлгээд үг, дүрэм сур — TikTok шиг")));
    }
  };
})();
