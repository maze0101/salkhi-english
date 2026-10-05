/* Салхи: эцэг эхийн шууд самбар.
   Хүүхэд «👪 Эцэг эхэд харуулах» дээр дарж 8 оронтой код авна; апп нь товч мэдээг (progSummary) family/{code}-д
   2 минут тутамд хүртэл шинэчилнэ. Эцэг эх кодоо оруулаад (эсвэл #parent=КОД холбоосоор) явцыг шууд харж, урам хэлнэ.
   Firebase: family/{code} = {owner, name, s:{...}, ts, cheer:{t,ts}}. Кодыг мэдэх хүн л уншина (жагсаалт хаалттай).
   Family.detail(h,s) нь багшийн сурагч бүрийн дэлгэрэнгүйд (classes.js) мөн ашиглагдана. */
(function(){
  var KEY="salkhi:fam",KIDS="salkhi:famkids",SEEN="salkhi:famseen";
  var env=null,h=null,db=null,uid=null,timer=null,lastPush=0,err="",busy=false;
  var P={kids:{},refs:[],add:"",cheerFor:null};
  var LANGS={en:"Англи",ja:"Япон",ko:"Солонгос",zh:"Хятад",ru:"Орос",de:"Герман"};
  var ACT=[["w","🔁","Үг давтсан"],["wn","🆕","Шинээр цээжилсэн үг"],["l","📘","Хичээл"],["s","🎧","Сонсох"],["r","📖","Түүх"],["g","🎮","Тоглоом"],["e","📝","Шалгалт"],["p","🗣️","Дуудлага"],["t","👩‍🏫","Гэрийнхэндээ үг заасан"]];
  var CHEERS=["Шаргуу байна! Би чамаар бахархаж байна ❤️","Өнөөдөр 10 минут хичээллээрэй 🙂","Гайхалтай! Ингээд л үргэлжлүүл 👏","Оройн хоолны дараа хамт давтъя 📚"];

  function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
  function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function TS(){return firebase.database.ServerValue.TIMESTAMP;}
  function paint(){if(env)env.render();}
  function randCode(){var a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",s="";for(var i=0;i<8;i++)s+=a.charAt(Math.floor(Math.random()*a.length));return s;}
  function connect(){
    if(db&&uid)return Promise.resolve();
    if(!window.SalkhiFB||!window.SALKHI_FB)return Promise.reject(new Error("Firebase тохиргоо алга"));
    return window.SalkhiFB.user().then(function(u){db=firebase.database();uid=u.uid;});
  }
  function fail(e){busy=false;err=String(e&&e.message||e);if(/permission/i.test(err))err="Зөвшөөрөлгүй байна. Кодоо шалгаад дахин оролдоно уу.";paint();}
  function ago(ms){
    if(!ms)return "—";var m=Math.round((Date.now()-ms)/60000);
    if(m<2)return "дөнгөж сая";if(m<60)return m+" минутын өмнө";
    var hr=Math.round(m/60);if(hr<24)return hr+" цагийн өмнө";
    return Math.round(hr/24)+" өдрийн өмнө";
  }
  function parseJ(s,d){try{var v=JSON.parse(s);return v==null?d:v;}catch(e){return d;}}
  function shareLink(code){return location.href.split("#")[0]+"#parent="+code;}

  /* ---------- хүүхдийн тал: товч мэдээг илгээх ---------- */
  function mine(){return ls(KEY,null);}
  function push(force){
    var m=mine();if(!m||!env)return Promise.resolve();
    if(!force&&Date.now()-lastPush<120000){clearTimeout(timer);timer=setTimeout(function(){push(true);},120000);return Promise.resolve();}
    lastPush=Date.now();
    return connect().then(function(){
      return db.ref("family/"+m.code).update({owner:uid,name:String(m.name||env.name()||"Хүүхэд").slice(0,30),s:env.summary(),ts:TS()});
    }).catch(function(){});
  }
  function create(name,tries){
    var code=randCode();
    return connect().then(function(){
      return db.ref("family/"+code).set({owner:uid,name:name,s:env.summary(),ts:TS()});
    }).then(function(){lset(KEY,{code:code,name:name});lastPush=Date.now();return code;},function(e){
      if((tries||0)<3&&/permission/i.test(String(e&&e.message)))return create(name,(tries||0)+1);
      throw e;
    });
  }
  function stop(){
    var m=mine();if(!m)return Promise.resolve();
    return connect().then(function(){return db.ref("family/"+m.code).remove();}).catch(function(){}).then(function(){lset(KEY,null);});
  }
  function share(code){
    var link=shareLink(code),t="Салхи аппад миний хэл сурч буй явцыг шууд хараарай 👪\nКод: "+code+"\n"+link;
    if(navigator.share)navigator.share({title:"Салхи — эцэг эхийн самбар",text:t}).catch(function(){});
    else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){env.toast("Холбоос хуулагдлаа");},function(){env.toast(t,8000);});
    else env.toast(t,8000);
  }
  var cheerChecked=false,cheerMsg=null;
  function checkCheer(){
    var m=mine();if(cheerChecked||!m)return;cheerChecked=true;
    connect().then(function(){return db.ref("family/"+m.code+"/cheer").once("value");}).then(function(s){
      var c=s.val();if(c&&c.t&&c.ts>ls(SEEN,0)){cheerMsg=c;paint();}
    }).catch(function(){});
  }

  /* хүүхдийн Профайл дээрх карт */
  function card(e,open){
    env=e;h=e.h;
    var m=mine(),box=h("div",{class:"note",style:"margin-top:12px"});
    if(cheerMsg)box.append(h("div",{style:"display:flex;gap:10px;align-items:center;margin-bottom:8px"},
      h("span",{style:"font-size:28px","aria-hidden":"true"},"💌"),
      h("div",{style:"flex:1"},h("div",{class:"muted small"},"Ээж аавын захиа"),h("b",null,cheerMsg.t)),
      h("button",{class:"btn ghost",style:"flex:none;padding:6px 10px","aria-label":"Хаах",onclick:function(){lset(SEEN,cheerMsg.ts);cheerMsg=null;paint();}},"✕")));
    if(!m){
      box.append(h("div",{style:"font-weight:700"},"👪 Эцэг эхэд явцаа харуулах"),
        h("p",{class:"muted small",style:"margin:4px 0 0"},"Ээж аав чинь өөрсдийн утаснаас чиний өдөр бүрийн явц, алдаа, хичээллэсэн цагийг шууд харж, урам хэлж чадна."),
        h("div",{class:"row"},
          h("button",{class:"btn",type:"button",onclick:open},"👀 Хүүхдийнхээ явцыг харах"),
          h("button",{class:"btn primary",type:"button",disabled:busy,onclick:function(){
            busy=true;err="";paint();
            create(String(e.name()||"Хүүхэд").slice(0,30)).then(function(code){busy=false;paint();share(code);},fail);
          }},"🔗 Код авах")));
    }else{
      checkCheer();
      box.append(h("div",{style:"font-weight:700"},"👪 Эцэг эхийн самбар асаалттай"),
        h("div",{style:"font-size:26px;font-weight:800;letter-spacing:4px;margin:4px 0"},m.code),
        h("p",{class:"muted small",style:"margin:0"},"Энэ кодоор ээж аав чинь явцыг чинь шууд харна."),
        h("div",{class:"row",style:"flex-wrap:wrap"},
          h("button",{class:"btn primary",type:"button",onclick:function(){share(m.code);}},"📤 Илгээх"),
          h("button",{class:"btn",type:"button",onclick:open},"👀 Самбар"),
          h("button",{class:"btn ghost",type:"button",onclick:function(){
            if(!P.rm){P.rm=true;env.toast("Дахин дарвал самбар унтарч, код хүчингүй болно");return;}
            P.rm=false;stop().then(paint);
          }},"Унтраах")));
    }
    if(err)box.append(h("div",{class:"fb bad"},err));
    return box;
  }

  /* ---------- нэг хүүхдийн дэлгэрэнгүй (эцэг эх, багш хоёуланд) ---------- */
  function bars(vals){
    var max=Math.max.apply(null,vals.concat([1])),names=["Ня","Да","Мя","Лх","Пү","Ба","Бя"],w=h("div",{style:"display:flex;align-items:flex-end;gap:3px;height:70px;margin:6px 0 2px"});
    vals.forEach(function(v,i){
      var d=new Date();d.setDate(d.getDate()-(vals.length-1-i));
      w.append(h("div",{style:"flex:1;display:flex;flex-direction:column;align-items:center;gap:2px",title:v+" XP"},
        h("i",{style:"display:block;width:100%;border-radius:4px 4px 0 0;height:"+(v?Math.max(6,Math.round(v/max*56)):3)+"px;background:"+(v?"var(--sky)":"var(--line)")}),
        h("span",{style:"font-size:10px;color:var(--ink-2)"},names[d.getDay()])));
    });
    return w;
  }
  function stat(label,val){return h("div",{style:"flex:1;min-width:88px;padding:8px 10px;border:1px solid var(--line);border-radius:12px"},h("div",{style:"font-size:20px;font-weight:800"},val),h("div",{class:"muted small"},label));}
  function detail(hh,s,extra){
    h=h||hh;s=s||{};
    var root=hh("div"),d14=String(s.d14||"").split(",").map(Number).filter(function(x){return !isNaN(x);});
    var act=d14.slice(-7).filter(Boolean).length,goalPct=s.goal?Math.min(100,Math.round((s.today||0)/s.goal*100)):0;
    root.append(hh("div",{style:"display:flex;flex-wrap:wrap;gap:8px;margin:8px 0"},
      stat("Өнөөдөр",(s.today||0)+" XP"),stat("Дараалсан өдөр","🔥 "+(s.streak||0)),stat("7 хоногт",(s.wxp||0)+" XP"),stat("Идэвхтэй өдөр",act+" / 7")));
    if(s.goal)root.append(hh("div",{class:"muted small"},"Өдрийн зорилго: "+(s.today||0)+" / "+s.goal+" XP"+(goalPct>=100?" ✅":"")),
      hh("div",{style:"height:8px;border-radius:8px;background:var(--line);overflow:hidden;margin:4px 0 10px"},hh("i",{style:"display:block;height:100%;width:"+goalPct+"%;background:"+(goalPct>=100?"var(--ok)":"var(--sky)")})));
    if(d14.length){root.append(hh("div",{class:"muted small",style:"margin-top:6px"},"Сүүлийн 14 хоногийн XP"));root.append(bars(d14));}
    var a7=s.a7||{},rows=ACT.filter(function(a){return a7[a[0]];});
    root.append(hh("div",{class:"muted small",style:"margin-top:12px"},"Энэ 7 хоногт хийсэн"));
    if(!rows.length)root.append(hh("p",{class:"small",style:"margin:4px 0"},"Энэ 7 хоногт хичээллээгүй байна."));
    rows.forEach(function(a){root.append(hh("div",{class:"srow"},hh("span",null,a[1]+" "+a[2]),hh("b",null,String(a7[a[0]]))));});
    root.append(hh("div",{class:"srow"},hh("span",null,"📚 Нийт цээжилсэн үг"),hh("b",null,String(s.known||0))));
    root.append(hh("div",{class:"srow"},hh("span",null,"✅ Дүрмийн хичээл"),hh("b",null,String(s.lessons||0))));
    if(s.speech>=0)root.append(hh("div",{class:"srow"},hh("span",null,"🗣️ Дуудлагын дундаж"),hh("b",null,s.speech+"%")));
    var err=parseJ(s.err,[]),weak=parseJ(s.weak,[]);
    if(err.length){
      root.append(hh("div",{class:"muted small",style:"margin-top:12px"},"Ихэвчлэн гаргадаг алдаа"));
      err.forEach(function(e){root.append(hh("div",{class:"srow"},hh("span",null,"⚠️ "+e[0]),hh("b",null,e[1]+" удаа")));});
    }
    if(weak.length){
      root.append(hh("div",{class:"muted small",style:"margin-top:12px"},"Давтах хэрэгтэй үгс"));
      root.append(hh("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"},weak.map(function(w){return hh("span",{class:"chip",style:"cursor:default"},w);})));
    }
    root.append(hh("p",{class:"small",style:"margin:12px 0 0;font-weight:600"},act>=5?"Маш хичээнгүй байна! Магтаж урамшуулаарай 👏":act>=2?"Сайн байна. Өдөр бүр 10 минут хичээллэхэд туслаарай 🙂":"Энэ 7 хоногт бага хичээллэсэн. Хамтдаа нэг хичээл хийгээд үзээрэй 💪"));
    if(extra)root.append(extra);
    return root;
  }

  /* ---------- эцэг эхийн тал ---------- */
  function kids(){return ls(KIDS,[]);}
  function detachAll(){P.refs.forEach(function(r){try{r.off();}catch(e){}});P.refs=[];P.attached=false;}
  function attach(){
    if(P.attached)return;P.attached=true;
    connect().then(function(){
      kids().forEach(function(code){
        var r=db.ref("family/"+code);P.refs.push(r);
        r.on("value",function(s){P.kids[code]=s.val()||{gone:true};paint();},function(){P.kids[code]={gone:true};paint();});
      });
    }).catch(fail);
  }
  function addKid(code){
    code=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(code.length!==8){env.toast("Код 8 тэмдэгттэй байна");return;}
    var l=kids();if(l.indexOf(code)<0){l.push(code);lset(KIDS,l.slice(-6));}
    P.add="";detachAll();paint();
  }
  function sendCheer(code,t){
    t=String(t||"").trim().slice(0,80);if(!t)return;
    connect().then(function(){return db.ref("family/"+code+"/cheer").set({t:t,ts:TS()});})
      .then(function(){P.cheerFor=null;env.toast("💌 Илгээгдлээ");paint();},fail);
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    root.append(h("button",{class:"back",onclick:function(){detachAll();e.close();}},"‹ Профайл"));
    root.append(h("h2",null,"👪 Эцэг эхийн самбар"));
    root.append(h("p",{class:"muted"},"Хүүхдийнхээ Салхи аппаас авсан 8 оронтой кодыг оруулаарай. Явц нь хүүхэд хичээллэх үед шууд шинэчлэгдэнэ."));
    if(err)root.append(h("div",{class:"fb bad"},err));
    var inp=h("input",{class:"tin",placeholder:"Жишээ: AB12CD34",maxlength:"8",autocapitalize:"characters",autocomplete:"off",spellcheck:"false","aria-label":"Хүүхдийн код",style:"text-transform:uppercase;letter-spacing:3px;font-size:18px"});
    inp.value=P.add;inp.addEventListener("input",function(){P.add=inp.value;});
    inp.addEventListener("keydown",function(ev){if(ev.key==="Enter"){ev.preventDefault();addKid(inp.value);}});
    root.append(h("div",{style:"display:flex;gap:8px;margin:8px 0 14px"},h("div",{style:"flex:1"},inp),h("button",{class:"btn primary",style:"flex:none",onclick:function(){addKid(inp.value);}},"Нэмэх")));
    var l=kids();
    if(!l.length)root.append(h("p",{class:"muted small"},"Одоогоор хүүхэд нэмээгүй байна. Хүүхэд маань Профайл → 👪 Эцэг эхэд харуулах → 🔗 Код авах дээр дарна."));
    else attach();
    l.forEach(function(code){
      var k=P.kids[code],box=h("div",{class:"note",style:"margin:10px 0"});
      if(!k){box.append(h("p",{class:"muted"},"Ачаалж байна… ("+code+")"));root.append(box);return;}
      var head=h("div",{style:"display:flex;align-items:center;gap:10px"},
        h("span",{style:"font-size:30px","aria-hidden":"true"},"🧒"),
        h("div",{style:"flex:1;min-width:0"},h("b",{style:"font-size:17px"},k.gone?code:k.name||"Хүүхэд"),
          h("div",{class:"muted small"},k.gone?"Код олдсонгүй эсвэл хүүхэд самбараа унтраасан":(LANGS[(k.s||{}).lang]||"")+" хэл · Сүүлд: "+ago(k.ts))),
        h("button",{class:"btn ghost",style:"flex:none;padding:6px 10px","aria-label":"Жагсаалтаас хасах",onclick:function(){
          if(P.rmKid!==code){P.rmKid=code;env.toast("Дахин дарвал жагсаалтаас хасна");return;}
          P.rmKid=null;lset(KIDS,kids().filter(function(c){return c!==code;}));delete P.kids[code];detachAll();paint();
        }},"✕"));
      box.append(head);
      if(!k.gone){
        var cheer=null;
        if(P.cheerFor===code){
          var ti=h("input",{class:"tin",maxlength:"80",placeholder:"Өөрийн үгээр бичих…","aria-label":"Урмын үг"});
          cheer=h("div",{style:"margin-top:12px"},h("div",{class:"muted small"},"💌 Урам хэлэх (хүүхэд аппаа нээхэд харагдана)"),
            h("div",{style:"display:flex;flex-direction:column;gap:6px;margin:6px 0"},CHEERS.map(function(c){return h("button",{class:"chip",style:"text-align:left",onclick:function(){sendCheer(code,c);}},c);})),
            ti,h("div",{class:"row"},h("button",{class:"btn",onclick:function(){P.cheerFor=null;paint();}},"Болих"),h("button",{class:"btn primary",onclick:function(){sendCheer(code,ti.value);}},"Илгээх")));
        }else cheer=h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:function(){P.cheerFor=code;paint();}},"💌 Урам хэлэх");
        box.append(detail(h,k.s,cheer));
        if(k.cheer&&k.cheer.t)box.append(h("p",{class:"muted small",style:"margin:6px 0 0"},"Сүүлд илгээсэн: «"+k.cheer.t+"» · "+ago(k.cheer.ts)));
      }
      root.append(box);
    });
    return root;
  }
  /* #parent=КОД холбоосоор орж ирвэл кодыг нэмээд самбарыг нээнэ */
  function fromHash(){
    var m=/[#&]parent=([A-Za-z0-9]{8})/.exec(location.hash||"");
    if(!m)return false;
    var l=kids(),c=m[1].toUpperCase();if(l.indexOf(c)<0){l.push(c);lset(KIDS,l.slice(-6));}
    try{history.replaceState(null,"",location.href.split("#")[0]);}catch(e){}
    return true;
  }
  window.Family={
    init:function(e){env=e;h=e.h;if(mine())setTimeout(function(){push(true);},8000);},
    touch:function(){if(env&&mine())push(false);},
    card:card,view:view,detail:detail,fromHash:fromHash,
    detach:detachAll
  };
})();
