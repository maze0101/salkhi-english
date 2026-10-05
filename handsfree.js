/* Салхи: 🎧 гар чөлөөтэй горим — автобус, машинд, алхаж явахдаа дэлгэц харахгүйгээр сурна.
   «Ярьж хариулах»: апп үгийг хэлнэ → хэрэглэгч монгол утгыг чангаар хэлнэ (яриа таних, mn-MN) → апп монголоор «Зөв!» эсвэл зөв хариултыг хэлнэ.
   «Зөвхөн сонсох»: үг → завсарлага → монгол утга → үгийг дахин (подкаст шиг). Давтах хугацаа болсон үгсээс эхэлнэ.
   Дэлгэц унтрахгүй (Wake Lock), утасны түгжээтэй дэлгэц дээр ⏯/⏭ (Media Session). */
(function(){
  var N=20,env=null,h=null,H=null,lock=null;
  function norm(t){return String(t||"").toLowerCase().replace(/[.,!?;:"«»()\-–—]/g," ").replace(/\s+/g," ").trim();}
  function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i];}for(j=0;j<=n;j++)d[0][j]=j;
    for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}
  /* монгол утгын аль нэг хувилбартай таарвал зөв («ном, тэмдэглэл» → «ном» зөв) */
  function match(said,mn){
    var s=norm(said);if(!s)return false;
    var alts=String(mn).split(/[,;\/()]| эсвэл /).map(norm).filter(function(x){return x.length>=2;});
    /* «хамааралтай» ≠ «хамааралгүй»: үгүйсгэл таарахгүй бол буруу; ижил үндэстэй (боломжит ~ боломжтой) бол зөв */
    var neg=function(x){return /(гүй|үгүй|бус)(s|$)/.test(x);},pre=function(x,y){var i=0;while(i<x.length&&x[i]===y[i])i++;return i;};
    return alts.some(function(a){
      if(neg(s)!==neg(a))return false;
      if(s===a||s.indexOf(a)>=0||(s.length>=3&&a.indexOf(s)>=0))return true;
      if(a.length>=5&&pre(s,a)>=Math.min(6,a.length-1))return true;
      var r=1-lev(s,a)/Math.max(s.length,a.length);if(r>=0.72)return true;
      return s.split(" ").some(function(w){return w.length>=3&&1-lev(w,a)/Math.max(w.length,a.length)>=0.75;});
    });
  }
  function wait(ms,fn){var cur=H;H.t=setTimeout(function(){if(H===cur&&H.on)fn();},ms);}
  function say(t,cb){var cur=H;env.speak(t,function(){if(H===cur&&H.on)cb();});}
  function sayMn(t,cb){var cur=H;env.speakMn(t,function(){if(H===cur&&H.on)cb();});}
  function paint(){if(env&&env.visible())env.render();}
  function media(){
    if(!("mediaSession" in navigator)||!H)return;
    try{
      var w=H.q[H.i];
      navigator.mediaSession.metadata=new MediaMetadata({title:w?w[1]:"Салхи",artist:"Салхи · гар чөлөөтэй",album:(H.i+1)+" / "+H.q.length});
      navigator.mediaSession.setActionHandler("play",function(){resume();});
      navigator.mediaSession.setActionHandler("pause",function(){pause();});
      navigator.mediaSession.setActionHandler("nexttrack",function(){skip();});
    }catch(e){}
  }
  function wake(){try{if(navigator.wakeLock&&!lock)navigator.wakeLock.request("screen").then(function(l){lock=l;l.addEventListener("release",function(){lock=null;});}).catch(function(){});}catch(e){}}
  function unwake(){try{if(lock)lock.release();}catch(e){}lock=null;}

  function start(mode){
    var q=env.words(N);
    if(q.length<3){env.toast("Сонсох үг хүрэлцэхгүй байна");return;}
    H={on:true,mode:mode,q:q,i:0,ok:0,ans:0,phase:"word",heard:"",res:null,t:null};
    wake();step();
  }
  function step(){
    if(!H||!H.on)return;
    if(H.i>=H.q.length){finish();return;}
    var w=H.q[H.i];H.phase="word";H.heard="";H.res=null;media();paint();
    say(w[1],function(){
      if(H.mode==="listen"){
        H.phase="think";paint();
        wait(2500,function(){H.phase="answer";paint();sayMn(w[2],function(){wait(700,function(){say(w[1],function(){wait(1200,next);});});});});
        return;
      }
      listen(w);
    });
  }
  function listen(w){
    var SRc=env.SR();
    if(!SRc){H.mode="listen";step();return;}
    H.phase="listen";paint();
    var cur=H,got="",r;
    try{r=new SRc();}catch(e){H.mode="listen";step();return;}
    r.lang="mn-MN";r.interimResults=false;r.maxAlternatives=3;
    r.onresult=function(e){var a=e.results[0];got=[].map.call(a,function(x){return x.transcript;}).join(" | ");};
    r.onerror=function(e){if(e.error==="not-allowed"||e.error==="service-not-allowed"){env.toast(env.micHint(),6000);if(H===cur)H.mode="listen";}};
    r.onend=function(){
      if(H!==cur||!H.on)return;H.rec=null;
      if(!got){H.phase="answer";H.res="skip";paint();sayMn(w[2],function(){wait(600,function(){say(w[1],function(){wait(900,next);});});});return;}
      var ok=got.split(" | ").some(function(g){return match(g,w[2]);});
      H.heard=got.split(" | ")[0];H.res=ok?"ok":"bad";H.ans++;if(ok)H.ok++;
      env.grade(w,ok);H.phase="answer";paint();
      if(ok)sayMn("Зөв!",function(){wait(500,next);});
      else sayMn("Зөв нь: "+w[2],function(){wait(500,function(){say(w[1],function(){wait(900,next);});});});
    };
    H.rec=r;
    try{r.start();}catch(e){H.mode="listen";step();}
  }
  function next(){if(!H)return;H.i++;step();}
  function skip(){if(!H)return;clearTimeout(H.t);if(H.rec)try{H.rec.abort();}catch(e){}env.stop();H.on=true;next();}
  function pause(){if(!H)return;H.on=false;clearTimeout(H.t);if(H.rec)try{H.rec.abort();}catch(e){}env.stop();paint();}
  function resume(){if(!H||H.on)return;H.on=true;step();}
  function finish(){
    H.on=false;H.phase="done";unwake();
    env.addXP(Math.max(3,H.ok*2+Math.round(H.q.length/4)));env.logAct("s");
    paint();
    var msg=H.mode==="speak"&&H.ans?"Дууслаа! "+H.q.length+" үгээс "+H.ok+" зөв хариуллаа.":"Дууслаа! "+H.q.length+" үг сонслоо.";
    env.speakMn(msg+" Сайн ажиллалаа!",function(){});
  }
  function stopAll(){if(H){H.on=false;clearTimeout(H.t);if(H.rec)try{H.rec.abort();}catch(e){}}env.stop();unwake();H=null;}

  function view(e){
    env=e;h=e.h;var root=h("div");
    if(!H){
      root.append(h("p",{class:"muted"},"Автобус, машинд эсвэл алхаж явахдаа дэлгэц харахгүйгээр сур. Чихэвчээ зүүгээд эхлүүлээрэй 🎧"));
      root.append(h("button",{class:"gamecard",type:"button",onclick:function(){start("speak");}},h("i",{"aria-hidden":"true"},"🗣️"),
        h("div",null,h("b",null,"Ярьж хариулах"),h("span",null,"Апп үгийг хэлнэ, чи монгол утгыг нь чангаар хэлнэ"))));
      root.append(h("button",{class:"gamecard",type:"button",onclick:function(){start("listen");}},h("i",{"aria-hidden":"true"},"👂"),
        h("div",null,h("b",null,"Зөвхөн сонсох"),h("span",null,"Подкаст шиг: үг → завсарлага → монгол утга"))));
      if(!e.SR())root.append(h("p",{class:"muted small"},"⚠️ Энэ хөтөч яриа таних боломжгүй тул «Зөвхөн сонсох» горимоор ажиллана."));
      root.append(h("p",{class:"muted small"},"Давтах хугацаа болсон үгсээс эхэлж, нэг удаад "+N+" үг. Утас түгжигдсэн үед чихэвчний товчоор ⏯ зогсоож, ⏭ алгасна."));
      return root;
    }
    var w=H.q[Math.min(H.i,H.q.length-1)];
    if(H.phase==="done"){
      root.append(h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:42px"},"🎧"),
        h("b",null,H.mode==="speak"&&H.ans?H.ok+" / "+H.ans+" зөв":H.q.length+" үг сонслоо"),h("div",{class:"muted"},"Сайн ажиллалаа!")));
      root.append(h("div",{class:"row"},h("button",{class:"btn",onclick:function(){stopAll();e.render();}},"Буцах"),h("button",{class:"btn primary",onclick:function(){var m=H.mode;stopAll();start(m);}},"🔁 Дахин")));
      return root;
    }
    var lab={word:"🔊 Сонс…",think:"🤔 Бод…",listen:"🎙️ Монгол утгыг нь хэл",answer:H.res==="ok"?"✅ Зөв!":H.res==="bad"?"❌ Зөв нь:":"💡 Утга нь:"}[H.phase];
    root.append(h("div",{class:"muted small",style:"text-align:center"},(H.i+1)+" / "+H.q.length+(H.mode==="speak"?" · ✅ "+H.ok:"")));
    root.append(h("div",{class:"vcorb"+(H.phase==="listen"?" on":H.phase==="word"?" talk":""),"aria-hidden":"true"},H.phase==="listen"?"🎙️":"🎧"));
    root.append(h("div",{style:"text-align:center;font-weight:700","aria-live":"polite"},lab));
    root.append(h("div",{style:"text-align:center;font:800 30px/1.3 var(--font);margin:8px 0"},w[1]));
    if(H.phase==="answer")root.append(h("div",{style:"text-align:center;font-size:20px"},w[2]));
    if(H.heard)root.append(h("div",{class:"muted small",style:"text-align:center"},"Чи: «"+H.heard+"»"));
    root.append(h("div",{class:"row"},
      h("button",{class:"btn",onclick:function(){stopAll();e.render();}},"⏹ Зогсоох"),
      H.on?h("button",{class:"btn",onclick:pause},"⏸ Түр зогсоох"):h("button",{class:"btn primary",onclick:resume},"▶️ Үргэлжлүүлэх"),
      h("button",{class:"btn",onclick:skip},"⏭")));
    return root;
  }
  window.HandsFree={view:view,stop:stopAll,active:function(){return !!(H&&H.on);},_match:match};
})();
