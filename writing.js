/* Салхи: кана, хангыль бичих дасгал — хуруугаараа зурлага бүрийг зөв дарааллаар, зөв чиглэлээр зурж байгааг шалгана.
   Кана: KanjiVG зурлагын өгөгдөл (CC BY-SA 3.0, Ulrich Apel, kanjivg.tagaini.net) — CDN-ээс татна.
   Хангыль: үндсэн 24 үсгийн зурлагыг энд тодорхойлсон (109×109 талбай, KanjiVG-тэй ижил хэмжээ). */
(function(){
  var KVG="https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/";
  var RO="a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n".split(" ");
  var SETS={
    ja:[["hira","ひらがな",Array.from("あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん")],
        ["kata","カタカナ",Array.from("アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン")]],
    ko:[["cons","Гийгүүлэгч",Array.from("ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ")],["vow","Эгшиг",Array.from("ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ")]]
  };
  var KO_RO={"ㄱ":"g/k","ㄴ":"n","ㄷ":"d/t","ㄹ":"r/l","ㅁ":"m","ㅂ":"b/p","ㅅ":"s","ㅇ":"ng","ㅈ":"j","ㅊ":"ch","ㅋ":"k","ㅌ":"t","ㅍ":"p","ㅎ":"h",
    "ㅏ":"a","ㅑ":"ya","ㅓ":"eo","ㅕ":"yeo","ㅗ":"o","ㅛ":"yo","ㅜ":"u","ㅠ":"yu","ㅡ":"eu","ㅣ":"i"};
  var KO_SAY={"ㄱ":"가","ㄴ":"나","ㄷ":"다","ㄹ":"라","ㅁ":"마","ㅂ":"바","ㅅ":"사","ㅇ":"아","ㅈ":"자","ㅊ":"차","ㅋ":"카","ㅌ":"타","ㅍ":"파","ㅎ":"하",
    "ㅏ":"아","ㅑ":"야","ㅓ":"어","ㅕ":"여","ㅗ":"오","ㅛ":"요","ㅜ":"우","ㅠ":"유","ㅡ":"으","ㅣ":"이"};
  function circ(cx,cy,r){var p=[];for(var i=0;i<=24;i++){var a=-Math.PI/2-i/24*Math.PI*2;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return p;}
  /* зурлага бүр нь цэгүүдийн жагсаалт, зурах чиглэлээр */
  var JAMO={
    "ㄱ":[[[24,26],[82,26],[80,90]]],
    "ㄴ":[[[28,18],[28,82],[88,82]]],
    "ㄷ":[[[26,24],[84,24]],[[26,24],[26,84],[88,84]]],
    "ㄹ":[[[26,20],[80,20],[80,52]],[[26,52],[80,52]],[[26,52],[26,88],[86,88]]],
    "ㅁ":[[[26,24],[26,86]],[[26,24],[82,24],[82,86]],[[26,86],[82,86]]],
    "ㅂ":[[[28,18],[28,86]],[[80,18],[80,86]],[[28,52],[80,52]],[[28,86],[80,86]]],
    "ㅅ":[[[56,18],[22,90]],[[50,52],[90,90]]],
    "ㅇ":[circ(54,55,32)],
    "ㅈ":[[[24,22],[82,22],[26,90]],[[54,54],[90,90]]],
    "ㅊ":[[[54,6],[54,20]],[[24,30],[82,30],[26,94]],[[54,62],[90,94]]],
    "ㅋ":[[[24,22],[82,22],[80,90]],[[24,56],[80,56]]],
    "ㅌ":[[[28,22],[84,22]],[[28,52],[84,52]],[[28,22],[28,86],[88,86]]],
    "ㅍ":[[[20,22],[88,22]],[[40,22],[40,82]],[[68,22],[68,82]],[[14,82],[94,82]]],
    "ㅎ":[[[54,8],[54,22]],[[24,32],[84,32]],circ(54,66,22)],
    "ㅏ":[[[46,8],[46,100]],[[46,52],[78,52]]],
    "ㅑ":[[[46,8],[46,100]],[[46,40],[78,40]],[[46,66],[78,66]]],
    "ㅓ":[[[28,52],[62,52]],[[62,8],[62,100]]],
    "ㅕ":[[[28,40],[62,40]],[[28,66],[62,66]],[[62,8],[62,100]]],
    "ㅗ":[[[54,38],[54,68]],[[10,68],[98,68]]],
    "ㅛ":[[[40,38],[40,68]],[[68,38],[68,68]],[[10,68],[98,68]]],
    "ㅜ":[[[10,40],[98,40]],[[54,40],[54,84]]],
    "ㅠ":[[[10,40],[98,40]],[[40,40],[40,84]],[[68,40],[68,84]]],
    "ㅡ":[[[10,55],[98,55]]],
    "ㅣ":[[[54,8],[54,100]]]
  };

  /* ---------- геометр ---------- */
  function len(p){var s=0;for(var i=1;i<p.length;i++)s+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return s;}
  function resample(p,n){
    if(p.length<2)return Array(n).fill(p[0]||[0,0]);
    var L=len(p),step=L/(n-1),out=[p[0].slice()],acc=0,prev=p[0];
    for(var i=1;i<p.length&&out.length<n;i++){
      var cur=p[i],d=Math.hypot(cur[0]-prev[0],cur[1]-prev[1]);
      while(acc+d>=step&&out.length<n&&d>0){
        var t=(step-acc)/d,q=[prev[0]+t*(cur[0]-prev[0]),prev[1]+t*(cur[1]-prev[1])];
        out.push(q);prev=q;d=Math.hypot(cur[0]-prev[0],cur[1]-prev[1]);acc=0;
      }
      acc+=d;prev=cur;
    }
    while(out.length<n)out.push(p[p.length-1].slice());
    return out;
  }
  function avgDist(a,b){var s=0;for(var i=0;i<a.length;i++)s+=Math.hypot(a[i][0]-b[i][0],a[i][1]-b[i][1]);return s/a.length;}
  /* зурлагыг шалгах: хэлбэр ойролцоо, эхлэл-төгсгөл зөв чиглэлтэй байх ёстой */
  function judge(user,ref){
    if(len(user)<3)return "short";
    var u=resample(user,24),r=resample(ref,24),rr=r.slice().reverse();
    var d=avgDist(u,r),dr=avgDist(u,rr),lim=len(ref)<20?16:20;
    if(d<=lim&&d<=dr+2)return "ok";
    if(dr<=lim)return "dir";
    return "bad";
  }

  /* ---------- кана өгөгдөл ---------- */
  var cache={};
  function hex(ch){var c=ch.codePointAt(0).toString(16);while(c.length<5)c="0"+c;return c;}
  function loadKana(ch){
    if(cache[ch])return Promise.resolve(cache[ch]);
    return fetch(KVG+hex(ch)+".svg").then(function(r){if(!r.ok)throw new Error(r.status);return r.text();}).then(function(t){
      var doc=new DOMParser().parseFromString(t,"image/svg+xml"),ds=[].map.call(doc.querySelectorAll("path"),function(p){return p.getAttribute("d");});
      var ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");
      svg.setAttribute("style","position:absolute;width:0;height:0;overflow:hidden");document.body.appendChild(svg);
      var strokes=ds.map(function(d){
        var el=document.createElementNS(ns,"path");el.setAttribute("d",d);svg.appendChild(el);
        var L=el.getTotalLength(),n=Math.max(8,Math.ceil(L/3)),pts=[];
        for(var i=0;i<=n;i++){var q=el.getPointAtLength(L*i/n);pts.push([q.x,q.y]);}
        return pts;
      });
      svg.remove();
      cache[ch]=strokes;return strokes;
    });
  }
  function strokesFor(ch){return JAMO[ch]?Promise.resolve(JAMO[ch]):loadKana(ch);}

  /* ---------- харагдац ---------- */
  var env=null,h=null,S={lang:null,set:null,ch:null};
  function doneKey(){return "write:"+env.lang();}
  function reading(ch){
    if(KO_RO[ch])return KO_RO[ch];
    var sets=SETS[env.lang()]||[];
    for(var i=0;i<sets.length;i++){var k=sets[i][2].indexOf(ch);if(k>=0)return RO[k];}
    return "";
  }
  function say(ch){env.speak(KO_SAY[ch]||ch);}
  function viewGrid(root){
    var sets=SETS[env.lang()],done=env.sget(doneKey(),{})||{};
    if(!S.set||!sets.some(function(s){return s[0]===S.set;}))S.set=sets[0][0];
    root.append(h("p",{class:"muted"},"Үсгээ сонгоод хуруугаараа зурлага бүрийг дарааллаар нь зур. Буруу дараалал, буруу чиглэлийг шалгана."));
    var seg=h("div",{class:"seg",style:"margin:6px 0 10px"});
    sets.forEach(function(s){seg.append(h("button",{"aria-pressed":String(S.set===s[0]),onclick:function(){S.set=s[0];env.render();}},s[1]));});
    root.append(seg);
    var cur=sets.filter(function(s){return s[0]===S.set;})[0],n=cur[2].filter(function(c){return done[c];}).length;
    root.append(h("p",{class:"muted small",style:"margin:0 0 6px"},"Эзэмшсэн: "+n+" / "+cur[2].length));
    var grid=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:8px"});
    cur[2].forEach(function(c){
      grid.append(h("button",{class:"opt",style:"margin:0;padding:8px 0;text-align:center;position:relative","aria-label":c+" "+reading(c),onclick:function(){S.ch=c;env.render();window.scrollTo(0,0);}},
        h("div",{style:"font-size:28px;line-height:1.2"},c),h("div",{class:"muted small"},reading(c)),
        done[c]?h("span",{style:"position:absolute;top:2px;right:6px;font-size:12px;color:var(--ok)"},"✓"):null));
    });
    root.append(grid);
    if(env.lang()==="ja")root.append(h("p",{class:"muted small",style:"margin-top:14px"},"Зурлагын өгөгдөл: KanjiVG (CC BY-SA 3.0)"));
  }
  function viewPad(root){
    var ch=S.ch,sets=SETS[env.lang()],list=[];sets.forEach(function(s){if(s[2].indexOf(ch)>=0)list=s[2];});
    root.append(h("button",{class:"back",onclick:function(){S.ch=null;env.render();}},"‹ Үсгүүд"));
    var info=h("p",{class:"muted small",style:"margin:4px 0 0;min-height:1.4em","aria-live":"polite"},"Ачаалж байна…");
    root.append(h("div",{style:"display:flex;align-items:center;gap:12px"},
      h("div",{style:"font-size:48px;font-weight:800;line-height:1"},ch),
      h("div",{style:"flex:1"},h("div",{style:"font-weight:700"},reading(ch)),info),
      h("button",{class:"btn",style:"flex:none","aria-label":"Сонсох",onclick:function(){say(ch);}},"🔊")));
    var size=Math.min(320,Math.round(window.innerWidth*0.82)),dpr=window.devicePixelRatio||1,sc=size/109;
    var cv=h("canvas",{width:String(size*dpr),height:String(size*dpr),style:"width:"+size+"px;height:"+size+"px;touch-action:none;display:block;margin:12px auto;border-radius:18px;background:var(--surface);box-shadow:var(--sh-card,0 2px 8px rgba(0,0,0,.08))","aria-label":"Зурах талбай"});
    root.append(cv);
    var row=h("div",{class:"row",style:"flex-wrap:wrap"});root.append(row);
    var res=h("div");root.append(res);
    var ctx=cv.getContext("2d"),ink=getComputedStyle(document.body).color||"#222";
    var P={strokes:null,k:0,miss:0,fails:0,user:null,guide:true,hint:-1,anim:null,done:false};
    function line(p,w,col){if(!p.length)return;ctx.strokeStyle=col;ctx.lineWidth=w*dpr;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(p[0][0]*sc*dpr,p[0][1]*sc*dpr);for(var i=1;i<p.length;i++)ctx.lineTo(p[i][0]*sc*dpr,p[i][1]*sc*dpr);ctx.stroke();}
    function dot(q,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(q[0]*sc*dpr,q[1]*sc*dpr,5*dpr,0,Math.PI*2);ctx.fill();}
    function paint(partial){
      ctx.clearRect(0,0,cv.width,cv.height);
      /* туслах шугам */
      ctx.strokeStyle="rgba(128,128,128,.25)";ctx.lineWidth=1*dpr;ctx.setLineDash([6*dpr,6*dpr]);
      ctx.beginPath();ctx.moveTo(cv.width/2,0);ctx.lineTo(cv.width/2,cv.height);ctx.moveTo(0,cv.height/2);ctx.lineTo(cv.width,cv.height/2);ctx.stroke();ctx.setLineDash([]);
      if(!P.strokes)return;
      if(P.guide)P.strokes.forEach(function(s){line(s,size/22,"rgba(128,128,128,.22)");});
      for(var i=0;i<P.k;i++)line(P.strokes[i],size/24,ink);
      if(P.hint>=0&&P.strokes[P.hint]){line(P.strokes[P.hint],size/24,"rgba(230,120,40,.75)");dot(P.strokes[P.hint][0],"rgb(230,120,40)");}
      if(partial)line(partial[0],size/24,partial[1]);
      if(P.user)line(P.user,size/26,"rgba(70,110,230,.9)");
    }
    function status(t){info.textContent=t;}
    function progress(){status(P.done?"Дууссан!":"Зурлага "+(P.k+1)+" / "+P.strokes.length);}
    function stopAnim(){if(P.anim){cancelAnimationFrame(P.anim);P.anim=null;if(P.keep!=null){P.k=P.keep;P.keep=null;paint();}}}
    /* бүх зурлагыг дарааллаар нь зурж үзүүлнэ */
    function demo(){
      stopAnim();var i=0,t0=null;P.keep=P.k;P.k=0;P.hint=-1;
      function step(ts){
        if(t0==null)t0=ts;var s=P.strokes[i],dur=Math.max(350,len(s)*9),f=Math.min(1,(ts-t0)/dur);
        paint([s.slice(0,Math.max(2,Math.round(s.length*f))),"rgba(230,120,40,.9)"]);
        if(f>=1){P.k=i+1;i++;t0=null;if(i>=P.strokes.length){P.anim=null;P.k=P.keep;P.keep=null;setTimeout(function(){paint();},400);return;}}
        P.anim=requestAnimationFrame(step);
      }
      P.anim=requestAnimationFrame(step);
    }
    function finish(){
      P.done=true;progress();paint();
      var done=env.sget(doneKey(),{})||{},first=!done[ch];done[ch]=1;env.sset(doneKey(),done);
      env.addXP(first?3:1);if(P.miss===0)env.celebrate();
      var i=list.indexOf(ch),nx=list[i+1];
      res.textContent="";
      res.append(h("div",{class:"fb "+(P.miss?"bad":"ok")},P.miss?"Бичлээ! Алдаа: "+P.miss+". Дахин нэг бичээд үз.":"Төгс! Бүх зурлага зөв 🎉"));
      res.append(h("div",{class:"row"},h("button",{class:"btn",onclick:reset},"↺ Дахин"),nx?h("button",{class:"btn primary",onclick:function(){S.ch=nx;env.render();}},"Дараагийн: "+nx+" ›"):null));
    }
    function reset(){stopAnim();P.k=0;P.miss=0;P.fails=0;P.hint=-1;P.user=null;P.done=false;res.textContent="";progress();paint();}
    row.append(
      h("button",{class:"btn",onclick:function(){if(P.strokes)demo();}},"▶ Дараалал"),
      h("button",{class:"btn",onclick:function(){if(P.strokes&&!P.done){P.hint=P.k;paint();}}},"💡 Сануул"),
      h("button",{class:"btn",onclick:function(){P.guide=!P.guide;paint();}},"Сүүдэр"),
      h("button",{class:"btn ghost",onclick:reset},"↺ Арилгах"));
    function pos(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)/sc,(e.clientY-r.top)/sc];}
    cv.addEventListener("pointerdown",function(e){if(!P.strokes||P.done)return;stopAnim();try{cv.setPointerCapture(e.pointerId);}catch(x){}P.user=[pos(e)];e.preventDefault();});
    cv.addEventListener("pointermove",function(e){if(!P.user)return;P.user.push(pos(e));paint();e.preventDefault();});
    function up(){
      if(!P.user)return;var u=P.user;P.user=null;
      var v=judge(u,P.strokes[P.k]);
      if(v==="ok"){P.k++;P.fails=0;P.hint=-1;if(P.k>=P.strokes.length)return finish();progress();paint();return;}
      if(v==="short"){paint();return;}
      P.miss++;P.fails++;
      if(P.fails>=2)P.hint=P.k;
      paint();
      status(v==="dir"?"↩️ Чиглэл буруу — "+(P.k+1)+"-р зурлагыг эсрэг талаас нь эхлүүл.":"✖ "+(P.k+1)+"-р зурлага таарсангүй."+(P.fails>=2?" Улбар шар сануулгыг дагаарай.":" Дахин оролдоорой."));
    }
    cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",function(){P.user=null;paint();});
    paint();
    strokesFor(ch).then(function(st){if(S.ch!==ch)return;P.strokes=st;progress();paint();},function(){status("Зурлагын өгөгдөл ачаалагдсангүй. Интернетээ шалгана уу.");});
  }
  window.StrokeWrite={
    has:function(lang){return !!SETS[lang];},
    view:function(e){
      env=e;h=e.h;var root=h("div");
      if(S.lang!==env.lang()){S.lang=env.lang();S.set=null;S.ch=null;}
      if(S.ch)viewPad(root);else viewGrid(root);
      return root;
    },
    _judge:judge,_jamo:JAMO
  };
})();
