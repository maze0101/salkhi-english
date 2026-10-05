/* Салхи: 🤝 хэлний гэрээ — хоёр найз «7 хоног өдөр бүр N XP» гэж тохирно.
   Хоёулаа өдөр бүрийн XP-гээ гэрээнд бичнэ; нэг нь биелүүлээд нөгөө нь хоцорвол «Бат чамайг хүлээж байна» гэж сануулна,
   найздаа 🔔 сануулга илгээж болно. 7 хоног бүтэн биелвэл хоёулаа +50 XP.
   Firebase: pacts/{id} = {a,b,an,bn,goal,start,st,d:{uid:{day:xp}},nz:{uid:ts}}, pactinv/{to}/{id} = {from,name,goal,ts}.
   Найзын жагсаалт (social.js) дээрх 🤝 товчоор урина. */
(function(){
  var KEY="salkhi:pacts",SEEN="salkhi:pactseen",DAYS=7;
  var env=null,h=null,db=null,uid=null,P={pacts:{},inv:{},loaded:false,busy:false,err:"",draft:null},pushT=null,lastPush=0,refs=[];

  function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
  function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function ids(){var l=ls(KEY,[]);return Array.isArray(l)?l:[];}
  function addId(id){var l=ids();if(l.indexOf(id)<0){l.push(id);lset(KEY,l.slice(-10));}}
  function rmId(id){lset(KEY,ids().filter(function(x){return x!==id;}));delete P.pacts[id];}
  function TS(){return firebase.database.ServerValue.TIMESTAMP;}
  function paint(){if(env)env.render();}
  function on(){return !!(env&&window.SALKHI_FB&&window.SalkhiFB&&!env.kid());}
  function connect(){
    if(db&&uid)return Promise.resolve();
    return window.SalkhiFB.user().then(function(u){db=firebase.database();uid=u.uid;});
  }
  function dkey(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function dayList(start){var d=new Date(start+"T12:00:00"),out=[];for(var i=0;i<DAYS;i++){out.push(dkey(d));d.setDate(d.getDate()+1);}return out;}
  function today(){return dkey(new Date());}
  function other(p){return p.a===uid?{u:p.b,n:p.bn}:{u:p.a,n:p.an};}
  function xpOf(p,u,day){return +((p.d||{})[u]||{})[day]||0;}
  function ended(p){return dayList(p.start).pop()<today();}

  /* ---------- өгөгдөл ---------- */
  function load(){
    if(!on())return Promise.resolve();
    return connect().then(function(){
      var ps=ids().map(function(id){
        return db.ref("pacts/"+id).once("value").then(function(s){var v=s.val();if(v)P.pacts[id]=v;else rmId(id);}).catch(function(){rmId(id);});
      });
      ps.push(db.ref("pactinv/"+uid).once("value").then(function(s){P.inv=s.val()||{};}).catch(function(){}));
      return Promise.all(ps);
    }).then(function(){P.loaded=true;paint();}).catch(function(e){P.err=String(e&&e.message||e);paint();});
  }
  function push(){
    if(!on()||!ids().length)return;
    if(Date.now()-lastPush<60000){clearTimeout(pushT);pushT=setTimeout(push,60000);return;}
    lastPush=Date.now();
    var t=today(),xp=env.todayXP();
    connect().then(function(){
      Object.keys(P.pacts).forEach(function(id){
        var p=P.pacts[id];if(p.st!=="go"||dayList(p.start).indexOf(t)<0)return;
        db.ref("pacts/"+id+"/d/"+uid+"/"+t).set(Math.min(5000,xp)).catch(function(){});
        p.d=p.d||{};p.d[uid]=p.d[uid]||{};p.d[uid][t]=xp;
      });
    });
  }
  /* апп нээхэд: урилга, найзын сануулга, «найз чинь биелүүлчихлээ» */
  function remind(){
    var seen=ls(SEEN,{}),t=today(),msgs=[];
    Object.keys(P.inv).forEach(function(id){if(!seen["i"+id]){seen["i"+id]=1;msgs.push("🤝 "+P.inv[id].name+" танд хэлний гэрээ санал болголоо!");}});
    Object.keys(P.pacts).forEach(function(id){
      var p=P.pacts[id];if(p.st!=="go"||ended(p))return;
      var o=other(p),nz=(p.nz||{})[uid];
      if(nz&&nz>(seen["n"+id]||0)){seen["n"+id]=nz;msgs.push("🔔 "+o.n+": «Гэрээгээ мартаагүй биз? Өнөөдрийн "+p.goal+" XP-гээ цуглуулаарай!»");}
      else if(xpOf(p,o.u,t)>=p.goal&&env.todayXP()<p.goal&&seen["w"+id]!==t){seen["w"+id]=t;msgs.push("⏰ "+o.n+" өнөөдрийн "+p.goal+" XP-гээ цуглуулчихлаа. Чамайг хүлээж байна!");}
    });
    lset(SEEN,seen);
    msgs.slice(0,2).forEach(function(m,i){setTimeout(function(){env.toast(m,6000);},i*6500);});
  }
  function invite(f,goal){
    P.busy=true;P.err="";paint();
    var id=db.ref("pacts").push().key,start=today(),me=env.name()||"Найз";
    db.ref("pacts/"+id).set({a:uid,b:f.uid,an:me.slice(0,20),bn:String(f.name||"Найз").slice(0,20),goal:goal,start:start,st:"wait",ts:TS()}).then(function(){
      return db.ref("pactinv/"+f.uid+"/"+id).set({from:uid,name:me.slice(0,20),goal:goal,ts:TS()});
    }).then(function(){addId(id);P.busy=false;P.draft=null;env.toast("🤝 "+f.name+"-д гэрээний санал илгээлээ");load();},function(e){P.busy=false;P.err=String(e&&e.message||e);paint();});
  }
  function accept(id,yes){
    P.busy=true;paint();
    connect().then(function(){
      /* хоцорч хүлээж авсан ч 7 хоног бүтэн байхын тулд эхлэх өдрийг хүлээж авсан өдрөөр тооцно */
      return yes?db.ref("pacts/"+id).update({st:"go",start:today()}).then(function(){addId(id);}):db.ref("pacts/"+id+"/st").set("no");
    }).then(function(){return db.ref("pactinv/"+uid+"/"+id).remove();}).then(function(){
      delete P.inv[id];P.busy=false;if(yes)env.toast("🤝 Гэрээ эхэллээ! Өдөр бүр зорилгоо биелүүлээрэй");load();
    },function(e){P.busy=false;P.err=String(e&&e.message||e);paint();});
  }
  function nudge(id){
    var p=P.pacts[id],o=other(p);
    connect().then(function(){return db.ref("pacts/"+id+"/nz/"+o.u).set(TS());}).then(function(){env.toast("🔔 "+o.n+"-д сануулга илгээлээ");},function(){env.toast("Илгээж чадсангүй");});
  }

  /* ---------- дэлгэц ---------- */
  function grid(p){
    var days=dayList(p.start),t=today(),o=other(p),tb=h("div",{style:"display:grid;grid-template-columns:64px repeat("+DAYS+",1fr);gap:3px;align-items:center;font-size:12px;margin-top:8px"});
    var nm=["Ня","Да","Мя","Лх","Пү","Ба","Бя"];
    tb.append(h("span"));days.forEach(function(d){tb.append(h("span",{style:"text-align:center;color:var(--ink-2)"+(d===t?";font-weight:800;color:var(--sky)":"")},nm[new Date(d+"T12:00:00").getDay()]));});
    [[uid,"Чи"],[o.u,o.n]].forEach(function(r){
      tb.append(h("b",{style:"overflow:hidden;text-overflow:ellipsis;white-space:nowrap"},r[1]));
      days.forEach(function(d){
        var x=xpOf(p,r[0],d),ok=x>=p.goal,fut=d>t;
        tb.append(h("span",{title:x+" XP",style:"text-align:center;padding:6px 0;border-radius:8px;background:"+(ok?"color-mix(in srgb,var(--ok) 22%,transparent)":fut?"transparent":d===t?"var(--soft)":"color-mix(in srgb,var(--danger) 14%,transparent)")},fut?"·":ok?"✅":d===t?(x||"…"):"✖"));
      });
    });
    return tb;
  }
  function pactBox(id){
    var p=P.pacts[id],o=other(p),t=today(),box=h("div",{class:"note",style:"margin:10px 0"});
    box.append(h("div",{style:"display:flex;align-items:center;gap:8px"},h("b",{style:"flex:1"},"🤝 "+o.n+" · өдөр бүр "+p.goal+" XP"),
      h("button",{class:"btn ghost",style:"padding:4px 10px","aria-label":"Хасах",onclick:function(){
        if(P.rm!==id){P.rm=id;env.toast("Дахин дарвал гэрээг жагсаалтаас хасна");return;}
        rmId(id);paint();
      }},"✕")));
    if(p.st==="wait"){box.append(h("p",{class:"muted small",style:"margin:6px 0 0"},p.a===uid?o.n+" зөвшөөрөхийг хүлээж байна…":"Хариу өгөөгүй байна."));return box;}
    if(p.st==="no"){box.append(h("p",{class:"muted small",style:"margin:6px 0 0"},o.n+" энэ удаа татгалзлаа."));return box;}
    box.append(grid(p));
    var days=dayList(p.start);
    if(ended(p)){
      var all=days.every(function(d){return xpOf(p,uid,d)>=p.goal&&xpOf(p,o.u,d)>=p.goal;}),mineAll=days.every(function(d){return xpOf(p,uid,d)>=p.goal;});
      box.append(h("div",{class:"fb "+(all?"ok":"bad")},all?"🏆 Гэрээ бүрэн биелсэн! Хоёулаа гайхалтай.":mineAll?"Чи бүх өдөр биелүүлсэн 👏 "+o.n+" заримыг алгассан.":"Энэ удаа бүрэн биелсэнгүй. Дахин гэрээ байгуулцгаая 💪"));
      var cl=ls(SEEN,{});
      if(all&&!cl["c"+id]){cl["c"+id]=1;lset(SEEN,cl);env.reward(50);env.toast("🏆 Хэлний гэрээ биелсэн! +50 XP");}
      return box;
    }
    var mine=env.todayXP(),his=xpOf(p,o.u,t);
    box.append(h("p",{class:"small",style:"margin:8px 0 0"},"Өнөөдөр: чи "+mine+"/"+p.goal+" XP · "+o.n+" "+his+"/"+p.goal+" XP"+(his>=p.goal&&mine<p.goal?" — "+o.n+" чамайг хүлээж байна! ⏰":"")));
    if(his<p.goal)box.append(h("button",{class:"btn",style:"margin-top:8px;width:100%",onclick:function(){nudge(id);}},"🔔 "+o.n+"-д сануулах"));
    return box;
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    root.append(h("button",{class:"back",onclick:function(){P.draft=null;e.close();}},"‹ "+e.back()));
    root.append(h("h2",null,"🤝 Хэлний гэрээ"));
    root.append(h("p",{class:"muted"},"Найзтайгаа 7 хоног өдөр бүр тодорхой XP цуглуулахаар тохир. Хоёулаа бие биенээ хариуцаж, хамтдаа тогтвортой сурна."));
    if(!on()){root.append(h("p",{class:"muted"},"Энэ боломж одоогоор ашиглах боломжгүй байна."));return root;}
    if(!P.loaded){load();root.append(h("p",{class:"muted"},"Ачаалж байна…"));return root;}
    if(P.err)root.append(h("div",{class:"fb bad"},P.err));
    if(P.draft){
      var f=P.draft;
      root.append(h("div",{class:"note"},h("b",null,"🤝 "+f.name+"-тэй гэрээ байгуулах"),
        h("p",{class:"muted small",style:"margin:4px 0 8px"},"Өдөр бүр хэдэн XP цуглуулах вэ? (7 хоног)"),
        h("div",{style:"display:flex;gap:8px"},[10,20,30,50].map(function(g){return h("button",{class:"btn"+(g===20?" primary":""),style:"flex:1",disabled:P.busy,onclick:function(){connect().then(function(){invite(f,g);});}},g+" XP");})),
        h("button",{class:"btn ghost",style:"width:100%;margin-top:8px",onclick:function(){P.draft=null;paint();}},"Болих")));
    }
    Object.keys(P.inv).forEach(function(id){
      var v=P.inv[id];
      root.append(h("div",{class:"note",style:"border-color:var(--sky)"},h("b",null,"📩 "+v.name+" гэрээ санал болгож байна"),h("div",{class:"muted small"},"7 хоног өдөр бүр "+v.goal+" XP"),
        h("div",{class:"row"},h("button",{class:"btn",disabled:P.busy,onclick:function(){accept(id,false);}},"Татгалзах"),h("button",{class:"btn primary",disabled:P.busy,onclick:function(){accept(id,true);}},"🤝 Зөвшөөрөх"))));
    });
    var l=ids().filter(function(id){return P.pacts[id];});
    if(!l.length&&!P.draft&&!Object.keys(P.inv).length)root.append(h("p",{class:"muted small"},"Одоогоор гэрээ алга. «Найз» таб дээр найзынхаа хажууд байгаа 🤝 товчийг дараарай."));
    l.slice().reverse().forEach(function(id){root.append(pactBox(id));});
    root.append(h("button",{class:"btn",style:"width:100%;margin-top:10px",onclick:function(){e.openFriends();}},"👥 Найзаа сонгох"));
    return root;
  }
  function card(e,open){
    env=e;h=e.h;if(!on())return null;
    var n=Object.keys(P.inv).length,act=ids().filter(function(id){var p=P.pacts[id];return p&&p.st==="go"&&!ended(p);});
    var wait=act.filter(function(id){var p=P.pacts[id],o=other(p);return xpOf(p,o.u,today())>=p.goal&&env.todayXP()<p.goal;});
    return h("button",{class:"lrow",type:"button",style:"margin-top:12px"+(n||wait.length?";border-color:var(--sky)":""),onclick:open},
      h("span",{class:"hexb ico"},"🤝"),
      h("span",{style:"flex:1;text-align:left"},h("div",{class:"t"},"Хэлний гэрээ"+(n?" · "+n+" шинэ санал":"")),
        h("div",{class:"muted small"},wait.length?"⏰ Найз чинь чамайг хүлээж байна!":act.length?act.length+" идэвхтэй гэрээ":"Найзтайгаа 7 хоногийн зорилго тавь")),
      h("span",{"aria-hidden":"true"},"›"));
  }
  window.Pact={
    init:function(e){env=e;h=e.h;if(!on())return;setTimeout(function(){load().then(function(){remind();push();});},7000);},
    touch:function(){if(on()&&P.loaded)push();},
    start:function(e,f){env=e;h=e.h;P.draft={uid:f.uid,name:f.name};if(!P.loaded)load();},
    card:card,view:view
  };
})();
