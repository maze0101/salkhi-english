/* Салхи: хүмүүстэй харилцах хэсэг (найзууд, хамтрагчтай ярих, нээлттэй өрөө, үгийн сорилт).
   Firebase (нэвтрэлтгүй / anonymous) ашиглана. Тохиргоо: firebase-config.js */
(function(){
  var SDK="https://www.gstatic.com/firebasejs/10.12.2/";
  var env=null,root=null,db=null,uid=null,prof=null,screen="boot",sub="friends";
  var friendsData=[],listeners=[],msgCount=0,lastSend=0,chatWith=null,quiz=null,busy=false,info="";
  var BLOCK_KEY="salkhi:blocks",DONE_KEY="salkhi:chdone",BOARD_KEY="salkhi:board";

  function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
  function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function h(){return env.h.apply(null,arguments);}
  function cfg(){return window.SALKHI_FB&&window.SALKHI_FB.databaseURL?window.SALKHI_FB:null;}

  function loadScript(src){
    return new Promise(function(ok,fail){
      var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=function(){fail(new Error("load "+src));};
      document.head.appendChild(s);
    });
  }
  function loadSDK(){
    if(window.firebase&&window.firebase.database&&window.firebase.auth)return Promise.resolve();
    return loadScript(SDK+"firebase-app-compat.js").then(function(){return loadScript(SDK+"firebase-auth-compat.js");}).then(function(){return loadScript(SDK+"firebase-database-compat.js");});
  }
  function detach(){
    listeners.forEach(function(x){try{x[0].off(x[1],x[2]);}catch(e){}});listeners=[];
  }
  function listen(ref,ev,fn){ref.on(ev,fn);listeners.push([ref,ev,fn]);}

  function init(){
    if(!cfg()){screen="setup";paint();return;}
    if(db&&uid){enter();return;}
    screen="boot";paint();
    /* sync.js байвал Google-ээр нэвтэрсэн хэрэглэгчийг дахин ашиглана (эс бөгөөс нэргүй) */
    (window.SalkhiFB?window.SalkhiFB.user():loadSDK().then(function(){
      if(!firebase.apps.length)firebase.initializeApp(cfg());
      return firebase.auth().signInAnonymously().then(function(c){return c.user;});
    })).then(function(u){
      db=firebase.database();
      uid=u.uid;
      return db.ref("users/"+uid).once("value");
    }).then(function(snap){
      prof=snap.val();
      if(!prof){if(setScreen("name"))paint();return;}
      enter();
    }).catch(function(e){var m=String(e&&e.message?e.message:e);info=/configuration-not-found|admin-restricted|operation-not-allowed/.test(m)?"Firebase дээр Authentication → Anonymous асаагаагүй байна. ("+m+")":"Холбогдож чадсангүй: "+m;if(setScreen("error"))paint();});
  }
  function enter(){
    syncProfile();loadFriends();if(setScreen("home"))paint();
  }
  function me(){return env.me();}
  function syncProfile(){
    if(!db||!uid||!prof)return;
    var m=me();
    prof.xp=m.xp;prof.streak=m.streak;prof.lang=m.lang;prof.wxp=m.wxp;prof.wk=m.wk;
    db.ref("users/"+uid).update({xp:m.xp,streak:m.streak,lang:m.lang,wxp:m.wxp,wk:m.wk,ts:firebase.database.ServerValue.TIMESTAMP}).catch(function(){});
  }
  function randCode(){
    var a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",s="";
    for(var i=0;i<6;i++)s+=a.charAt(Math.floor(Math.random()*a.length));
    return s;
  }
  function createProfile(name,tries){
    tries=tries||0;
    var code=randCode();
    return db.ref("codes/"+code).transaction(function(cur){return cur===null?uid:undefined;}).then(function(res){
      if(!res.committed){if(tries>6)throw new Error("код үүсгэж чадсангүй");return createProfile(name,tries+1);}
      var m=me();
      prof={name:name,code:code,lang:m.lang,xp:m.xp,streak:m.streak,wxp:m.wxp,wk:m.wk};
      return db.ref("users/"+uid).set({name:name,code:code,lang:m.lang,xp:m.xp,streak:m.streak,wxp:m.wxp,wk:m.wk,ts:firebase.database.ServerValue.TIMESTAMP});
    });
  }
  function blocks(){return ls(BLOCK_KEY,[]);}
  function isBlocked(u){return blocks().indexOf(u)>=0;}

  /* ---------- friends ---------- */
  function loadFriends(){
    db.ref("friends/"+uid).once("value").then(function(snap){
      var ids=Object.keys(snap.val()||{});
      return Promise.all(ids.map(function(id){return db.ref("users/"+id).once("value").then(function(s){var v=s.val();return v?{uid:id,name:v.name,xp:v.xp||0,streak:v.streak||0,lang:v.lang||"",wxp:v.wxp||0,wk:v.wk||""}:null;});}));
    }).then(function(list){
      friendsData=list.filter(Boolean);
      if(screen==="home"&&sub==="friends")paint();
    }).catch(function(){});
  }
  function addFriend(code){
    code=String(code||"").trim().toUpperCase();
    if(code.length!==6){env.toast("Код 6 тэмдэгттэй байна");return;}
    if(prof&&code===prof.code){env.toast("Энэ таны өөрийн код");return;}
    db.ref("codes/"+code).once("value").then(function(s){
      var fid=s.val();
      if(!fid){env.toast("Ийм код олдсонгүй");return null;}
      return db.ref("friends/"+uid+"/"+fid).set(true).then(function(){env.toast("Найз нэмэгдлээ ✅");loadFriends();});
    }).catch(function(){env.toast("Алдаа гарлаа");});
  }
  function removeFriend(fid){
    if(!confirm("Найзын жагсаалтаас хасах уу?"))return;
    db.ref("friends/"+uid+"/"+fid).remove().then(loadFriends);
  }

  function viewFriends(){
    var box=h("div");
    var codeRow=h("div",{class:"note"},
      h("div",{class:"muted small"},"Таны найзын код (найздаа өг):"),
      h("div",{style:"font-size:28px;font-weight:800;letter-spacing:4px;margin:6px 0"},prof.code),
      h("button",{class:"btn",style:"padding:8px 14px",onclick:function(){
        var t="Салхи апп дээр намайг нэм. Миний код: "+prof.code+" "+(window.SITE_URL||"");
        if(navigator.share){navigator.share({text:t}).catch(function(){});}
        else if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){env.toast("Хуулагдлаа");});}
      }},"📤 Хуваалцах"));
    var inp=h("input",{class:"tin",type:"text",maxlength:"6",autocapitalize:"characters",autocomplete:"off",placeholder:"Найзын код (6 тэмдэгт)","aria-label":"Найзын код"});
    var add=h("button",{class:"btn primary",style:"margin-top:8px",onclick:function(){addFriend(inp.value);inp.value="";}},"➕ Найз нэмэх");
    /* долоо хоногийн XP нь зөвхөн энэ долоо хоногт шинэчлэгдсэн бол тооцогдоно; өмнөх долоо хоногийнх 0 */
    var wk=me().wk,week=ls(BOARD_KEY,"week")!=="all";
    function wx(r){return r.wk===wk?(r.wxp||0):0;}
    var rows=friendsData.slice();
    rows.push({uid:uid,name:prof.name+" (та)",xp:prof.xp||0,streak:prof.streak||0,lang:prof.lang,wxp:me().wxp,wk:wk,self:true});
    rows.sort(function(a,b){return week?(wx(b)-wx(a)||b.xp-a.xp):b.xp-a.xp;});
    var board=h("div",{style:"margin-top:14px"},
      h("div",{style:"display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px"},
        h("div",{style:"font-weight:700"},"🏆 Найзуудын жагсаалт"),
        h("div",{class:"seg",style:"margin:0"},
          h("button",{"aria-pressed":String(week),onclick:function(){lset(BOARD_KEY,"week");paint();}},"Энэ 7 хоног"),
          h("button",{"aria-pressed":String(!week),onclick:function(){lset(BOARD_KEY,"all");paint();}},"Нийт"))));
    rows.forEach(function(r,i){
      var line=h("div",{class:"note",style:"display:flex;align-items:center;gap:8px;margin-top:8px"},
        h("div",{style:"width:26px;font-weight:800"},String(i+1)),
        h("div",{style:"flex:1;min-width:0"},h("div",{style:"font-weight:700"},r.name),h("div",{class:"muted small"},"🔥 "+r.streak+" · "+(week?wx(r)+" XP энэ 7 хоногт · нийт "+r.xp:r.xp+" XP"))));
      if(!r.self){
        line.append(
          h("button",{class:"btn ghost",style:"padding:6px 10px",title:"Чат","aria-label":"Чат",onclick:function(){openChat(r);}},"💬"),
          h("button",{class:"btn ghost",style:"padding:6px 10px",title:"Шууд тулаан","aria-label":"Шууд тулаанд урих",onclick:function(){sendDuel(r);}},"⚔️"),
          h("button",{class:"btn ghost",style:"padding:6px 10px",title:"Үгийн сорилт","aria-label":"Сорилт илгээх",onclick:function(){sendChallenge(r);}},"🎯"),
          h("button",{class:"btn ghost",style:"padding:6px 10px",title:"Хасах","aria-label":"Хасах",onclick:function(){removeFriend(r.uid);}},"✖"));
      }
      board.append(line);
    });
    if(!friendsData.length)board.append(h("p",{class:"muted small"},"Найз алга. Дээрх кодоор найзаа нэм."));
    box.append(codeRow,inp,add,h("button",{class:"btn ghost",style:"margin-top:8px;width:100%",onclick:function(){syncProfile();loadFriends();goals.loaded=false;paint();}},"⟳ Шинэчлэх"),board,viewGoals());
    return box;
  }

  /* ---------- chat (friend / room) ---------- */
  function cleanText(t){
    t=String(t||"").replace(/\s+/g," ").trim();
    if(!t)return null;
    if(/https?:|www\.|\.com|\.mn/i.test(t))return "link";
    if(/\d[\d\s\-]{6,}\d/.test(t))return "phone";
    return t;
  }
  function chatUI(ref,opts){
    var wrap=h("div"),list=h("div",{style:"display:flex;flex-direction:column;gap:6px;min-height:200px;max-height:52vh;overflow:auto;padding:4px 2px"});
    var inp=h("input",{class:"tin",type:"text",maxlength:String(opts.max),autocomplete:"off",placeholder:"Мессеж бич...","aria-label":"Мессеж"});
    var seen={};
    function bubble(key,m){
      if(seen[key])return;seen[key]=1;
      if(m.uid!==uid&&isBlocked(m.uid))return;
      var mine=m.uid===uid;
      var b=h("div",{style:"align-self:"+(mine?"flex-end":"flex-start")+";max-width:86%;padding:8px 12px;border-radius:14px;background:"+(mine?"var(--accent,#3a7bd5)":"var(--surface)")+";color:"+(mine?"#fff":"var(--ink)")+";border:1px solid var(--line);word-break:break-word"},
        (opts.showName&&!mine)?h("div",{style:"font-size:12px;font-weight:700;opacity:.75"},m.name||"?"):null,
        h("div",null,String(m.text||"")));
      if(!mine)b.addEventListener("click",function(){msgMenu(key,m,opts.reportPath);});
      list.append(b);list.scrollTop=list.scrollHeight;
    }
    var q=ref.limitToLast(50);
    listen(q,"child_added",function(s){bubble(s.key,s.val()||{});});
    function send(){
      var t=cleanText(inp.value);
      if(t==="link"){env.toast("Холбоос илгээхийг хориглоно");return;}
      if(t==="phone"){env.toast("Утасны дугаар, хувийн мэдээлэл бүү бич");return;}
      if(!t)return;
      var now=Date.now();
      if(now-lastSend<2000){env.toast("Жаахан хүлээгээрэй");return;}
      lastSend=now;
      var msg={uid:uid,text:t.slice(0,opts.max),ts:firebase.database.ServerValue.TIMESTAMP};
      if(opts.showName)msg.name=prof.name;
      ref.push(msg).then(function(){if(opts.onSend)opts.onSend();}).catch(function(){env.toast("Илгээж чадсангүй");});
      inp.value="";
    }
    inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();send();}});
    wrap.append(list,h("div",{style:"display:flex;gap:8px;margin-top:8px"},inp,h("button",{class:"btn primary",style:"flex:none",onclick:send},"➤")));
    wrap.fill=function(t){inp.value=t;inp.focus();};
    return wrap;
  }
  function msgMenu(key,m,reportPath){
    var c=prompt("1 = Мэдэгдэх (зохисгүй агуулга)\n2 = Энэ хүнийг хаах\n(Хоосон үлдээвэл болих)","");
    if(c==="1"){
      db.ref("reports").push({by:uid,offender:m.uid,path:reportPath+"/"+key,text:String(m.text||"").slice(0,300),ts:firebase.database.ServerValue.TIMESTAMP}).then(function(){env.toast("Мэдэгдлээ. Баярлалаа 🙏");});
    }else if(c==="2"){
      var b=blocks();if(b.indexOf(m.uid)<0){b.push(m.uid);lset(BLOCK_KEY,b);}
      env.toast("Хаалаа");paint();
    }
  }
  function openChat(f){chatWith=f;screen="chat";paint();}
  function viewChat(){
    var f=chatWith,cid=[uid,f.uid].sort().join("_");
    var ref=db.ref("chats/"+cid);
    var box=h("div");
    box.append(h("button",{class:"btn ghost",style:"padding:6px 12px",onclick:function(){screen="home";sub=f.xch?"xch":"friends";paint();}},"‹ Буцах"),
      h("h3",{style:"margin:8px 0 2px"},"💬 "+f.name),
      h("p",{class:"muted small",style:"margin:0 0 8px"},"Хамтдаа ярьж дасгалла. Эхлэхийн тулд доорх сэдвээс сонго."));
    var ui=chatUI(ref,{max:300,showName:false,reportPath:"chats/"+cid,onSend:f.xch?function(){db.ref("xchin/"+f.uid+"/"+uid).set({name:prof.name,ts:TS()}).catch(function(){});}:null});
    var sel=h("select",{class:"tin","aria-label":"Сэдэв",style:"font-size:15px"});
    sel.append(h("option",{value:""},"🎯 Ярианы сэдэв сонгох..."));
    var scripts=env.scripts(me().lang)||{};
    env.scenes().forEach(function(s){if(scripts[s[0]]&&env.sceneOk(s))sel.append(h("option",{value:s[0]},s[1]));});
    var hints=h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin:8px 0"});
    sel.addEventListener("change",function(){
      hints.textContent="";
      var arr=scripts[sel.value]||[];
      arr.forEach(function(p){
        [p[0],p[1]].forEach(function(t){hints.append(h("button",{class:"chip",style:"font-size:13px",onclick:function(){ui.fill(String(t).replace(/\s*\([^)]*\)/g,""));}},String(t).replace(/\s*\([^)]*\)/g,"")));});
      });
    });
    box.append(sel,hints,ui);
    return box;
  }
  function viewRoom(){
    var lang=me().lang;
    var box=h("div");
    if(me().mode==="kid"||me().mode==="senior"){box.append(h("p",{class:"note"},"Нээлттэй өрөө зөвхөн «Том хүн» горимд байна."));return box;}
    var ref=db.ref("rooms/"+lang);
    box.append(h("div",{class:"note",style:"margin-top:0"},"🌐 Нээлттэй өрөө ("+lang.toUpperCase()+"). Хүндэтгэлтэй бай. Утас, хаяг, хувийн мэдээлэл бүү бич. Зохисгүй зурвас дээр дарж мэдэгдэх эсвэл тухайн хүнийг хаана уу."));
    box.append(chatUI(ref,{max:200,showName:true,reportPath:"rooms/"+lang}));
    return box;
  }

  /* ---------- challenges ---------- */
  function pickWords(){
    var p=env.pool().filter(function(w){return w[2]&&w[2].length<40;});
    var out=[],used={};
    while(out.length<10&&p.length>out.length&&out.length<p.length){
      var w=p[Math.floor(Math.random()*p.length)];
      if(used[w[1]])continue;used[w[1]]=1;out.push([w[1],w[2]]);
    }
    return out;
  }
  function sendChallenge(f){
    var words=pickWords();
    if(words.length<4){env.toast("Сорилтод үг хүрэлцэхгүй байна");return;}
    db.ref("challenges/"+f.uid).push({from:uid,fromName:prof.name,lang:me().lang,words:words,ts:firebase.database.ServerValue.TIMESTAMP}).then(function(){
      env.toast("🎯 "+f.name+"-д сорилт илгээлээ");
    }).catch(function(){env.toast("Илгээж чадсангүй");});
  }
  var inbox={items:[],results:[],loaded:false};
  function loadInbox(){
    Promise.all([db.ref("challenges/"+uid).once("value"),db.ref("results/"+uid).once("value"),db.ref("duelinv/"+uid).once("value").catch(function(){return {val:function(){return null;}};})]).then(function(r){
      var a=r[0].val()||{},b=r[1].val()||{},dv=r[2].val()||{};
      inbox.duels=Object.keys(dv).map(function(k){var v=dv[k];v.id=k;return v;}).filter(function(x){return !isBlocked(x.from)&&Date.now()-(x.ts||0)<86400000;}).sort(function(x,y){return (y.ts||0)-(x.ts||0);});
      inbox.items=Object.keys(a).map(function(k){var v=a[k];v.id=k;return v;}).sort(function(x,y){return (y.ts||0)-(x.ts||0);}).slice(0,20);
      inbox.results=Object.keys(b).map(function(k){return b[k];}).sort(function(x,y){return (y.ts||0)-(x.ts||0);}).slice(0,20);
      inbox.loaded=true;if(screen==="home"&&sub==="inbox")paint();
    }).catch(function(){inbox.loaded=true;paint();});
  }
  function viewInbox(){
    var box=h("div"),done=ls(DONE_KEY,{});
    if(!inbox.loaded){loadInbox();box.append(h("p",{class:"muted"},"Ачаалж байна..."));return box;}
    box.append(h("button",{class:"btn ghost",style:"padding:6px 12px",onclick:function(){inbox.loaded=false;paint();}},"⟳ Шинэчлэх"));
    (inbox.duels||[]).forEach(function(x){
      box.append(h("div",{class:"note",style:"display:flex;align-items:center;gap:8px;margin-top:10px;border-color:#E07A2F"},
        h("div",{style:"flex:1"},h("div",{style:"font-weight:700"},"⚔️ "+x.fromName),h("div",{class:"muted small"},"Шууд тулаанд урьж байна")),
        h("button",{class:"btn ghost",style:"padding:8px 10px","aria-label":"Татгалзах",onclick:function(){db.ref("duelinv/"+uid+"/"+x.id).remove().catch(function(){});inbox.duels=inbox.duels.filter(function(y){return y!==x;});paint();}},"✖"),
        h("button",{class:"btn primary",style:"padding:8px 14px",onclick:function(){acceptDuel(x);}},"Тулалдах")));
    });
    box.append(h("div",{style:"font-weight:700;margin:12px 0 6px"},"🎯 Ирсэн сорилтууд"));
    var pend=inbox.items.filter(function(x){return !done[x.id]&&!isBlocked(x.from);});
    if(!pend.length)box.append(h("p",{class:"muted small"},"Шинэ сорилт алга."));
    pend.forEach(function(x){
      box.append(h("div",{class:"note",style:"display:flex;align-items:center;gap:8px"},
        h("div",{style:"flex:1"},h("div",{style:"font-weight:700"},x.fromName+" · "+(x.lang||"").toUpperCase()),h("div",{class:"muted small"},(x.words||[]).length+" үг")),
        h("button",{class:"btn primary",style:"padding:8px 14px",onclick:function(){startQuiz(x);}},"Эхлэх")));
    });
    box.append(h("div",{style:"font-weight:700;margin:14px 0 6px"},"📊 Таны сорилтын дүн"));
    if(!inbox.results.length)box.append(h("p",{class:"muted small"},"Одоогоор дүн ирээгүй."));
    inbox.results.forEach(function(r){box.append(h("div",{class:"note"},(r.byName||"?")+": "+r.score+" / "+r.total));});
    return box;
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function startQuiz(x){
    var words=Object.keys(x.words||{}).map(function(k){return x.words[k];});
    quiz={ch:x,qs:shuffle(words),i:0,score:0,picked:null,opts:null};
    screen="quiz";paint();
  }
  function viewQuiz(){
    var q=quiz,box=h("div");
    if(q.i>=q.qs.length){
      var done=ls(DONE_KEY,{});done[q.ch.id]=1;lset(DONE_KEY,done);
      db.ref("results/"+q.ch.from).push({by:uid,byName:prof.name,score:q.score,total:q.qs.length,ts:firebase.database.ServerValue.TIMESTAMP}).catch(function(){});
      box.append(h("h3",null,"Дууслаа! "+q.score+" / "+q.qs.length),h("p",{class:"muted"},"Дүнг "+q.ch.fromName+"-д илгээлээ."),
        h("button",{class:"btn primary",onclick:function(){quiz=null;screen="home";sub="inbox";inbox.loaded=false;paint();}},"Буцах"));
      return box;
    }
    var cur=q.qs[q.i];
    if(!q.opts){
      var others=shuffle(q.qs.filter(function(w){return w[1]!==cur[1];})).slice(0,2).map(function(w){return w[1];});
      q.opts=shuffle([cur[1]].concat(others));
    }
    box.append(h("p",{class:"muted small"},"Сорилт "+q.ch.fromName+" · "+(q.i+1)+" / "+q.qs.length),h("div",{class:"q",style:"font-size:28px;margin:10px 0"},cur[0]));
    q.opts.forEach(function(o){
      var cls="opt";if(q.picked!=null){if(o===cur[1])cls+=" ok";else if(o===q.picked)cls+=" bad";}
      box.append(h("button",{class:cls,disabled:q.picked!=null,onclick:function(){q.picked=o;if(o===cur[1])q.score++;paint();}},o));
    });
    if(q.picked!=null)box.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){q.i++;q.picked=null;q.opts=null;paint();}},q.i+1<q.qs.length?"Дараагийн":"Дүн харах")));
    return box;
  }

  /* ---------- AI найзууд (бот) ---------- */
  var BOTS={
    en:[
      {id:"emma",name:"Emma",bio:"Лондонд амьдардаг оюутан. Аялал, кино, хоол хийх дуртай.",persona:"Emma, a cheerful university student from London who loves travel, films and cooking",scene:"free"},
      {id:"jack",name:"Jack",bio:"Манчестерийн кафены тогооч. Хоол, кофены тухай ярих дуртай.",persona:"Jack, a friendly café chef from Manchester who loves talking about food and coffee",scene:"cafe"}
    ],
    zh:[
      {id:"lin",name:"林 (Lín)",bio:"Бээжингийн оюутан. Хөгжим, цай, аялал сонирхдог.",persona:"Lin, a friendly student from Beijing who likes music, tea and travel",scene:"free"},
      {id:"wei",name:"伟 (Wěi)",bio:"Шанхайн инженер. Хөл бөмбөг, технологи сонирхдог.",persona:"Wei, a friendly engineer from Shanghai who likes football and technology",scene:"free"}
    ],
    ru:[
      {id:"anya",name:"Аня (Anya)",bio:"Санкт-Петербургийн оюутан. Ном, балет дуртай.",persona:"Anya, a friendly student from Saint Petersburg who loves books and ballet",scene:"free"},
      {id:"ivan",name:"Иван (Ivan)",bio:"Казаны инженер. Хоккей, хоол хийх дуртай.",persona:"Ivan, a friendly engineer from Kazan who loves hockey and cooking",scene:"free"}
    ],
    de:[
      {id:"lena",name:"Lena",bio:"Берлиний оюутан. Хөгжим, дугуй унах дуртай.",persona:"Lena, a friendly student from Berlin who loves music and cycling",scene:"free"},
      {id:"max",name:"Max",bio:"Мюнхений багш. Явган аялал, хөл бөмбөг дуртай.",persona:"Max, a friendly teacher from Munich who loves hiking and football",scene:"free"}
    ],
    ja:[
      {id:"yuki",name:"ゆき (Yuki)",bio:"Токиогийн оюутан. Аниме, хоол, аялал дуртай.",persona:"Yuki, a friendly university student from Tokyo who loves anime, food and travel",scene:"free"},
      {id:"ken",name:"けん (Ken)",bio:"Осакагийн оффисын ажилтан. Бейсбол, рамен дуртай.",persona:"Ken, a friendly office worker from Osaka who loves baseball and ramen",scene:"free"}
    ],
    ko:[
      {id:"minji",name:"민지 (Min-ji)",bio:"Сөүлийн оюутан. K-pop, кафе дуртай.",persona:"Min-ji, a friendly student from Seoul who loves K-pop and cafés",scene:"free"},
      {id:"jun",name:"준 (Jun)",bio:"Бусаны дизайнер. Кино, явган аялал дуртай.",persona:"Jun, a friendly designer from Busan who loves movies and hiking",scene:"free"}
    ]
  };
  var bc=null,botBack="home",pending=null;
  /* ---------- ⚔️ шууд тулаан: хоёулаа ижил асуултад зэрэг хариулж, бие биеийнхээ явцыг шууд харна ----------
     duels/{id}: {a,an,b,bn,lang,qs(JSON),st:wait|go,t0,ts,p:{uid:{i,s,d}}}; duelinv/{to}/{id}: {from,fromName,ts} */
  var duel=null,duelRef=null;
  function TS(){return firebase.database.ServerValue.TIMESTAMP;}
  function duelOff(){if(duelRef){duelRef.off();duelRef=null;}}
  function makeDuelQs(){
    var words=pickWords();if(words.length<4)return null;
    return words.map(function(w){
      var others=shuffle(words.filter(function(x){return x[1]!==w[1];})).slice(0,3).map(function(x){return x[1];});
      return [w[0],shuffle([w[1]].concat(others)),w[1]];
    });
  }
  function sendDuel(f){
    var qs=makeDuelQs();if(!qs){env.toast("Тулаанд үг хүрэлцэхгүй байна");return;}
    var ref=db.ref("duels").push();
    ref.set({a:uid,an:prof.name,b:f.uid,bn:f.name,lang:me().lang,qs:JSON.stringify(qs),st:"wait",ts:TS()}).then(function(){
      return db.ref("duelinv/"+f.uid+"/"+ref.key).set({from:uid,fromName:prof.name,ts:TS()});
    }).then(function(){openDuel(ref.key);}).catch(function(){env.toast("Илгээж чадсангүй");});
  }
  function openDuel(id){
    duelOff();if(!duel||duel.id!==id)duel={id:id,v:null,qs:null,i:0,s:0,picked:null};screen="duel";
    duelRef=db.ref("duels/"+id);
    duelRef.on("value",function(s){
      if(!duel||duel.id!==id)return;
      var v=s.val();duel.v=v;
      if(v&&!duel.qs){try{duel.qs=JSON.parse(v.qs);}catch(e){duel.qs=[];}var p=v.p&&v.p[uid];if(p){duel.i=p.i||0;duel.s=p.s||0;}}
      if(screen==="duel")paint();
    },function(){if(duel&&duel.id===id){duel.v=false;if(screen==="duel")paint();}});
    paint();
  }
  function closeDuel(){duelOff();duel=null;screen="home";sub="inbox";inbox.loaded=false;paint();}
  function acceptDuel(x){
    db.ref("duels/"+x.id).update({st:"go",t0:TS()}).then(function(){
      db.ref("duelinv/"+uid+"/"+x.id).remove().catch(function(){});openDuel(x.id);
    }).catch(function(){env.toast("Тулаан дууссан эсвэл цуцлагдсан байна");db.ref("duelinv/"+uid+"/"+x.id).remove().catch(function(){});inbox.loaded=false;paint();});
  }
  function duelBar(name,p,n,mine){
    var i=p&&p.i||0;
    return h("div",{style:"margin:6px 0"},
      h("div",{style:"display:flex;justify-content:space-between;font-weight:700"},h("span",null,(mine?"🙋 ":"⚔️ ")+name),h("span",null,(p&&p.s||0)+" оноо")),
      h("div",{style:"height:12px;border-radius:8px;background:var(--line);overflow:hidden;margin-top:4px"},h("i",{style:"display:block;height:100%;width:"+Math.round(i/n*100)+"%;background:"+(mine?"var(--accent,#3a7bd5)":"#E07A2F")})),
      h("div",{class:"muted small"},(p&&p.d?"✅ Дууссан":i+" / "+n)));
  }
  function viewDuel(){
    var d=duel,v=d.v,box=h("div");
    box.append(h("button",{class:"btn ghost",style:"padding:6px 12px",onclick:function(){
      if(v&&v.st==="wait"&&v.a===uid){db.ref("duelinv/"+v.b+"/"+d.id).remove().catch(function(){});db.ref("duels/"+d.id).remove().catch(function(){});}
      closeDuel();
    }},v&&v.st==="wait"&&v.a===uid?"✖ Цуцлах":"‹ Буцах"));
    box.append(h("h3",{style:"margin:8px 0"},"⚔️ Шууд тулаан"));
    if(v===null){box.append(h("p",{class:"muted"},"Ачаалж байна..."));return box;}
    if(!v){box.append(h("p",{class:"note"},"Тулаан цуцлагдсан байна."));return box;}
    var oppId=v.a===uid?v.b:v.a,opp=v.a===uid?v.bn:v.an,n=(d.qs||[]).length,P=v.p||{};
    if(v.st==="wait"){
      box.append(h("div",{style:"text-align:center;font-size:48px;margin:12px 0"},"⏳"),h("p",{style:"text-align:center;font-weight:700"},opp+" тулаанд орохыг хүлээж байна…"),
        h("p",{class:"muted small",style:"text-align:center"},"Найз тань «🎯 Сорилт» хэсгээс урилгаа хүлээж авмагц эхэлнэ."));
      return box;
    }
    box.append(duelBar(prof.name+" (та)",{i:d.i,s:d.s,d:P[uid]&&P[uid].d},n,true),duelBar(opp,P[oppId],n,false));
    if(d.i>=n){
      var o=P[oppId]||{},mine=d.s,their=o.s||0,both=o.d;
      var res=!both?"⏳ "+opp+" дуусгахыг хүлээж байна…":mine>their?"🏆 Та яллаа!":mine<their?"💪 "+opp+" яллаа. Дараагийн удаа!":(P[uid].d<=o.d?"🏆 Тэнцсэн ч та түрүүлж дууссан!":"🤝 Тэнцлээ!");
      box.append(h("div",{class:"note",style:"text-align:center;font-size:20px;font-weight:800;margin-top:14px"},res));
      if(both&&!d.rewarded){d.rewarded=true;env.reward&&env.reward();}
      box.append(h("button",{class:"btn primary",style:"width:100%;margin-top:10px",onclick:function(){var f={uid:oppId,name:opp};closeDuel();sendDuel(f);}},"🔁 Дахин тулалдах"));
      return box;
    }
    var q=d.qs[d.i];
    box.append(h("p",{class:"muted small",style:"margin-top:12px"},"Асуулт "+(d.i+1)+" / "+n+" · утгыг нь хамгийн түрүүнд ол!"),h("div",{class:"q",style:"font-size:28px;margin:6px 0 10px;font-weight:800"},q[0]));
    q[1].forEach(function(o){
      var cls="opt";if(d.picked!=null){if(o===q[2])cls+=" ok";else if(o===d.picked)cls+=" bad";}
      box.append(h("button",{class:cls,disabled:d.picked!=null,onclick:function(){
        d.picked=o;if(o===q[2])d.s+=10;paint();
        setTimeout(function(){
          d.i++;d.picked=null;var p={i:d.i,s:d.s};if(d.i>=n)p.d=TS();
          db.ref("duels/"+d.id+"/p/"+uid).set(p).catch(function(){});
          if(screen==="duel")paint();
        },o===q[2]?500:1100);
      }},o));
    });
    return box;
  }

  /* ---------- 🎯 бүлгийн зорилго: найзуудтайгаа нийлж 7 хоногт тодорхой XP цуглуулах ----------
     goals/{code}: {name,owner,target,ts,m:{uid:{name,wxp,wk}}} */
  var GOALS_KEY="salkhi:goals",goals={data:{},loaded:false,form:false};
  function myGoals(){return ls(GOALS_KEY,[]);}
  function loadGoals(){
    var ids=myGoals(),m=me();goals.loaded=true;
    Promise.all(ids.map(function(g){
      return db.ref("goals/"+g+"/m/"+uid).set({name:prof.name,wxp:m.wxp,wk:m.wk}).catch(function(){}).then(function(){return db.ref("goals/"+g).once("value");}).then(function(s){goals.data[g]=s.val();},function(){goals.data[g]=null;});
    })).then(function(){if(screen==="home"&&sub==="friends")paint();});
  }
  function createGoal(name,target,tries){
    tries=tries||0;var code=randCode();
    return db.ref("goals/"+code).transaction(function(cur){return cur===null?{name:name,owner:uid,target:target,ts:Date.now()}:undefined;}).then(function(r){
      if(!r.committed){if(tries>6)throw new Error("code");return createGoal(name,target,tries+1);}
      var l=myGoals();l.push(code);lset(GOALS_KEY,l);goals.loaded=false;return code;
    });
  }
  function joinGoal(code){
    code=String(code||"").trim().toUpperCase();if(code.length!==6){env.toast("Код 6 тэмдэгттэй");return;}
    db.ref("goals/"+code).once("value").then(function(s){
      if(!s.val()){env.toast("Ийм бүлэг олдсонгүй");return;}
      var l=myGoals();if(l.indexOf(code)<0){l.push(code);lset(GOALS_KEY,l);}goals.loaded=false;env.toast("Бүлэгт нэгдлээ 🎯");paint();
    }).catch(function(){env.toast("Алдаа гарлаа");});
  }
  function leaveGoal(code){
    if(!confirm("Бүлгээс гарах уу?"))return;
    db.ref("goals/"+code+"/m/"+uid).remove().catch(function(){});
    lset(GOALS_KEY,myGoals().filter(function(x){return x!==code;}));delete goals.data[code];paint();
  }
  function viewGoals(){
    var box=h("div",{style:"margin-top:18px"}),wk=me().wk;
    box.append(h("div",{style:"font-weight:700;margin-bottom:6px"},"🎯 Бүлгийн зорилго"));
    if(!goals.loaded){loadGoals();}
    myGoals().forEach(function(code){
      var g=goals.data[code];if(g===undefined){box.append(h("p",{class:"muted small"},"Ачаалж байна..."));return;}
      if(!g){box.append(h("div",{class:"note"},code+" — бүлэг устгагдсан ",h("button",{class:"btn ghost",style:"padding:4px 10px",onclick:function(){leaveGoal(code);}},"✖")));return;}
      var ms=g.m||{},ids=Object.keys(ms),sum=0;
      ids.forEach(function(u){if(ms[u].wk===wk)sum+=ms[u].wxp||0;});
      var pc=Math.min(100,Math.round(sum/g.target*100));
      var card=h("div",{class:"note",style:"margin-top:8px"},
        h("div",{style:"display:flex;justify-content:space-between;gap:8px"},h("b",null,g.name),h("span",{class:"muted small"},"Код: "+code)),
        h("div",{style:"height:14px;border-radius:8px;background:var(--line);overflow:hidden;margin:8px 0 4px"},h("i",{style:"display:block;height:100%;width:"+pc+"%;background:"+(pc>=100?"var(--ok,#2A8C5A)":"var(--accent,#3a7bd5)")})),
        h("div",{class:"small"},(pc>=100?"🎉 Зорилгоо биелүүллээ! ":"")+sum+" / "+g.target+" XP энэ 7 хоногт"));
      ids.sort(function(a,b){return (ms[b].wk===wk?ms[b].wxp:0)-(ms[a].wk===wk?ms[a].wxp:0);}).forEach(function(u){
        card.append(h("div",{class:"muted small",style:"display:flex;justify-content:space-between"},h("span",null,ms[u].name+(u===uid?" (та)":"")),h("span",null,(ms[u].wk===wk?ms[u].wxp||0:0)+" XP")));
      });
      card.append(h("div",{style:"display:flex;gap:8px;margin-top:8px"},
        h("button",{class:"btn",style:"padding:6px 12px",onclick:function(){
          var t="Салхи апп дээр «"+g.name+"» бүлэгт нэгдээрэй: 7 хоногт хамтдаа "+g.target+" XP! Найз → Бүлгийн зорилго → код: "+code;
          if(navigator.share)navigator.share({text:t}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){env.toast("Хуулагдлаа");});
        }},"📤 Урих"),
        h("button",{class:"btn ghost",style:"padding:6px 12px",onclick:function(){leaveGoal(code);}},"Гарах")));
      box.append(card);
    });
    if(goals.form){
      var nm=h("input",{class:"tin",maxlength:"30",placeholder:"Бүлгийн нэр (ж: Англи хэлний найзууд)","aria-label":"Бүлгийн нэр"});
      var tg=h("select",{class:"tin","aria-label":"Зорилго"});[500,1000,2000,5000].forEach(function(n){var o=h("option",{value:String(n)},"7 хоногт "+n+" XP");if(n===2000)o.selected=true;tg.append(o);});
      box.append(h("div",{class:"note",style:"margin-top:8px"},h("b",null,"Шинэ бүлэг"),nm,tg,h("div",{style:"display:flex;gap:8px;margin-top:8px"},
        h("button",{class:"btn",onclick:function(){goals.form=false;paint();}},"Болих"),
        h("button",{class:"btn primary",onclick:function(){
          var n=nm.value.trim().slice(0,30);if(!n){env.toast("Нэр бичнэ үү");return;}
          createGoal(n,parseInt(tg.value,10)).then(function(){goals.form=false;paint();}).catch(function(){env.toast("Алдаа гарлаа");});
        }},"Үүсгэх"))));
    }else{
      var ci=h("input",{class:"tin",maxlength:"6",autocapitalize:"characters",placeholder:"Бүлгийн код","aria-label":"Бүлгийн код",style:"flex:1;margin:0"});
      box.append(h("div",{style:"display:flex;gap:8px;margin-top:8px"},ci,h("button",{class:"btn",style:"flex:none",onclick:function(){joinGoal(ci.value);}},"Нэгдэх")),
        h("button",{class:"btn ghost",style:"width:100%;margin-top:8px",onclick:function(){goals.form=true;paint();}},"➕ Бүлгийн зорилго үүсгэх"));
    }
    return box;
  }

  /* ---------- 🔁 хэлний солилцоо: монгол хэл сурч буй гадаад хүнтэй хосолж, бие биедээ туслана ----------
     xch/{uid}: {name,nat,learn,ts} — nat: эх хэл, learn: сурч буй хэл (mn = монгол) */
  var xch={list:null,on:null};
  var XLANG={en:"Англи",ja:"Япон",ko:"Солонгос",zh:"Хятад",ru:"Орос",de:"Герман"};
  function loadXch(){
    xch.list=[];
    Promise.all([db.ref("xch").orderByChild("ts").limitToLast(200).once("value"),db.ref("xch/"+uid).once("value"),db.ref("xchin/"+uid).once("value").catch(function(){return {val:function(){return null;}};})]).then(function(r){
      var v=r[0].val()||{},L=me().lang,old=Date.now()-30*86400000,inb=r[2].val()||{};
      xch.on=!!r[1].val();
      xch.inbox=Object.keys(inb).filter(function(k){return !isBlocked(k);}).map(function(k){return {uid:k,name:inb[k].name,ts:inb[k].ts,xch:true};}).sort(function(a,b){return b.ts-a.ts;});
      xch.list=Object.keys(v).filter(function(k){var x=v[k];return k!==uid&&x.nat===L&&x.learn==="mn"&&(x.ts||0)>old&&!isBlocked(k);})
        .map(function(k){return {uid:k,name:v[k].name,ts:v[k].ts,xch:true};}).sort(function(a,b){return b.ts-a.ts;});
      if(screen==="home"&&sub==="xch")paint();
    }).catch(function(){xch.list=[];xch.err=true;paint();});
  }
  function viewXch(){
    var box=h("div"),L=me().lang;
    if(me().mode==="kid"||me().mode==="senior"){box.append(h("p",{class:"note"},"Хэлний солилцоо зөвхөн «Том хүн» горимд байна."));return box;}
    box.append(h("div",{class:"note",style:"margin-top:0"},"🔁 Монгол хэл сурч буй "+XLANG[L]+" хэлтэй хүнтэй чатлаарай: та түүнд монголоор, тэр танд "+XLANG[L].toLowerCase()+" хэлээр тусална. Утас, хаяг, хувийн мэдээлэл бүү бич."));
    if(xch.list===null){loadXch();box.append(h("p",{class:"muted"},"Ачаалж байна..."));return box;}
    box.append(h("div",{style:"display:flex;gap:8px;align-items:center;margin:10px 0"},
      h("div",{style:"flex:1"},h("b",null,xch.on?"✅ Та жагсаалтад харагдаж байна":"Намайг жагсаалтад харуулах"),h("div",{class:"muted small"},"Монгол хэл сурч буй гадаад хүмүүс таныг олж, бичих боломжтой болно.")),
      h("button",{class:"btn"+(xch.on?"":" primary"),style:"flex:none",onclick:function(){
        var p=xch.on?db.ref("xch/"+uid).remove():db.ref("xch/"+uid).set({name:prof.name,nat:"mn",learn:L,ts:TS()});
        p.then(function(){xch.on=!xch.on;paint();}).catch(function(){env.toast("Алдаа гарлаа");});
      }},xch.on?"Нуух":"Харуулах")));
    if(xch.inbox&&xch.inbox.length){
      box.append(h("div",{style:"font-weight:700;margin:12px 0 6px"},"📨 Танд бичсэн хүмүүс"));
      xch.inbox.forEach(function(x){
        box.append(h("div",{class:"note",style:"display:flex;align-items:center;gap:8px;margin-top:8px"},
          h("div",{style:"flex:1"},h("div",{style:"font-weight:700"},x.name),h("div",{class:"muted small"},new Date(x.ts).toLocaleString())),
          h("button",{class:"btn primary",style:"padding:8px 14px",onclick:function(){openChat(x);}},"💬 Хариулах")));
      });
    }
    box.append(h("div",{style:"font-weight:700;margin:12px 0 6px"},"🌍 Монгол хэл сурч буй "+XLANG[L]+" хэлтнүүд"));
    if(!xch.list.length)box.append(h("p",{class:"muted small"},xch.err?"Ачаалж чадсангүй.":"Одоогоор хүн алга. Удахгүй нэмэгдэнэ — өөрийгөө жагсаалтад харуулаад хүлээгээрэй."));
    xch.list.forEach(function(x){
      box.append(h("div",{class:"note",style:"display:flex;align-items:center;gap:8px;margin-top:8px"},
        h("div",{style:"flex:1"},h("div",{style:"font-weight:700"},x.name),h("div",{class:"muted small"},"🗣 "+XLANG[L]+" → 🇲🇳 монгол сурч байна")),
        h("button",{class:"btn primary",style:"padding:8px 14px",onclick:function(){openChat(x);}},"💬 Бичих")));
    });
    box.append(h("button",{class:"btn ghost",style:"width:100%;margin-top:10px",onclick:function(){xch.list=null;paint();}},"⟳ Шинэчлэх"));
    return box;
  }
  function setScreen(n){if(screen==="botchat"){pending=n;return false;}screen=n;return true;}
  function botList(){return BOTS[me().lang]||BOTS.en;}
  function viewBots(){
    var box=h("div");
    if(me().mode==="kid"){box.append(h("p",{class:"note"},"AI найз зөвхөн том хүний горимд байна."));return box;}
    box.append(h("div",{class:"note",style:"margin-top:0"},"🤖 Эдгээр нь жинхэнэ хүн биш, AI дүрүүд. Хэзээд хариулна, алдааг чинь монголоор засна."));
    if(!env.aiReady())box.append(h("div",{style:"margin-top:10px"},env.keyBox()));
    botList().forEach(function(b){
      box.append(h("div",{class:"note",style:"display:flex;align-items:center;gap:10px;margin-top:10px"},
        h("div",{style:"font-size:30px"},"🤖"),
        h("div",{style:"flex:1;min-width:0"},h("div",{style:"font-weight:700"},b.name+" · AI"),h("div",{class:"muted small"},b.bio)),
        h("button",{class:"btn primary",style:"padding:8px 14px",onclick:function(){openBot(b);}},"💬")));
    });
    return box;
  }
  function openBot(b){
    botBack=screen==="home"?"home":screen;
    bc={bot:b,msgs:[],busy:false,step:0,ctl:null,error:"",ai:env.aiReady()};
    screen="botchat";paint();
    runBot();
  }
  function botRules(b){return env.botRules(b.persona)+(me().mode==="senior"?"\n- The learner is an older adult. Speak clearly and simply, be patient, warm and respectful, avoid slang.":"");}
  function botTurns(){
    var t=[{role:"user",content:botRules(bc.bot)+"\n\nBegin now with a short, warm greeting and one easy question. Do not write ###."}];
    bc.msgs.forEach(function(m){if(m.streaming)return;t.push({role:m.role==="ai"?"assistant":"user",content:m.text});});
    return t;
  }
  function scriptedBot(){
    var pk=env.pack(me().lang),sc=(env.scripts(me().lang)||{})[bc.bot.scene]||(env.scripts(me().lang)||{}).free||[];
    var last=bc.msgs.filter(function(m){return m.role==="me";}).pop();
    if(!last){bc.step=0;return {text:sc[0]?sc[0][0]:"...",mn:env.mn(bc.bot.scene,0)};}
    if(bc.step>=sc.length-1)return {text:pk.end||pk.fin};
    if(/[\u0400-\u04FF]/.test(last.text)&&me().lang!=="ru"){return {text:pk.tryMsg+sc[bc.step][0]+"\n###\n"+pk.tryFix+" Жишээ хариулт: "+sc[bc.step][1],mn:env.mn(bc.bot.scene,bc.step)};}
    var uc=bc.msgs.filter(function(m){return m.role==="me";}).length,tc=env.touch(last.text,uc);
    bc.step++;
    return {text:(tc.react||pk.react[Math.floor(Math.random()*pk.react.length)])+" "+sc[bc.step][0]+(tc.extra?" "+tc.extra:""),mn:(tc.reactMn?tc.reactMn+" ":"")+env.mn(bc.bot.scene,bc.step)+(tc.extraMn?" "+tc.extraMn:"")};
  }
  function runBot(){
    if(!bc)return;
    bc.busy=true;bc.error="";
    var ai={role:"ai",text:"",streaming:true};
    bc.msgs.push(ai);
    bc.ctl=new AbortController();
    var cur=bc;
    function apply(text){
      var pr=env.parse(text);
      ai.text=pr.reply;if(pr.mn)ai.mn=pr.mn;
      var fix=pr.fix;
      if(fix){for(var i=cur.msgs.length-1;i>=0;i--){if(cur.msgs[i].role==="me"){cur.msgs[i].fix=fix;break;}}}
      if(bc===cur)botPaint();
    }
    var p=env.ai(botTurns(),{signal:cur.ctl.signal,onText:function(x){apply(x.text);}});
    Promise.resolve(p).then(function(res){
      if(res==null){cur.ai=false;return scriptedBot();}
      cur.ai=true;return res;
    }).then(function(res){
      apply(res.text);if(res.mn&&!ai.mn)ai.mn=res.mn;ai.streaming=false;cur.busy=false;if(bc===cur)botPaint();env.learn(cur.msgs);
    }).catch(function(e){
      var code=e&&e.code;
      if(e&&e.text)apply(e.text);
      ai.streaming=false;cur.busy=false;
      if(!ai.text){cur.msgs.splice(cur.msgs.indexOf(ai),1);
        if(code!=="cancelled"){var lu=cur.msgs[cur.msgs.length-1];if(lu&&lu.role==="me"){cur.msgs.pop();cur.draft=lu.text;}}}
      if(code!=="cancelled")cur.error=env.errCopy(code);
      if(bc===cur)botPaint();
    });
    botPaint();
  }
  function botPaint(){
    var box=document.getElementById("_botmsgs");if(!box||!bc)return;
    box.textContent="";
    bc.msgs.forEach(function(m){
      if(m.role==="me"){
        box.append(h("div",{class:"b me"},m.text));
        if(m.fix)box.append(h("div",{class:"fix"},h("b",null,"Засвар: "),m.fix));
      }else{
        box.append(h("div",{class:"b ai"},m.text||(m.streaming?"...":"")));
        if(m.mn)box.append(h("div",{class:"muted small",style:"margin:2px 4px 4px"},"🇲🇳 "+m.mn));
        if(m.text&&!m.streaming)box.append(h("button",{class:"spk",onclick:function(){env.speak(m.text);}},"Сонсох"));
      }
    });
    var st=document.getElementById("_botstate");
    if(st){st.textContent=bc.error||"";st.style.display=bc.error?"block":"none";}
    var send=document.getElementById("_botsend"),stop=document.getElementById("_botstop");
    if(send)send.style.display=bc.busy?"none":"";
    if(stop)stop.style.display=bc.busy?"":"none";
    window.scrollTo(0,document.body.scrollHeight);
  }
  function viewBotChat(){
    var box=h("div"),b=bc.bot;
    box.append(h("button",{class:"btn ghost",style:"padding:6px 12px",onclick:function(){if(bc&&bc.ctl)bc.ctl.abort();bc=null;var t=pending||(botBack==="botchat"?"home":botBack);pending=null;screen=t;sub="bots";paint();}},"‹ Буцах"),
      h("h3",{style:"margin:8px 0 2px"},"🤖 "+b.name+" · AI"),
      h("p",{class:"muted small",style:"margin:0 0 8px"},(bc.ai?"AI-тай чөлөөтэй яриарай. ":"Бэлэн асуултын горим (AI түлхүүр оруулбал чөлөөт яриа болно). ")+"Монголоор бичсэн ч болно."));
    box.append(h("div",{id:"_botmsgs",class:"msgs",style:"display:flex;flex-direction:column;gap:8px"}),h("div",{id:"_botstate",class:"note",style:"display:none"}));
    var inp=h("input",{class:"tin",type:"text",maxlength:"300",autocomplete:"off",placeholder:"Мессеж бич...","aria-label":"Мессеж"});
    if(bc.draft)inp.value=bc.draft;
    function send(){
      var t=inp.value.trim();if(!t||bc.busy)return;
      bc.msgs.push({role:"me",text:t});bc.draft="";inp.value="";
      env.learnLocal(t);env.reward();runBot();
    }
    inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();send();}});
    box.append(h("div",{style:"display:flex;gap:8px;margin-top:8px"},inp,
      h("button",{class:"btn primary",id:"_botsend",style:"flex:none",onclick:send},"➤"),
      h("button",{class:"btn",id:"_botstop",style:"flex:none;display:none",onclick:function(){if(bc&&bc.ctl)bc.ctl.abort();}},"⏹")));
    setTimeout(botPaint,0);
    return box;
  }

  /* ---------- screens ---------- */
  function viewSetup(){
    return h("div",null,
      h("h3",null,"🤝 Найзуудтай харилцах"),
      h("p",null,"Найзуудтайгаа уралдах, хамт ярьж дасгалжих, сорилт илгээх боломжтой. Үүнд жижиг сервер (Firebase) хэрэгтэй бөгөөд одоохондоо тохируулаагүй байна."),
      h("div",{class:"note"},"Тохируулах заавар: repo доторх ",h("b",null,"FIREBASE_SETUP.md")," файлыг үзнэ үү."));
  }
  function viewName(){
    var box=h("div"),inp=h("input",{class:"tin",type:"text",maxlength:"16",autocomplete:"off",placeholder:"Нууц нэр (2–16 тэмдэгт)","aria-label":"Нууц нэр"});
    box.append(h("h3",null,"👋 Тавтай морил"),
      h("p",null,"Бүртгэл шаардахгүй. Найзууддаа харагдах нэрээ сонго (жинхэнэ нэр бичих албагүй)."),inp,
      h("button",{class:"btn primary",style:"margin-top:10px",onclick:function(){
        var n=inp.value.trim();
        if(n.length<2){env.toast("Нэр хэт богино");return;}
        if(/https?:|www\.|\d{5,}/i.test(n)){env.toast("Ийм нэр болохгүй");return;}
        if(busy)return;busy=true;
        createProfile(n).then(function(){busy=false;enter();}).catch(function(){busy=false;env.toast("Алдаа гарлаа, дахин оролдоно уу");});
      }},"Үргэлжлүүлэх"));
    return box;
  }
  function paint(){
    if(!root)return;
    detach();
    root.textContent="";
    if(screen==="setup"){root.append(viewSetup(),h("div",{style:"margin-top:16px"},h("h3",null,"🤖 AI найзууд"),viewBots()));return;}
    if(screen==="boot"){root.append(h("p",{class:"muted"},"Холбогдож байна..."),h("div",{style:"margin-top:18px"},h("h3",null,"🤖 AI найзууд"),viewBots()));return;}
    if(screen==="error"){root.append(h("p",{class:"note"},info),h("button",{class:"btn",onclick:function(){db=null;uid=null;init();}},"Дахин оролдох"),h("div",{style:"margin-top:16px"},h("h3",null,"🤖 AI найзууд"),viewBots()));return;}
    if(screen==="name"){root.append(viewName(),h("div",{style:"margin-top:18px"},h("h3",null,"🤖 AI найзууд"),viewBots()));return;}
    if(screen==="chat"){root.append(viewChat());return;}
    if(screen==="botchat"&&bc){root.append(viewBotChat());return;}
    if(screen==="quiz"){root.append(viewQuiz());return;}
    if(screen==="duel"&&duel){if(!duelRef){openDuel(duel.id);return;}root.append(viewDuel());return;}
    var tabs=h("div",{style:"display:flex;gap:6px;margin-bottom:12px"});
    [["friends","👥 Найз"],["bots","🤖 AI"],["room","🌐 Өрөө"],["xch","🔁 Солилцоо"],["inbox","🎯 Сорилт"]].filter(function(t){return !((t[0]==="room"||t[0]==="xch")&&(me().mode==="senior"||me().mode==="kid"));}).forEach(function(t){
      tabs.append(h("button",{class:"chip",style:"flex:1;"+(sub===t[0]?"border-color:var(--accent,#3a7bd5);":""),"aria-current":sub===t[0]?"true":null,onclick:function(){sub=t[0];paint();}},t[1]));
    });
    root.append(tabs);
    if(sub==="friends")root.append(viewFriends());
    else if(sub==="bots")root.append(viewBots());
    else if(sub==="room")root.append(viewRoom());
    else if(sub==="xch")root.append(viewXch());
    else root.append(viewInbox());
  }

  window.Social={
    view:function(e){
      env=e;detach();
      root=h("div",{style:"padding-bottom:20px"});
      if(screen==="chat"&&!chatWith)screen="home";
      if(screen==="botchat"&&!bc)screen="home";
      setTimeout(init,0);
      return root;
    },
    detach:function(){detach();duelOff();},
    /* нэвтрэлт солигдоход (Google холбох / гарах) */
    reset:function(){detach();duelOff();duel=null;goals={data:{},loaded:false,form:false};xch={list:null,on:null};db=null;uid=null;prof=null;friendsData=[];chatWith=null;quiz=null;screen="boot";}
  };
})();
