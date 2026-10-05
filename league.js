/* Салхи: долоо хоногийн лиг (Duolingo маягийн).
   Даваа гарагаас эхлэх 7 хоног бүр XP цуглуулсан хүмүүс өөрийн лигийн 20 хүртэлх хүнтэй бүлэгт (анхны XP-ээр) хуваарилагдана.
   7 хоног дуусахад эхний 5 нь дээд лиг рүү дэвшиж (+1 🧊 streak хамгаалалт), сүүлийн 3 нь (10+ хүнтэй бүлэгт) доод лиг рүү буурна.
   Firebase: lgn/{wk}/{tier} (бүлгийн тоолуур), lg/{wk}/{tier}/{g}/{uid} = {name, wxp, ts}.
   Хүүхдийн горимд үл таних хүмүүстэй өрсөлдөхгүй тул харагдахгүй. */
(function(){
  var TIERS=[["🥉","Хүрэл"],["🥈","Мөнгө"],["🥇","Алт"],["💎","Сапфир"],["👑","Алмаз"]];
  var GROUP=20,PROMO=5,DEMO=3,DEMO_MIN=10,KEY="salkhi:league";
  var env=null,h=null,db=null,uid=null,joining=false,pushT=null,lastPush=0,live=null,liveKey="",rows=null,err="";

  function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
  function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function st(){var s=ls(KEY,null);return s&&typeof s==="object"?s:{tier:0};}
  function save(s){lset(KEY,s);}
  function TS(){return firebase.database.ServerValue.TIMESTAMP;}
  function paint(){if(env)env.render();}
  function on(){return !!(env&&window.SALKHI_FB&&window.SalkhiFB&&!env.kid());}
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
    }).then(function(){joining=false;lastPush=Date.now();paint();},function(e){joining=false;err=String(e&&e.message||e);});
  }
  function push(){
    var s=st();if(s.wk!==env.week()){join();return;}
    if(Date.now()-lastPush<60000){clearTimeout(pushT);pushT=setTimeout(push,60000);return;}
    lastPush=Date.now();
    connect().then(function(){return db.ref(path(s)+"/"+uid).update({wxp:env.wxp(),name:name(),ts:TS()});}).catch(function(){});
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
        paint();
      },function(){});
    }).catch(function(){});
  }
  function detach(){if(live){try{live.off();}catch(e){}live=null;liveKey="";}}

  function zone(i,n,tier){
    if(i<PROMO&&n>1&&tier<TIERS.length-1)return "up";
    if(tier>0&&n>=DEMO_MIN&&i>=n-DEMO)return "down";
    return "";
  }
  function resultNote(s){
    var L=s.last;if(!L||L.seen)return null;
    var t=TIERS[s.tier],txt=L.move>0?"🎉 "+t[1]+" лиг рүү дэвшлээ! Шагнал: 🧊 streak хамгаалалт +1":L.move<0?"Энэ удаа "+t[1]+" лиг рүү буурлаа. Дахин дэвшицгээе 💪":L.rank?"Өнгөрсөн 7 хоногт "+L.rank+"-р байр эзэлж, "+t[1]+" лигтээ үлдлээ.":null;
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
        h("span",{"aria-label":z==="up"?"Дэвших бүс":z==="down"?"Буурах бүс":"",style:"width:16px;text-align:center"},z==="up"?"▲":z==="down"?"▼":"")));
    });
    return box;
  }
  function body(full){
    var s=st(),t=TIERS[s.tier],root=h("div");
    root.append(h("div",{style:"display:flex;align-items:center;gap:12px"},
      h("span",{style:"font-size:40px","aria-hidden":"true"},t[0]),
      h("div",{style:"flex:1"},h("div",{style:"font-weight:800;font-size:18px"},t[1]+" лиг"),h("div",{class:"muted small"},"Дуусахад "+leftText()+" үлдлээ"))));
    var rn=resultNote(s);if(rn)root.append(rn);
    if(s.wk!==env.week()){
      root.append(h("p",{class:"small",style:"margin:10px 0 0"},joining?"Лигт нэгдэж байна…":"Энэ 7 хоногт XP цуглуулаад лигт нэгдээрэй. Эхний "+PROMO+" нь дараагийн лиг рүү дэвшинэ."));
      if(!joining&&env.wxp()>0)join();
      return root;
    }
    attach();
    if(!rows){root.append(h("p",{class:"muted small"},"Ачаалж байна…"));return root;}
    var me=rows.findIndex(function(r){return r.me;})+1;
    root.append(h("p",{class:"small",style:"margin:8px 0 0"},"Чи "+(me||"—")+"-р байранд · "+rows.length+" хүн"+(s.tier<TIERS.length-1?" · Эхний "+PROMO+" нь ▲ дэвшинэ":"")+(s.tier>0&&rows.length>=DEMO_MIN?" · Сүүлийн "+DEMO+" нь ▼ буурна":"")));
    root.append(table(s,full?0:5));
    if(!full&&rows.length>5)root.append(h("p",{class:"muted small",style:"margin:6px 0 0;text-align:center"},"Бүгдийг харах ›"));
    return root;
  }
  function card(e,open){
    env=e;h=e.h;
    if(!on())return null;
    return h("button",{class:"note",type:"button",style:"display:block;width:100%;text-align:left;margin-top:12px;color:inherit;font:inherit;cursor:pointer",onclick:open},
      h("div",{class:"muted small",style:"margin-bottom:6px"},"🏆 Долоо хоногийн лиг"),body(false));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    root.append(h("button",{class:"back",onclick:function(){e.close();}},"‹ Профайл"));
    root.append(h("h2",null,"🏆 Долоо хоногийн лиг"));
    root.append(h("div",{style:"display:flex;justify-content:space-between;margin:4px 0 12px"},TIERS.map(function(t,i){
      var s=st();return h("div",{style:"text-align:center;opacity:"+(i===s.tier?1:i<s.tier?.75:.35)},h("div",{style:"font-size:"+(i===s.tier?32:24)+"px"},t[0]),h("div",{class:"small",style:"font-weight:"+(i===s.tier?800:500)},t[1]));
    })));
    root.append(body(true));
    root.append(h("p",{class:"muted small",style:"margin-top:14px"},"XP бүх хичээл, тоглоом, давталтаас цуглардаг. Лиг бүр Даваа гарагийн 00:00-д шинэчлэгдэнэ. Дэвшсэн бүрт 🧊 streak хамгаалалт +1 авна."));
    if(err)root.append(h("p",{class:"muted small"},err));
    return root;
  }
  window.League={
    init:function(e){env=e;h=e.h;if(!on())return;setTimeout(function(){rollover().then(function(){if(env.wxp()>0)push();});},5000);},
    touch:function(){if(on())push();},
    card:card,view:view,detach:detach,
    tier:function(){return TIERS[st().tier];}
  };
})();
