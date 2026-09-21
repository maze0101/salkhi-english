/* Салхи: хүмүүстэй харилцах хэсэг (найзууд, хамтрагчтай ярих, нээлттэй өрөө, үгийн сорилт).
   Firebase (нэвтрэлтгүй / anonymous) ашиглана. Тохиргоо: firebase-config.js */
(function(){
  var SDK="https://www.gstatic.com/firebasejs/10.12.2/";
  var env=null,root=null,db=null,uid=null,prof=null,screen="boot",sub="friends";
  var friendsData=[],listeners=[],msgCount=0,lastSend=0,chatWith=null,quiz=null,busy=false,info="";
  var BLOCK_KEY="salkhi:blocks",DONE_KEY="salkhi:chdone";

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
    loadSDK().then(function(){
      if(!firebase.apps.length)firebase.initializeApp(cfg());
      db=firebase.database();
      return firebase.auth().signInAnonymously();
    }).then(function(cred){
      uid=cred.user.uid;
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
    prof.xp=m.xp;prof.streak=m.streak;prof.lang=m.lang;
    db.ref("users/"+uid).update({xp:m.xp,streak:m.streak,lang:m.lang,ts:firebase.database.ServerValue.TIMESTAMP}).catch(function(){});
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
      prof={name:name,code:code,lang:m.lang,xp:m.xp,streak:m.streak};
      return db.ref("users/"+uid).set({name:name,code:code,lang:m.lang,xp:m.xp,streak:m.streak,ts:firebase.database.ServerValue.TIMESTAMP});
    });
  }
  function blocks(){return ls(BLOCK_KEY,[]);}
  function isBlocked(u){return blocks().indexOf(u)>=0;}

  /* ---------- friends ---------- */
  function loadFriends(){
    db.ref("friends/"+uid).once("value").then(function(snap){
      var ids=Object.keys(snap.val()||{});
      return Promise.all(ids.map(function(id){return db.ref("users/"+id).once("value").then(function(s){var v=s.val();return v?{uid:id,name:v.name,xp:v.xp||0,streak:v.streak||0,lang:v.lang||""}:null;});}));
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
    var rows=friendsData.slice();
    rows.push({uid:uid,name:prof.name+" (та)",xp:prof.xp||0,streak:prof.streak||0,lang:prof.lang,self:true});
    rows.sort(function(a,b){return b.xp-a.xp;});
    var board=h("div",{style:"margin-top:14px"},h("div",{style:"font-weight:700;margin-bottom:6px"},"🏆 Найзуудын жагсаалт"));
    rows.forEach(function(r,i){
      var line=h("div",{class:"note",style:"display:flex;align-items:center;gap:8px;margin-top:8px"},
        h("div",{style:"width:26px;font-weight:800"},String(i+1)),
        h("div",{style:"flex:1;min-width:0"},h("div",{style:"font-weight:700"},r.name),h("div",{class:"muted small"},"🔥 "+r.streak+" · "+r.xp+" XP")));
      if(!r.self){
        line.append(
          h("button",{class:"btn ghost",style:"padding:6px 10px",title:"Чат","aria-label":"Чат",onclick:function(){openChat(r);}},"💬"),
          h("button",{class:"btn ghost",style:"padding:6px 10px",title:"Үгийн сорилт","aria-label":"Сорилт илгээх",onclick:function(){sendChallenge(r);}},"🎯"),
          h("button",{class:"btn ghost",style:"padding:6px 10px",title:"Хасах","aria-label":"Хасах",onclick:function(){removeFriend(r.uid);}},"✖"));
      }
      board.append(line);
    });
    if(!friendsData.length)board.append(h("p",{class:"muted small"},"Найз алга. Дээрх кодоор найзаа нэм."));
    box.append(codeRow,inp,add,h("button",{class:"btn ghost",style:"margin-top:8px;width:100%",onclick:function(){syncProfile();loadFriends();}},"⟳ Шинэчлэх"),board);
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
      ref.push(msg).catch(function(){env.toast("Илгээж чадсангүй");});
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
    box.append(h("button",{class:"btn ghost",style:"padding:6px 12px",onclick:function(){screen="home";sub="friends";paint();}},"‹ Буцах"),
      h("h3",{style:"margin:8px 0 2px"},"💬 "+f.name),
      h("p",{class:"muted small",style:"margin:0 0 8px"},"Хамтдаа ярьж дасгалла. Эхлэхийн тулд доорх сэдвээс сонго."));
    var ui=chatUI(ref,{max:300,showName:false,reportPath:"chats/"+cid});
    var sel=h("select",{class:"tin","aria-label":"Сэдэв",style:"font-size:15px"});
    sel.append(h("option",{value:""},"🎯 Ярианы сэдэв сонгох..."));
    var scripts=env.scripts(me().lang)||{};
    env.scenes().forEach(function(s){if(scripts[s[0]]&&(!s[3]||s[3]===me().mode))sel.append(h("option",{value:s[0]},s[1]));});
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
    if(me().mode==="kid"){box.append(h("p",{class:"note"},"Нээлттэй өрөө зөвхөн том хүний горимд байна."));return box;}
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
    Promise.all([db.ref("challenges/"+uid).once("value"),db.ref("results/"+uid).once("value")]).then(function(r){
      var a=r[0].val()||{},b=r[1].val()||{};
      inbox.items=Object.keys(a).map(function(k){var v=a[k];v.id=k;return v;}).sort(function(x,y){return (y.ts||0)-(x.ts||0);}).slice(0,20);
      inbox.results=Object.keys(b).map(function(k){return b[k];}).sort(function(x,y){return (y.ts||0)-(x.ts||0);}).slice(0,20);
      inbox.loaded=true;if(screen==="home"&&sub==="inbox")paint();
    }).catch(function(){inbox.loaded=true;paint();});
  }
  function viewInbox(){
    var box=h("div"),done=ls(DONE_KEY,{});
    if(!inbox.loaded){loadInbox();box.append(h("p",{class:"muted"},"Ачаалж байна..."));return box;}
    box.append(h("button",{class:"btn ghost",style:"padding:6px 12px",onclick:function(){inbox.loaded=false;paint();}},"⟳ Шинэчлэх"));
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
  function botRules(b){return env.botRules(b.persona);}
  function botTurns(){
    var t=[{role:"user",content:botRules(bc.bot)+"\n\nBegin now with a short, warm greeting and one easy question. Do not write ###."}];
    bc.msgs.forEach(function(m){if(m.streaming)return;t.push({role:m.role==="ai"?"assistant":"user",content:m.text});});
    return t;
  }
  function scriptedBot(){
    var pk=env.pack(me().lang),sc=(env.scripts(me().lang)||{})[bc.bot.scene]||(env.scripts(me().lang)||{}).free||[];
    var last=bc.msgs.filter(function(m){return m.role==="me";}).pop();
    if(!last){bc.step=0;return {text:sc[0]?sc[0][0]:"..."};}
    if(bc.step>=sc.length-1)return {text:pk.end||pk.fin};
    if(/[\u0400-\u04FF]/.test(last.text)&&me().lang!=="ru"){return {text:pk.tryMsg+sc[bc.step][0]+"\n###\n"+pk.tryFix+" Жишээ хариулт: "+sc[bc.step][1]};}
    bc.step++;
    return {text:pk.react[Math.floor(Math.random()*pk.react.length)]+" "+sc[bc.step][0]};
  }
  function runBot(){
    if(!bc)return;
    bc.busy=true;bc.error="";
    var ai={role:"ai",text:"",streaming:true};
    bc.msgs.push(ai);
    bc.ctl=new AbortController();
    var cur=bc;
    function apply(text){
      var parts=String(text).split("###");
      ai.text=parts[0].trim();
      var fix=parts.slice(1).join("").trim();
      if(fix){for(var i=cur.msgs.length-1;i>=0;i--){if(cur.msgs[i].role==="me"){cur.msgs[i].fix=fix;break;}}}
      if(bc===cur)botPaint();
    }
    var p=env.ai(botTurns(),{signal:cur.ctl.signal,onText:function(x){apply(x.text);}});
    Promise.resolve(p).then(function(res){
      if(res==null){cur.ai=false;return scriptedBot();}
      cur.ai=true;return res;
    }).then(function(res){
      apply(res.text);ai.streaming=false;cur.busy=false;if(bc===cur)botPaint();
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
      env.reward();runBot();
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
    var tabs=h("div",{style:"display:flex;gap:6px;margin-bottom:12px"});
    [["friends","👥 Найз"],["bots","🤖 AI"],["room","🌐 Өрөө"],["inbox","🎯 Сорилт"]].forEach(function(t){
      tabs.append(h("button",{class:"chip",style:"flex:1;"+(sub===t[0]?"border-color:var(--accent,#3a7bd5);":""),"aria-current":sub===t[0]?"true":null,onclick:function(){sub=t[0];paint();}},t[1]));
    });
    root.append(tabs);
    if(sub==="friends")root.append(viewFriends());
    else if(sub==="bots")root.append(viewBots());
    else if(sub==="room")root.append(viewRoom());
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
    detach:function(){detach();}
  };
})();
