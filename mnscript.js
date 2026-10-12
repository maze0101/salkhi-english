/* Салхи: ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ — уйгаржин монгол бичиг сурах.
   Үсэг (эхний/дунд/сүүлийн хэлбэр), үгс (кирилл ⇄ бичиг), тест, үсэгчлэн хөрвүүлэгч, хуруугаар бичих дасгал.
   Үсгийн хэлбэрийг фонт (Noto Sans Mongolian) өөрөө сонгоно; ZWJ (U+200D)-ээр байрлалыг нь хүчээр үзүүлнэ. */
(function(){
  var FONT="'Noto Sans Mongolian','Mongolian Baiti','Menk Qagan Tig',serif",ZWJ="‍";
  /* [бичиг, кирилл, латин галиг, тайлбар] — сургуулийн «а, э, и, о, у, ө, ү, н, б…» дараалал */
  var VOW=[["ᠠ","а","a","Эр эгшиг"],["ᠡ","э","e","Эм эгшиг"],["ᠢ","и","i","Саармаг эгшиг"],["ᠣ","о","o","Эр эгшиг; «у»-тай ижил хэлбэртэй"],["ᠤ","у","u","Эр эгшиг; «о»-той ижил хэлбэртэй"],["ᠥ","ө","ö","Эм эгшиг; эхний үед «о»-оос сүүлтэй"],["ᠦ","ү","ü","Эм эгшиг; «ө»-тэй ижил хэлбэртэй"]];
  var CON=[["ᠨ","н","n","Эгшгийн өмнө цэгтэй"],["ᠩ","нг","ng","Үгийн эхэнд хэзээ ч ирэхгүй"],["ᠪ","б","b","Монгол үгийн «в» ч ихэвчлэн ᠪ"],["ᠫ","п","p","Харь үгэнд"],["ᠬ","х","q/k","Эр эгшгийн өмнө хоёр цэгтэй"],["ᠭ","г","ɣ/g","Эр эгшгийн өмнө цэггүй"],["ᠮ","м","m",""],["ᠯ","л","l",""],["ᠰ","с","s",""],["ᠱ","ш","š","«с» дээр цэг нэмнэ"],["ᠲ","т","t",""],["ᠳ","д","d","Үгийн эхэнд «т»-тэй адил"],["ᠴ","ч","č","Монгол үгийн «ц» ч мөн ᠴ"],["ᠵ","ж","ǰ","Монгол үгийн «з» ч мөн ᠵ"],["ᠶ","й","y","я, е, ё, ю-ийн эхний хэсэг"],["ᠷ","р","r","Үгийн эхэнд бараг ирэхгүй"],["ᠸ","в","w","Харь үгэнд"],["ᠹ","ф","f","Харь үгэнд"],["ᠺ","к","k","Харь үгэнд"],["ᠼ","ц","c","Харь үгэнд"],["ᠽ","з","z","Харь үгэнд"],["ᠾ","һ","h","Харь үгэнд"]];
  /* [бичиг, кирилл, утга/тайлбар] */
  var WORDS=[
    ["ᠮᠣᠩᠭᠣᠯ","монгол","mongɣol"],["ᠰᠠᠯᠬᠢ","салхи","salki — манай апп!"],["ᠡᠬᠡ","ээж","eke"],["ᠠᠪᠤ","аав","abu"],
    ["ᠡᠮᠡᠭᠡ","эмээ","emege"],["ᠡᠪᠦᠭᠡ","өвөө","ebüge"],["ᠳᠡᠭᠦᠦ","дүү","degüü"],["ᠬᠡᠦᠬᠡᠳ","хүүхэд","keüked"],
    ["ᠬᠦᠮᠦᠨ","хүн","kümün"],["ᠨᠠᠢᠵᠤ","найз","naiǰu"],["ᠭᠡᠷ","гэр","ger"],["ᠬᠣᠲᠠ","хот","qota"],
    ["ᠠᠭᠤᠯᠠ","уул","aɣula"],["ᠤᠰᠤ","ус","usu"],["ᠭᠠᠯ","гал","ɣal"],["ᠨᠠᠷᠠ","нар","nara"],
    ["ᠲᠩᠷᠢ","тэнгэр","tngri"],["ᠮᠣᠳᠣ","мод","modu"],["ᠴᠡᠴᠡᠭ","цэцэг","čečeg"],["ᠮᠣᠷᠢ","морь","mori"],
    ["ᠬᠣᠨᠢ","хонь","qoni"],["ᠦᠬᠡᠷ","үхэр","üker"],["ᠲᠡᠮᠡᠭᠡ","тэмээ","temege"],["ᠨᠣᠬᠠᠢ","нохой","noqai"],
    ["ᠰᠦᠨ","сүү","sün"],["ᠴᠠᠢ","цай","čai"],["ᠮᠢᠬᠠ","мах","miqa"],["ᠨᠣᠮ","ном","nom"],
    ["ᠪᠢᠴᠢᠭ","бичиг","bičig"],["ᠬᠡᠯᠡ","хэл","kele"],["ᠡᠷᠳᠡᠮ","эрдэм","erdem"],["ᠤᠬᠠᠭᠠᠨ","ухаан","uqaɣan"],
    ["ᠰᠤᠷᠭᠠᠭᠤᠯᠢ","сургууль","surɣaɣuli"],["ᠡᠳᠦᠷ","өдөр","edür"],["ᠰᠦᠨᠢ","шөнө","söni"],["ᠵᠢᠯ","жил","ǰil"],
    ["ᠨᠢᠭᠡ","нэг","nige"],["ᠬᠣᠶᠠᠷ","хоёр","qoyar"],["ᠭᠤᠷᠪᠠ","гурав","ɣurba"],["ᠳᠦᠷᠪᠡ","дөрөв","dörbe"],["ᠲᠠᠪᠤ","тав","tabu"],
    ["ᠰᠠᠢᠬᠠᠨ","сайхан","saiqan"],["ᠠᠮᠤᠷ","амар","amur"],["ᠪᠠᠶᠠᠷ","баяр","bayar"],["ᠮᠥᠩᠬᠡ","мөнх","möngke"],
    ["ᠬᠠᠭᠠᠨ","хаан","qaɣan"],["ᠴᠢᠩᠭᠢᠰ","Чингис","čingɣis"],["ᠤᠯᠠᠭᠠᠨᠪᠠᠭᠠᠲᠤᠷ","Улаанбаатар","ulaɣanbaɣatur"],
    ["ᠡᠬᠡ ᠣᠷᠣᠨ","эх орон","eke oron"],["ᠰᠠᠢᠨ ᠪᠠᠢᠨ᠎ᠠ ᠤᠤ","сайн байна уу","sain baina uu"]
  ];
  var LETTERS=VOW.concat(CON);
  /* Кирилл → бичиг, үсэгчлэн (ойролцоо): урт эгшгийг нэг болгоно, «нг»→ᠩᠭ, в/з/ц-г монгол хэлбэрээр */
  var MAP={"а":"ᠠ","э":"ᠡ","и":"ᠢ","ы":"ᠢ","о":"ᠣ","у":"ᠤ","ө":"ᠥ","ү":"ᠦ","й":"ᠢ","ь":"ᠢ","ъ":"","н":"ᠨ","б":"ᠪ","п":"ᠫ","х":"ᠬ","г":"ᠭ","м":"ᠮ","л":"ᠯ","с":"ᠰ","ш":"ᠱ","щ":"ᠱ","т":"ᠲ","д":"ᠳ","ч":"ᠴ","ж":"ᠵ","р":"ᠷ","в":"ᠪ","ф":"ᠹ","к":"ᠺ","ц":"ᠴ","з":"ᠵ","һ":"ᠾ","я":"ᠶᠠ","е":"ᠶᠡ","ё":"ᠶᠣ","ю":"ᠶᠤ"};
  var VS="аэиыоуөү";
  function conv(txt){
    return String(txt).toLowerCase().split(/(\s+)/).map(function(w){
      if(/^\s+$/.test(w))return " ";
      var o="",prev="";
      for(var i=0;i<w.length;i++){
        var c=w[i],nx=w[i+1]||"";
        if(!(c in MAP)){o+=c;prev="";continue;}
        if(VS.indexOf(c)>=0&&c===prev)continue;                 /* аа→а */
        if(c==="и"&&nx==="й"){o+="ᠢ";i++;prev="и";continue;}    /* ий→и */
        if(c==="й"&&VS.indexOf(prev)<0){o+="ᠶ";prev=c;continue;}
        if(c==="ь"&&VS.indexOf(nx)>=0){prev=c;continue;}         /* зөөлний тэмдэг эгшгийн өмнө */
        if(c==="н"&&nx==="г"){o+="ᠩ";prev=c;continue;}
        if(c==="е"&&VS.indexOf(prev)<0&&prev){o+="ᠡ";prev=c;continue;}
        o+=MAP[c];prev=c;
      }
      return o;
    }).join("");
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
  /* о/у, ө/ү ганцаараа ижил харагддаг тул нэг асуултад хамт гаргахгүй */
  var TWIN={"о":"у","у":"о","ө":"ү","ү":"ө"};
  function pick(a,n,not){return shuffle(a.filter(function(x){return x!==not&&x[1]!==TWIN[not[1]];})).slice(0,n);}
  var fontOk=false;
  function loadFont(){
    if(fontOk)return;fontOk=true;
    var l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian&display=swap";document.head.appendChild(l);
  }
  function mn(txt,size,extra){return h("span",{lang:"mn-Mong",style:"font-family:"+FONT+";writing-mode:vertical-lr;text-orientation:sideways;font-size:"+(size||32)+"px;line-height:1.3;display:inline-block;"+(extra||"")},txt);}

  var env=null,h=null,S={tab:"abc",sel:null,q:null,conv:""};
  function tabs(root){
    var T=[["abc","🔤 Үсэг"],["word","📖 Үг"],["quiz","✅ Тест"],["conv","🔄 Хөрвүүлэх"],["draw","✍️ Бичих"]];
    root.append(h("div",{class:"row",style:"flex-wrap:wrap;gap:6px;margin:8px 0 12px"},T.map(function(t){
      return h("button",{class:"btn"+(S.tab===t[0]?" primary":""),onclick:function(){S.tab=t[0];S.sel=null;if(t[0]==="quiz")S.q=null;env.render();}},t[1]);})));
  }
  function forms(ch){return [["Ганцаар",ch],["Эхэнд",ch+ZWJ],["Дунд",ZWJ+ch+ZWJ],["Сүүлд",ZWJ+ch]];}
  function viewAbc(root){
    root.append(h("p",{class:"muted small"},"Монгол бичгийг дээрээс доош, зүүнээс баруун тийш бичнэ. Үсэг бүр үгийн эхэнд, дунд, сүүлд өөр хэлбэртэй. Үсэг дээр дарж хэлбэрүүдийг нь үзээрэй."));
    if(S.sel){
      var L=S.sel;
      root.append(h("div",{class:"note",style:"margin-bottom:12px"},
        h("div",{style:"display:flex;align-items:center;gap:12px"},mn(L[0],56),h("div",null,h("div",{style:"font-size:22px;font-weight:700"},L[1]+" · "+L[2]),L[3]?h("div",{class:"muted small"},L[3]):null)),
        h("div",{style:"display:flex;gap:10px;justify-content:space-around;margin-top:10px;text-align:center"},forms(L[0]).map(function(f){
          return h("div",null,mn(f[1],44,"min-height:64px"),h("div",{class:"muted small"},f[0]));}))));
    }
    [["Эгшиг (7)",VOW],["Гийгүүлэгч",CON]].forEach(function(g){
      root.append(h("h3",{style:"margin:12px 0 6px;font-size:16px"},g[0]));
      root.append(h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px"},g[1].map(function(L){
        return h("button",{class:"opt"+(S.sel===L?" ok":""),style:"display:flex;flex-direction:column;align-items:center;padding:8px 4px;margin:0",onclick:function(){S.sel=L;env.render();window.scrollTo(0,0);}},
          mn(L[0],30,"min-height:40px"),h("b",null,L[1]));})));
    });
  }
  function viewWords(root){
    root.append(h("p",{class:"muted small"},"Монгол бичгийн үг кирилл бичгээс өөрөөр бичигддэг: «ус» → usu, «уул» → aɣula. Дарахад галигийг нь харуулна."));
    root.append(h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px"},WORDS.map(function(w){
      var open=S.sel===w;
      return h("button",{class:"opt"+(open?" ok":""),style:"display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;margin:0",onclick:function(){S.sel=open?null:w;env.render();}},
        mn(w[0],28,"min-height:90px;max-height:200px"),h("b",null,w[1]),open?h("span",{class:"muted small"},w[2]):null);})));
  }
  function newQuiz(){
    var qs=[],ls=shuffle(LETTERS).slice(0,4),ws=shuffle(WORDS).slice(0,6);
    ls.forEach(function(L){qs.push({s:L[0],a:L[1],o:shuffle([L[1]].concat(pick(LETTERS,3,L).map(function(x){return x[1];})))});});
    ws.forEach(function(w,i){
      if(i%2)qs.push({c:w[1],a:w[0],o:shuffle([w[0]].concat(pick(WORDS,3,w).map(function(x){return x[0];}))),mn:1});
      else qs.push({s:w[0],a:w[1],o:shuffle([w[1]].concat(pick(WORDS,3,w).map(function(x){return x[1];})))});
    });
    return {qs:shuffle(qs),i:0,ok:0,p:null};
  }
  function viewQuiz(root){
    if(!S.q)S.q=newQuiz();
    var Q=S.q;
    if(Q.i>=Q.qs.length){
      var best=Math.max((env.sget("mnscript",{})||{}).best||0,Q.ok);
      if(!Q.saved){Q.saved=1;env.sset("mnscript",{best:best});env.addXP(Q.ok*2);if(Q.ok===Q.qs.length)env.celebrate();}
      root.append(h("h2",null,Q.ok+" / "+Q.qs.length),h("p",{class:"muted"},"+"+(Q.ok*2)+" XP · Хамгийн сайн: "+best),
        h("button",{class:"btn primary",onclick:function(){S.q=null;env.render();}},"Дахин"));
      return;
    }
    var q=Q.qs[Q.i];
    root.append(h("p",{class:"muted small"},(Q.i+1)+" / "+Q.qs.length+(q.mn?" · Монгол бичгээр нь сонго":" · Кириллээр юу вэ?")));
    root.append(h("div",{style:"text-align:center;margin:10px 0"},q.mn?h("div",{style:"font-size:26px;font-weight:700"},q.c):mn(q.s,48,"min-height:80px")));
    root.append(h("div",{style:q.mn?"display:grid;grid-template-columns:repeat(4,1fr);gap:6px":""},q.o.map(function(o){
      var cls="opt";if(Q.p!=null){if(o===q.a)cls+=" ok";else if(o===Q.p)cls+=" bad";}
      return h("button",{class:cls,disabled:Q.p!=null,style:q.mn?"display:flex;justify-content:center;margin:0":"",onclick:function(){Q.p=o;if(o===q.a)Q.ok++;env.render();}},q.mn?mn(o,26,"min-height:90px"):o);})));
    if(Q.p!=null)root.append(h("div",{class:"fb "+(Q.p===q.a?"ok":"bad")},Q.p===q.a?"Зөв!":(q.mn?"Зөв хариултыг ногооноор харууллаа":"Зөв хариулт: "+q.a)),
      h("button",{class:"btn primary",style:"margin-top:8px",onclick:function(){Q.i++;Q.p=null;env.render();}},"Дараах ›"));
  }
  function viewConv(root){
    root.append(h("p",{class:"muted small"},"Нэр, үгээ кириллээр бичээд монгол бичгээр хар. ⚠️ Үсэгчлэн хөрвүүлдэг тул жинхэнэ зөв бичгээс зөрөх нь бий (жишээ нь «ус» → usu). Нэрэнд голдуу тохирно."));
    var out=h("div",{style:"min-height:140px;display:flex;justify-content:center;padding:12px;border:1px solid var(--line,#ddd);border-radius:12px;margin-top:8px;overflow-x:auto"},mn(conv(S.conv),40));
    var inp=h("input",{type:"text",value:S.conv,placeholder:"Жишээ: Тэмүүлэн",style:"width:100%;font-size:18px;padding:10px;box-sizing:border-box",oninput:function(){S.conv=inp.value;out.innerHTML="";out.append(mn(conv(S.conv),40));}});
    root.append(inp,out);
    root.append(h("button",{class:"btn",style:"margin-top:8px",onclick:function(){var t=conv(S.conv);if(navigator.clipboard&&t)navigator.clipboard.writeText(t);}},"📋 Хуулах"));
  }
  function viewDraw(root){
    if(!S.sel)S.sel=LETTERS[0];
    root.append(h("p",{class:"muted small"},"Бүдэг үсгийг хуруугаараа дагаж зур. Монгол бичигт эхлээд «нуруу» (босоо зураас)-ыг дээрээс доош татна."));
    root.append(h("div",{style:"display:flex;gap:4px;overflow-x:auto;padding-bottom:6px"},LETTERS.map(function(L){
      return h("button",{class:"btn"+(S.sel===L?" primary":""),style:"flex:none;padding:4px 8px",onclick:function(){S.sel=L;env.render();}},L[1]);})));
    var W=260,H=300,cv=h("canvas",{width:W*2,height:H*2,style:"width:"+W+"px;height:"+H+"px;touch-action:none;border:1px solid var(--line,#ddd);border-radius:12px;background:#fff;display:block;margin:8px auto"});
    var x=cv.getContext("2d");
    function bg(){
      x.clearRect(0,0,W*2,H*2);x.save();x.fillStyle="rgba(37,99,235,.15)";x.font="360px "+FONT;x.textAlign="center";x.textBaseline="middle";
      x.translate(W,H);x.rotate(Math.PI/2);x.fillText(S.sel[0],0,0);x.restore();
      x.strokeStyle="rgba(0,0,0,.12)";x.setLineDash([8,8]);x.beginPath();x.moveTo(W,0);x.lineTo(W,H*2);x.stroke();x.setLineDash([]);
    }
    bg();if(document.fonts&&document.fonts.load)document.fonts.load("360px 'Noto Sans Mongolian'",S.sel[0]).then(bg,function(){});
    var down=false;
    function pt(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)*2,(e.clientY-r.top)*2];}
    cv.addEventListener("pointerdown",function(e){down=true;cv.setPointerCapture(e.pointerId);var p=pt(e);x.strokeStyle="#111";x.lineWidth=18;x.lineCap="round";x.lineJoin="round";x.beginPath();x.moveTo(p[0],p[1]);});
    cv.addEventListener("pointermove",function(e){if(!down)return;var p=pt(e);x.lineTo(p[0],p[1]);x.stroke();});
    cv.addEventListener("pointerup",function(){down=false;});
    root.append(h("div",{style:"text-align:center"},h("b",{style:"font-size:20px"},S.sel[1]+" · "+S.sel[2])),cv,
      h("div",{class:"row",style:"justify-content:center"},h("button",{class:"btn",onclick:bg},"🧽 Арилгах")));
  }
  window.MnScript={
    view:function(e){
      env=e;h=e.h;loadFont();var root=h("div");
      root.append(h("button",{class:"back",onclick:function(){S.sel=null;env.close();}},"‹ Дүрэм"));
      root.append(h("h2",{style:"display:flex;align-items:center;gap:10px"},mn("ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ",22,"max-height:120px"),"Монгол бичиг"));
      tabs(root);
      ({abc:viewAbc,word:viewWords,quiz:viewQuiz,conv:viewConv,draw:viewDraw})[S.tab](root);
      return root;
    }
  };
})();
