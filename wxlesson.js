/* Салхи: ⛅ Цаг агаарын хичээл — «Өнөөдрийн үгс» картын үргэлжлэл. Тухайн өдрийн бодит цаг агаарын (open-meteo)
   3–5 үгээр: 1) карт сонсох 2) утга сонгох асуулт 3) AI өнөөдрийн цаг агаарыг 2 өгүүлбэрээр (суралцагчийн түвшинд)
   бичиж, хэрэглэгч чангаар хэлнэ (яриа танигч) эсвэл бичнэ. AI байхгүй бол 3-р алхмыг алгасна. Өдөрт нэг удаа +10 XP. */
(function(){
  var env=null,h=null,S=null;
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0,t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function day(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}
  function norm(s){return String(s||"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();}
  /* үгийн давхцлын хувь (дуудлагыг ойролцоогоор шалгана) */
  function match(said,target){
    var a=norm(said).split(" "),b=norm(target).split(" "),hit=0,used={};
    b.forEach(function(w){var i=a.indexOf(w);if(i>=0&&!used[i]){used[i]=1;hit++;}});
    if(/^(ja|zh)$/.test(env.lang())){var x=norm(said).replace(/\s/g,""),y=norm(target).replace(/\s/g,""),n=0;for(var i=0;i<y.length;i++)if(x.indexOf(y[i])>=0)n++;return y.length?n/y.length:0;}
    return b.length?hit/b.length:0;
  }
  function start(x){
    var all=env.all();
    S={x:x,step:0,i:0,picked:null,ok:0,qs:x.w.map(function(w){
      var o=shuffle(all.filter(function(y){return y[2]!==w[2];})).slice(0,3).map(function(y){return y[2];});
      return {w:w,opts:shuffle(o.concat([w[2]]))};
    }),ai:null,aiBusy:false,said:"",score:null,rec:false};
  }
  function askAI(){
    var x=S.x,t=Math.round(x.d.t),words=x.w.map(function(w){return w[1];}).join(", ");
    var q="Today in "+env.wxCity()+" (Mongolia) the weather is: "+env.wxText(x.d.c)+" (Mongolian description), "+t+"°C"+(x.d.w>=8?", windy":"")+".\n"+
      "Write exactly 2 short, simple sentences in "+env.langEn()+" describing today's weather, for a learner at level "+env.level()+". Try to use some of these words: "+words+".\n"+
      "Reply with ONLY JSON: {\"s\":[{\"t\":\"sentence in "+env.langEn()+"\",\"mn\":\"Mongolian translation (Cyrillic)\"},{...}]}";
    S.aiBusy=true;env.render();
    Promise.resolve(env.ai([{role:"user",content:q}],{task:"check"})).then(function(r){
      S.aiBusy=false;var m=String(r||"").match(/\{[\s\S]*\}/),j=null;
      try{j=m&&JSON.parse(m[0]);}catch(e){}
      S.ai=j&&Array.isArray(j.s)&&j.s.length?j.s.slice(0,2).filter(function(s){return s&&s.t;}):[];
      if(!S.ai.length)S.step=3;
      env.render();
    },function(){S.aiBusy=false;S.ai=[];S.step=3;env.render();});
  }
  function listen(target){
    var SR=env.SR();if(!SR){env.toast("Энэ хөтөч яриа танихгүй байна — бичээд шалгана уу");return;}
    var r=new SR();r.lang=env.srLang();r.interimResults=false;r.maxAlternatives=3;S.rec=true;env.render();
    r.onresult=function(e){var best="",sc=0;for(var i=0;i<e.results[0].length;i++){var t=e.results[0][i].transcript,m=match(t,target);if(m>=sc){sc=m;best=t;}}S.said=best;S.score=sc;};
    r.onend=function(){S.rec=false;env.render();};r.onerror=function(){S.rec=false;env.micHint&&env.toast("Микрофон ажилласангүй");env.render();};
    try{r.start();}catch(e){S.rec=false;}
  }
  function finish(){
    var k="wxl:"+env.lang();
    if(env.sget(k,"")!==day()){env.sset(k,day());env.addXP(10);env.celebrate();env.toast("⛅ Өнөөдрийн цаг агаарын хичээл дууслаа! +10 XP");}
    S.step=4;env.render();
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),x=env.wx();
    put(root,h("button",{class:"back",onclick:function(){S=null;e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"⛅ Цаг агаарын хичээл"));
    if(!x){put(root,h("p",{class:"muted"},"Цаг агаарын мэдээлэл хараахан ачаалагдаагүй байна. Дээд хэсгийн цаг агаарын товчийг дараад дахин оролдоно уу."));return root;}
    if(!S||S.x.d.at!==x.d.at)start(x);
    var t=Math.round(x.d.t);
    put(root,h("p",{class:"muted"},env.wxCity()+": "+(t<0?"−"+(-t):t)+"°, "+env.wxText(x.d.c).toLowerCase()+". Өнөөдрийн цаг агаарт тохирох үгсийг сурч, цаг агаараа "+env.langName().toLowerCase()+"р ярь."));
    var steps=["Үгс","Асуулт","Ярих","Дүн"],cur=Math.min(S.step,3);
    put(root,h("div",{class:"bar",style:"margin:4px 0 12px"},h("i",{style:"width:"+Math.round((cur+(S.step===4?1:0))/4*100)+"%"})));
    put(root,h("div",{class:"muted small",style:"margin-bottom:8px"},(cur+1)+"/4 · "+steps[cur]));
    if(S.step===0){
      x.w.forEach(function(w){
        put(root,h("div",{class:"note",style:"display:flex;align-items:center;gap:10px;margin-top:8px"},
          h("div",{style:"flex:1"},h("b",{lang:env.lang(),style:"font-size:18px"},w[1]),w[7]?h("span",{class:"muted small"}," "+w[7]):null,h("div",{class:"muted"},w[2])),
          env.speakBtn(w[1])));
      });
      put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:function(){S.step=1;env.render();}},"Асуултад хариулах ›"));
    }else if(S.step===1){
      var q=S.qs[S.i];
      put(root,h("div",{class:"note"},h("div",{class:"muted small"},(S.i+1)+"/"+S.qs.length+" · Утгыг нь сонго"),
        h("div",{style:"display:flex;align-items:center;gap:8px;margin-top:4px"},h("b",{lang:env.lang(),style:"font-size:22px;flex:1"},q.w[1]),env.speakBtn(q.w[1]))));
      q.opts.forEach(function(o){
        put(root,h("button",{class:"opt"+(S.picked==null?"":o===q.w[2]?" ok":o===S.picked?" bad":""),style:"width:100%;margin-top:8px",disabled:S.picked!=null,onclick:function(){
          S.picked=o;var ok=o===q.w[2];if(ok)S.ok++;env.grade(q.w,ok);env.render();
        }},o));
      });
      if(S.picked!=null)put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:function(){
        S.picked=null;S.i++;if(S.i>=S.qs.length){S.step=2;askAI();}env.render();
      }},S.i+1<S.qs.length?"Дараагийх ›":"Цаг агаараа ярих ›"));
    }else if(S.step===2){
      if(S.aiBusy||!S.ai)put(root,h("div",{class:"note"},"⏳ Өнөөдрийн цаг агаарыг "+env.langName().toLowerCase()+"р бичиж байна…"));
      else{
        var full=S.ai.map(function(s){return s.t;}).join(" ");
        put(root,h("p",{class:"muted"},"Энэ хоёр өгүүлбэрийг сонсоод, чангаар хэлээрэй."));
        S.ai.forEach(function(s){
          put(root,h("div",{class:"note",style:"margin-top:8px"},h("div",{style:"display:flex;gap:8px;align-items:center"},h("b",{lang:env.lang(),style:"flex:1;font-size:17px"},s.t),env.speakBtn(s.t)),h("div",{class:"muted small",style:"margin-top:4px"},"🇲🇳 "+(s.mn||""))));
        });
        if(S.said)put(root,h("div",{class:"note",style:"margin-top:10px"},h("div",{class:"muted small"},"Таны хэлсэн"),h("div",{lang:env.lang()},S.said),
          h("b",{style:"color:"+(S.score>=.6?"var(--ok)":"var(--danger)")},Math.round(S.score*100)+"% таарсан"+(S.score>=.6?" 👏":" — дахин оролдоорой"))));
        put(root,h("div",{class:"row",style:"margin-top:12px;gap:8px"},
          h("button",{class:"btn"+(S.rec?"":" primary"),style:"flex:1",disabled:S.rec,onclick:function(){listen(full);}},S.rec?"🎙️ Сонсож байна…":"🎤 Чангаар хэлэх"),
          h("button",{class:"btn",onclick:finish},S.said?"Дуусгах ›":"Алгасах")));
      }
    }else if(S.step===3){
      put(root,h("div",{class:"note"},"AI одоогоор холбогдсонгүй тул ярих хэсгийг алгаслаа."));
      put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:finish},"Дүнг харах ›"));
    }else{
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},"⛅"),h("b",{style:"font-size:18px"},"Асуулт: "+S.ok+"/"+S.qs.length),
        S.score!=null?h("div",{class:"muted"},"Ярианы тааралт: "+Math.round(S.score*100)+"%"):null,
        h("div",{class:"muted small",style:"margin-top:6px"},"Маргааш цаг агаар өөрчлөгдөхөд шинэ үгс гарна.")));
      put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:function(){S=null;e.close();}},"Дуусгах"));
    }
    return root;
  }
  window.WxLesson={view:view,doneToday:function(sget,l){return sget("wxl:"+l,"")===day();}};
})();
