/* Салхи: 🎙️ өдрийн хувийн подкаст — AI таны давтах/шинэ 6 үгээр 2 хөтлөгчийн богино яриа бичнэ.
   Тоглуулах дараалал: монгол оршил → мөр бүр (зорилтот хэл → монгол орчуулга) → үгсийн тойм → монгол төгсгөл.
   «Зөвхөн <хэл>» горимд орчуулгыг алгасна. Анги нь өдөр, хэл бүрээр хадгалагдана (sget "pod"); дуусгавал өдөрт нэг удаа +10 XP. */
(function(){
  var KEY="pod",env=null,h=null,P={busy:false,err:"",playing:false,i:-1,q:null,ep:null,run:0,key:""};
  function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function k(){return today()+":"+env.lang();}
  function store(){var s=env.sget(KEY,{});return s&&typeof s==="object"?s:{};}
  function saved(){return store()[k()]||null;}
  function save(ep){
    var s=store(),keep={};
    /* зөвхөн өнөөдрийн ангиудыг хадгална */
    Object.keys(s).forEach(function(x){if(x.indexOf(today()+":")===0)keep[x]=s[x];});
    keep[k()]=ep;env.sset(KEY,keep);
  }
  function parse(t){
    var m=String(t||"").match(/\{[\s\S]*\}/);if(!m)return null;
    try{var j=JSON.parse(m[0]);}catch(e){return null;}
    if(!j||!Array.isArray(j.lines))return null;
    j.lines=j.lines.filter(function(l){return Array.isArray(l)&&l[1]&&l[2];}).slice(0,14).map(function(l){return [l[0]==="B"?"B":"A",String(l[1]),String(l[2]),l[3]?String(l[3]):""];});
    if(j.lines.length<4)return null;
    j.words=(Array.isArray(j.words)?j.words:[]).filter(function(w){return Array.isArray(w)&&w[0]&&w[1];}).slice(0,8).map(function(w){return [String(w[0]),String(w[1])];});
    j.title=String(j.title||"Өнөөдрийн анги").slice(0,80);
    j.intro=String(j.intro||"");j.outro=String(j.outro||"");
    return j;
  }
  function prompt(ws){
    var LN=env.langEn(),cjk=["ja","ko","zh"].indexOf(env.lang())>=0;
    return "You write a short, warm language-learning podcast episode for a Mongolian learner of "+LN+". Level: "+env.level()+".\n"+
      "Two hosts, A (Saraa, female) and B (Bat, male), have a natural everyday conversation in "+LN+" that uses ALL of these words: "+ws.map(function(w){return w[1];}).join(", ")+".\n"+
      "Rules: 10-12 short lines, alternating A and B, simple sentences right for the level, friendly and positive, a small funny or surprising moment. Each line has a natural Mongolian (Cyrillic) translation.\n"+
      "Reply with ONLY one JSON object:\n"+
      "{\"title\":\"<catchy Mongolian episode title>\",\"intro\":\"<2 Mongolian sentences: welcome to Salkhi podcast and today's topic>\","+
      "\"lines\":[[\"A\",\"<"+LN+" line>\",\"<Mongolian>\""+(cjk?",\"<romanization>\"":"")+"],[\"B\",\"...\",\"...\""+(cjk?",\"...\"":"")+"]],"+
      "\"words\":[[\"<word from the list>\",\"<Mongolian meaning>\"]],\"outro\":\"<1-2 Mongolian sentences: short recap and encouragement>\"}";
  }
  function make(){
    var ws=env.words(6);
    if(ws.length<3){P.err="Подкаст гаргахад үг хүрэлцэхгүй байна.";env.render();return;}
    P.busy=true;P.err="";stop();env.render();
    var run=++P.run;
    Promise.resolve(env.ai([{role:"user",content:prompt(ws)}])).then(function(r){
      if(run!==P.run)return;P.busy=false;
      var ep=parse(r);
      if(!ep){P.err=r==null?"AI одоогоор ажиллахгүй байна. Интернэтээ шалгаад дахин оролдоно уу.":"AI анги бичиж чадсангүй. Дахин оролдоно уу.";env.render();return;}
      ep.n=(saved()&&saved().n||0)+1;ep.done=false;
      P.ep=ep;P.key=k();save(ep);env.render();
    },function(){if(run!==P.run)return;P.busy=false;P.err="AI анги бичиж чадсангүй.";env.render();});
  }
  /* тоглуулах дараалал: [төрөл ("t" зорилтот | "m" монгол), бичвэр, мөрийн индекс] */
  function queue(ep,mnToo){
    var q=[];
    if(ep.intro)q.push(["m",ep.intro,-1]);
    ep.lines.forEach(function(l,i){q.push(["t",l[1],i]);if(mnToo)q.push(["m",l[2],i]);});
    if(ep.words.length){q.push(["m","Өнөөдрийн үгс:",-2]);ep.words.forEach(function(w,i){q.push(["t",w[0],-10-i]);q.push(["m",w[1],-10-i]);});}
    if(ep.outro)q.push(["m",ep.outro,-3]);
    return q;
  }
  function stop(){P.playing=false;P.run++;try{env.stop();}catch(e){}}
  function play(from){
    var ep=P.ep;if(!ep)return;
    P.q=queue(ep,!env.sget("podTgtOnly",false));P.playing=true;P.i=from||0;
    var run=++P.run;
    (function step(){
      if(run!==P.run)return;
      if(P.i>=P.q.length){P.playing=false;P.i=-1;finish();env.render();return;}
      var it=P.q[P.i];paintLine();
      var next=function(){if(run!==P.run)return;P.i++;setTimeout(step,it[0]==="t"?550:350);};
      if(it[0]==="t")env.speak(it[1],next);else env.speakMn(it[1],next);
    })();
    env.render();
  }
  function finish(){
    var ep=P.ep;if(!ep||ep.done)return;
    ep.done=true;save(ep);
    var d=env.sget("podXP","");
    if(d!==today()){env.sset("podXP",today());env.addXP(10);env.logAct("pod");env.celebrate();env.toast("🎙️ Анги дууслаа! +10 XP",2500);}
  }
  /* одоо уншиж буй мөрийг тодруулна (бүтэн render хийхгүй) */
  function paintLine(){
    var cur=P.q&&P.q[P.i]?P.q[P.i][2]:null;
    Array.prototype.forEach.call(document.querySelectorAll("[data-podline]"),function(el){
      var on=String(cur)===el.getAttribute("data-podline");
      el.style.borderColor=on?"var(--sky)":"var(--line)";
      el.style.background=on?"color-mix(in srgb,var(--sky) 10%,var(--surface))":"var(--surface)";
      if(on&&el.scrollIntoView&&P.playing)el.scrollIntoView({block:"nearest",behavior:"smooth"});
    });
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    /* хэл эсвэл өдөр солигдвол тухайн хэлний өнөөдрийн ангийг ачаална */
    if(P.key!==k()){if(P.playing)stop();P.key=k();P.ep=saved();P.err="";}
    root.append(h("p",{class:"muted"},"Таны давтах, шинэ үгсээр AI өдөр бүр шинэ подкаст бичнэ. Сараа, Бат хоёрын яриаг сонсоод, монгол орчуулгатай нь ойлгоорой. Автобусанд, алхаж явахдаа сонсоход тохиромжтой."));
    if(P.busy){root.append(h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:36px"},"🎙️"),h("div",{style:"font-weight:700"},"Өнөөдрийн анги бичигдэж байна…")));return root;}
    if(P.err)root.append(h("div",{class:"fb bad"},P.err));
    var ep=P.ep;
    if(!ep){
      root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:6px",onclick:make},"🎙️ Өнөөдрийн подкастыг гаргах"));
      return root;
    }
    var tgt=!!env.sget("podTgtOnly",false);
    root.append(h("div",{class:"note"},
      h("div",{class:"muted small"},"🎙️ Салхи подкаст · "+today()+(ep.n>1?" · "+ep.n+"-р анги":"")+(ep.done?" · ✅ сонссон":"")),
      h("div",{style:"font-weight:800;font-size:19px;margin-top:2px"},ep.title),
      h("div",{class:"row",style:"margin-top:10px"},
        P.playing?h("button",{class:"btn primary",onclick:function(){stop();env.render();}},"⏸ Зогсоох"):h("button",{class:"btn primary",onclick:function(){play(0);}},"▶️ Эхнээс сонсох"),
        h("button",{class:"btn ghost","aria-pressed":String(tgt),onclick:function(){env.sset("podTgtOnly",!tgt);if(P.playing)stop();env.render();}},tgt?"🇲🇳 Орчуулгатай болгох":"🎯 Зөвхөн "+env.langName()))));
    var box=h("div",{style:"display:flex;flex-direction:column;gap:6px;margin-top:10px"});
    var line=function(key,who,main,sub,sub2,startAt){
      return h("button",{type:"button","data-podline":String(key),style:"text-align:left;font:inherit;color:inherit;cursor:pointer;padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:var(--surface)",
        onclick:function(){var q=queue(ep,!tgt),i=q.findIndex(function(x){return x[2]===key;});play(Math.max(0,i));}},
        who?h("div",{class:"muted small",style:"font-weight:700"},who):null,
        h("div",{style:"font-size:17px;line-height:1.45"},main),sub2?h("div",{class:"muted small"},sub2):null,sub?h("div",{class:"muted",style:"margin-top:2px"},sub):null);
    };
    if(ep.intro)box.append(line(-1,"🎙️ Оршил",ep.intro));
    ep.lines.forEach(function(l,i){box.append(line(i,l[0]==="A"?"👩 Сараа":"👨 Бат",l[1],l[2],l[3]));});
    if(ep.words.length){
      box.append(h("div",{class:"muted small",style:"font-weight:700;margin-top:6px"},"📝 Өнөөдрийн үгс"));
      ep.words.forEach(function(w,i){box.append(line(-10-i,null,w[0],w[1]));});
    }
    if(ep.outro)box.append(line(-3,"🎙️ Төгсгөл",ep.outro));
    root.append(box);
    root.append(h("button",{class:"btn ghost",style:"margin-top:12px",onclick:function(){if(confirm("Шинэ анги бичүүлэх үү? Одоогийн анги солигдоно."))make();}},"🔄 Шинэ анги"));
    setTimeout(paintLine,0);
    return root;
  }
  window.Podcast={view:view,stop:function(){if(P.playing)stop();},active:function(){return P.playing;}};
})();
