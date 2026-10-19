/* Салхи: 🎵 Миний үгсийн дуу — хэрэглэгчийн хэцүү/алдсан/давтах 8–10 үгээр AI богино дуу (2 бадаг + дахилт)
   зохионо. Мөр бүр монгол орчуулгатай; «▶ Дуулах» мөр мөрөөр нь TTS-ээр (удаан хурдаар) уншиж, одоогийн мөрийг
   тодруулна (karaoke). Дуунд орсон зорилтот үгс тодорч, дарахад сонсогдоно. Сүүлийн 10 дуу sget("mysongs"). */
(function(){
  var env=null,h=null,S={busy:false,song:null,line:-1,playing:false,err:null};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function songs(){var a=env.sget("mysongs",[]);return Array.isArray(a)?a:[];}
  function targets(){
    var seen={},out=[];
    [].concat(env.all().filter(env.hard),env.mistakes(),env.words(12)).forEach(function(w){if(w&&!seen[w[1]]&&w[1].length<=24&&out.length<10){seen[w[1]]=1;out.push(w);}});
    return out;
  }
  function parse(r){
    var m=String(r||"").match(/\{[\s\S]*\}/),j=null;try{j=m&&JSON.parse(m[0]);}catch(e){}
    if(!j||!Array.isArray(j.lines))return null;
    var lines=j.lines.filter(function(l){return l&&typeof l.t==="string"&&l.t.trim();}).slice(0,24).map(function(l){return {t:l.t.trim().slice(0,140),mn:String(l.mn||"").slice(0,160),c:!!l.c};});
    return lines.length>=4?{title:String(j.title||"Миний дуу").slice(0,60),lines:lines}:null;
  }
  function make(){
    var ws=targets();if(ws.length<4){env.toast("Дуу зохиоход ядаж 4 үг сурсан байх хэрэгтэй");return;}
    S.busy=true;S.err=null;S.song=null;stop();env.render();
    var q="Write a short, catchy, cheerful song in "+env.langEn()+" for a Mongolian learner at level "+env.level()+".\n"+
      "It MUST use these words (each at least once): "+ws.map(function(w){return w[1];}).join(", ")+".\n"+
      "Structure: verse (4 lines), chorus (4 lines), verse (4 lines), chorus again. Short simple lines that rhyme if possible. Clean, family-friendly.\n"+
      "Reply with ONLY JSON: {\"title\":\"...\",\"lines\":[{\"t\":\"line in "+env.langEn()+"\",\"mn\":\"Mongolian translation (Cyrillic)\",\"c\":true if chorus line}]}";
    Promise.resolve(env.ai([{role:"user",content:q}],{task:"check"})).then(function(r){
      S.busy=false;var s=parse(r);
      if(!s){S.err="AI дуу зохиож чадсангүй. Дахин оролдоно уу.";env.render();return;}
      s.words=ws.map(function(w){return [w[1],w[2]];});s.ts=Date.now();s.lang=env.lang();
      S.song=s;var a=songs();a.unshift(s);env.sset("mysongs",a.slice(0,10));env.addXP(5);env.render();
    },function(){S.busy=false;S.err="AI одоогоор холбогдсонгүй.";env.render();});
  }
  function stop(){S.playing=false;S.line=-1;try{env.stop();}catch(e){}}
  function play(i){
    if(!S.song||i>=S.song.lines.length){stop();env.render();return;}
    S.playing=true;S.line=i;env.render();
    var el=document.getElementById("ms-l"+i);if(el&&el.scrollIntoView)el.scrollIntoView({block:"center",behavior:"smooth"});
    env.speak(S.song.lines[i].t,function(){if(S.playing&&S.line===i)setTimeout(function(){if(S.playing&&S.line===i)play(i+1);},350);},true);
  }
  /* мөрөнд орсон зорилтот үгийг тодруулна */
  function mark(text,words){
    var span=h("span",{lang:env.lang()}),rest=text,low=text.toLowerCase();
    var hits=[];words.forEach(function(w){var k=w[0].toLowerCase(),i=low.indexOf(k);if(i>=0&&k.length>1)hits.push([i,i+k.length,w]);});
    hits.sort(function(a,b){return a[0]-b[0];});var pos=0;
    hits.forEach(function(x){if(x[0]<pos)return;span.append(text.slice(pos,x[0]));
      span.append(h("b",{style:"color:var(--sky);cursor:pointer;text-decoration:underline dotted",title:x[2][1],onclick:function(ev){ev.stopPropagation();env.speak(x[2][0]);env.toast(x[2][0]+" — "+x[2][1]);}},text.slice(x[0],x[1])));pos=x[1];});
    span.append(text.slice(pos));return span;
  }
  function songView(root,s){
    put(root,h("div",{class:"note"},h("b",{style:"font-size:18px"},"🎵 "+s.title),
      h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"},s.words.map(function(w){return h("span",{class:"chip",title:w[1]},w[0]);}))));
    put(root,h("div",{class:"row",style:"margin:10px 0;gap:8px;position:sticky;top:8px;z-index:3"},
      h("button",{class:"btn primary",style:"flex:1",onclick:function(){if(S.playing){stop();env.render();}else play(0);}},S.playing?"⏹ Зогсоох":"▶ Дуулах"),
      h("button",{class:"btn",onclick:function(){stop();S.song=null;env.render();}},"‹ Жагсаалт")));
    s.lines.forEach(function(l,i){
      var on=S.line===i;
      put(root,h("div",{id:"ms-l"+i,style:"padding:8px 12px;border-radius:12px;cursor:pointer;transition:background .2s;"+(l.c?"border-left:3px solid var(--gold);":"")+(on?"background:var(--sel-bg);":""),onclick:function(){stop();play(i);}},
        h("div",{style:"font-size:"+(on?"19px":"17px")+";font-weight:"+(on?"700":"500")},mark(l.t,s.words)),
        h("div",{class:"muted small"},l.mn)));
    });
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){stop();S.song=null;e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"🎵 Миний үгсийн дуу"));
    if(S.song){songView(root,S.song);return root;}
    var ws=targets();
    put(root,h("p",{class:"muted"},"Цээжлэхэд хэцүү байгаа үгсээр чинь AI богино дуу зохионо. Дуулж байхад үгс амархан тогтоно."));
    put(root,h("div",{class:"note"},h("b",null,"Дуунд орох үгс"),h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"},ws.length?ws.map(function(w){return h("span",{class:"chip",title:w[2]},w[1]);}):h("span",{class:"muted"},"Эхлээд хэдэн үг сур."))));
    if(S.err)put(root,h("div",{class:"note",style:"color:var(--danger);margin-top:8px"},S.err));
    put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",disabled:S.busy||ws.length<4,onclick:make},S.busy?"⏳ Дуу зохиож байна…":"✨ Дуу зохиох"));
    var a=songs().filter(function(s){return s.lang===env.lang();});
    if(a.length){
      put(root,h("h3",{style:"margin-top:18px"},"🎶 Миний дуунууд"));
      a.forEach(function(s){put(root,h("button",{class:"gamecard",type:"button",onclick:function(){S.song=s;S.line=-1;env.render();window.scrollTo(0,0);}},h("i",{"aria-hidden":"true"},"🎵"),
        h("div",null,h("b",null,s.title),h("span",null,new Date(s.ts).toLocaleDateString("mn-MN")+" · "+s.words.length+" үг"))));});
    }
    return root;
  }
  window.MySong={view:view,stop:stop};
})();
