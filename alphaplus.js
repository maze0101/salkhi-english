/* Салхи: Үсэг табын нэмэлт дасгалууд (✨ Дасгал):
   📊 эзэмшилт (үсэг бүрийн тестийн нарийвчлал, sget "amast:<хэл>" {үсэг:[зөв,нийт]}), 🪤 хуурамч найз үсгүүд, 🔤 үсэг → үг,
   ✒️ гар бичмэл (ru/de/en, Google Fonts), ⚡ хурдан таних (60 с, sget "aspd" {хэл:дээд}), 🧱 үе бүтээгч (ko/ja/zh),
   🎵 цагаан толгойн дуу, ⌨️ гарын байрлал. Үсгийн өгөгдлийг index.html-ийн ALPHA-аас env.alpha()-гаар авна.
   Хуурамч найз, гар бичмэлийн тайлбарыг Claude бичсэн. */
(function(){
  var env=null,h=null,V={tool:null};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function L(){return env.lang();}
  function latin(){return ["en","ru","de","ug"].indexOf(L())>=0;}
  function kata2hira(s){return String(s).replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60);});}
  /* тестэд орох үсгүүд: [үсэг, унших, тайлбар, жишээ үг] — аяны хэсгийг алгасна */
  function items(){var out=[];(env.alpha()||[]).forEach(function(sec,si){if(/声调/.test(sec[0]))return;sec[1].forEach(function(it){out.push({it:it,s:si});});});return out;}
  function ans(it){return latin()?it[3]:it[2];}

  /* ---------- 📊 эзэмшилт ---------- */
  function mast(){return env.sget("amast:"+L(),{})||{};}
  function record(g,ok){var m=mast(),r=m[g]||[0,0];r[1]++;if(ok)r[0]++;m[g]=r;env.sset("amast:"+L(),m);}
  function level(r){if(!r||!r[1])return 0;var p=r[0]/r[1];return r[1]>=3&&p>=.85?3:p>=.6?2:1;}
  var LCOL=["var(--line)","var(--danger)","var(--gold)","var(--ok)"];
  function viewMastery(root){
    var m=mast(),all=items(),cnt=[0,0,0,0];
    all.forEach(function(x){cnt[level(m[x.it[0]])]++;});
    put(root,h("p",{class:"muted"},"Тест, хурдан таних тоглоомын дүнгээр үсэг бүрийг будна. Ногоон = эзэмшсэн (3+ удаа, 85%+), шар = дунд, улаан = сул, саарал = хараахан үзээгүй."));
    put(root,h("div",{class:"row",style:"gap:6px;flex-wrap:wrap;margin:0 0 8px"},[["🟢",cnt[3]],["🟡",cnt[2]],["🔴",cnt[1]],["⚪",cnt[0]]].map(function(x){return h("span",{class:"lvtag"},x[0]+" "+x[1]);})));
    var secs=env.alpha()||[];
    secs.forEach(function(sec){
      if(/声调/.test(sec[0]))return;
      put(root,h("h3",{style:"margin:12px 0 4px;font-size:15px"},sec[0]));
      var g=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:6px"});
      sec[1].forEach(function(it){
        var r=m[it[0]],lv=level(r);
        g.append(h("button",{type:"button",title:r?r[0]+"/"+r[1]+" зөв":"үзээгүй","aria-label":it[0]+" — "+(r?r[0]+"/"+r[1]+" зөв":"үзээгүй"),
          style:"min-height:48px;border-radius:10px;border:2px solid "+LCOL[lv]+";background:color-mix(in srgb,"+LCOL[lv]+" "+(lv?22:0)+"%,var(--surface));color:var(--ink);font-weight:800;font-size:18px;cursor:pointer",
          onclick:function(){env.speak(it[1]);env.toast(it[0]+" · "+(r?r[0]+" / "+r[1]+" зөв":"хараахан тест хийгээгүй"));}},it[0]));
      });
      put(root,g);
    });
    var weak=all.filter(function(x){var lv=level(m[x.it[0]]);return lv===1||lv===2;}).map(function(x){return x.it[0];});
    put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:14px",disabled:!weak.length,onclick:function(){env.drill(weak);}},weak.length?"🔁 Сул үсгүүдээ давтах ("+weak.length+")":"Сул үсэг алга 🎉"));
  }

  /* ---------- 🪤 хуурамч найз үсгүүд: [үсэг, «монгол хүн ингэж уншчихдаг», жинхэнэ дуудлага, жишээ үг, утга] ---------- */
  var FF={
    en:[["H","н","х (hat — хэт)","hat","малгай"],["P","р","п (pen — пэн)","pen","үзэг"],["C","с","к эсвэл с (cat — кэт, city — сити)","cat","муур"],["B","в","б (bus — бас)","bus","автобус"],["X","х","кс (box — бокс)","box","хайрцаг"],["Y","у","й эсвэл ай (yes — йес, my — май)","yes","тийм"],["E","е","э эсвэл и (bed — бэд, he — хи)","bed","ор"],["U","у","а эсвэл ю (bus — бас, use — юз)","use","хэрэглэх"],["W","ш / в","уа маягийн ув (water — уотэр)","water","ус"],["J","ж","дж (job — джоб)","job","ажил"]],
    de:[["W","ш / в","в (Wasser — вассэр)","Wasser","ус"],["V","в","ихэвчлэн ф (Vater — фатэр)","Vater","аав"],["Z","з","ц (Zeit — цайт)","Zeit","цаг хугацаа"],["S","с","эгшгийн өмнө з (Sonne — зоннэ)","Sonne","нар"],["J","ж","й (Jahr — яр)","Jahr","жил"],["ß","б","сс (Straße — штрассэ)","Straße","гудамж"],["ei","эи","ай (mein — майн)","mein","миний"],["ie","иэ","урт ии (Liebe — лийбэ)","Liebe","хайр"],["eu","эу","ой (neu — ной)","neu","шинэ"],["sch","с-ч","ш (Schule — шүүлэ)","Schule","сургууль"],["st / sp","ст / сп","үгийн эхэнд шт / шп (Stadt — штадт)","Stadt","хот"],["ch","ч","х эсвэл хь (Buch — бух, ich — ихь)","Buch","ном"]],
    ru:[["О","о","өргөлтгүй үед а (молоко — малако)","молоко","сүү"],["Е","е (йө)","йэ / э (небо — нэба)","небо","тэнгэр"],["Я","я","йа (яблоко — яблака)","яблоко","алим"],["Ы","ы","монголд байхгүй — хэлээ хойш татсан и","мы","бид"],["Ь","ь","өмнөх гийгүүлэгчийг зөөлрүүлнэ (мать)","мать","ээж"],["Щ","ш","зөөлөн урт щ (щи)","щи","байцаатай шөл"],["Г","г","урд г; -ого/-его төгсгөлд в (его — ево)","его","түүний"],["В","в","в, хоёр уруул биш дээд шүд + доод уруул (вода)","вода","ус"],["Ч","ч","үргэлж зөөлөн чь (час)","час","цаг"],["Ө Ү","ө ү","орос хэлэнд байхгүй үсэг — бичихгүй","","" ]],
    ug:[["Ә","э","э-ээс илүү нээлттэй ә (Әтә)","Әтә","маргааш"],["Қ","к","хоолойн гүн к (Қуш)","Қуш","шувуу"],["Ғ","г","хоолойн гүн г, монгол «г»-ээс зөөлөн (Ғаз)","Ғаз","галуу"],["Ң","н","нг (Миң)","Миң","мянга"],["Һ","х","зөөлөн h (Һава)","Һава","агаар"],["Җ","ж","дж (Җүмә)","Җүмә","баасан гараг"],["Ө Ү","ө ү","монголтой ойролцоо, гэхдээ богино","Үч","гурав"]],
    ja:[["シ / ツ","ижил","シ shi (зураас хэвтээ давхарга), ツ tsu (дээрээс доош)","シ","ши"],["ソ / ン","ижил","ソ so (дээрээс доош), ン n (доороос дээш)","ソ","со"],["ク / タ","ижил","ク ku, タ ta (дотроо зураастай)","タ","та"],["ぬ / め","ижил","ぬ nu (гогцоотой), め me","ぬ","ну"],["わ / れ / ね","ижил","わ wa, れ re, ね ne (гогцоотой)","ね","нэ"],["る / ろ","ижил","る ru (гогцоотой), ろ ro","る","рү"],["さ / ち","ижил","さ sa, ち chi (эсрэг тал руу)","ち","чи"],["は / ほ","ижил","は ha, ほ ho (дээд талдаа нэмэлт зураастай)","ほ","хо"],["は (үйл үг)","ха","үг холбох は-г wa гэж уншина (わたしは)","わたしは","би бол"],["ん","н","дараагийн авиагаас хамаарч м/н/нг (さんぽ — сампо)","さんぽ","алхах"]],
    ko:[["ㅓ / ㅗ","о / о","ㅓ eo (амаа ангайж «о»), ㅗ o (уруулаа дугуйлж)","어","эо"],["ㅐ / ㅔ","а / э","одоогийн яриан дээр бараг ижил «э»","애","э"],["ㄹ","р","эгшгийн хооронд r, төгсгөлд l (사람, 물)","물","ус"],["ㅂ / ㅍ / ㅃ","б","ㅂ сул b/p, ㅍ амьсгалтай p, ㅃ чангалсан pp","빵","талх"],["ㄱ / ㅋ / ㄲ","г","ㄱ сул g/k, ㅋ амьсгалтай k, ㄲ чангалсан kk","꿀","зөгийн бал"],["ㅅ + ㅣ","си","ㅣ-ийн өмнө ш (시 — ши)","시","цаг"],["ㅡ","ы","уруулаа дугуйлахгүй «ы»","으","ы"],["ㅢ","үи","үгийн дунд и, эзэмшлийн утгаар э (의사 — ыйса)","의사","эмч"]],
    zh:[["x","кс","сь — хэлний урд хэсэг (xiè — сье)","谢","баярлалаа"],["q","к","чь, амьсгалтай (qī — чи)","七","долоо"],["j","ж","жь — зөөлөн (jī — жи)","鸡","тахиа"],["zh","з-х","ж-ийг хэлээ хойш эргүүлж (zhī)","知","мэдэх"],["c","с / к","ц (cài — цай)","菜","хоол / ногоо"],["z","з","дз (zài — дзай)","在","…д байх"],["r","р","ж ба р-ын дунд (rén — жэн)","人","хүн"],["e","е","ə — «ы/ээ»-ийн дунд (hē)","喝","уух"],["ü (ju, qu, xu, yu)","у","j/q/x/y-ийн дараа u гэж бичсэн ч ü (ю-тэй ойр)","去","явах"],["ui / iu","уи / иу","ui = уэй, iu = иоу (guì, liù)","六","зургаа"],["ian","иан","иэн (tiān — тиэн)","天","тэнгэр / өдөр"]]
  };
  var ffq=null;
  function viewFF(root){
    var list=FF[L()]||[];
    put(root,h("p",{class:"muted"},"Монгол хүний нүдэнд танил харагдах ч өөрөөр уншдаг үсэг, авиа. «Монголоор» = бидний уншчихдаг буруу хувилбар."));
    list.forEach(function(x){
      put(root,h("div",{class:"note",style:"margin-top:8px;display:flex;gap:10px;align-items:center"},
        h("div",{lang:L(),style:"font-size:26px;font-weight:800;min-width:64px;text-align:center"},x[0]),
        h("div",{style:"flex:1"},h("div",{class:"small"},"❌ Монголоор: «"+x[1]+"»"),h("div",{style:"font-weight:700"},"✅ "+x[2]),x[3]?h("div",{class:"muted small",lang:L()},x[3]+(x[4]?" — "+x[4]:"")):null),
        x[3]?h("button",{class:"btn ghost",style:"flex:none","aria-label":"Сонсох",onclick:function(){env.speak(x[3]);}},"🔊"):null));
    });
    /* мини тест */
    if(list.length>=3){
      if(!ffq||ffq.lang!==L()){var q=list[Math.floor(Math.random()*list.length)];ffq={lang:L(),q:q,opts:shuffle([q].concat(shuffle(list.filter(function(x){return x!==q;})).slice(0,2))),pick:null};}
      put(root,h("h3",{style:"margin:16px 0 6px"},"🎯 Шалгаад үз"),h("p",{style:"font-weight:700"},"«"+ffq.q[0]+"» зөв дуудлага аль нь вэ?"));
      ffq.opts.forEach(function(o){
        var cls="opt"+(ffq.pick?(o===ffq.q?" ok":o===ffq.pick?" bad":""):"");
        put(root,h("button",{class:cls,disabled:!!ffq.pick,onclick:function(){ffq.pick=o;if(o===ffq.q){env.addXP(2);}env.render();}},o[2]));
      });
      if(ffq.pick)put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:8px",onclick:function(){ffq=null;env.render();}},"Дараагийн ›"));
    }
  }

  /* ---------- 🔤 үсэг → үг ---------- */
  var EMO={"алим":"🍎","муур":"🐱","нохой":"🐶","загас":"🐟","өндөг":"🥚","малгай":"🧢","мөс":"🧊","түлхүүр":"🔑","арслан":"🦁","сар":"🌙","хамар":"👃","жүрж":"🍊","үзэг":"🖊️","хатан":"👸","бороо":"🌧️","нар":"☀️","мод":"🌳","шүхэр":"☂️","ус":"💧","ном":"📕","байшин":"🏠","гэр":"🏠","морь":"🐎","сүү":"🥛","талх":"🍞","машин":"🚗","цэцэг":"🌸","шувуу":"🐦","гадил":"🍌","тарвас":"🍉","бөмбөг":"⚽","охин":"👧","хүү":"👦","ээж":"👩","аав":"👨","эмээ":"👵","өвөө":"👴","нүд":"👁️","чих":"👂","ам":"👄","гар":"✋","хөл":"🦶","цай":"🍵","кофе":"☕","будаа":"🍚","мах":"🥩","сургууль":"🏫","эмнэлэг":"🏥","утас":"📱","компьютер":"💻","цаг":"⏰","мөнгө":"💰","галт тэрэг":"🚆","онгоц":"✈️","автобус":"🚌","дугуй":"🚲","туулай":"🐰","үнэг":"🦊","баавгай":"🐻","хонь":"🐑","үхэр":"🐄","гахай":"🐷","тахиа":"🐔","зараа":"🦔","цох":"🪲","уул":"⛰️","далай":"🌊","цас":"❄️","од":"⭐","зүрх":"❤️","гутал":"👟","цамц":"👕","бялуу":"🍰","чихэр":"🍬","зайрмаг":"🍦","жимс":"🍓","ногоо":"🥕","лууван":"🥕","төмс":"🥔","улаан лооль":"🍅","сармис":"🧄","сонгино":"🧅","шар айраг":"🍺","дарс":"🍷","ширээ":"🪑","сандал":"🪑","ор":"🛏️","хаалга":"🚪","цонх":"🪟","чийдэн":"💡","илжиг":"🫏","зөгий":"🐝","эмч":"🧑‍⚕️","багш":"🧑‍🏫"};
  function emo(w){var k=String(w[2]||"").toLowerCase().split(/[,;(]/)[0].trim();return EMO[k]||"";}
  var KO_I="ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ",KO_V="ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
  function koParts(ch){var c=ch.charCodeAt(0)-0xAC00;if(c<0||c>11171)return null;return {i:Math.floor(c/588),v:Math.floor(c%588/28),f:c%28};}
  function strip(s){return String(s||"").replace(/\s*\([^)]*\)/g,"").replace(/^(der|die|das|to|the|a|an)\s+/i,"").trim();}
  function pyPlain(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/ü/g,"v").trim();}
  function startsWith(w,it,sec){
    var l=L(),g=it[0];
    if(l==="ja"){var r=/^[぀-ヿー]+$/.test(w[1])?w[1]:(w[7]||"");if(!r)return false;var kat=/[ァ-ヶ]/.test(g);return kat?r.indexOf(g)===0:kata2hira(r).indexOf(g)===0&&!/^[ァ-ヶ]/.test(w[1]);}
    if(l==="ko"){var p=koParts(String(w[1]).charAt(0));if(!p)return false;var ii=KO_I.indexOf(g);if(ii>=0)return p.i===ii;var vi=KO_V.indexOf(g);return vi>=0&&p.i===11&&p.v===vi;}
    if(l==="zh"){var py=pyPlain(w[7]);if(!py||!/^[a-z]+$/.test(g))return false;if(py.indexOf(g)!==0)return false;return !(/^[zcs]$/.test(g)&&py.charAt(1)==="h");}
    var first=g.charAt(0).toLowerCase(),s=strip(w[1]).toLowerCase();
    if(l==="ru"||l==="ug")s=s.replace(/^ё/,"ё");
    return s.indexOf(first)===0;
  }
  var lw={cur:null};
  function viewLetterWords(root){
    var secs=env.alpha()||[],words=env.words();
    put(root,h("p",{class:"muted"},"Үсэг дээр дарвал тухайн үсгээр эхэлсэн үгс гарна."+(env.kid()?" 🐻 Зурагтай үгсийг олоорой!":"")));
    secs.forEach(function(sec){
      if(/声调|韵母|Нийлмэл|Холбоо/.test(sec[0]))return;
      put(root,h("h3",{style:"margin:12px 0 4px;font-size:15px"},sec[0]));
      var g=h("div",{class:"ag"});
      sec[1].forEach(function(it){g.append(h("button",{"aria-pressed":String(lw.cur===it[0]),onclick:function(){lw.cur=it[0];lw.it=it;env.speak(it[1]);env.render();setTimeout(function(){var x=document.getElementById("lw-box");if(x&&x.scrollIntoView)x.scrollIntoView({behavior:"smooth",block:"center"});},0);}},it[0]));});
      put(root,g);
      if(lw.it&&sec[1].indexOf(lw.it)>=0){
        var hits=words.filter(function(w){return startsWith(w,lw.it,sec);});
        /* хүүхдэд зурагтай үгсийг эхэнд */
        hits.sort(function(a,b){return (emo(b)?1:0)-(emo(a)?1:0)||String(a[1]).length-String(b[1]).length;});
        var box=h("div",{class:"note",id:"lw-box",style:"margin-top:8px"},h("b",{lang:L(),style:"font-size:22px"},lw.it[0]),h("span",{class:"muted small"}," · "+hits.length+" үг"));
        if(!hits.length)put(box,h("p",{class:"muted small"},"Энэ үсгээр эхэлдэг үг аппад алга — ихэвчлэн үгийн дунд, төгсгөлд ордог."));
        hits.slice(0,8).forEach(function(w){
          put(box,h("div",{class:"srow"},h("span",{style:"font-size:22px;width:30px"},emo(w)),
            h("span",{style:"flex:1"},h("b",{lang:L()},w[1]),w[7]&&w[7]!==w[1]?h("span",{class:"muted small"}," "+w[7]):null,h("div",{class:"muted small"},w[2])),
            h("button",{class:"btn ghost",style:"padding:4px 10px","aria-label":"Сонсох",onclick:function(){env.speak(w[1]);}},"🔊")));
        });
        put(root,box);
      }
    });
  }

  /* ---------- ✒️ гар бичмэл ---------- */
  var CUR={ru:{font:"Marck Script",q:"Marck+Script",notes:["т бичмэлээр m шиг харагдана","д нь g, з нь 3 шиг","и нь u, ш нь ш шиг ч дээгүүрээ зураастай байж болно","л, м-ийг доороос нь жижиг дэгээгээр эхэлнэ"],words:["мама","дом","школа","спасибо","привет","молоко","друг","жизнь","тетрадь","шоколад"]},
    de:{font:"Playwrite DE Grund",q:"Playwrite+DE+Grund",notes:["Германы сургуулийн «Grundschrift» — үсгүүд бараг холбогдохгүй","Том үсгээр нэр үгийг эхэлдэг","ß нь урт «s» маягтай"],words:["Haus","Schule","Straße","Danke","Freund","Mädchen","Brötchen","Wasser","Hallo","Grüße"]},
    en:{font:"Playwrite US Trad",q:"Playwrite+US+Trad",notes:["Үсгүүд хоорондоо холбогдож бичигддэг","r, s, f, z бичмэлээр хэвлэмэлээс их ялгаатай","Ихэнх сургуульд одоо хэвлэмэл маягаар бичдэг"],words:["hello","friend","school","thank you","family","water","beautiful","birthday","letter","sunny"]}};
  var fontsLoaded={};
  function loadFont(c){if(fontsLoaded[c.q])return;fontsLoaded[c.q]=1;var l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family="+c.q+"&display=swap"+(L()==="ru"?"&subset=cyrillic":"");document.head.append(l);}
  var cq=null;
  function viewCursive(root){
    var c=CUR[L()];
    if(!c){put(root,h("p",{class:"muted"},"Гар бичмэл хэсэг одоогоор орос, герман, англи хэлэнд л бий."));return;}
    loadFont(c);var ff="'"+c.font+"',cursive";
    put(root,h("p",{class:"muted"},"Гараар бичсэн тэмдэглэл, ил захидал уншиж сурна. Зүүнд хэвлэмэл, баруунд бичмэл."));
    var secs=(env.alpha()||[])[0];
    if(secs){
      var g=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:6px"});
      secs[1].forEach(function(it){var gl=it[0];g.append(h("div",{class:"note",style:"margin:0;padding:6px;text-align:center"},h("div",{class:"small",style:"font-weight:700"},gl),h("div",{style:"font-family:"+ff+";font-size:28px;line-height:1.2"},gl)));});
      put(root,g);
    }
    put(root,h("h3",{style:"margin:14px 0 4px"},"⚠️ Анхаарах"),h("ul",{class:"small",style:"margin:0;padding-left:18px"},c.notes.map(function(n){return h("li",null,n);})));
    /* унших дасгал: бичмэл үгийг харж хэвлэмэлийг нь сонгоно */
    if(!cq||cq.lang!==L()){var w=c.words[Math.floor(Math.random()*c.words.length)];cq={lang:L(),w:w,opts:shuffle([w].concat(shuffle(c.words.filter(function(x){return x!==w;})).slice(0,3))),pick:null};}
    put(root,h("h3",{style:"margin:16px 0 4px"},"📖 Уншиж үз"),
      h("div",{class:"note",style:"text-align:center;font-family:"+ff+";font-size:40px",lang:L()},cq.w));
    cq.opts.forEach(function(o){
      put(root,h("button",{class:"opt"+(cq.pick?(o===cq.w?" ok":o===cq.pick?" bad":""):""),disabled:!!cq.pick,lang:L(),onclick:function(){cq.pick=o;if(o===cq.w)env.addXP(2);env.speak(cq.w);env.render();}},o));
    });
    if(cq.pick)put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:8px",onclick:function(){cq=null;env.render();}},"Дараагийн ›"));
    put(root,h("p",{class:"muted small",style:"margin-top:8px"},"Фонт: "+c.font+" (Google Fonts). Интернэтгүй үед энгийн фонтоор харагдаж магадгүй."));
  }

  /* ---------- ⚡ хурдан таних ---------- */
  var SP=null,SEC=60;
  function spNext(){
    var all=items().filter(function(x){return ans(x.it);});
    var cur=all[Math.floor(Math.random()*all.length)];if(SP.cur&&cur.it===SP.cur.it)cur=all[(all.indexOf(cur)+1)%all.length];
    var seen={},ds=[];seen[ans(cur.it)]=1;
    shuffle(all.filter(function(x){return x.s===cur.s&&x.it!==cur.it;})).forEach(function(x){var k=ans(x.it);if(ds.length<3&&!seen[k]){seen[k]=1;ds.push(x);}});
    SP.cur=cur;SP.opts=shuffle([cur].concat(ds));SP.flash=null;
  }
  function spEnd(){
    if(SP.end)return;SP.end=true;clearInterval(SP.iv);
    var b=env.sget("aspd",{})||{},prev=b[L()]||0;SP.rec=SP.ok>prev;if(SP.rec){b[L()]=SP.ok;env.sset("aspd",b);}
    SP.xp=Math.min(15,Math.ceil(SP.ok/2));if(SP.xp)env.addXP(SP.xp);if(SP.rec&&SP.ok>=5)env.celebrate();
    env.render();
  }
  function spStart(){
    if(SP&&SP.iv)clearInterval(SP.iv);
    SP={lang:L(),ok:0,bad:0,t0:Date.now(),left:SEC,pen:0,end:false};spNext();
    SP.iv=setInterval(function(){if(!SP||SP.end)return;SP.left=Math.max(0,SEC-Math.floor((Date.now()-SP.t0)/1000)-SP.pen);var e=document.getElementById("asp-left");if(e)e.textContent=SP.left+"с";if(SP.left<=0)spEnd();},250);
    env.render();
  }
  function viewSpeed(root){
    var best=(env.sget("aspd",{})||{})[L()]||0;
    if(!SP||SP.lang!==L()){
      put(root,h("p",{class:"muted"},"60 секундэд аль болох олон үсгийг танина. Алдаа бүр 2 секунд хасна."+(latin()?" Үсгээр эхэлдэг үгийг сонгоно.":" Үсгийн уншлагыг сонгоно.")));
      put(root,h("button",{class:"btn primary",style:"width:100%;font-size:18px",onclick:spStart},"⚡ Эхлэх"+(best?" · 🏆 "+best:"")));
      return;
    }
    if(SP.end){
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},SP.rec?"🏆":"⚡"),h("div",{style:"font-size:24px;font-weight:800"},SP.ok+" үсэг"),
        h("div",{class:"muted"},"Алдаа "+SP.bad+(SP.xp?" · +"+SP.xp+" XP":"")),SP.rec?h("b",null,"🎉 Шинэ дээд амжилт!"):h("div",{class:"muted small"},"Дээд амжилт: "+best)));
      put(root,h("div",{class:"row"},h("button",{class:"btn",onclick:function(){SP=null;env.render();}},"Буцах"),h("button",{class:"btn primary",onclick:spStart},"Дахин")));
      return;
    }
    put(root,h("div",{style:"display:flex;justify-content:space-between;font-weight:800"},h("span",null,"✅ "+SP.ok),h("span",{id:"asp-left"},SP.left+"с")));
    put(root,h("div",{class:"note abig",style:SP.flash==="bad"?"border-color:var(--danger)":SP.flash==="ok"?"border-color:var(--ok)":""},h("div",{class:"g",lang:L()},SP.cur.it[0])));
    var g=h("div",{style:"display:grid;grid-template-columns:1fr 1fr;gap:8px"});
    SP.opts.forEach(function(o){
      g.append(h("button",{class:"opt",style:"margin:0",onclick:function(){
        var ok=o===SP.cur;record(SP.cur.it[0],ok);
        if(ok){SP.ok++;spNext();SP.flash="ok";}else{SP.bad++;SP.pen+=2;SP.flash="bad";env.speak(SP.cur.it[1]);}
        env.render();
      }},ans(o.it)));
    });
    put(root,g);
  }

  /* ---------- 🧱 үе бүтээгч ---------- */
  var KO_F=["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  var KO_FS=[0,1,4,7,8,16,17,19,21,22,23,24,25,26,27,2,20];
  var KO_IR=["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"],
      KO_VR=["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"],
      KO_FR=["","k","k","k","n","n","n","t","l","k","m","l","l","l","p","l","m","p","p","t","t","ng","t","t","k","t","p","t"];
  var B={};
  function koSyl(){return String.fromCharCode(0xAC00+(B.i*21+B.v)*28+B.f);}
  function viewKo(root){
    if(B.lang!=="ko")B={lang:"ko",i:0,v:0,f:0,target:null};
    var s=koSyl(),rom=KO_IR[B.i]+KO_VR[B.v]+KO_FR[B.f];
    put(root,h("div",{class:"note",style:"text-align:center"},h("div",{lang:"ko",style:"font-size:64px;font-weight:800;line-height:1.1"},s),
      h("div",{class:"muted"},KO_I.charAt(B.i)+" + "+KO_V.charAt(B.v)+(B.f?" + "+KO_F[B.f]:"")+" · "+rom),
      h("button",{class:"btn ghost",onclick:function(){env.speak(s);}},"🔊 Сонсох")));
    if(B.target)put(root,h("div",{class:"fb "+(B.target===s?"ok":""),style:"text-align:center"},B.target===s?"🎉 Зөв! «"+B.target+"» бүтээлээ":"🎯 Зорилт: «"+B.target+"» үеийг бүтээ"));
    function row(title,list,cur,set){
      var g=h("div",{style:"display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 10px"});
      list.forEach(function(x,i){g.append(h("button",{class:"btn"+(i===cur?" primary":""),style:"min-width:40px;padding:6px 8px;font-size:18px",lang:"ko",onclick:function(){set(i);if(B.target&&koSyl()===B.target){env.addXP(2);env.celebrate();}env.speak(koSyl());env.render();}},x||"∅"));});
      put(root,h("div",{class:"small",style:"font-weight:700"},title),g);
    }
    row("1. Эхний гийгүүлэгч",KO_I.split(""),B.i,function(i){B.i=i;});
    row("2. Эгшиг",KO_V.split(""),B.v,function(i){B.v=i;});
    row("3. Батчим (заавал биш)",KO_FS.map(function(i){return KO_F[i];}),KO_FS.indexOf(B.f),function(i){B.f=KO_FS[i];});
    put(root,h("button",{class:"btn",style:"width:100%",onclick:function(){
      var ws=env.words().map(function(w){return String(w[1]).charAt(0);}).filter(function(c){var p=koParts(c);return p&&KO_FS.indexOf(p.f)>=0;});
      B.target=ws.length?ws[Math.floor(Math.random()*ws.length)]:"한";env.render();
    }},"🎯 Сорилт: өгсөн үеийг бүтээ"));
  }
  /* ja: үндсэн кана + ゛ ゜ + жижиг ゃゅょ + っ */
  function jaRomaMap(){var m={"ぢ":"ji","づ":"zu","ゔ":"vu"};(env.alpha()||[]).forEach(function(sec){sec[1].forEach(function(it){var k=kata2hira(it[0]);if(!m[k]&&it[2])m[k]=it[2];});});return m;}
  function viewJa(root){
    if(B.lang!=="ja")B={lang:"ja",base:"か",dak:0,small:"",tsu:false,kata:false};
    var H="あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
    var b=B.base,c=b.charCodeAt(0),canD=/[かきくけこさしすせそたちつてとはひふへほ]/.test(b),canH=/[はひふへほ]/.test(b);
    if(B.dak===1&&!canD)B.dak=0;if(B.dak===2&&!canH)B.dak=0;
    var k=String.fromCharCode(c+B.dak),canS=/[きしちにひみりぎじぢびぴ]/.test(k);if(!canS)B.small="";
    var syl=(B.tsu?"っ":"")+k+B.small,rm=jaRomaMap(),base=rm[k]||"";
    var r=base;
    if(B.small){var v={"ゃ":"a","ゅ":"u","ょ":"o"}[B.small];r=/^(shi|chi|ji)$/.test(base)?base.slice(0,-1)+v:base.slice(0,-1)+"y"+v;}
    if(B.tsu&&r)r=(r.indexOf("ch")===0?"t":r.charAt(0))+r;
    var show=B.kata?syl.replace(/[ぁ-ゖ]/g,function(x){return String.fromCharCode(x.charCodeAt(0)+96);}):syl;
    put(root,h("div",{class:"note",style:"text-align:center"},h("div",{lang:"ja",style:"font-size:60px;font-weight:800"},show),h("div",{class:"muted"},r||"—"),
      h("button",{class:"btn ghost",onclick:function(){env.speak(show);}},"🔊 Сонсох")));
    put(root,h("div",{class:"seg"},h("button",{"aria-pressed":String(!B.kata),onclick:function(){B.kata=false;env.render();}},"ひらがな"),h("button",{"aria-pressed":String(B.kata),onclick:function(){B.kata=true;env.render();}},"カタカナ")));
    var g=h("div",{style:"display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:8px 0"});
    H.split("").forEach(function(x){g.append(h("button",{class:"btn"+(x===b?" primary":""),style:"padding:6px 0;font-size:18px",lang:"ja",onclick:function(){B.base=x;env.render();}},B.kata?String.fromCharCode(x.charCodeAt(0)+96):x));});
    put(root,h("div",{class:"small",style:"font-weight:700"},"1. Үндсэн кана"),g);
    put(root,h("div",{class:"small",style:"font-weight:700"},"2. Тэмдэг нэмэх"),h("div",{class:"row",style:"flex-wrap:wrap;gap:6px;margin:4px 0"},
      h("button",{class:"btn"+(B.dak===1?" primary":""),disabled:!canD,onclick:function(){B.dak=B.dak===1?0:1;env.render();}},"゛ дакутэн"),
      h("button",{class:"btn"+(B.dak===2?" primary":""),disabled:!canH,onclick:function(){B.dak=B.dak===2?0:2;env.render();}},"゜ хандакутэн"),
      h("button",{class:"btn"+(B.tsu?" primary":""),onclick:function(){B.tsu=!B.tsu;env.render();}},"っ давхар")));
    put(root,h("div",{class:"row",style:"flex-wrap:wrap;gap:6px;margin:4px 0"},["ゃ","ゅ","ょ"].map(function(x){return h("button",{class:"btn"+(B.small===x?" primary":""),disabled:!canS,lang:"ja",onclick:function(){B.small=B.small===x?"":x;env.render();}},"+ "+x);})));
    put(root,h("p",{class:"muted small"},"゛ нь k→g, s→z, t→d, h→b болгоно; ゜ нь h→p. Жижиг ゃゅょ нь い-тэй төгссөн канатай нийлж нэг үе болно. っ дараагийн гийгүүлэгчийг давхарлана."));
  }
  /* zh: эхлэл + төгсгөл + аяс → пиньинь (бичих дүрэм, аяны тэмдэг), аппад ийм ханз байвал сонсгоно */
  var ZI=["","b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s"],
      ZF=["a","o","e","i","u","ü","ai","ei","ao","ou","an","en","ang","eng","ong","ia","ie","iao","iu","ian","in","iang","ing","iong","ua","uo","uai","ui","uan","un","uang","üe","üan","ün","er"];
  function pySpell(i,f){
    if(!i){var Y={i:"yi",in:"yin",ing:"ying",ia:"ya",ie:"ye",iao:"yao",iu:"you",ian:"yan",iang:"yang",iong:"yong",u:"wu",ua:"wa",uo:"wo",uai:"wai",ui:"wei",uan:"wan",un:"wen",uang:"wang","ü":"yu","üe":"yue","üan":"yuan","ün":"yun"};return Y[f]||f;}
    if(/^[jqx]$/.test(i))f=f.replace("ü","u");
    return i+f;
  }
  function pyTone(s,t){
    if(!t||t>4)return s;
    var M={a:"āáǎà",e:"ēéěè",i:"īíǐì",o:"ōóǒò",u:"ūúǔù","ü":"ǖǘǚǜ"};
    var k=s.indexOf("a")>=0?s.indexOf("a"):s.indexOf("e")>=0?s.indexOf("e"):s.indexOf("ou")>=0?s.indexOf("o"):-1;
    if(k<0){for(var j=s.length-1;j>=0;j--)if(M[s.charAt(j)]){k=j;break;}}
    if(k<0)return s;return s.slice(0,k)+M[s.charAt(k)].charAt(t-1)+s.slice(k+1);
  }
  function zhIndex(){
    var m={};
    env.words().forEach(function(w){if(String(w[1]).length===1&&w[7])m[String(w[7]).trim().toLowerCase()]=w[1];});
    (env.alpha()||[]).forEach(function(sec){sec[1].forEach(function(it){if(String(it[1]).length===1&&it[2]&&/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/.test(it[2]))m[String(it[2]).toLowerCase()]=m[String(it[2]).toLowerCase()]||it[1];});});
    return m;
  }
  function viewZh(root){
    if(B.lang!=="zh")B={lang:"zh",i:1,f:0,t:1};
    var sp=pySpell(ZI[B.i],ZF[B.f]),py=pyTone(sp,B.t),hz=zhIndex()[py];
    put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:48px;font-weight:800"},py),
      hz?h("div",{lang:"zh",style:"font-size:30px"},hz):h("div",{class:"muted small"},"Ийм дуудлагатай жишээ ханз аппад алга"),
      hz?h("button",{class:"btn ghost",onclick:function(){env.speak(hz);}},"🔊 Сонсох"):null));
    function row(title,list,cur,set,lab){
      var g=h("div",{style:"display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 10px"});
      list.forEach(function(x,i){g.append(h("button",{class:"btn"+(i===cur?" primary":""),style:"min-width:40px;padding:6px 8px",onclick:function(){set(i);env.render();}},lab?lab(x,i):x||"∅"));});
      put(root,h("div",{class:"small",style:"font-weight:700"},title),g);
    }
    row("1. Эхлэл (声母)",ZI,B.i,function(i){B.i=i;});
    row("2. Төгсгөл (韵母)",ZF,B.f,function(i){B.f=i;});
    row("3. Аяс",[1,2,3,4,5],B.t-1,function(i){B.t=i+1;},function(x){return ["ˉ 1","ˊ 2","ˇ 3","ˋ 4","· 0"][x-1];});
    put(root,h("p",{class:"muted small"},"Бичих дүрэм: эхлэлгүй i→yi, u→wu, ü→yu; j/q/x-ийн дараа ü-г u гэж бичнэ. Аяны тэмдэг a, e дээр, ou-д o дээр, бусад үед сүүлийн эгшиг дээр. Бүх хослол бодит үе биш."));
  }
  function viewBuilder(root){
    var l=L();
    if(l==="ko")return viewKo(root);if(l==="ja")return viewJa(root);if(l==="zh")return viewZh(root);
    put(root,h("p",{class:"muted"},"Үе бүтээгч нь солонгос, япон, хятад хэлэнд зориулагдсан."));
  }

  /* ---------- 🎵 цагаан толгойн дуу ---------- */
  var SG={on:false,i:0,gen:0,word:false};
  function songList(){var s=env.alpha()||[];var out=[];s.forEach(function(sec,i){if(i===0||(L()==="ko"&&i===1))out=out.concat(sec[1]);});return out;}
  function songStep(gen){
    if(!SG.on||gen!==SG.gen)return;
    var list=songList(),it=list[SG.i];
    if(!it){SG.on=false;env.addXP(2);env.toast("🎵 Цагаан толгой дууслаа! +2 XP");env.render();return;}
    [].forEach.call(document.querySelectorAll(".asong button"),function(b,i){b.style.background=i===SG.i?"var(--gold)":"";b.style.transform=i===SG.i?"scale(1.12)":"";});
    var txt=SG.word&&it[3]?[it[1],it[3]]:[it[1]];
    env.speakList(txt,function(){if(!SG.on||gen!==SG.gen)return;SG.i++;setTimeout(function(){songStep(gen);},120);});
  }
  function viewSong(root){
    var list=songList();
    put(root,h("p",{class:"muted"},"Үсгүүдийг дарааллаар нь хэмнэлтэй уншиж, тухайн үсгийг тодруулна. Дагаж хэлээрэй!"));
    var g=h("div",{class:"ag asong"});
    list.forEach(function(it,i){g.append(h("button",{style:"transition:transform .15s",onclick:function(){SG.i=i;if(SG.on){SG.gen++;env.stop();songStep(SG.gen);}}},it[0]));});
    put(root,g);
    if(latin()){var cb=h("input",{type:"checkbox",id:"sgw"});cb.checked=SG.word;cb.addEventListener("change",function(){SG.word=cb.checked;});
      put(root,h("label",{for:"sgw",class:"small",style:"display:flex;gap:8px;align-items:center;margin:8px 0"},cb,"Жишээ үгтэй нь (A — Apple)"));}
    put(root,h("button",{class:"btn primary",style:"width:100%;font-size:18px;margin-top:8px",onclick:function(){
      if(SG.on){SG.on=false;SG.gen++;env.stop();env.render();return;}
      SG.on=true;SG.gen++;if(SG.i>=list.length)SG.i=0;env.render();songStep(SG.gen);
    }},SG.on?"⏹ Зогсоох":"🎵 Эхлүүлэх"));
    if(SG.on)setTimeout(function(){[].forEach.call(document.querySelectorAll(".asong button"),function(b,i){b.style.background=i===SG.i?"var(--gold)":"";});},0);
  }

  /* ---------- ⌨️ гарын байрлал ---------- */
  var KB={en:["qwertyuiop","asdfghjkl","zxcvbnm"],de:["qwertzuiopü","asdfghjklöä","yxcvbnmß"],ru:["йцукенгшщзхъ","фывапролджэ","ячсмитьбю"],
    ko:["ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ","ㅁㄴㅇㄹㅎㅗㅓㅏㅣ","ㅋㅌㅊㅍㅠㅜㅡ"]};
  var KBN={en:"QWERTY (англи)",de:"QWERTZ (герман) — Y, Z байраа сольсон",ru:"ЙЦУКЕН (орос)",ko:"두벌식 (солонгос 2 мөрт) — зүүн гар гийгүүлэгч, баруун гар эгшиг"};
  var KB_ADD={ja:"Япон: Тохиргоо → Хэл ба оруулга → Гар → Япон (ローマ字 эсвэл 12 товчтой kana). Ромажиар ka гэж бичихэд か болно.",
    zh:"Хятад: Тохиргоо → Гар → Хятад (Пиньинь). Пиньинь бичээд (nihao) гарч ирсэн ханзнаас сонгоно.",
    ug:"Уйгур кирилл гар ихэнх утсанд байдаггүй. Орос гар + урт дарж ә, қ, ғ, ң, һ гэх мэт үсгийг сонгох эсвэл «Uyghur» гар суулгана."};
  var KT=null;
  function viewKeyboard(root){
    var l=L(),lay=KB[l];
    put(root,h("div",{class:"note small"},h("b",null,"📱 Утсандаа гар нэмэх: "),"Android: Тохиргоо → Систем → Хэл ба оруулга → Дэлгэцийн гар → Gboard → Хэл → Гар нэмэх. iPhone: Тохиргоо → Ерөнхий → Гар → Гарууд → Шинэ гар нэмэх."));
    if(KB_ADD[l])put(root,h("p",{class:"small"},KB_ADD[l]));
    if(!lay){
      if(l==="ja"){
        put(root,h("h3",{style:"margin:12px 0 4px"},"Ромажи → кана"),h("p",{class:"muted small"},"Япон гар дээр латин үсгээр бичихэд кана болно:"));
        var ex=[["ka","か"],["shi","し"],["tsu","つ"],["n / nn","ん"],["kya","きゃ"],["kka","っか"],["wo","を"],["-","ー"]];
        put(root,h("div",{style:"display:grid;grid-template-columns:1fr 1fr;gap:6px"},ex.map(function(x){return h("div",{class:"srow"},h("b",null,x[0]),h("span",{lang:"ja",style:"font-size:20px"},x[1]));})));
      }
      return;
    }
    put(root,h("p",{class:"muted"},KBN[l]+". Тодорсон үсгийг өөрийн гараар бич."));
    if(!KT||KT.lang!==l){var all=lay.join("").split("");KT={lang:l,cur:all[Math.floor(Math.random()*all.length)],ok:0,miss:0};}
    var kb=h("div",{style:"margin:8px 0;display:flex;flex-direction:column;gap:4px;align-items:center"});
    lay.forEach(function(r,ri){
      var row=h("div",{style:"display:flex;gap:3px;margin-left:"+(ri*12)+"px"});
      r.split("").forEach(function(c){
        var on=c===KT.cur;
        row.append(h("div",{lang:l,style:"width:28px;height:36px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;border:1px solid var(--line);background:"+(on?"var(--gold)":"var(--surface)")+";color:var(--ink);font-size:15px"},c));
      });
      kb.append(row);
    });
    put(root,kb);
    put(root,h("div",{class:"note",style:"text-align:center"},h("div",{class:"muted small"},"Бич:"),h("div",{lang:l,style:"font-size:44px;font-weight:800"},KT.cur)));
    var inp=h("input",{class:"tin",lang:l,autocomplete:"off",autocapitalize:"off",autocorrect:"off",spellcheck:"false","aria-label":"Энд бич",style:"text-align:center;font-size:24px"});
    var chk=function(){
      var v=inp.value.trim().toLowerCase();if(!v)return;
      /* солонгос IME үсгийг үе болгон нийлүүлбэл эхний jamo-г шалгана */
      var p=l==="ko"?koParts(v.charAt(v.length-1)):null;
      var ok=v.slice(-1)===KT.cur||(p&&(KO_I.charAt(p.i)===KT.cur||KO_V.charAt(p.v)===KT.cur));
      if(ok){KT.ok++;var all=lay.join("").split("");var n=KT.cur;while(n===KT.cur)n=all[Math.floor(Math.random()*all.length)];KT.cur=n;if(KT.ok%10===0)env.addXP(2);env.render();}
      else{KT.miss++;inp.value="";inp.style.borderColor="var(--danger)";}
    };
    inp.addEventListener("input",function(e){if(e.isComposing)return;chk();});
    inp.addEventListener("compositionend",chk);
    put(root,inp,h("p",{class:"muted small",style:"text-align:center"},"✅ "+KT.ok+" · ❌ "+KT.miss));
    setTimeout(function(){if(inp.isConnected&&!("ontouchstart" in window))inp.focus();},0);
  }

  var TOOLS=[
    ["mast","📊","Үсгийн эзэмшилт","Аль үсгээ сайн мэдэж, алийг нь мартдагаа хар",function(){return true;}],
    ["ff","🪤","Хуурамч найз үсгүүд","Танил харагдах ч өөрөөр уншдаг үсгүүд",function(l){return !!FF[l];}],
    ["lw","🔤","Үсэг → үг","Үсэг бүрээр эхэлдэг үгс",function(){return true;}],
    ["cur","✒️","Гар бичмэл","Гараар бичсэн үсгийг уншиж сурах",function(l){return !!CUR[l];}],
    ["spd","⚡","Хурдан таних","60 секундэд хэдэн үсэг таних вэ?",function(){return true;}],
    ["bld","🧱","Үе бүтээгч","Хэсгүүдийг нийлүүлж үе бүтээ",function(l){return l==="ko"||l==="ja"||l==="zh";}],
    ["song","🎵","Цагаан толгойн дуу","Дарааллаар нь хэмнэлтэй дагаж хэл",function(){return true;}],
    ["kb","⌨️","Гарын байрлал","Утсандаа гар нэмэх, үсэг хаана байгааг сур",function(){return true;}]
  ];
  function view(e){
    env=e;h=e.h;var root=h("div"),l=L();
    var t=V.tool&&TOOLS.filter(function(x){return x[0]===V.tool&&x[4](l);})[0];
    if(!t){
      V.tool=null;
      var g=h("div",{class:"hgrid ggrid"});
      TOOLS.forEach(function(x){
        if(!x[4](l))return;
        g.append(h("button",{class:"gamecard",type:"button",style:"margin:10px 0 0",onclick:function(){V.tool=x[0];env.render();window.scrollTo(0,0);}},
          h("i",{"aria-hidden":"true"},x[1]),h("div",null,h("b",null,x[2]),h("span",null,x[3]))));
      });
      put(root,g);return root;
    }
    put(root,h("button",{class:"back",onclick:function(){if(SP){clearInterval(SP.iv);SP=null;}if(SG.on){SG.on=false;SG.gen++;env.stop();}V.tool=null;env.render();window.scrollTo(0,0);}},"‹ Дасгалууд"));
    put(root,h("h3",{style:"margin:6px 0 8px"},t[1]+" "+t[2]));
    ({mast:viewMastery,ff:viewFF,lw:viewLetterWords,cur:viewCursive,spd:viewSpeed,bld:viewBuilder,song:viewSong,kb:viewKeyboard})[t[0]](root);
    return root;
  }
  window.AlphaPlus={view:view,record:function(e,g,ok){var o=env;env=e;try{record(g,ok);}finally{env=o||e;}},
    /* тест */
    _pySpell:pySpell,_pyTone:pyTone,_koParts:koParts,_ff:FF,_starts:function(e,w,it){var o=env;env=e;try{return startsWith(w,it);}finally{env=o;}}};
})();
