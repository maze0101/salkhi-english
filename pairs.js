/* Салхи: 👂 ойролцоо дуудлага (minimal pairs) — монголчуудад ялгахад хэцүү хос/гурвал үгсийг сонсоод аль нь болохыг таана.
   Бүлэг бүр: [ [бичлэг, уншуулах бичвэр (TTS), монгол утга], ... ] + ялгааны тайлбар. 10 асуулт, зөв хариулт бүр +1 XP.
   Алдсан бүлгүүд sget "pairsErr" = {"<хэл>:<эхний үг>": тоо}-д хадгалагдаж дараагийн тоглолтод олон гарна. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var P={
    en:[
      [[["ship","ship","хөлөг онгоц"],["sheep","sheep","хонь"]],"i — богино, сул «и»; ee — урт, чанга «ий»."],
      [[["live","live","амьдрах"],["leave","leave","явах, орхих"]],"i — богино «и»; ea — урт «ий»."],
      [[["full","full","дүүрэн"],["fool","fool","тэнэг"]],"u — богино «у»; oo — урт «уу»."],
      [[["light","light","гэрэл"],["right","right","зөв, баруун"]],"l — хэлний үзүүр шүдний ард хүрнэ; r — хэл хаана ч хүрэхгүй, уруул бага зэрэг дугуйрна."],
      [[["rice","rice","будаа"],["lice","lice","бөөс"]],"r — хэл хүрэхгүй; l — хэлний үзүүр дээд шүдний ард."],
      [[["fan","fan","сэнс"],["van","van","фургон машин"]],"f — дуугүй (зөвхөн агаар); v — хоолой чичирнэ."],
      [[["berry","berry","жимс"],["very","very","маш"]],"b — хоёр уруул нийлнэ; v — дээд шүд доод уруулд хүрнэ."],
      [[["think","think","бодох"],["sink","sink","угаалтуур"]],"th — хэлний үзүүр шүдний завсраар; s — хэл шүдний ард."],
      [[["three","three","гурав"],["tree","tree","мод"]],"th — хэл шүдний завсраар үлээнэ; t — хэл буйланд хүрээд тасарна."],
      [[["cap","cap","малгай"],["cup","cup","аяга"]],"a [æ] — ам их ангайж «э» ба «а»-ийн дунд; u [ʌ] — богино «а»."],
      [[["bat","bat","сарьсан багваахай"],["bet","bet","бооцоо"]],"a [æ] — ам их ангайна; e — «э»."],
      [[["walk","walk","алхах"],["work","work","ажиллах"]],"walk — «уок» (l дуудагдахгүй); work — «вөрк», r-тэй."]
    ],
    de:[
      [[["Bett","Bett","ор"],["Beet","Beet","цэцгийн мөр"]],"e (Bett) — богино «э»; ee (Beet) — урт, нарийн «ээ»."],
      [[["offen","offen","нээлттэй"],["Ofen","Ofen","зуух"]],"Давхар гийгүүлэгчийн өмнөх эгшиг богино (offen); ганц бол урт (Ofen)."],
      [[["Stadt","Stadt","хот"],["Staat","Staat","улс"]],"a — богино (Stadt); aa — урт (Staat)."],
      [[["schon","schon","аль хэдийн"],["schön","schön","сайхан"]],"o — «о»; ö — уруулаа «о» болгоод «э» гэж хэлнэ (монгол «ө»-тэй ойр)."],
      [[["Mutter","Mutter","ээж"],["Mütter","Mütter","ээжүүд"]],"u — «у»; ü — уруулаа «у» болгоод «и» гэж хэлнэ (монгол «ү»-тэй ойр)."],
      [[["Kuchen","Kuchen","бялуу"],["Küchen","Küchen","гал тогоонууд"]],"u — «у»; ü — «ү»-тэй ойр, урт."],
      [[["leben","leben","амьдрах"],["lieben","lieben","хайрлах"]],"e — урт «ээ»; ie — урт «ий»."],
      [[["füllen","füllen","дүүргэх"],["fühlen","fühlen","мэдрэх"]],"ll-ийн өмнө ü богино; h-ийн өмнө ü урт."],
      [[["Hölle","Hölle","там"],["Höhle","Höhle","агуй"]],"ö богино (Hölle); öh урт (Höhle)."],
      [[["Bahn","Bahn","галт тэрэг"],["Bann","Bann","хориг"]],"ah — урт «аа»; nn-ийн өмнө a богино."]
    ],
    ru:[
      [[["был","был","байсан"],["бил","бил","цохисон"]],"ы — хэлээ хойш татаж «ы»; и — урд «и». Өмнөх гийгүүлэгч и-гийн өмнө зөөлөрнө."],
      [[["быть","быть","байх"],["бить","бить","цохих"]],"ы ба и-гийн ялгаа: ы-д хэл хойшоо, и-д урагшаа."],
      [[["мат","мат","мат (шатар)"],["мать","мать","ээж"]],"т — хатуу; ть — зөөлөн, хэлний дунд хэсэг тагнайд ойртоно."],
      [[["угол","угол","булан"],["уголь","уголь","нүүрс"]],"л — хатуу, бүдүүн; ль — зөөлөн, нарийн."],
      [[["брат","брат","ах, дүү"],["брать","брать","авах"]],"Төгсгөлийн т хатуу / ть зөөлөн."],
      [[["кров","кров","орон байр"],["кровь","кровь","цус"]],"в — хатуу; вь — зөөлөн."],
      [[["ел","ел","идсэн"],["ель","ель","гацуур"]],"л хатуу / ль зөөлөн."],
      [[["вес","вес","жин"],["весь","весь","бүх"]],"с хатуу / сь зөөлөн («сь» нь нарийн исгэрнэ)."],
      [[["лук","лук","сонгино"],["люк","люк","нүх, люк"]],"у — «у»; ю — л-ийг зөөлрүүлж «ю»."],
      [[["нос","нос","хамар"],["нёс","нёс","зөөсөн"]],"о — «о»; ё — н-ийг зөөлрүүлж «ё»."]
    ],
    ko:[
      [[["불","불","гал"],["풀","풀","өвс"],["뿔","뿔","эвэр"]],"ㅂ — сул; ㅍ — агаар их гаргана (амьсгалтай); ㅃ — чанга, амьсгалгүй, хоолой чангална."],
      [[["달","달","сар"],["탈","탈","баг, маск"],["딸","딸","охин"]],"ㄷ — сул; ㅌ — амьсгалтай; ㄸ — чанга, амьсгалгүй."],
      [[["굴","굴","хясаа"],["꿀","꿀","зөгийн бал"]],"ㄱ — сул; ㄲ — чанга, амьсгалгүй."],
      [[["방","방","өрөө"],["빵","빵","талх"]],"ㅂ — сул; ㅃ — чанга."],
      [[["공","공","бөмбөг"],["콩","콩","шош"]],"ㄱ — сул; ㅋ — агаар их гаргана."],
      [[["자다","자다","унтах"],["차다","차다","өшиглөх; хүйтэн"],["짜다","짜다","давслаг"]],"ㅈ — сул; ㅊ — амьсгалтай; ㅉ — чанга."],
      [[["거리","거리","гудамж"],["고리","고리","цагираг"]],"ㅓ — ам ангайсан «о» (уруул дугуйрахгүй); ㅗ — уруул дугуйрсан «о»."],
      [[["사다","사다","худалдаж авах"],["싸다","싸다","хямд"]],"ㅅ — сул; ㅆ — чанга, исгэрсэн."]
    ],
    ja:[
      [[["おばさん","おばさん","авга эгч"],["おばあさん","おばあさん","эмээ"]],"ば — богино; ばあ — урт эгшиг (2 хэмнэл)."],
      [[["おじさん","おじさん","авга ах"],["おじいさん","おじいさん","өвөө"]],"じ — богино; じい — урт."],
      [[["きて","来て","ирээрэй"],["きって","切手","марк"]],"っ — жижиг цу: нэг хэмнэл зогсоно (давхар гийгүүлэгч)."],
      [[["びょういん","病院","эмнэлэг"],["びよういん","美容院","үсчин"]],"びょ — нэг хэмнэл; びよ — хоёр хэмнэл."],
      [[["ここ","ここ","энд"],["こうこう","高校","ахлах сургууль"]],"こう — урт «оо»."],
      [[["しゅじん","主人","нөхөр"],["しゅうじん","囚人","хоригдол"]],"しゅ — богино; しゅう — урт."],
      [[["いえ","家","байшин"],["いいえ","いいえ","үгүй"]],"い — богино; いい — урт."],
      [[["さか","坂","налуу зам"],["さっか","作家","зохиолч"]],"っ — зогсолт: さ・っ・か (3 хэмнэл)."],
      [[["ゆき","雪","цас"],["ゆうき","勇気","зориг"]],"ゆ — богино; ゆう — урт."],
      [[["かた","肩","мөр"],["かった","買った","худалдаж авсан"]],"っ — нэг хэмнэл зогсоно."]
    ],
    zh:[
      [[["mā 妈","妈","ээж"],["má 麻","麻","олсны ургамал"],["mǎ 马","马","морь"],["mà 骂","骂","загнах"]],"1-р өнгө — өндөр тэгш; 2 — дээшилнэ; 3 — доошоо ороод дээшилнэ; 4 — огцом доошилно."],
      [[["mǎi 买","买","худалдаж авах"],["mài 卖","卖","зарах"]],"3-р өнгө (доош-дээш) ба 4-р өнгө (огцом доош)."],
      [[["tāng 汤","汤","шөл"],["táng 糖","糖","чихэр"]],"1-р өнгө тэгш өндөр; 2-р өнгө асуух мэт дээшилнэ."],
      [[["sì 四","四","дөрөв"],["shí 十","十","арав"]],"s — исгэрнэ; sh — хэлээ дээш нугална. Мөн 4 ба 2-р өнгө."],
      [[["shuìjiào 睡觉","睡觉","унтах"],["shuǐjiǎo 水饺","水饺","банш"]],"4+4 өнгө (огцом) ба 3+3 өнгө (доош-дээш)."],
      [[["wèn 问","问","асуух"],["wěn 吻","吻","үнсэх"]],"4-р өнгө огцом доош; 3-р өнгө доош ороод дээш."],
      [[["dà 大","大","том"],["dǎ 打","打","цохих"]],"4-р ба 3-р өнгө."],
      [[["yǒu 有","有","байх"],["yòu 又","又","дахин"]],"3-р ба 4-р өнгө."]
    ]
  };
  var ROUNDS=10,env=null,h=null,G=null;
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function errs(){var e=env.sget("pairsErr",{});return e&&typeof e==="object"?e:{};}
  function gkey(g){return env.lang()+":"+g[0][0][0];}
  /* алдсан бүлэг илүү олон гарна (жин = 1 + алдааны тоо, 4 хүртэл) */
  function pickRounds(){
    var L=P[env.lang()]||[],e=errs(),bag=[];
    L.forEach(function(g){var n=1+Math.min(3,e[gkey(g)]||0);for(var i=0;i<n;i++)bag.push(g);});
    var out=[],last=null;
    for(var k=0;k<ROUNDS&&bag.length;k++){
      var c=shuffle(bag).filter(function(g){return g!==last;})[0]||bag[0];
      out.push({g:c,ans:Math.floor(Math.random()*c[0].length),pick:null});last=c;
    }
    return out;
  }
  function play(r){env.speak(r.g[0][r.ans][1]);}
  function choose(r,i){
    if(r.pick!=null)return;r.pick=i;
    var e=errs(),k=gkey(r.g);
    if(i===r.ans){G.ok++;env.addXP(1);if(e[k]){e[k]=Math.max(0,e[k]-1);if(!e[k])delete e[k];env.sset("pairsErr",e);}}
    else{e[k]=(e[k]||0)+1;env.sset("pairsErr",e);}
    env.render();
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),L=P[e.lang()];
    put(root,h("button",{class:"back",onclick:function(){env.stop();G=null;e.close();}},"‹ Сорил"));
    put(root,h("h2",null,"👂 Ойролцоо дуудлага"));
    if(!L){put(root,h("div",{class:"note"},"Энэ хэлэнд ойролцоо дуудлагын дасгал одоогоор алга."));return root;}
    if(!G||G.lang!==e.lang()){
      put(root,h("p",{class:"muted"},"Монголчуудад ялгахад хэцүү, дуудлага нь ойролцоо үгсийг сонсоод аль нь болохыг таа. Алдсан хосууд дараа нь илүү олон гарна."));
      var e2=errs(),hard=L.filter(function(g){return e2[gkey(g)];});
      if(hard.length)put(root,h("div",{class:"note"},h("div",{class:"muted small",style:"font-weight:700"},"Танд хэцүү байгаа хосууд"),
        h("div",{style:"margin-top:4px"},hard.map(function(g){return g[0].map(function(x){return x[0];}).join(" / ");}).join(" · "))));
      put(root,h("div",{class:"muted small",style:"margin:8px 0"},L.length+" бүлэг · "+ROUNDS+" асуулт · зөв хариулт бүр +1 XP"));
      put(root,h("button",{class:"btn primary",style:"width:100%",onclick:function(){G={lang:e.lang(),r:pickRounds(),i:0,ok:0};env.render();setTimeout(function(){if(G)play(G.r[0]);},300);}},"▶️ Эхлэх"));
      return root;
    }
    if(G.i>=G.r.length){
      if(!G.fin){G.fin=true;env.logAct("pairs");if(G.ok>=8)env.celebrate();}
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},G.ok>=8?"🏆":G.ok>=5?"👍":"💪"),
        h("div",{style:"font-weight:800;font-size:20px"},G.ok+" / "+G.r.length+" зөв"),h("div",{class:"muted"},"+"+G.ok+" XP")));
      put(root,h("div",{class:"row"},h("button",{class:"btn",onclick:function(){G=null;env.render();}},"Буцах"),
        h("button",{class:"btn primary",onclick:function(){G={lang:e.lang(),r:pickRounds(),i:0,ok:0};env.render();setTimeout(function(){if(G)play(G.r[0]);},300);}},"Дахин")));
      return root;
    }
    var r=G.r[G.i],opts=r.g[0];
    put(root,h("div",{class:"muted small"},(G.i+1)+" / "+G.r.length+" · ✅ "+G.ok));
    put(root,h("div",{style:"text-align:center;margin:14px 0"},
      h("button",{class:"btn primary",style:"font-size:20px;padding:16px 26px","aria-label":"Дахин сонсох",onclick:function(){play(r);}},"🔊 Сонсох"),
      h("div",{class:"muted small",style:"margin-top:6px"},"Аль үгийг хэлэв?")));
    var grid=h("div",{style:"display:grid;grid-template-columns:repeat("+(opts.length>2?2:opts.length)+",1fr);gap:8px"});
    opts.forEach(function(o,i){
      var st=r.pick==null?"":i===r.ans?"border-color:var(--ok);background:color-mix(in srgb,var(--ok) 14%,var(--surface))":i===r.pick?"border-color:var(--danger);background:color-mix(in srgb,var(--danger) 14%,var(--surface))":"opacity:.7";
      put(grid,h("button",{class:"btn",lang:env.lang(),style:"margin:0;padding:14px 8px;display:flex;flex-direction:column;align-items:center;gap:2px;"+st,onclick:function(){if(r.pick==null)choose(r,i);else env.speak(o[1]);}},
        h("b",{style:"font-size:20px"},o[0]),h("span",{class:"muted small"},o[2])));
    });
    put(root,grid);
    if(r.pick!=null){
      put(root,h("div",{class:"fb "+(r.pick===r.ans?"ok":"bad"),style:"margin-top:10px"},(r.pick===r.ans?"✅ Зөв! ":"❌ Энэ нь «"+opts[r.ans][0]+"» байлаа. ")+r.g[1]));
      put(root,h("p",{class:"muted small",style:"margin:6px 0"},"Үг бүр дээр дарж харьцуулж сонсоорой."));
      put(root,h("button",{class:"btn primary",style:"width:100%",onclick:function(){G.i++;env.render();if(G.i<G.r.length)setTimeout(function(){if(G&&G.r[G.i])play(G.r[G.i]);},250);}},G.i+1<G.r.length?"Дараагийнх ›":"Дүн харах"));
    }
    return root;
  }
  window.Pairs={view:view,has:function(l){return !!P[l];},data:P};
})();
