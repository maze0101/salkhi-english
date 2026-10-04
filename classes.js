/* Салхи: багш, ангийн горим — багш анги үүсгэж 6 оронтой код өгнө, сурагчид кодоор нэгдэнэ.
   Багш даалгавар (XP, хичээл, үг, өдөр дараалан) өгч, сурагч бүрийн явцыг харна.
   Firebase: classes/{code}, members/{code}/{uid}, tasks/{code}/{tid}, cstats/{code}/{uid}, mycls/{uid}/{code},
   live/{code}, livekey/{code}, liveans/{code}/{uid} (шууд тест) */
(function(){
  var KINDS={
    xp:["⚡","XP цуглуулах","XP"],
    lessons:["📘","Дүрмийн хичээл давах","хичээл"],
    words:["📚","Шинэ үг цээжлэх","үг"],
    days:["🔥","Өдөр дараалан хичээллэх","өдөр"],
    list:["📝","Жагсаалтын үгсийг цээжлэх","үг"],
    tlesson:["📘","Багшийн хичээлийг давах","хичээл"]
  };
  var LANGS={en:"Англи",ja:"Япон",ko:"Солонгос",zh:"Хятад",ru:"Орос",de:"Герман"};
  var env=null,h=null,db=null,uid=null,busy=false,err="",timer=null;
  var S={scr:"home",code:null,data:null,form:null};
  var MY_KEY="classes",BASE_KEY="clsbase";

  function now(){return Date.now();}
  function TS(){return firebase.database.ServerValue.TIMESTAMP;}
  function my(){return env.sget(MY_KEY,{})||{};}
  function setMy(m){env.sset(MY_KEY,m);}
  function randCode(){var a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",s="";for(var i=0;i<6;i++)s+=a.charAt(Math.floor(Math.random()*a.length));return s;}
  function connect(){
    if(db&&uid)return Promise.resolve();
    if(!window.SalkhiFB)return Promise.reject(new Error("Firebase тохиргоо алга"));
    return window.SalkhiFB.user().then(function(u){db=firebase.database();uid=u.uid;});
  }
  function fail(e){busy=false;err=String(e&&e.message||e);if(/permission/i.test(err))err="Зөвшөөрөлгүй байна. (Firebase-ийн дүрэм шинэчлэгдээгүй байж магадгүй.)";paint();}
  function paint(){env.render();}
  function fmtDate(ms){if(!ms)return "";var d=new Date(ms);return (d.getMonth()+1)+"/"+d.getDate();}
  function ago(ms){
    if(!ms)return "—";var m=Math.round((now()-ms)/60000);
    return m<60?m+" мин":m<1440?Math.round(m/60)+" цаг":Math.round(m/1440)+" өдөр";
  }

  /* ---------- сурагчийн явц ---------- */
  function metric(k,lang){
    if(k==="days")return env.metric("streak",lang);
    return env.metric(k,lang);
  }
  /* даалгавар бүрийн суурь утгыг анх харсан үед тэмдэглэнэ (xp, lessons, words) */
  function progressFor(code,tid,t,lang){
    if(t.k==="list"){var lp=env.listProgress(code+":"+t.lid);return lp==null?null:Math.min(lp,t.n);}
    if(t.k==="tlesson"){var tp=env.lessonDone(code+":"+t.lid);return tp==null?null:(tp?1:0);}
    var cur=metric(t.k,lang);
    if(cur==null)return null;
    if(t.k==="days")return Math.min(cur,t.n);
    var b=env.sget(BASE_KEY,{})||{},key=code+":"+tid;
    if(b[key]==null){b[key]=cur;env.sset(BASE_KEY,b);}
    return Math.max(0,Math.min(t.n,cur-b[key]));
  }
  function pushStats(code,tasks,lang){
    var p={};
    Object.keys(tasks||{}).forEach(function(tid){var v=progressFor(code,tid,tasks[tid],lang);if(v!=null)p[tid]=v;});
    var me=env.me(lang),nm=String(my()[code]&&my()[code].name||me.name||"Сурагч").slice(0,30);
    db.ref("board/"+code+"/"+uid).set({name:nm,wxp:me.wxp,wk:me.wk}).catch(function(){});
    return db.ref("cstats/"+code+"/"+uid).set({name:nm,xp:me.xp,wxp:me.wxp,streak:me.streak,words:me.words==null?-1:me.words,lessons:me.lessons,p:p,ts:TS()});
  }
  function parseList(v){
    return String(v&&v.w||"").split("\n").map(function(l){var p=l.split("|");return [p[0],p.slice(1).join("|")];}).filter(function(p){return p[0]&&p[1];});
  }
  function lines(t){return String(t||"").split(/\r?\n/).map(function(l){return l.trim();}).filter(Boolean);}
  /* багшийн хичээлийн түүхий текстийг аппын хичээлийн бүтэц рүү хөрвүүлнэ */
  function parseLesson(v){
    var ex=lines(v.ex).map(function(l){var m=l.match(/^(.+?)\s*(?:\t|\||—|–)\s*(.+)$/);return m?[m[1].trim(),m[2].trim()]:[l,""];});
    var q=lines(v.q).map(function(l){var p=l.split("|").map(function(x){return x.trim();}).filter(Boolean);return p.length>=3?[p[0],p.slice(1),0]:null;}).filter(Boolean);
    var o=lines(v.o).map(function(l){return env.orderText(l);}).filter(function(s){return s.split(" ").length>=2;});
    if(!o.length)o=ex.slice(0,2).map(function(e){return env.orderText(e[0]);}).filter(function(s){var n=s.split(" ").length;return n>=3&&n<=10;});
    var f=lines(v.f).map(function(l){var p=l.split("|");return p.length>=2&&p[0].indexOf("___")>=0?[p[0].trim(),p.slice(1).join("|").trim()]:null;}).filter(Boolean);
    var intro=String(v.intro||"").split(/\n\s*\n/).map(function(x){return x.trim();}).filter(Boolean);
    return {t:v.t,intro:intro,rule:v.rule||"",ex:ex,q:q,o:o,f:f};
  }
  function storeLessons(code,ls,lang,cname){
    var o={};Object.keys(ls||{}).forEach(function(lid){
      var v=ls[lid],p=v.ref?{ref:v.ref,t:v.t,lv:v.lv||""}:parseLesson(v);
      p.lang=lang;p.cname=cname;p.ts=v.ts||0;o[lid]=p;
    });
    env.setLessons(code,o);
  }
  function storeLists(code,lists,lang,cname){
    var o={};Object.keys(lists||{}).forEach(function(lid){o[lid]={name:lists[lid].name,lang:lang,cname:cname,words:parseList(lists[lid])};});
    env.setLists(code,o);
  }
  /* бүх ангийнхаа явцыг илгээнэ (апп нээгдэх, XP нэмэгдэхэд) */
  function syncAll(){
    var m=my(),codes=Object.keys(m).filter(function(c){return m[c].role==="s";});
    if(!codes.length)return Promise.resolve();
    return connect().then(function(){
      return Promise.all(codes.map(function(code){
        return Promise.all([db.ref("tasks/"+code).once("value"),db.ref("classes/"+code).once("value"),db.ref("wlists/"+code).once("value"),db.ref("tlessons/"+code).once("value")]).then(function(r){
          var cv=r[1].val()||{};storeLists(code,r[2].val(),cv.lang||"en",cv.name||"");storeLessons(code,r[3].val(),cv.lang||"en",cv.name||"");
          return pushStats(code,r[0].val()||{},cv.lang||"en");
        }).catch(function(){});
      }));
    }).catch(function(){});
  }
  function touch(){
    var m=my();if(!Object.keys(m).some(function(c){return m[c].role==="s";}))return;
    clearTimeout(timer);timer=setTimeout(syncAll,15000);
  }

  /* ---------- үйлдлүүд ---------- */
  function createClass(name,lang,tname,tries){
    tries=tries||0;var code=randCode();
    return db.ref("classes/"+code).transaction(function(cur){
      return cur===null?{name:name,teacher:uid,tname:tname,lang:lang,ts:now()}:undefined;
    }).then(function(r){
      if(!r.committed){if(tries>6)throw new Error("Код үүсгэж чадсангүй");return createClass(name,lang,tname,tries+1);}
      var m=my();m[code]={role:"t",name:tname,cname:name};setMy(m);
      return db.ref("mycls/"+uid+"/"+code).set("t").then(function(){return code;});
    });
  }
  function joinClass(code,name){
    code=code.toUpperCase().replace(/[^A-Z0-9]/g,"");
    return db.ref("classes/"+code).once("value").then(function(s){
      var c=s.val();if(!c)throw new Error("Ийм кодтой анги олдсонгүй");
      if(c.teacher===uid)throw new Error("Энэ бол таны өөрийн анги");
      return db.ref("members/"+code+"/"+uid).set({name:name,ts:TS()}).then(function(){
        return db.ref("mycls/"+uid+"/"+code).set("s");
      }).then(function(){
        var m=my();m[code]={role:"s",name:name,cname:c.name};setMy(m);
        return db.ref("tasks/"+code).once("value").then(function(t){return pushStats(code,t.val()||{},c.lang||"en");});
      }).then(function(){return code;});
    });
  }
  function leaveClass(code){
    return Promise.all([db.ref("board/"+code+"/"+uid).remove(),db.ref("cstats/"+code+"/"+uid).remove()]).then(function(){
      return Promise.all([db.ref("members/"+code+"/"+uid).remove(),db.ref("mycls/"+uid+"/"+code).remove()]);
    }).then(function(){
      var m=my();delete m[code];setMy(m);env.setLists(code,{});env.setLessons(code,{});
    });
  }
  function deleteClass(code){
    return Promise.all(["tasks/","members/","cstats/","wlists/","board/","tlessons/","live/","livekey/","liveans/","smsphones/"].map(function(p){return db.ref(p+code).remove();})).then(function(){
      return db.ref("classes/"+code).remove();
    }).then(function(){return db.ref("mycls/"+uid+"/"+code).remove();}).then(function(){var m=my();delete m[code];setMy(m);env.setLists(code,{});env.setLessons(code,{});});
  }
  /* бусад төхөөрөмжөөс нэгдсэн ангиудыг (Google-ээр нэвтэрсэн бол) татна */
  function refreshMine(){
    return db.ref("mycls/"+uid).once("value").then(function(s){
      var v=s.val()||{},m=my(),changed=false;
      Object.keys(v).forEach(function(code){if(!m[code]){m[code]={role:v[code],name:"",cname:code};changed=true;}});
      Object.keys(m).forEach(function(code){if(!v[code]){delete m[code];changed=true;}});
      if(changed)setMy(m);
      return Promise.all(Object.keys(m).map(function(code){
        return db.ref("classes/"+code).once("value").then(function(c){
          var cv=c.val();if(!cv){delete m[code];return;}
          m[code].cname=cv.name;m[code].lang=cv.lang;m[code].tname=cv.tname;
        });
      })).then(function(){setMy(m);});
    });
  }
  function loadClass(code){
    var role=(my()[code]||{}).role;
    var q=[db.ref("classes/"+code).once("value"),db.ref("tasks/"+code).once("value"),db.ref("wlists/"+code).once("value"),db.ref("tlessons/"+code).once("value")];
    if(role==="t")q.push(db.ref("members/"+code).once("value"),db.ref("cstats/"+code).once("value"));
    return Promise.all(q).then(function(r){
      var d={c:r[0].val(),tasks:r[1].val()||{},lists:r[2].val()||{},lessons:r[3].val()||{},members:r[4]?r[4].val()||{}:null,stats:r[5]?r[5].val()||{}:null};
      if(!d.c)throw new Error("Анги устгагдсан байна");
      storeLists(code,d.lists,d.c.lang||"en",d.c.name);storeLessons(code,d.lessons,d.c.lang||"en",d.c.name);
      var p=role==="s"?pushStats(code,d.tasks,d.c.lang||"en"):Promise.resolve();
      return p.then(function(){
        if(!d.c.board&&role==="s")return d;
        return db.ref("board/"+code).once("value").then(function(b){d.board=b.val()||{};return d;},function(){return d;});
      });
    });
  }
  function run(p,after){busy=true;err="";paint();p.then(function(x){busy=false;if(after)after(x);paint();},fail);}

  /* ---------- шууд тест (Kahoot маягийн): багш дэлгэцэн дээр асуулт гаргаж, сурагчид утсаараа хариулна ----------
     live/{code}: {st:lobby|q|rev|end, qi, n, dur, qs (JSON, зөв хариултгүй), t0, ok, dist, top, ts}
     livekey/{code}: зөв хариултууд, асуулт бүрийн t0 (зөвхөн багшид)
     liveans/{code}/{uid}: {name, q<i>:{a,i,t}} */
  var LV={code:null,role:null,v:null,gts:null,qs:null,ans:{},key:null,off:0,refs:[],tick:null,joined:false,mine:{},rev:false,dismiss:null,last:0};
  var LCOL=["#d63a2b","#2a6fd6","#9a6a00","#1e7e45"],LSHP=["▲","◆","●","■"];
  function sNow(){return now()+LV.off;}
  function liveLeft(){var v=LV.v;return v&&v.t0?Math.max(0,v.t0+v.dur*1000-sNow()):0;}
  function liveDetach(){
    LV.refs.forEach(function(r){r.off();});LV.refs=[];clearInterval(LV.tick);LV.tick=null;
    LV.code=null;LV.v=null;LV.gts=null;LV.qs=null;LV.ans={};LV.key=null;LV.joined=false;LV.mine={};
  }
  function liveAttach(code,role){
    if(LV.code===code)return;
    liveDetach();LV.code=code;LV.role=role;
    db.ref(".info/serverTimeOffset").once("value").then(function(s){LV.off=s.val()||0;});
    var lr=db.ref("live/"+code);LV.refs.push(lr);
    lr.on("value",function(s){
      var v=s.val();LV.v=v;
      if(v&&v.ts!==LV.gts){
        LV.gts=v.ts;LV.joined=false;LV.mine={};LV.rev=false;
        try{LV.qs=JSON.parse(v.qs||"[]");}catch(e){LV.qs=[];}
        if(role==="s")db.ref("liveans/"+code+"/"+uid).once("value").then(function(m){
          var x=m.val()||{};LV.joined=!!x.name;Object.keys(x).forEach(function(k){if(k.charAt(0)==="q")LV.mine[x[k].i]=x[k].a;});paint();
        }).catch(function(){});
        if(role==="t")db.ref("livekey/"+code).once("value").then(function(k){var x=k.val()||{};try{LV.key={a:JSON.parse(x.a||"[]"),t0:JSON.parse(x.t0||"[]")};}catch(e){LV.key={a:[],t0:[]};}}).catch(function(){});
      }
      if(v&&v.st!=="q")LV.rev=false;
      paint();
    },function(){});
    if(role==="t"){
      var ar=db.ref("liveans/"+code);LV.refs.push(ar);
      ar.on("value",function(s){
        LV.ans=s.val()||{};
        var v=LV.v;if(v&&v.st==="q"){var p=livePlayers();if(p.length&&p.every(function(u){return LV.ans[u]["q"+v.qi];}))liveReveal();}
        paint();
      },function(){});
    }
    LV.tick=setInterval(function(){
      var v=LV.v;if(!v||v.st!=="q")return;
      var ms=liveLeft(),el=document.getElementById("lqT"),bar=document.getElementById("lqB");
      if(el)el.textContent=String(Math.ceil(ms/1000));
      if(bar)bar.style.width=(ms/(v.dur*1000)*100)+"%";
      if(LV.role==="t"&&ms<=0)liveReveal();
    },250);
  }
  function livePlayers(){return Object.keys(LV.ans).filter(function(u){return LV.ans[u]&&LV.ans[u].name;});}
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  /* [үг, утга] жагсаалтаас 4 сонголттой асуулт үүсгэнэ: үг→утга эсвэл утга→үг */
  function makeQs(pool,n){
    var seen={};pool=pool.filter(function(p){var k=p[0]+"|"+p[1];if(!p[0]||!p[1]||seen[k])return false;seen[k]=1;return true;});
    return shuffle(pool.slice()).slice(0,n).map(function(p,i){
      var rev=i%2===1,ask=rev?p[1]:p[0],right=rev?p[0]:p[1],opts=[right],used={};used[right]=1;
      shuffle(pool.slice()).some(function(o){var x=rev?o[0]:o[1];if(!used[x]){used[x]=1;opts.push(x);}return opts.length>=4;});
      opts=shuffle(opts);
      return {p:rev?1:0,q:String(ask).slice(0,120),c:opts.map(function(x){return String(x).slice(0,80);}),a:opts.indexOf(right)};
    });
  }
  function liveStart(code,items,dur,comp){
    var key={a:JSON.stringify(items.map(function(x){return x.a;})),t0:"[]"};
    var pub=JSON.stringify(items.map(function(x){return [x.p,x.q,x.c];}));
    LV.key={a:items.map(function(x){return x.a;}),t0:[]};
    return db.ref("liveans/"+code).remove().then(function(){return db.ref("livekey/"+code).set(key);})
      .then(function(){var v={st:"lobby",qi:-1,n:items.length,dur:dur,qs:pub,ts:TS()};if(comp)v.comp=comp;return db.ref("live/"+code).set(v);});
  }
  function liveNext(){
    var v=LV.v,qi=v.qi+1;
    if(qi>=v.n)return db.ref("live/"+LV.code).update({st:"end"});
    return db.ref("live/"+LV.code).update({st:"q",qi:qi,t0:TS(),ok:null,dist:null});
  }
  function liveScores(upto){
    var v=LV.v,k=LV.key||{a:[],t0:[]};
    return livePlayers().map(function(u){
      var a=LV.ans[u],s=0,c=0;
      for(var j=0;j<=upto;j++){
        var x=a["q"+j];
        if(x&&x.i===j&&x.a===k.a[j]&&k.t0[j]){c++;s+=500+Math.round(500*Math.max(0,1-(x.t-k.t0[j])/(v.dur*1000)));}
      }
      return [u,a.name,s,c];
    }).sort(function(x,y){return y[2]-x[2];});
  }
  function liveReveal(){
    var v=LV.v;if(LV.rev||!v||v.st!=="q"||!LV.key)return;
    LV.rev=true;
    var qi=v.qi,dist=[0,0,0,0];LV.key.t0[qi]=v.t0;
    livePlayers().forEach(function(u){var x=LV.ans[u]["q"+qi];if(x&&x.i===qi&&dist[x.a]!=null)dist[x.a]++;});
    var top=liveScores(qi);
    db.ref("livekey/"+LV.code+"/t0").set(JSON.stringify(LV.key.t0)).catch(function(){});
    db.ref("live/"+LV.code).update({st:"rev",ok:LV.key.a[qi],dist:JSON.stringify(dist),top:JSON.stringify(top.slice(0,60))}).catch(function(e){LV.rev=false;fail(e);});
  }
  function liveClose(code){
    return Promise.all([db.ref("live/"+code).remove(),db.ref("livekey/"+code).remove(),db.ref("liveans/"+code).remove()]);
  }
  function liveTop(){try{return JSON.parse(LV.v.top||"[]");}catch(e){return [];}}
  function choiceBtns(q,on,mark){
    var g=h("div",{style:"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px"});
    q[2].forEach(function(c,i){
      var dim=mark!=null&&mark.ok!==i;
      g.append(h("button",{type:"button",disabled:!on,onclick:on?function(){on(i);}:null,
        style:"min-height:84px;border:0;border-radius:14px;padding:12px;color:#fff;font-weight:800;font-size:18px;text-align:left;display:flex;gap:10px;align-items:center;background:"+LCOL[i]+(dim?";opacity:.35":"")+(mark&&mark.pick===i?";outline:4px solid var(--ink);outline-offset:2px":"")+(on?";cursor:pointer":"")},
        h("span",{"aria-hidden":"true",style:"font-size:22px"},LSHP[i]),h("span",{style:"flex:1;overflow-wrap:anywhere"},c),mark&&mark.ok===i?h("span",null,"✓"):null,mark&&mark.cnt?h("span",{style:"font-size:15px;opacity:.9"},String(mark.cnt[i])):null));
    });
    return g;
  }
  function qHead(q,v,big){
    return h("div",{style:"text-align:center;margin-top:8px"},
      h("div",{class:"muted small"},"Асуулт "+(v.qi+1)+" / "+v.n+" · "+(q[0]?"Яаж хэлэх вэ?":"Утга нь юу вэ?")),
      h("div",{style:"font-weight:800;margin:6px 0;overflow-wrap:anywhere;font-size:"+(big?"34px":"26px")},q[1]));
  }
  function timerEl(v){
    var ms=liveLeft();
    return h("div",{style:"display:flex;align-items:center;gap:10px;margin-top:8px"},
      h("div",{style:"flex:1;height:10px;border-radius:8px;background:var(--line);overflow:hidden"},h("i",{id:"lqB",style:"display:block;height:100%;background:var(--sky);width:"+(ms/(v.dur*1000)*100)+"%"})),
      h("b",{id:"lqT",style:"font-size:22px;min-width:32px;text-align:right"},String(Math.ceil(ms/1000))));
  }
  function podium(root,top,me){
    if(!top.length){root.append(h("p",{class:"muted small"},"Оролцогч алга."));return;}
    top.slice(0,10).forEach(function(r,i){
      root.append(h("div",{class:"srow",style:r[0]===me?"font-weight:800;background:var(--line);border-radius:10px;padding-left:8px;padding-right:8px":""},
        h("span",null,(i<3?["🥇","🥈","🥉"][i]:(i+1)+".")+" "+r[1]+(r[0]===me?" (би)":"")),h("b",null,r[2]+" оноо")));
    });
  }
  function liveSetup(root,d){
    var code=S.code,lang=d.c.lang||"en",words=env.quizWords(lang);
    var box=h("div",{class:"note",style:"margin-top:8px"},h("b",null,"🎯 Шууд тест"),h("div",{class:"muted small"},"Та дэлгэц (проектор) дээр асуултаа гаргаж, сурагчид утсаараа хамгийн хурдан хариулахаар өрсөлдөнө."));
    root.append(box);
    if(!words){box.append(h("p",{class:"muted small"},"Үгсийг ачаалж байна…"));env.loadLang(lang,paint);return;}
    var src=h("select",{class:"tin","aria-label":"Асуултын эх"});
    Object.keys(d.lists||{}).forEach(function(lid){src.append(h("option",{value:"L:"+lid},"📝 "+d.lists[lid].name));});
    Object.keys(LVN).forEach(function(l){var c=words.filter(function(w){return w[2]===l;}).length;if(c>=4)src.append(h("option",{value:"V:"+l},"📚 Аппын "+LVN[l]+" түвшний үгс"));});
    var cnt=h("select",{class:"tin","aria-label":"Асуултын тоо"});[5,10,15,20].forEach(function(n){var o=h("option",{value:String(n)},n+" асуулт");if(n===10)o.selected=true;cnt.append(o);});
    var dur=h("select",{class:"tin","aria-label":"Хугацаа"});[10,20,30].forEach(function(n){var o=h("option",{value:String(n)},"Асуулт бүрт "+n+" секунд");if(n===20)o.selected=true;dur.append(o);});
    box.append(h("div",{class:"muted small",style:"margin-top:8px"},"Асуултууд"),src,cnt,dur,
      h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.form=null;paint();}},"Болих"),
        h("button",{class:"btn primary",disabled:busy,onclick:function(){
          var s=src.value,pool=s.indexOf("L:")===0?parseList(d.lists[s.slice(2)]):words.filter(function(w){return w[2]===s.slice(2);}).map(function(w){return [w[0],w[1]];});
          var items=makeQs(pool,parseInt(cnt.value,10));
          if(items.length<1||items[0].c.length<4){env.toast("Дор хаяж 4 өөр үгтэй жагсаалт хэрэгтэй");return;}
          run(liveStart(code,items,parseInt(dur.value,10)),function(){S.form=null;});
        }},"Эхлүүлэх")),
      h("button",{class:"btn ghost",style:"width:100%;margin-top:8px",disabled:busy,onclick:function(){
          var s=src.value,pool=s.indexOf("L:")===0?parseList(d.lists[s.slice(2)]):words.filter(function(w){return w[2]===s.slice(2);}).map(function(w){return [w[0],w[1]];});
          var items=makeQs(pool,parseInt(cnt.value,10));
          if(items.length<1||items[0].c.length<4){env.toast("Дор хаяж 4 өөр үгтэй жагсаалт хэрэгтэй");return;}
          var du=parseInt(dur.value,10);
          run(compCreate(code,d,items,du).then(function(cid){return liveStart(code,items,du,cid).then(function(){return cid;});}),function(cid){S.form=null;CP.loaded=false;env.toast("🏆 Тэмцээн үүслээ · код "+cid,6000);});
        }},"🏆 Ангиудын тэмцээн болгож эхлүүлэх"));
  }
  /* ---------- 🏆 ангиуд хоорондын тэмцээн: ижил асуултыг анги бүр өөрийн цагтаа шууд тестээр хийж, ангийн дунджаар өрсөлдөнө ----------
     comps/{cid}: {owner,name,lang,items(JSON, зөв хариулттай),dur,n,ts,t:{uid:true},cls:{code:{name,tname,avg,best,n,ts}}} — зөвхөн оролцогч багш нар уншина */
  var COMP_KEY="comps",CP={data:{},loaded:false};
  function myComps(){return env.sget(COMP_KEY,[])||[];}
  function addMyComp(cid){var l=myComps();if(l.indexOf(cid)<0){l.push(cid);env.sset(COMP_KEY,l.slice(-20));}}
  function compCreate(code,d,items,dur,tries){
    tries=tries||0;var cid=randCode();
    return db.ref("comps/"+cid).transaction(function(cur){
      return cur===null?{owner:uid,name:String(d.c.name+" · тэмцээн").slice(0,40),lang:d.c.lang||"en",items:JSON.stringify(items),dur:dur,n:items.length,ts:now(),t:(function(){var o={};o[uid]=true;return o;})()}:undefined;
    }).then(function(r){
      if(!r.committed){if(tries>6)throw new Error("Код үүсгэж чадсангүй");return compCreate(code,d,items,dur,tries+1);}
      addMyComp(cid);return cid;
    });
  }
  function compStart(code,cid){
    return db.ref("comps/"+cid).once("value").then(function(s){
      var c=s.val();if(!c)throw new Error("Тэмцээн олдсонгүй");
      var items=JSON.parse(c.items||"[]");
      return liveStart(code,items,c.dur,cid);
    });
  }
  function compJoin(code,d,cid){
    cid=String(cid||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(cid.length!==6)return Promise.reject(new Error("Тэмцээний код 6 тэмдэгттэй"));
    return db.ref("comps/"+cid+"/t/"+uid).set(true).then(function(){return db.ref("comps/"+cid).once("value");},function(){throw new Error("Ийм тэмцээн олдсонгүй");}).then(function(s){
      var c=s.val();if(!c)throw new Error("Ийм тэмцээн олдсонгүй");
      if((c.lang||"en")!==(d.c.lang||"en"))throw new Error("Энэ тэмцээн "+LANGS[c.lang]+" хэлээр явагдана");
      if(c.cls&&c.cls[code])throw new Error("Энэ анги тэмцээнд аль хэдийн оролцсон");
      addMyComp(cid);return compStart(code,cid);
    });
  }
  function compPost(code,d,v){
    if(!v.comp||LV.posted===v.ts)return;
    LV.posted=v.ts;
    var top=liveTop(),sc=top.map(function(r){return r[2];}),avg=sc.length?Math.round(sc.reduce(function(a,b){return a+b;},0)/sc.length):0;
    db.ref("comps/"+v.comp+"/cls/"+code).set({name:String(d.c.name).slice(0,40),tname:String(d.c.tname||"").slice(0,30),avg:avg,best:sc.length?Math.max.apply(null,sc):0,n:sc.length,ts:TS()})
      .then(function(){CP.loaded=false;paint();}).catch(function(){LV.posted=null;});
  }
  function loadComps(){
    CP.loaded=true;
    Promise.all(myComps().map(function(cid){return db.ref("comps/"+cid).once("value").then(function(s){CP.data[cid]=s.val();},function(){CP.data[cid]=null;});})).then(paint);
  }
  function compBoard(root,c,mine){
    var cls=c&&c.cls||{},ks=Object.keys(cls).sort(function(a,b){return cls[b].avg-cls[a].avg;});
    if(!ks.length){root.append(h("p",{class:"muted small"},"Одоогоор аль ч анги тестээ хийгээгүй байна."));return;}
    ks.forEach(function(k,i){
      var x=cls[k];
      root.append(h("div",{class:"srow",style:k===mine?"font-weight:800;background:var(--line);border-radius:10px;padding-left:8px;padding-right:8px":""},
        h("span",{style:"flex:1"},(i<3?["🥇","🥈","🥉"][i]:(i+1)+".")+" "+x.name,h("div",{class:"muted small"},(x.tname?"Багш "+x.tname+" · ":"")+x.n+" сурагч · шилдэг "+x.best)),
        h("b",null,x.avg+" дундаж")));
    });
  }
  function viewComps(root,d){
    var code=S.code;
    root.append(h("h3",{style:"margin:20px 0 6px"},"🏆 Ангиуд хоорондын тэмцээн"));
    root.append(h("p",{class:"muted small"},"Өөр анги, сургуулийн багштай ижил асуултаар өрсөлдөөрэй: анги бүр өөрийн цагтаа шууд тест хийж, ангийн дундаж оноогоор жагсана."));
    if(!CP.loaded)loadComps();
    myComps().slice().reverse().forEach(function(cid){
      var c=CP.data[cid];if(c===undefined){root.append(h("p",{class:"muted small"},"Ачаалж байна…"));return;}if(!c)return;
      var done=c.cls&&c.cls[code];
      var box=h("div",{class:"note",style:"margin-top:8px"},
        h("div",{style:"display:flex;justify-content:space-between;gap:8px"},h("b",null,c.name),h("span",{class:"muted small"},"Код: "+cid)),
        h("div",{class:"muted small"},c.n+" асуулт · "+Object.keys(c.cls||{}).length+" анги оролцсон"));
      compBoard(box,c,code);
      box.append(h("div",{class:"row",style:"flex-wrap:wrap"},
        done?null:h("button",{class:"btn primary",disabled:busy,onclick:function(){run(compStart(code,cid));}},"▶️ Манай анги эхлүүлэх"),
        h("button",{class:"btn",onclick:function(){
          var t="Салхи апп дээрх ангиудын тэмцээнд нэгдээрэй! Анги → 🏆 Тэмцээнд нэгдэх → код: "+cid;
          if(navigator.share)navigator.share({text:t}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){env.toast("Хуулагдлаа");});
        }},"📤 Багш урих"),
        h("button",{class:"btn ghost",onclick:function(){CP.loaded=false;paint();}},"🔄")));
      root.append(box);
    });
    var ci=h("input",{class:"tin",maxlength:"6",autocapitalize:"characters",placeholder:"Тэмцээний код","aria-label":"Тэмцээний код",style:"flex:1;margin:0;text-transform:uppercase"});
    root.append(h("div",{style:"display:flex;gap:8px;margin-top:8px"},ci,h("button",{class:"btn",style:"flex:none",disabled:busy,onclick:function(){run(compJoin(code,d,ci.value));}},"🏆 Тэмцээнд нэгдэх")));
  }
  function viewLiveTeacher(root,d){
    var v=LV.v,code=S.code,pl=livePlayers(),q=LV.qs&&LV.qs[v.qi];
    root.append(h("h2",null,"🎯 Шууд тест · "+d.c.name));
    if(v.st==="lobby"){
      root.append(h("div",{class:"note",style:"text-align:center"},
        h("div",{class:"muted small"},"Сурагчид: Профайл → 🏫 Анги → «"+d.c.name+"» → 🎯 Оролцох"),
        h("div",{style:"font-size:38px;font-weight:800;letter-spacing:6px;margin:4px 0"},code),
        h("div",{style:"font-size:20px;font-weight:700"},pl.length+" оролцогч")));
      var wrap=h("div",{style:"display:flex;flex-wrap:wrap;gap:8px;margin:12px 0"});
      pl.forEach(function(u){wrap.append(h("span",{class:"lvtag",style:"font-size:16px;padding:6px 12px"},LV.ans[u].name));});
      root.append(wrap);
      root.append(h("button",{class:"btn primary",style:"width:100%;font-size:18px",disabled:busy||!pl.length,onclick:function(){run(liveNext());}},"▶️ Эхлэх ("+v.n+" асуулт)"));
    }else if(v.st==="q"&&q){
      var got=pl.filter(function(u){return LV.ans[u]["q"+v.qi];}).length;
      root.append(qHead(q,v,true),timerEl(v),choiceBtns(q,null,null));
      root.append(h("div",{class:"row",style:"margin-top:12px;align-items:center"},h("b",{style:"flex:1"},"Хариулсан: "+got+" / "+pl.length),
        h("button",{class:"btn",onclick:liveReveal},"⏭ Хариуг харуулах")));
    }else if(v.st==="rev"&&q){
      var dist=[];try{dist=JSON.parse(v.dist||"[]");}catch(e){}
      root.append(qHead(q,v,true),choiceBtns(q,null,{ok:v.ok,cnt:dist}));
      root.append(h("h3",{style:"margin:16px 0 6px"},"🏆 Тэргүүлэгчид"));podium(root,liveTop().slice(0,5),null);
      root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:12px;font-size:18px",disabled:busy,onclick:function(){run(liveNext());}},v.qi+1>=v.n?"🏁 Дүнг харах":"▶️ Дараагийн асуулт"));
    }else if(v.st==="end"){
      var top=liveTop();
      root.append(h("div",{style:"text-align:center;font-size:56px;margin:8px 0"},"🏆"));
      if(top[0])root.append(h("p",{style:"text-align:center;font-size:22px;font-weight:800"},"Ялагч: "+top[0][1]+" — "+top[0][2]+" оноо"));
      podium(root,top,null);
      root.append(h("p",{class:"muted small"},"Зөв хариулт бүр 500–1000 оноо: хурдан хариулах тусам их."));
      if(v.comp){
        compPost(code,d,v);
        var c=CP.data[v.comp];
        root.append(h("h3",{style:"margin:18px 0 6px"},"🏆 Ангиудын тэмцээний байр"),h("p",{class:"muted small"},"Тэмцээний код: "+v.comp+" — бусад багш нарт өгөөрэй."));
        if(c===undefined||!CP.loaded){if(!CP.loaded)loadComps();root.append(h("p",{class:"muted small"},"Ачаалж байна…"));}
        else compBoard(root,c,code);
      }
    }
    root.append(h("div",{class:"row",style:"margin-top:16px"},h("button",{class:"btn ghost",onclick:function(){
      if(v.st!=="end"&&!S.confirmLive){S.confirmLive=true;env.toast("Дахин дарвал тест дуусна");return;}
      S.confirmLive=false;run(liveClose(code));
    }},v.st==="end"?"✖ Хаах":"⏹ Тестийг зогсоох")));
  }
  function viewLiveStudent(root,d){
    var v=LV.v,code=S.code,q=LV.qs&&LV.qs[v.qi];
    root.append(h("h2",null,"🎯 Шууд тест"));
    if(v.st!=="end"&&!LV.joined){
      root.append(h("p",{class:"muted"},"Багш тань «"+d.c.name+"» ангид шууд тест эхлүүллээ."));
      root.append(h("button",{class:"btn primary",style:"width:100%;font-size:18px",disabled:busy,onclick:function(){
        var nm=String(my()[code]&&my()[code].name||env.name()||"Сурагч").slice(0,30);
        run(db.ref("liveans/"+code+"/"+uid+"/name").set(nm),function(){LV.joined=true;});
      }},"🙋 Оролцох"));
    }else if(v.st==="lobby"){
      root.append(h("div",{style:"text-align:center;font-size:56px;margin:16px 0"},"⏳"),h("p",{style:"text-align:center;font-weight:700"},"Бэлэн! Багш эхлүүлэхийг хүлээж байна…"));
    }else if(v.st==="q"&&q){
      var pick=LV.mine[v.qi];
      root.append(qHead(q,v,false),timerEl(v));
      if(pick!=null)root.append(choiceBtns(q,null,{pick:pick}),h("p",{style:"text-align:center;font-weight:700;margin-top:12px"},"✅ Хариулт илгээгдлээ. Хүлээнэ үү…"));
      else root.append(choiceBtns(q,liveLeft()>0?function(i){
        LV.mine[v.qi]=i;paint();
        db.ref("liveans/"+code+"/"+uid+"/q"+v.qi).set({a:i,i:v.qi,t:TS()}).catch(function(){delete LV.mine[v.qi];env.toast("Хариулт хоцорлоо ⏰");paint();});
      }:null,null));
    }else if(v.st==="rev"&&q){
      var top=liveTop(),k=top.findIndex(function(r){return r[0]===uid;}),pk=LV.mine[v.qi],ok=pk===v.ok;
      root.append(h("div",{style:"text-align:center;margin:12px 0"},h("div",{style:"font-size:56px"},pk==null?"⏰":ok?"🎉":"😕"),
        h("div",{style:"font-size:22px;font-weight:800"},pk==null?"Хариулаагүй":ok?"Зөв!":"Буруу"),
        k>=0?h("div",{class:"muted"},top[k][2]+" оноо · "+(k+1)+"-р байр"):null));
      root.append(qHead(q,v,false),choiceBtns(q,null,{ok:v.ok,pick:pk}));
    }else if(v.st==="end"){
      var t2=liveTop(),k2=t2.findIndex(function(r){return r[0]===uid;});
      root.append(h("div",{style:"text-align:center;font-size:56px;margin:8px 0"},k2===0?"🏆":k2>=0&&k2<3?"🎖":"🎉"));
      if(k2>=0)root.append(h("p",{style:"text-align:center;font-size:20px;font-weight:800"},(k2+1)+"-р байр · "+t2[k2][2]+" оноо ("+t2[k2][3]+"/"+v.n+" зөв)"));
      podium(root,t2,uid);
      root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:function(){LV.dismiss=v.ts;paint();}},"Болсон"));
    }else root.append(h("p",{class:"muted"},"Ачаалж байна…"));
  }

  /* ---------- харагдац ---------- */
  function back(fn){return h("button",{class:"back",onclick:fn},"‹ Буцах");}
  function viewHome(root){
    var m=my(),codes=Object.keys(m);
    root.append(h("p",{class:"muted"},"Багш анги үүсгэж, сурагчид кодоор нэгдэнэ. Багш даалгавар өгч, сурагч бүрийн явцыг харна."));
    var st=codes.filter(function(c){return m[c].role==="s";}),te=codes.filter(function(c){return m[c].role==="t";});
    root.append(h("h3",{style:"margin:16px 0 6px"},"🎒 Миний ангиуд"));
    if(!st.length)root.append(h("p",{class:"muted small"},"Одоогоор ангид нэгдээгүй байна."));
    st.forEach(function(code){root.append(clsRow(code,m[code]));});
    var nm=h("input",{class:"tin",placeholder:"Таны нэр (багшид харагдана)",maxlength:"30",value:env.name()||"",autocomplete:"name","aria-label":"Таны нэр"});
    var cd=h("input",{class:"tin",placeholder:"Ангийн код (6 тэмдэгт)",maxlength:"6",autocapitalize:"characters",autocomplete:"off","aria-label":"Ангийн код",style:"text-transform:uppercase;letter-spacing:3px;font-weight:700"});
    root.append(h("div",{class:"note",style:"margin-top:10px"},h("b",null,"➕ Ангид нэгдэх"),cd,nm,
      h("button",{class:"btn primary",style:"width:100%;margin-top:10px",disabled:busy,onclick:function(){
        var c=cd.value.trim(),n=nm.value.trim().slice(0,30);
        if(c.length<6||!n){env.toast("Код болон нэрээ бичнэ үү");return;}
        run(connect().then(function(){return joinClass(c,n);}),function(code){env.toast("Ангид нэгдлээ ✅");S.scr="class";S.code=code;S.data=null;});
      }},"Нэгдэх")));
    if(env.kid())return;
    root.append(h("h3",{style:"margin:22px 0 6px"},"👩‍🏫 Багш"));
    te.forEach(function(code){root.append(clsRow(code,m[code]));});
    if(S.form==="new"){
      var cn=h("input",{class:"tin",placeholder:"Ангийн нэр (ж: 10А англи)",maxlength:"40","aria-label":"Ангийн нэр"});
      var tn=h("input",{class:"tin",placeholder:"Багшийн нэр",maxlength:"30",value:env.name()||"","aria-label":"Багшийн нэр"});
      var lg=h("select",{class:"tin","aria-label":"Хэл"});
      Object.keys(LANGS).forEach(function(k){var o=h("option",{value:k},LANGS[k]+" хэл");if(k===env.lang())o.selected=true;lg.append(o);});
      root.append(h("div",{class:"note",style:"margin-top:10px"},h("b",null,"🏫 Шинэ анги"),cn,tn,lg,
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.form=null;paint();}},"Болих"),
          h("button",{class:"btn primary",disabled:busy,onclick:function(){
            var a=cn.value.trim().slice(0,40),b=tn.value.trim().slice(0,30);
            if(!a||!b){env.toast("Ангийн болон багшийн нэрээ бичнэ үү");return;}
            run(connect().then(function(){return createClass(a,lg.value,b);}),function(code){S.form=null;S.scr="class";S.code=code;S.data=null;});
          }},"Үүсгэх"))));
    }else root.append(h("button",{class:"btn",style:"width:100%;margin-top:8px",onclick:function(){S.form="new";paint();}},"🏫 Анги үүсгэх"));
    if(!env.signedIn())root.append(h("p",{class:"muted small",style:"margin-top:10px"},"💡 Багш бол Google-ээр нэвтэрвэл ангиуд тань өөр төхөөрөмж дээр ч харагдана."));
  }
  function clsRow(code,c){
    return h("button",{class:"lrow",type:"button",onclick:function(){err="";S.scr="class";S.code=code;S.data=null;paint();}},
      h("span",{class:"hexb ico"},c.role==="t"?"👩‍🏫":"🎒"),
      h("span",{style:"flex:1;text-align:left"},h("div",{class:"t"},c.cname||code),h("div",{class:"muted small"},(c.lang?LANGS[c.lang]+" хэл · ":"")+(c.role==="t"?"Код: "+code:(c.tname?"Багш: "+c.tname:"")))),
      h("span",{"aria-hidden":"true"},"›"));
  }
  function taskLine(t){
    var k=KINDS[t.k]||KINDS.xp;
    return k[0]+" "+(t.t||k[1])+" — "+t.n+" "+k[2]+(t.due?" · "+fmtDate(t.due)+" хүртэл":"");
  }
  function sortedTasks(d){return Object.keys(d.tasks).sort(function(a,b){return (d.tasks[a].ts||0)-(d.tasks[b].ts||0);});}
  function viewStudent(root,d){
    var code=S.code,lang=d.c.lang||"en";
    root.append(h("h2",null,"🎒 "+d.c.name));
    root.append(h("p",{class:"muted"},LANGS[lang]+" хэл · Багш: "+(d.c.tname||"")));
    if(lang!==env.lang())root.append(h("div",{class:"note small",style:"margin:6px 0"},"💡 Даалгавар "+LANGS[lang]+" хэл дээр тоологдоно. Дээрээс хэлээ "+LANGS[lang]+" болгоорой."));
    var ids=sortedTasks(d),lids=Object.keys(d.lists||{});
    if(lids.length){
      root.append(h("h3",{style:"margin:16px 0 6px"},"📝 Үгсийн жагсаалт"));
      lids.forEach(function(lid){
        var L=d.lists[lid],tot=L.n||parseList(L).length,k=code+":"+lid,v=env.listProgress(k)||0;
        root.append(h("div",{class:"note",style:"margin:8px 0;padding:10px 14px"},
          h("div",{style:"font-weight:700"},"📝 "+L.name),
          h("div",{class:"muted small"},"Цээжилсэн: "+v+" / "+tot),
          h("div",{class:"row",style:"margin-top:6px"},
            h("button",{class:"btn primary",onclick:function(){env.openList(k,"words");}},"📖 Карт, тест"),
            h("button",{class:"btn",onclick:function(){env.openList(k,"play");}},"🎮 Тоглоом"))));
      });
    }
    var tls=Object.keys(d.lessons||{}).sort(function(a,b){return (d.lessons[a].ts||0)-(d.lessons[b].ts||0);});
    if(tls.length){
      root.append(h("h3",{style:"margin:16px 0 6px"},"📘 Багшийн хичээл"));
      tls.forEach(function(lid){
        var k=code+":"+lid,done=env.lessonDone(k);
        root.append(h("button",{class:"lrow",type:"button",onclick:function(){env.openLesson(k);}},
          h("span",{class:"hexb ico"},done?"✅":"📘"),
          h("span",{style:"flex:1;text-align:left"},h("div",{class:"t"},d.lessons[lid].t),h("div",{class:"muted small"},done?"Давсан":"Унших, тест өгөх")),
          h("span",{"aria-hidden":"true"},"›")));
      });
    }
    root.append(h("h3",{style:"margin:16px 0 6px"},"📋 Даалгавар"));
    if(!ids.length)root.append(h("p",{class:"muted small"},"Багш одоогоор даалгавар өгөөгүй байна."));
    ids.forEach(function(tid){
      var t=d.tasks[tid],v=progressFor(code,tid,t,lang)||0,pc=Math.round(v/t.n*100),late=t.due&&now()>t.due+86400000&&v<t.n;
      root.append(h("div",{class:"note",style:"margin:8px 0;padding:10px 14px"},
        h("div",{style:"font-weight:700"},taskLine(t)),
        h("div",{style:"height:10px;border-radius:8px;background:var(--line);overflow:hidden;margin:8px 0 4px"},h("i",{style:"display:block;height:100%;width:"+pc+"%;background:"+(v>=t.n?"var(--ok)":"var(--sky)")})),
        h("div",{class:"muted small"},v>=t.n?"✅ Биелсэн":v+" / "+t.n+(late?" · ⏰ хугацаа хэтэрсэн":"")),
        t.k==="list"&&d.lists[t.lid]&&v<t.n?h("button",{class:"btn",style:"margin-top:6px",onclick:function(){env.openList(code+":"+t.lid,"words");}},"📖 Сурах"):null,
        t.k==="tlesson"&&d.lessons[t.lid]&&v<t.n?h("button",{class:"btn",style:"margin-top:6px",onclick:function(){env.openLesson(code+":"+t.lid);}},"📘 Хичээл нээх"):null));
    });
    if(d.c.board){root.append(h("h3",{style:"margin:18px 0 6px"},"🏆 7 хоногийн рейтинг"));boardView(root,d,true);}
    root.append(h("div",{class:"row"},
      h("button",{class:"btn",onclick:function(){S.data=null;paint();}},"🔄 Шинэчлэх"),
      h("button",{class:"btn ghost",onclick:function(){
        if(!S.confirm){S.confirm=true;env.toast("Дахин дарвал ангиас гарна");return;}
        S.confirm=false;run(leaveClass(code),function(){S.scr="home";S.code=null;});
      }},"Ангиас гарах")));
  }
  /* "үг — орчуулга" мөрүүдийг задлана: таб, |, —, –, =, " - " тусгаарлагч */
  function parseInput(t){
    var out=[],seen={};
    String(t).split(/\r?\n/).forEach(function(l){
      l=l.trim();if(!l)return;
      var m=l.match(/^(.+?)\s*(?:\t|\||—|–|=|\s-\s)\s*(.+)$/);if(!m)return;
      var w=m[1].trim().slice(0,60).replace(/\|/g,"/"),mn=m[2].trim().slice(0,80).replace(/\|/g,"/");
      if(!w||!mn||seen[w])return;seen[w]=1;out.push([w,mn]);
    });
    return out.slice(0,300);
  }
  function listEditor(root,d,lid){
    var code=S.code,cur=lid?d.lists[lid]:null;
    var nm=h("input",{class:"tin",placeholder:"Жагсаалтын нэр (ж: 5-р бүлгийн үгс)",maxlength:"40",value:cur?cur.name:"","aria-label":"Жагсаалтын нэр"});
    var ta=h("textarea",{class:"tin",rows:"9",placeholder:"Мөр бүрт нэг үг: үг — орчуулга\napple — алим\nbook | ном\n(Excel-ээс хоёр баганыг шууд хуулж болно)","aria-label":"Үгс",style:"font-family:inherit;resize:vertical"});
    if(cur)ta.value=parseList(cur).map(function(p){return p[0]+" — "+p[1];}).join("\n");
    var cnt=h("div",{class:"muted small",style:"margin-top:4px"},"");
    function upd(){var n=parseInput(ta.value).length;cnt.textContent=n+" үг танигдлаа"+(n>=300?" (дээд тал 300)":"");}
    ta.addEventListener("input",upd);upd();
    root.append(h("div",{class:"note",style:"margin-top:8px"},h("b",null,lid?"✏️ Жагсаалт засах":"📝 Шинэ үгсийн жагсаалт"),nm,ta,cnt,
      h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.form=null;paint();}},"Болих"),
        h("button",{class:"btn primary",disabled:busy,onclick:function(){
          var name=nm.value.trim().slice(0,40),ws=parseInput(ta.value);
          if(!name||ws.length<2){env.toast("Нэр болон дор хаяж 2 үг оруулна уу");return;}
          var v={name:name,w:ws.map(function(p){return p[0]+"|"+p[1];}).join("\n"),n:ws.length,ts:now()};
          var ref=lid?db.ref("wlists/"+code+"/"+lid):db.ref("wlists/"+code).push();
          run(ref.set(v),function(){S.form=null;S.data=null;env.toast("Хадгалагдлаа ✅");});
        }},"Хадгалах"))));
  }
  var LVN={a1:"A1",a2:"A2",b1:"B1",b2:"B2",c1:"C1",c2:"C2"};
  function lessonPicker(root,d){
    var code=S.code,lang=d.c.lang||"en",all=env.lessonsFor(lang);
    var box=h("div",{class:"note",style:"margin-top:8px"},h("b",null,"📚 Хичээлийн сангаас нэмэх"));
    root.append(box);
    if(!all){box.append(h("p",{class:"muted small"},"Хичээлүүдийг ачаалж байна…"));env.loadLang(lang,paint);return;}
    var have={};Object.keys(d.lessons||{}).forEach(function(k){if(d.lessons[k].ref)have[d.lessons[k].ref]=k;});
    var lvs=Object.keys(LVN).filter(function(l){return all.some(function(x){return x.lv===l;});});
    if(!S.plv||lvs.indexOf(S.plv)<0)S.plv=lvs[0];
    var seg=h("div",{class:"seg",style:"margin:8px 0;flex-wrap:wrap"});
    lvs.forEach(function(l){seg.append(h("button",{"aria-pressed":String(S.plv===l),onclick:function(){S.plv=l;paint();}},LVN[l]));});
    var q=h("input",{class:"tin",type:"search",placeholder:"🔎 Хичээл хайх (ж: past, は, 了)",value:S.pq||"","aria-label":"Хичээл хайх",autocomplete:"off"});
    var listEl=h("div",{style:"max-height:420px;overflow-y:auto;margin-top:6px"});
    function fill(){
      listEl.textContent="";var t=(S.pq||"").toLowerCase();
      var rows=all.filter(function(x){return t?x.t.toLowerCase().indexOf(t)>=0:x.lv===S.plv;}).slice(0,80);
      if(!rows.length)listEl.append(h("p",{class:"muted small"},"Хичээл олдсонгүй."));
      rows.forEach(function(x){
        var added=!!have[x.id];
        listEl.append(h("div",{class:"srow"},
          h("span",{style:"flex:1"},h("span",{class:"lvtag",style:"margin-right:6px"},LVN[x.lv]||""),x.t),
          h("button",{class:"btn"+(added?" ghost":" primary"),style:"padding:6px 12px;flex:none",disabled:added||busy,"aria-label":added?"Нэмсэн":"Нэмэх",onclick:function(){
            var r=db.ref("tlessons/"+code).push(),v={ref:x.id,t:String(x.t).slice(0,60),lv:x.lv||"",ts:now()};
            run(r.set(v),function(){d.lessons[r.key]=v;storeLessons(code,d.lessons,lang,d.c.name);env.toast("Нэмэгдлээ ✅");});
          }},added?"✓":"➕")));
      });
    }
    q.addEventListener("input",function(){S.pq=q.value.trim();fill();});
    box.append(seg,q,listEl,h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.form=null;S.pq="";paint();}},"Болсон")));
    fill();
  }
  function lessonEditor(root,d,lid){
    var code=S.code,cur=lid?d.lessons[lid]:{};
    function field(lbl,hint,el){return [h("div",{style:"font-weight:700;margin-top:12px"},lbl),hint?h("div",{class:"muted small"},hint):null,el];}
    function ta(v,rows,ph,max){var x=h("textarea",{class:"tin",rows:String(rows),placeholder:ph,maxlength:String(max),style:"font-family:inherit;resize:vertical"});x.value=v||"";return x;}
    var t=h("input",{class:"tin",placeholder:"Хичээлийн нэр (ж: Present Simple)",maxlength:"60",value:cur.t||"","aria-label":"Хичээлийн нэр"});
    var intro=ta(cur.intro,5,"Монголоор тайлбар. Догол мөрийг хоосон мөрөөр тусгаарлана.",4000);
    var rule=h("input",{class:"tin",placeholder:"Томьёо (ж: I/You/We/They + V, He/She/It + V-s)",maxlength:"200",value:cur.rule||"","aria-label":"Дүрэм"});
    var ex=ta(cur.ex,4,"I play football. — Би хөл бөмбөг тоглодог.\nShe works here. — Тэр энд ажилладаг.",5000);
    var q=ta(cur.q,4,"She ___ to school every day. | goes | go | going\n(эхний хариулт зөв, дараа нь буруу хариултууд)",5000);
    var o=ta(cur.o,3,"They play tennis on Sundays.\n(хоосон бол жишээнээс автоматаар үүснэ)",3000);
    var f=ta(cur.f,3,"He ___ coffee every morning. | drinks",3000);
    var info=h("div",{class:"muted small",style:"margin-top:8px"});
    function vals(){return {t:t.value.trim().slice(0,60),intro:intro.value.trim(),rule:rule.value.trim().slice(0,200),ex:ex.value.trim(),q:q.value.trim(),o:o.value.trim(),f:f.value.trim()};}
    function upd(){var p=parseLesson(vals());info.textContent="Тест: "+(p.q.length+p.o.length+p.f.length)+" асуулт (сонголт "+p.q.length+", өгүүлбэр бүтээх "+p.o.length+", нөхөх "+p.f.length+") · жишээ "+p.ex.length;}
    [intro,ex,q,o,f].forEach(function(x){x.addEventListener("input",upd);});upd();
    var box=h("div",{class:"note",style:"margin-top:8px"},h("b",null,lid?"✏️ Хичээл засах":"📘 Шинэ хичээл"),t);
    [field("Тайлбар",null,intro),field("Дүрэм, томьёо","Заавал биш",rule),field("Жишээ өгүүлбэр","Мөр бүрт: өгүүлбэр — орчуулга",ex),
     field("Сонголттой асуулт","Мөр бүрт: асуулт | зөв | буруу | буруу",q),field("Өгүүлбэр бүтээх","Мөр бүрт нэг өгүүлбэр. Хятад, япон хэлэнд үгсийг зайгаар тусгаарлана.",o),
     field("Нөхөх","Мөр бүрт: ___ бүхий өгүүлбэр | хариулт",f)].forEach(function(a){a.forEach(function(e){if(e)box.append(e);});});
    box.append(info,h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.form=null;paint();}},"Болих"),
      h("button",{class:"btn primary",disabled:busy,onclick:function(){
        var v=vals(),p=parseLesson(v);
        if(!v.t){env.toast("Хичээлийн нэрээ бичнэ үү");return;}
        if(!v.intro&&!p.ex.length){env.toast("Тайлбар эсвэл жишээ оруулна уу");return;}
        if(p.q.length+p.o.length+p.f.length<1){env.toast("Дор хаяж нэг асуулт нэмнэ үү");return;}
        v.ts=lid&&cur.ts?cur.ts:now();
        var ref=lid?db.ref("tlessons/"+code+"/"+lid):db.ref("tlessons/"+code).push();
        run(ref.set(v),function(){S.form=null;S.data=null;env.toast("Хичээл хадгалагдлаа ✅");});
      }},"Хадгалах")));
    root.append(box);
  }
  function boardView(root,d,mine){
    var b=d.board||{},wk=env.me(d.c.lang||"en").wk;
    var rows=Object.keys(b).map(function(u){return {u:u,name:b[u].name,x:b[u].wk===wk?b[u].wxp||0:0};}).sort(function(a,c){return c.x-a.x;});
    if(!rows.length){root.append(h("p",{class:"muted small"},"Одоогоор оролцогч алга."));return;}
    rows.slice(0,mine?10:50).forEach(function(r,i){
      var me=r.u===uid;
      root.append(h("div",{class:"srow",style:me?"font-weight:800;background:var(--line);border-radius:10px;padding-left:8px;padding-right:8px":""},
        h("span",null,(i<3?["🥇","🥈","🥉"][i]:(i+1)+".")+" "+r.name+(me?" (би)":"")),h("b",null,r.x+" XP")));
    });
    if(mine){var k=rows.findIndex(function(r){return r.u===uid;});if(k>=10)root.append(h("p",{class:"muted small"},"Таны байр: "+(k+1)+" / "+rows.length));}
  }
  /* ---------- 📻 интернэтгүй сурагчдад: өдрийн үгсийг SMS, радио/чанга яригчийн MP3 хичээл, хэвлэх эх бичвэр болгоно ----------
     Апп өөрөө SMS илгээхгүй: багшийн утасны SMS апп нээгдэнэ. MP3 нь Worker-ийн /tts (монгол + зорилтот хэлний neural дуу)-ийн хэсгүүдийг залгана. */
  var RU={src:null,n:3,busy:false,prog:""};
  function ruTTS(){return window.SALKHI_AI&&window.SALKHI_AI.url?String(window.SALKHI_AI.url).replace(/\/chat\/?$/,"/tts"):null;}
  function ruWords(d){
    var lang=d.c.lang||"en",s=RU.src||(Object.keys(d.lists||{})[0]?"L:"+Object.keys(d.lists)[0]:"V:a1"),pool;
    if(s.indexOf("L:")===0&&d.lists[s.slice(2)])pool=parseList(d.lists[s.slice(2)]);
    else{var w=env.quizWords(lang);if(!w)return null;pool=w.filter(function(x){return x[2]===s.slice(2);}).map(function(x){return [x[0],x[1]];});}
    pool=pool.filter(function(p){return p[0]&&p[1]&&p[0].length<=40;});
    if(!pool.length)return [];
    /* өдөр бүр өөр, гэхдээ тухайн өдөрт тогтмол (SMS, аудио, эх бичвэр ижил үгтэй байна) */
    var day=Math.floor(now()/86400000),out=[],k=(day*RU.n)%pool.length;
    for(var i=0;i<Math.min(RU.n,pool.length);i++)out.push(pool[(k+i)%pool.length]);
    return out;
  }
  function ruShort(m){return String(m).split(/[,;(]/)[0].trim();}
  function ruSms(d,ws){
    var L={en:"англи",ja:"япон",ko:"солонгос",zh:"хятад",ru:"орос",de:"герман"}[d.c.lang||"en"],dt=new Date(),q=ws[ws.length-1];
    return "Салхи "+(dt.getMonth()+1)+"/"+dt.getDate()+" "+L+": "+ws.map(function(p){return p[0]+" - "+ruShort(p[1]);}).join(", ")+". Асуулт: «"+ruShort(q[1])+"» гэж юу вэ? Хариугаа илгээ.";
  }
  function ruScript(d,ws){
    var L={en:"англи",ja:"япон",ko:"солонгос",zh:"хятад",ru:"орос",de:"герман"}[d.c.lang||"en"],q=ws[ws.length-1],seg=[];
    seg.push(["mn","Сайн байцгаана уу! Салхи апп-ын "+L+" хэлний богино хичээлд тавтай морил. Өнөөдөр "+ws.length+" шинэ үг сурна."]);
    ws.forEach(function(p,i){
      seg.push(["mn",(i+1)+"-р үг. "+ruShort(p[1])+"."]);
      seg.push(["t",p[0]]);seg.push(["mn","Дахин сонсоорой."]);seg.push(["t",p[0]]);
      seg.push(["mn","Одоо та чангаар давтаж хэлээрэй."]);seg.push(["t",p[0]]);
    });
    seg.push(["mn","Одоо давтъя."]);
    ws.forEach(function(p){seg.push(["mn",ruShort(p[1])]);seg.push(["t",p[0]]);});
    seg.push(["mn","Асуулт: "+ruShort(q[1])+" гэдгийг "+L+" хэлээр яаж хэлэх вэ? Бодоод үзээрэй."]);
    seg.push(["mn","Зөв хариулт нь:"]);seg.push(["t",q[0]]);
    seg.push(["mn","Баярлалаа! Маргааш дахин уулзъя. Салхи апп."]);
    return seg;
  }
  function ruText(d,ws){
    var lines=["📻 Салхи — богино хичээл ("+d.c.name+", "+new Date().toLocaleDateString()+")",""];
    ruScript(d,ws).forEach(function(s){lines.push((s[0]==="mn"?"🎙 Хөтлөгч: ":"🔊 Дуудлага: ")+s[1]);});
    lines.push("","Үгс:");ws.forEach(function(p){lines.push("• "+p[0]+" — "+p[1]);});
    return lines.join("\n");
  }
  function ruDownload(name,blob){
    var f=new File([blob],name,{type:blob.type});
    if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(function(){});return;}
    var u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},5000);
  }
  function ruMp3(d,ws){
    var T=ruTTS(),lang=d.c.lang||"en";if(!T){env.toast("Аудио үүсгэх үйлчилгээ алга");return;}
    var seg=ruScript(d,ws),parts=[],i=0;RU.busy=true;RU.prog="0 / "+seg.length;paint();
    function next(){
      if(i>=seg.length){
        RU.busy=false;RU.prog="";paint();
        ruDownload("salkhi-"+String(d.c.name).replace(/\s+/g,"_")+"-"+new Date().toISOString().slice(0,10)+".mp3",new Blob(parts,{type:"audio/mpeg"}));
        return;
      }
      var s=seg[i],url=T+"?l="+(s[0]==="mn"?"mn":lang)+"&r="+(s[0]==="mn"?"-5":"-15")+"&t="+encodeURIComponent(s[1]);
      (function get(tries){
        fetch(url).then(function(r){
          if(r.status===429&&tries<5)return new Promise(function(ok){setTimeout(ok,12000);}).then(function(){return get(tries+1);});
          if(!r.ok)throw 0;return r.arrayBuffer().then(function(b){parts.push(b);i++;RU.prog=i+" / "+seg.length;var el=document.getElementById("ruprog");if(el)el.textContent=RU.prog;next();});
        }).catch(function(){RU.busy=false;RU.prog="";env.toast("Аудио үүсгэж чадсангүй. Интернэтээ шалгаад дахин оролдоно уу.");paint();});
      })(0);
    }
    next();
  }
  /* апп-аас шууд SMS (Worker /sms) — үйлчилгээ үзүүлэгч тохируулагдсан үед л идэвхжинэ */
  var SMSX={status:null,phones:null,code:null,edit:false,busy:false,res:""};
  function smsBase(){return window.SALKHI_AI&&window.SALKHI_AI.url?String(window.SALKHI_AI.url).replace(/\/chat\/?$/,""):null;}
  function smsLoad(code){
    SMSX.code=code;SMSX.phones=null;
    var b=smsBase();
    if(b&&SMSX.status===null){SMSX.status="…";fetch(b+"/sms/status").then(function(r){return r.json();}).then(function(j){SMSX.status=!!j.configured;paint();},function(){SMSX.status=false;paint();});}
    db.ref("smsphones/"+code).once("value").then(function(s){SMSX.phones=s.val()||"";paint();},function(){SMSX.phones="";paint();});
  }
  function smsList(t){var seen={};return String(t||"").split(/[\s,;]+/).map(function(p){return p.replace(/[^\d]/g,"").replace(/^976/,"");}).filter(function(p){if(!/^[6-9]\d{7}$/.test(p)||seen[p])return false;seen[p]=1;return true;});}
  function smsSend(code,text){
    var b=smsBase();if(!b)return;
    SMSX.busy=true;SMSX.res="";paint();
    firebase.auth().currentUser.getIdToken().then(function(tok){
      return fetch(b+"/sms",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code:code,token:tok,text:text})});
    }).then(function(r){return r.json().then(function(j){return [r.status,j];});}).then(function(x){
      var s=x[0],j=x[1];SMSX.busy=false;
      SMSX.res=s===200?"✅ "+j.sent+" дугаарт илгээлээ"+(j.failed?" · "+j.failed+" амжилтгүй":"")+" · өнөөдөр дахиад "+j.left+" удаа илгээж болно"
        :j.error==="daily_limit"?"⏰ Өнөөдрийн хязгаар ("+j.limit+" удаа) дууслаа. Маргааш дахин илгээнэ үү."
        :j.error==="sms_not_configured"?"SMS үйлчилгээ хараахан холбогдоогүй байна."
        :j.error==="forbidden"?"Зөвшөөрөлгүй байна (зөвхөн ангийн багш илгээнэ)."
        :j.error==="no_phones"?"Хүчинтэй утасны дугаар алга.":"Илгээж чадсангүй ("+(j.error||s)+").";
      paint();
    }).catch(function(){SMSX.busy=false;SMSX.res="Илгээж чадсангүй. Интернэтээ шалгана уу.";paint();});
  }
  function viewSmsDirect(box,code,text){
    if(SMSX.code!==code)smsLoad(code);
    if(SMSX.status!==true)return;
    var list=smsList(SMSX.phones),wrap=h("div",{style:"margin-top:12px;border-top:1px solid var(--line);padding-top:10px"});
    wrap.append(h("b",null,"📲 Апп-аас шууд SMS илгээх"),h("div",{class:"muted small"},list.length+" эцэг эхийн дугаар бүртгэлтэй · өдөрт 2 удаа хүртэл"));
    if(SMSX.edit||!list.length){
      var ta=h("textarea",{class:"tin",rows:"4",placeholder:"Эцэг эхийн утасны дугаарууд (мөр бүрт эсвэл таслалаар): 99112233, 88114455","aria-label":"Утасны дугаарууд",style:"font-family:inherit"});
      ta.value=SMSX.phones||"";
      var ok=h("input",{type:"checkbox",id:"smsok"});
      wrap.append(ta,h("label",{for:"smsok",class:"small",style:"display:flex;gap:8px;align-items:flex-start;margin:6px 0"},ok,"Эцэг эхчүүд SMS хүлээн авахыг зөвшөөрсөн. Дугаарууд зөвхөн надад (багшид) харагдана."),
        h("div",{class:"row"},list.length?h("button",{class:"btn",onclick:function(){SMSX.edit=false;paint();}},"Болих"):null,
          h("button",{class:"btn primary",disabled:busy,onclick:function(){
            var l=smsList(ta.value);if(!ok.checked){env.toast("Эцэг эхийн зөвшөөрлийг баталгаажуулна уу");return;}
            if(!l.length){env.toast("8 оронтой дугаар оруулна уу");return;}
            if(l.length>60){env.toast("Дээд тал 60 дугаар");return;}
            run(db.ref("smsphones/"+code).set(l.join(",")),function(){SMSX.phones=l.join(",");SMSX.edit=false;env.toast("Хадгалагдлаа ✅");});
          }},"Хадгалах")));
    }else{
      wrap.append(h("div",{class:"row",style:"flex-wrap:wrap"},
        h("button",{class:"btn primary",disabled:SMSX.busy,onclick:function(){
          if(!S.smsConfirm){S.smsConfirm=true;env.toast("Дахин дарвал "+list.length+" дугаарт илгээнэ");return;}
          S.smsConfirm=false;smsSend(code,text);
        }},SMSX.busy?"⏳ Илгээж байна…":"📤 "+list.length+" эцэг эхэд илгээх"),
        h("button",{class:"btn ghost",onclick:function(){SMSX.edit=true;paint();}},"✏️ Дугаарууд")));
    }
    if(SMSX.res)wrap.append(h("div",{class:"fb",style:"margin-top:8px"},SMSX.res));
    box.append(wrap);
  }
  function viewRural(root,d){
    root.append(h("h3",{style:"margin:20px 0 6px"},"📻 Интернэтгүй сурагчдад"));
    root.append(h("p",{class:"muted small"},"Хөдөө, интернэтгүй сурагчдад өдрийн үгсийг SMS-ээр илгээх, радио эсвэл сургуулийн чанга яригчаар цацах богино аудио хичээл бэлтгэнэ."));
    var lang=d.c.lang||"en",sel=h("select",{class:"tin","aria-label":"Үгийн эх"});
    Object.keys(d.lists||{}).forEach(function(lid){sel.append(h("option",{value:"L:"+lid},"📝 "+d.lists[lid].name));});
    Object.keys(LVN).forEach(function(l){sel.append(h("option",{value:"V:"+l},"📚 Аппын "+LVN[l]+" үгс"));});
    if(RU.src)sel.value=RU.src;
    sel.addEventListener("change",function(){RU.src=sel.value;paint();});
    var cnt=h("select",{class:"tin","aria-label":"Үгийн тоо"});[3,5].forEach(function(n){var o=h("option",{value:String(n)},n+" үг");if(n===RU.n)o.selected=true;cnt.append(o);});
    cnt.addEventListener("change",function(){RU.n=parseInt(cnt.value,10);paint();});
    var box=h("div",{class:"note"},sel,cnt);root.append(box);
    var ws=ruWords(d);
    if(ws===null){box.append(h("p",{class:"muted small"},"Үгсийг ачаалж байна…"));env.loadLang(lang,paint);return;}
    if(!ws.length){box.append(h("p",{class:"muted small"},"Энэ эх сурвалжид үг алга."));return;}
    box.append(h("div",{class:"small",style:"margin:8px 0"},h("b",null,"Өнөөдрийн үгс: "),ws.map(function(p){return p[0]+" — "+ruShort(p[1]);}).join(" · ")));
    var sms=ruSms(d,ws),seg=Math.ceil(sms.length/67);
    box.append(h("div",{style:"background:var(--line);border-radius:12px;padding:10px;font-size:14px;margin-top:6px"},sms),
      h("div",{class:"muted small"},sms.length+" тэмдэгт · кирилл SMS ≈ "+seg+" мессеж"));
    box.append(h("div",{class:"row",style:"flex-wrap:wrap"},
      h("button",{class:"btn primary",onclick:function(){location.href="sms:?&body="+encodeURIComponent(sms);}},"📱 SMS бичих"),
      h("button",{class:"btn",onclick:function(){if(navigator.clipboard)navigator.clipboard.writeText(sms).then(function(){env.toast("Хуулагдлаа");});}},"📋 Хуулах")));
    viewSmsDirect(box,S.code,sms);
    box.append(h("div",{class:"row",style:"flex-wrap:wrap"},
      h("button",{class:"btn primary",disabled:RU.busy,onclick:function(){ruMp3(d,ws);}},RU.busy?"⏳ Аудио бэлдэж байна…":"🎧 Аудио хичээл (MP3, ~"+(ws.length>3?2:1.5)+" мин)"),
      h("button",{class:"btn",onclick:function(){ruDownload("salkhi-radio-"+new Date().toISOString().slice(0,10)+".txt",new Blob([ruText(d,ws)],{type:"text/plain;charset=utf-8"}));}},"📄 Радиогийн эх бичвэр")));
    if(RU.busy)box.append(h("div",{class:"muted small",id:"ruprog"},RU.prog));
    box.append(h("p",{class:"muted small",style:"margin-top:8px"},"💡 MP3-ыг радио станцад өгөх, сургуулийн чанга яригчаар тоглуулах, эсвэл мессенжерээр эцэг эхчүүдэд илгээж болно. Өдөр бүр шинэ үгс автоматаар сонгогдоно."));
  }
  function viewTeacher(root,d){
    var code=S.code,ids=sortedTasks(d),mem=d.members||{},stats=d.stats||{},uids=Object.keys(mem);
    root.append(h("h2",null,"👩‍🏫 "+d.c.name));
    root.append(h("p",{class:"muted"},LANGS[d.c.lang||"en"]+" хэл · "+uids.length+" сурагч"));
    var link=location.href.split("#")[0];
    root.append(h("div",{class:"note",style:"text-align:center"},
      h("div",{class:"muted small"},"Сурагчид энэ кодоор нэгдэнэ (Профайл → 🏫 Анги)"),
      h("div",{style:"font-size:38px;font-weight:800;letter-spacing:6px;margin:4px 0"},code),
      h("button",{class:"btn primary",onclick:function(){
        var t="Салхи аппад «"+d.c.name+"» ангид нэгдээрэй! Профайл → 🏫 Анги → код: "+code+"\n"+link;
        if(navigator.share)navigator.share({title:"Салхи анги",text:t}).catch(function(){});
        else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){env.toast("Хуулагдлаа");});
        else env.toast(t,8000);
      }},"📤 Код илгээх")));
    /* үгсийн жагсаалт */
    var lids=Object.keys(d.lists||{}).sort(function(a,b){return (d.lists[a].ts||0)-(d.lists[b].ts||0);});
    root.append(h("h3",{style:"margin:18px 0 6px"},"📝 Үгсийн жагсаалт"));
    if(!lids.length&&S.form!=="list")root.append(h("p",{class:"muted small"},"Сурах бичгийн бүлэг бүрийн үгсийг оруулж, ангидаа даалгавар болгон өгөөрэй."));
    lids.forEach(function(lid){
      var L=d.lists[lid];
      if(S.form==="list:"+lid)return listEditor(root,d,lid);
      root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},"📝 "+L.name,h("div",{class:"muted small"},(L.n||parseList(L).length)+" үг")),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Засах",onclick:function(){S.form="list:"+lid;paint();}},"✏️"),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Устгах",onclick:function(){
          if(S.rmList!==lid){S.rmList=lid;env.toast("Дахин дарвал «"+L.name+"» устгагдана");return;}
          S.rmList=null;run(db.ref("wlists/"+code+"/"+lid).remove(),function(){S.data=null;});
        }},"🗑")));
    });
    if(S.form==="list")listEditor(root,d,null);
    else if(String(S.form).indexOf("list:")!==0)root.append(h("button",{class:"btn",style:"width:100%;margin-top:6px",onclick:function(){S.form="list";paint();}},"➕ Үгсийн жагсаалт нэмэх"));
    /* багшийн хичээл */
    var tls=Object.keys(d.lessons||{}).sort(function(a,b){return (d.lessons[a].ts||0)-(d.lessons[b].ts||0);});
    root.append(h("h3",{style:"margin:18px 0 6px"},"📘 Хичээл"));
    if(!tls.length&&S.form!=="lesson"&&S.form!=="pick")root.append(h("p",{class:"muted small"},"Аппын бэлэн дүрмийн хичээлүүдээс сонгоод ангидаа нэмээрэй."));
    tls.forEach(function(lid){
      var L=d.lessons[lid];
      if(S.form==="lesson:"+lid)return lessonEditor(root,d,lid);
      root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},L.lv&&LVN[L.lv]?h("span",{class:"lvtag",style:"margin-right:6px"},LVN[L.lv]):null,(L.ref?"":"✏️ ")+L.t),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Үзэх",onclick:function(){env.openLesson(code+":"+lid);}},"👁"),
        L.ref?null:h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Засах",onclick:function(){S.form="lesson:"+lid;paint();}},"✏️"),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Устгах",onclick:function(){
          if(S.rmLes!==lid){S.rmLes=lid;env.toast("Дахин дарвал «"+L.t+"» устгагдана");return;}
          S.rmLes=null;run(db.ref("tlessons/"+code+"/"+lid).remove(),function(){S.data=null;});
        }},"🗑")));
    });
    if(S.form==="pick")lessonPicker(root,d);
    else if(S.form==="lesson")lessonEditor(root,d,null);
    else if(String(S.form).indexOf("lesson:")!==0)root.append(h("div",{class:"row",style:"margin-top:6px"},
      h("button",{class:"btn primary",style:"flex:1",onclick:function(){S.form="pick";S.pq="";paint();}},"📚 Сангаас хичээл нэмэх"),
      h("button",{class:"btn ghost",style:"flex:none",onclick:function(){S.form="lesson";paint();}},"✏️ Өөрөө бичих")));
    /* даалгавар */
    root.append(h("h3",{style:"margin:18px 0 6px"},"📋 Даалгавар"));
    ids.forEach(function(tid){
      var t=d.tasks[tid],done=uids.filter(function(u){var s=stats[u];return s&&s.p&&s.p[tid]>=t.n;}).length;
      root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},taskLine(t),h("div",{class:"muted small"},"Биелүүлсэн: "+done+" / "+uids.length)),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Устгах",onclick:function(){
          run(db.ref("tasks/"+code+"/"+tid).remove(),function(){S.data=null;});
        }},"🗑")));
    });
    if(S.form==="task"){
      var kd=h("select",{class:"tin","aria-label":"Даалгаврын төрөл"});
      Object.keys(KINDS).forEach(function(k){if((k==="list"&&!lids.length)||(k==="tlesson"&&!tls.length))return;kd.append(h("option",{value:k},KINDS[k][0]+" "+KINDS[k][1]));});
      var n=h("input",{class:"tin",type:"number",min:"1",max:"10000",value:"100","aria-label":"Тоо"});
      var ls=h("select",{class:"tin","aria-label":"Жагсаалт",style:"display:none"});
      lids.forEach(function(lid){ls.append(h("option",{value:lid},d.lists[lid].name+" ("+(d.lists[lid].n||0)+" үг)"));});
      var tl=h("select",{class:"tin","aria-label":"Хичээл",style:"display:none"});
      tls.forEach(function(lid){tl.append(h("option",{value:lid},d.lessons[lid].t));});
      function lsSync(){
        ls.style.display=kd.value==="list"?"":"none";tl.style.display=kd.value==="tlesson"?"":"none";n.style.display=kd.value==="tlesson"?"none":"";
        if(kd.value==="list"){var L=d.lists[ls.value];n.value=L?L.n||parseList(L).length:10;}
        if(kd.value==="tlesson")n.value=1;
      }
      ls.addEventListener("change",lsSync);
      kd.addEventListener("change",function(){n.value={xp:100,lessons:5,words:30,days:7}[kd.value]||10;lsSync();});
      var tt=h("input",{class:"tin",placeholder:"Тайлбар (заавал биш)",maxlength:"60","aria-label":"Тайлбар"});
      var du=h("input",{class:"tin",type:"date","aria-label":"Дуусах огноо"});
      root.append(h("div",{class:"note",style:"margin-top:8px"},h("b",null,"➕ Шинэ даалгавар"),kd,ls,tl,
        h("div",{class:"muted small",style:"margin-top:8px"},"Хэмжээ"),n,tt,h("div",{class:"muted small",style:"margin-top:8px"},"Дуусах огноо (заавал биш)"),du,
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.form=null;paint();}},"Болих"),
          h("button",{class:"btn primary",disabled:busy,onclick:function(){
            var num=Math.max(1,Math.min(10000,parseInt(n.value,10)||0)),due=du.value?new Date(du.value+"T23:59:00").getTime():0;
            var t={k:kd.value,n:num,t:tt.value.trim().slice(0,60),due:due,ts:now()};
            if(kd.value==="list"){if(!ls.value){env.toast("Жагсаалт сонгоно уу");return;}t.lid=ls.value;if(!t.t)t.t="«"+d.lists[ls.value].name+"» цээжлэх";}
            if(kd.value==="tlesson"){if(!tl.value){env.toast("Хичээл сонгоно уу");return;}t.lid=tl.value;t.n=1;if(!t.t)t.t="«"+d.lessons[tl.value].t+"» хичээл давах";}
            run(db.ref("tasks/"+code).push(t),function(){S.form=null;S.data=null;});
          }},"Нэмэх"))));
    }else root.append(h("button",{class:"btn",style:"width:100%;margin-top:6px",onclick:function(){S.form="task";paint();}},"➕ Даалгавар өгөх"));
    /* рейтинг */
    root.append(h("h3",{style:"margin:20px 0 6px"},"🏆 7 хоногийн рейтинг"));
    root.append(h("div",{class:"srow"},h("span",{class:"small",style:"flex:1"},d.c.board?"Сурагчид ангийнхаа рейтингийг харж байна.":"Унтраалттай — сурагчид бие биеийнхээ XP-г харахгүй."),
      h("button",{class:"btn"+(d.c.board?"":" primary"),style:"flex:none",disabled:busy,onclick:function(){
        run(db.ref("classes/"+code+"/board").set(!d.c.board),function(){S.data=null;env.toast(d.c.board?"Рейтинг унтарлаа":"Рейтинг асаалаа 🏆");});
      }},d.c.board?"Унтраах":"Асаах")));
    if(d.c.board)boardView(root,d,false);
    /* сурагчид */
    root.append(h("h3",{style:"margin:20px 0 6px"},"👥 Сурагчдын явц"));
    if(!uids.length)root.append(h("p",{class:"muted small"},"Одоогоор сурагч нэгдээгүй байна. Кодоо сурагчдадаа илгээгээрэй."));
    else{
      var wrap=h("div",{style:"overflow-x:auto;margin:0 -4px"}),tb=h("table",{style:"border-collapse:collapse;width:100%;font-size:14px"});
      var th=function(t,title){return h("th",{style:"text-align:left;padding:6px;border-bottom:1px solid var(--line);white-space:nowrap",title:title||null},t);};
      var hr=h("tr",null,th("Сурагч"),th("7 хоног","7 хоногийн XP"),th("🔥"),th("Идэвх","Сүүлд идэвхтэй"));
      ids.forEach(function(tid,i){hr.append(th("#"+(i+1),taskLine(d.tasks[tid])));});
      hr.append(th(""));
      tb.append(hr);
      uids.sort(function(a,b){return ((stats[b]||{}).wxp||0)-((stats[a]||{}).wxp||0);}).forEach(function(u){
        var s=stats[u]||{},td=function(x,st){return h("td",{style:"padding:6px;border-bottom:1px solid var(--line);white-space:nowrap;"+(st||"")},x);};
        var tr=h("tr",null,td(h("b",null,mem[u].name||s.name||"?")),td(String(s.wxp||0)),td(String(s.streak||0)),td(ago(s.ts)));
        ids.forEach(function(tid){var t=d.tasks[tid],v=s.p&&s.p[tid]!=null?s.p[tid]:null;tr.append(td(v==null?"—":v>=t.n?"✅":v+"/"+t.n,v!=null&&v>=t.n?"color:var(--ok)":""));});
        tr.append(td(h("button",{class:"btn ghost",style:"padding:4px 8px","aria-label":"Ангиас хасах",onclick:function(){
          if(S.rm!==u){S.rm=u;env.toast("Дахин дарвал "+(mem[u].name||"сурагч")+" ангиас хасагдана");return;}
          S.rm=null;run(Promise.all([db.ref("members/"+code+"/"+u).remove(),db.ref("cstats/"+code+"/"+u).remove()]),function(){S.data=null;});
        }},"✕")));
        tb.append(tr);
      });
      wrap.append(tb);root.append(wrap);
      root.append(h("p",{class:"muted small"},"«—» = сурагч даалгаврыг хараахан нээгээгүй. Явц нь сурагч аппаа нээх бүрт шинэчлэгдэнэ."));
    }
    /* шууд тест */
    root.append(h("h3",{style:"margin:20px 0 6px"},"🎯 Шууд тест"));
    if(S.form==="live")liveSetup(root,d);
    else root.append(h("button",{class:"btn primary",style:"width:100%",onclick:function(){S.form="live";paint();}},"🎯 Ангийн шууд тест эхлүүлэх"));
    viewComps(root,d);
    viewRural(root,d);
    root.append(h("div",{class:"row",style:"flex-wrap:wrap"},
      h("button",{class:"btn",onclick:function(){S.data=null;paint();}},"🔄 Шинэчлэх"),
      uids.length?h("button",{class:"btn",onclick:function(){exportCsv(d);}},"📥 CSV татах"):null,
      h("button",{class:"btn ghost",onclick:function(){
        if(!S.confirm){S.confirm=true;env.toast("Дахин дарвал анги бүрмөсөн устгагдана");return;}
        S.confirm=false;run(deleteClass(code),function(){S.scr="home";S.code=null;});
      }},"🗑 Анги устгах")));
  }
  function exportCsv(d){
    var ids=sortedTasks(d),mem=d.members||{},stats=d.stats||{};
    var q=function(x){x=String(x==null?"":x);return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;};
    var rows=[["Нэр","Нийт XP","7 хоногийн XP","Дараалсан өдөр","Сүүлд идэвхтэй"].concat(ids.map(function(t,i){return "#"+(i+1)+" "+taskLine(d.tasks[t]);}))];
    Object.keys(mem).forEach(function(u){
      var s=stats[u]||{};
      rows.push([mem[u].name,s.xp||0,s.wxp||0,s.streak||0,s.ts?new Date(s.ts).toLocaleString():""].concat(ids.map(function(t){return s.p&&s.p[t]!=null?s.p[t]+"/"+d.tasks[t].n:"";})));
    });
    var b=new Blob(["﻿"+rows.map(function(r){return r.map(q).join(",");}).join("\n")],{type:"text/csv;charset=utf-8"});
    var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="salkhi-"+d.c.name.replace(/\s+/g,"_")+".csv";document.body.append(a);a.click();a.remove();
  }
  function viewClass(root){
    root.append(back(function(){err="";liveDetach();S.scr="home";S.code=null;S.data=null;S.form=null;S.confirm=false;paint();}));
    if(!S.data){
      if(err){
        /* багш хассан эсвэл анги устгагдсан бол жагсаалтаас хасах боломж өгнө */
        root.append(h("button",{class:"btn",onclick:function(){
          var code=S.code,m=my();delete m[code];setMy(m);err="";S.scr="home";S.code=null;
          connect().then(function(){return db.ref("mycls/"+uid+"/"+code).remove();}).catch(function(){});paint();
        }},"Жагсаалтаас хасах"));
        return;
      }
      root.append(h("p",{class:"muted"},"Ачаалж байна…"));
      if(!busy){busy=true;setTimeout(function(){busy=false;run(connect().then(function(){return loadClass(S.code);}),function(d){S.data=d;});},0);}
      return;
    }
    var role=(my()[S.code]||{}).role==="t"?"t":"s",lv=LV.code===S.code&&LV.v;
    liveAttach(S.code,role);
    if(role==="t")(lv?viewLiveTeacher:viewTeacher)(root,S.data);
    else if(lv&&(lv.st!=="end"||(LV.dismiss!==lv.ts&&LV.joined)))viewLiveStudent(root,S.data);
    else viewStudent(root,S.data);
  }
  window.Classes={
    view:function(e){
      env=e;h=e.h;var root=h("div");
      if(S.scr==="home"){
        root.append(h("button",{class:"back",onclick:function(){env.close();}},"‹ Профайл"));
        root.append(h("h2",null,"🏫 Анги"));
      }
      if(err)root.append(h("div",{class:"fb bad"},err));
      if(busy&&S.scr==="home")root.append(h("p",{class:"muted"},"Түр хүлээнэ үү…"));
      if(S.scr==="class"&&S.code)viewClass(root);else viewHome(root);
      if(S.scr==="home"&&!S.loaded){S.loaded=true;connect().then(refreshMine).then(paint).catch(function(){});}
      return root;
    },
    init:function(e){env=e;h=e.h;setTimeout(syncAll,6000);},
    touch:function(){if(env)touch();},
    detach:function(){if(LV.code)liveDetach();},
    count:function(){return env?Object.keys(my()).length:0;}
  };
})();
