/* Салхи: ⌨️ бичих хурд — 60 секундэд аль болох олон үгийг зорилтот хэлний гараар бичнэ.
   «👀 Хараад бич» (үгийг харж бичнэ) ба «🧠 Утгаас бич» (монгол утгаас санаж бичнэ).
   Хүлээн авах: ja — үг эсвэл кана дуудлага (хирагана/катакана); zh — ханз эсвэл өнгөгүй пиньинь; ru — ё=е; en/de — to/артикльгүй ч болно.
   IME бичиж байх үед (composition) шалгахгүй. Тэмдэгт/минут, нарийвчлал; хэл+горим бүрийн дээд амжилт sget "typBest". XP = зөв үг/2 (≤15). */
(function(){
  var SEC=60,env=null,h=null,T=null;
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function kata2hira(s){return s.replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60);});}
  function base(s){
    var L=env.lang();s=String(s||"").normalize("NFC").toLowerCase().replace(/[’]/g,"'").replace(/\s+/g," ").trim();
    if(L==="ru"||L==="ug")s=s.replace(/ё/g,"е");
    if(L==="ja")s=kata2hira(s);
    return s;
  }
  function pinyin(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/ü/g,"v").replace(/[^a-z]/g,"");}
  /* тухайн үгэнд зөвшөөрөгдөх бүх хариулт */
  function answers(w){
    var L=env.lang(),a=[base(w[1])];
    if(L==="en")a.push(base(w[1]).replace(/^(to|the|a|an)\s+/,""));
    if(L==="de")a.push(base(w[1]).replace(/^(der|die|das|sich)\s+/,""));
    if(L==="ja"&&w[7]&&/[぀-ヿ]/.test(w[7]))a.push(base(w[7]));
    return a;
  }
  function ok(w,v){
    var L=env.lang(),x=base(v);if(!x)return false;
    if(answers(w).indexOf(x)>=0)return true;
    if(L==="zh"&&w[7]&&pinyin(v)&&pinyin(v)===pinyin(w[7]))return true;
    return false;
  }
  function words(){
    return shuffle(env.pool().filter(function(w){var s=String(w[1]);return s.length>=1&&s.length<=16&&s.split(" ").length<=2&&!/[()\/,;]/.test(s);}));
  }
  function bestKey(){return env.lang()+":"+T.mode;}
  function finish(){
    if(T.fin)return;T.fin=true;clearInterval(T.iv);
    var b=env.sget("typBest",{})||{},k=bestKey(),cpm=Math.round(T.chars*60/SEC),acc=T.ok+T.bad?Math.round(T.ok/(T.ok+T.bad)*100):0;
    T.res={cpm:cpm,acc:acc,rec:!b[k]||cpm>b[k].cpm,prev:b[k]};
    if(T.res.rec&&T.ok){b[k]={cpm:cpm,ok:T.ok,acc:acc,at:Date.now()};env.sset("typBest",b);}
    var xp=Math.min(15,Math.ceil(T.ok/2));if(xp)env.addXP(xp);T.res.xp=xp;
    env.logAct("typ");if(T.res.rec&&T.ok>=5)env.celebrate();
    env.render();
  }
  function next(){T.cur=T.list[T.i++%T.list.length];T.miss=0;T.show=false;}
  function start(mode){
    var l=words();if(l.length<5){env.toast("Дасгал хийхэд үг хүрэлцэхгүй байна");return;}
    T={mode:mode,list:l,i:0,ok:0,bad:0,chars:0,t0:0,left:SEC,fin:false};next();env.render();
  }
  function tickStart(){
    if(T.t0)return;T.t0=Date.now();
    T.iv=setInterval(function(){
      if(!T||T.fin){return;}
      T.left=Math.max(0,SEC-Math.floor((Date.now()-T.t0)/1000));
      var el=document.getElementById("typ-left");if(el)el.textContent=T.left+"с";
      if(T.left<=0)finish();
    },250);
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){if(T&&T.iv)clearInterval(T.iv);T=null;e.close();}},"‹ Сорил"));
    put(root,h("h2",null,"⌨️ Бичих хурд"));
    if(!T){
      var b=env.sget("typBest",{})||{};
      put(root,h("p",{class:"muted"},"60 секундэд "+env.langName().toLowerCase()+" гараар аль болох олон үг бич. Утсандаа "+env.langName().toLowerCase()+" гар нэмээгүй бол: Тохиргоо → Гар (Keyboard) → Хэл нэмэх."));
      if(env.lang()==="ja")put(root,h("p",{class:"muted small"},"Япон: ханз эсвэл хирагана/катаканаар бичиж болно."));
      if(env.lang()==="zh")put(root,h("p",{class:"muted small"},"Хятад: ханз эсвэл пиньинь (өнгөний тэмдэггүй, ж: nihao) бичиж болно."));
      [["see","👀 Хараад бич","Үгийг харж хурдан бичнэ — гарын байрлалд дасна"],["recall","🧠 Утгаас бич","Монгол утгыг хараад үгийг санаж бичнэ"]].forEach(function(m){
        var r=b[env.lang()+":"+m[0]];
        put(root,h("button",{class:"gamecard",type:"button",style:"margin:10px 0 0",onclick:function(){start(m[0]);}},
          h("i",{"aria-hidden":"true"},m[1].slice(0,2)),h("div",null,h("b",null,m[1].slice(3)),h("span",null,m[2]+(r?" · 🏆 "+r.cpm+" тэмдэгт/мин":"")))));
      });
      return root;
    }
    if(T.fin){
      var R=T.res;
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},R.rec&&T.ok?"🏆":"⌨️"),
        h("div",{style:"font-weight:800;font-size:22px"},T.ok+" үг · "+R.cpm+" тэмдэгт/мин"),
        h("div",{class:"muted"},"Нарийвчлал "+R.acc+"%"+(R.xp?" · +"+R.xp+" XP":"")),
        R.rec&&T.ok?h("div",{style:"font-weight:700;margin-top:6px"},"🎉 Шинэ дээд амжилт!"):R.prev?h("div",{class:"muted small",style:"margin-top:6px"},"Дээд амжилт: "+R.prev.cpm+" тэмдэгт/мин"):null));
      put(root,h("div",{class:"row"},h("button",{class:"btn",onclick:function(){T=null;env.render();}},"Буцах"),h("button",{class:"btn primary",onclick:function(){start(T.mode);}},"Дахин")));
      return root;
    }
    var w=T.cur;
    put(root,h("div",{style:"display:flex;justify-content:space-between;font-weight:700"},h("span",null,"✅ "+T.ok),h("span",{id:"typ-left","aria-live":"off"},(T.t0?T.left:SEC)+"с")));
    var prompt=h("div",{class:"note",style:"text-align:center;margin-top:10px"});
    if(T.mode==="see")put(prompt,h("div",{lang:env.lang(),style:"font-size:34px;font-weight:800;word-break:break-word"},w[1]),w[7]?h("div",{class:"muted"},w[7]):null,h("div",{class:"muted small",style:"margin-top:4px"},w[2]));
    else put(prompt,h("div",{style:"font-size:26px;font-weight:800"},w[2]),
      T.show?h("div",{lang:env.lang(),style:"margin-top:6px;font-size:20px;color:var(--sky)"},w[1]+(w[7]?" ("+w[7]+")":"")):h("div",{class:"muted small",style:"margin-top:4px"},Array.from(String(w[1])).length+" тэмдэгт"));
    put(root,prompt);
    var inp=h("input",{class:"tin",lang:env.lang(),autocomplete:"off",autocapitalize:"off",autocorrect:"off",spellcheck:"false","aria-label":"Үгээ бичнэ үү",
      style:"font-size:22px;text-align:center;margin-top:10px"+(T.miss?";border-color:var(--danger)":"")});
    var composing=false;
    var check=function(final){
      if(composing||T.fin)return;
      if(ok(w,inp.value)){T.ok++;T.chars+=Array.from(String(w[1])).length;next();env.render();return;}
      if(final&&inp.value.trim()){T.bad++;T.miss++;if(T.mode==="recall"&&T.miss>=2)T.show=true;inp.value="";env.render();}
    };
    inp.addEventListener("compositionstart",function(){composing=true;});
    inp.addEventListener("compositionend",function(){composing=false;tickStart();check(false);});
    inp.addEventListener("input",function(ev){if(ev.isComposing)return;tickStart();check(false);});
    inp.addEventListener("keydown",function(ev){if(ev.key==="Enter"&&!ev.isComposing&&!composing){ev.preventDefault();check(true);}});
    put(root,inp);
    put(root,h("div",{class:"row",style:"margin-top:8px"},
      h("button",{class:"btn ghost",onclick:function(){if(T.mode==="recall"&&!T.show){T.show=true;T.bad++;}else next();env.render();}},T.mode==="recall"&&!T.show?"👁 Хариуг харах":"⏭ Алгасах"),
      h("button",{class:"btn ghost",onclick:function(){env.speak(w[1]);}},"🔊")));
    setTimeout(function(){if(inp.isConnected)inp.focus();},0);
    return root;
  }
  window.Typing={view:view,
    /* тест: хариулт шалгагч */
    _ok:function(e,w,v){var o=env;env=e;try{return ok(w,v);}finally{env=o;}}};
})();
