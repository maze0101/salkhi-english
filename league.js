/* Салхи: долоо хоногийн наадам (Duolingo-гийн лиг шиг, бөхийн цолтой).
   Даваа гарагаас эхлэх 7 хоног бүр XP цуглуулсан хүмүүс өөрийн цолны 20 хүртэлх хүнтэй бүлэгт (анхны XP-ээр) хуваарилагдана.
   7 хоног дуусахад эхний 5 нь дараагийн цол хүртэж (+1 🧊 streak хамгаалалт), сүүлийн 3 нь (10+ хүнтэй бүлэгт) өмнөх цол руу буурна.
   Firebase: lgn/{wk}/{tier} (бүлгийн тоолуур), lg/{wk}/{tier}/{g}/{uid} = {name, wxp, ts}.
   Бүх горимд (хүүхдийн горимд ч) харагдана. */
(function(){
  /* бөхийн цол: сумын → аймгийн → улсын наадам (индекс нь Firebase-ийн lg/{wk}/{tier}) */
  var TIERS=[["🌱","Сумын начин"],["🐘","Сумын заан"],["🦅","Аймгийн начин"],["🐘","Аймгийн заан"],["🦁","Аймгийн арслан"],
    ["🦅","Улсын начин"],["🪶","Улсын харцага"],["🐘","Улсын заан"],["🐉","Улсын гарьд"],["🦁","Улсын арслан"],["👑","Улсын аварга"]];
  var LEVELS=[["Сумын наадам",0,1],["Аймгийн наадам",2,4],["Улсын наадам",5,10]];
  var GROUP=20,PROMO=5,DEMO=3,DEMO_MIN=10,KEY="salkhi:league";
  var env=null,h=null,db=null,uid=null,joining=false,pushT=null,lastPush=0,live=null,liveKey="",rows=null,err="";

  function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
  function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function st(){var s=ls(KEY,null);return s&&typeof s==="object"?s:{tier:0};}
  function save(s){lset(KEY,s);}
  function TS(){return firebase.database.ServerValue.TIMESTAMP;}
  /* наадмын хэсэг харагдаж байхад л дахин зурна (далд сонсогч бусад дэлгэцийг, бичиж буй талбарыг үймүүлэхгүй) */
  function paint(){if(env&&(!env.visible||env.visible()))env.render();}
  function on(){return !!(env&&window.SALKHI_FB&&window.SalkhiFB);}
  function connect(){
    if(db&&uid)return Promise.resolve();
    return window.SalkhiFB.user().then(function(u){db=firebase.database();uid=u.uid;});
  }
  function name(){return String(env.name()||"").trim().split(/\s+/)[0].slice(0,20)||"Суралцагч";}
  function path(s){return "lg/"+s.wk+"/"+s.tier+"/"+s.g;}
  /* дараагийн даваа гарагийн 00:00 хүртэл */
  function leftText(){
    var d=new Date(),n=new Date(d);n.setHours(0,0,0,0);n.setDate(n.getDate()+((8-n.getDay())%7||7));
    var ms=n-d,day=Math.floor(ms/86400000),hr=Math.floor(ms%86400000/3600000);
    return day?day+" өдөр "+hr+" цаг":hr?hr+" цаг":Math.max(1,Math.round(ms/60000))+" минут";
  }

  /* 7 хоног солигдоход өмнөх бүлгийн эцсийн байрыг тооцож дэвших/буурах */
  function rollover(){
    var s=st(),wk=env.week();
    if(!s.wk||s.wk===wk||s.done===s.wk)return Promise.resolve();
    var old=s;
    return connect().then(function(){return db.ref(path(old)).once("value");}).then(function(snap){
      var all=snap.val()||{},list=Object.keys(all).map(function(u){return {u:u,x:+all[u].wxp||0};}).sort(function(a,b){return b.x-a.x;});
      var rank=list.findIndex(function(r){return r.u===uid;})+1,n=list.length,move=0,mine=rank?list[rank-1].x:0;
      if(rank&&mine>0&&rank<=PROMO&&n>1&&old.tier<TIERS.length-1)move=1;
      else if(rank&&old.tier>0&&n>=DEMO_MIN&&rank>n-DEMO)move=-1;
      var ns={tier:Math.max(0,Math.min(TIERS.length-1,old.tier+move)),done:old.wk,last:{wk:old.wk,rank:rank,n:n,move:move,tier:old.tier,seen:false}};
      save(ns);
      if(move>0)env.freeze();
      paint();
    }).catch(function(){var ns=st();ns.done=old.wk;delete ns.wk;delete ns.g;save(ns);});
  }
  /* энэ 7 хоногт анх XP авахад бүлэгт нэгдэнэ */
  function join(){
    var s=st(),wk=env.week();
    if(joining||s.wk===wk||env.wxp()<=0)return Promise.resolve();
    joining=true;
    return connect().then(function(){
      return db.ref("lgn/"+wk+"/"+s.tier).transaction(function(n){return (n||0)+1;});
    }).then(function(r){
      var n=r.snapshot.val()||1,g=Math.floor((n-1)/GROUP);
      var ns=st();ns.wk=wk;ns.g=g;save(ns);
      return db.ref(path(ns)+"/"+uid).set({name:name(),wxp:env.wxp(),ts:TS()});
    }).then(function(){joining=false;lastPush=Date.now();ppush();attach();paint();},function(e){joining=false;err=String(e&&e.message||e);});
  }
  function push(){
    var s=st();if(s.wk!==env.week()){join();return;}
    if(Date.now()-lastPush<60000){clearTimeout(pushT);pushT=setTimeout(push,60000);return;}
    lastPush=Date.now();
    connect().then(function(){return db.ref(path(s)+"/"+uid).update({wxp:env.wxp(),name:name(),ts:TS()});}).catch(function(){});
    ppush();
  }
  function attach(){
    var s=st();if(s.wk!==env.week())return;
    var k=path(s);if(live&&liveKey===k)return;
    detach();liveKey=k;
    connect().then(function(){
      live=db.ref(k);
      live.on("value",function(snap){
        var all=snap.val()||{};
        rows=Object.keys(all).map(function(u){return {u:u,name:all[u].name||"?",x:+all[u].wxp||0,me:u===uid};}).sort(function(a,b){return b.x-a.x||(a.me?-1:1);});
        var s0=st();watch("pub",rows,"Наадам",{kind:"lg",tier:s0.tier,g:s0.g});
        paint();
      },function(){});
    }).catch(function(){});
  }
  function detach(){if(live){try{live.off();}catch(e){}live=null;liveKey="";}}
  /* ---------- гүйцэж түрүүлсэн мэдэгдэл ----------
     Жагсаалт өөрчлөгдөх бүрт миний дээр шинээр гарсан хүнийг олно (өмнө нь бүлэгт байсан, надаас доор байсан).
     Апп харагдаж байвал toast, далд байвал системийн мэдэгдэл (lgEnv.notify). Нэг бүлэгт 20 минутад нэг удаа. */
  var seen={},lastAlert={};
  function watch(key,list,label,ctx){
    if(!on())return;
    var i=list.findIndex(function(r){return r.me;});if(i<0)return;
    var above={},all={};list.forEach(function(r,k){all[r.u]=1;if(k<i)above[r.u]=r;});
    var prev=seen[key];seen[key]={above:above,all:all,wk:env.week()};
    if(!prev||prev.wk!==env.week()||!env.notify)return;
    var passer=Object.keys(above).filter(function(u){return !prev.above[u]&&prev.all[u];})[0];
    var passedAll=Object.keys(prev.above).filter(function(u){return !above[u]&&all[u];}),passed=passedAll[0];
    /* миний гүйцсэн хүмүүст (апп нь хаалттай байсан ч) worker-ээр push илгээнэ — worker өөрөө Firebase-ээс дахин шалгана */
    if(passedAll.length&&ctx&&env.sendPush)sendPassPush(ctx,passedAll);
    if(passer&&list[i].x>0&&Date.now()-(lastAlert[key]||0)>20*60000){
      lastAlert[key]=Date.now();
      env.notify("🤼 "+above[passer].name+" чамайг гүйцэж түрүүллээ! "+label+" · одоо "+(i+1)+"-р байр. XP цуглуулаад байраа буцааж ав 💪",true);
    }else if(passed){
      var r=list.filter(function(x){return x.u===passed;})[0];
      env.notify("🎉 Гүйцэж түрүүллээ! "+(r?r.name+" одоо чамаас хойно. ":"")+label+" · "+(i+1)+"-р байр",false);
    }
  }
  function sendPassPush(ctx,to){
    if(!window.firebase||!firebase.auth||!firebase.auth().currentUser)return;
    firebase.auth().currentUser.getIdToken().then(function(t){
      var b={token:t,wk:env.week(),kind:ctx.kind,to:to.slice(0,3)};
      if(ctx.kind==="lg"){b.tier=ctx.tier;b.g=ctx.g;}else b.code=ctx.code;
      env.sendPush(b);
    }).catch(function(){});
  }
  /* push бүртгэлийг Firebase-д хадгална (сануулга зөвшөөрсөн үед) */
  function syncPush(){
    if(!on()||!env.pushSub)return;
    env.pushSub().then(function(sub){
      if(!sub)return;
      var k=JSON.stringify(sub);if(ls("salkhi:pushsub","")===k+uid&&uid)return;
      return connect().then(function(){return db.ref("pushsub/"+uid).set({ep:sub.ep,p:sub.p,a:sub.a,ts:TS()});}).then(function(){lset("salkhi:pushsub",k+uid);});
    }).catch(function(){});
  }
  /* өдрийн сануулгад: наадмын байр, дуусахад үлдсэн хугацаа */
  function nudge(){
    if(!on())return null;
    var s=st(),list=rows&&s.wk===env.week()?rows:null,label="Наадамд";
    if(!list){var c=pcodes()[0],d=c&&P.data[c.c];if(d&&d.mem&&d.x){list=prows(d,env.week());label="«"+c.n+"» лигт";}}
    if(!list||list.length<2)return null;
    var i=list.findIndex(function(r){return r.me;});if(i<0)return null;
    var d=new Date(),last=d.getDay()===0;
    if(last)return "🤼 Наадам дуусахад "+leftText()+" үлдлээ — "+label+" "+(i+1)+"-р байрт!"+(label==="Наадамд"&&i>=PROMO&&s.tier<TIERS.length-1?" Эхний "+PROMO+"-д орвол "+TIERS[s.tier+1][1]+" цол!":"");
    if(i===0)return "👑 "+label+" тэргүүлж байна — байраа хамгаал!";
    return "🤼 "+label+" "+(i+1)+"-р байрт. "+"Дээрх "+list[i-1].name+" хүртэл "+(list[i-1].x-list[i].x+1)+" XP дутуу.";
  }

  /* ---------- 👥 найзуудын хувийн лиг ----------
     Урилгын кодоор нэгддэг, долоо хоног бүр зөвхөн гишүүдийн дунд XP-ээр өрсөлдөнө, долоо хоногийн ялагч 👑.
     Firebase: plg/{code} = {owner,name,ts}, plgm/{code}/{uid} = {name,ts}, plgx/{code}/{wk}/{uid} = {name,wxp,ts}. */
  var PKEY="salkhi:plg",PMAX=50,ABC="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var P={screen:null,form:null,inp:"",busy:false,err:"",data:{},refs:{},pending:null};
  function pcodes(){var a=ls(PKEY,[]);return Array.isArray(a)?a.filter(function(x){return x&&/^[A-Z2-9]{6}$/.test(x.c);}):[];}
  function psave(a){lset(PKEY,a.slice(-10));}
  function pname(c){var x=pcodes().filter(function(y){return y.c===c;})[0];return x?x.n:c;}
  function genCode(){var s="";for(var i=0;i<6;i++)s+=ABC[Math.floor(Math.random()*ABC.length)];return s;}
  function plink(c){return location.href.split("#")[0]+"#plg="+c;}
  function pfail(e){P.busy=false;P.err=e&&e.msg||"Холбогдож чадсангүй. Интернэтээ шалгаад дахин оролдоно уу.";paint();}
  function pcreate(nm){
    nm=String(nm||"").trim().slice(0,30);if(!nm){P.err="Лигийн нэрээ бичнэ үү.";paint();return;}
    P.busy=true;P.err="";paint();
    var tries=0;
    function attempt(){
      var c=genCode();tries++;
      return db.ref("plg/"+c).once("value").then(function(s){
        if(s.exists()){if(tries<5)return attempt();throw {msg:"Код үүсгэж чадсангүй, дахин оролдоно уу."};}
        return db.ref("plg/"+c).set({owner:uid,name:nm,ts:TS()}).then(function(){return c;});
      });
    }
    connect().then(attempt).then(function(c){return pjoin(c,true);}).catch(pfail);
  }
  function pjoin(c,fresh){
    c=String(c||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(!/^[A-Z2-9]{6}$/.test(c)){P.err="Код 6 тэмдэгттэй байна (жишээ: K7MQ2X).";paint();return Promise.resolve();}
    P.busy=true;P.err="";paint();
    var meta;
    return connect().then(function(){return db.ref("plg/"+c).once("value");}).then(function(s){
      meta=s.val();if(!meta)throw {msg:"Ийм кодтой лиг олдсонгүй."};
      return db.ref("plgm/"+c).once("value");
    }).then(function(s){
      var m=s.val()||{};
      if(!m[uid]&&Object.keys(m).length>=PMAX)throw {msg:"Энэ лиг дүүрсэн байна ("+PMAX+" хүн)."};
      return db.ref("plgm/"+c+"/"+uid).set({name:name(),ts:TS()});
    }).then(function(){
      return db.ref("plgx/"+c+"/"+env.week()+"/"+uid).set({name:name(),wxp:env.wxp(),ts:TS()});
    }).then(function(){
      var a=pcodes().filter(function(x){return x.c!==c;});a.push({c:c,n:meta.name});psave(a);
      P.busy=false;P.form=null;P.inp="";P.screen=c;
      env.toast(fresh?"🏆 «"+meta.name+"» лиг үүслээ! Одоо найзуудаа урь.":"🎉 «"+meta.name+"» лигт нэгдлээ!");paint();
    }).catch(pfail);
  }
  function pleave(c){
    connect().then(function(){return db.ref("plgm/"+c+"/"+uid).remove();}).catch(function(){}).then(function(){
      pdetach(c);psave(pcodes().filter(function(x){return x.c!==c;}));P.screen=null;env.toast("Лигээс гарлаа");paint();
    });
  }
  function pkick(c,u){connect().then(function(){return db.ref("plgm/"+c+"/"+u).remove();}).catch(function(){env.toast("Хасаж чадсангүй");});}
  /* энэ 7 хоногийн XP-г бүх хувийн лиг рүү илгээнэ (push()-ийн 1 минутын хязгаар дотор) */
  function ppush(){
    var a=pcodes();if(!a.length)return;
    var wk=env.week();
    connect().then(function(){var v={name:name(),wxp:env.wxp(),ts:TS()};a.forEach(function(x){db.ref("plgx/"+x.c+"/"+wk+"/"+uid).set(v).catch(function(){});});}).catch(function(){});
  }
  function pattach(c){
    if(P.refs[c])return;
    var d=P.data[c]||(P.data[c]={meta:null,mem:null,x:null});P.refs[c]=[];
    connect().then(function(){
      db.ref("plg/"+c).once("value").then(function(s){d.meta=s.val()||{name:pname(c),gone:true};
        if(d.meta.name&&d.meta.name!==pname(c)){var a=pcodes();a.forEach(function(x){if(x.c===c)x.n=d.meta.name;});psave(a);}paint();},function(){});
      var m=db.ref("plgm/"+c),x=db.ref("plgx/"+c).orderByKey().limitToLast(6);
      m.on("value",function(s){d.mem=s.val()||{};
        /* эзэн хассан бол жагсаалтаас гаргана */
        if(d.mem&&!d.mem[uid]&&d.meta&&!d.meta.gone){pdetach(c);psave(pcodes().filter(function(y){return y.c!==c;}));if(P.screen===c)P.screen=null;env.toast("Та «"+pname(c)+"» лигээс хасагдсан байна");}
        paint();},function(){});
      x.on("value",function(s){d.x=s.val()||{};if(d.mem)watch("p:"+c,prows(d,env.week()),"«"+pname(c)+"» лиг",{kind:"plg",code:c});paint();},function(){});
      P.refs[c]=[m,x];
    }).catch(function(){delete P.refs[c];});
  }
  function pdetach(c){(P.refs[c]||[]).forEach(function(r){try{r.off();}catch(e){}});delete P.refs[c];}
  /* энэ 7 хоногийн жагсаалт: одоогийн гишүүд (XP-гүй бол 0) */
  function prows(d,wk){
    var mem=d.mem||{},cur=(d.x||{})[wk]||{};
    return Object.keys(mem).map(function(u){var r=cur[u];return {u:u,name:(r&&r.name)||mem[u].name||"?",x:r?+r.wxp||0:0,me:u===uid};})
      .sort(function(a,b){return b.x-a.x||(a.me?-1:b.me?1:0);});
  }
  /* өмнөх долоо хоногуудын ялагч (хамгийн их XP, 0-ээс их) */
  function pwinners(d,wk){
    var x=d.x||{},mem=d.mem||{};
    return Object.keys(x).filter(function(k){return k<wk;}).sort().reverse().map(function(k){
      var best=null;Object.keys(x[k]||{}).forEach(function(u){var r=x[k][u],v=+r.wxp||0;if(v>0&&(!best||v>best.x))best={u:u,name:(mem[u]&&mem[u].name)||r.name||"?",x:v};});
      return best?{wk:k,w:best}:null;
    }).filter(Boolean);
  }
  function pshare(c){
    var t="Салхи апп дээрх «"+pname(c)+"» лигт нэгдээд долоо хоног бүр хэн их XP цуглуулахаар өрсөлдье! Код: "+c;
    if(navigator.share){navigator.share({title:"Салхи · найзуудын лиг",text:t,url:plink(c)}).catch(function(){});return;}
    var s=t+"\n"+plink(c);
    (navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(function(){env.toast("Урилга хуулагдлаа 📋 Найз руугаа илгээгээрэй");},function(){prompt("Энэ урилгыг хуулж илгээгээрэй:",s);});
  }
  function pdetail(root,c){
    var d=P.data[c]||{},wk=env.week();pattach(c);
    root.append(h("button",{class:"back",onclick:function(){P.screen=null;paint();}},"‹ Наадам"));
    root.append(h("h2",{style:"margin-bottom:2px"},"👥 "+((d.meta&&d.meta.name)||pname(c))));
    root.append(h("p",{class:"muted small",style:"margin:0 0 10px"},"Энэ 7 хоног дуусахад "+leftText()+" үлдлээ · Даваа гарагт шинээр эхэлнэ"));
    if(d.meta&&d.meta.gone){root.append(h("div",{class:"note"},"Энэ лиг устгагдсан байна."),h("button",{class:"btn",onclick:function(){pleave(c);}},"Жагсаалтаас хасах"));return;}
    root.append(h("div",{class:"note",style:"display:flex;align-items:center;gap:10px"},
      h("div",{style:"flex:1"},h("div",{class:"muted small"},"Урилгын код"),h("div",{style:"font-weight:800;font-size:22px;letter-spacing:.15em"},c)),
      h("button",{class:"btn primary",style:"flex:none",onclick:function(){pshare(c);}},"📤 Найзаа урих")));
    if(!d.mem||!d.x){root.append(h("p",{class:"muted small"},"Ачаалж байна…"));return;}
    var rows=prows(d,wk),wins=pwinners(d,wk),crowns={};
    wins.forEach(function(w){crowns[w.w.u]=(crowns[w.w.u]||0)+1;});
    var me=rows.findIndex(function(r){return r.me;})+1,lead=rows[0];
    root.append(h("p",{class:"small",style:"margin:12px 0 0;font-weight:600"},
      rows.length<2?"Ганцаараа байна — найзуудаа урьж өрсөлдөөнөө эхлүүлээрэй!":
      !me?"Гишүүдийн жагсаалт шинэчлэгдэж байна…":
      me===1&&lead.x>0?"👑 Чи тэргүүлж байна! Байраа хамгаал.":
      lead.x>0?"Тэргүүлэгч хүртэл "+(lead.x-rows[me-1].x+1)+" XP дутуу байна 💪":"Хамгийн түрүүнд XP цуглуулж тэргүүлээрэй!"));
    var owner=d.meta&&d.meta.owner===uid,box=h("div",{style:"display:flex;flex-direction:column;gap:4px;margin-top:8px"});
    rows.forEach(function(r,i){
      box.append(h("div",{style:"display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid "+(r.me?"var(--sky)":"var(--line)")+";background:"+(r.me?"color-mix(in srgb,var(--sky) 8%,var(--surface))":"var(--surface)")},
        h("b",{style:"width:26px;text-align:center"},i===0&&r.x>0?"👑":i<3&&r.x>0?["🥇","🥈","🥉"][i]:String(i+1)),
        h("span",{style:"flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:"+(r.me?"700":"500")},r.name+(r.me?" (чи)":"")+(crowns[r.u]?" · 🏅"+crowns[r.u]:"")),
        h("b",null,r.x+" XP"),
        owner&&!r.me?h("button",{class:"btn ghost",style:"flex:none;padding:2px 8px","aria-label":"Лигээс хасах: "+r.name,onclick:function(){if(confirm("Лигээс хасах уу: "+r.name+"?"))pkick(c,r.u);}},"✕"):null));
    });
    root.append(box);
    if(wins.length){
      root.append(h("h3",{style:"margin:18px 0 6px"},"🏅 Өмнөх долоо хоногуудын ялагчид"));
      wins.forEach(function(w,i){
        root.append(h("div",{class:"srow"},h("span",null,(i===0?"Өнгөрсөн 7 хоног":w.wk+"-ны 7 хоног")),h("span",null,h("b",null,(w.w.u===uid?"🎉 Чи":w.w.name))," · "+w.w.x+" XP")));
      });
    }
    root.append(h("p",{class:"muted small",style:"margin-top:14px"},"🏅 — долоо хоногт түрүүлсэн тоо. Гишүүн бүр 7 хоногт цуглуулсан XP-ээрээ өрсөлдөнө; нийтийн наадамд зэрэг оролцоно. Хамгийн ихдээ "+PMAX+" хүн."));
    root.append(h("button",{class:"btn ghost",style:"margin-top:6px;color:var(--danger)",onclick:function(){if(confirm("«"+pname(c)+"» лигээс гарах уу?"))pleave(c);}},"Лигээс гарах"));
  }
  function psection(root){
    var a=pcodes();
    root.append(h("h3",{style:"margin:22px 0 4px"},"👥 Найзуудын лиг"));
    root.append(h("p",{class:"muted small",style:"margin:0 0 8px"},"Найз, ангийнхан, гэр бүлээрээ хувийн лиг үүсгээд долоо хоног бүр XP-ээр өрсөлд."));
    a.forEach(function(x){
      var d=P.data[x.c],rows=d&&d.mem&&d.x?prows(d,env.week()):null,me=rows?rows.findIndex(function(r){return r.me;})+1:0;
      pattach(x.c);
      root.append(h("button",{class:"lrow",type:"button",onclick:function(){P.screen=x.c;P.err="";paint();window.scrollTo(0,0);}},
        h("span",{class:"hexb ico"},me===1&&rows[0].x>0?"👑":"👥"),
        h("span",{style:"flex:1"},h("div",{class:"t"},x.n),h("div",{class:"muted small"},rows?me+"-р байр · "+rows.length+" хүн":"Код "+x.c)),
        h("span",{"aria-hidden":"true"},"›")));
    });
    if(P.form==="new"||P.form==="join"){
      var inp=h("input",{class:"tin",value:P.inp,maxlength:P.form==="new"?30:8,placeholder:P.form==="new"?"Лигийн нэр (ж: 11Б анги, Гэр бүл)":"Урилгын код (ж: K7MQ2X)","aria-label":P.form==="new"?"Лигийн нэр":"Урилгын код",
        style:"margin-top:8px"+(P.form==="join"?";text-transform:uppercase;letter-spacing:.12em":"")});
      inp.addEventListener("input",function(){P.inp=inp.value;});
      var go=function(){if(P.busy)return;if(P.form==="new")pcreate(P.inp);else pjoin(P.inp);};
      inp.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.isComposing){e.preventDefault();go();}});
      root.append(inp,h("div",{class:"row"},
        h("button",{class:"btn",onclick:function(){P.form=null;P.err="";paint();}},"Болих"),
        h("button",{class:"btn primary",disabled:P.busy,onclick:go},P.busy?"Түр хүлээ…":P.form==="new"?"Үүсгэх":"Нэгдэх")));
      setTimeout(function(){if(inp.isConnected&&document.activeElement!==inp)inp.focus();},0);
    }else root.append(h("div",{class:"row"},
      h("button",{class:"btn primary",onclick:function(){P.form="new";P.inp="";P.err="";paint();}},"＋ Лиг үүсгэх"),
      h("button",{class:"btn",onclick:function(){P.form="join";P.inp="";P.err="";paint();}},"🔑 Кодоор нэгдэх")));
    if(P.err)root.append(h("div",{class:"fb bad"},P.err));
  }

  function zone(i,n,tier){
    if(i<PROMO&&n>1&&tier<TIERS.length-1)return "up";
    if(tier>0&&n>=DEMO_MIN&&i>=n-DEMO)return "down";
    return "";
  }
  function resultNote(s){
    var L=s.last;if(!L||L.seen)return null;
    var t=TIERS[s.tier],txt=L.move>0?"🎉 "+t[1]+" цол хүртлээ! Шагнал: 🧊 streak хамгаалалт +1":L.move<0?"Энэ удаа "+t[1]+" цол руу буурлаа. Дахин ахицгаая 💪":L.rank?"Өнгөрсөн наадамд "+L.rank+"-р байр эзэлж, "+t[1]+" цолоо хамгааллаа.":null;
    if(!txt)return null;
    return h("div",{class:"note",style:"margin:8px 0;display:flex;gap:8px;align-items:center"},h("span",{style:"flex:1;font-weight:600"},txt),
      h("button",{class:"btn ghost",style:"flex:none;padding:6px 10px","aria-label":"Хаах",onclick:function(){var x=st();if(x.last)x.last.seen=true;save(x);paint();}},"✕"));
  }
  function table(s,max){
    var box=h("div",{style:"display:flex;flex-direction:column;gap:4px;margin-top:8px"}),n=rows.length,list=rows;
    if(max&&n>max){
      var me=rows.findIndex(function(r){return r.me;});
      list=rows.slice(0,max);
      if(me>=max)list=rows.slice(0,max-1).concat([rows[me]]);
    }
    list.forEach(function(r){
      var i=rows.indexOf(r),z=zone(i,n,s.tier);
      box.append(h("div",{style:"display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid "+(r.me?"var(--sky)":"var(--line)")+";background:"+(r.me?"color-mix(in srgb,var(--sky) 8%,var(--surface))":"var(--surface)")},
        h("b",{style:"width:26px;text-align:center;color:"+(z==="up"?"var(--ok)":z==="down"?"var(--danger)":"var(--ink-2)")},i<3?["🥇","🥈","🥉"][i]:String(i+1)),
        h("span",{style:"flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:"+(r.me?"700":"500")},r.name+(r.me?" (чи)":"")),
        h("b",null,r.x+" XP"),
        h("span",{"aria-label":z==="up"?"Цол ахих бүс":z==="down"?"Цол буурах бүс":"",style:"width:16px;text-align:center"},z==="up"?"▲":z==="down"?"▼":"")));
    });
    return box;
  }
  function body(full){
    var s=st(),t=TIERS[s.tier],root=h("div");
    root.append(h("div",{style:"display:flex;align-items:center;gap:12px"},
      h("span",{style:"font-size:40px","aria-hidden":"true"},t[0]),
      h("div",{style:"flex:1"},h("div",{style:"font-weight:800;font-size:18px"},t[1]),h("div",{class:"muted small"},lvName(s.tier)+" · "+(s.tier+1)+"/"+TIERS.length+" цол · дуусахад "+leftText()))));
    var rn=resultNote(s);if(rn)root.append(rn);
    if(s.wk!==env.week()){
      root.append(h("p",{class:"small",style:"margin:10px 0 0"},joining?"Наадамд нэгдэж байна…":"Энэ 7 хоногт XP цуглуулаад наадамд барилдаарай. Эхний "+PROMO+" нь дараагийн цол хүртэнэ."));
      if(!joining&&env.wxp()>0)join();
      return root;
    }
    attach();
    if(!rows){root.append(h("p",{class:"muted small"},"Ачаалж байна…"));return root;}
    var me=rows.findIndex(function(r){return r.me;})+1;
    root.append(h("p",{class:"small",style:"margin:8px 0 0"},"Чи "+(me||"—")+"-р байранд · "+rows.length+" хүн"+(s.tier<TIERS.length-1?" · Эхний "+PROMO+" нь ▲ цол ахина":"")+(s.tier>0&&rows.length>=DEMO_MIN?" · Сүүлийн "+DEMO+" нь ▼ цол буурна":"")));
    root.append(table(s,full?0:5));
    if(!full&&rows.length>5)root.append(h("p",{class:"muted small",style:"margin:6px 0 0;text-align:center"},"Бүгдийг харах ›"));
    return root;
  }
  function card(e,open){
    env=e;h=e.h;
    if(!on())return null;
    var n=pcodes().length;
    return h("button",{class:"note",type:"button",style:"display:block;width:100%;text-align:left;margin-top:12px;color:inherit;font:inherit;cursor:pointer",onclick:open},
      h("div",{class:"muted small",style:"margin-bottom:6px"},"🏆 Долоо хоногийн наадам"),body(false),
      h("div",{class:"muted small",style:"margin-top:8px;font-weight:600"},n?"👥 Найзуудын лиг: "+n+" ›":"👥 Найзуудаараа хувийн лиг үүсгэх ›"));
  }
  /* цолны шат: сум → аймаг → улсын наадмаар бүлэглэсэн, одоогийн цол тодорсон */
  function ladder(){
    var s=st(),box=h("div",{style:"margin-top:16px"});
    box.append(h("h3",{style:"margin:0 0 6px"},"🤼 Цолны шат"));
    LEVELS.forEach(function(L){
      var here=s.tier>=L[1]&&s.tier<=L[2],done=s.tier>L[2];
      var row=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"});
      for(var i=L[1];i<=L[2];i++){
        var t=TIERS[i],cur=i===s.tier;
        row.append(h("div",{"aria-current":cur?"true":null,style:"display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:14px;"+
          (cur?"border:2px solid var(--sky);background:color-mix(in srgb,var(--sky) 10%,var(--surface));font-weight:800":"border:1px solid var(--line);background:var(--surface);font-weight:500;opacity:"+(i<s.tier?.8:.45))},
          h("span",{"aria-hidden":"true"},i<s.tier?"✅":t[0]),t[1]+(cur?" · чи":"")));
      }
      box.append(h("div",{class:"note",style:"margin:8px 0 0;"+(here?"border-color:var(--sky)":"")},
        h("div",{class:"muted small",style:"font-weight:700"},(done?"✅ ":here?"📍 ":"🔒 ")+L[0]),row));
    });
    return box;
  }
  function lvName(i){var L=LEVELS.filter(function(x){return i>=x[1]&&i<=x[2];})[0];return L?L[0]:"";}
  function view(e){
    env=e;h=e.h;var root=h("div");
    if(P.screen&&pcodes().some(function(x){return x.c===P.screen;})){pdetail(root,P.screen);return root;}
    P.screen=null;
    /* #plg=КОД холбоосоор ирсэн бол автоматаар нэгдэнэ */
    if(P.pending&&!P.busy){var pc=P.pending;P.pending=null;if(pcodes().some(function(x){return x.c===pc;})){P.screen=pc;setTimeout(paint,0);}else setTimeout(function(){pjoin(pc);},0);}
    root.append(h("button",{class:"back",onclick:function(){e.close();}},"‹ "+(e.back?e.back():"Профайл")));
    root.append(h("h2",null,"🏆 Долоо хоногийн наадам"));
    root.append(body(true));
    root.append(ladder());
    root.append(h("p",{class:"muted small",style:"margin-top:14px"},"XP бүх хичээл, тоглоом, давталтаас цуглардаг. Наадам Даваа гарагийн 00:00-д шинээр эхэлнэ. Цол ахих бүрт 🧊 streak хамгаалалт +1 авна."));
    if(err)root.append(h("p",{class:"muted small"},err));
    psection(root);
    return root;
  }
  window.League={
    init:function(e){env=e;h=e.h;if(!on())return;setTimeout(function(){rollover().then(function(){if(env.wxp()>0)push();else ppush();attach();syncPush();pcodes().forEach(function(x){pattach(x.c);});});},5000);},
    touch:function(){if(on())push();},
    /* сонсогчид далд үлдэнэ (гүйцэж түрүүлсэн мэдэгдэлд хэрэгтэй, бүлэг бүр 50-аас бага мөр) */
    card:card,view:view,detach:function(){},nudge:nudge,syncPush:function(){if(env)syncPush();},
    /* #plg=КОД холбоосоор орж ирвэл наадмын хуудсыг нээж, тэр лигт нэгдэнэ */
    fromHash:function(e){
      var m=/[#&]plg=([A-Za-z0-9]{6})/.exec(location.hash||"");if(!m)return false;
      try{history.replaceState(null,"",location.href.split("#")[0]);}catch(x){}
      env=e;h=e.h;if(!on())return false;
      P.pending=m[1].toUpperCase();return true;
    },
    /* «Тоглож сурах» самбарт: цол ба энэ 7 хоногийн байр (бүлгийг ачаалсан бол) */
    status:function(){var s=st(),t=TIERS[s.tier],me=rows&&s.wk===(env&&env.week())?rows.findIndex(function(r){return r.me;})+1:0;return {icon:t[0],name:t[1],rank:me,n:rows?rows.length:0};},
    on:function(e){env=e;h=e.h;return on();}
  };
})();
