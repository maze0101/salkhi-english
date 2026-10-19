/* Салхи: 🌙 Зүүдний тэмдэглэл — өглөө босоод шөнийн зүүдээ гадаад хэлээр яриад (яриа танигч) эсвэл бичээд
   хадгална. AI алдааг засаж, монгол орчуулга, 1–3 тайлбар, 2–3 шинэ үг санал болгоно. Өдөрт нэг тэмдэглэл +5 XP,
   дараалсан өдрийн тоо. Өглөө (05–11 цаг) Үг табын нүүрэнд сануулах карт гарна (Dream.card). sget("dreams") — сүүлийн 60. */
(function(){
  var env=null,h=null,S={text:"",rec:false,busy:false,res:null,err:null,open:null};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function dk(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function list(){var a=env.sget("dreams",[]);return Array.isArray(a)?a:[];}
  function streak(a){
    var days={};a.forEach(function(x){days[x.d]=1;});var n=0,d=new Date();
    if(!days[dk(d)])d.setDate(d.getDate()-1);
    while(days[dk(d)]){n++;d.setDate(d.getDate()-1);}
    return n;
  }
  function listen(){
    var SR=env.SR();if(!SR){env.toast("Энэ хөтөч яриа танихгүй — бичээрэй");return;}
    var r=new SR(),base=S.text?S.text.trim()+" ":"";r.lang=env.srLang();r.interimResults=true;r.continuous=true;S.rec=r;env.render();
    r.onresult=function(e){var t="";for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;S.text=base+t;var ta=document.getElementById("dr-ta");if(ta)ta.value=S.text;};
    r.onend=function(){S.rec=false;env.render();};r.onerror=function(){S.rec=false;env.render();};
    try{r.start();}catch(e){S.rec=false;}
  }
  function check(){
    var t=S.text.trim();if(t.length<8){env.toast("Зүүдээ арай дэлгэрэнгүй ярь/бич");return;}
    if(S.rec){try{S.rec.stop();}catch(e){}S.rec=false;}
    S.busy=true;S.err=null;env.render();
    var q="A Mongolian learner of "+env.langEn()+" (level "+env.level()+") described last night's dream:\n\"\"\"\n"+t.slice(0,1200)+"\n\"\"\"\n"+
      "1) Rewrite it as correct, natural "+env.langEn()+" keeping their meaning and level. 2) Translate the corrected text into Mongolian (Cyrillic). "+
      "3) Give up to 3 short notes in Mongolian about their most important mistakes. 4) Suggest 3 useful "+env.langEn()+" words for talking about dreams/feelings with Mongolian meanings.\n"+
      "Reply with ONLY JSON: {\"fixed\":\"...\",\"mn\":\"...\",\"notes\":[\"...\"],\"new\":[{\"w\":\"...\",\"mn\":\"...\"}]}";
    Promise.resolve(env.ai([{role:"user",content:q}],{task:"check"})).then(function(r){
      S.busy=false;var m=String(r||"").match(/\{[\s\S]*\}/),j=null;try{j=m&&JSON.parse(m[0]);}catch(e){}
      if(!j||typeof j.fixed!=="string"){S.err="AI шалгаж чадсангүй. Тэмдэглэлээ засваргүй хадгалж болно.";env.render();return;}
      S.res={fixed:j.fixed.slice(0,2000),mn:String(j.mn||"").slice(0,2000),notes:(j.notes||[]).filter(function(x){return typeof x==="string";}).slice(0,3),
        nw:(j["new"]||[]).filter(function(x){return x&&x.w&&x.mn;}).slice(0,3)};
      env.render();
    },function(){S.busy=false;S.err="AI одоогоор холбогдсонгүй.";env.render();});
  }
  function store(){
    var a=list(),first=!a.some(function(x){return x.d===dk();});
    a.unshift({d:dk(),ts:Date.now(),t:S.text.trim().slice(0,1500),fixed:S.res?S.res.fixed:"",mn:S.res?S.res.mn:"",lang:env.lang()});
    env.sset("dreams",a.slice(0,60));
    if(first){env.addXP(5);env.toast("🌙 Зүүдний тэмдэглэл хадгалагдлаа! +5 XP · "+streak(a)+" өдөр дараалан");}else env.toast("🌙 Хадгалагдлаа");
    S.text="";S.res=null;env.render();
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),a=list(),st=streak(a);
    put(root,h("button",{class:"back",onclick:function(){if(S.rec){try{S.rec.stop();}catch(x){}}S.rec=false;e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"🌙 Зүүдний тэмдэглэл"));
    put(root,h("p",{class:"muted"},"Өглөө босоод шөнийн зүүдээ "+env.langName().toLowerCase()+"р 1 минут ярь. Санахгүй бол өчигдөр юу хийснээ ярь. AI засаж, шинэ үг заана."));
    put(root,h("div",{class:"row",style:"gap:6px;margin-bottom:10px"},h("span",{class:"stat"},"🔥 "+st+" өдөр дараалан"),h("span",{class:"stat"},"📓 "+a.length+" тэмдэглэл")));
    if(!S.res){
      var ta=h("textarea",{id:"dr-ta",class:"tin",rows:"6",lang:env.lang(),placeholder:"Last night I dreamed that…",style:"width:100%;resize:vertical",oninput:function(){S.text=ta.value;}});ta.value=S.text;
      put(root,ta);
      if(S.err)put(root,h("div",{class:"note",style:"color:var(--danger);margin-top:8px"},S.err));
      put(root,h("div",{class:"row",style:"margin-top:10px;gap:8px"},
        h("button",{class:"btn"+(S.rec?" rec":""),onclick:function(){if(S.rec){try{S.rec.stop();}catch(x){}S.rec=false;env.render();}else listen();}},S.rec?"⏹ Зогсоох":"🎤 Ярих"),
        h("button",{class:"btn primary",style:"flex:1",disabled:S.busy,onclick:check},S.busy?"⏳ Шалгаж байна…":"✨ Шалгуулах"),
        S.err&&S.text.trim()?h("button",{class:"btn",onclick:store},"Хадгалах"):null));
    }else{
      var r=S.res;
      put(root,h("div",{class:"note"},h("div",{class:"muted small"},"Таны бичсэн"),h("div",{lang:env.lang(),style:"white-space:pre-wrap"},S.text)));
      put(root,h("div",{class:"note",style:"margin-top:8px"},h("div",{style:"display:flex;align-items:center;gap:8px"},h("div",{class:"muted small",style:"flex:1"},"✅ Зассан хувилбар"),env.speakBtn(r.fixed)),
        h("div",{lang:env.lang(),style:"white-space:pre-wrap;font-weight:600"},r.fixed),h("div",{class:"muted small",style:"margin-top:8px"},"🇲🇳 "+r.mn)));
      if(r.notes.length)put(root,h("div",{class:"rule",style:"margin-top:8px;padding:10px 12px"},r.notes.map(function(n){return h("div",null,"💡 "+n);})));
      r.nw.forEach(function(w){var has=env.hasWord(w.w);put(root,h("div",{class:"note",style:"margin-top:8px;display:flex;align-items:center;gap:8px"},
        h("div",{style:"flex:1"},h("b",{lang:env.lang()},w.w),h("div",{class:"muted small"},w.mn)),
        h("button",{class:"btn",disabled:has,onclick:function(){env.addWord(w.w,w.mn);env.toast("➕ Миний үгст нэмэгдлээ");env.render();}},has?"✓":"➕")));});
      put(root,h("div",{class:"row",style:"margin-top:12px;gap:8px"},h("button",{class:"btn primary",style:"flex:1",onclick:store},"📓 Тэмдэглэлд хадгалах"),h("button",{class:"btn",onclick:function(){S.res=null;env.render();}},"Засах")));
    }
    var mine=a.filter(function(x){return x.lang===env.lang();});
    if(mine.length){
      put(root,h("h3",{style:"margin-top:18px"},"📓 Өмнөх зүүднүүд"));
      mine.slice(0,20).forEach(function(x){
        var on=S.open===x.ts;
        put(root,h("div",{class:"note",style:"margin-top:8px;cursor:pointer",onclick:function(){S.open=on?null:x.ts;env.render();}},
          h("div",{class:"muted small"},"🌙 "+x.d),h("div",{lang:env.lang(),style:on?"white-space:pre-wrap":"overflow:hidden;text-overflow:ellipsis;white-space:nowrap"},x.fixed||x.t),
          on&&x.mn?h("div",{class:"muted small",style:"margin-top:6px"},"🇲🇳 "+x.mn):null));
      });
    }
    return root;
  }
  /* өглөөний сануулга: 05–11 цаг, өнөөдөр бичээгүй бол */
  function card(e,open){
    env=e;h=e.h;var hr=new Date().getHours();
    if(hr<5||hr>=11||list().some(function(x){return x.d===dk();})||env.sget("drhide","")===dk())return null;
    return h("div",{class:"note",style:"margin-bottom:12px;display:flex;gap:10px;align-items:center"},
      h("span",{style:"font-size:28px"},"🌙"),
      h("div",{style:"flex:1"},h("b",null,"Өглөөний мэнд! Зүүдээ ярих уу?"),h("div",{class:"muted small"},"1 минут "+env.langName().toLowerCase()+"р ярь — AI засна")),
      h("button",{class:"btn primary",style:"flex:none;padding:8px 12px",onclick:open},"🎤"),
      h("button",{class:"btn ghost",style:"flex:none;padding:6px 8px","aria-label":"Өнөөдөр нуух",onclick:function(){env.sset("drhide",dk());env.render();}},"✕"));
  }
  window.Dream={view:view,card:card};
})();
