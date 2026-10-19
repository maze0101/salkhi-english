/* Салхи: 🚌 Автобусны горим — дэлгэц рүү харахгүйгээр зөвхөн чихээр давтах хичээл, замын хугацаанд (10–45 мин)
   тааруулна: гадаад үг → монгол утга → жишээ өгүүлбэр (удаан), давтах үгс эхэндээ. Wake Lock-оор дэлгэцийг асаалттай,
   Media Session-оор чихэвчний товчоор зогсоож/үргэлжлүүлнэ.
   «Автоматаар таних» асаалттай бол (апп нээлттэй үед) GPS хурд ≥16 км/ц гурван удаа дараалан → дээд талд санал гарна. */
(function(){
  var env=null,h=null,S={min:+(localStorage.getItem("salkhi:cmMin")||20)||20,run:null};
  var watchId=null,fast=0,offered=0,banner=null;
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function fmt(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
  function lock(on){
    try{if(on&&navigator.wakeLock&&!S.wl)navigator.wakeLock.request("screen").then(function(l){S.wl=l;},function(){});
      if(!on&&S.wl){S.wl.release();S.wl=null;}}catch(e){}
  }
  function media(){
    if(!("mediaSession" in navigator))return;
    try{navigator.mediaSession.metadata=new MediaMetadata({title:"Салхи — автобусны хичээл",artist:env.langName()+" хэл",artwork:[{src:"icon-192.png",sizes:"192x192",type:"image/png"}]});
      navigator.mediaSession.setActionHandler("pause",function(){pause(true);});navigator.mediaSession.setActionHandler("play",function(){pause(false);});
      navigator.mediaSession.setActionHandler("stop",function(){stop();});}catch(e){}
  }
  function start(){
    var n=Math.max(8,Math.round(S.min*60/13));
    var ws=env.words(n).filter(function(w){return w&&w[1]&&w[2];});
    if(!ws.length){env.toast("Давтах үг алга — эхлээд хэдэн үг сур");return;}
    S.run={ws:ws,i:0,end:Date.now()+S.min*60000,paused:false,heard:0,step:"",tok:0};
    lock(true);media();env.render();say();
  }
  function wait(ms,tok,f){setTimeout(function(){if(S.run&&!S.run.paused&&S.run.tok===tok)f();},ms);}
  function say(){
    var R=S.run;if(!R||R.paused)return;
    if(Date.now()>=R.end||R.i>=R.ws.length){finish();return;}
    var w=R.ws[R.i],tok=++R.tok;R.step="w";paint();
    env.speak(w[1],function(){wait(1100,tok,function(){
      R.step="mn";paint();
      env.speakMn(w[2],function(){wait(700,tok,function(){
        var ex=w[3]&&w[3].length<=120?w[3]:null;
        var nx=function(){R.heard++;R.i++;wait(900,tok,say);};
        if(ex){R.step="ex";paint();env.speak(ex,function(){wait(400,tok,function(){env.speak(w[1],nx);});},true);}
        else{R.step="w2";paint();env.speak(w[1],nx);}
      });});
    });});
  }
  function pause(p){var R=S.run;if(!R)return;R.paused=p;R.tok++;if(p){env.stop();R.left=R.end-Date.now();}else{R.end=Date.now()+(R.left||0);say();}env.render();}
  function finish(){var R=S.run;if(!R)return;env.stop();lock(false);var xp=Math.max(1,Math.round(R.heard/5));env.addXP(xp);env.toast("🚌 Аудио хичээл дууслаа: "+R.heard+" үг · +"+xp+" XP");S.run=null;env.render();}
  function stop(){if(!S.run)return;S.run.tok++;finish();}
  function paint(){var el=document.getElementById("cm-now");if(!el||!S.run)return;var R=S.run,w=R.ws[R.i];if(!w)return;
    el.querySelector("b").textContent=w[1];el.querySelector(".cm-mn").textContent=R.step==="w"?"…":w[2];
    var t=document.getElementById("cm-left");if(t)t.textContent=fmt((R.paused?R.left:R.end-Date.now())/1000);}
  /* ---- хөдөлгөөн таних ---- */
  function watch(e,open){
    env=env||e;h=h||e.h;
    if(watchId!=null||!navigator.geolocation||localStorage.getItem("salkhi:cmAuto")!=="1")return;
    try{watchId=navigator.geolocation.watchPosition(function(p){
      var sp=p.coords.speed;if(sp==null||document.hidden||S.run)return;
      fast=sp>=4.5?fast+1:0;
      if(fast>=3&&Date.now()-offered>45*60000){offered=Date.now();offer(open);}
    },function(){},{enableHighAccuracy:false,maximumAge:15000,timeout:20000});}catch(x){}
  }
  function unwatch(){if(watchId!=null){try{navigator.geolocation.clearWatch(watchId);}catch(e){}watchId=null;}}
  function offer(open){
    if(banner)banner.remove();
    banner=document.createElement("div");banner.setAttribute("role","status");
    banner.style.cssText="position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:200;max-width:460px;margin:0 auto;display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:16px;background:var(--surface);color:var(--ink);border:1px solid var(--line);box-shadow:0 12px 30px rgba(0,0,0,.2)";
    banner.innerHTML='<span style="font-size:26px">🚌</span><div style="flex:1"><b>Замд явж байна уу?</b><div class="muted small">Дэлгэц рүү харахгүйгээр чихээр давтъя</div></div>';
    var go=document.createElement("button");go.className="btn primary";go.textContent="▶ Эхлэх";go.style.flex="none";
    go.onclick=function(){banner.remove();banner=null;open(true);};
    var x=document.createElement("button");x.className="btn ghost";x.textContent="✕";x.setAttribute("aria-label","Хаах");x.onclick=function(){banner.remove();banner=null;};
    banner.append(go,x);document.body.append(banner);setTimeout(function(){if(banner){banner.remove();banner=null;}},30000);
  }
  function view(e,autostart){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){stop();e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"🚌 Автобусны горим"));
    if(S.run){
      var R=S.run,w=R.ws[R.i]||R.ws[R.ws.length-1];
      put(root,h("div",{id:"cm-now",class:"note",style:"text-align:center;padding:28px 16px"},h("div",{class:"muted small"},"🎧 Чихэвчээ зүүгээд дэлгэц рүү харах хэрэггүй"),
        h("b",{lang:env.lang(),style:"display:block;font-size:30px;margin:12px 0 6px"},w[1]),h("div",{class:"cm-mn muted",style:"font-size:18px"},w[2]),
        h("div",{style:"margin-top:16px;font-size:14px"},"⏱️ ",h("span",{id:"cm-left"},fmt((R.paused?R.left:R.end-Date.now())/1000))," үлдсэн · ✅ "+R.heard+" үг")));
      put(root,h("div",{class:"row",style:"margin-top:12px;gap:8px"},
        h("button",{class:"btn primary",style:"flex:1",onclick:function(){pause(!R.paused);}},R.paused?"▶ Үргэлжлүүлэх":"⏸ Түр зогсоох"),
        h("button",{class:"btn",onclick:stop},"⏹ Дуусгах")));
      return root;
    }
    put(root,h("p",{class:"muted"},"Автобус, машинд явахдаа дэлгэц рүү харахгүйгээр чихээр давтана: "+env.langName().toLowerCase()+" үг → монгол утга → жишээ өгүүлбэр. Замын хугацаагаа сонго."));
    put(root,h("div",{class:"seg",style:"margin:8px 0 12px"},[10,20,30,45].map(function(m){
      return h("button",{"aria-pressed":String(S.min===m),onclick:function(){S.min=m;try{localStorage.setItem("salkhi:cmMin",m);}catch(x){}env.render();}},m+" мин");
    })));
    put(root,h("div",{class:"muted small",style:"margin-bottom:10px"},"≈ "+Math.round(S.min*60/13)+" үг давтана. Давтах хугацаа болсон үгс эхэнд."));
    put(root,h("button",{class:"btn primary",style:"width:100%",onclick:start},"▶ Эхлэх"));
    var auto=localStorage.getItem("salkhi:cmAuto")==="1";
    put(root,h("label",{class:"note",style:"display:flex;gap:10px;align-items:center;margin-top:14px;cursor:pointer"},
      h("input",{type:"checkbox",checked:auto,onchange:function(ev){
        try{localStorage.setItem("salkhi:cmAuto",ev.target.checked?"1":"0");}catch(x){}
        if(ev.target.checked)watch(env,function(){});else unwatch();env.render();
      }}),
      h("div",{style:"flex:1"},h("b",null,"🛰️ Замд явж буйг автоматаар таних"),h("div",{class:"muted small"},"Апп нээлттэй байхад хурдаар (≥16 км/ц) машин, автобусанд явж байгааг мэдэж санал болгоно. Байршлын зөвшөөрөл хэрэгтэй; байршил хаашаа ч илгээгдэхгүй."))));
    if(autostart&&!S.run)setTimeout(start,300);
    return root;
  }
  window.Commute={view:view,watch:watch,unwatch:unwatch,running:function(){return !!S.run;}};
})();
