/* Салхи: 👄 Уруулын толь — урд камераар уруулынхаа хэлбэрийг харж, тухайн авианы зөв хэлбэртэй харьцуулна.
   MediaPipe Face Landmarker (jsdelivr CDN, ~4MB, анх нээхэд л татна) уруулын өргөн (амны булан 61–291) ба ангайлтыг
   (13–14) нүүрний өргөнд (234–454) харьцуулж хэмжинэ. Эхний 2 секундэд тайван нүүрээр тохируулна (суурь өргөн).
   Хэлний байрлал (th, r) камераар харагдахгүй тул зөвхөн зөвлөгөө. Ачаалагдахгүй бол толь + зөвлөгөө л үлдэнэ.
   Видео төхөөрөмжөөс гарахгүй. */
(function(){
  var env=null,h=null,S={k:0,on:false,err:null,model:null,loading:false,base:null,cal:[],m:null,okT:0,done:{}};
  var VER="0.10.14",CDN="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@"+VER;
  var MODEL="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
  var LIPS=[61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185];
  /* [авиа, жишээ үг, уруул (spread дэлгэр | round дугуй | neutral тайван), ангайлт (closed | small | mid | wide), зөвлөгөө] */
  var SOUNDS={
    en:[["th","think","neutral","small","Хэлний үзүүрийг дээд, доод шүдний завсраар бага зэрэг гаргаад агаар үлээ. Монгол «с» биш!"],
        ["w","water","round","small","Уруулаа «у» гэх шиг жижиг дугуй болгоод дараа нь гэнэт нээ. Монгол «в» шиг доод уруулаа шүдэнд хүргэхгүй."],
        ["v","very","neutral","closed","Дээд шүдээ доод уруул дээрээ зөөлөн тавиад дуу гаргана. «w»-тэй андуурахгүй."],
        ["iː","see","spread","small","Инээмсэглэх шиг уруулаа хажуу тийш татаад урт «ий» гэ."],
        ["æ","cat","spread","wide","Амаа том ангайж, уруулаа бага зэрэг хажуу тийш тат — «а», «э» хоёрын дунд."],
        ["r","red","round","small","Уруулаа бага зэрэг дугуйлж, хэлээ тагнайд хүргэлгүй ар тийш нь нугал. Монгол «р» шиг чичрүүлэхгүй."]],
    de:[["ü","über","round","small","«И» гэж хэлэнгээ уруулаа «ү» шиг жижиг дугуйл. Монгол «ү»-ээс илүү урагш, чанга дугуй."],
        ["ö","schön","round","mid","«Э» гэж хэлэнгээ уруулаа «ө» шиг дугуйл."],
        ["ch","ich","spread","small","Уруулаа инээмсэглэх шиг дэлгээд хэлний дундаар «хь» гэж исгэр."],
        ["u","gut","round","small","Уруулаа урагш сунгаж жижиг дугуй болго — урт «уу»."]],
    ru:[["ы","мы","neutral","small","Уруулаа дугуйлахгүй, «и» гэх шиг дэлгэхгүй. Хэлээ ар тийш нь татаж «ы» гэ."],
        ["у","тут","round","small","Уруулаа урагш сунгаж жижиг дугуй болго."],
        ["о","дом","round","mid","Уруулаа дугуйлж амаа дунд зэрэг ангай. Өргөлтгүй «о» нь «а» болдог."]],
    ja:[["う","すし","neutral","small","Япон «у»-г хэлэхдээ уруулаа дугуйлахгүй, тайван байлга — монгол «у»-аас өөр."],
        ["ふ","ふじ","neutral","small","Уруулаа дугуйлахгүй, хоёр уруулын завсраар зөөлөн үлээнэ. Шүдээ уруулд хүргэхгүй."],
        ["い","いい","spread","small","Уруулаа бага зэрэг дэлгээд богино «и»."]],
    ko:[["ㅡ","으","spread","small","Уруулаа хажуу тийш дэлгээд, шүдээ бараг нийлүүлж «ы» гэ. Дугуйлахгүй."],
        ["ㅓ","어","neutral","mid","Амаа дунд зэрэг ангай, уруулаа дугуйлахгүй — монгол «о», «а» хоёрын дунд."],
        ["ㅗ","오","round","mid","Уруулаа дугуйлж урагш сунга — монгол «о»."]],
    zh:[["ü","女 nǚ","round","small","«И» гэж хэлэнгээ уруулаа жижиг дугуй болго."],
        ["zh/ch/sh","中 zhōng","round","small","Уруулаа бага зэрэг дугуйлж урагш сунга, хэлний үзүүрийг ар тийш нугал."],
        ["-i","四 sì","spread","small","Уруулаа дэлгээд шүдээ бараг нийлүүл, «з» шиг дуу гаргана."]],
    ug:[["ü","ئۈزۈم","round","small","«И» гэж хэлэнгээ уруулаа дугуйл."],["ö","ئۆي","round","mid","«Э» гэж хэлэнгээ уруулаа дугуйл."]]
  };
  var WN={spread:"дэлгэр",round:"дугуй",neutral:"тайван"},ON={closed:"бараг хаалттай",small:"бага зэрэг нээлттэй",mid:"дунд зэрэг ангайсан",wide:"том ангайсан"};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function d(a,b){var x=a.x-b.x,y=a.y-b.y;return Math.sqrt(x*x+y*y);}
  function list(){return SOUNDS[env.lang()]||SOUNDS.en;}
  /* хэмжээс: w = амны өргөн / суурь (1 = тайван), o = ангайлт / нүүрний өргөн */
  function judge(m,s){
    var wOk=s[2]==="spread"?m.w>=1.07:s[2]==="round"?m.w<=0.9:m.w>0.9&&m.w<1.08;
    var oOk=s[3]==="closed"?m.o<0.025:s[3]==="small"?m.o>=0.01&&m.o<0.07:s[3]==="mid"?m.o>=0.06&&m.o<0.13:m.o>=0.11;
    return {w:wOk,o:oOk};
  }
  function load(){
    if(S.model||S.loading)return;S.loading=true;S.err=null;
    import(CDN+"/vision_bundle.mjs").then(function(V){
      return V.FilesetResolver.forVisionTasks(CDN+"/wasm").then(function(fs){
        var mk=function(dl){return V.FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:MODEL,delegate:dl},runningMode:"VIDEO",numFaces:1});};
        return mk("GPU").catch(function(){return mk("CPU");}); // GPU-гүй төхөөрөмж
      });
    }).then(function(m){S.model=m;S.loading=false;env.render();},function(){S.loading=false;S.err="Уруул хэмжигчийг ачаалж чадсангүй — толиор харж, зөвлөгөөг дагаарай.";env.render();});
  }
  function camOn(){
    if(S.on)return;S.err=null;
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){S.err="Энэ хөтөч камер дэмжихгүй.";env.render();return;}
    navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},audio:false}).then(function(st){
      S.stream=st;S.on=true;S.base=null;S.cal=[];
      if(!S.video){S.video=document.createElement("video");S.video.setAttribute("playsinline","");S.video.muted=true;S.video.style.cssText="width:100%;display:block;transform:scaleX(-1);border-radius:16px;background:#000";}
      S.video.srcObject=st;S.video.play().catch(function(){});
      load();env.render();loop();
    },function(){S.err="Камерын зөвшөөрөл өгөөгүй байна.";env.render();});
  }
  function camOff(){S.on=false;if(S.stream){S.stream.getTracks().forEach(function(t){t.stop();});S.stream=null;}}
  /* нэг л rAF давталт ажиллана (дахин зурагдах бүрт давхардахгүй) */
  function loop(){if(S.lp)return;S.lp=true;requestAnimationFrame(tick);}
  function tick(){
    if(!S.on){S.lp=false;return;}
    if(!S.video||!S.video.isConnected){S.lp=false;camOff();return;}
    if(S.model&&S.video.readyState>=2){
      var r=null;try{r=S.model.detectForVideo(S.video,performance.now());}catch(e){}
      var L=r&&r.faceLandmarks&&r.faceLandmarks[0];
      if(L){
        var fw=d(L[234],L[454])||1,w=d(L[61],L[291])/fw,o=d(L[13],L[14])/fw;
        if(!S.base){S.cal.push(w);if(S.cal.length>=50){var c=S.cal.slice().sort(function(a,b){return a-b;});S.base=c[Math.floor(c.length/2)];env.render();}}
        else{S.m={w:w/S.base,o:o};meter(L);}
      }
    }
    requestAnimationFrame(tick);
  }
  function meter(L){
    var cv=document.getElementById("lp-cv");if(!cv||!S.video)return;
    var vw=S.video.videoWidth||640,vh=S.video.videoHeight||480;if(cv.width!==vw){cv.width=vw;cv.height=vh;}
    var x=cv.getContext("2d");x.clearRect(0,0,vw,vh);
    var s=list()[S.k],j=judge(S.m,s),good=j.w&&j.o;
    x.strokeStyle=good?"#22C55E":"#60A5FA";x.lineWidth=3;x.beginPath();
    LIPS.forEach(function(i,n){var p=L[i],px=(1-p.x)*vw,py=p.y*vh;n?x.lineTo(px,py):x.moveTo(px,py);});x.closePath();x.stroke();
    var wb=document.getElementById("lp-w"),ob=document.getElementById("lp-o"),st=document.getElementById("lp-st");
    if(wb){wb.style.width=Math.max(4,Math.min(100,(S.m.w-0.6)/0.8*100))+"%";wb.style.background=j.w?"var(--ok-line)":"var(--sky)";}
    if(ob){ob.style.width=Math.max(4,Math.min(100,S.m.o/0.18*100))+"%";ob.style.background=j.o?"var(--ok-line)":"var(--sky)";}
    if(good){S.okT=S.okT||Date.now();if(Date.now()-S.okT>900&&!S.done[env.lang()+s[0]]){S.done[env.lang()+s[0]]=1;env.addXP(3);env.toast("👄 «"+s[0]+"» хэлбэр зөв! +3 XP");}}else S.okT=0;
    if(st)st.textContent=good?"✅ Зөв хэлбэр — ингээд барь!":(!j.w?(s[2]==="round"?"Уруулаа илүү дугуйл":s[2]==="spread"?"Уруулаа илүү дэлгэ":"Уруулаа тайван байлга"):"")+(!j.w&&!j.o?" · ":"")+(!j.o?(s[3]==="wide"||s[3]==="mid"?"амаа илүү ангай":"амаа бага ангай"):"");
  }
  function guide(s){
    var NS="http://www.w3.org/2000/svg",svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox","0 0 120 70");svg.setAttribute("aria-hidden","true");svg.style.cssText="width:120px;height:70px;flex:none";
    var rx=s[2]==="spread"?46:s[2]==="round"?22:36,ry={closed:3,small:9,mid:15,wide:22}[s[3]];
    svg.innerHTML='<ellipse cx="60" cy="35" rx="'+(rx+8)+'" ry="'+(ry+9)+'" fill="#F28B82"/><ellipse cx="60" cy="35" rx="'+rx+'" ry="'+ry+'" fill="#5B1A1A"/>'+(s[0]==="th"?'<ellipse cx="60" cy="37" rx="12" ry="5" fill="#F06292"/>':"");
    return svg;
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),L=list();if(S.k>=L.length)S.k=0;var s=L[S.k];
    put(root,h("button",{class:"back",onclick:function(){camOff();e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"👄 Уруулын толь"));
    put(root,h("p",{class:"muted"},"Монгол хэлэнд байдаггүй авиаг хэлэхэд уруулын хэлбэр чухал. Камераар уруулаа харж, зөв хэлбэртэй харьцуул. Видео утаснаас гарахгүй."));
    put(root,h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px"},L.map(function(x,i){return h("button",{class:"chip","aria-pressed":String(i===S.k),onclick:function(){S.k=i;S.okT=0;env.render();}},x[0]);})));
    put(root,h("div",{class:"note",style:"display:flex;gap:12px;align-items:center"},guide(s),
      h("div",{style:"flex:1"},h("div",{style:"display:flex;align-items:center;gap:8px"},h("b",{style:"font-size:20px"},s[0]),h("span",{lang:env.lang(),class:"muted"},s[1]),env.speakBtn(s[1].split(" ")[0])),
        h("div",{class:"small"},"Уруул: ",h("b",null,WN[s[2]])," · Ам: ",h("b",null,ON[s[3]])))));
    put(root,h("div",{class:"rule",style:"margin-top:8px;padding:10px 12px"},"💡 "+s[4]));
    if(!S.on){
      if(S.err)put(root,h("div",{class:"note",style:"color:var(--danger);margin-top:8px"},S.err));
      put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:camOn},"📷 Толь нээх"));
      return root;
    }
    var box=h("div",{style:"position:relative;margin-top:12px"});box.append(S.video);
    box.append(h("canvas",{id:"lp-cv",style:"position:absolute;inset:0;width:100%;height:100%;pointer-events:none"}));
    put(root,box);
    if(S.err)put(root,h("div",{class:"muted small",style:"margin-top:6px"},S.err));
    else if(!S.model)put(root,h("div",{class:"muted small",style:"margin-top:6px"},"⏳ Уруул хэмжигчийг ачаалж байна (анх удаа ~4MB)…"));
    else if(!S.base)put(root,h("div",{class:"note",style:"margin-top:8px"},"🙂 Камер руу тайван харж, амаа хаагаад 2 секунд хүлээ — тохируулж байна…"));
    else{
      var bar=function(lbl,id){return h("div",{style:"margin-top:8px"},h("div",{class:"muted small"},lbl),h("div",{style:"height:10px;border-radius:999px;background:color-mix(in srgb,var(--ink) 8%,var(--bg));overflow:hidden"},h("i",{id:id,style:"display:block;height:100%;width:50%;border-radius:999px;background:var(--sky);transition:width .1s"})));};
      put(root,bar("↔ Уруулын өргөн (дугуй ← → дэлгэр)","lp-w"),bar("↕ Амны ангайлт","lp-o"),h("div",{id:"lp-st",class:"note",style:"margin-top:10px;font-weight:600"},"…"));
      put(root,h("button",{class:"btn ghost",style:"margin-top:8px",onclick:function(){S.base=null;S.cal=[];env.render();}},"🔄 Дахин тохируулах"));
    }
    put(root,h("button",{class:"btn",style:"width:100%;margin-top:10px",onclick:function(){camOff();env.render();}},"⏹ Камер хаах"));
    loop();
    return root;
  }
  window.Lips={view:view,stop:camOff};
})();
