/* Салхи: 🎯 зорилгын төлөвлөгөө — «6-р сард IELTS 6.5 (B2)» гэх мэт зорилго, эцсийн огноо, өдрийн минутаас
   үлдсэн үг/дүрмийн хичээлийг тоолж өдөр, долоо хоногийн ачааллыг гаргана (AI-гүй, тооцоо).
   Явц: эхлэх үеийн агшин (мэддэг үг, дуусгасан хичээл) ба одоогийнхыг хугацааны өнгөрсөн хэсэгтэй харьцуулна.
   Хадгалалт: sget "plan" = {<хэл>: {lv, due (YYYY-MM-DD), min, at, w0, l0, wNeed0, lNeed0}}. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var KEY="plan",LV=["a1","a2","b1","b2","c1","c2"],DAY=86400000,env=null,h=null,G={form:null};
  function plans(){var p=env.sget(KEY,{});return p&&typeof p==="object"?p:{};}
  function plan(){return plans()[env.lang()]||null;}
  function save(p){var a=plans();if(p)a[env.lang()]=p;else delete a[env.lang()];env.sset(KEY,a);}
  function dstr(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function parseD(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?new Date(+m[1],+m[2]-1,+m[3]):null;}
  function today(){var d=new Date();d.setHours(0,0,0,0);return d;}
  /* зорилтот түвшин хүртэлх (тэр түвшнийг оруулаад) үг ба хичээл */
  function scope(lv){
    var top=LV.indexOf(lv),ws=env.all().filter(function(w){var i=LV.indexOf(w[0]);return i>=0&&i<=top&&w[5]!=="mine";}),
        ls=env.lessons().filter(function(l){var i=LV.indexOf(l.lv);return i>=0&&i<=top;});
    var wk=ws.filter(env.known).length,ld=ls.filter(env.lessonDone).length;
    return {wTotal:ws.length,wKnown:wk,wNeed:ws.length-wk,lTotal:ls.length,lDone:ld,lNeed:ls.length-ld};
  }
  /* өдрийн ачаалал: шинэ үг ~1 мин, хичээл ~10 мин, давтлага 5 мин */
  function load(p,sc){
    var days=Math.max(1,Math.round((parseD(p.due)-today())/DAY));
    var wpd=Math.ceil(sc.wNeed/days),lpw=Math.ceil(sc.lNeed/(days/7)),need=Math.round(wpd*1+lpw*10/7+5);
    return {days:days,wpd:wpd,lpw:lpw,need:need,ok:need<=p.min*1.1};
  }
  function xpFor(min){return min<=10?10:min<=20?20:min<=45?50:100;}
  function form(root,p){
    var f=G.form||(G.form={lv:p?p.lv:"b1",due:p?p.due:dstr(new Date(Date.now()+120*DAY)),min:p?p.min:20});
    var ex=env.exams()||{};
    put(root,h("p",{class:"muted"},"Зорилгоо оруулбал хэдэн үг, хичээл үлдсэнийг тоолж, өдөр бүр юу хийхийг гаргана."));
    put(root,h("div",{style:"font-weight:700;margin-top:10px"},"1. Ямар түвшин хүрэх вэ?"));
    var g=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin-top:6px"});
    LV.forEach(function(lv){put(g,h("button",{class:"btn"+(f.lv===lv?" primary":""),"aria-pressed":String(f.lv===lv),style:"margin:0;padding:8px 6px;font-size:14px",onclick:function(){f.lv=lv;env.render();}},
      lv.toUpperCase()+(ex[lv]?" · "+ex[lv]:"")));});
    put(root,g);
    put(root,h("div",{style:"font-weight:700;margin-top:14px"},"2. Хэзээ гэхэд?"));
    var di=h("input",{type:"date",class:"tin",value:f.due,min:dstr(new Date(Date.now()+7*DAY)),"aria-label":"Эцсийн огноо",style:"margin-top:6px;max-width:220px"});
    di.addEventListener("change",function(){if(parseD(di.value))f.due=di.value;env.render();});
    put(root,di);
    put(root,h("div",{style:"font-weight:700;margin-top:14px"},"3. Өдөрт хэдэн минут?"));
    put(root,h("div",{class:"seg",style:"margin-top:6px"},[10,20,30,45,60].map(function(m){return h("button",{"aria-pressed":String(f.min===m),onclick:function(){f.min=m;env.render();}},m+" мин");})));
    var sc=scope(f.lv),ld=parseD(f.due)&&parseD(f.due)>today()?load(f,sc):null;
    if(ld)put(root,h("div",{class:"note",style:"margin-top:14px"},
      h("div",null,"📚 Үлдсэн: ",h("b",null,sc.wNeed+" үг")," · ",h("b",null,sc.lNeed+" дүрмийн хичээл")," · "+ld.days+" өдөр"),
      h("div",{style:"margin-top:4px"},"📅 Өдөрт ",h("b",null,ld.wpd+" шинэ үг"),", 7 хоногт ",h("b",null,ld.lpw+" хичээл")," ≈ "+ld.need+" мин/өдөр"),
      h("div",{class:"fb "+(ld.ok?"ok":"bad"),style:"margin-top:6px"},ld.ok?"✅ Бодитой төлөвлөгөө!":"⚠️ Өдөрт "+f.min+" минут хангалтгүй. Хугацааг сунгах эсвэл өдөрт "+ld.need+"+ минут хичээллээрэй.")));
    put(root,h("div",{class:"row",style:"margin-top:10px"},
      p?h("button",{class:"btn",onclick:function(){G.form=null;G.editing=false;env.render();}},"Болих"):null,
      h("button",{class:"btn primary",disabled:!ld,onclick:function(){
        save({lv:f.lv,due:f.due,min:f.min,at:dstr(today()),w0:sc.wKnown,l0:sc.lDone,wNeed0:sc.wNeed,lNeed0:sc.lNeed});
        G.form=null;G.editing=false;env.toast("🎯 Төлөвлөгөө хадгалагдлаа!",2000);env.render();window.scrollTo(0,0);}},"🎯 Төлөвлөгөө гаргах")));
  }
  /* явц: хийх ёстой хэсэг (хугацаагаар) ба хийсэн хэсэг (үг+хичээлийн жигнэсэн) */
  function progress(p,sc){
    var t0=parseD(p.at),t1=parseD(p.due),span=Math.max(1,(t1-t0)/DAY),gone=Math.min(span,Math.max(0,(today()-t0)/DAY));
    var expect=gone/span,tot=(p.wNeed0||0)+(p.lNeed0||0)*10,did=Math.max(0,sc.wKnown-p.w0)+Math.max(0,sc.lDone-p.l0)*10;
    var actual=tot?Math.min(1,did/tot):1;
    return {expect:expect,actual:actual,diffW:Math.round((actual-expect)*tot)};
  }
  function week(ld){
    var names=["Даваа","Мягмар","Лхагва","Пүрэв","Баасан","Бямба","Ням"],out=[],L=ld.lpw;
    /* хичээлийг 7 хоногт тэнцүү тараана */
    for(var i=0;i<7;i++){
      var nl=Math.floor((i+1)*L/7)-Math.floor(i*L/7),t=[];
      t.push("🆕 "+ld.wpd+" шинэ үг");
      if(nl)t.push("📘 "+nl+" дүрмийн хичээл");
      t.push("🔁 давталт");
      if(i===5)t.push("🎧 түүх / сонсох");
      if(i===6)t.push("🧪 долоо хоногийн тест");
      out.push([names[i],t.join(" · ")]);
    }
    return out;
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),p=plan();
    put(root,h("button",{class:"back",onclick:function(){G.form=null;G.editing=false;e.close();}},"‹ Профайл"));
    put(root,h("h2",null,"🎯 Зорилгын төлөвлөгөө · "+env.langName()));
    if(!p||G.editing){form(root,p);return root;}
    var sc=scope(p.lv),due=parseD(p.due),ex=(env.exams()||{})[p.lv];
    if(due<today()){
      put(root,h("div",{class:"note"},h("div",{style:"font-weight:700"},"⏰ "+p.due+" — зорилгын хугацаа дууслаа"),
        h("div",{style:"margin-top:4px"},p.lv.toUpperCase()+" хүртэл: "+sc.wKnown+"/"+sc.wTotal+" үг, "+sc.lDone+"/"+sc.lTotal+" хичээл"),
        h("div",{class:"row",style:"margin-top:8px"},h("button",{class:"btn primary",onclick:function(){G.editing=true;G.form=null;env.render();}},"Шинэ зорилго тавих"))));
      return root;
    }
    var ld=load(p,sc),pr=progress(p,sc);
    put(root,h("div",{class:"note"},
      h("div",{class:"muted small"},"Зорилго"),
      h("div",{style:"font-weight:800;font-size:20px"},p.lv.toUpperCase()+(ex?" · "+ex:"")),
      h("div",{class:"muted"},"📅 "+p.due+" хүртэл "+ld.days+" өдөр · өдөрт "+p.min+" мин")));
    var bar=function(label,a,b){var pc=b?Math.round(a/b*100):100;return h("div",{style:"margin-top:10px"},
      h("div",{style:"display:flex;justify-content:space-between"},h("span",null,label),h("b",null,a+" / "+b)),
      h("div",{style:"height:8px;border-radius:8px;background:var(--line);overflow:hidden;margin-top:4px",role:"progressbar","aria-valuenow":String(pc),"aria-valuemin":"0","aria-valuemax":"100","aria-label":label},
        h("i",{style:"display:block;height:100%;width:"+pc+"%;background:var(--sky)"})));};
    put(root,bar("📚 Мэддэг үг",sc.wKnown,sc.wTotal),bar("📘 Дүрмийн хичээл",sc.lDone,sc.lTotal));
    var ahead=pr.diffW>=0;
    put(root,h("div",{class:"fb "+(ahead?"ok":"bad"),style:"margin-top:12px"},
      Math.abs(pr.diffW)<3?"👍 Төлөвлөгөөний дагуу явж байна.":ahead?"🚀 Төлөвлөгөөнөөс ~"+pr.diffW+" үгээр түрүүлж байна!":"⏳ Төлөвлөгөөнөөс ~"+(-pr.diffW)+" үгээр хоцорч байна. Өнөөдөр бага зэрэг нэмээрэй."));
    put(root,h("h3",{style:"margin:18px 0 6px"},"📅 Өнөөдөр"));
    put(root,h("div",{class:"note"},
      h("div",null,"🆕 ",h("b",null,ld.wpd+" шинэ үг")," сур (Үгс → Карт / Тест)"),
      h("div",{style:"margin-top:4px"},"📘 7 хоногт ",h("b",null,ld.lpw+" дүрмийн хичээл")),
      h("div",{style:"margin-top:4px"},"🔁 Давтах хугацаа болсон үгсээ давт"),
      h("div",{class:"muted small",style:"margin-top:6px"},"Өнөөдрийн XP: "+env.todayXP()+" / "+env.goal())));
    var want=xpFor(p.min);
    if(env.goal()!==want)put(root,h("button",{class:"btn",style:"margin-top:8px",onclick:function(){env.setGoalXP(want);env.toast("Өдрийн зорилго: "+want+" XP",1800);env.render();}},"🎯 Өдрийн XP зорилгыг "+want+" болгох"));
    if(!ld.ok)put(root,h("div",{class:"fb bad",style:"margin-top:8px"},"⚠️ Одоогийн хурдаар өдөрт ~"+ld.need+" минут хэрэгтэй (та "+p.min+" мин гэж тавьсан)."));
    put(root,h("h3",{style:"margin:18px 0 6px"},"🗓️ Долоо хоногийн хуваарь"));
    week(ld).forEach(function(r,i){var td=((new Date().getDay()+6)%7)===i;
      put(root,h("div",{class:"srow",style:td?"font-weight:700":""},h("span",null,(td?"👉 ":"")+r[0]),h("span",{class:"small",style:"text-align:right;max-width:70%"},r[1])));});
    put(root,h("div",{class:"row",style:"margin-top:14px"},
      h("button",{class:"btn",onclick:function(){G.editing=true;G.form=null;env.render();}},"✏️ Зорилго өөрчлөх"),
      h("button",{class:"btn ghost",style:"color:var(--danger)",onclick:function(){if(confirm("Энэ хэлний зорилгыг устгах уу?")){save(null);env.render();}}},"🗑 Устгах")));
    put(root,h("p",{class:"muted small",style:"margin-top:12px"},"Тооцоо: шинэ үг ~1 мин, дүрмийн хичээл ~10 мин, давтлага 5 мин. Үг «мэддэг» болох нь 2+ удаа зөв хариулсан үед."));
    return root;
  }
  function card(e,open){
    env=e;h=e.h;var p=plan();
    var sub="Зорилго, хугацаагаа оруулаад өдөр бүрийн хуваариа ав";
    if(p){var due=parseD(p.due);if(due>=today()){var sc=scope(p.lv),ld=load(p,sc),pr=progress(p,sc);sub=p.lv.toUpperCase()+" · "+ld.days+" өдөр үлдсэн · "+(Math.abs(pr.diffW)<3?"хуваарийн дагуу":pr.diffW>0?"түрүүлж байна 🚀":"хоцорч байна ⏳");}else sub="Хугацаа дууслаа — шинэ зорилго тавих";}
    return h("button",{class:"lrow",type:"button",style:"margin-top:12px",onclick:open},
      h("span",{class:"hexb ico"},"🎯"),h("span",{style:"flex:1"},h("div",{class:"t"},"Зорилгын төлөвлөгөө"),h("div",{class:"muted small"},sub)),h("span",{"aria-hidden":"true"},"›"));
  }
  window.Goal={view:view,card:card,
    /* тест: тооцооны функцууд */
    _calc:function(e,lv,due,min){var o=env;env=e;try{var sc=scope(lv);return {scope:sc,load:load({due:due,min:min},sc)};}finally{env=o;}}};
})();
