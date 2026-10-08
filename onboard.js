/* Салхи: 🧭 анхны танилцуулга — шинэ хэрэглэгч анх нээхэд 4 алхам: зорилго → хэл → түвшин → өдрийн зорилго.
   Сонголтоор горим (хүүхэд/том хүн), хэл, түвшинг тохируулж, «Танд зориулсан» товчлолуудыг нүүрэнд харуулна.
   «Шалгуулж мэдье» бол одоо байгаа түвшин тогтоох шалгалтыг нээнэ. Нэг л удаа гарна, «Алгасах» боломжтой. */
(function(){
  var GOALS=[
    ["eesh","🎓","ЭЕШ-д бэлдэх","Хэл, математик, түүх, нийгэм",["en","ru"]],
    ["travel","✈️","Аялал","Гадаадад аялахдаа ярих",null],
    ["job","💼","Гадаадад ажиллах","Солонгос, Япон, Европт ажиллах",["ko","ja","de","en"]],
    ["talk","💬","Ярьж сурах","Чөлөөтэй ярих, сонсож ойлгох",null],
    ["kid","🧒","Хүүхэддээ","Хүүхдийн тоглоомлог горим",null],
    ["general","🌱","Сонирхлоороо","Кино, дуу, шинэ хэл",null]
  ];
  var LANGS=[["en","🇬🇧","Англи"],["ko","🇰🇷","Солонгос"],["ja","🇯🇵","Япон"],["zh","🇨🇳","Хятад"],["ru","🇷🇺","Орос"],["de","🇩🇪","Герман"]];
  var env=null,h=null,O=null,ov=null;
  function close(){if(ov){ov.remove();ov=null;}document.documentElement.style.overflow="";}
  function finish(placement){
    env.sset("onb",{goal:O.goal,ts:Date.now()});env.render();
    close();
    if(placement)env.placement();else{env.toast("🎉 Бэлэн боллоо! Өнөөдрийн 5 минутаас эхлээрэй");if(env.afterDone)env.afterDone();}
  }
  function step(){
    if(!ov)return;
    ov.textContent="";
    var box=h("div",{class:"onbbox"}),n=O.kid?3:4;
    box.append(h("div",{class:"onbtop"},h("span",{class:"muted small"},(O.s+1)+" / "+n),h("button",{class:"btn ghost",style:"padding:4px 10px",onclick:function(){env.sset("onb",{goal:O.goal||"skip",ts:Date.now()});close();}},"Алгасах")));
    if(O.s===0){
      box.append(h("img",{src:"icon-192.png",alt:"",width:"64",height:"64",style:"border-radius:16px;align-self:center"}));
      box.append(h("h2",{style:"text-align:center;margin:10px 0 4px"},"Салхид тавтай морил!"),h("p",{class:"muted",style:"text-align:center;margin:0 0 14px"},"Юуны тулд хэл сурч байна вэ?"));
      var g=h("div",{class:"onbgrid"});
      GOALS.forEach(function(x){g.append(h("button",{class:"onbopt",type:"button",onclick:function(){O.goal=x[0];O.kid=x[0]==="kid";O.langs=x[4];O.s=1;if(O.kid)env.setMode("kid");else if(env.mode()==="kid")env.setMode("adult");step();}},
        h("span",{class:"oi","aria-hidden":"true"},x[1]),h("b",null,x[2]),h("span",{class:"muted small"},x[3])));});
      box.append(g);
    }else if(O.s===1){
      box.append(h("h2",{style:"margin:6px 0 12px"},"Аль хэлийг сурах вэ?"));
      var g2=h("div",{class:"onbgrid"});
      LANGS.forEach(function(l){
        var rec=O.langs&&O.langs.indexOf(l[0])>=0,off=O.goal==="eesh"&&!rec;
        if(off)return;
        g2.append(h("button",{class:"onbopt"+(rec?" rec":""),type:"button",onclick:function(){env.setLang(l[0]);O.s=O.kid?3:2;step();}},
          h("span",{class:"oi","aria-hidden":"true"},l[1]),h("b",null,l[2]),rec?h("span",{class:"muted small"},"Таны зорилгод тохирно"):null));
      });
      box.append(g2);
    }else if(O.s===2){
      box.append(h("h2",{style:"margin:6px 0 12px"},"Хэр сайн мэдэх вэ?"));
      [["a1","🌱","Огт мэдэхгүй","Үсэг, энгийн үгнээс эхэлнэ"],["a2","🌿","Бага зэрэг мэднэ","Энгийн өгүүлбэр ойлгоно"],["test","🎯","Шалгуулж мэдье","3 минутын түвшин тогтоох шалгалт"]].forEach(function(x){
        box.append(h("button",{class:"onbopt row1",type:"button",onclick:function(){if(x[0]==="test")O.test=true;else env.setLevel(x[0]);O.s=3;step();}},
          h("span",{class:"oi","aria-hidden":"true"},x[1]),h("span",null,h("b",null,x[2]),h("div",{class:"muted small"},x[3]))));
      });
    }else{
      box.append(h("h2",{style:"margin:6px 0 4px"},"Өдөрт хэдэн минут?"),h("p",{class:"muted",style:"margin:0 0 12px"},"Бага ч гэсэн өдөр бүр хичээллэх нь хамгийн үр дүнтэй."));
      [[10,"☕","5 минут","Хөнгөн"],[20,"🚶","10 минут","Тогтмол"],[50,"🏃","20+ минут","Эрчимтэй"]].forEach(function(x){
        box.append(h("button",{class:"onbopt row1"+(x[0]===20?" rec":""),type:"button",onclick:function(){env.setGoalXP(x[0]);finish(O.test);}},
          h("span",{class:"oi","aria-hidden":"true"},x[1]),h("span",null,h("b",null,x[2]+" · "+x[0]+" XP"),h("div",{class:"muted small"},x[3]))));
      });
    }
    ov.append(box);
  }
  /* «Танд зориулсан» товчлол (Үгс таб) */
  var SHORT={
    eesh:[["🎓","ЭЕШ сорил","eesh"],["📝","Загвар шалгалт","exam"],["✍️","Бичих","write"]],
    travel:[["🧳","Аяллын бэлтгэл","travel"],["📞","AI дуудлага","call"],["📸","Камераар орчуулах","ocr"]],
    job:[["💼","Ажлын бэлтгэл","job"],["📞","AI дуудлага","call"],["🌍","Гадаадад амьдрах","chat"]],
    talk:[["📞","AI дуудлага","call"],["💬","Ярианы дасгал","chat"],["🎙","Давтаж ярих","shadow"]],
    kid:[["🦊","Үнэгний шалгалт","kidexam"],["🎮","Тоглоом","games"],["🔤","Үсэг","alpha"]],
    general:[["🎵","Дуугаар сурах","songs"],["🧩","AI түүх","adv"],["📺","Дэлгэцийн хэл","screen"]]
  };
  function forYou(e){
    env=e;h=e.h;var o=e.sget("onb",null);if(!o||!SHORT[o.goal]||e.sget("onbhide",0))return null;
    var g=GOALS.filter(function(x){return x[0]===o.goal;})[0];
    return h("div",{class:"note",style:"margin:0 0 12px"},
      h("div",{style:"display:flex;align-items:center;gap:8px"},h("b",{style:"flex:1"},"✨ Танд зориулсан · "+g[1]+" "+g[2]),
        h("button",{class:"btn ghost",style:"padding:4px 10px","aria-label":"Нуух",onclick:function(){e.sset("onbhide",1);e.render();}},"✕")),
      h("div",{style:"display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"},SHORT[o.goal].filter(function(x){return e.can(x[2]);}).map(function(x){
        return h("button",{class:"chip",style:"padding:8px 12px",onclick:function(){e.go(x[2]);}},x[0]+" "+x[1]);})));
  }
  window.Onboard={
    maybe:function(e){
      env=e;h=e.h;
      if(e.sget("onb",null)||e.used())return false;
      O={s:0,goal:null};ov=h("div",{class:"onbov",role:"dialog","aria-modal":"true","aria-label":"Танилцуулга"});
      document.body.append(ov);document.documentElement.style.overflow="hidden";step();return true;
    },
    forYou:forYou
  };
})();
