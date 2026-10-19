/* Салхи: 🇲🇳→🌐 Монгол мэдээг орчуул — өнөөдрийн монгол мэдээний гарчгийг (worker /news?lang=mn, iKon.mn RSS)
   гадаад хэл рүү орчуулах дасгал. Хэрэглэгч бичнэ (эсвэл ярина) → AI 0–10 оноо, загвар орчуулга, 1–2 тайлбар,
   2–3 хэрэгтэй үг. Гарчиг бүрт нэг удаа XP = 2 + оноо/2. Хийсэн гарчгууд sget("mnnDone") (сүүлийн 100). */
(function(){
  var env=null,h=null,S={items:null,err:null,i:0,text:"",busy:false,res:null,loading:false,rec:false};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function done(){var a=env.sget("mnnDone",[]);return Array.isArray(a)?a:[];}
  function load(){
    var u=env.newsURL&&env.newsURL();if(!u){S.err="Мэдээний үйлчилгээ алга.";return;}
    S.loading=true;
    fetch(u+"?lang=mn").then(function(r){return r.json();}).then(function(j){
      S.loading=false;var d=done();
      S.items=(j&&j.items||[]).filter(function(x){return x&&x.t&&/[А-Яа-яӨөҮүЁё]/.test(x.t);}).map(function(x){return {t:x.t.replace(/\s+/g," ").trim(),link:x.link,ts:x.ts,done:d.indexOf(x.t)>=0};});
      if(!S.items.length)S.err="Өнөөдрийн мэдээ олдсонгүй.";
      S.i=Math.max(0,S.items.findIndex(function(x){return !x.done;}));env.render();
    },function(){S.loading=false;S.err="Мэдээ татаж чадсангүй. Интернэтээ шалгана уу.";env.render();});
  }
  function listen(){
    var SR=env.SR();if(!SR){env.toast("Энэ хөтөч яриа танихгүй — бичээрэй");return;}
    var r=new SR();r.lang=env.srLang();r.interimResults=true;S.rec=true;env.render();
    r.onresult=function(e){var t="";for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;S.text=t;var ta=document.getElementById("mnn-ta");if(ta)ta.value=t;};
    r.onend=function(){S.rec=false;env.render();};r.onerror=function(){S.rec=false;env.render();};
    try{r.start();}catch(e){S.rec=false;}
  }
  function check(){
    var it=S.items[S.i],t=S.text.trim();if(t.length<3){env.toast("Орчуулгаа бичнэ үү");return;}
    S.busy=true;env.render();
    var q="Mongolian news headline: \""+it.t+"\"\nA Mongolian learner of "+env.langEn()+" (level "+env.level()+") translated it as:\n\""+t.slice(0,400)+"\"\n"+
      "Grade the translation 0-10 for meaning and grammar (be encouraging; simple but correct = high score). Give a natural model translation in "+env.langEn()+
      " a news reader would understand, 1-2 short tips in Mongolian, and 2-3 useful "+env.langEn()+" words from the headline with Mongolian meanings.\n"+
      "Reply with ONLY JSON: {\"score\":0-10,\"model\":\"...\",\"tips\":[\"...\"],\"words\":[{\"w\":\"...\",\"mn\":\"...\"}]}";
    Promise.resolve(env.ai([{role:"user",content:q}],{task:"check"})).then(function(r){
      S.busy=false;var m=String(r||"").match(/\{[\s\S]*\}/),j=null;try{j=m&&JSON.parse(m[0]);}catch(e){}
      if(!j||typeof j.model!=="string"){env.toast("AI шалгаж чадсангүй — дахин оролдоно уу");env.render();return;}
      var sc=Math.max(0,Math.min(10,Math.round(+j.score||0)));
      S.res={score:sc,model:j.model.slice(0,300),tips:(j.tips||[]).filter(function(x){return typeof x==="string";}).slice(0,2),words:(j.words||[]).filter(function(x){return x&&x.w&&x.mn;}).slice(0,3)};
      var d=done();if(d.indexOf(it.t)<0){d.unshift(it.t);env.sset("mnnDone",d.slice(0,100));env.addXP(2+Math.round(sc/2));if(sc>=8)env.celebrate();}
      it.done=true;env.render();
    },function(){S.busy=false;env.toast("AI одоогоор холбогдсонгүй");env.render();});
  }
  function next(){S.text="";S.res=null;var n=S.items.length,k;for(k=1;k<=n;k++){var j=(S.i+k)%n;if(!S.items[j].done){S.i=j;break;}}if(k>n)S.i=(S.i+1)%n;env.render();window.scrollTo(0,0);}
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){S.res=null;S.text="";e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"📰 Монгол мэдээг орчуул"));
    put(root,h("p",{class:"muted"},"Өнөөдрийн Монголын мэдээний гарчгийг "+env.langName().toLowerCase()+" руу орчуул. Гадаад найздаа Монголын тухай ярьж сурахад тусална."));
    if(!S.items&&!S.err&&!S.loading)load();
    if(S.loading||(!S.items&&!S.err)){put(root,h("div",{class:"note"},"⏳ Өнөөдрийн мэдээг татаж байна…"));return root;}
    if(S.err){put(root,h("div",{class:"note",style:"color:var(--danger)"},S.err),h("button",{class:"btn",style:"margin-top:8px",onclick:function(){S.err=null;S.items=null;env.render();}},"🔄 Дахин"));return root;}
    var it=S.items[S.i],nd=S.items.filter(function(x){return x.done;}).length;
    put(root,h("div",{class:"muted small",style:"margin-bottom:6px"},(S.i+1)+"/"+S.items.length+" гарчиг · ✅ "+nd+" орчуулсан"));
    put(root,h("div",{class:"note"},h("div",{class:"muted small"},"🇲🇳 iKon.mn"),h("b",{style:"font-size:18px;line-height:1.4"},it.t),
      it.link?h("div",{style:"margin-top:6px"},h("a",{href:it.link,target:"_blank",rel:"noopener",class:"small"},"Мэдээг унших ↗")):null));
    if(!S.res){
      var ta=h("textarea",{id:"mnn-ta",class:"tin",rows:"3",lang:env.lang(),placeholder:env.langName()+"р орчуулга…",style:"width:100%;margin-top:10px;resize:vertical",oninput:function(){S.text=ta.value;}});ta.value=S.text;
      put(root,ta,h("div",{class:"row",style:"margin-top:10px;gap:8px"},
        h("button",{class:"btn",disabled:S.rec,onclick:listen},S.rec?"🎙️…":"🎤"),
        h("button",{class:"btn primary",style:"flex:1",disabled:S.busy,onclick:check},S.busy?"⏳ Шалгаж байна…":"✨ Шалгах"),
        h("button",{class:"btn ghost",onclick:next},"Алгасах")));
    }else{
      var r=S.res;
      put(root,h("div",{class:"note",style:"margin-top:10px"},h("div",{class:"muted small"},"Таны орчуулга"),h("div",{lang:env.lang()},S.text),
        h("b",{style:"font-size:20px;color:"+(r.score>=7?"var(--ok)":r.score>=4?"var(--gold-ink)":"var(--danger)")},r.score+"/10")));
      put(root,h("div",{class:"note",style:"margin-top:8px"},h("div",{style:"display:flex;align-items:center;gap:8px"},h("div",{class:"muted small",style:"flex:1"},"✅ Загвар орчуулга"),env.speakBtn(r.model)),h("b",{lang:env.lang()},r.model)));
      if(r.tips.length)put(root,h("div",{class:"rule",style:"margin-top:8px;padding:10px 12px"},r.tips.map(function(t){return h("div",null,"💡 "+t);})));
      r.words.forEach(function(w){var has=env.hasWord(w.w);put(root,h("div",{class:"note",style:"margin-top:8px;display:flex;align-items:center;gap:8px"},
        h("div",{style:"flex:1"},h("b",{lang:env.lang()},w.w),h("div",{class:"muted small"},w.mn)),
        h("button",{class:"btn",disabled:has,onclick:function(){env.addWord(w.w,w.mn);env.toast("➕ Миний үгст нэмэгдлээ");env.render();}},has?"✓":"➕")));});
      put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:next},"Дараагийн гарчиг ›"));
    }
    return root;
  }
  window.MnNews={view:view};
})();
