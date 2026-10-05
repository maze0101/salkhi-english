/* Салхи: 🧳 «Аяллын өмнөх 7 хоног» — хэрэглэгч хаашаа, хэзээ явахаа оруулна; апп 7 өдрийн хөтөлбөр гаргана
   (нисэх буудал → зочид буудал → тээвэр → ресторан → дэлгүүр → зам асуух, яаралтай үед → давтлага).
   Өдөр бүр AI тухайн хот, хэлэнд тохирсон 8 хэллэг гаргаж (кэшлэнэ), богино шалгалт, AI-тай дуудлагын дасгалтай. */
(function(){
  var KEY="trip",CK="tripph";
  var DEST={en:["Нью-Йорк","Лондон","Сидней","Сингапур","Сан-Франциско"],ko:["Сөүл","Пусан","Инчөн","Жэжү"],ja:["Токио","Осака","Киото","Саппоро"],
    zh:["Бээжин","Шанхай","Хөх хот","Гуанжоу"],ru:["Москва","Санкт-Петербург","Эрхүү","Улаан-Үд"],de:["Берлин","Мюнхен","Франкфурт","Вена"]};
  var DAYS=[["✈️","Нисэх буудал","check-in, baggage, security, boarding gate, passport control, customs"],
    ["🏨","Зочид буудал","hotel check-in, reservation, room problems, wifi, breakfast time, check-out"],
    ["🚕","Тээвэр","taxi, metro/subway ticket, bus stop, asking the fare, giving an address"],
    ["🍜","Ресторан","table for two, ordering, allergies, asking for the bill, paying by card"],
    ["🛍","Дэлгүүр","prices, sizes, trying on, discounts, tax-free, returning an item"],
    ["🗺","Зам асуух, яаралтай үед","asking directions, getting lost, pharmacy, police, hospital, lost phone"],
    ["🎯","Давтлага","the most useful phrases from all previous topics for a whole trip"]];
  var env=null,h=null,S={dest:"",date:"",busy:false,err:"",day:null,quiz:null};
  function trip(){var t=env.sget(KEY,null);return t&&t.lang===env.lang()?t:null;}
  function save(t){env.sset(KEY,t);}
  function cache(){var c=env.sget(CK,{});return c&&typeof c==="object"?c:{};}
  function daysLeft(t){if(!t.date)return null;var d=new Date(t.date+"T00:00:00"),n=new Date();n.setHours(0,0,0,0);return Math.round((d-n)/86400000);}
  function parse(t){var m=String(t||"").match(/\[[\s\S]*\]/);if(!m)return null;try{var a=JSON.parse(m[0]);return Array.isArray(a)?a.filter(function(x){return Array.isArray(x)&&x[0]&&x[2];}).slice(0,10):null;}catch(e){return null;}}
  function load(t,i){
    var key=env.lang()+"|"+t.dest+"|"+i,c=cache();
    if(c[key])return Promise.resolve(c[key]);
    var LN=env.langEn(),cjk=["ja","ko","zh"].indexOf(env.lang())>=0;
    var q="A Mongolian traveller is going to "+t.dest+" and needs "+LN+". Topic: "+DAYS[i][2]+".\n"+
      "Give the 8 most useful, natural "+LN+" phrases a tourist really says or hears for this topic in "+t.dest+" (local details like currency or transport names are welcome). Level: simple.\n"+
      "Reply with ONLY a JSON array of 8 items: [\"<"+LN+" phrase>\",\"<"+(cjk?"romanization":"empty string")+">\",\"<Mongolian translation in Cyrillic>\"]";
    return Promise.resolve(env.ai([{role:"user",content:q}])).then(function(r){
      var a=parse(r);if(!a||a.length<4)throw new Error("ai");
      var c2=cache();c2[key]=a;var ks=Object.keys(c2);if(ks.length>40)delete c2[ks[0]];env.sset(CK,c2);
      return a;
    });
  }
  function openDay(t,i){
    S.day=i;S.ph=null;S.err="";S.quiz=null;env.render();window.scrollTo(0,0);
    load(t,i).then(function(a){if(S.day===i){S.ph=a;env.render();}},function(){if(S.day===i){S.err="AI одоогоор хэллэг гаргаж чадсангүй. Интернэтээ шалгаад дахин оролдоорой.";env.render();}});
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
  function mkQuiz(){var qs=shuffle(S.ph).slice(0,4);S.quiz={qs:qs,i:0,ok:0,pick:null};}
  function viewDay(root,t){
    var i=S.day,d=DAYS[i];
    root.append(h("button",{class:"back",onclick:function(){S.day=null;env.render();}},"‹ Аяллын хөтөлбөр"));
    root.append(h("h2",null,d[0]+" "+(i+1)+"-р өдөр: "+d[1]));
    if(S.err){root.append(h("div",{class:"fb bad"},S.err),h("button",{class:"btn",onclick:function(){openDay(t,i);}},"🔄 Дахин оролдох"));return;}
    if(!S.ph){root.append(h("p",{class:"muted"},"🤖 "+t.dest+"-д хэрэгтэй хэллэгүүдийг бэлдэж байна…"));return;}
    if(S.quiz){
      var Q=S.quiz;
      if(Q.i>=Q.qs.length){
        var done=t.done||{};
        if(!done[i]){done[i]=1;t.done=done;save(t);env.addXP(5+Q.ok*2);env.celebrate();}
        root.append(h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},"🎉"),h("b",null,Q.ok+" / "+Q.qs.length+" зөв"),h("div",{class:"muted"},(i+1)+"-р өдөр дууслаа")));
        root.append(h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.quiz=null;env.render();}},"Хэллэгүүд"),
          i<DAYS.length-1?h("button",{class:"btn primary",onclick:function(){openDay(t,i+1);}},"Дараагийн өдөр ›"):h("button",{class:"btn primary",onclick:function(){S.day=null;env.render();}},"🏁 Дуусгах")));
        return;
      }
      var q=Q.qs[Q.i],opts=Q.opts||(Q.opts=shuffle([q[2]].concat(shuffle(S.ph.filter(function(x){return x!==q;})).slice(0,3).map(function(x){return x[2];}))));
      root.append(h("p",{class:"muted"},"Энэ хэллэг юу гэсэн утгатай вэ? ("+(Q.i+1)+"/"+Q.qs.length+")"));
      root.append(h("div",{style:"display:flex;align-items:center;gap:8px;margin:8px 0"},h("b",{style:"flex:1;font-size:19px"},q[0]),env.speakBtn(q[0])));
      opts.forEach(function(o){root.append(h("button",{class:"opt"+(Q.pick!=null?(o===q[2]?" ok":o===Q.pick?" bad":""):""),disabled:Q.pick!=null,onclick:function(){Q.pick=o;if(o===q[2])Q.ok++;env.render();}},o));});
      if(Q.pick!=null){
        root.append(h("div",{class:"fb "+(Q.pick===q[2]?"ok":"bad")},Q.pick===q[2]?"Зөв!":"Зөв нь: "+q[2]));
        root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){Q.i++;Q.pick=null;Q.opts=null;env.render();}},"Дараагийн ›")));
      }
      return;
    }
    root.append(h("p",{class:"muted"},t.dest+"-д хамгийн хэрэгтэй 8 хэллэг. 🔊 дарж сонсоод, чангаар давтаарай."));
    S.ph.forEach(function(p){
      root.append(h("div",{class:"note",style:"margin:8px 0;display:flex;gap:8px;align-items:center"},
        h("div",{style:"flex:1"},h("b",null,p[0]),p[1]?h("div",{class:"muted small"},p[1]):null,h("div",{class:"small"},p[2])),env.speakBtn(p[0])));
    });
    root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){mkQuiz();env.render();window.scrollTo(0,0);}},"📝 Шалгах"),
      env.call?h("button",{class:"btn",onclick:function(){env.call();}},"📞 AI-тай дасгал"):null));
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),t=trip();
    if(t&&S.day!=null){viewDay(root,t);return root;}
    root.append(h("button",{class:"back",onclick:function(){e.close();}},"‹ Ярианы дасгал"));
    root.append(h("h2",null,"🧳 Аяллын бэлтгэл"));
    if(!t||S.edit){
      root.append(h("p",{class:"muted"},"Хаашаа, хэзээ явах вэ? 7 өдрийн бэлтгэлийн хөтөлбөр гаргаж өгье."));
      root.append(h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin:8px 0"},(DEST[e.lang()]||DEST.en).map(function(c){
        return h("button",{class:"chip","aria-pressed":String(S.dest===c),style:S.dest===c?"background:var(--sky);color:#fff;border-color:var(--sky)":"",onclick:function(){S.dest=c;env.render();}},c);})));
      var di=h("input",{class:"tin",maxlength:"40",placeholder:"Эсвэл хотоо бич","aria-label":"Хот"});di.value=S.dest;di.addEventListener("input",function(){S.dest=di.value;});
      var dt=h("input",{class:"tin",type:"date","aria-label":"Явах өдөр"});dt.value=S.date;dt.addEventListener("change",function(){S.date=dt.value;});
      root.append(di,h("div",{class:"muted small",style:"margin-top:8px"},"Явах өдөр (заавал биш)"),dt);
      root.append(h("div",{class:"row"},S.edit?h("button",{class:"btn",onclick:function(){S.edit=false;env.render();}},"Болих"):null,
        h("button",{class:"btn primary",onclick:function(){
          var d=String(S.dest||"").trim().slice(0,40);if(!d){env.toast("Хотоо сонгоно уу");return;}
          save({lang:e.lang(),dest:d,date:S.date||"",done:{},ts:Date.now()});S.edit=false;env.render();
        }},"🧳 Хөтөлбөр гаргах")));
      return root;
    }
    var left=daysLeft(t),done=t.done||{},nDone=Object.keys(done).length,next=DAYS.findIndex(function(x,i){return !done[i];});
    root.append(h("div",{class:"note",style:"display:flex;gap:12px;align-items:center"},h("span",{style:"font-size:36px","aria-hidden":"true"},"🧳"),
      h("div",{style:"flex:1"},h("b",{style:"font-size:18px"},t.dest),
        h("div",{class:"muted small"},left==null?"Огноо тавиагүй":left>0?"Явахад "+left+" хоног үлдлээ":left===0?"Өнөөдөр явна! Сайхан аялаарай ✈️":"Аялал эхэлсэн"),
        h("div",{class:"muted small"},nDone+" / 7 өдөр бэлдсэн")),
      h("button",{class:"btn ghost",style:"flex:none;padding:6px 10px",onclick:function(){S.edit=true;S.dest=t.dest;S.date=t.date;env.render();}},"✏️")));
    if(left!=null&&left>0&&left<7-nDone)root.append(h("p",{class:"small",style:"font-weight:600"},"⏰ Хугацаа бага байна: өдөрт 2 сэдэв хийвэл амжина."));
    DAYS.forEach(function(d,i){
      var ok=!!done[i],cur=i===next;
      root.append(h("button",{class:"lrow",type:"button",style:"margin-top:8px"+(cur?";border-color:var(--sky)":""),onclick:function(){openDay(t,i);}},
        h("span",{class:"hexb ico"},ok?"✅":d[0]),
        h("span",{style:"flex:1;text-align:left"},h("div",{class:"t"},(i+1)+"-р өдөр: "+d[1]),h("div",{class:"muted small"},ok?"Дууссан":cur?"Өнөөдрийн сэдэв":"8 хэллэг + шалгалт")),
        h("span",{"aria-hidden":"true"},"›")));
    });
    return root;
  }
  window.Travel={view:view,active:function(e){env=e;var t=trip();return t?{dest:t.dest,left:daysLeft(t)}:null;}};
})();
