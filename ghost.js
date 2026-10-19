/* Салхи: 👻 Сүүдэртэй уралдах — 15 асуулттай утга сонгох уралдаан. Зөв хариулт бүрийн цагийг тэмдэглэж,
   ~7 хоногийн өмнөх (байхгүй бол хамгийн сайн өмнөх) өөрийн гүйлттэй «сүнс» болгон зэрэгцүүлж уралдана.
   Буруу хариулт +3 сек торгууль. Гүйлтүүд sget("ghost:<хэл>") — сүүлийн 30. */
(function(){
  var env=null,h=null,R=null,timer=null;
  var N=15,PEN=3000,WEEK=7*86400000;
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0,t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function runs(){var a=env.sget("ghost:"+env.lang(),[]);return Array.isArray(a)?a:[];}
  function fmt(ms){return (ms/1000).toFixed(1)+" сек";}
  /* сүнс: 5–10 хоногийн өмнөхөөс 7 хоногт хамгийн ойрыг, эс бөгөөс хамгийн хурдан өмнөхийг */
  function pickGhost(){
    var a=runs(),now=Date.now();if(!a.length)return null;
    var wk=a.filter(function(r){return now-r.ts>=5*86400000;}).sort(function(x,y){return Math.abs(now-x.ts-WEEK)-Math.abs(now-y.ts-WEEK);})[0];
    if(wk)return {r:wk,why:"7 хоногийн өмнөх чи"};
    var best=a.slice().sort(function(x,y){return x.total-y.total;})[0];
    return {r:best,why:"Чиний хамгийн хурдан гүйлт"};
  }
  function begin(){
    var pool=env.pool(),all=env.all();
    if(pool.length<6){env.toast("Уралдахад ядаж 6 үг хэрэгтэй");return;}
    var ws=shuffle(pool).slice(0,N);
    R={g:pickGhost(),qs:ws.map(function(w){var o=shuffle(all.filter(function(y){return y[2]!==w[2];})).slice(0,3).map(function(y){return y[2];});return {w:w,opts:shuffle(o.concat([w[2]]))};}),
      i:0,t0:Date.now(),pen:0,marks:[],miss:0,flash:null,done:false,qt:Date.now()};
    clearInterval(timer);timer=setInterval(tick,200);env.render();
  }
  function now(){return Date.now()-R.t0+R.pen;}
  function tick(){
    if(!R||R.done){clearInterval(timer);return;}
    var me=document.getElementById("gh-me"),gh=document.getElementById("gh-gh"),tt=document.getElementById("gh-t");
    if(!me){clearInterval(timer);return;}
    var t=now();if(tt)tt.textContent=fmt(t);
    if(gh&&R.g){var n=R.g.r.marks.filter(function(m){return m<=t;}).length;gh.style.width=(n/N*100)+"%";gh.setAttribute("data-n",n);}
  }
  function answer(o){
    var q=R.qs[R.i],ok=o===q.w[2];
    env.grade(q.w,ok,Date.now()-R.qt);
    if(!ok){R.pen+=PEN;R.miss++;R.flash="bad";env.render();return;}
    R.marks.push(now());R.i++;R.flash="ok";R.qt=Date.now();
    if(R.i>=N)end();
    env.render();
  }
  function end(){
    R.done=true;clearInterval(timer);
    var total=now(),a=runs();
    a.unshift({ts:Date.now(),total:total,marks:R.marks,miss:R.miss});env.sset("ghost:"+env.lang(),a.slice(0,30));
    R.total=total;R.win=R.g?total<R.g.r.total:null;
    env.addXP(R.win?15:8);if(R.win)env.celebrate();
  }
  function lane(label,id,pct,cls){
    return h("div",{style:"margin-top:8px"},h("div",{class:"muted small",style:"display:flex;justify-content:space-between"},h("span",null,label)),
      h("div",{style:"position:relative;height:14px;border-radius:999px;background:color-mix(in srgb,var(--ink) 8%,var(--bg));overflow:hidden"},
        h("i",{id:id,style:"position:absolute;left:0;top:0;bottom:0;width:"+pct+"%;border-radius:999px;transition:width .25s;background:"+cls})));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){clearInterval(timer);R=null;e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"👻 Сүүдэртэй уралдах"));
    if(!R){
      var g=pickGhost(),a=runs();
      put(root,h("p",{class:"muted"},N+" үгийн утгыг аль болох хурдан ол. Дэлгэц дээр өмнөх өөрийн чинь «сүнс» зэрэгцэн гүйнэ. Буруу хариулт +3 секунд."));
      if(g)put(root,h("div",{class:"note"},h("b",null,"👻 Өрсөлдөгч: "+g.why),h("div",{class:"muted small"},new Date(g.r.ts).toLocaleDateString("mn-MN")+" · "+fmt(g.r.total)+" · "+g.r.miss+" алдаа")));
      else put(root,h("div",{class:"note"},"Энэ бол чиний анхны гүйлт. Дараа нь өөрийнхөө сүүдэртэй уралдана."));
      put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:begin},"🏁 Эхлэх"));
      if(a.length>1){
        put(root,h("h3",{style:"margin-top:18px"},"📈 Миний гүйлтүүд"));
        var mx=Math.max.apply(null,a.slice(0,10).map(function(r){return r.total;}));
        a.slice(0,10).forEach(function(r){
          put(root,h("div",{style:"display:flex;align-items:center;gap:8px;margin-top:6px"},h("span",{class:"muted small",style:"width:72px"},new Date(r.ts).toLocaleDateString("mn-MN",{month:"numeric",day:"numeric"})),
            h("div",{style:"flex:1;height:8px;border-radius:999px;background:color-mix(in srgb,var(--ink) 8%,var(--bg))"},h("i",{style:"display:block;height:100%;border-radius:999px;background:var(--sky);width:"+Math.round(r.total/mx*100)+"%"})),
            h("span",{class:"small",style:"width:64px;text-align:right"},fmt(r.total))));
        });
      }
      return root;
    }
    if(R.done){
      var d=R.g?R.g.r.total-R.total:0;
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:44px"},R.win==null?"🏁":R.win?"🏆":"👻"),
        h("b",{style:"font-size:20px"},R.win==null?"Анхны гүйлт: "+fmt(R.total):R.win?"Сүүдрээ "+fmt(d)+" түрүүллээ!":"Сүүдэр "+fmt(-d)+" түрүүллээ"),
        h("div",{class:"muted"},"Чиний хугацаа: "+fmt(R.total)+" · "+R.miss+" алдаа"+(R.g?" · Сүнс: "+fmt(R.g.r.total):"")),
        h("div",{class:"muted small",style:"margin-top:6px"},R.win?"+15 XP":"+8 XP")));
      put(root,h("div",{class:"row",style:"margin-top:12px;gap:8px"},h("button",{class:"btn primary",style:"flex:1",onclick:begin},"🔁 Дахин"),h("button",{class:"btn",onclick:function(){R=null;env.render();}},"Болсон")));
      return root;
    }
    var q=R.qs[R.i];
    put(root,h("div",{style:"display:flex;justify-content:space-between;align-items:center"},h("span",{class:"muted small"},(R.i+1)+"/"+N),h("b",{id:"gh-t"},fmt(now()))));
    put(root,lane("🏃 Чи","gh-me",R.i/N*100,"var(--sky)"));
    if(R.g)put(root,lane("👻 "+R.g.why,"gh-gh",R.g.r.marks.filter(function(m){return m<=now();}).length/N*100,"color-mix(in srgb,var(--ink) 35%,transparent)"));
    put(root,h("div",{class:"note",style:"margin-top:14px;text-align:center"+(R.flash==="bad"?";border-color:var(--bad-line)":"")},h("b",{lang:env.lang(),style:"font-size:24px"},q.w[1]),R.flash==="bad"?h("div",{class:"small",style:"color:var(--danger)"},"+3 сек"):null));
    R.flash=null;
    q.opts.forEach(function(o){put(root,h("button",{class:"opt",style:"width:100%;margin-top:8px",onclick:function(){answer(o);}},o));});
    return root;
  }
  window.Ghost={view:view,stop:function(){clearInterval(timer);}};
})();
