/* Салхи: багш, ангийн горим — багш анги үүсгэж 6 оронтой код өгнө, сурагчид кодоор нэгдэнэ.
   Багш даалгавар (XP, хичээл, үг, өдөр дараалан) өгч, сурагч бүрийн явцыг харна.
   Firebase: classes/{code}, members/{code}/{uid}, tasks/{code}/{tid}, cstats/{code}/{uid}, mycls/{uid}/{code} */
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
    var o={};Object.keys(ls||{}).forEach(function(lid){var p=parseLesson(ls[lid]);p.lang=lang;p.cname=cname;p.ts=ls[lid].ts||0;o[lid]=p;});
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
    return Promise.all(["tasks/","members/","cstats/","wlists/","board/","tlessons/"].map(function(p){return db.ref(p+code).remove();})).then(function(){
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
    if(!tls.length&&S.form!=="lesson")root.append(h("p",{class:"muted small"},"Өөрийн дүрмийн хичээлийг тайлбар, жишээ, тестийн хамт бичиж ангидаа өгөөрэй."));
    tls.forEach(function(lid){
      var L=d.lessons[lid];
      if(S.form==="lesson:"+lid)return lessonEditor(root,d,lid);
      root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},"📘 "+L.t),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Үзэх",onclick:function(){env.openLesson(code+":"+lid);}},"👁"),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Засах",onclick:function(){S.form="lesson:"+lid;paint();}},"✏️"),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Устгах",onclick:function(){
          if(S.rmLes!==lid){S.rmLes=lid;env.toast("Дахин дарвал «"+L.t+"» устгагдана");return;}
          S.rmLes=null;run(db.ref("tlessons/"+code+"/"+lid).remove(),function(){S.data=null;});
        }},"🗑")));
    });
    if(S.form==="lesson")lessonEditor(root,d,null);
    else if(String(S.form).indexOf("lesson:")!==0)root.append(h("button",{class:"btn",style:"width:100%;margin-top:6px",onclick:function(){S.form="lesson";paint();}},"➕ Хичээл нэмэх"));
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
    root.append(back(function(){err="";S.scr="home";S.code=null;S.data=null;S.form=null;S.confirm=false;paint();}));
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
    if((my()[S.code]||{}).role==="t")viewTeacher(root,S.data);else viewStudent(root,S.data);
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
    count:function(){return env?Object.keys(my()).length:0;}
  };
})();
