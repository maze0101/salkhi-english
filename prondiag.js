/* Салхи: 🩺 дуудлагын онош — монгол хүнд онцгой хэцүү авианы төрлүүдээр сонсож ялгах тест.
   Төрөл бүрт 2 асуулт; дүнгээр «таны гол бэрхшээл»-ийг шалтгаан, зөвлөгөө, дасгалтай нь гаргана.
   Мөр: id|гарчиг|яагаад монголчуудад хэцүү|зөвлөгөө|хос хос (унших/харуулах/утга ; …) — хос хооронд " / " */
(function(){
  var DATA={
en:`th|th (think, three)|Монгол хэлэнд th авиа байхгүй тул ихэвчлэн с, з, т, д-гээр солигддог: think → «синк», three → «три».|Хэлнийхээ үзүүрийг дээд, доод шүдний хооронд бага зэрэг гаргаад агаар үлээ. Толинд харж дасгал хий.|think||бодох ; sink||живэх / three||гурав ; tree||мод / thick||зузаан ; sick||өвчтэй / they||тэд ; day||өдөр
f_p|f ба p (fan, pan)|Монгол хэлний уугуул үгэнд ф авиа ховор тул зарим хүн ф-г п гэж хэлдэг: coffee → «копи».|Доод уруулаа дээд шүдэндээ хүргээд агаар үлээ — уруулаа хоёуланг нь нийлүүлэхгүй.|fan||сэнс ; pan||хайруулын таваг / fast||хурдан ; past||өнгөрсөн / fine||сайн ; pine||нарс / coffee||кофе ; copy||хуулбар
v_w|v, w, b (very, west)|Монгол «в» англи v ба w-ийн дунд байдаг тул vest/west, very/berry-г андуурна.|v — доод уруулаа шүдэнд хүргэж чичир. w — уруулаа дугуйлж урагш сунга, шүдэнд хүргэхгүй. b — уруулаа нийлүүлж тэсрүүл.|very||маш ; berry||жимс / vest||хантааз ; west||баруун / vet||малын эмч ; wet||нойтон / van||фургон ; ban||хориг
r_l|r ба l (right, light)|Монгол р нь эргэлддэг, л нь шүүгэлттэй тул англи r (эргэлдэхгүй) ба l (цэвэр)-ийг андуурна.|r — хэлээ хаана ч хүргэхгүй, бага зэрэг ар тийш нугал. l — хэлний үзүүрийг дээд шүдний ард хүргэж, шүүгэлгүй тод хэл.|right||зөв ; light||гэрэл / rice||будаа ; lice||бөөс / road||зам ; load||ачаа / correct||зөв ; collect||цуглуулах
i_ii|Богино i, урт ee (ship, sheep)|Монгол «и», «ий» хоёр урт богиноороо ялгагддаг ч англи богино i нь илүү сул, «э» руу дөхсөн өнгөтэй.|ship — богино, сул, «ш-ы-п» руу ойр. sheep — урт, инээмсэглэсэн мэт уруулаа тэлж «шиип».|ship||хөлөг ; sheep||хонь / bit||жаахан ; beat||цохих / live||амьдрах ; leave||явах / fill||дүүргэх ; feel||мэдрэх
ae_e|æ ба e (bad, bed)|Монгол хэлэнд «а» ба «э»-ийн дундах æ авиа байхгүй тул bad ба bed-ийг адилхан хэлдэг.|æ — амаа «а» шиг том ангайгаад «э» гэж хэл. e — ам бага ангайна.|bad||муу ; bed||ор / man||эр хүн ; men||эрчүүд / sad||гунигтай ; said||хэлсэн / pan||таваг ; pen||үзэг
a_u|æ ба ʌ (cap, cup)|Монгол «а» нэг л янз байдаг тул cap (ам том) ба cup (ам бага, богино «а») ялгахад хэцүү.|cup — амаа бага ангайж, богино, сул «а». cap — ам том, «э» руу дөхсөн.|cap||малгай ; cup||аяга / hat||малгай ; hut||овоохой / bag||цүнх ; bug||хорхой / ran||гүйсэн ; run||гүйх
final|Төгсгөлийн гийгүүлэгч (bag, back)|Монгол хэлэнд үгийн төгсгөлийн гийгүүлэгчийг сул хэлдэг тул bag/back, rise/rice андуурна.|Төгсгөлийн g, d, z-ийн өмнөх эгшгийг урт хэл: bag = «бээ-г», back = богино «бэк».|bag||цүнх ; back||нуруу / rise||өсөх ; rice||будаа / bed||ор ; bet||бооцоо / prize||шагнал ; price||үнэ`,
ja:`long|Урт, богино эгшиг (ビル・ビール)|Монгол хэлэнд урт эгшиг бий ч японд урт эгшиг ердийн ярианд богиносож сонсогддоггүй тул алдагддаг.|Урт эгшгийг яг хоёр цохилт (拍) болгон тоолж хэл: お・ば・あ・さ・ん = 5 цохилт.|ビル||барилга ; ビール||шар айраг / おばさん||авга эгч ; おばあさん||эмээ / おじさん||авга ах ; おじいさん||өвөө / ここ||энд ; こうこう||ахлах сургууль
tsu|Жижиг っ (きて・きって)|Монгол хэлэнд давхар гийгүүлэгчийн «завсарлага» байхгүй тул っ-г алгасдаг.|っ-ийн оронд нэг цохилт чимээгүй зогсоод дараагийн гийгүүлэгчийг хүчтэй хэл: き・っ・て.|きて||ир ; きって||марк / さか||налуу ; さっか||зохиолч / かこ||өнгөрсөн ; かっこ||хаалт / おと||дуу ; おっと||нөхөр
you|ょう ба よう (びょういん・びよういん)|Монгол хэлэнд ё/ю нэг үе боловч японд びょう (1 үе) ба びよう (2 үе) өөр утгатай.|びょう — «бёо» нэг үе. びよう — «би-ёо» хоёр үе. Цохилтоо алгаа ташиж тоол.|びょういん||эмнэлэг ; びよういん||үсчин / しゅじん||нөхөр ; しゅうじん||хоригдол / きょう||өнөөдөр ; きよう||чадварлаг`,
ko:`asp|Гурван гийгүүлэгч (달・탈・딸)|Монгол хэлэнд ㄷ/ㅌ/ㄸ шиг сул, амьсгалтай, чангалсан гурван төрөл байхгүй тул ялгахад хамгийн хэцүү.|ㄷ — сул, ㅌ — амнаас агаар гаргаж (цаас хөдөлнө), ㄸ — хоолойгоо чангалж агааргүй хүчтэй хэл.|달||сар ; 탈||баг ; 딸||охин / 불||гал ; 풀||өвс ; 뿔||эвэр / 자다||унтах ; 차다||өшиглөх ; 짜다||давслаг / 굴||хясаа ; 꿀||зөгийн бал
tense|Чангалсан ㅃ, ㅆ (방・빵, 살・쌀)|Монгол хэлэнд чангалсан гийгүүлэгч байхгүй.|Хэлэхийн өмнө хоолойгоо түр барьж, агааргүй хурц хэл: 빵 = «ппанг».|방||өрөө ; 빵||талх / 살||мах ; 쌀||будаа / 비다||хоосон ; 삐다||булгалах / 사다||авах ; 싸다||хямд
eo_o|ㅓ ба ㅗ (거리・고리)|Монгол «о» нь ㅓ ба ㅗ хоёрын аль алинд нь ойр тул андуурна.|ㅓ — уруулаа дугуйлахгүй, амаа сул ангай. ㅗ — уруулаа дугуйлж урагш сунга.|거리||гудамж ; 고리||гогцоо / 섬||арал ; 솜||хөвөн / 벌||зөгий ; 볼||хацар / 정||сэтгэл ; 종||хонх
eu_u|ㅡ ба ㅜ (그・구)|Монголд ㅡ (уруул дугуйлахгүй «ы») байхгүй тул ㅜ гэж хэлдэг.|ㅡ — шүдээ бага зэрэг ангайж, уруулаа хэвтээ тэл. ㅜ — уруулаа дугуйл.|그||тэр ; 구||ес / 들||тал ; 둘||хоёр / 근||жин ; 군||цэрэг`,
zh:`tone|Ая (mā, má, mǎ, mà)|Монгол хэлэнд ая утга ялгадаггүй тул шинэ үгийг аягүй цээжилж, дараа нь андуурдаг.|Ая бүрийг гараараа зурж хэл: 1 — хэвтээ, 2 — дээш, 3 — доош дээш, 4 — огцом доош.|妈|mā 妈|ээж ; 麻|má 麻|олсны ургамал ; 马|mǎ 马|морь ; 骂|mà 骂|загнах / 汤|tāng 汤|шөл ; 糖|táng 糖|чихэр / 买|mǎi 买|авах ; 卖|mài 卖|зарах / 书|shū 书|ном ; 鼠|shǔ 鼠|хулгана
sh_s|sh/s, zh/z (四・十)|Монгол «ш», «с» хятадын sh/s, x-тэй яг таарахгүй тул 四 sì (4) ба 十 shí (10)-ийг андуурна.|sh — хэлний үзүүрийг ар тийш нугалж «ш». s — хэлээ шүдний ард, инээмсэглэж «с».|四|sì 四|дөрөв ; 十|shí 十|арав / 三|sān 三|гурав ; 山|shān 山|уул / 自|zì 自|өөрөө ; 志|zhì 志|хүсэл
j_q|j ба q (鸡・七)|Монгол хэлэнд амьсгалтай q (ч + агаар) ба амьсгалгүй j (з/ж)-ийн ялгаа байхгүй.|q — амнаас агаар гарч цаас хөдөлнө. j — агааргүй, зөөлөн.|鸡|jī 鸡|тахиа ; 七|qī 七|долоо / 家|jiā 家|гэр ; 掐|qiā 掐|чимхэх / 机|jī 机|машин ; 期|qī 期|хугацаа
u_ue|u ба ü (路・绿)|Монгол «ү» ü-тэй төстэй ч j, q, x-ийн дараа ü-г u гэж бичдэг тул андуурна.|ü — «и» гэж хэлээд уруулаа дугуйл (монгол «ү»). u — «у».|路|lù 路|зам ; 绿|lǜ 绿|ногоон / 怒|nù 怒|уур ; 女|nǚ 女|эмэгтэй / 旅|lǚ 旅|аялал ; 鲁|lǔ 鲁|(овог)`,
ru:`soft|Зөөлөн гийгүүлэгч (мат・мать)|Монгол хэлэнд ь нь эгшгийг өөрчилдөг ч орос хэлэнд гийгүүлэгчийг өөрөө зөөлрүүлж утгыг өөрчилдөг.|Зөөлөн гийгүүлэгчийг хэлэхдээ хэлний дунд хэсгийг тагнай руу өргө, «й» авиа нэмэх мэт.|мат||шатрын мат ; мать||ээж / угол||булан ; уголь||нүүрс / кон||тойрог ; конь||морь / брат||ах ; брать||авах
y_i|ы ба и (был・бил)|Монгол «ы» ихэвчлэн нөхцөлд л гардаг тул орос ы-г и гэж хэлэх нь түгээмэл.|ы — «и» гэж хэлээд хэлээ ар тийш татаж, уруулаа хэвтээ тэл.|был||байсан ; бил||цохисон / мыл||угаасан ; мил||хөөрхөн / быть||байх ; бить||цохих / сыр||бяслаг ; сир||өнчин
voice|Хоолойтой ба хоолойгүй (дом・том)|Монгол д/т, б/п-ийн ялгаа орос хэлнийхээс сул тул дом/том, жить/шить андуурна.|Хоолойтой (д, б, ж, з) авиаг хэлэхдээ хоолойгоо чичируул — гараа хоолойн дээр тавиад шалга.|дом||гэр ; том||боть / жить||амьдрах ; шить||оёх / бал||бүжгийн үдэшлэг ; пал||унасан / зуб||шүд ; суп||шөл`,
de:`ue_u|ü ба u (Mutter・Mütter)|Монгол «ү» байдаг ч германчууд ü-г u-тай андуурвал олон тоо, утга өөрчлөгдөнө.|ü — «и» гэж хэлээд уруулаа дугуйл (монгол «ү»). u — «у».|Mutter||ээж ; Mütter||ээжүүд / Kuchen||бялуу ; Küchen||гал тогоонууд / Brüder||ах дүүс ; Bruder||ах
oe_o|ö ба o (schon・schön)|Монгол «ө» нь ö-тэй төстэй ч германд o/ö ялгаа утгыг өөрчилдөг тул анхаарах хэрэгтэй.|ö — «э» гэж хэлээд уруулаа дугуйл (монгол «ө»).|schon||аль хэдийн ; schön||гоё / lesen||унших ; lösen||шийдэх / Ofen||зуух ; öffnen||нээх
len|Урт, богино эгшиг (Staat・Stadt)|Монгол урт эгшиг бий ч германд богино эгшгийн дараах гийгүүлэгч хурц, богино тул андуурна.|Урт эгшиг — тайван сунга. Богино эгшиг — огцом тасалж, дараагийн гийгүүлэгчийг хурц хэл.|Staat||улс ; Stadt||хот / Beet||цэцгийн мөр ; Bett||ор / Hüte||малгайнууд ; Hütte||овоохой / fühlen||мэдрэх ; füllen||дүүргэх`
  };
  var env=null,h=null,S={lang:null,run:null,show:null};
  function cats(){
    return String(DATA[env.lang()]||"").split("\n").map(function(l){
      var p=l.split("|"),rest=p.slice(4).join("|");
      return {id:p[0],t:p[1],why:p[2],tip:p[3],g:rest.split(" / ").map(function(g){return g.split(" ; ").map(function(x){var q=x.split("|");return [q[0],q[1]||q[0],q[2]||""];});})};
    }).filter(function(c){return c.id&&c.g.length;});
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function key(){return "pdiag:"+env.lang();}
  function start(only){
    var qs=[];
    cats().forEach(function(c){
      if(only&&c.id!==only)return;
      shuffle(c.g).slice(0,only?6:2).forEach(function(g){var w=g[Math.floor(Math.random()*g.length)];qs.push({c:c.id,g:g,w:w});});
    });
    S.run={qs:only?qs:shuffle(qs),i:0,ok:{},n:{},picked:null,only:only||null};S.show=null;
    env.render();window.scrollTo(0,0);setTimeout(function(){if(S.run)env.speak(S.run.qs[0].w[0]);},300);
  }
  function finish(R){
    if(!R.only){
      var res={};Object.keys(R.n).forEach(function(c){res[c]=Math.round((R.ok[c]||0)/R.n[c]*100);});
      env.sset(key(),{r:res,ts:Date.now()});env.addXP(10);
    }
    S.show=R;S.run=null;env.render();window.scrollTo(0,0);
  }
  function viewRun(root){
    var R=S.run,q=R.qs[R.i],c=cats().filter(function(x){return x.id===q.c;})[0];
    root.append(h("div",{class:"muted small"},(R.i+1)+" / "+R.qs.length+(R.only?" · "+c.t:"")),
      h("div",{style:"height:8px;border-radius:8px;background:var(--line);overflow:hidden;margin:6px 0 10px"},h("i",{style:"display:block;height:100%;background:var(--sky);width:"+Math.round(R.i/R.qs.length*100)+"%"})));
    root.append(h("p",{class:"muted"},"Сонсоод аль үгийг хэлснийг сонго."));
    root.append(h("div",{class:"row"},h("button",{class:"btn primary",style:"font-size:18px",onclick:function(){env.speak(q.w[0]);}},"🔊 Сонсох"),
      h("button",{class:"btn ghost",onclick:function(){env.speak(q.w[0],null,true);}},"🐢 Удаан")));
    q.g.forEach(function(o){
      var cls="opt";if(R.picked){if(o===q.w)cls+=" ok";else if(o===R.picked)cls+=" bad";}
      root.append(h("button",{class:cls,disabled:!!R.picked,onclick:function(){
        R.picked=o;R.n[q.c]=(R.n[q.c]||0)+1;if(o===q.w)R.ok[q.c]=(R.ok[q.c]||0)+1;env.render();
      }},o[1]+(R.picked?"  — "+o[2]:"")));
    });
    if(R.picked){
      var ok=R.picked===q.w;
      root.append(h("div",{class:"fb "+(ok?"ok":"bad")},ok?"Зөв!":"Энэ нь «"+q.w[1]+"» байсан"));
      if(!ok){var row=h("div",{class:"row",style:"flex-wrap:wrap"});q.g.forEach(function(o){row.append(h("button",{class:"btn",onclick:function(){env.speak(o[0]);}},"🔊 "+o[1]));});root.append(row);}
      root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:10px",onclick:function(){
        R.i++;R.picked=null;if(R.i>=R.qs.length){finish(R);return;}env.render();setTimeout(function(){env.speak(R.qs[R.i].w[0]);},250);
      }},R.i+1<R.qs.length?"Дараагийн":"Дүнг харах"));
    }
  }
  function card(c,pc){
    return h("div",{class:"note",style:"margin-top:10px"},
      h("div",{style:"display:flex;justify-content:space-between;gap:8px;font-weight:800"},h("span",null,c.t),h("span",{style:"color:"+(pc>=80?"var(--ok)":pc>=50?"var(--ink-2)":"var(--danger)")},pc+"%")),
      h("div",{style:"height:8px;border-radius:6px;background:var(--line);overflow:hidden;margin:6px 0"},h("i",{style:"display:block;height:100%;width:"+pc+"%;background:"+(pc>=80?"var(--ok)":pc>=50?"var(--sky)":"var(--danger)")})),
      h("p",{class:"small",style:"margin:6px 0"},"🇲🇳 "+c.why),h("p",{class:"small",style:"margin:6px 0"},"💡 "+c.tip),
      h("button",{class:"btn",onclick:function(){start(c.id);}},"🎯 Энэ авиагаар дасгал хийх"));
  }
  function viewHome(root){
    var all=cats(),saved=env.sget(key(),null);
    if(S.show&&S.show.only){
      var R=S.show,n=R.n[R.only]||0,o=R.ok[R.only]||0;
      root.append(h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},o===n?"🏆":"💪"),h("b",null,o+" / "+n+" зөв")));
    }
    root.append(h("p",{class:"muted"},"Монгол хүнд онцгой хэцүү "+all.length+" төрлийн авиаг шалгана ("+all.length*2+" асуулт, ~3 мин). Дуусахад таны гол бэрхшээлийг тайлбар, дасгалтай нь харуулна."));
    root.append(h("button",{class:"btn primary",style:"width:100%",onclick:function(){start(null);}},saved?"🔁 Оношийг дахин хийх":"🩺 Онош эхлүүлэх"));
    if(!saved)return;
    var ranked=all.map(function(c){return {c:c,p:saved.r[c.id]==null?null:saved.r[c.id]};}).filter(function(x){return x.p!=null;}).sort(function(a,b){return a.p-b.p;});
    var weak=ranked.filter(function(x){return x.p<100;}).slice(0,3);
    root.append(h("h3",{style:"margin:18px 0 4px"},weak.length?"🎯 Таны гол бэрхшээл":"🏆 Бүх авиаг зөв ялгалаа!"),h("p",{class:"muted small"},new Date(saved.ts).toLocaleDateString()+"-ны оношоор"));
    weak.forEach(function(x){root.append(card(x.c,x.p));});
    var good=ranked.filter(function(x){return weak.indexOf(x)<0;});
    if(good.length)root.append(h("details",{class:"note",style:"margin-top:12px"},h("summary",{style:"font-weight:700;cursor:pointer"},"Бусад авиа ("+good.length+")"),
      good.map(function(x){return h("div",{class:"small",style:"display:flex;justify-content:space-between;margin-top:6px"},h("span",null,x.c.t),h("b",null,x.p+"%"));})));
  }
  window.PronDiag={
    has:function(lang){return !!DATA[lang];},
    weak:function(e){env=e;var s=env.sget(key(),null);if(!s)return null;var all=cats();return all.filter(function(c){return s.r[c.id]!=null&&s.r[c.id]<100;}).sort(function(a,b){return s.r[a.id]-s.r[b.id];}).slice(0,3).map(function(c){return c.t;});},
    view:function(e){
      env=e;h=e.h;var root=h("div");
      if(S.lang!==env.lang()){S.lang=env.lang();S.run=null;S.show=null;}
      root.append(h("button",{class:"back",onclick:function(){if(S.run){S.run=null;env.render();}else{S.show=null;env.close();}}},S.run?"‹ Зогсоох":"‹ Буцах"));
      root.append(h("h2",null,"🩺 Дуудлагын онош"));
      if(S.run)viewRun(root);else viewHome(root);
      return root;
    }
  };
})();
