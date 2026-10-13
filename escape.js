/* Салхи: 🔐 хэлний оньсого өрөө — «Токиогийн буудалд гацчихлаа» гэх мэт өрөөнөөс 5 минутад гарах тоглоом.
   Өрөө бүр 4 түгжээтэй; түгжээ бүрийг тайлахад кодын нэг орон гарна, эцэст нь 4 оронтой кодоо оруулж гарна.
   Түгжээний төрөл: 🪧 тэмдэг унших (үг → утга), 🎧 сонсоод олох, 🧩 өгүүлбэр эвлүүлэх, ✏️ хоосон нөхөх.
   Даалгаврыг апп-ын үгс (ангиллаар) ба жишээ өгүүлбэрээс үүсгэнэ — AI шаардлагагүй. Буруу хариулт −10 секунд, 3 зөвлөгөө.
   Од: 3 — 2:30-аас их үлдээж, зөвлөгөөгүй; 2 — хугацаандаа; XP = 10 + 5×од. Дээд амжилт sget "escape" = {"<хэл>:<өрөө>": од}. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var TIME=300,HINTS=3,PEN=10,env=null,h=null,G=null;
  var CITY={en:"Лондон",ja:"Токио",ko:"Сөүл",zh:"Бээжин",ru:"Москва",de:"Берлин",ug:"Кашгар"};
  /* өрөө: id, эможи, нэр (хот орно), түүх, ангиллууд */
  var ROOMS=[
    ["station","🚉","{c}-ийн буудал","Галт тэрэг чинь 5 минутын дараа хөдөлнө, гэтэл хүлээлгийн танхимын хаалга түгжигдчихлээ! Тэмдэг, зарлалыг уншиж кодыг ол.",["travel","transport","city","time","number"]],
    ["food","🍜","{c}-ийн ресторан","Хоол идээд тооцоо хийх гэтэл касс кодоор түгжигдсэн байна. Цэс, тогоочийн үгийг ойлгож гарах кодоо ол.",["food","shopping","money","number","basic"]],
    ["clinic","🏥","{c}-ийн эмнэлэг","Эмчид үзүүлээд гарах гэтэл хаалга түгжигдсэн байна. Эмч, сувилагчийн үгийг ойлгож кодоо ол.",["health","body","feelings","verbs"]],
    ["school","🏫","{c}-ийн сургууль","Шалгалтын өрөөнд ганцаараа үлдчихлээ! Самбар, номон дээрх бичээсийг уншиж гарах кодоо ол.",["school","verbs","adjectives","work"]],
    ["market","🛍️","{c}-ийн зах","Захын лангуунд түгжигдчихлээ. Худалдагчийн үг, үнийн шошгыг ойлгож кодоо ол.",["shopping","money","clothes","color","number"]]
  ];
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function rname(r){return r[2].replace("{c}",CITY[env.lang()]||"Гадаад");}
  function best(){var b=env.sget("escape",{});return b&&typeof b==="object"?b:{};}
  /* өрөөний үгс: ангиллаар, хүрэлцэхгүй бол бүх үгнээс нэмнэ */
  function pool(room){
    var all=env.all().filter(function(w){return w[1]&&w[2]&&String(w[1]).length<=24&&w[5]!=="mine";});
    var cat=all.filter(function(w){return room[4].indexOf(w[5])>=0;});
    if(cat.length<12)cat=cat.concat(shuffle(all).slice(0,40));
    var seen={};return shuffle(cat).filter(function(w){if(seen[w[1]])return false;seen[w[1]]=1;return true;});
  }
  function others(p,w,f,n){var o=[],seen={};seen[w[f]]=1;p.forEach(function(x){if(o.length<n&&x[f]&&!seen[x[f]]&&x[1]!==w[1]){seen[x[f]]=1;o.push(x[f]);}});return o;}
  var SPACED=/^(en|de|ru|ko|ug)$/;
  function tokens(s){return String(s).replace(/[.,!?;:«»"“”]/g,"").trim().split(/\s+/);}
  /* 4 түгжээ: sign, hear, order (зайтай хэл, тохирох жишээ байвал) / fill, fill */
  function build(room){
    var p=pool(room),used={},locks=[],L=env.lang();
    var take=function(f){for(var i=0;i<p.length;i++){var w=p[i];if(!used[w[1]]&&f(w)){used[w[1]]=1;return w;}}return null;};
    var w1=take(function(){return true;});if(w1)locks.push({k:"sign",w:w1,o:shuffle([w1[2]].concat(others(p,w1,2,2))),a:w1[2]});
    var w2=take(function(){return true;});if(w2)locks.push({k:"hear",w:w2,o:shuffle([w2[1]].concat(others(p,w2,1,2))),a:w2[1]});
    /* эвлүүлэх өгүүлбэрт монгол утга (w[8]) заавал — тоглогч юу бүтээхээ мэдэх ёстой */
    var w3=SPACED.test(L)?take(function(w){var t=w[3]?tokens(w[3]):[];return w[8]&&t.length>=3&&t.length<=7;}):null;
    if(w3){var t=tokens(w3[3]);var sh=shuffle(t);for(var n=0;n<5&&sh.join(" ")===t.join(" ");n++)sh=shuffle(t);locks.push({k:"order",w:w3,tok:sh,ans:t,pick:[]});}
    var fill=function(){
      var w=take(function(x){return x[3]&&String(x[3]).toLowerCase().indexOf(String(x[1]).toLowerCase())>=0&&String(x[1]).length>=2;});
      if(!w)return null;
      var i=String(w[3]).toLowerCase().indexOf(String(w[1]).toLowerCase());
      return {k:"fill",w:w,s:String(w[3]).slice(0,i)+"＿＿＿"+String(w[3]).slice(i+String(w[1]).length),o:shuffle([w[1]].concat(others(p,w,1,2))),a:w[1]};
    };
    while(locks.length<4){var f=fill();if(f){locks.push(f);continue;}
      var w=take(function(){return true;});if(!w)break;locks.push({k:"sign",w:w,o:shuffle([w[2]].concat(others(p,w,2,2))),a:w[2]});}
    locks.forEach(function(l){l.d=Math.floor(Math.random()*10);l.done=false;l.cut=[];});
    return locks;
  }
  function start(room){
    var locks=build(room);
    if(locks.length<4||locks.some(function(l){return l.o&&l.o.length<3;})){env.toast("Энэ өрөөнд хангалттай үг алга. Өөр өрөө сонгоно уу.");return;}
    G={room:room,locks:locks,i:0,end:Date.now()+TIME*1000,hints:HINTS,used:0,pen:0,code:"",state:"play",bad:null};
    clearInterval(G.iv);G.iv=setInterval(tick,500);
    env.render();window.scrollTo(0,0);
    if(locks[0].k==="hear")setTimeout(function(){if(G)env.speak(locks[0].w[1]);},400);
  }
  function left(){return Math.max(0,Math.ceil((G.end-Date.now())/1000));}
  function fmt(s){return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
  function tick(){
    if(!G||G.state!=="play"){if(G)clearInterval(G.iv);return;}
    var el=document.getElementById("esc-time");if(el){el.textContent="⏱ "+fmt(left());el.style.color=left()<60?"var(--danger)":"";}
    if(left()<=0){G.state="fail";clearInterval(G.iv);env.stop();env.render();}
  }
  function wrong(){G.end-=PEN*1000;G.pen+=PEN;G.bad=Date.now();try{if(navigator.vibrate)navigator.vibrate(80);}catch(e){}env.toast("❌ Буруу! −"+PEN+" секунд",1200);env.render();}
  function solve(l){
    l.done=true;env.addXP(1);
    var nx=G.locks.filter(function(x){return !x.done;})[0];
    env.render();window.scrollTo(0,0);
    if(nx&&nx.k==="hear")setTimeout(function(){if(G)env.speak(nx.w[1]);},400);
  }
  function hint(l){
    if(G.hints<=0)return;
    if(l.k==="order"){var n=l.pick.length;if(n>=l.ans.length)return;
      /* дараагийн зөв үгийг сонгоод өгнө (өмнөх сонголт буруу бол эхнээс нь) */
      if(l.pick.some(function(x,i){return x!==l.ans[i];}))l.pick=[];
      var t=l.ans[l.pick.length],j=l.tok.indexOf(t);if(j<0)return;l.pick.push(t);l.tok.splice(j,1);
    }else{var c=l.o.filter(function(o){return o!==l.a&&l.cut.indexOf(o)<0;})[0];if(!c)return;l.cut.push(c);}
    G.hints--;G.used++;env.render();
  }
  function stars(){var s=left();return G.used===0&&s>=150?3:2;}
  function finish(){
    G.state="win";clearInterval(G.iv);
    var st=stars(),k=env.lang()+":"+G.room[0],b=best();G.stars=st;G.prev=b[k]||0;
    if(st>(b[k]||0)){b[k]=st;env.sset("escape",b);}
    G.xp=10+5*st;env.addXP(G.xp);env.logAct("esc");env.celebrate();env.render();window.scrollTo(0,0);
  }
  function lockView(root,l){
    var head=function(icon,t){return h("div",{style:"font-weight:800;font-size:17px;margin-bottom:8px"},icon+" "+t);};
    var opts=function(list,isAns,lang){
      var g=h("div",{style:"display:flex;flex-direction:column;gap:8px"});
      list.forEach(function(o){var cut=l.cut.indexOf(o)>=0;
        put(g,h("button",{class:"opt",lang:lang||null,disabled:cut,style:cut?"opacity:.35;text-decoration:line-through":"",onclick:function(){if(isAns(o))solve(l);else wrong();}},o));});
      return g;
    };
    var box=h("div",{class:"note",style:"margin-top:10px"});
    if(l.k==="sign"){
      put(box,head("🪧","Энэ тэмдэг юу гэж бичсэн бэ?"),
        h("div",{lang:env.lang(),style:"text-align:center;font-size:30px;font-weight:800;padding:18px 10px;margin-bottom:10px;border-radius:10px;background:#1d5c3b;color:#fff;border:4px solid #e8e8e8;box-shadow:0 2px 0 #999"},l.w[1]),
        opts(l.o,function(o){return o===l.a;}));
    }else if(l.k==="hear"){
      put(box,head("🎧","Зарлалыг сонсоод аль үг болохыг ол"),
        h("div",{style:"text-align:center;margin-bottom:10px"},h("button",{class:"btn primary",style:"font-size:18px;padding:12px 22px",onclick:function(){env.speak(l.w[1]);}},"🔊 Сонсох")),
        opts(l.o,function(o){return o===l.a;},env.lang()));
    }else if(l.k==="fill"){
      put(box,head("✏️","Хоосон зайд тохирох үгийг ол"),
        h("div",{lang:env.lang(),style:"font-size:19px;line-height:1.5;margin-bottom:6px"},l.s),l.w[8]?h("div",{class:"muted small",style:"margin-bottom:10px"},l.w[8]):null,
        opts(l.o,function(o){return o===l.a;},env.lang()));
    }else{
      var slot=h("div",{lang:env.lang(),style:"min-height:44px;padding:8px;border:2px dashed var(--line);border-radius:10px;display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px"});
      l.pick.forEach(function(t,i){put(slot,h("button",{class:"chip",onclick:function(){l.pick.splice(i,1);l.tok.push(t);env.render();}},t));});
      var bank=h("div",{lang:env.lang(),style:"display:flex;flex-wrap:wrap;gap:6px"});
      l.tok.forEach(function(t,i){put(bank,h("button",{class:"chip",onclick:function(){l.tok.splice(i,1);l.pick.push(t);
        if(!l.tok.length){if(l.pick.join(" ")===l.ans.join(" "))solve(l);else{l.tok=shuffle(l.pick);l.pick=[];wrong();}}else env.render();}},t));});
      put(box,head("🧩","Хаалганы бичээсийг зөв дараалалд оруул"),l.w[8]?h("div",{class:"muted small",style:"margin-bottom:6px"},"Утга: "+l.w[8]):null,slot,bank);
    }
    put(root,box);
    put(root,h("button",{class:"btn ghost",style:"margin-top:8px",disabled:G.hints<=0,onclick:function(){hint(l);}},"💡 Зөвлөгөө ("+G.hints+")"));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){if(G){clearInterval(G.iv);G=null;env.stop();env.render();}else e.close();}},G?"‹ Өрөөнүүд":"‹ Сорил"));
    if(!G){
      put(root,h("h2",null,"🔐 Хэлний оньсого өрөө"),
        h("p",{class:"muted"},"Гадаадад түгжигдчихлээ! Тэмдэг уншиж, зарлал сонсож, өгүүлбэр эвлүүлж 4 түгжээг тайл. Түгжээ бүр кодын нэг оронг өгнө. 5 минутын дотор гараарай!"));
      var b=best();
      ROOMS.forEach(function(r){var st=b[env.lang()+":"+r[0]]||0;
        put(root,h("button",{class:"gamecard",type:"button",style:"margin:10px 0 0",onclick:function(){start(r);}},
          h("i",{"aria-hidden":"true"},r[1]),h("div",null,h("b",null,rname(r)),h("span",null,st?"⭐".repeat(st)+" · дахин тоглох":"Шинэ өрөө · 5 минут"))));
      });
      return root;
    }
    put(root,h("div",{style:"display:flex;align-items:center;gap:8px"},h("h2",{style:"flex:1;margin:0"},G.room[1]+" "+rname(G.room)),
      G.state==="play"?h("b",{id:"esc-time","aria-live":"off",style:"font-variant-numeric:tabular-nums"+(left()<60?";color:var(--danger)":"")},"⏱ "+fmt(left())):null));
    /* түгжээнүүд: 🔒/🔓 + олсон орон */
    var row=h("div",{style:"display:flex;gap:8px;margin:10px 0"});
    G.locks.forEach(function(l){put(row,h("div",{style:"flex:1;text-align:center;padding:8px 4px;border-radius:12px;border:1px solid "+(l.done?"var(--ok)":"var(--line)")+";background:var(--surface)"},
      h("div",{style:"font-size:20px"},l.done?"🔓":"🔒"),h("div",{style:"font-weight:800;font-size:20px"},l.done?String(l.d):"?")));});
    put(root,row);
    if(G.state==="fail"){
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:44px"},"⌛"),h("div",{style:"font-weight:800"},"Хугацаа дууслаа!"),h("div",{class:"muted"},"Дахин оролдоод түгжээг илүү хурдан тайлаарай.")),
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){G=null;env.render();}},"Өрөөнүүд"),h("button",{class:"btn primary",onclick:function(){start(G.room);}},"Дахин")));
      return root;
    }
    if(G.state==="win"){
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:44px"},"🚪✨"),h("div",{style:"font-weight:800;font-size:20px"},"Чи гарлаа!"),
        h("div",{style:"font-size:28px"},"⭐".repeat(G.stars)),h("div",{class:"muted"},"+"+G.xp+" XP"+(G.stars>G.prev&&G.prev?" · шинэ дээд амжилт!":"")),
        G.stars<3?h("div",{class:"muted small",style:"margin-top:4px"},"3 од авахын тулд 2:30-аас өмнө, зөвлөгөөгүй гараарай."):null),
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){G=null;env.render();}},"Өрөөнүүд"),h("button",{class:"btn primary",onclick:function(){start(G.room);}},"Дахин")));
      return root;
    }
    var cur=G.locks.filter(function(l){return !l.done;})[0];
    if(cur){
      if(G.locks.indexOf(cur)===0)put(root,h("p",{class:"muted"},G.room[3]));
      lockView(root,cur);
      return root;
    }
    /* бүх түгжээ тайлагдсан → кодоо оруул */
    var want=G.locks.map(function(l){return String(l.d);}).join("");
    var inp=h("input",{class:"tin",inputmode:"numeric",maxlength:"4",autocomplete:"off","aria-label":"4 оронтой код",placeholder:"• • • •",style:"font-size:30px;text-align:center;letter-spacing:.4em;margin-top:6px"});
    var go=function(){if(inp.value===want)finish();else{inp.value="";wrong();}};
    inp.addEventListener("input",function(){inp.value=inp.value.replace(/\D/g,"").slice(0,4);if(inp.value.length===4)go();});
    put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-weight:800;font-size:17px"},"🔢 Бүх түгжээ тайлагдлаа!"),
      h("div",{class:"muted"},"Олсон оронгуудаа дарааллаар нь оруулж хаалгыг нээ."),inp));
    setTimeout(function(){if(inp.isConnected)inp.focus();},0);
    return root;
  }
  window.Escape={view:view,active:function(){return !!(G&&G.state==="play");},
    /* тест: өрөөний түгжээ үүсгэх */
    _build:function(e,i){var o=env;env=e;try{return build(ROOMS[i||0]);}finally{env=o;}}};
})();
