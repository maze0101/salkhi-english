/* Салхи: 🤟 дохионы хэл — Монгол дохионы хэл (МДХ) ба Америкийн дохионы хэл (ASL).
   МДХ: https://mnsl.mn (© Монгол дохионы хэл) — 1398 дохио, 35 хурууны үсэг, тоо. Зураг, видео файлыг хуулахгүй, шууд тоглуулахгүй (лицензгүй):
        дарсан үед тэдний дохионы хуудсыг апп дотор iframe-ээр нэг нэгээр нээж, видео тэнд тоглоно; индекс (гарчиг + хаяг) sign/msl-data.js-д sitemap-аас авсан, энэ хэсгийг нээхэд ачаална.
   ASL: хурууны цагаан толгойн A–Z зураг — нийтийн өмч (wpclipart.com, Wikimedia Commons «Sign language A–Z.svg»), sign/asl/*.svg.
        Үгсийн видео — signasl.org (холбоос). Дасгал: үсэг таах, үг үсэглэх, нэрээ ASL-ээр.
   Үндсэн 48 үг: [ангилал, монгол, англи, signasl slug, МДХ дохионы дугаар|null (зөв дохио олдоогүй бол mnsl.mn-ээс хайна)]. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var WORDS=[
    ["👋 Мэндчилгээ","сайн байна уу","hello","hello",28],["👋 Мэндчилгээ","баярлалаа","thank you","thank-you",137],["👋 Мэндчилгээ","уучлаарай","sorry","sorry",56],
    ["👋 Мэндчилгээ","гуйя","please","please",54],["👋 Мэндчилгээ","тийм","yes","yes",1337],["👋 Мэндчилгээ","үгүй","no","no",1090],
    ["👋 Мэндчилгээ","баяртай (салахдаа)","goodbye","goodbye",240],["👋 Мэндчилгээ","нэр","name","name",null],["👋 Мэндчилгээ","ойлгох","understand","understand",895],
    ["👨‍👩‍👧 Гэр бүл","ээж","mother","mother",29],["👨‍👩‍👧 Гэр бүл","аав","father","father",15],["👨‍👩‍👧 Гэр бүл","ах","brother","brother",303],
    ["👨‍👩‍👧 Гэр бүл","эгч","sister","sister",303],["👨‍👩‍👧 Гэр бүл","гэр бүл","family","family",210],["👨‍👩‍👧 Гэр бүл","хүүхэд","child","child",109],
    ["👨‍👩‍👧 Гэр бүл","найз","friend","friend",660],["👨‍👩‍👧 Гэр бүл","багш","teacher","teacher",197],
    ["🏠 Өдөр тутам","ус","water","water",null],["🏠 Өдөр тутам","хоол","food","food",778],["🏠 Өдөр тутам","идэх","eat","eat",431],
    ["🏠 Өдөр тутам","уух","drink","drink",481],["🏠 Өдөр тутам","жорлон","toilet","toilet",null],["🏠 Өдөр тутам","туслах","help","help",782],
    ["🏠 Өдөр тутам","гэр","home","home",188],["🏠 Өдөр тутам","сургууль","school","school",500],["🏠 Өдөр тутам","ажил","work","work",588],
    ["🏠 Өдөр тутам","эмч","doctor","doctor",1058],["🏠 Өдөр тутам","мөнгө","money","money",1180],["🏠 Өдөр тутам","унтах","sleep","sleep",19],
    ["❤️ Мэдрэмж","баяртай (баярласан)","happy","happy",161],["❤️ Мэдрэмж","гунигтай","sad","sad",null],["❤️ Мэдрэмж","хайртай","love","love",136],
    ["❤️ Мэдрэмж","ядрах","tired","tired",814],["❤️ Мэдрэмж","өлсөх","hungry","hungry",200],["❤️ Мэдрэмж","өвдөх","sick","sick",517],
    ["❤️ Мэдрэмж","сайн","good","good",665],["❤️ Мэдрэмж","муу","bad","bad",null],
    ["❓ Асуулт","юу","what","what",1208],["❓ Асуулт","хэн","who","who",679],["❓ Асуулт","хаана","where","where",96],
    ["❓ Асуулт","хэзээ","when","when",null],["❓ Асуулт","яагаад","why","why",970],["❓ Асуулт","яаж","how","how",823],
    ["🕒 Цаг","өнөөдөр","today","today",957],["🕒 Цаг","маргааш","tomorrow","tomorrow",null],["🕒 Цаг","өчигдөр","yesterday","yesterday",null],
    ["🕒 Цаг","одоо","now","now",958],["🕒 Цаг","цаг","time","time",null]
  ];
  var ABC="abcdefghijklmnopqrstuvwxyz".split(""),MSL="https://mnsl.mn/";
  /* ASL үгийн видео: Dr. Bill Vicars, ASL University (lifeprint.com) — YouTube (embed зөвшөөрсөн, oEmbed-ээр шалгасан).
     Lifeprint-ийн хуудаснаас видеог авч, гарчиг нь тухайн үгээр эхэлдгийг л сонгосон (хажуугийн ерөнхий ба өгүүлбэрийн видеог хассан).
     hello → «Hi», toilet → «BATHROOM / toilet / restroom», good → «GOOD-[well]» гараар сонгосон. food, eat, help, money, sick-д зөвхөн өгүүлбэрийн видео
     байсан тул оруулаагүй. signasl.org нь iframe-ийг хориглодог (X-Frame-Options: SAMEORIGIN) тул үлдсэн 9 үг тийшээ холбоосоор. */
  var YT={"hello":"rhfJGeMDMzQ","toilet":"2xdhyJEgXdI","good":"tTDXplV6TKA","thank-you":"2W0BDFUjsG0","please":"rnb9FxPO7is","yes":"0usayvOXzHo","no":"QJXKaOSyl4o","goodbye":"4e14uNAn2Ao","name":"GbeC9TFuSX4","understand":"5N10dIavSYc",
    "mother":"8yzUd0Md_uY","father":"30H8W5kBGB8","brother":"G0fzmn3pQng","sister":"0z2_gcB5OJ8","family":"SxrxUgeTt00","child":"32hgy9NSs7k","friend":"6RRmIyhkMx0","teacher":"CrUCwJklAUA",
    "water":"-SdOfxGhb0A","drink":"537MWOtCl78","home":"WSHD1XX7kWk","school":"vuE3RN10AGA","work":"mJrUYRjvrew","doctor":"IEVgcJA3JWk",
    "happy":"ZXHHO_DY6_A","sad":"zfkQYQhrZ6Q","love":"DAZB0eVf5t0","tired":"iZ6EeQqzZl0","bad":"prwtXZ1o2As",
    "what":"bnnE_k7BYOI","who":"wKl26BsEAoc","where":"HS0SXS-GHYY","when":"YWxvqP__qos","why":"K0yp2v6Atxs","how":"BaPzB4Xsq9Y",
    "today":"3BxRfKvfnpU","tomorrow":"6gFOZMDptIk","yesterday":"BrSb83b9kbY","now":"g2j70neQ_lI"};
  /* YouTube-ийн албан ёсны embed (youtube-nocookie), апп дотор тоглоно */
  function ytCard(id,en,slug){
    var w=h("div",{class:"note",style:"margin:6px 0 10px;padding:8px"});
    put(w,h("iframe",{src:"https://www.youtube-nocookie.com/embed/"+id+"?rel=0&playsinline=1&modestbranding=1&autoplay=1&mute=1",title:"ASL: "+en,
        allow:"autoplay; encrypted-media; picture-in-picture; fullscreen",allowfullscreen:true,referrerpolicy:"strict-origin-when-cross-origin",
        style:"display:block;width:100%;aspect-ratio:16/9;height:auto;border:0;border-radius:10px;background:#000"}),
      h("div",{class:"row",style:"margin-top:6px"},
        h("button",{class:"btn ghost",onclick:function(){S.open=null;env.render();}},"✕ Хаах"),
        h("a",{class:"btn ghost",href:"https://www.signasl.org/sign/"+slug,target:"_blank",rel:"noopener",style:"text-decoration:none"},"Өөр хувилбарууд ↗")),
      h("div",{class:"muted small",style:"margin-top:4px"},"Видео: Dr. Bill Vicars — ASL University (Lifeprint.com), YouTube"));
    return w;
  }
  var TR={"а":"a","б":"b","в":"v","г":"g","д":"d","е":"ye","ё":"yo","ж":"j","з":"z","и":"i","й":"i","к":"k","л":"l","м":"m","н":"n","о":"o","ө":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ү":"u","ф":"f","х":"kh","ц":"ts","ч":"ch","ш":"sh","щ":"sh","ъ":"","ы":"y","ь":"i","э":"e","ю":"yu","я":"ya"};
  var env=null,h=null,S={tab:"msl",q:"",name:"",nameA:"",quiz:null,spell:null,loading:false,open:null,from:""};
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function link(href,label,extra){return h("a",{class:"btn",href:href,target:"_blank",rel:"noopener",style:"text-decoration:none;"+(extra||"")},label);}
  function msl(){return window.MSL_DATA||null;}
  function loadMsl(){
    if(msl()||S.loading)return;S.loading=true;
    var s=document.createElement("script");s.src="sign/msl-data.js";s.onload=function(){S.loading=false;S.ix=null;env.render();};
    s.onerror=function(){S.loading=false;S.err=true;env.render();};document.head.appendChild(s);
  }
  /* МДХ индекс: {n, slug, t (гарчиг)} */
  function ix(){
    if(S.ix)return S.ix;var d=msl();if(!d)return [];
    S.ix=d.ug.split("\n").map(function(s){return {n:parseInt(s,10),s:s,t:s.replace(/^\d+-/,"").replace(/-\d+$/,"").replace(/-/g," ")};});
    return S.ix;
  }
  function ugURL(e){return MSL+"ug/"+encodeURIComponent(e.s)+"/";}
  function byNum(n){var a=ix();for(var i=0;i<a.length;i++)if(a[i].n===n)return a[i];return null;}
  function seen(k){var s=env.sget("signSeen",{})||{};if(!s[k]){s[k]=1;env.sset("signSeen",s);env.addXP(1);}}
  function translit(s){return String(s||"").toLowerCase().split("").map(function(c){return TR[c]!=null?TR[c]:c;}).join("").replace(/[^a-z]/g,"");}
  function img(c,size){return h("img",{src:"sign/asl/"+c+".svg",alt:"ASL үсэг "+c.toUpperCase(),width:String(size||64),height:String(size||64),loading:"lazy",style:"width:"+(size||64)+"px;height:"+(size||64)+"px;object-fit:contain;background:#fff;border-radius:10px;border:1px solid var(--line)"});}
  /* ---------- 🇲🇳 МДХ ---------- */
  /* mnsl.mn-ийн тухайн дохионы хуудсыг апп дотор цонх болгон (iframe) бүтнээр нь харуулна — видео (автоматаар, дуугүй),
     хурд, гарын хэлбэр/байрлал/хөдөлгөөний зураг тэдний сайт дээр, тэдний брэнд, холбоостойгоо тоглоно. Видео файлыг шууд
     (<video src=…mp4>) тоглуулахгүй — зохиогчийн эрх эзэмшигчийн зөвшөөрөлгүй. Сайт iframe-ийг хориглоогүй (X-Frame-Options байхгүй).
     Нэг удаад нэг л цонх (S.open), дарсан үед л ачаална. */
  function card(url,label){
    var w=h("div",{class:"note",style:"margin:6px 0 10px;padding:8px"});
    put(w,h("iframe",{src:url,title:"Монгол дохионы хэл: "+label,allow:"autoplay; fullscreen",allowfullscreen:true,
        sandbox:"allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",referrerpolicy:"strict-origin-when-cross-origin",
        style:"display:block;width:100%;height:560px;border:0;border-radius:10px;background:#1b1f22"}),
      h("div",{class:"row",style:"margin-top:6px"},
        h("button",{class:"btn ghost",onclick:function(){S.open=null;env.render();}},"✕ Хаах"),
        h("a",{class:"btn ghost",href:url,target:"_blank",rel:"noopener",style:"text-decoration:none"},"↗ Шинэ цонхонд")),
      h("div",{class:"muted small",style:"margin-top:4px"},"Видео, зураг: «Монгол дохионы хэл» цахим толь (mnsl.mn) — тэдний хуудас апп дотор нээгдэж байна. Доош гүйлгэж гарын хэлбэр, ижил утгатай дохиог үзээрэй."));
    return w;
  }
  function toggle(url,key,from){S.open=S.open===url&&S.from===(from||"")?null:url;S.from=from||"";if(S.open)seen(key);env.render();}
  /* from: аль хэсгээс нээсэн (search / basic) — ижил дохио хоёр газар байвал карт зөвхөн дарсан газарт гарна */
  function row(url,key,main,sub,icon,from){
    var open=S.open===url&&S.from===from;
    return h("button",{class:"lrow",type:"button","aria-expanded":String(open),style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"+(open?";border-color:var(--sky)":""),onclick:function(){toggle(url,key,from);}},
      icon?h("span",{class:"hexb ico"},icon):null,h("span",{style:"flex:1"},main,sub?h("div",{class:"muted small"},sub):null),h("span",{"aria-hidden":"true"},open?"▾":"▶️"));
  }
  function viewMsl(root){
    put(root,h("p",{class:"muted"},"Монголд 9–15 мянган сонсголгүй иргэн амьдардаг. Үг, үсэг дээр дарахад дохионы видео энд, апп дотор тоглоно — албан ёсны «Монгол дохионы хэл» цахим толь (mnsl.mn)-ийн хуудсаар."));
    if(!msl()){put(root,h("p",{class:"muted"},S.err?"Индексийг ачаалж чадсангүй. Интернэтээ шалгана уу.":"Ачаалж байна…"));loadMsl();return;}
    /* хайлт */
    var inp=h("input",{class:"tin",type:"search",placeholder:"🔎 Үгээр хайх (ж: баярлалаа, ээж, сургууль)","aria-label":"Дохио хайх",value:S.q});
    var res=h("div");
    var draw=function(){
      res.textContent="";var q=String(S.q||"").toLowerCase().trim();
      if(q.length<2){put(res,h("p",{class:"muted small",style:"margin:6px 0"},"Нийт "+ix().length+" дохио. 2-оос дээш үсэг бичнэ үү."));return;}
      var m=ix().filter(function(e){return (" "+e.t+" ").indexOf(" "+q)>=0;});
      m.sort(function(a,b){return (a.t.indexOf(q)===0?0:1)-(b.t.indexOf(q)===0?0:1)||a.t.length-b.t.length;});
      if(!m.length){put(res,h("p",{class:"muted small",style:"margin:6px 0"},"Олдсонгүй. Өөр үгээр хайгаарай."));return;}
      m.slice(0,30).forEach(function(e){var u=ugURL(e);put(res,row(u,"m"+e.n,h("div",{class:"t"},e.t),"№"+e.n,"🤟","search"));if(S.open===u&&S.from==="search")put(res,card(u,e.t));});
      if(m.length>30)put(res,h("p",{class:"muted small"},"… бас "+(m.length-30)+" илэрц. Илүү тодорхой бичээрэй."));
    };
    inp.addEventListener("input",function(){S.q=inp.value;draw();});
    put(root,inp,res);draw();
    /* үндсэн үгс */
    put(root,h("h3",{style:"margin:18px 0 6px"},"📚 Үндсэн үгс"));
    var cat="";
    WORDS.forEach(function(w){
      if(w[0]!==cat){cat=w[0];put(root,h("div",{class:"muted small",style:"font-weight:700;margin:10px 0 4px"},cat));}
      var e=w[4]!=null?byNum(w[4]):null;
      if(!e){put(root,h("a",{class:"lrow",href:MSL+"ugw/",target:"_blank",rel:"noopener",style:"text-decoration:none;color:inherit"},
        h("span",{style:"flex:1;font-weight:600"},w[1]),h("span",{class:"muted small"},"🔎 тольд хайх ↗")));return;}
      var u=ugURL(e);
      put(root,row(u,"m"+e.n,h("b",null,w[1]),null,null,"basic"));
      if(S.open===u&&S.from==="basic")put(root,card(u,w[1]));
    });
    /* хурууны цагаан толгой */
    put(root,h("h3",{style:"margin:18px 0 6px"},"🔤 Хурууны цагаан толгой (дактиль)"),
      h("p",{class:"muted small",style:"margin:0 0 6px"},"Нэр, газрын нэр зэрэг дохиогүй үгийг үсэг үсгээр нь хуруугаар үсэглэдэг. Үсэг дээр дарж гарын хэлбэрийг үзээрэй."));
    var lurl=function(L){return MSL+"khuruu-useg/"+encodeURIComponent(L)+"/";};
    var g=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:6px"}),openL=null;
    msl().letters.forEach(function(L){var u=lurl(L),on=S.open===u&&S.from==="grid";if(on)openL=L;
      put(g,h("button",{class:"btn"+(on?" primary":""),type:"button","aria-pressed":String(on),style:"margin:0;padding:8px 0;text-align:center;font-weight:800;font-size:18px",onclick:function(){toggle(u,"l"+L,"grid");}},L.toUpperCase()));});
    put(root,g);
    if(openL)put(root,card(lurl(openL),"«"+openL.toUpperCase()+"» үсэг"));
    var ni=h("input",{class:"tin",placeholder:"✍️ Нэрээ бичээд үсэглэх (ж: Болд)","aria-label":"Нэр",value:S.name,style:"margin-top:10px"});
    var nr=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:6px"});
    var drawN=function(){nr.textContent="";var shown=null;String(S.name||"").toLowerCase().split("").forEach(function(c){
      if(msl().letters.indexOf(c)>=0){var u=lurl(c);put(nr,h("button",{class:"chip",type:"button","aria-pressed":String(S.open===u),style:"font-weight:800"+(S.open===u?";border-color:var(--sky)":""),onclick:function(){toggle(u,"l"+c,"name");}},c.toUpperCase()));if(S.open===u&&S.from==="name")shown=[u,c];}});
      if(shown)put(nr,h("div",{style:"width:100%"},card(shown[0],"«"+shown[1].toUpperCase()+"» үсэг")));};
    ni.addEventListener("input",function(){S.name=ni.value;drawN();});
    put(root,ni,nr);drawN();
    put(root,h("p",{class:"muted small",style:"margin:4px 0 0"},"Үсэг бүр дээр дарж дарааллаар нь гарын хэлбэрийг харна."));
    /* тоо */
    var too=msl().too.split("\n").slice(0,21),openT=null;
    put(root,h("h3",{style:"margin:18px 0 6px"},"🔢 Тоо"));
    var tg=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px"});
    too.forEach(function(s){var u=MSL+"too/"+encodeURIComponent(s)+"/",lb=s.replace(/-\d+$/,"").replace(/-/g," "),on=S.open===u&&S.from==="num";if(on)openT=[u,lb];
      put(tg,h("button",{class:"chip",type:"button","aria-pressed":String(on),style:on?"border-color:var(--sky)":"",onclick:function(){toggle(u,"t"+s,"num");}},lb));});
    put(root,tg);
    if(openT)put(root,card(openT[0],openT[1]));
    put(root,h("p",{class:"muted small"},"Бусад тоо: ",h("a",{href:MSL+"too/",target:"_blank",rel:"noopener"},"mnsl.mn/too ↗")));
    put(root,h("p",{class:"muted small",style:"margin-top:16px"},"Эх сурвалж: «Монгол дохионы хэл» цахим толь — ",h("a",{href:MSL,target:"_blank",rel:"noopener"},"mnsl.mn"),". Зураг, видео, дохионы зохиогчийн эрх тэдэнд хамаарна; Салхи тэдний хуудсыг апп дотор харуулж байна."));
  }
  /* ---------- 🇺🇸 ASL ---------- */
  function quizView(root){
    var Q=S.quiz;
    if(Q.i>=Q.qs.length){
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},Q.ok>=8?"🏆":"🤟"),h("div",{style:"font-weight:800;font-size:22px"},Q.ok+" / "+Q.qs.length),h("div",{class:"muted"},"+"+Q.ok+" XP")),
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.quiz=null;env.render();}},"Буцах"),h("button",{class:"btn primary",onclick:startQuiz},"Дахин")));
      if(!Q.fin){Q.fin=true;env.logAct("sign");if(Q.ok>=8)env.celebrate();}
      return;
    }
    var q=Q.qs[Q.i];
    put(root,h("p",{class:"muted small"},"Асуулт "+(Q.i+1)+" / "+Q.qs.length+" · ✅ "+Q.ok),h("div",{style:"text-align:center;margin:8px 0"},img(q.a,150)),h("div",{class:"q",style:"text-align:center"},"Энэ аль үсэг вэ?"));
    var g=h("div",{style:"display:grid;grid-template-columns:repeat(2,1fr);gap:8px"});
    q.o.forEach(function(o){var cls="opt";if(q.p!=null){if(o===q.a)cls+=" ok";else if(o===q.p)cls+=" bad";}
      put(g,h("button",{class:cls,disabled:q.p!=null,style:"font-size:24px;font-weight:800;margin:0",onclick:function(){q.p=o;if(o===q.a){Q.ok++;env.addXP(1);}env.render();}},o.toUpperCase()));});
    put(root,g);
    if(q.p!=null)put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:10px",onclick:function(){Q.i++;env.render();}},Q.i+1<Q.qs.length?"Дараагийнх ›":"Дүн харах"));
  }
  function startQuiz(){
    S.quiz={qs:shuffle(ABC).slice(0,10).map(function(a){return {a:a,o:shuffle([a].concat(shuffle(ABC.filter(function(x){return x!==a;})).slice(0,3))),p:null};}),i:0,ok:0};
    env.render();window.scrollTo(0,0);
  }
  function spellWords(){return WORDS.map(function(w){return w[2];}).filter(function(x){return /^[a-z]{3,6}$/.test(x);});}
  function startSpell(){var l=shuffle(spellWords());S.spell={list:l.slice(0,5),i:0,ok:0,tries:0,v:""};env.render();window.scrollTo(0,0);}
  function spellView(root){
    var P=S.spell;
    if(P.i>=P.list.length){
      if(!P.fin){P.fin=true;env.logAct("sign");}
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},"🔡"),h("div",{style:"font-weight:800;font-size:22px"},P.ok+" / "+P.list.length),h("div",{class:"muted"},"+"+(P.ok*2)+" XP")),
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.spell=null;env.render();}},"Буцах"),h("button",{class:"btn primary",onclick:startSpell},"Дахин")));
      return;
    }
    var w=P.list[P.i],row=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0"});
    w.split("").forEach(function(c){put(row,img(c,72));});
    var mn=WORDS.filter(function(x){return x[2]===w;})[0];
    put(root,h("p",{class:"muted small"},"Үг "+(P.i+1)+" / "+P.list.length+" · хуруугаар үсэглэсэн англи үгийг уншаарай"),row);
    var inp=h("input",{class:"tin",autocomplete:"off",autocapitalize:"off",spellcheck:"false","aria-label":"Үсэглэсэн үг",placeholder:"Англи үгийг бичнэ үү",value:P.v,style:"text-align:center;font-size:20px"});
    var check=function(){var v=String(inp.value||"").toLowerCase().trim();if(!v)return;
      if(v===w){P.ok++;env.addXP(2);env.toast("✅ "+w+" — "+(mn?mn[1]:""),1800);P.i++;P.tries=0;P.v="";env.render();}
      else{P.tries++;P.v="";env.toast(P.tries>=2?"Зөв нь: "+w:"❌ Дахин оролдоорой",1500);if(P.tries>=2){P.i++;P.tries=0;}env.render();}};
    inp.addEventListener("input",function(){P.v=inp.value;});
    inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();check();}});
    put(root,inp,h("button",{class:"btn primary",style:"width:100%;margin-top:8px",onclick:check},"Шалгах"));
    setTimeout(function(){if(inp.isConnected)inp.focus();},0);
  }
  function viewAsl(root){
    if(S.quiz){quizView(root);return;}
    if(S.spell){spellView(root);return;}
    put(root,h("p",{class:"muted"},"Америкийн дохионы хэл (ASL) — АНУ, Канадад хэрэглэгддэг, дэлхийд хамгийн өргөн тархсан дохионы хэл. Хурууны цагаан толгой нь нэг гараар үсэглэдэг."));
    put(root,h("div",{class:"row"},h("button",{class:"btn primary",onclick:startQuiz},"📝 Үсэг таах"),h("button",{class:"btn",onclick:startSpell},"🔡 Үг үсэглэх")));
    put(root,h("h3",{style:"margin:16px 0 6px"},"🔤 Хурууны цагаан толгой A–Z"));
    var g=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px"});
    ABC.forEach(function(c){put(g,h("div",{style:"text-align:center"},img(c,72),h("div",{style:"font-weight:800"},c.toUpperCase()+(c==="j"||c==="z"?" ↷":""))));});
    put(root,g,h("p",{class:"muted small"},"↷ J ба Z нь хөдөлгөөнтэй: J — чигчий хуруугаараа «J» зурна, Z — долоовор хуруугаараа агаарт «Z» зурна."));
    /* нэрээ ASL-ээр */
    put(root,h("h3",{style:"margin:16px 0 6px"},"✍️ Нэрээ ASL-ээр"));
    var ni=h("input",{class:"tin",placeholder:"Нэрээ бичнэ үү (ж: Болд, Saraa)","aria-label":"Нэр",value:S.nameA});
    var out=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"});
    var draw=function(){out.textContent="";var t=translit(S.nameA).slice(0,20);
      if(!t)return;put(out,h("div",{style:"width:100%;font-weight:700"},t.toUpperCase()));
      t.split("").forEach(function(c){put(out,h("div",{style:"text-align:center"},img(c,60),h("div",{class:"small",style:"font-weight:700"},c.toUpperCase())));});};
    ni.addEventListener("input",function(){S.nameA=ni.value;draw();});
    put(root,ni,out);draw();
    /* үндсэн үгс */
    put(root,h("h3",{style:"margin:18px 0 6px"},"📚 Үндсэн үгс (видео)"));
    var cat="";
    WORDS.forEach(function(w){
      if(w[0]!==cat){cat=w[0];put(root,h("div",{class:"muted small",style:"font-weight:700;margin:10px 0 4px"},cat));}
      var yt=YT[w[3]],u="yt:"+yt;
      if(!yt){put(root,h("a",{class:"lrow",href:"https://www.signasl.org/sign/"+w[3],target:"_blank",rel:"noopener",style:"text-decoration:none;color:inherit",onclick:function(){seen("a"+w[3]);}},
        h("span",{style:"flex:1"},h("b",null,w[2]),h("span",{class:"muted"}," — "+w[1])),h("span",{class:"muted small"},"🎥 signasl ↗")));return;}
      var on=S.open===u&&S.from==="asl";
      put(root,h("button",{class:"lrow",type:"button","aria-expanded":String(on),style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"+(on?";border-color:var(--sky)":""),onclick:function(){toggle(u,"a"+w[3],"asl");}},
        h("span",{style:"flex:1"},h("b",null,w[2]),h("span",{class:"muted"}," — "+w[1])),h("span",{"aria-hidden":"true"},on?"▾":"▶️")));
      if(on)put(root,ytCard(yt,w[2],w[3]));
    });
    put(root,h("p",{class:"muted small",style:"margin-top:16px"},"Хурууны цагаан толгойн зураг: нийтийн өмч (wpclipart.com, Wikimedia Commons). ▶️ видео: Dr. Bill Vicars — ",
      h("a",{href:"https://www.lifeprint.com",target:"_blank",rel:"noopener"},"ASL University (Lifeprint.com)"),", YouTube-ээр. Бусад үг: ",h("a",{href:"https://www.signasl.org",target:"_blank",rel:"noopener"},"signasl.org"),"."));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){if(S.quiz||S.spell){S.quiz=null;S.spell=null;env.render();}else e.close();}},S.quiz||S.spell?"‹ ASL":"‹ Дүрэм"),
      h("h2",null,"🤟 Дохионы хэл"));
    if(!S.quiz&&!S.spell){
      var seg=h("div",{class:"seg",role:"group","aria-label":"Дохионы хэл",style:"margin-bottom:10px"});
      [["msl","🇲🇳 Монгол"],["asl","🇺🇸 Америк (ASL)"]].forEach(function(t){put(seg,h("button",{"aria-pressed":String(S.tab===t[0]),onclick:function(){S.tab=t[0];env.render();}},t[1]));});
      put(root,seg);
    }
    if(S.tab==="asl")viewAsl(root);else viewMsl(root);
    return root;
  }
  window.Sign={view:view,words:WORDS,translit:translit};
})();
