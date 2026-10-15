/* Салхи: 🤟 дохионы хэл — Монгол дохионы хэл (МДХ) ба Америкийн дохионы хэл (ASL).
   МДХ: https://mnsl.mn (© Монгол дохионы хэл) — 1398 дохио, 35 хурууны үсэг, тоо. Зураг, видео файлыг хуулахгүй, шууд тоглуулахгүй (лицензгүй):
        дарсан үед тэдний дохионы хуудсыг апп дотор iframe-ээр нэг нэгээр нээж, видео тэнд тоглоно; индекс (гарчиг + хаяг) sign/msl-data.js-д sitemap-аас авсан, энэ хэсгийг нээхэд ачаална.
        Бүх дохионы видеоны зам (sign/msl-video.js), сэдэвчилсэн ангилал (sign/msl-topics.js) — REST /wp-json/wp/v2/ug-ээс; видео тэдний серверээс тоглоно.
        Нэмэлт: «Сонсголгүйн боловсрол / Mongolian Deaf Education» YouTube — дохионы сан, видео цуврал (sign/mde-data.js), албан ёсны embed-ээр.
   ASL: хурууны цагаан толгойн A–Z зураг — нийтийн өмч (wpclipart.com, Wikimedia Commons «Sign language A–Z.svg»), sign/asl/*.svg.
        Үгсийн видео — signasl.org (холбоос). Дасгал: үсэг таах, үг үсэглэх, нэрээ ASL-ээр.
        ASL University (Lifeprint) «ASLU Lesson 1–60» — YouTube @aslu, sign/aslu-data.js; албан ёсны embed-ээр, хичээл + дасгал.
   Үндсэн 48 үг: [ангилал, монгол, англи, signasl slug, МДХ дохионы дугаар | "too/<slug>" (цаг/тооны хэсэг) | null (тольд алга → толийг нээнэ),
   тайлбар (яг ижил биш ойролцоо дохио бол)]. Дохиог WordPress REST (/wp-json/wp/v2/ug|too?search=) бүтэн гарчгаар хайж сонгосон. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var WORDS=[
    ["👋 Мэндчилгээ","сайн байна уу","hello","hello",28],["👋 Мэндчилгээ","баярлалаа","thank you","thank-you",137],["👋 Мэндчилгээ","уучлаарай","sorry","sorry",56],
    ["👋 Мэндчилгээ","гуйя","please","please",54],["👋 Мэндчилгээ","тийм","yes","yes",1337],["👋 Мэндчилгээ","үгүй","no","no",1090],
    ["👋 Мэндчилгээ","баяртай (салахдаа)","goodbye","goodbye",240],["👋 Мэндчилгээ","нэр","name","name",1108],["👋 Мэндчилгээ","ойлгох","understand","understand",895],
    ["👨‍👩‍👧 Гэр бүл","ээж","mother","mother",29],["👨‍👩‍👧 Гэр бүл","аав","father","father",15],["👨‍👩‍👧 Гэр бүл","ах","brother","brother",303],
    ["👨‍👩‍👧 Гэр бүл","эгч","sister","sister",303],["👨‍👩‍👧 Гэр бүл","гэр бүл","family","family",210],["👨‍👩‍👧 Гэр бүл","хүүхэд","child","child",109],
    ["👨‍👩‍👧 Гэр бүл","найз","friend","friend",660],["👨‍👩‍👧 Гэр бүл","багш","teacher","teacher",197],
    ["🏠 Өдөр тутам","ус","water","water",null],["🏠 Өдөр тутам","хоол","food","food",778],["🏠 Өдөр тутам","идэх","eat","eat",431],
    ["🏠 Өдөр тутам","уух","drink","drink",481],["🏠 Өдөр тутам","жорлон","toilet","toilet",null],["🏠 Өдөр тутам","туслах","help","help",782],
    ["🏠 Өдөр тутам","гэр","home","home",188],["🏠 Өдөр тутам","сургууль","school","school",500],["🏠 Өдөр тутам","ажил","work","work",588],
    ["🏠 Өдөр тутам","эмч","doctor","doctor",1058],["🏠 Өдөр тутам","мөнгө","money","money",1180],["🏠 Өдөр тутам","унтах","sleep","sleep",19],
    ["❤️ Мэдрэмж","баяртай (баярласан)","happy","happy",161],["❤️ Мэдрэмж","гунигтай","sad","sad",581,"Ойролцоо дохио: харамсах, гашуудах"],["❤️ Мэдрэмж","хайртай","love","love",136],
    ["❤️ Мэдрэмж","ядрах","tired","tired",814],["❤️ Мэдрэмж","өлсөх","hungry","hungry",200],["❤️ Мэдрэмж","өвдөх","sick","sick",517],
    ["❤️ Мэдрэмж","сайн","good","good",665],["❤️ Мэдрэмж","муу","bad","bad",1397],
    ["❓ Асуулт","юу","what","what",1208],["❓ Асуулт","хэн","who","who",679],["❓ Асуулт","хаана","where","where",96],
    ["❓ Асуулт","хэзээ","when","when",880],["❓ Асуулт","яагаад","why","why",970],["❓ Асуулт","яаж","how","how",823],
    ["🕒 Цаг","өнөөдөр","today","today",957],["🕒 Цаг","маргааш","tomorrow","tomorrow","too/маргааш"],["🕒 Цаг","өчигдөр","yesterday","yesterday","too/өчигдөр"],
    ["🕒 Цаг","одоо","now","now",958],["🕒 Цаг","цаг","time","time",1025]
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
  var env=null,h=null,S={tab:"les",les:null,topic:null,series:null,q:"",name:"",nameA:"",quiz:null,spell:null,loading:false,open:null,from:""};
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function link(href,label,extra){return h("a",{class:"btn",href:href,target:"_blank",rel:"noopener",style:"text-decoration:none;"+(extra||"")},label);}
  function msl(){return window.MSL_DATA||null;}
  function loadMsl(){
    if(msl()||S.loading)return;S.loading=true;
    var v=window.SALKHI_BUILD?"?v="+window.SALKHI_BUILD:"";
    /* видеоны жагсаалт (msl-video.js) зэрэг ачаална; олдохгүй бол хуудсаар нь харуулна */
    var sv=document.createElement("script");sv.src="sign/msl-video.js"+v;document.head.appendChild(sv);
    /* сэдвүүд (msl-topics.js) — ачаалагдмагц сэдвийн хичээл, «Сэдвээр» хэсэг гарна */
    var st=document.createElement("script");st.src="sign/msl-topics.js"+v;st.onload=function(){env.render();};document.head.appendChild(st);
    /* Сонсголгүйн боловсрол (YouTube) — дохионы сан, видео цуврал */
    var sm=document.createElement("script");sm.src="sign/mde-data.js"+v;sm.onload=function(){env.render();};document.head.appendChild(sm);
    var s=document.createElement("script");s.src="sign/msl-data.js"+v;s.onload=function(){S.loading=false;S.ix=null;env.render();};
    s.onerror=function(){S.loading=false;S.err=true;env.render();};document.head.appendChild(s);
  }
  /* тухайн хуудасны гол видео (msl-video.js): https://mnsl.mn/<зам>/ → wp-content/uploads/<файл> */
  function vidFor(url){
    var m=window.MSL_VIDEO;if(!m)return null;
    var k=decodeURIComponent(url).replace(MSL,"").replace(/\/$/,"");
    return m[k]?MSL+"wp-content/uploads/"+m[k].split("/").map(encodeURIComponent).join("/"):null;
  }
  /* зөвхөн видео: апп өөрөө удирдана — хурдны товч, давталт; татаж авахыг хаасан (тэдний nodownload-ыг хүндэтгэнэ) */
  function videoBox(src,label){
    var v=h("video",{src:src,controls:true,playsinline:true,muted:true,autoplay:true,loop:true,preload:"metadata",controlslist:"nodownload",disablepictureinpicture:true,
      "aria-label":"Монгол дохионы хэл: "+label,style:"display:block;width:100%;aspect-ratio:4/3;border-radius:10px;background:#000"});
    v.addEventListener("contextmenu",function(e){e.preventDefault();});
    var rates=h("div",{class:"seg",role:"group","aria-label":"Видеоны хурд",style:"margin-top:6px"});
    [[0.5,"🐢 0.5×"],[0.75,"0.75×"],[1,"1×"]].forEach(function(r){
      var b=h("button",{type:"button","aria-pressed":String(r[0]===(S.rate||1)),onclick:function(){S.rate=r[0];v.playbackRate=r[0];
        Array.prototype.forEach.call(rates.children,function(x){x.setAttribute("aria-pressed",String(x===b));});}},r[1]);put(rates,b);});
    v.addEventListener("loadedmetadata",function(){v.playbackRate=S.rate||1;});
    return h("div",null,v,rates);
  }
  /* МДХ индекс: {n, slug, t (гарчиг)} */
  function ix(){
    if(S.ix)return S.ix;var d=msl();if(!d)return [];
    S.ix=d.ug.split("\n").map(function(s){return {n:parseInt(s,10),s:s,t:s.replace(/^\d+-/,"").replace(/-\d+$/,"").replace(/-/g," ")};});
    return S.ix;
  }
  function lurl(L){return MSL+"khuruu-useg/"+encodeURIComponent(L)+"/";}
  function ugURL(e){return MSL+"ug/"+encodeURIComponent(e.s)+"/";}
  function byNum(n){var a=ix();for(var i=0;i<a.length;i++)if(a[i].n===n)return a[i];return null;}
  function seen(k){var s=env.sget("signSeen",{})||{};if(!s[k]){s[k]=1;env.sset("signSeen",s);env.addXP(1);}}
  function translit(s){return String(s||"").toLowerCase().split("").map(function(c){return TR[c]!=null?TR[c]:c;}).join("").replace(/[^a-z]/g,"");}
  function img(c,size){return h("img",{src:"sign/asl/"+c+".svg",alt:"ASL үсэг "+c.toUpperCase(),width:String(size||64),height:String(size||64),loading:"lazy",style:"width:"+(size||64)+"px;height:"+(size||64)+"px;object-fit:contain;background:#fff;border-radius:10px;border:1px solid var(--line)"});}
  /* ---------- 🇲🇳 МДХ ---------- */
  /* mnsl.mn-ийн тухайн дохионы хуудсыг апп дотор цонх болгон (iframe) бүтнээр нь харуулна — видео,
     хурд, гарын хэлбэр/байрлал/хөдөлгөөний зураг тэдний сайт дээр, тэдний брэнд, холбоостойгоо тоглоно. Видео файлыг шууд
     (<video src=…mp4>) тоглуулахгүй — зохиогчийн эрх эзэмшигчийн зөвшөөрөлгүй. Сайт iframe-ийг хориглоогүй (X-Frame-Options байхгүй).
     Нэг удаад нэг л цонх (S.open), дарсан үед л ачаална.
     ⚠️ sandbox-д allow-scripts БАЙХГҮЙ: тэдний pagelink.js нь хуудсан дээр хажуу тийш шудрах (Hammer swipe) ба ←/→ товчоор
     дараагийн/өмнөх дохио руу шилждэг — хурдны гулсуур чирэх, видео гүйлгэхэд санамсаргүй шилжиж байсан (хэрэглэгчийн мэдэгдсэн алдаа).
     Скриптгүй үед видео хөтчийн өөрийн удирдлагаар тоглоно (хурд: ⋮ цэс); тэдний «Видеоны хурд» гулсуур ажиллахгүй. */
  function card(url,label,inLesson){
    var w=h("div",{class:"note",style:"margin:6px 0 10px;padding:8px"}),letter=url.indexOf("/khuruu-useg/")>0,vsrc=vidFor(url);
    var frame=function(src,title,hgt,bg){return h("iframe",{src:src,title:title,allow:"autoplay; fullscreen",allowfullscreen:true,
        sandbox:"allow-same-origin allow-popups allow-popups-to-escape-sandbox",referrerpolicy:"strict-origin-when-cross-origin",
        style:"display:block;width:100%;height:"+hgt+";border:0;border-radius:10px;background:"+bg});};
    var hint="Хурдыг видеоны ⋮ → Тоглуулах хурд (Playback speed)-аас тохируулна — «Видеоны хурд» гулсуур энд ажиллахгүй.";
    /* видео: msl-video.js-д байвал зөвхөн видео (апп удирдана), үгүй бол тэдний хуудсыг бүтнээр (хайлтын бусад дохио) */
    var vid=vsrc?videoBox(vsrc,label):frame(url,"Монгол дохионы хэл: "+label+(letter?" (видео)":""),"560px","#1b1f22");
    if(letter){
      /* хурууны үсэг: 📷 зураг (албан ёсны embed карт — гарын хэлбэр) ба 🎥 видео зэрэгцээ.
         Өргөн дэлгэцэд хажуу хажуугаар, утсанд (картын өргөн 448px-ээс бага) дээр доор нь — хэт жижиг болохоос сэргийлнэ. */
      var grid=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;align-items:start"});
      put(grid,h("div",null,h("div",{class:"small",style:"font-weight:700;margin:0 0 4px"},"📷 Гарын хэлбэр"),frame(url+"embed/","Монгол дохионы хэл: "+label+" (зураг)","300px","#fff")),
        h("div",null,h("div",{class:"small",style:"font-weight:700;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"},"🎥 Видео"),vid));
      put(w,grid);
      if(!vsrc)put(w,h("div",{class:"muted small",style:"margin-top:4px"},"Видео нь хуудасны зурагны доор байрлана — цонх дотроо доош гүйлгэнэ. "+hint));
    }else{
      if(!vsrc)put(w,h("div",{class:"small",style:"margin:0 0 6px"},"▶ дарж тоглуулна. "+hint));
      put(w,vid);
    }
    put(w,
      h("div",{class:"row",style:"margin-top:6px"},
        inLesson?null:h("button",{class:"btn ghost",onclick:function(){S.open=null;env.render();}},"✕ Хаах"),
        h("a",{class:"btn ghost",href:url,target:"_blank",rel:"noopener",style:"text-decoration:none"},"↗ mnsl.mn дээр")),
      h("div",{class:"muted small",style:"margin-top:4px"},"Видео, зураг: «Монгол дохионы хэл» цахим толь (",h("a",{href:url,target:"_blank",rel:"noopener"},"mnsl.mn"),")"+(vsrc?". Гарын хэлбэр, ижил утгатай дохиог тэдний хуудаснаас үзнэ.":" — тэдний хуудас апп дотор нээгдэж байна.")));
    return w;
  }
  function toggle(url,key,from){S.open=S.open===url&&S.from===(from||"")?null:url;S.from=from||"";S.spellI=0;if(S.open)seen(key);env.render();}
  /* from: аль хэсгээс нээсэн (search / basic) — ижил дохио хоёр газар байвал карт зөвхөн дарсан газарт гарна */
  function row(url,key,main,sub,icon,from){
    var open=S.open===url&&S.from===from;
    return h("button",{class:"lrow",type:"button","aria-expanded":String(open),style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"+(open?";border-color:var(--sky)":""),onclick:function(){toggle(url,key,from);}},
      icon?h("span",{class:"hexb ico"},icon):null,h("span",{style:"flex:1"},main,sub?h("div",{class:"muted small"},sub):null),h("span",{"aria-hidden":"true"},open?"▾":"▶️"));
  }
  /* ---------- 📖 Хичээл (МДХ) ----------
     Хичээл бүр: зөвлөгөө → дохио нэг нэгээр (видео) → дасгал (видео харж утгыг сонгох). 80%+ бол дууссан, ⭐ хадгална (signLessons).
     items: [монгол, mnsl зам (ug/… | too/… | khuruu-useg/…)]. ах/эгч ижил дохио (303) тул дасгалд ижил видеотой сонголт гаргахгүй. */
  var LESSONS=null;
  /* 🆘 Амьдралд хэрэгтэй дохио: нөхцөл байдлаар. Эх: тоо — mnsl.mn-ийн дохионы дугаар, "yt:<id>" — Сонсголгүйн боловсрол (YouTube),
     "spell:<үг>" — тольд тусдаа дохиогүй тул хуруугаар үсэглэнэ (дасгалд орохгүй). ex: [өгүүлбэр, [дохионы нэрс дарааллаар]] — дохионы дараалал ойролцоо. */
  var LIFE=[
    {id:"life1",ico:"🆘",t:"Яаралтай үед",tip:"Яаралтай үед дохиог томоор, тод, нүүрний хувирлаар хийнэ. Сонсголгүй хүнд хандахдаа мөрөн дээр нь зөөлөн хүрч эсвэл гараа даллаж анхаарлыг нь татна.",
     items:[["тусламж",782],["хэрэгтэй",743],["дуудах",1],["эмч",1058],["эмнэлэг",1034],["өвдөх",517],["цагдаа",132],["гал түймэр",260],["хурдан",186],["айх",526],["болохгүй",1213],["эм","spell:эм"]],
     ex:[["Тусламж хэрэгтэй!",["тусламж","хэрэгтэй"]],["Эмч дуудаарай, хурдан!",["эмч","дуудах","хурдан"]],["Цагдаа дуудаарай!",["цагдаа","дуудах"]],["Гал гарлаа, хурдан!",["гал түймэр","хурдан"]],["Эм хэрэгтэй.",["эм","хэрэгтэй"]]]},
    {id:"life2",ico:"🏪",t:"Дэлгүүрт",tip:"Үнийг асуухдаа барааг заагаад «хэд» гэж дохиогоод асуусан царай гаргана. Тоог тоон дохиогоор эсвэл утсан дээрээ бичиж харуулж болно.",
     items:[["дэлгүүр",60],["авах",316],["хэд, хэчнээн",327],["үнэтэй",571],["хямд",1161],["мөнгө",1180],["төлөх",553],["хэрэгтэй",1164],["хэрэггүй",1163],["банк","spell:банк"]],
     ex:[["Энэ хэд вэ?",["хэд, хэчнээн"]],["Үнэтэй байна, хямд нь байна уу?",["үнэтэй","хямд"]],["Мөнгөөр төлнө.",["мөнгө","төлөх"]],["Надад хэрэггүй.",["хэрэггүй"]],["Банк хаана байна?",["банк"]]]},
    {id:"life3",ico:"🚌",t:"Тээвэрт",tip:"Чиглэлийг гараараа заахад болно — дохионы хэлэнд орон зай чухал. Хаягаа утсан дээрээ бичиж харуулбал илүү ойлгомжтой.",
     items:[["автобус",479],["такси",153],["галт тэрэг",34],["онгоц",1360],["явах",103],["ирэх",146],["зогсох",51],["хүлээх",965],["хаана",96],["ойр",971],["хол",2]],
     ex:[["Автобус хаана зогсдог вэ?",["автобус","зогсох","хаана"]],["Такси хүлээж байна.",["такси","хүлээх"]],["Хол уу, ойр уу?",["хол","ойр"]],["Галт тэрэг хэзээ ирэх вэ?",["галт тэрэг","ирэх"]]]},
    {id:"life4",ico:"💬",t:"Ойлголцох",tip:"Ойлгоогүй бол ичихгүйгээр «дахин», «удаан» гэж дохиол. Бичиж харилцах нь ч зүгээр — утас, цаас ашигла.",
     items:[["би","yt:Jr5J19NNEWs"],["та","yt:9hZZ5jT9-tI"],["сонсголгүй",255],["дохионы хэл",277],["мэдэх",896],["ойлгох",895],["ойлгохгүй",1062],["дахин",940],["удаан",63],["бичих",1195],["утас",1373],["хаяг","spell:хаяг"]],
     ex:[["Би сонсголгүй.",["би","сонсголгүй"]],["Та дохионы хэл мэдэх үү?",["та","дохионы хэл","мэдэх"]],["Ойлгосонгүй, дахиад удаан.",["ойлгохгүй","дахин","удаан"]],["Бичиж өгөөч.",["бичих"]],["Таны хаяг?",["та","хаяг"]]]},
    {id:"life5",ico:"🙏",t:"Эелдэг үг ба хэрэгцээ",tip:"Эелдэг үгийг инээмсэглэлтэй хийнэ. «Ус», «жорлон» тольд тусдаа дохиогүй тул хуруугаар үсэглэдэг.",
     items:[["сайн байна уу",28],["баярлалаа",137],["уучлаарай",56],["гуйх",54],["тийм",1337],["үгүй",1090],["болно",432],["баяртай",240],["ус","spell:ус"],["жорлон","spell:жорлон"]],
     ex:[["Тийм, болно.",["тийм","болно"]],["Үгүй, баярлалаа.",["үгүй","баярлалаа"]],["Уучлаарай, жорлон?",["уучлаарай","жорлон"]],["Ус гуйя.",["ус","гуйх"]]]}
  ];
  var LIFEL=null;
  function lifeLessons(){
    if(LIFEL)return LIFEL;if(!msl())return [];
    LIFEL=LIFE.map(function(d){
      var items=d.items.map(function(x){var v=x[1];
        if(typeof v==="number"){var e=byNum(v);return e?[x[0],"ug/"+e.s,v]:null;}
        return [x[0],v,v,v.indexOf("spell:")===0];}).filter(Boolean);
      return {id:d.id,t:d.ico+" "+d.t,tip:d.tip,items:items,ex:d.ex,cr:"Сонсголгүйн боловсрол / Mongolian Deaf Education"};});
    LIFEL.forEach(function(l,k){l.nx=LIFEL[k+1]||null;});
    return LIFEL;
  }
  function lessons(){
    if(LESSONS)return LESSONS;
    var tips={"👋 Мэндчилгээ":"Дохионы хэлэнд нүүрний хувирал дүрэм шиг үүрэгтэй: баярлалаа гэхдээ инээмсэглэж, уучлаарай гэхдээ харамссан царай гаргана. Ярилцагчийнхаа нүд рүү харж байх нь эелдэг ёс.",
      "👨‍👩‍👧 Гэр бүл":"Монгол дохионы хэлэнд «ах» ба «эгч» нэг дохиотой — «насаар ах». Хүйсийг нь шаардлагатай бол тусад нь заана.",
      "🏠 Өдөр тутам":"Тольд тусдаа дохиогүй үгийг (ус, жорлон гэх мэт) хуруугаар үсэглэдэг. Энэ хичээлд дохиотой үгсийг үзнэ.",
      "❤️ Мэдрэмж":"Мэдрэмжийн дохиог нүүрний хувиралгүй хийвэл утга нь сулардаг. Ядарсан бол ядарсан, баярласан бол баярласан царай гарга.",
      "❓ Асуулт":"Асуултын үгийг ихэвчлэн өгүүлбэрийн төгсгөлд хэлж, хөмсгөө зангидан асуудаг (ж: «нэр чинь юу?» → НЭР ЧИ ЮУ).",
      "🕒 Цаг":"Цаг хугацааг ихэвчлэн өгүүлбэрийн эхэнд хэлнэ: «маргааш сургууль явна» → МАРГААШ СУРГУУЛЬ ЯВАХ. Ирээдүйг урагш, өнгөрснийг хойш заадаг."};
    var L=[],cats={};
    WORDS.forEach(function(w){
      var p=typeof w[4]==="number"?(function(){var e=byNum(w[4]);return e?"ug/"+e.s:null;})():w[4];
      if(!p)return;
      if(!cats[w[0]]){cats[w[0]]={id:"c"+L.length,t:w[0],tip:tips[w[0]]||"",items:[]};L.push(cats[w[0]]);}
      cats[w[0]].items.push([w[1],p,w[4]]);
    });
    var too=msl().too.split("\n");
    var num=function(a,b){return too.slice(a,b+1).map(function(s){return [s.replace(/-\d+$/,"").replace(/-/g," "),"too/"+s,s];});};
    L.push({id:"n1",t:"🔢 Тоо 0–10",tip:"Тоог нэг гараар, алгаа өөр рүүгээ харуулан үзүүлдэг. 0–5-ыг хуруу дэлгэж тоолно — гарын хэлбэрийг анхааралтай ажигла.",items:num(0,10)});
    L.push({id:"n2",t:"🔢 Тоо 11–20",tip:"Арвын тоо: эхлээд «арав»-ыг, дараа нь нэгжийг хослуулан үзүүлдэг. Видеог 0.5× хурдаар үзэж хөдөлгөөнийг нь ажигла.",items:num(11,20)});
    var ls=msl().letters,parts=[[0,9],[9,18],[18,27],[27,ls.length]];
    parts.forEach(function(r,k){var g=ls.slice(r[0],r[1]);
      L.push({id:"a"+(k+1),t:"🔤 Үсэг "+g[0].toUpperCase()+"–"+g[g.length-1].toUpperCase(),
        tip:k===0?"Хурууны цагаан толгой (дактиль)-аар нэр, газрын нэр зэрэг дохиогүй үгийг үсэглэнэ. Гараа мөрний өндөрт, ярилцагч руугаа харуулж барина.":"Төстэй үсгүүдийг ялгахдаа эрхий хурууны байрлалд анхаар. Сурсан үсгээрээ нэрээ үсэглэж дадлага хийгээрэй.",
        items:g.map(function(c){return [c.toUpperCase(),"khuruu-useg/"+c,c];})});});
    L.forEach(function(l,k){l.nx=L[k+1]||null;});
    LESSONS=L;return L;
  }
  /* ---- mnsl.mn-ийн бүх дохио сэдвээр (msl-topics.js: {id, t, g (бүлэг), s: "дугаар|гарчиг" мөрүүд}) ----
     Сэдэв бүрийг 10 дохиотой хэсэг (хичээл) болгоно. Цөөн дохиотой сэдэвт (<4) дасгалын буруу сонголтыг ижил бүлгээс авна. */
  var TICO={1:"💬",2:"👋",3:"🎓",4:"💼",5:"🩺",6:"❤️",7:"🏠",8:"👕",9:"🍎",10:"🎨",11:"🐾",12:"🌳",13:"🕒",14:"💻",15:"⚽",16:"🎲",17:"🎵",18:"🚗",19:"🏛",20:"🗺",21:"🔢",22:"🧮"};
  var TOPICS=null;
  function topics(){
    if(TOPICS)return TOPICS;var T=window.MSL_TOPICS;if(!T||!msl())return null;
    var grp={};
    TOPICS=T.map(function(t){
      var n=parseInt(t.t,10),name=t.t.replace(/^[\d.]+\s*/,""),items=[];
      t.s.split("\n").forEach(function(l){var b=l.indexOf("|"),lab=l.slice(b+1);
        if(l.indexOf("too/")===0){items.push([lab,l.slice(0,b),l.slice(0,b)]);return;}
        var k=parseInt(l,10),e=byNum(k);if(e)items.push([lab,"ug/"+e.s,k]);});
      var o={id:t.id,n:n,ico:TICO[n]||"🤟",t:name,g:t.g.replace(/^[\d.]+\s*/,"")||name,items:items,parts:[]};
      (grp[n]=grp[n]||[]).push(o);return o;});
    TOPICS.forEach(function(o){
      var pool=null;if(o.items.length<4){pool=[];grp[o.n].forEach(function(x){pool=pool.concat(x.items);});if(pool.length<4)pool=pool.concat(TOPICS[0].items);}
      mkParts(o,"t",pool,"Видеог 0.5× хурдаар үзэж гарын хэлбэр, байрлал, хөдөлгөөнийг ажиглаад өөрөө давтаарай.");
    });
    return TOPICS;
  }
  /* сэдвийг ≤10 дохиотой хэсэг (хичээл) болгоно; хэсэг бүр nx-ээр дараагийнхтай холбогдоно */
  function mkParts(o,pre,pool,tip){
    var np=Math.ceil(o.items.length/10),sz=Math.ceil(o.items.length/np);o.parts=[];
    for(var p=0;p<np;p++)o.parts.push({id:pre+o.id+"-"+(p+1),t:o.ico+" "+o.t+(np>1?" ("+(p+1)+"/"+np+")":""),items:o.items.slice(p*sz,(p+1)*sz),pool:pool||o.items,topic:o,ar:o.ar,loose:o.loose,cr:o.cr,tip:tip});
    o.parts.forEach(function(l,k){l.nx=o.parts[k+1]||null;});
  }
  /* «Mongolian Deaf Education / Сонсголгүйн боловсрол» YouTube (mde-data.js): vocab — нэг видео = нэг дохио; series — урт хичээл */
  var MDE=null,MDE_URL="https://www.youtube.com/@MongolianDeafEducation";
  function mde(){
    if(MDE)return MDE;var D=window.MDE_DATA;if(!D)return null;
    MDE={vocab:D.vocab.map(function(v,k){
        var o={id:"d"+k,n:0,ico:v.ico,t:v.t,g:"Сонсголгүйн боловсрол",ar:v.ar,pl:v.pl,cr:"Сонсголгүйн боловсрол / Mongolian Deaf Education",
          items:v.s.split("\n").map(function(l){var b=l.indexOf("|");return [l.slice(b+1),"yt:"+l.slice(0,b),"yt:"+l.slice(0,b)];})};
        mkParts(o,"",null,"«"+v.t+"» — Сонсголгүйн боловсрол (Mongolian Deaf Education) сувгийн дохионы сан. «Хувилбар» гэдэг нь нэг үгийг дохиолох өөр арга.");
        return o;}),
      series:D.series.map(function(v,k){return {k:k,ico:v.ico,t:v.t,pl:v.pl,items:v.s.split("\n").map(function(l){var a=l.split("|");return {id:a[0],t:a[1],len:a[2]};})};})};
    return MDE;
  }
  /* ASL University (Lifeprint) «ASLU Lesson 1–60» (aslu-data.js): видео бүр нэг дохио эсвэл дасгалын өгүүлбэр (ASL gloss, англиар).
     loose: дасгалын хариултад хаалтан доторх тайлбарыг хасна — «BUS (fingerspelled)» ба «BUS (V-hand-version)» нэг хариулт. |L — урт өгүүлэмж, дасгалд орохгүй. */
  var ASLU=null;
  function aslu(){
    if(ASLU)return ASLU;var D=window.ASLU_DATA;if(!D)return null;
    ASLU=D.map(function(v,k){
      var o={id:"u"+(k+1),n:k+1,ico:"🇺🇸",t:"ASLU Lesson "+(k+1),g:"ASL University",ar:"16/9",pl:v.pl,loose:true,cr:"Dr. Bill Vicars — ASL University (Lifeprint.com)",
        items:v.s.split("\n").map(function(l){var a=l.split("|");return [a[1],"yt:"+a[0],"yt:"+a[0],a[2]==="L"];})};
      mkParts(o,"",null,"ASL University-ийн "+(k+1)+"-р хичээл. Гарчиг нь ASL gloss (англиар): ТОМ үсгээр — дохио, жижиг үсгээр — тайлбар. Эхэнд нь үг, сүүлд нь дасгалын өгүүлбэр байна.");
      return o;});
    return ASLU;
  }
  function loadAslu(){if(window.ASLU_DATA||S.aLoading)return;S.aLoading=true;var v=window.SALKHI_BUILD?"?v="+window.SALKHI_BUILD:"";
    var sc=document.createElement("script");sc.src="sign/aslu-data.js"+v;sc.onload=function(){S.aLoading=false;env.render();};sc.onerror=function(){S.aLoading=false;S.aErr=true;env.render();};document.head.appendChild(sc);}
  /* ---------- 🌍 Дэлхийн дохионы хэлүүд (sign/world-data.js): апп-ын хэл бүрийн дохионы хэл ---------- */
  function world(){return window.SIGN_WORLD||null;}
  function loadWorld(){if(window.SIGN_WORLD||S.wLoading)return;S.wLoading=true;var v=window.SALKHI_BUILD?"?v="+window.SALKHI_BUILD:"";
    var sc=document.createElement("script");sc.src="sign/world-data.js"+v;sc.onload=function(){S.wLoading=false;env.render();};sc.onerror=function(){S.wLoading=false;S.wErr=true;env.render();};document.head.appendChild(sc);}
  /* латин үсгээр (BSL, DGS) нэрийг үсэглэх: DGS-д SCH, Ä Ö Ü тусдаа тэмдэг */
  function spellLatin(L,key,txt){
    var map={};L.abc.forEach(function(a){map[a[0]]=a;});
    var s=String(txt||"").toUpperCase().replace(/[^A-ZÄÖÜß ]/g,""),out=[];
    for(var i=0;i<s.length;i++){
      if(s[i]===" "){out.push(null);continue;}
      if(key==="dgs"&&s.substr(i,3)==="SCH"&&map.SCH){out.push(map.SCH);i+=2;continue;}
      var c=s[i]==="ß"?"S":s[i];
      if(map[c])out.push(map[c]);else if(key!=="dgs"&&"ÄÖÜ".indexOf(c)>=0)out.push(map[{"Ä":"A","Ö":"O","Ü":"U"}[c]]);
    }
    return out;
  }
  /* товчлол: «日本手話 (Nihon Shuwa, JSL)» → JSL */
  function ab(L){var m=/\(([^)]+)\)/.exec(L.native);return m?m[1].split(", ").pop():L.native;}
  function viewWorld(root){
    var W=world();
    if(!W){put(root,h("p",{class:"muted"},S.wErr?"Ачаалж чадсангүй. Интернэтээ шалгана уу.":"Ачаалж байна…"));loadWorld();return;}
    var keys=["bsl","jsl","ksl","csl","rsl","dgs"];
    if(!S.wl)S.wl=W.langs[env.lang()]||"bsl";
    put(root,h("p",{class:"muted"},"Хэл бүр өөрийн дохионы хэлтэй — англи хэлтэй орнуудад ч ASL, BSL хоёр тэс өөр. Таны сурч буй хэлний орны дохионы хэл:"));
    if(env.lang()==="ug")put(root,h("p",{class:"note small"},"Уйгур хэлний дохионы хэлний нээлттэй толь олдсонгүй — доорх хэлүүдээс сонгоно уу."));
    var chips=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 12px"});
    keys.forEach(function(k){var L=W.list[k];put(chips,h("button",{class:"chip","aria-pressed":String(S.wl===k),onclick:function(){S.wl=k;S.wName="";env.render();}},L.flag+" "+ab(L)));});
    put(root,chips);
    var L=W.list[S.wl];
    put(root,h("div",{class:"note"},h("div",{style:"display:flex;gap:10px;align-items:center"},h("span",{style:"font-size:34px","aria-hidden":"true"},L.flag),
      h("div",null,h("b",{style:"font-size:17px"},L.name),h("div",{class:"muted small"},L.native))),
      h("ul",{style:"margin:8px 0 0;padding-left:18px"},L.facts.map(function(f){return h("li",{style:"margin:3px 0"},f);}))));
    /* хурууны үсэг */
    put(root,h("h3",{style:"margin:16px 0 6px"},"🔤 Хурууны үсэг"));
    if(L.abc){
      var g=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px"});
      L.abc.forEach(function(a){put(g,h("div",{style:"text-align:center"},h("img",{src:a[1],alt:L.name+" хурууны үсэг "+a[0],loading:"lazy",style:"width:100%;max-width:76px;aspect-ratio:3/4;object-fit:contain;background:#fff;border-radius:10px;border:1px solid var(--line)"}),h("div",{style:"font-weight:800"},a[0])));});
      put(root,g);
    }else if(L.chart){
      put(root,h("img",{src:L.chart,alt:L.chartAlt||"",loading:"lazy",style:"width:100%;border-radius:12px;border:1px solid var(--line)"}));
    }
    if(L.abcNote)put(root,h("p",{class:"muted small"},L.abcNote));
    if(L.abcCredit)put(root,h("p",{class:"muted small",style:"margin:4px 0 0"},L.abcCredit));
    /* нэрээ үсэглэх (латин үсэгтэй дохионы хэлүүд) */
    if(S.wl==="bsl"||S.wl==="dgs"){
      var inp=h("input",{class:"tin",value:S.wName||"",placeholder:"Нэрээ латинаар бич: Bat",maxlength:"20","aria-label":"Нэр (латин)",autocomplete:"off",style:"margin-top:12px"});
      var out=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"});
      var paint=function(){out.textContent="";S.wName=inp.value;spellLatin(L,S.wl,inp.value).forEach(function(a){
        if(!a){put(out,h("span",{style:"width:14px"}));return;}
        put(out,h("div",{style:"text-align:center"},h("img",{src:a[1],alt:a[0],style:"width:56px;height:74px;object-fit:contain;background:#fff;border-radius:8px;border:1px solid var(--line)"}),h("div",{class:"small",style:"font-weight:800"},a[0])));});};
      inp.addEventListener("input",paint);put(root,h("b",{style:"display:block;margin-top:14px"},"✍️ Нэрээ "+ab(L)+"-ээр үсэглэх"),inp,out);paint();
    }
    /* 48 үндсэн үг → толь бичгийн видео (шинэ таб) */
    put(root,h("h3",{style:"margin:18px 0 4px"},"🎬 48 үндсэн үг"));
    /* апп дотор: vid (өөрийн сервер дээрх CC видео) → frame (iframe зөвшөөрдөг толь) → эс бөгөөс шинэ цонх */
    var how=L.vid?"🎬 тэмдэгтэй үгийн видео апп дотор тоглоно ("+L.vid.src+"), бусад нь "+L.dict.name+" шинэ цонхонд."
      :L.frame?"Дарахад "+L.frame.name+" апп дотор нээгдэнэ."
      :"Дарахад "+L.dict.name+" шинэ цонхонд нээгдэнэ — энэ толь апп дотор нээгдэхийг зөвшөөрдөггүй, өөр нээлттэй видео толь олдсонгүй.";
    put(root,h("p",{class:"muted small",style:"margin:0 0 8px"},how));
    var cat=null,list=h("div");
    WORDS.forEach(function(w,i){
      var nat=L.words[i];if(!nat)return;
      if(w[0]!==cat){cat=w[0];put(list,h("div",{class:"muted small",style:"font-weight:800;margin:10px 0 4px"},cat));}
      var v=L.vid&&L.vid.map[nat],inApp=!!(v||L.frame),key=S.wl+":"+i,open=S.wOpen===key;
      var label=h("span",{style:"flex:1;min-width:0"},h("div",{class:"t"},nat),h("div",{class:"muted small"},w[1]));
      if(!inApp){
        put(list,h("a",{class:"lrow",href:L.dict.url(nat),target:"_blank",rel:"noopener",style:"text-decoration:none;color:inherit;margin-top:6px"},label,h("span",{"aria-hidden":"true"},"🔗")));
        return;
      }
      put(list,h("button",{class:"lrow",type:"button","aria-expanded":String(open),style:"margin-top:6px",onclick:function(){S.wOpen=open?null:key;env.render();}},label,h("span",{"aria-hidden":"true"},open?"▾":"🎬")));
      if(!open)return;
      if(v){
        var vd=h("video",{src:L.vid.dir+v[0],controls:"",autoplay:"",muted:"",loop:"",playsinline:"",preload:"auto",style:"width:100%;max-height:60vh;border-radius:12px;background:#000"});
        vd.muted=true;vd.playbackRate=S.rate||1;
        setTimeout(function(){if(vd.isConnected){vd.playbackRate=S.rate||1;var p=vd.play();if(p&&p.catch)p.catch(function(){});}},0);
        put(list,h("div",{class:"note",style:"margin:6px 0 4px"},vd,
          h("div",{class:"seg",style:"margin:8px 0 0"},[0.5,0.75,1].map(function(r){return h("button",{"aria-pressed":String((S.rate||1)===r),onclick:function(){S.rate=r;vd.playbackRate=r;[].forEach.call(this.parentNode.children,function(b){b.setAttribute("aria-pressed",String(b===this));},this);}},r+"×");})),
          h("div",{class:"muted small",style:"margin-top:6px"},"Видео: ",h("a",{href:v[3],target:"_blank",rel:"noopener"},v[2]),", ",L.vid.src,", ",
            h("a",{href:"https://creativecommons.org/licenses/"+v[1].replace(/\/de$/,"/de")+"/",target:"_blank",rel:"noopener"},"CC "+v[1].toUpperCase()))));
      }else{
        put(list,h("div",{class:"note",style:"margin:6px 0 4px;padding:6px"},
          h("iframe",{src:L.frame.url(nat),title:L.frame.name+": "+nat,loading:"lazy",referrerpolicy:"no-referrer",style:"width:100%;height:min(560px,70vh);border:0;border-radius:10px;background:#fff"}),
          h("div",{class:"muted small",style:"margin-top:6px;display:flex;gap:8px;align-items:center"},h("span",{style:"flex:1"},"Эх сурвалж: "+L.frame.name),
            h("a",{href:L.frame.url(nat),target:"_blank",rel:"noopener"},"Шинэ цонхонд ↗"))));
      }
    });
    put(root,list);
    put(root,h("p",{class:"muted small",style:"margin-top:12px"},"Орчуулга, мэдээллийг Claude бэлдсэн — тухайн орны дохионы хэлний багшаар шалгуулаагүй."));
  }
  function topicById(id){var T=(topics()||[]).concat(mde()?mde().vocab:[],aslu()||[]);for(var i=0;i<T.length;i++)if(T[i].id===id)return T[i];return null;}
  /* YouTube embed: autoplay (дуугүй), давталттай. quiz=true бол дээд талын гарчгийг (хариуг) далдална */
  function ytSign(id,label,ar,quiz){
    var w=h("div",{style:"position:relative;margin:0 auto;max-width:"+(ar==="4/5"?"340px":"520px")});
    put(w,h("iframe",{src:"https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&mute=1&loop=1&playlist="+id+"&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3",title:"Дохионы хэл: "+label,
        allow:"autoplay; encrypted-media; picture-in-picture; fullscreen",allowfullscreen:true,referrerpolicy:"strict-origin-when-cross-origin",
        style:"display:block;width:100%;aspect-ratio:"+(ar||"16/9")+";height:auto;border:0;border-radius:10px;background:#000"}),
      quiz?h("div",{"aria-hidden":"true",style:"position:absolute;left:0;right:0;top:0;height:64px;background:#000;border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px"},"?"):null);
    return w;
  }
  /* тольд дохиогүй үг: үсэг бүрийн гарын хэлбэрийг mnsl.mn-ийн хурууны үсгээр дараалуулан (S.spellI) */
  function spellMedia(word){
    var lets=String(word).toLowerCase().split("").filter(function(c){return msl().letters.indexOf(c)>=0;}),i=Math.max(0,Math.min(lets.length-1,S.spellI||0));
    var box=h("div",{class:"note",style:"margin:0;padding:8px"});
    var chips=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px"});
    lets.forEach(function(c,k){put(chips,h("button",{class:"chip",type:"button","aria-pressed":String(k===i),style:"font-weight:800;margin:0"+(k===i?";border-color:var(--sky);background:color-mix(in srgb,var(--sky) 14%,var(--surface))":""),onclick:function(){S.spellI=k;env.render();}},c.toUpperCase()));});
    put(box,h("div",{class:"small",style:"margin-bottom:6px"},"✋ Тольд тусдаа дохио алга — хуруугаар үсэглэнэ: "+(i+1)+" / "+lets.length+" үсэг"),chips,card(lurl(lets[i]),"«"+lets[i].toUpperCase()+"» үсэг",true),
      h("div",{class:"row"},h("button",{class:"btn",disabled:i===0,onclick:function(){S.spellI=i-1;env.render();}},"‹ Үсэг"),h("button",{class:"btn",disabled:i>=lets.length-1,onclick:function(){S.spellI=i+1;env.render();}},"Үсэг ›")));
    return box;
  }
  function media(it,ar,quiz){
    if(it[1].indexOf("spell:")===0)return spellMedia(it[1].slice(6));
    if(it[1].indexOf("yt:")===0)return ytSign(it[1].slice(3),quiz?"?":it[0],ar,quiz);
    var u=pathURL(it[1]),src=vidFor(u);return src?videoBox(src,quiz?"?":it[0]):card(u,quiz?"?":it[0],true);
  }
  function pathURL(p){return MSL+p.split("/").map(encodeURIComponent).join("/")+"/";}
  function lprog(){return env.sget("signLessons",{})||{};}
  function startLesson(les){S.les={l:les,step:"learn",i:0};S.spellI=0;env.render();window.scrollTo(0,0);}
  function base(t,loose){t=String(t).replace(/\s*\(хувилбар \d\)$/,"");return loose?t.replace(/\s*\([^)]*\)/g,"").trim()||t:t;}
  function startLQuiz(){
    var les=S.les.l,its=les.items,lz=les.loose,B=function(t){return base(t,lz);};
    var qi=its.filter(function(x){return !x[3];});if(!qi.length)qi=its;
    var qs=shuffle(qi).slice(0,Math.min(8,qi.length)).map(function(it){
      var others=shuffle((les.pool||its).filter(function(x){return x[2]!==it[2]&&!x[3]&&B(x[0]).toLowerCase()!==B(it[0]).toLowerCase();})),o=[],seenS={};
      others.forEach(function(x){var bx=B(x[0]);if(o.length<3&&!seenS[bx.toLowerCase()]){seenS[bx.toLowerCase()]=1;o.push(bx);}});
      return {it:it,a:B(it[0]),o:shuffle([B(it[0])].concat(o)),p:null};});
    S.les={l:les,step:"quiz",qs:qs,i:0,ok:0};env.render();window.scrollTo(0,0);
  }
  function lessonView(root){
    var Ls=S.les,les=Ls.l,its=les.items;
    put(root,h("h3",{style:"margin:4px 0 6px"},les.t));
    if(Ls.step==="learn"){
      var i=Ls.i,it=its[i];
      /* утсанд: зөвлөгөө жижиг, дохионы жагсаалт нэг мөрөнд хажуу тийш гүйлгэнэ (богино нэрээр), видео дэлгэцэд багтана */
      if(i===0)put(root,h("div",{class:"note small",style:"margin:0 0 8px;padding:8px 10px;font-size:13px;line-height:1.45"},"💡 "+les.tip));
      put(root,h("div",{style:"display:flex;align-items:center;gap:8px;margin:0 0 6px"},
        h("div",{style:"flex:1;height:6px;border-radius:4px;background:var(--line);overflow:hidden"},h("div",{style:"height:100%;width:"+Math.round((i+1)*100/its.length)+"%;background:var(--sky)"})),
        h("span",{class:"muted small",style:"white-space:nowrap;font-weight:700"},(i+1)+" / "+its.length)));
      var dots=h("div",{role:"tablist","aria-label":"Дохионууд",style:"display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:2px 0 6px;margin-bottom:6px"}),cur=null;
      its.forEach(function(x,k){var short=String(x[0]).split(/[,;/]/)[0].trim(),on=k===i;
        var b=h("button",{class:"chip",type:"button",role:"tab","aria-selected":String(on),title:x[0],
          style:"flex:none;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;font-size:13px;font-weight:700;padding:5px 10px;margin:0"+(on?";border-color:var(--sky);background:color-mix(in srgb,var(--sky) 14%,var(--surface))":""),
          onclick:function(){Ls.i=k;S.spellI=0;env.render();}},(k+1)+". "+short);
        if(on)cur=b;put(dots,b);});
      put(root,dots);
      if(cur)setTimeout(function(){if(cur.isConnected)dots.scrollLeft=cur.offsetLeft-dots.offsetLeft-(dots.clientWidth-cur.offsetWidth)/2;},0);
      /* гарчиг: эхний утга том, ижил утгатай бусад үг доор нь жижгээр */
      var parts=String(it[0]).split(/,\s*/),head=parts.shift();
      put(root,h("div",{style:"text-align:center;margin:2px 0 8px"},
        h("div",{style:"font-weight:800;font-size:clamp(19px,5.6vw,24px);line-height:1.25;overflow-wrap:anywhere"},head),
        parts.length?h("div",{class:"muted",style:"font-size:14px;line-height:1.35;margin-top:2px;overflow-wrap:anywhere"},parts.join(", ")):null));
      seen("L"+it[1]);
      var yt=it[1].indexOf("yt:")===0,sp=it[1].indexOf("spell:")===0,u=yt?"https://www.youtube.com/watch?v="+it[1].slice(3):sp?MSL+"khuruu-useg/":pathURL(it[1]);
      put(root,media(it,les.ar,false));
      put(root,h("div",{class:"row",style:"margin-top:10px"},
        h("button",{class:"btn",disabled:i===0,onclick:function(){Ls.i=i-1;S.spellI=0;env.render();}},"‹ Өмнөх"),
        i<its.length-1?h("button",{class:"btn primary",onclick:function(){Ls.i=i+1;S.spellI=0;env.render();}},"Дараах ›")
          :h("button",{class:"btn primary",onclick:startLQuiz},"📝 Дасгал эхлэх")));
      put(root,h("p",{class:"muted small",style:"margin-top:8px"},yt?"Видео: "+(les.cr||"YouTube")+" (":sp?"Хурууны үсэг: «Монгол дохионы хэл» цахим толь (":"Видео: «Монгол дохионы хэл» цахим толь (",h("a",{href:u,target:"_blank",rel:"noopener"},yt?"YouTube":"mnsl.mn"),")"));
      /* жишээ өгүүлбэр: үг дээр дарахад тэр дохио руу шилжинэ */
      if(les.ex){
        var exb=h("details",{class:"note",style:"margin:10px 0 0;padding:8px 10px"});if(S.exOpen)exb.open=true;
        exb.addEventListener("toggle",function(){S.exOpen=exb.open;});
        put(exb,h("summary",{style:"cursor:pointer;font-weight:700"},"💬 Жишээ өгүүлбэр ("+les.ex.length+")"));
        les.ex.forEach(function(e){
          var row=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"});
          e[1].forEach(function(w){var k=-1;its.forEach(function(x,j){if(k<0&&x[0]===w)k=j;});
            put(row,h("button",{class:"chip",type:"button",style:"margin:0;font-size:13px;font-weight:800;padding:4px 9px"+(k===i?";border-color:var(--sky)":""),disabled:k<0,onclick:function(){Ls.i=k;S.spellI=0;env.render();window.scrollTo(0,0);}},w.toUpperCase()));});
          put(exb,h("div",{style:"margin-top:10px"},h("div",{style:"font-weight:700"},e[0]),row));});
        put(exb,h("div",{class:"muted small",style:"margin-top:8px"},"Дохионы дараалал ойролцоо: дохионы хэлэнд нөхцөл, туслах үгийг ихэвчлэн дохиолдоггүй, асуултыг нүүрний хувирлаар илэрхийлнэ."));
        put(root,exb);
      }
      return;
    }
    var Q=Ls;
    if(Q.i>=Q.qs.length){
      var pct=Math.round(Q.ok*100/Q.qs.length),stars=pct>=100?3:pct>=80?2:pct>=50?1:0;
      if(!Q.fin){Q.fin=true;var pr=lprog();if(!pr[les.id]||pr[les.id]<stars){pr[les.id]=stars;env.sset("signLessons",pr);}env.logAct("sign");if(stars>=2){env.addXP(5);env.celebrate();}}
      var nx=les.nx;
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},stars>=2?"🏆":"🤟"),
          h("div",{style:"font-weight:800;font-size:22px"},Q.ok+" / "+Q.qs.length),h("div",{style:"font-size:22px"},"⭐".repeat(stars)+"☆".repeat(3-stars)),
          h("div",{class:"muted"},stars>=2?"Хичээл дууслаа! +"+(Q.ok+5)+" XP":"80%-иас дээш авбал хичээл дуусна. Дахин үзээд оролдоорой.")),
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){startLesson(les);}},"🔁 Дахин үзэх"),h("button",{class:"btn",onclick:startLQuiz},"📝 Дахин дасгал"),
          stars>=2&&nx?h("button",{class:"btn primary",onclick:function(){startLesson(nx);}},les.topic?"Дараагийн хэсэг ›":"Дараагийн хичээл ›"):null));
      return;
    }
    var q=Q.qs[Q.i];
    put(root,h("p",{class:"muted small"},"Асуулт "+(Q.i+1)+" / "+Q.qs.length+" · ✅ "+Q.ok),h("div",{class:"q",style:"text-align:center;margin-bottom:6px"},"Энэ дохио юу гэсэн утгатай вэ?"));
    put(root,media(q.it,les.ar,true));
    var g=h("div",{style:"display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px"});
    q.o.forEach(function(o){var cls="opt";if(q.p!=null){if(o===q.a)cls+=" ok";else if(o===q.p)cls+=" bad";}
      put(g,h("button",{class:cls,disabled:q.p!=null,style:"font-size:clamp(14px,4.2vw,17px);line-height:1.3;font-weight:700;margin:0;padding:10px 8px;overflow-wrap:anywhere",onclick:function(){q.p=o;if(o===q.a){Q.ok++;env.addXP(1);}env.render();}},o));});
    put(root,g);
    if(q.p!=null)put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:10px",onclick:function(){Q.i++;env.render();window.scrollTo(0,0);}},Q.i+1<Q.qs.length?"Дараагийнх ›":"Дүн харах"));
  }
  function topicRow(o,pr,ico){
    var d=o.parts.filter(function(l){return pr[l.id]>=2;}).length;
    return h("button",{class:"lrow",type:"button",style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer",onclick:function(){if(o.parts.length===1){S.topic=null;startLesson(o.parts[0]);}else{S.topic=o.id;env.render();window.scrollTo(0,0);}}},
      ico?h("span",{class:"hexb ico"},o.ico):null,
      h("span",{style:"flex:1"},h("b",null,o.t),h("div",{class:"muted small"},o.items.length+" дохио"+(o.parts.length>1?" · "+o.parts.length+" хэсэг":"")+(d?" · ✅ "+d+"/"+o.parts.length:""))),
      h("span",{"aria-hidden":"true"},d===o.parts.length?"✅":"›"));
  }
  /* видео цуврал: дарсан видео нь апп дотор (YouTube embed) тоглоно, үзсэнийг тэмдэглэнэ (signWatched) */
  function seriesView(root){
    var M=mde(),sr=M&&M.series[S.series];if(!sr){S.series=null;put(root,h("p",{class:"muted"},"Ачаалж байна…"));return;}
    var wt=env.sget("signWatched",{})||{};
    put(root,h("h3",{style:"margin:4px 0 4px"},sr.ico+" "+sr.t),h("p",{class:"muted small",style:"margin:0 0 8px"},"Сонсголгүйн боловсрол / Mongolian Deaf Education · "+sr.items.length+" видео"));
    sr.items.forEach(function(x){var on=S.open==="yt:"+x.id;
      put(root,h("button",{class:"lrow",type:"button","aria-expanded":String(on),style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"+(on?";border-color:var(--sky)":""),
          onclick:function(){S.open=on?null:"yt:"+x.id;if(!on&&!wt[x.id]){wt[x.id]=1;env.sset("signWatched",wt);env.addXP(1);}env.render();}},
        h("span",{class:"hexb ico"},wt[x.id]?"✅":"▶️"),h("span",{style:"flex:1"},h("b",null,x.t),x.len?h("div",{class:"muted small"},"⏱ "+x.len):null),h("span",{"aria-hidden":"true"},on?"▾":"›")));
      if(on){var w=h("div",{class:"note",style:"margin:6px 0 10px;padding:8px"});
        put(w,h("iframe",{src:"https://www.youtube-nocookie.com/embed/"+x.id+"?autoplay=1&rel=0&playsinline=1&modestbranding=1",title:x.t,allow:"autoplay; encrypted-media; picture-in-picture; fullscreen",allowfullscreen:true,referrerpolicy:"strict-origin-when-cross-origin",
            style:"display:block;width:100%;aspect-ratio:16/9;height:auto;border:0;border-radius:10px;background:#000"}),
          h("div",{class:"muted small",style:"margin-top:4px"},"Видео: ",h("a",{href:"https://www.youtube.com/watch?v="+x.id+"&list="+sr.pl,target:"_blank",rel:"noopener"},"Сонсголгүйн боловсрол — YouTube ↗")));
        put(root,w);}
    });
  }
  function topicView(root){
    var o=topicById(S.topic);if(!o){S.topic=null;put(root,h("p",{class:"muted"},"Ачаалж байна…"));return;}
    var pr=lprog();
    put(root,h("h3",{style:"margin:4px 0 4px"},o.ico+" "+o.t),h("p",{class:"muted small",style:"margin:0 0 8px"},o.g+" · "+o.items.length+" дохио"));
    o.parts.forEach(function(l,k){var st=pr[l.id]||0;
      put(root,h("button",{class:"lrow",type:"button",style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer",onclick:function(){startLesson(l);}},
        h("span",{class:"hexb ico"},st>=2?"✅":String(k+1)),
        h("span",{style:"flex:1"},h("b",null,(k+1)+"-р хэсэг"+(st?" "+"⭐".repeat(st):"")),h("div",{class:"muted small"},l.items.map(function(x){return x[0];}).join(", "))),
        h("span",{"aria-hidden":"true"},"›")));});
  }
  function viewLessons(root){
    if(!msl()){put(root,h("p",{class:"muted"},S.err?"Индексийг ачаалж чадсангүй. Интернэтээ шалгана уу.":"Ачаалж байна…"));loadMsl();return;}
    if(S.les){lessonView(root);return;}
    if(S.topic!=null){topicView(root);return;}
    if(S.series!=null){seriesView(root);return;}
    var list=lessons(),pr=lprog(),done=list.filter(function(l){return pr[l.id]>=2;}).length;
    put(root,h("p",{class:"muted"},"Монгол дохионы хэлийг алхам алхмаар: хичээл бүрт дохиог видеогоор үзэж давтаад, дараа нь дасгал хийнэ. 80%-иас дээш зөв хариулбал хичээл дуусна."),
      h("div",{class:"small",style:"font-weight:700;margin:0 0 8px"},"Явц: "+done+" / "+list.length+" хичээл"),
      h("div",{style:"height:8px;border-radius:6px;background:var(--line);overflow:hidden;margin-bottom:12px"},h("div",{style:"height:100%;width:"+Math.round(done*100/list.length)+"%;background:var(--sky)"})));
    list.forEach(function(l,k){var st=pr[l.id]||0;
      put(root,h("button",{class:"lrow",type:"button",style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer",onclick:function(){startLesson(l);}},
        h("span",{class:"hexb ico"},st>=2?"✅":String(k+1)),
        h("span",{style:"flex:1"},h("b",null,l.t),h("div",{class:"muted small"},l.items.length+" дохио"+(st?" · "+"⭐".repeat(st):""))),
        h("span",{"aria-hidden":"true"},"›")));});
    /* 🆘 амьдралд хэрэгтэй дохио */
    var LL=lifeLessons();
    if(LL.length){
      put(root,h("h3",{style:"margin:20px 0 4px"},"🆘 Амьдралд хэрэгтэй дохио"),h("p",{class:"muted small",style:"margin:0 0 6px"},"Яаралтай үед, дэлгүүрт, тээвэрт, ойлголцох, эелдэг үг — дохио, хуруугаар үсэглэх үг, жишээ өгүүлбэртэй."));
      LL.forEach(function(l){var st=pr[l.id]||0;
        put(root,h("button",{class:"lrow",type:"button",style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer",onclick:function(){startLesson(l);}},
          h("span",{style:"flex:1"},h("b",null,l.t),h("div",{class:"muted small"},l.items.length+" дохио · "+l.ex.length+" жишээ өгүүлбэр"+(st?" · "+"⭐".repeat(st):""))),
          h("span",{"aria-hidden":"true"},st>=2?"✅":"›")));});
    }
    /* mnsl.mn-ийн бүх дохио — сэдвээр */
    put(root,h("h3",{style:"margin:20px 0 4px"},"📚 Сэдвээр — бүх дохио"));
    var T=topics();
    if(!T)put(root,h("p",{class:"muted small"},"Сэдвүүдийг ачаалж байна…"));
    else{
      var tot=0,tdone=0;T.forEach(function(o){tot+=o.parts.length;o.parts.forEach(function(l){if(pr[l.id]>=2)tdone++;});});
      put(root,h("p",{class:"muted small",style:"margin:0 0 6px"},"mnsl.mn тольд буй бүх "+(ix().length+msl().too.split("\n").length)+" дохиог (үг, тоо) "+T.length+" сэдэв, "+tot+" хэсэг болгосон. Дууссан: "+tdone+" / "+tot+" хэсэг."));
      var g0="";
      T.forEach(function(o){
        if(o.g!==g0){g0=o.g;put(root,h("div",{class:"muted small",style:"font-weight:700;margin:10px 0 4px"},o.ico+" "+o.n+". "+o.g));}
        put(root,topicRow(o,pr,false));
      });
    }
    /* Сонсголгүйн боловсрол (YouTube) — дохионы сан ба видео цуврал */
    var M=mde();
    put(root,h("h3",{style:"margin:22px 0 4px"},"🎓 Сонсголгүйн боловсрол — дохионы сан"));
    if(!M)put(root,h("p",{class:"muted small"},"Ачаалж байна…"));
    else{
      var mt=0;M.vocab.forEach(function(o){mt+=o.items.length;});
      put(root,h("p",{class:"muted small",style:"margin:0 0 6px"},"«Mongolian Deaf Education» сувгийн "+mt+" дохионы видео — харилцан яриа, төлөөний үг, мэргэжил, бие эрхтэн, эсрэг утгатай үг, үйл үг. Видео бүрийн дараа дасгалтай."));
      M.vocab.forEach(function(o){put(root,topicRow(o,pr,true));});
      put(root,h("h3",{style:"margin:22px 0 4px"},"🎬 Видео хичээл, дуу, үлгэр"));
      var wt=env.sget("signWatched",{})||{};
      M.series.forEach(function(sr){var d=sr.items.filter(function(x){return wt[x.id];}).length;
        put(root,h("button",{class:"lrow",type:"button",style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer",onclick:function(){S.series=sr.k;S.open=null;env.render();window.scrollTo(0,0);}},
          h("span",{class:"hexb ico"},sr.ico),h("span",{style:"flex:1"},h("b",null,sr.t),h("div",{class:"muted small"},sr.items.length+" видео"+(d?" · үзсэн "+d:""))),h("span",{"aria-hidden":"true"},"›")));});
    }
    put(root,h("p",{class:"muted small",style:"margin-top:16px"},"Видео, ангилал: «Монгол дохионы хэл» цахим толь — ",h("a",{href:MSL,target:"_blank",rel:"noopener"},"mnsl.mn"),"; «Сонсголгүйн боловсрол / Mongolian Deaf Education» — ",h("a",{href:MDE_URL,target:"_blank",rel:"noopener"},"YouTube"),". Зохиогчийн эрх тэдэнд хамаарна."));
  }
  function viewMsl(root){
    put(root,h("p",{class:"muted"},"Монголд 9–15 мянган сонсголгүй иргэн амьдардаг. Үг, үсэг дээр дарахад дохионы видео энд, апп дотор тоглоно — албан ёсны «Монгол дохионы хэл» цахим толь (mnsl.mn)-ийн хуудсаар."));
    if(!msl()){put(root,h("p",{class:"muted"},S.err?"Индексийг ачаалж чадсангүй. Интернэтээ шалгана уу.":"Ачаалж байна…"));loadMsl();return;}
    /* хайлт */
    var inp=h("input",{class:"tin",type:"search",placeholder:"🔎 Үгээр хайх (ж: баярлалаа, ээж, сургууль)","aria-label":"Дохио хайх",value:S.q});
    var res=h("div");
    var draw=function(){
      res.textContent="";var q=String(S.q||"").toLowerCase().trim();
      if(q.length<2){put(res,h("p",{class:"muted small",style:"margin:6px 0"},"Нийт "+(ix().length+msl().too.split("\n").length)+" дохио. 2-оос дээш үсэг бичнэ үү."));return;}
      var m=ix().filter(function(e){return (" "+e.t+" ").indexOf(" "+q)>=0;});
      m.sort(function(a,b){return (a.t.indexOf(q)===0?0:1)-(b.t.indexOf(q)===0?0:1)||a.t.length-b.t.length;});
      if(!m.length&&!msl().too.split("\n").some(function(sl){return (" "+sl.replace(/-/g," ")+" ").indexOf(" "+q)>=0;})){put(res,h("p",{class:"muted small",style:"margin:6px 0"},"Олдсонгүй. Өөр үгээр хайгаарай."));return;}
      m.slice(0,30).forEach(function(e){var u=ugURL(e);put(res,row(u,"m"+e.n,h("div",{class:"t"},e.t),"№"+e.n,"🤟","search"));if(S.open===u&&S.from==="search")put(res,card(u,e.t));});
      var mt=msl().too.split("\n").filter(function(sl){var t=sl.replace(/-\d+$/,"").replace(/-/g," ");return (" "+t+" ").indexOf(" "+q)>=0;}).slice(0,10);
      mt.forEach(function(sl){var u=MSL+"too/"+encodeURIComponent(sl)+"/",t=sl.replace(/-\d+$/,"").replace(/-/g," ");put(res,row(u,"t"+sl,h("div",{class:"t"},t),"🔢 тоо","🤟","search"));if(S.open===u&&S.from==="search")put(res,card(u,t));});
      if(m.length>30)put(res,h("p",{class:"muted small"},"… бас "+(m.length-30)+" илэрц. Илүү тодорхой бичээрэй."));
    };
    inp.addEventListener("input",function(){S.q=inp.value;draw();});
    put(root,inp,res);draw();
    /* сэдвээр үзэх (msl-topics.js) — бүх 1398 дохио */
    var T=topics();
    if(T){
      put(root,h("h3",{style:"margin:18px 0 6px"},"🗂 Сэдвээр үзэх"));
      var sel=h("select",{class:"tin","aria-label":"Сэдэв сонгох"});
      put(sel,h("option",{value:""},"— Сэдэв сонгох ("+T.length+") —"));
      T.forEach(function(o){var op=h("option",{value:String(o.id)},o.ico+" "+o.n+". "+o.t+" ("+o.items.length+")");if(S.tb===o.id)op.selected=true;put(sel,op);});
      sel.addEventListener("change",function(){S.tb=sel.value?parseInt(sel.value,10):null;S.open=null;env.render();});
      put(root,sel);
      var to=S.tb!=null?topicById(S.tb):null;
      if(to)to.items.forEach(function(x){var u=pathURL(x[1]);put(root,row(u,"m"+x[2],h("div",{class:"t"},x[0]),null,"🤟","topic"));if(S.open===u&&S.from==="topic")put(root,card(u,x[0]));});
    }
    /* үндсэн үгс */
    put(root,h("h3",{style:"margin:18px 0 6px"},"📚 Үндсэн үгс"));
    var cat="";
    WORDS.forEach(function(w){
      if(w[0]!==cat){cat=w[0];put(root,h("div",{class:"muted small",style:"font-weight:700;margin:10px 0 4px"},cat));}
      var e=typeof w[4]==="number"?byNum(w[4]):typeof w[4]==="string"?{n:w[4],path:w[4]}:null;
      /* тольд тусдаа дохио алга (ус, жорлон — сайтын бүх хэсгээс хайж баталсан): дохионы хэлний жам ёсоор хуруугаар үсэглэнэ.
         Үсэг бүрийн гарын хэлбэрийг mnsl.mn-ийн хурууны үсгийн хуудсаар, «Дараах ›»-ээр дараалуулан харуулна. */
      if(!e){
        var lets=String(w[1]).toLowerCase().split("").filter(function(c){return msl().letters.indexOf(c)>=0;}),sf="spell:"+w[1],su="spell://"+w[1],son=S.open===su&&S.from===sf;
        put(root,row(su,"s"+w[1],h("b",null,w[1]),"✋ Тольд тусдаа дохио алга — хуруугаар үсэглэнэ: "+lets.map(function(c){return c.toUpperCase();}).join(" · "),null,sf));
        if(son){
          var i=Math.max(0,Math.min(lets.length-1,S.spellI||0)),box=h("div",{class:"note",style:"margin:6px 0 10px;padding:8px"});
          var chips=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px"});
          lets.forEach(function(c,k){put(chips,h("button",{class:"chip",type:"button","aria-pressed":String(k===i),style:"font-weight:800"+(k===i?";border-color:var(--sky);background:color-mix(in srgb,var(--sky) 14%,var(--surface))":""),onclick:function(){S.spellI=k;env.render();}},(k+1)+". "+c.toUpperCase()));});
          put(box,h("div",{class:"small",style:"margin-bottom:6px"},"«"+w[1]+"» үгийг үсэг үсгээр нь хуруугаар үсэглэнэ — "+(i+1)+" / "+lets.length+" үсэг"),chips,
            card(lurl(lets[i]),"«"+lets[i].toUpperCase()+"» үсэг"),
            h("div",{class:"row"},
              h("button",{class:"btn",disabled:i===0,onclick:function(){S.spellI=i-1;env.render();}},"‹ Өмнөх"),
              h("button",{class:"btn primary",disabled:i>=lets.length-1,onclick:function(){S.spellI=i+1;env.render();}},"Дараах ›")));
          put(root,box);
        }
        return;}
      var u=e.path?MSL+e.path.split("/").map(encodeURIComponent).join("/")+"/":ugURL(e);
      put(root,row(u,"m"+e.n,h("b",null,w[1]),w[5]||null,null,"basic"));
      if(S.open===u&&S.from==="basic")put(root,card(u,w[1]));
    });
    /* хурууны цагаан толгой */
    put(root,h("h3",{style:"margin:18px 0 6px"},"🔤 Хурууны цагаан толгой (дактиль)"),
      h("p",{class:"muted small",style:"margin:0 0 6px"},"Нэр, газрын нэр зэрэг дохиогүй үгийг үсэг үсгээр нь хуруугаар үсэглэдэг. Үсэг дээр дарж гарын хэлбэрийг үзээрэй."));
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
    if(S.les){lessonView(root);return;}
    if(S.topic!=null){topicView(root);return;}
    put(root,h("p",{class:"muted"},"Америкийн дохионы хэл (ASL) — АНУ, Канадад хэрэглэгддэг, дэлхийд хамгийн өргөн тархсан дохионы хэл. Хурууны цагаан толгой нь нэг гараар үсэглэдэг."));
    put(root,h("div",{class:"row"},h("button",{class:"btn primary",onclick:startQuiz},"📝 Үсэг таах"),h("button",{class:"btn",onclick:startSpell},"🔡 Үг үсэглэх")));
    /* ASL University хичээл 1–60 */
    put(root,h("h3",{style:"margin:16px 0 4px"},"📖 ASL University — 60 хичээл"));
    var AU=aslu();
    if(!AU){put(root,h("p",{class:"muted small"},S.aErr?"Ачаалж чадсангүй. Интернэтээ шалгана уу.":"Ачаалж байна…"));loadAslu();}
    else{
      var pr=lprog(),at=0,ad=0;AU.forEach(function(o){at+=o.items.length;o.parts.forEach(function(l){if(pr[l.id]>=2)ad++;});});
      put(root,h("p",{class:"muted small",style:"margin:0 0 6px"},"Dr. Bill Vicars-ийн ASL University (Lifeprint) хөтөлбөр: "+at+" видео — үг ба дасгалын өгүүлбэр. Гарчиг англиар (ASL gloss). Хичээл бүр 10 хүртэл видеотой хэсгүүдтэй, дасгалтай. Дууссан хэсэг: "+ad));
      var more=S.auAll?AU:AU.slice(0,10);
      more.forEach(function(o){put(root,topicRow(o,pr,false));});
      if(!S.auAll)put(root,h("button",{class:"btn",style:"width:100%;margin-top:6px",onclick:function(){S.auAll=true;env.render();}},"Бүх 60 хичээлийг харах ▾"));
    }
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
    var inL=(S.tab==="les"||S.tab==="asl")&&(S.les||S.topic!=null||S.series!=null),inA=S.tab==="asl"&&(S.quiz||S.spell);
    put(root,h("button",{class:"back",onclick:function(){if(inA){S.quiz=null;S.spell=null;env.render();}else if(inL){if(S.les)S.les=null;else if(S.series!=null){S.series=null;S.open=null;}else S.topic=null;env.render();window.scrollTo(0,0);}else e.close();}},inA?"‹ ASL":inL?(S.les&&S.les.l.topic&&S.topic!=null?"‹ "+S.les.l.topic.t:S.tab==="asl"?"‹ ASL":"‹ Хичээлүүд"):"‹ Дүрэм"),
      h("h2",null,"🤟 Дохионы хэл"));
    if(!inA&&!inL){
      var seg=h("div",{class:"seg",role:"group","aria-label":"Дохионы хэл",style:"margin-bottom:10px"});
      [["les","📖 Хичээл"],["msl","🇲🇳 Толь"],["asl","🇺🇸 ASL"],["world","🌍 Дэлхий"]].forEach(function(t){put(seg,h("button",{"aria-pressed":String(S.tab===t[0]),onclick:function(){S.tab=t[0];S.open=null;env.render();}},t[1]));});
      put(root,seg);
    }
    if(S.tab==="asl")viewAsl(root);else if(S.tab==="les")viewLessons(root);else if(S.tab==="world")viewWorld(root);else viewMsl(root);
    return root;
  }
  window.Sign={view:view,words:WORDS,translit:translit};
})();
