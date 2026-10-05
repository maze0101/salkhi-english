/* Салхи: 🎵 дуугаар сурах — хэрэглэгч дуртай дууныхаа үгийг (өөрөө) хуулж оруулна; AI мөр бүрийг монголоор орчуулж,
   сонирхолтой үгсийг тайлбарлана. «Унших» горимд мөр бүр 🔊 + орчуулгатай, «Нөхөх» горимд мөр бүрээс нэг үг нуугдаж
   үгийн сангаас сонгоно. Дуунууд зөвхөн энэ төхөөрөмж дээр хадгалагдана. */
(function(){
  var KEY="songs",MAXL=40,env=null,h=null,S={mode:"list",cur:null,busy:false,err:"",title:"",text:"",gap:null,showMn:{}};
  function list(){var l=env.sget(KEY,[]);return Array.isArray(l)?l.filter(function(s){return s.lang===env.lang();}):[];}
  function saveAll(fn){var l=env.sget(KEY,[]);if(!Array.isArray(l))l=[];l=fn(l);env.sset(KEY,l.slice(-30));}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function parse(t){var m=String(t||"").match(/\{[\s\S]*\}/);if(!m)return null;try{var j=JSON.parse(m[0]);return j&&Array.isArray(j.lines)?j:null;}catch(e){return null;}}
  function add(){
    var lines=S.text.split(/\r?\n/).map(function(l){return l.trim();}).filter(Boolean);
    if(lines.length<2){S.err="Дууны үгээ мөр мөрөөр нь оруулна уу.";env.render();return;}
    if(lines.length>MAXL)lines=lines.slice(0,MAXL);
    /* давтагддаг дахилтыг нэг л удаа орчуулна */
    var uniq=[];lines.forEach(function(l){if(uniq.indexOf(l)<0)uniq.push(l);});
    S.busy=true;S.err="";env.render();
    var LN=env.langEn();
    var q="These are song lyrics in "+LN+" that a Mongolian learner pasted. Translate EVERY line into natural Mongolian (Cyrillic), keeping the order, and pick the 8 most useful words or expressions to learn.\n"+
      "Lines:\n"+uniq.map(function(l,i){return (i+1)+". "+l;}).join("\n")+"\n\nReply with ONLY JSON: {\"lines\":[\"<Mongolian for line 1>\",\"<line 2>\",...],\"words\":[[\"<"+LN+" word or expression as in the song>\",\"<Mongolian meaning>\"],...]}";
    Promise.resolve(env.ai([{role:"user",content:q}])).then(function(r){
      S.busy=false;var j=parse(r);
      if(!j||j.lines.length<Math.min(uniq.length,2)){S.err="AI орчуулж чадсангүй. Дахин оролдоно уу.";env.render();return;}
      var tr={};uniq.forEach(function(l,i){tr[l]=String(j.lines[i]||"");});
      var song={id:"s"+Date.now(),lang:env.lang(),title:(S.title.trim()||lines[0]).slice(0,60),lines:lines.map(function(l){return [l,tr[l]||""];}),
        words:(Array.isArray(j.words)?j.words:[]).filter(function(w){return Array.isArray(w)&&w[0]&&w[1];}).slice(0,10),ts:Date.now()};
      saveAll(function(l){l.push(song);return l;});
      S.title="";S.text="";S.cur=song;S.mode="read";S.showMn={};env.addXP(3);env.render();window.scrollTo(0,0);
    });
  }
  /* нөхөх: мөр бүрээс 3+ үсэгтэй нэг үгийг нууна */
  function mkGap(song){
    var items=[];
    song.lines.forEach(function(p,i){
      var ws=p[0].split(/\s+/).filter(function(x){return x.replace(/[^\p{L}']/gu,"").length>=3;});
      if(!ws.length)return;
      var w=ws[Math.floor(Math.random()*ws.length)],clean=w.replace(/^[^\p{L}']+|[^\p{L}']+$/gu,"");
      items.push({i:i,line:p[0],mn:p[1],word:clean});
    });
    items=shuffle(items).slice(0,8).sort(function(a,b){return a.i-b.i;});
    return {items:items,bank:shuffle(items.map(function(x){return x.word;})),k:0,ok:0,pick:null};
  }
  function viewSong(root){
    var s=S.cur;
    root.append(h("button",{class:"back",onclick:function(){env.stop();S.mode="list";S.cur=null;S.gap=null;env.render();}},"‹ Дуунууд"));
    root.append(h("h2",{style:"margin-bottom:6px"},"🎵 "+s.title));
    root.append(h("div",{class:"seg",style:"margin:6px 0 12px"},
      h("button",{"aria-pressed":String(S.mode==="read"),onclick:function(){S.mode="read";env.render();}},"📖 Унших"),
      h("button",{"aria-pressed":String(S.mode==="gap"),onclick:function(){S.mode="gap";S.gap=mkGap(s);env.render();}},"🧩 Нөхөх"),
      h("button",{"aria-pressed":String(S.mode==="words"),onclick:function(){S.mode="words";env.render();}},"🔑 Үгс")));
    if(S.mode==="read"){
      root.append(h("div",{class:"row",style:"margin:0 0 8px"},h("button",{class:"btn ghost",onclick:function(){var all=!Object.keys(S.showMn).length;S.showMn={};if(all)s.lines.forEach(function(p,i){S.showMn[i]=1;});env.render();}},Object.keys(S.showMn).length?"🇲🇳 Бүгдийг нуух":"🇲🇳 Бүгдийг харах")));
      s.lines.forEach(function(p,i){
        root.append(h("div",{class:"srow",style:"align-items:flex-start;cursor:pointer",onclick:function(){if(S.showMn[i])delete S.showMn[i];else S.showMn[i]=1;env.render();}},
          h("span",{style:"flex:1"},h("div",{style:"font-size:16.5px"},p[0]),S.showMn[i]&&p[1]?h("div",{class:"muted small"},p[1]):null),
          h("button",{class:"btn ghost",style:"padding:4px 10px;flex:none","aria-label":"Сонсох",onclick:function(ev){ev.stopPropagation();env.speak(p[0]);}},"🔊")));
      });
      root.append(h("p",{class:"muted small",style:"margin-top:8px"},"Мөр дээр дарахад орчуулга нь гарна. 🔊 нь дууны хэмнэлээр биш, ердийн яриагаар уншина."));
      return;
    }
    if(S.mode==="words"){
      if(!s.words.length)root.append(h("p",{class:"muted"},"Үг олдсонгүй."));
      s.words.forEach(function(w){
        var has=env.hasWord(w[0]);
        root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},h("b",null,w[0]),h("span",{class:"muted"}," — "+w[1])),env.speakBtn(w[0]),
          has?h("span",{class:"muted small"},"✅"):h("button",{class:"btn ghost",style:"padding:4px 10px","aria-label":"Миний үгс-д нэмэх",onclick:function(){env.addWord(w[0],w[1],"","","");env.toast("➕ «Миний үгс»-д нэмэгдлээ");env.render();}},"➕")));
      });
      return;
    }
    var G=S.gap||(S.gap=mkGap(s));
    if(!G.items.length){root.append(h("p",{class:"muted"},"Нөхөх үг олдсонгүй."));return;}
    if(G.k>=G.items.length){
      if(!G.done){G.done=true;env.addXP(3+G.ok*2);env.celebrate();}
      root.append(h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},"🎶"),h("b",null,G.ok+" / "+G.items.length+" зөв"),h("div",{class:"muted"},"+"+(3+G.ok*2)+" XP")));
      root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){S.gap=mkGap(s);env.render();}},"🔁 Дахин")));
      return;
    }
    var it=G.items[G.k],re=new RegExp("(^|[^\\p{L}'])"+it.word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?=$|[^\\p{L}'])","u");
    var shown=it.line.replace(re,function(m,a){return a+"_____";});
    root.append(h("p",{class:"muted small"},(G.k+1)+" / "+G.items.length+" · Хоосон зайд тохирох үгийг сонго"));
    root.append(h("div",{class:"note",style:"font-size:19px;line-height:1.5"},shown,h("div",{class:"muted small",style:"margin-top:6px"},it.mn)));
    var opts=G.opts||(G.opts=shuffle([it.word].concat(shuffle(G.bank.filter(function(x){return x.toLowerCase()!==it.word.toLowerCase();})).slice(0,3))));
    opts.forEach(function(o){
      root.append(h("button",{class:"opt"+(G.pick!=null?(o===it.word?" ok":o===G.pick?" bad":""):""),disabled:G.pick!=null,onclick:function(){G.pick=o;if(o===it.word)G.ok++;env.speak(it.line);env.render();}},o));
    });
    if(G.pick!=null){
      root.append(h("div",{class:"fb "+(G.pick===it.word?"ok":"bad")},G.pick===it.word?"Зөв! 🎵":"Зөв нь: "+it.word));
      root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){G.k++;G.pick=null;G.opts=null;env.render();}},"Дараагийн ›")));
    }
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    if(S.cur){viewSong(root);return root;}
    root.append(h("p",{class:"muted"},"Дуртай "+e.langName().toLowerCase()+" дууныхаа үгийг хуулж оруул. AI мөр бүрийг орчуулж, сурах үгсийг ялгана. Дараа нь хоосон зай нөхөж тоглоно."));
    var ti=h("input",{class:"tin",maxlength:"60",placeholder:"Дууны нэр (заавал биш)","aria-label":"Дууны нэр"});ti.value=S.title;ti.addEventListener("input",function(){S.title=ti.value;});
    var ta=h("textarea",{class:"tin",rows:"7",maxlength:"3000",placeholder:"Дууны үгийг энд мөр мөрөөр нь буулга…","aria-label":"Дууны үг",style:"width:100%;font:inherit;resize:vertical"});
    ta.value=S.text;ta.addEventListener("input",function(){S.text=ta.value;});
    root.append(ti,ta,h("button",{class:"btn primary",style:"width:100%;margin-top:8px",disabled:S.busy,onclick:add},S.busy?"🤖 Орчуулж байна…":"🎵 Дуу нэмэх"));
    root.append(h("p",{class:"muted small"},"Эхний "+MAXL+" мөрийг ашиглана. Дууны үг зөвхөн таны утсан дээр хадгалагдана."));
    if(S.err)root.append(h("div",{class:"fb bad"},S.err));
    var l=list().slice().reverse();
    if(l.length)root.append(h("h3",{style:"margin:16px 0 6px"},"🎶 Миний дуунууд"));
    l.forEach(function(s){
      root.append(h("div",{class:"srow"},h("button",{class:"btn ghost",style:"flex:1;text-align:left;padding:8px 10px",onclick:function(){S.cur=s;S.mode="read";S.showMn={};env.render();window.scrollTo(0,0);}},
        h("b",null,"🎵 "+s.title),h("div",{class:"muted small"},s.lines.length+" мөр · "+s.words.length+" үг")),
        h("button",{class:"btn ghost",style:"padding:4px 10px;flex:none","aria-label":"Устгах",onclick:function(){
          if(S.rm!==s.id){S.rm=s.id;env.toast("Дахин дарвал устгана");return;}
          saveAll(function(a){return a.filter(function(x){return x.id!==s.id;});});env.render();
        }},"🗑")));
    });
    return root;
  }
  window.Songs={view:view};
})();
