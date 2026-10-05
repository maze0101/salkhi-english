/* Салхи: 📺 «Дэлгэцийн хэл» — кино, YouTube, дуунаас сонссон хэллэгээ бичээд AI-аар тайлбарлуулна
   (утга, шууд утга, хэзээ хэрэглэх, хэв маяг, 2 жишээ), дараа нь «Миний үгс»-д карт болгон нэмж давтана. */
(function(){
  var KEY="screen",env=null,h=null,S={phrase:"",src:"",busy:false,res:null,err:""};
  function list(){var l=env.sget(KEY,[]);return Array.isArray(l)?l:[];}
  function parse(t){
    if(!t)return null;var m=String(t).match(/\{[\s\S]*\}/);if(!m)return null;
    try{var j=JSON.parse(m[0]);return j&&j.mn?j:null;}catch(e){return null;}
  }
  function explain(){
    var p=S.phrase.trim();if(!p)return;
    S.busy=true;S.res=null;S.err="";env.render();
    var LN=env.langEn(),q="A Mongolian learner of "+LN+" heard this "+LN+" phrase"+(S.src.trim()?" in \""+S.src.trim().slice(0,60)+"\"":" in a film or video")+": \""+p.slice(0,160)+"\"\n"+
      "Explain it for them. Reply with ONLY one JSON object, all explanations in Mongolian (Cyrillic):\n"+
      "{\"phrase\":\"<the phrase, spelling corrected>\",\"reading\":\"<romanization if Japanese/Korean/Chinese, else empty>\",\"mn\":\"<natural Mongolian meaning>\",\"lit\":\"<word-by-word literal meaning>\",\"use\":\"<when and how people say it, 1-2 sentences>\",\"reg\":\"<one of: албан, энгийн, ярианы, сленг, бүдүүлэг>\",\"ex\":[[\"<"+LN+" example>\",\"<Mongolian>\"],[\"<"+LN+" example>\",\"<Mongolian>\"]]}";
    Promise.resolve(env.ai([{role:"user",content:q}])).then(function(t){
      S.busy=false;var j=parse(t);
      if(!j){S.err="AI тайлбарлаж чадсангүй. Дахин оролдоно уу.";env.render();return;}
      j.phrase=String(j.phrase||p).slice(0,120);j.src=S.src.trim().slice(0,60);j.ts=Date.now();j.lang=env.lang();
      S.res=j;var l=list();l.push(j);env.sset(KEY,l.slice(-80));env.addXP(2);env.render();
    });
  }
  function resultCard(j,compact){
    var saved=env.hasWord(j.phrase),box=h("div",{class:"note",style:"margin-top:10px"});
    box.append(h("div",{style:"display:flex;align-items:center;gap:8px"},h("b",{style:"flex:1;font-size:19px"},j.phrase),env.speakBtn(j.phrase)));
    if(j.reading)box.append(h("div",{class:"muted"},j.reading));
    box.append(h("div",{style:"font-weight:700;margin-top:6px"},"= "+j.mn));
    if(j.src)box.append(h("div",{class:"muted small"},"📺 "+j.src));
    if(!compact){
      var reg=String(j.reg||"");
      if(j.lit)box.append(h("div",{class:"small",style:"margin-top:6px"},h("span",{class:"muted"},"Шууд утга: "),j.lit));
      if(j.use)box.append(h("div",{class:"small",style:"margin-top:4px"},h("span",{class:"muted"},"Хэрэглээ: "),j.use));
      if(reg)box.append(h("div",{class:"small",style:"margin-top:4px"},h("span",{class:"muted"},"Хэв маяг: "),/бүдүүлэг|сленг/.test(reg)?"⚠️ "+reg+" — найз нартайгаа л хэрэглэ":reg));
      (Array.isArray(j.ex)?j.ex:[]).slice(0,2).forEach(function(e){
        if(!Array.isArray(e)||!e[0])return;
        box.append(h("div",{style:"display:flex;gap:6px;align-items:center;margin-top:6px"},h("div",{style:"flex:1"},h("div",null,"«"+e[0]+"»"),h("div",{class:"muted small"},e[1]||"")),env.speakBtn(e[0])));
      });
    }
    box.append(saved?h("div",{class:"muted small",style:"margin-top:8px"},"✅ «Миний үгс»-д байгаа"):h("button",{class:"btn primary",style:"width:100%;margin-top:8px",onclick:function(){
      var ex=Array.isArray(j.ex)&&Array.isArray(j.ex[0])?j.ex[0]:["",""];
      env.addWord(j.phrase,j.mn,ex[0]||"",ex[1]||"",j.reading||"");
      env.toast("📺 «Миний үгс»-д нэмэгдлээ. Давтлагад орно");env.render();
    }},"➕ Карт болгож цээжлэх"));
    return box;
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    root.append(h("button",{class:"back",onclick:function(){S.res=null;e.close();}},"‹ Үгс"));
    root.append(h("h2",null,"📺 Дэлгэцийн хэл"));
    root.append(h("p",{class:"muted"},"Кино, YouTube, дуунаас сонссон "+e.langName().toLowerCase()+" хэллэгээ бич. AI утга, хэрэглээг нь тайлбарлаж, карт болгоно."));
    var ta=h("textarea",{class:"tin",rows:"2",maxlength:"160",placeholder:"Жишээ: I'm on it / no cap / break a leg","aria-label":"Сонссон хэллэг",style:"width:100%;font:inherit;font-size:17px;resize:vertical"});
    ta.value=S.phrase;ta.addEventListener("input",function(){S.phrase=ta.value;});
    ta.addEventListener("keydown",function(ev){if(ev.key==="Enter"&&!ev.shiftKey&&!ev.isComposing){ev.preventDefault();explain();}});
    var src=h("input",{class:"tin",maxlength:"60",placeholder:"Хаанаас сонссон бэ? (заавал биш: Friends, MrBeast…)","aria-label":"Эх сурвалж"});
    src.value=S.src;src.addEventListener("input",function(){S.src=src.value;});
    root.append(ta,src,h("button",{class:"btn primary",style:"width:100%;margin-top:8px",disabled:S.busy,onclick:explain},S.busy?"🤖 Тайлбарлаж байна…":"🤖 Тайлбарлах"));
    if(S.err)root.append(h("div",{class:"fb bad"},S.err));
    if(S.res)root.append(resultCard(S.res,false));
    var l=list().slice().reverse().filter(function(x){return x.lang===e.lang()&&(!S.res||x.ts!==S.res.ts);});
    if(l.length){
      root.append(h("h3",{style:"margin:18px 0 0"},"🗂 Өмнө тайлбарлуулсан ("+l.length+")"));
      l.slice(0,20).forEach(function(x){root.append(resultCard(x,true));});
    }
    return root;
  }
  window.ScreenLang={view:view};
})();
