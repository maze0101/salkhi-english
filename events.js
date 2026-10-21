/* Салхи: 🏆 улирлын тэмцээн — жилд 13 удаа, ~14 хоног үргэлжилнэ (Шинэ жил, Цагаан сар, Хүүхдийн баяр, Наадам, Хичээлийн шинэ жил).
   Зорилго: тэмцээний хугацаанд 300 XP + 7 өдөр хичээллэх. Биелүүлбэл тусгай медаль ба гэрчилгээ (Профайл → 🎓 Гэрчилгээ).
   Явцыг апп-ын өдрийн XP-ээс (state.daily) тооцдог тул сервер шаардахгүй. Цагаан сарын огноо жил бүр өөр тул ойролцоо 2-р сарын эхний 14 хоног. */
(function(){
  var GOAL_XP=300,GOAL_DAYS=7,KEY="evmedal";
  var EV=[
    /* xp/days байхгүй бол GOAL_XP / GOAL_DAYS. Хугацаа давхцахгүй (оны дарааллаар) */
    {id:"winter",ic:"⛄",t:"Есөн есийн сорил",from:[1,15],to:[1,28],m:"Хүйтэн жавартай медаль",xp:350,d:"Хамгийн хүйтэн үед ч гэрээсээ сурна"},
    {id:"tsagaan",ic:"🐎",t:"Цагаан сарын сорил",from:[2,1],to:[2,14],m:"Цагаан сарын мөнгөн медаль"},
    {id:"spring",ic:"🌷",t:"Хаврын сорил",from:[3,1],to:[3,14],m:"Хаврын цэцгийн медаль",d:"Эмэгтэйчүүдийн баяраар хамт сурцгаая"},
    {id:"book",ic:"📚",t:"Номын баярын сорил",from:[4,16],to:[4,29],m:"Номын хорхойн медаль",xp:250,days:8,d:"Дэлхийн номын өдөр (4/23) — түүх, бичвэр уншаарай"},
    {id:"marathon",ic:"🏃",t:"Хэлний марафон",from:[5,1],to:[5,14],m:"Марафончны медаль",xp:500,days:10,d:"Хамгийн хэцүү нь — 14 хоногт 10 өдөр"},
    {id:"kids",ic:"🎈",t:"Хүүхдийн баярын сорил",from:[5,25],to:[6,7],m:"Хүүхдийн баярын медаль"},
    {id:"summer",ic:"☀️",t:"Зуны амралтын сорил",from:[6,15],to:[6,28],m:"Зуны нарны медаль",xp:250,d:"Амралтаараа хэлээ мартахгүй"},
    {id:"naadam",ic:"🏇",t:"Наадмын сорил",from:[7,1],to:[7,14],m:"Наадмын алтан медаль"},
    {id:"steppe",ic:"⛺",t:"Зуслангийн сорил",from:[8,1],to:[8,14],m:"Талын салхины медаль",xp:250,d:"Хөдөө, зусланд ч өдөрт 5 минут"},
    {id:"school",ic:"🎒",t:"Хичээлийн шинэ жилийн сорил",from:[9,1],to:[9,14],m:"Шинэ хичээлийн жилийн медаль"},
    {id:"autumn",ic:"🍂",t:"Алтан намрын сорил",from:[10,20],to:[11,2],m:"Алтан навчны медаль"},
    {id:"indep",ic:"🦅",t:"Тусгаар тогтнолын сорил",from:[11,20],to:[12,3],m:"Хүлэг баатрын медаль",xp:400,days:8,d:"11/26 — Үндэсний эрх чөлөө, тусгаар тогтнолын өдөр"},
    {id:"newyear",ic:"❄️",t:"Шинэ жилийн сорил",from:[12,20],to:[1,2],m:"Өвлийн цасан медаль"}
  ];
  function gx(e){return e.xp||GOAL_XP;}
  function gd(e){return e.days||GOAL_DAYS;}
  function span(e){var y=2001,s=new Date(y,e.from[0]-1,e.from[1]),t=new Date(y,e.to[0]-1,e.to[1]);if(t<s)t=new Date(y+1,e.to[0]-1,e.to[1]);return Math.round((t-s)/86400000)+1;}
  var env=null;
  function dk(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  /* тухайн өдөр идэвхтэй тэмцээн (Шинэ жил оны заагийг давна) */
  function window_(e,now){
    var y=now.getFullYear(),s=new Date(y,e.from[0]-1,e.from[1]),t=new Date(y,e.to[0]-1,e.to[1],23,59,59);
    if(t<s){if(now.getMonth()+1<=e.to[0])s=new Date(y-1,e.from[0]-1,e.from[1]);else t=new Date(y+1,e.to[0]-1,e.to[1],23,59,59);}
    return {s:s,t:t,key:e.id+":"+s.getFullYear()};
  }
  function current(now){
    now=now||new Date();
    for(var i=0;i<EV.length;i++){var w=window_(EV[i],now);if(now>=w.s&&now<=w.t)return {e:EV[i],w:w};}
    return null;
  }
  function progress(c){
    var daily=env.daily(),xp=0,days=0,d=new Date(c.w.s),end=new Date(Math.min(Date.now(),c.w.t.getTime()));
    while(d<=end){var v=daily[dk(d)]||0;xp+=v;if(v>0)days++;d.setDate(d.getDate()+1);}
    return {xp:xp,days:days,left:Math.max(0,Math.ceil((c.w.t-Date.now())/86400000))};
  }
  function medals(){var m=env.sget(KEY,{});return m&&typeof m==="object"?m:{};}
  /* XP нэмэгдэх бүрт: зорилго биелсэн бол медаль олгоно */
  function check(){
    var c=current();if(!c)return;
    var m=medals();if(m[c.w.key])return;
    var p=progress(c);
    if(p.xp>=gx(c.e)&&p.days>=gd(c.e)){m[c.w.key]={ic:c.e.ic,t:c.e.m,ev:c.e.t,d:dk(new Date()),x:gx(c.e),n:gd(c.e)};env.sset(KEY,m);env.toast(c.e.ic+" "+c.e.m+" авлаа! Гэрчилгээ нээгдлээ 🎓",6000);env.celebrate();lastPush=0;}
    push(c);
  }

  /* 👥 оролцогчид: Firebase ev/{id_он}/{uid} = {name, xp, days, done, av?, ts}. Минутад нэг л удаа бичнэ, жагсаалтыг 60 сек кэшлэнэ.
     Firebase тохируулаагүй (SALKHI_FB байхгүй) бол юу ч хийхгүй — карт өмнөх шигээ ажиллана. */
  var lastPush=0,pushT=0,roster={},mine={};
  function fbOn(){return !!(window.SALKHI_FB&&window.SalkhiFB&&window.firebase);}
  function fbKey(c){return c.w.key.replace(":","_");}
  function myName(){return String(env.name&&env.name()||"").trim().split(/\s+/)[0].slice(0,20)||"Суралцагч";}
  function push(c){
    if(!fbOn())return;
    var p=progress(c);if(!p.xp)return;
    if(Date.now()-lastPush<60000){clearTimeout(pushT);pushT=setTimeout(function(){push(c);},60000);return;}
    lastPush=Date.now();
    var v={name:myName(),xp:Math.min(p.xp,50000),days:Math.min(p.days,31),done:!!medals()[c.w.key],ts:firebase.database.ServerValue.TIMESTAMP};
    var av=env.avatar&&env.avatar();if(av&&av.e)v.av=String(av.e).slice(0,16);
    var k=fbKey(c);
    window.SalkhiFB.user().then(function(u){
      return firebase.database().ref("ev/"+k+"/"+u.uid).set(v).then(function(){var first=!mine[k];mine[k]=Object.assign({},v,{uid:u.uid});if(roster[k]){roster[k].me=u.uid;if(first&&(!env.visible||env.visible()))env.render();}});
    }).catch(function(){});
  }
  function load(c){
    var k=fbKey(c),r=roster[k];
    if(!fbOn()||(r&&(r.busy||Date.now()-r.at<60000)))return;
    roster[k]=r={busy:true,at:Date.now(),list:r&&r.list,me:r&&r.me};
    window.SalkhiFB.user().then(function(u){
      r.me=u.uid;
      return firebase.database().ref("ev/"+k).orderByChild("xp").limitToLast(200).once("value");
    }).then(function(s){
      var out=[];s.forEach(function(x){var v=x.val()||{};v.uid=x.key;out.push(v);});
      r.list=out;r.busy=false;r.at=Date.now();
      if(!env.visible||env.visible())env.render();
    }).catch(function(){r.busy=false;r.err=true;});
  }
  function people(c){
    if(!fbOn())return null;
    var h=env.h,r=roster[fbKey(c)];load(c);
    /* шинэчлэлтээс өмнө явцтай байсан хүн ч XP авахыг хүлээлгүй жагсаалтад орно */
    if(!lastPush)push(c);
    if(!r||!r.list)return h("div",{class:"muted small",style:"margin-top:10px"},"👥 Оролцогчдыг ачаалж байна…");
    /* өөрийн сүүлд бичсэн мөрийг (сервер хариулахаас өмнө ч) жагсаалтад оруулна */
    var my=mine[fbKey(c)],L=r.list.filter(function(x){return !my||x.uid!==my.uid;}).concat(my?[my]:[]);
    if(my)r.me=my.uid;
    L=L.sort(function(a,b){return (b.done?1:0)-(a.done?1:0)||(b.xp||0)-(a.xp||0);}),done=L.filter(function(x){return x.done;}).length;
    if(!L.length)return h("div",{class:"muted small",style:"margin-top:10px"},"👥 Одоохондоо хэн ч оролцоогүй — эхнийх нь болоорой!");
    var ul=h("ol",{class:"evp"});
    L.slice(0,ui.all?L.length:8).forEach(function(x,i){
      ul.append(h("li",{class:x.uid===r.me?"me":null},
        h("span",{class:"evp-n"},String(i+1)),
        h("span",{class:"evp-av","aria-hidden":"true"},x.av||"🙂"),
        h("span",{class:"evp-nm"},String(x.name||"Суралцагч").slice(0,20)+(x.uid===r.me?" (та)":"")),
        h("span",{class:"evp-st"},x.done?"🏅 Медаль":(x.xp|0)+" XP · "+(x.days|0)+" өдөр")));
    });
    var box=h("div",{style:"margin-top:12px"},
      h("div",{class:"small",style:"font-weight:700;margin-bottom:6px"},"👥 Оролцогчид: "+L.length+" хүн"+(done?" · 🏅 "+done+" нь медаль авсан":"")),ul);
    if(L.length>8)box.append(h("button",{class:"back",type:"button",style:"margin-top:6px;font-size:14px",onclick:function(){ui.all=!ui.all;env.render();}},ui.all?"Хураах":"Бүгдийг харах ("+L.length+")"));
    return box;
  }
  var ui={all:false};
  function bar(v,max){var pct=Math.min(100,Math.round(v/max*100));return env.h("div",{style:"height:8px;border-radius:8px;background:var(--line);overflow:hidden;margin:4px 0 8px"},env.h("i",{style:"display:block;height:100%;width:"+pct+"%;background:"+(pct>=100?"var(--ok)":"var(--neon)")}));}
  /* дараагийн тэмцээн хүртэл (идэвхтэй тэмцээн байхгүй үед hub-д харуулна) */
  function upcoming(){
    var now=new Date(),best=null;
    EV.forEach(function(e){for(var dy=0;dy<2;dy++){var s=new Date(now.getFullYear()+dy,e.from[0]-1,e.from[1]);if(s>now&&(!best||s<best.s)){best={e:e,s:s};break;}}});
    return best;
  }
  /* тэмцээн бүрийн өнгө (харанхуй горимд ч цагаан бичигтэй тул ижил) */
  var TH={newyear:["#173E8C","#3F8FD8"],tsagaan:["#24509E","#6FA3DD"],kids:["#C23A78","#F09A3E"],naadam:["#A50E26","#D99A1E"],school:["#22694B","#5FAE5A"],
    winter:["#2B3F6B","#7FA7D9"],spring:["#B03A6E","#E98FB4"],book:["#5A3E8C","#9C7BD1"],marathon:["#B8461B","#EE9A3A"],summer:["#C77700","#F2C230"],
    steppe:["#3E6B2A","#8DBF5A"],autumn:["#8C3B12","#D98A2B"],indep:["#1F3F8F","#C8102E"]};
  function md(a){return a[0]+"-р сарын "+a[1];}
  function teaserCard(h,ev,dd){
    var t=TH[ev.id]||TH.newyear;
    return h("div",{class:"evt","data-ic":ev.ic,style:"background:linear-gradient(135deg,"+t[0]+" 0%,"+t[1]+" 100%)"},
      h("div",{class:"evt-top"},
        h("span",{class:"evt-ic","aria-hidden":"true"},ev.ic),
        h("div",{style:"flex:1;min-width:0"},
          h("div",{class:"evt-k"},"Дараагийн тэмцээн"),
          h("div",{class:"evt-t"},ev.t),
          h("div",{class:"evt-d"},md(ev.from)+" – "+md(ev.to))),
        h("div",{class:"evt-cd","aria-label":dd+" хоногийн дараа эхэлнэ"},h("b",null,String(dd)),h("span",null,"хоног үлдлээ"))),
      h("div",{class:"evt-goal"},
        h("div",null,h("span",{"aria-hidden":"true"},"⚡"),h("b",null,gx(ev)+" XP")),
        h("div",null,h("span",{"aria-hidden":"true"},"📅"),h("b",null,gd(ev)+" өдөр")),
        h("div",null,h("span",{"aria-hidden":"true"},"⏳"),h("b",null,span(ev)+" хоногт"))),
      h("div",{class:"evt-m"},h("span",{"aria-hidden":"true"},"🏅"),h("span",null,"Шагнал: ",h("b",null,ev.m))));
  }
  function card(e,teaser){
    env=e;var h=e.h,c=current();
    if(!c){
      if(!teaser)return null;var u=upcoming();if(!u)return null;
      var dd=Math.ceil((u.s-new Date())/86400000);
      return teaserCard(h,u.e,dd);
    }
    var p=progress(c),got=medals()[c.w.key];
    var box=h("div",{class:"note",style:"margin:0 0 12px;border-color:var(--sky)"});
    box.append(h("div",{style:"display:flex;align-items:center;gap:10px"},h("span",{style:"font-size:32px","aria-hidden":"true"},c.e.ic),
      h("div",{style:"flex:1"},h("b",null,c.e.t),h("div",{class:"muted small"},got?"🏅 Медаль авсан!":"Дуусахад "+p.left+" өдөр үлдлээ · шагнал: "+c.e.m))));
    if(!got){
      if(c.e.d)box.append(h("div",{class:"muted small",style:"margin-top:6px"},c.e.d));
      box.append(h("div",{class:"small",style:"margin-top:8px"},"⚡ "+Math.min(p.xp,gx(c.e))+" / "+gx(c.e)+" XP"),bar(p.xp,gx(c.e)));
      box.append(h("div",{class:"small"},"📅 "+Math.min(p.days,gd(c.e))+" / "+gd(c.e)+" өдөр хичээллэсэн"),bar(p.days,gd(c.e)));
    }else box.append(h("div",{class:"small",style:"margin-top:6px"},"Профайл → 🎓 Гэрчилгээ хэсгээс тусгай гэрчилгээгээ татаарай."));
    var pp=people(c);if(pp)box.append(pp);
    return box;
  }
  window.Events={
    init:function(e){env=e;},
    touch:function(){if(env)check();},
    card:card,
    /* 🏅 медалийн цомог: 13 тэмцээн, авсан медаль өнгөтэй (аль онд авсан), аваагүй нь саарал */
    album:function(e){
      env=e;var h=e.h,m=medals(),byId={},n=0;
      Object.keys(m).forEach(function(k){var p=k.split(":");(byId[p[0]]=byId[p[0]]||[]).push(p[1]);});
      var grid=h("div",{class:"alb"});
      EV.forEach(function(ev){
        var ys=(byId[ev.id]||[]).sort(),t=TH[ev.id]||TH.newyear;if(ys.length)n++;
        grid.append(h("div",{class:ys.length?"":"no",title:ev.m+" — "+ev.t,"aria-label":ev.m+(ys.length?", авсан: "+ys.join(", "):", хараахан аваагүй")},
          h("span",{class:"am",style:"background:linear-gradient(135deg,"+t[0]+","+t[1]+")","aria-hidden":"true"},ev.ic),
          ev.m,ys.length?h("span",{class:"ay"},"🏅 "+ys.join(", ")):h("span",{class:"ay",style:"color:var(--ink-2)"},ev.from.join("/")+" – "+ev.to.join("/"))));
      });
      return h("div",null,h("h3",{style:"margin:20px 0 0"},"🏅 Медалийн цомог: "+n+" / "+EV.length),grid);
    },
    /* 🗓️ жилийн тэмцээний хуанли (Тоглож сурах самбарт): ойрын эхлэх дарааллаар, авсан медаль ✓ */
    calendar:function(e,open){
      env=e;var h=e.h,now=new Date(),m=medals(),c=current(now);
      var rows=EV.map(function(ev){var w=window_(ev,now);if(w.t<now){w=window_(ev,new Date(w.s.getFullYear()+1,ev.from[0]-1,ev.from[1]));}return {e:ev,w:w};})
        .sort(function(a,b){return a.w.s-b.w.s;});
      var mine=Object.keys(m).length;
      var list=h("div",{class:"evcal"});
      rows.forEach(function(r){
        var on=c&&c.e.id===r.e.id,got=m[r.w.key],t=TH[r.e.id]||TH.newyear;
        var dd=Math.ceil((r.w.s-now)/86400000);
        list.append(h("div",{class:"evrow"+(on?" on":""),title:r.e.d||null},
          h("span",{class:"evr-ic",style:"background:linear-gradient(135deg,"+t[0]+","+t[1]+")","aria-hidden":"true"},r.e.ic),
          h("span",{class:"evr-tx"},h("b",null,r.e.t),h("span",{class:"muted small"},r.e.from.join("/")+" – "+r.e.to.join("/")+" · "+gx(r.e)+" XP, "+gd(r.e)+" өдөр")),
          h("span",{class:"evr-st"},got?"🏅":on?"Одоо":dd+" хоног")));
      });
      return h("details",{class:"note evcal-box",style:"margin-top:12px",open:!!open},
        h("summary",null,h("b",null,"🗓️ Тэмцээний хуанли"),h("span",{class:"muted small"}," · жилд "+EV.length+" тэмцээн · "+mine+" медаль авсан")),
        list);
    },
    /* hero-д ээлжлэн гарах жагсаалт: явагдаж буй (медаль аваагүй) + дараагийн n тэмцээн, эхлэх дарааллаар */
    list:function(e,n){
      env=e;var now=new Date(),c=current(now),m=medals(),out=[];
      if(c&&!m[c.w.key])out.push({e:c.e,cur:true,left:progress(c).left,c:(TH[c.e.id]||TH.newyear)[1]});
      EV.map(function(ev){var w=window_(ev,now);if(w.s<=now)w=window_(ev,new Date(w.s.getFullYear()+1,ev.from[0]-1,ev.from[1]));return {e:ev,s:w.s};})
        .filter(function(r){return r.s>now&&!(c&&c.e.id===r.e.id);})
        .sort(function(a,b){return a.s-b.s;}).slice(0,n||4)
        .forEach(function(r){out.push({e:r.e,cur:false,dd:Math.ceil((r.s-now)/86400000),c:(TH[r.e.id]||TH.newyear)[1]});});
      return out;
    },
    /* hero-гийн жижиг карт: явагдаж буй (медаль аваагүй) эсвэл дараагийн тэмцээн + өнгө */
    next:function(e){
      env=e;var c=current();
      if(c&&!medals()[c.w.key])return {e:c.e,cur:true,left:progress(c).left,c:(TH[c.e.id]||TH.newyear)[1]};
      var u=upcoming();if(!u)return null;
      return {e:u.e,cur:false,dd:Math.ceil((u.s-new Date())/86400000),c:(TH[u.e.id]||TH.newyear)[1]};
    },
    /* certList-д нэмэх: [{ic,t,d}] */
    certs:function(e){env=e;var m=medals();return Object.keys(m).map(function(k){var x=m[k];return {ic:x.ic,t:x.t,d:x.ev+"-д "+(x.x||GOAL_XP)+" XP, "+(x.n||GOAL_DAYS)+" өдөр хичээллэв"};});},
    _current:current
  };
})();
