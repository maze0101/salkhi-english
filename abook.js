/* Салхи: 📚 аудио ном — аппын түүхүүдийг (STORIES) өгүүлбэр өгүүлбэрээр нь тасралтгүй уншина.
   Сонголт: өгүүлбэр бүрийн дараа монгол орчуулга, өгүүлбэр хоорондын завсар, удаан хурд, дараагийн түүх рүү автоматаар, унтах таймер.
   Media Session (түгжээтэй дэлгэц/чихэвчний товч): тоглуулах/зогсоох, өмнөх/дараагийн өгүүлбэр.
   Өөр дуу эхэлбэл (audioQ id өөрчлөгдвөл) ном зогсоно. Сонссон түүх sget "abDone" {lang:index:1}. */
(function(){
  var env=null,h=null;
  var A={on:false,si:null,i:0,mn:false,gap:1,slow:false,auto:true,sleep:0,sleepAt:0,qid:null,timer:null,lv:"all",gen:0};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function stories(){return env.stories()||[];}
  function cur(){return stories()[A.si];}
  function paint(){if(env&&env.visible())env.render();}
  function meta(){
    try{
      if(!("mediaSession" in navigator))return;
      var s=cur();if(!s)return;
      navigator.mediaSession.metadata=new MediaMetadata({title:s.t,artist:"Салхи · "+env.langName(),album:"Аудио ном",artwork:[{src:"icon-512.png",sizes:"512x512",type:"image/png"}]});
      navigator.mediaSession.playbackState=A.on?"playing":"paused";
      navigator.mediaSession.setActionHandler("play",function(){if(!A.on)play();});
      navigator.mediaSession.setActionHandler("pause",function(){stop(true);});
      navigator.mediaSession.setActionHandler("nexttrack",function(){jump(1);});
      navigator.mediaSession.setActionHandler("previoustrack",function(){jump(-1);});
    }catch(e){}
  }
  function stop(keep){
    A.on=false;A.gen++;clearTimeout(A.timer);A.timer=null;A.qid=null;env.stop();
    try{if("mediaSession" in navigator)navigator.mediaSession.playbackState="paused";}catch(e){}
    if(!keep)A.sleepAt=0;
    paint();
  }
  function jump(d){
    var s=cur();if(!s)return;
    A.i=Math.max(0,Math.min(s.s.length-1,A.i+d));
    if(A.on){clearTimeout(A.timer);env.stop();step();}else paint();
  }
  function finishStory(){
    var dn=env.sget("abDone",{})||{};dn[env.lang()+":"+A.si]=1;env.sset("abDone",dn);
    env.addXP(2);env.logAct("ab");
    var list=stories(),nx=A.si+1;
    if(A.auto&&nx<list.length){A.si=nx;A.i=0;meta();A.timer=setTimeout(step,1500);paint();return;}
    A.i=0;stop();env.toast("📚 Түүх дууслаа");
  }
  /* нэг өгүүлбэр: зорилтот хэлээр → (сонгосон бол) монголоор → завсар → дараагийх */
  function step(){
    if(!A.on)return;
    var g=++A.gen;
    if(A.sleepAt&&Date.now()>=A.sleepAt){stop();env.toast("😴 Унтах таймер — ном зогслоо");return;}
    var s=cur();if(!s||!s.s[A.i]){finishStory();return;}
    var line=s.s[A.i];paint();
    var watch=function(next){
      return function(){
        /* өөр дуу эхэлж бидний дарааллыг тасалсан бол зогсоно */
        if(!A.on||g!==A.gen)return;
        if(A.qid!=null&&env.qid()!==A.qid){A.on=false;A.qid=null;paint();return;}
        next();
      };
    };
    var after=function(){
      A.timer=setTimeout(function(){if(!A.on||g!==A.gen)return;A.i++;if(A.i>=s.s.length){finishStory();return;}step();},A.gap*1000);
    };
    env.speak(line[0],watch(function(){
      if(A.mn&&line[1]){env.speakMn(line[1],watch(after));A.qid=env.qid();}
      else after();
    }),A.slow);
    A.qid=env.qid();
  }
  function play(){
    if(A.si==null)return;
    A.on=true;if(A.sleep&&!A.sleepAt)A.sleepAt=Date.now()+A.sleep*60000;
    meta();step();
  }
  function seg(label,opts,val,set){
    return h("div",{style:"margin-top:8px"},h("div",{class:"muted small"},label),
      h("div",{class:"seg",style:"margin:4px 0 0"},opts.map(function(o){return h("button",{"aria-pressed":String(val===o[0]),onclick:function(){set(o[0]);paint();}},o[1]);})));
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),list=stories(),dn=env.sget("abDone",{})||{},L=env.lang();
    if(A.si!=null&&(!list[A.si]||A.lang!==L)){if(A.on)stop();A.si=null;}
    A.lang=L;
    if(A.si==null){
      put(root,h("p",{class:"muted"},"Түүхүүдийг эхнээс нь дуустал тасралтгүй сонсоно — машин жолоодох, алхах, унтахын өмнө. Хүсвэл өгүүлбэр бүрийн дараа монгол орчуулгыг нь уншина."));
      var lvs=[];list.forEach(function(s){if(lvs.indexOf(s.lv)<0)lvs.push(s.lv);});lvs.sort();
      if(lvs.length>1)put(root,h("div",{class:"seg",style:"flex-wrap:wrap"},[["all","Бүгд"]].concat(lvs.map(function(l){return [l,l.toUpperCase()];})).map(function(o){return h("button",{"aria-pressed":String(A.lv===o[0]),onclick:function(){A.lv=o[0];paint();}},o[1]);})));
      list.forEach(function(s,i){
        if(A.lv!=="all"&&s.lv!==A.lv)return;
        var heard=dn[L+":"+i];
        put(root,h("button",{class:"lrow",type:"button",style:"width:100%;margin-top:8px",onclick:function(){A.si=i;A.i=0;paint();window.scrollTo(0,0);}},
          h("span",{class:"lnum","aria-hidden":"true"},heard?"✓":"🎧"),
          h("span",null,h("div",{class:"t",lang:L},s.t),h("div",{class:"muted small"},String(s.lv||"").toUpperCase()+" · "+s.s.length+" өгүүлбэр · ≈"+Math.max(1,Math.round(s.s.length*(A.mn?9:5)/60))+" мин"))));
      });
      if(!list.length)put(root,h("p",{class:"muted"},"Энэ хэлэнд түүх алга."));
      return root;
    }
    var s=cur();
    put(root,h("button",{class:"back",onclick:function(){stop();A.si=null;paint();}},"‹ Түүхүүд"));
    put(root,h("h3",{lang:L,style:"margin:6px 0"},"🎧 "+s.t));
    var box=h("div",{class:"note",style:"max-height:46vh;overflow:auto"});
    s.s.forEach(function(p,i){
      var on=i===A.i;
      put(box,h("button",{type:"button",style:"display:block;width:100%;text-align:left;background:"+(on?"color-mix(in srgb,var(--sky) 14%,transparent)":"none")+";border:0;border-radius:8px;padding:6px 8px;color:inherit;font:inherit;cursor:pointer",
        "aria-current":on?"true":null,onclick:function(){A.i=i;if(A.on){clearTimeout(A.timer);env.stop();step();}else paint();}},
        h("div",{lang:L,style:"font-weight:"+(on?800:500)},p[0]),
        on||A.mn?h("div",{class:"muted small"},p[1]):null));
    });
    put(root,box);
    setTimeout(function(){var c=box.querySelector("[aria-current]");if(c&&c.scrollIntoView&&A.on)c.scrollIntoView({block:"nearest"});},0);
    put(root,h("div",{class:"row",style:"margin-top:10px"},
      h("button",{class:"btn","aria-label":"Өмнөх өгүүлбэр",onclick:function(){jump(-1);}},"⏮"),
      h("button",{class:"btn primary",style:"flex:2;font-size:18px",onclick:function(){if(A.on)stop(true);else play();}},A.on?"⏸ Түр зогсоох":"▶️ Тоглуулах"),
      h("button",{class:"btn","aria-label":"Дараагийн өгүүлбэр",onclick:function(){jump(1);}},"⏭")));
    put(root,h("p",{class:"muted small",style:"text-align:center;margin:6px 0"},(A.i+1)+" / "+s.s.length+(A.sleepAt?" · 😴 "+Math.max(0,Math.ceil((A.sleepAt-Date.now())/60000))+" минутын дараа зогсоно":"")));
    var opt=h("details",{class:"note fold"},h("summary",null,"⚙️ Тохиргоо"));
    put(opt,
      seg("Монгол орчуулга",[[false,"Үгүй"],[true,"🇲🇳 Өгүүлбэр бүрийн дараа"]],A.mn,function(v){A.mn=v;}),
      seg("Өгүүлбэр хоорондын завсар",[[0,"0с"],[1,"1с"],[3,"3с"],[5,"5с (давтах)"]],A.gap,function(v){A.gap=v;}),
      seg("Хурд",[[false,"Хэвийн"],[true,"🐢 Удаан"]],A.slow,function(v){A.slow=v;}),
      seg("Түүх дуусахад",[[true,"Дараагийнх руу"],[false,"Зогсох"]],A.auto,function(v){A.auto=v;}),
      seg("Унтах таймер",[[0,"Үгүй"],[15,"15 мин"],[30,"30 мин"],[60,"60 мин"]],A.sleep,function(v){A.sleep=v;A.sleepAt=v&&A.on?Date.now()+v*60000:0;}));
    put(root,opt);
    put(root,h("p",{class:"muted small"},"Дэлгэц унтарсан үед зарим утас (ялангуяа iPhone) дууг зогсоож магадгүй. Тэгвэл дэлгэцээ асаалттай байлгаарай."));
    return root;
  }
  window.ABook={view:view,stop:function(){if(A.on)stop();},playing:function(){return A.on;}};
})();
