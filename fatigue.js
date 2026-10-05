/* Салхи: 😮‍💨 ядаргаа мэдрэгч — хариултын дүн (.fb.ok / .fb.bad) гарах бүрийг ажиглана.
   Сүүлийн 10 хариултын тал нь буруу, эсвэл хариулт мэдэгдэхүйц удааширч алдаа нэмэгдсэн, эсвэл 35+ минут тасралтгүй
   суралцсан бол «Амсхийх үү?» гэж зөөлөн санал болгоно: хөнгөн тоглоом, 2 минутын амралт эсвэл үргэлжлүүлэх.
   Санал болгосны дараа 20 минут дахин гаргахгүй. */
(function(){
  var env=null,ev=[],sess=0,lastAt=0,cool=0,sheet=null,brk=null;
  var IDLE=10*60000,COOL=20*60000,LONG=35*60000;

  function note(ok){
    var now=Date.now();
    if(ev.length&&now-ev[ev.length-1].t<900&&ev[ev.length-1].ok===ok)return;
    if(!lastAt||now-lastAt>IDLE){sess=now;ev=[];}
    lastAt=now;ev.push({t:now,ok:ok});if(ev.length>40)ev.shift();
    check();
  }
  function check(){
    if(sheet||brk||Date.now()<cool||!env||!env.enabled())return;
    var last=ev.slice(-10),bad=last.filter(function(x){return !x.ok;}).length,why=null;
    if(last.length>=8&&bad>=5)why="err";
    else if(ev.length>=14){
      /* эхний 7 ба сүүлийн 7 хариултын хоорондох дундаж хугацаа */
      var gap=function(a){var s=0;for(var i=1;i<a.length;i++)s+=a[i].t-a[i-1].t;return s/(a.length-1);};
      var a=ev.slice(0,7),b=ev.slice(-7),eb=b.filter(function(x){return !x.ok;}).length;
      if(gap(b)>gap(a)*2.2&&eb>=3)why="slow";
    }
    if(!why&&Date.now()-sess>LONG&&ev.length>=20)why="long";
    if(why)show(why);
  }
  function close(){if(sheet){sheet.remove();sheet=null;}cool=Date.now()+COOL;}
  function show(why){
    var h=env.h,kid=env.kid();
    var msg={err:kid?"Өнөөдөр их хичээлээ! Тархи чинь жаахан ядарсан бололтой 🦊":"Сүүлийн хариултуудад алдаа нэмэгдэж байна. Ядарсан байж магадгүй.",
      slow:"Хариулт удааширч эхэллээ. Жаахан амсхийвэл илүү сайн тогтооно.",
      long:"Чи "+Math.round((Date.now()-sess)/60000)+" минут тасралтгүй суралцлаа. Гайхалтай! Одоо жаахан амсхийх үү?"}[why];
    sheet=h("div",{class:"ftsheet",role:"dialog","aria-modal":"false","aria-label":"Амсхийх санал"},
      h("div",{style:"display:flex;gap:10px;align-items:flex-start"},h("span",{style:"font-size:30px","aria-hidden":"true"},"😮‍💨"),
        h("div",{style:"flex:1"},h("b",null,"Амсхийх үү?"),h("div",{class:"muted small",style:"margin-top:2px"},msg))),
      h("div",{style:"display:flex;flex-direction:column;gap:6px;margin-top:10px"},
        h("button",{class:"btn primary",onclick:function(){close();env.lightGame();}},"🎮 2 минутын хөнгөн тоглоом"),
        h("button",{class:"btn",onclick:function(){close();rest();}},"☕ 2 минут амрах"),
        h("button",{class:"btn ghost",onclick:function(){close();}},"Үргэлжлүүлэх")));
    document.body.append(sheet);
  }
  /* 2 минутын амралт: амьсгал + сунгалтын зөвлөгөө */
  function rest(){
    var h=env.h,end=Date.now()+120000,tips=["Нүдээ аниад 4 тоолж амьсгал аваад, 4 тоолж гарга 🌬️","Мөрөө 5 удаа дээш өргөөд суллаарай 🙆","Цонхоор хамгийн хол цэг рүү 20 секунд харж нүдээ амраа 👀","Нэг аяга ус уугаарай 💧","Босоод хэдэн алхам алх 🚶"];
    var t=h("div",{style:"font:800 44px/1 var(--font);margin:14px 0"},"2:00"),tip=h("div",{style:"min-height:48px;font-weight:600"},tips[0]);
    brk=h("div",{class:"ftbreak",role:"dialog","aria-modal":"true","aria-label":"Амралт"},
      h("div",{class:"note",style:"max-width:360px;width:100%;text-align:center"},
        h("div",{style:"font-size:40px","aria-hidden":"true"},"☕"),h("b",null,"Амралтын цаг"),t,tip,
        h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:endRest},"Буцаж суралцах")));
    document.body.append(brk);
    brk.timer=setInterval(function(){
      var r=Math.max(0,Math.round((end-Date.now())/1000));
      t.textContent=Math.floor(r/60)+":"+String(r%60).padStart(2,"0");
      tip.textContent=tips[Math.min(tips.length-1,Math.floor((120-r)/24))];
      if(r<=0){endRest();env.toast("Амарлаа! Одоо илүү сайн тогтооно 💪");}
    },500);
  }
  function endRest(){if(brk){clearInterval(brk.timer);brk.remove();brk=null;}ev=[];sess=Date.now();cool=Date.now()+COOL;}

  window.Fatigue={
    init:function(e){
      env=e;
      var main=document.getElementById("main");if(!main||!window.MutationObserver)return;
      new MutationObserver(function(ms){
        ms.forEach(function(m){m.addedNodes.forEach(function(n){
          if(n.nodeType!==1)return;
          var f=n.matches&&n.matches(".fb")?n:n.querySelector&&n.querySelector(".fb.ok,.fb.bad");
          if(f&&f.classList.contains("ok"))note(true);else if(f&&f.classList.contains("bad"))note(false);
        });});
      }).observe(main,{childList:true,subtree:true});
    },
    _note:note,_show:show
  };
})();
