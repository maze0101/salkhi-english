/* Салхи: 🏆 улирлын тэмцээн — жилд 5 удаа, 14 хоног үргэлжилнэ (Шинэ жил, Цагаан сар, Хүүхдийн баяр, Наадам, Хичээлийн шинэ жил).
   Зорилго: тэмцээний хугацаанд 300 XP + 7 өдөр хичээллэх. Биелүүлбэл тусгай медаль ба гэрчилгээ (Профайл → 🎓 Гэрчилгээ).
   Явцыг апп-ын өдрийн XP-ээс (state.daily) тооцдог тул сервер шаардахгүй. Цагаан сарын огноо жил бүр өөр тул ойролцоо 2-р сарын эхний 14 хоног. */
(function(){
  var GOAL_XP=300,GOAL_DAYS=7,KEY="evmedal";
  var EV=[
    {id:"newyear",ic:"❄️",t:"Шинэ жилийн сорил",from:[12,20],to:[1,2],m:"Өвлийн цасан медаль"},
    {id:"tsagaan",ic:"🐎",t:"Цагаан сарын сорил",from:[2,1],to:[2,14],m:"Цагаан сарын мөнгөн медаль"},
    {id:"kids",ic:"🎈",t:"Хүүхдийн баярын сорил",from:[5,25],to:[6,7],m:"Хүүхдийн баярын медаль"},
    {id:"naadam",ic:"🏇",t:"Наадмын сорил",from:[7,1],to:[7,14],m:"Наадмын алтан медаль"},
    {id:"school",ic:"🎒",t:"Хичээлийн шинэ жилийн сорил",from:[9,1],to:[9,14],m:"Шинэ хичээлийн жилийн медаль"}
  ];
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
    if(p.xp>=GOAL_XP&&p.days>=GOAL_DAYS){m[c.w.key]={ic:c.e.ic,t:c.e.m,ev:c.e.t,d:dk(new Date())};env.sset(KEY,m);env.toast(c.e.ic+" "+c.e.m+" авлаа! Гэрчилгээ нээгдлээ 🎓",6000);env.celebrate();}
  }
  function bar(v,max){var pct=Math.min(100,Math.round(v/max*100));return env.h("div",{style:"height:8px;border-radius:8px;background:var(--line);overflow:hidden;margin:4px 0 8px"},env.h("i",{style:"display:block;height:100%;width:"+pct+"%;background:"+(pct>=100?"var(--ok)":"var(--neon)")}));}
  /* дараагийн тэмцээн хүртэл (идэвхтэй тэмцээн байхгүй үед hub-д харуулна) */
  function upcoming(){
    var now=new Date(),best=null;
    EV.forEach(function(e){for(var dy=0;dy<2;dy++){var s=new Date(now.getFullYear()+dy,e.from[0]-1,e.from[1]);if(s>now&&(!best||s<best.s)){best={e:e,s:s};break;}}});
    return best;
  }
  function card(e,teaser){
    env=e;var h=e.h,c=current();
    if(!c){
      if(!teaser)return null;var u=upcoming();if(!u)return null;
      var dd=Math.ceil((u.s-new Date())/86400000);
      return h("div",{class:"srow",style:"margin-top:12px"},h("span",{style:"flex:1"},h("b",null,u.e.ic+" Дараагийн тэмцээн: "+u.e.t),h("div",{class:"muted small"},dd+" хоногийн дараа эхэлнэ · 14 хоногт "+GOAL_XP+" XP + "+GOAL_DAYS+" өдөр → "+u.e.m)));
    }
    var p=progress(c),got=medals()[c.w.key];
    var box=h("div",{class:"note",style:"margin:0 0 12px;border-color:var(--sky)"});
    box.append(h("div",{style:"display:flex;align-items:center;gap:10px"},h("span",{style:"font-size:32px","aria-hidden":"true"},c.e.ic),
      h("div",{style:"flex:1"},h("b",null,c.e.t),h("div",{class:"muted small"},got?"🏅 Медаль авсан!":"Дуусахад "+p.left+" өдөр үлдлээ · шагнал: "+c.e.m))));
    if(!got){
      box.append(h("div",{class:"small",style:"margin-top:8px"},"⚡ "+Math.min(p.xp,GOAL_XP)+" / "+GOAL_XP+" XP"),bar(p.xp,GOAL_XP));
      box.append(h("div",{class:"small"},"📅 "+Math.min(p.days,GOAL_DAYS)+" / "+GOAL_DAYS+" өдөр хичээллэсэн"),bar(p.days,GOAL_DAYS));
    }else box.append(h("div",{class:"small",style:"margin-top:6px"},"Профайл → 🎓 Гэрчилгээ хэсгээс тусгай гэрчилгээгээ татаарай."));
    return box;
  }
  window.Events={
    init:function(e){env=e;},
    touch:function(){if(env)check();},
    card:card,
    /* certList-д нэмэх: [{ic,t,d}] */
    certs:function(e){env=e;var m=medals();return Object.keys(m).map(function(k){var x=m[k];return {ic:x.ic,t:x.t,d:x.ev+"-д "+GOAL_XP+" XP, "+GOAL_DAYS+" өдөр хичээллэв"};});},
    _current:current
  };
})();
