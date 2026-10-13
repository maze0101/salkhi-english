/* Салхи: 🗣️ AI-тай мэтгэлцэх — сэдэв, байр сууриа (дэмжих/эсэргүүцэх) сонгоход AI эсрэг талыг баримтална.
   Тойрог бүрт: суралцагч аргументаа бичнэ/хэлнэ → AI (task:"check") засварласан хувилбар, эсрэг аргумент + асуулт, хэл ба аргументын оноо (0–10).
   AI-ийн бүх бичвэр зорилтот хэл дээр (Workers AI монголоор найдваргүй); ойлгоход 🔊 ба Google орчуулгын холбоос.
   Workers AI JSON-ийг ихэвчлэн «"fix:...",» гэж эвддэг тул loose() уян хатан уншина. 3 тойрог → дүн, XP = 5 + 3×тойрог. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var ROUNDS=3,env=null,h=null,D=null;
  var TOPICS=[
    ["🎒","Сурагчид дүрэмт хувцас өмсөх ёстой","Students should wear school uniforms"],
    ["🏙️","Хотод амьдрах нь хөдөөнөөс дээр","Living in the city is better than living in the countryside"],
    ["📱","Хүүхдүүд өөрийн ухаалаг утастай байх ёстой","Children should have their own smartphones"],
    ["💻","Онлайн хичээл танхимын хичээлээс дээр","Online classes are better than classroom lessons"],
    ["📚","Гэрийн даалгаврыг хориглох хэрэгтэй","Homework should be banned"],
    ["🐶","Тэжээвэр амьтан хүүхдэд сайн","Pets are good for children"],
    ["🤖","Хиймэл оюун ажлын байрыг устгана","AI will take away more jobs than it creates"],
    ["💰","Мөнгө хүнийг аз жаргалтай болгодог","Money makes people happy"],
    ["🛍️","Хуванцар уутыг хориглох хэрэгтэй","Plastic bags should be banned"],
    ["✈️","Гадаадад сурах нь дотооддоо сурахаас дээр","Studying abroad is better than studying in your own country"],
    ["⚽","Сургуульд спорт заавал байх ёстой","Sports should be compulsory at school"],
    ["📲","Нийгмийн сүлжээ залуучуудад хортой","Social media is harmful for young people"]
  ];
  /* мэтгэлцээний хэллэг: [хэллэг, монгол утга] */
  var PH={
    en:[["I believe that…","Би … гэж итгэдэг"],["In my opinion,…","Миний бодлоор…"],["On the other hand,…","Нөгөө талаас…"],["That's a good point, but…","Сайн санаа, гэхдээ…"],["For example,…","Жишээ нь…"],["I disagree because…","Би санал нийлэхгүй, учир нь…"],["The main reason is…","Гол шалтгаан нь…"],["To sum up,…","Дүгнэж хэлэхэд…"]],
    de:[["Ich bin der Meinung, dass…","Миний бодлоор …"],["Meiner Meinung nach…","Миний бодлоор…"],["Auf der anderen Seite…","Нөгөө талаас…"],["Das stimmt, aber…","Үнэн, гэхдээ…"],["Zum Beispiel…","Жишээ нь…"],["Ich stimme nicht zu, weil…","Санал нийлэхгүй, учир нь…"],["Der wichtigste Grund ist…","Хамгийн чухал шалтгаан нь…"],["Zusammenfassend…","Дүгнэж хэлэхэд…"]],
    ru:[["Я считаю, что…","Би … гэж үздэг"],["По-моему,…","Миний бодлоор…"],["С другой стороны,…","Нөгөө талаас…"],["Это верно, но…","Энэ үнэн, гэхдээ…"],["Например,…","Жишээ нь…"],["Я не согласен, потому что…","Санал нийлэхгүй, учир нь…"],["Главная причина в том, что…","Гол шалтгаан нь…"],["В итоге…","Эцэст нь…"]],
    ja:[["私は…と思います。","Би … гэж боддог."],["私の意見では、…","Миний бодлоор…"],["一方で、…","Нөгөө талаас…"],["それはそうですが、…","Тийм ч гэсэн…"],["例えば、…","Жишээ нь…"],["…ので、反対です。","…учраас эсрэг байна."],["一番の理由は…です。","Хамгийн гол шалтгаан нь…"],["まとめると、…","Дүгнэвэл…"]],
    ko:[["저는 …라고 생각해요.","Би … гэж боддог."],["제 생각에는…","Миний бодлоор…"],["반면에…","Харин…"],["맞아요, 하지만…","Зөв, гэхдээ…"],["예를 들어…","Жишээ нь…"],["…기 때문에 반대해요.","…учраас эсэргүүцэж байна."],["가장 큰 이유는 …예요.","Хамгийн том шалтгаан нь…"],["결론적으로…","Дүгнэж хэлэхэд…"]],
    zh:[["我认为……","Би … гэж бодож байна"],["在我看来，……","Миний бодлоор…"],["另一方面，……","Нөгөө талаас…"],["你说得对，但是……","Зөв хэлж байна, гэхдээ…"],["比如说，……","Жишээ нь…"],["我不同意，因为……","Санал нийлэхгүй, учир нь…"],["最重要的原因是……","Хамгийн чухал шалтгаан нь…"],["总之，……","Товчоор хэлбэл…"]]
  };
  var GT={en:"en",ja:"ja",ko:"ko",zh:"zh-CN",ru:"ru",de:"de"};
  function gt(t){return "https://translate.google.com/?sl="+(GT[env.lang()]||"auto")+"&tl=mn&op=translate&text="+encodeURIComponent(t);}
  /* Workers AI JSON: зөв JSON, эсвэл «"fix:...",» / «"lang":8» хэлбэрийг уншина */
  function loose(t){
    t=String(t||"");var m=t.match(/\{[\s\S]*\}/),o={};
    if(m){try{var j=JSON.parse(m[0]);if(j&&(j.reply||j.fix))return j;}catch(e){}}
    var s=m?m[0]:t,x;
    var re1=/"(fix|reply)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;while((x=re1.exec(s)))o[x[1]]=x[2].replace(/\\"/g,'"');
    var re2=/"(fix|reply)\s*:\s*((?:[^"\\]|\\.)*)"/g;while((x=re2.exec(s)))if(!o[x[1]])o[x[1]]=x[2].replace(/\\"/g,'"').trim();
    var re3=/"?(lang|arg)"?\s*:\s*"?(\d+)/g;while((x=re3.exec(s)))o[x[1]]=+x[2];
    return o.reply?o:null;
  }
  function prompt(text,opening){
    var LN=env.langEn(),side=D.side==="for"?"FOR":"AGAINST",me=D.side==="for"?"AGAINST":"FOR";
    var base="You are a friendly debate partner for a Mongolian learner of "+LN+" (level: "+env.level()+").\nTopic: \""+D.topic[2]+"\". The learner argues "+side+" the topic; you argue "+me+" it.\n";
    var hist=D.turns.length?"Debate so far:\n"+D.turns.map(function(t){return "Learner: "+t.u+"\nYou: "+t.r;}).join("\n")+"\n":"";
    if(opening)return base+"Open the debate: state your position in simple "+LN+" in 2 short sentences and ask the learner one question.\nReply with ONLY valid JSON: {\"reply\":\"<your opening in "+LN+">\"}";
    return base+hist+"The learner just wrote: \""+text+"\"\n"+
      "Reply with ONLY valid JSON, no markdown:\n{\"fix\":\"<the learner's text rewritten in correct, natural "+LN+" with the same meaning (repeat it if already correct)>\","+
      "\"reply\":\"<your counter-argument in simple "+LN+", 2-3 short sentences"+(D.turns.length+1<ROUNDS?", ending with a question to the learner":", as a polite closing statement")+">\",\"lang\":<0-10 grammar and vocabulary score>,\"arg\":<0-10 how convincing the argument is>}";
  }
  function ask(q,cb){
    D.busy=true;D.err="";env.render();var run=D;
    Promise.resolve(env.ai([{role:"user",content:q}],{task:"check"})).then(function(r){
      if(D!==run)return;D.busy=false;
      var j=loose(r);
      if(!j){D.err=r==null?"AI одоогоор ажиллахгүй байна. Интернэтээ шалгаад дахин оролдоно уу.":"AI хариулж чадсангүй. Дахин илгээгээрэй.";env.render();return;}
      cb(j);env.render();
      if(j.reply&&!env.sget("dbMute",false))env.speak(env.clean(j.reply));
    },function(){if(D!==run)return;D.busy=false;D.err="AI хариулж чадсангүй.";env.render();});
  }
  function begin(topic,side){
    D={topic:topic,side:side,turns:[],open:"",busy:false,err:"",draft:"",fin:false,lang:env.lang()};
    ask(prompt("",true),function(j){D.open=String(j.reply||"").slice(0,600);});
  }
  function send(){
    var t=String(D.draft||"").trim();
    if(t.length<3){env.toast("Аргументаа бичнэ үү");return;}
    if(D.busy)return;
    ask(prompt(t.slice(0,600),false),function(j){
      D.turns.push({u:t.slice(0,600),f:String(j.fix||"").slice(0,600),r:String(j.reply||"").slice(0,600),l:Math.max(0,Math.min(10,+j.lang||0)),a:Math.max(0,Math.min(10,+j.arg||0))});
      D.draft="";
      if(D.turns.length>=ROUNDS)finish();
    });
  }
  function finish(){
    if(D.fin)return;D.fin=true;
    var xp=5+3*D.turns.length;env.addXP(xp);env.logAct("deb");D.xp=xp;
    var avg=function(k){return Math.round(D.turns.reduce(function(s,t){return s+t[k];},0)/D.turns.length*10)/10;};
    D.sl=avg("l");D.sa=avg("a");
    if(D.sl>=7&&D.sa>=7)env.celebrate();
  }
  function aiBubble(text){
    return h("div",{class:"note",style:"margin:8px 0;border-left:4px solid var(--danger)"},
      h("div",{class:"muted small",style:"font-weight:700"},"🤖 Эсрэг тал"),
      h("div",{lang:env.lang(),style:"font-size:17px;line-height:1.5;margin-top:2px"},text),
      h("div",{class:"row",style:"margin-top:6px"},h("button",{class:"btn ghost",style:"padding:4px 10px",onclick:function(){env.speak(env.clean(text));}},"🔊"),
        h("a",{class:"btn ghost",href:gt(text),target:"_blank",rel:"noopener",style:"padding:4px 10px;text-decoration:none"},"🌐 Орчуулга")));
  }
  function mic(ta){
    var SR=env.SR&&env.SR();if(!SR)return null;
    return h("button",{class:"btn",type:"button","aria-label":"Хэлж бичүүлэх",onclick:function(){
      try{var r=new SR();r.lang=env.srLang();r.interimResults=false;r.onresult=function(e){var t=e.results[0][0].transcript;D.draft=(D.draft?D.draft+" ":"")+t;ta.value=D.draft;};
        r.onerror=function(){env.toast("Микрофон ажиллахгүй байна");};r.start();env.toast("🎤 Ярина уу…",1500);}catch(e){env.toast("Микрофон ажиллахгүй байна");}
    }},"🎤");
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    /* хэл солигдвол өмнөх мэтгэлцээнийг хаяна */
    if(D&&D.lang!==e.lang())D=null;
    put(root,h("button",{class:"back",onclick:function(){if(D){if(D.turns.length&&!D.fin&&!confirm("Мэтгэлцээнээс гарах уу?"))return;D=null;env.stop();env.render();}else e.close();}},D?"‹ Сэдвүүд":"‹ Ярих"));
    if(!D){
      put(root,h("h2",null,"🗣️ AI-тай мэтгэлцэх"),
        h("p",{class:"muted"},"Сэдэв сонгоод байр сууриа илэрхийл. AI эсрэг талыг баримталж маргана. "+ROUNDS+" тойргийн дараа хэл ба аргументын оноогоо харна. IELTS, TOPIK-ийн ярианы шалгалтад тустай."));
      TOPICS.forEach(function(t){
        var card=h("div",{class:"note",style:"margin:8px 0"});
        put(card,h("div",{style:"font-weight:700"},t[0]+" "+t[1]),
          h("div",{class:"row",style:"margin-top:6px"},
            h("button",{class:"btn",onclick:function(){begin(t,"for");}},"👍 Дэмжинэ"),
            h("button",{class:"btn",onclick:function(){begin(t,"against");}},"👎 Эсэргүүцнэ")));
        put(root,card);
      });
      return root;
    }
    put(root,h("div",{class:"note"},h("div",{class:"muted small"},"Сэдэв"),h("div",{style:"font-weight:800"},D.topic[0]+" "+D.topic[1]),
      h("div",{class:"small",style:"margin-top:4px"},"Чи: ",h("b",null,D.side==="for"?"👍 дэмжинэ":"👎 эсэргүүцнэ")," · AI: ",h("b",null,D.side==="for"?"👎 эсэргүүцнэ":"👍 дэмжинэ"),
        " · Тойрог "+Math.min(D.turns.length+(D.fin?0:1),ROUNDS)+" / "+ROUNDS)));
    var ph=PH[env.lang()];
    if(ph&&!D.fin){
      var det=h("details",{style:"margin:8px 0"});
      put(det,h("summary",{style:"cursor:pointer;font-weight:700"},"💬 Мэтгэлцээний хэллэгүүд"));
      ph.forEach(function(p){put(det,h("button",{class:"chip",style:"margin:4px 4px 0 0",lang:env.lang(),onclick:function(){D.draft=(D.draft?D.draft.replace(/\s*$/," "):"")+p[0].replace(/…$/,"").replace(/……$/,"");env.render();}},
        h("b",null,p[0]),h("span",{class:"muted"}," "+p[1])));});
      put(root,det);
    }
    if(D.open)put(root,aiBubble(D.open));
    D.turns.forEach(function(t){
      put(root,h("div",{class:"note",style:"margin:8px 0;border-left:4px solid var(--sky)"},
        h("div",{class:"muted small",style:"font-weight:700"},"🙋 Чи · хэл "+t.l+"/10 · аргумент "+t.a+"/10"),
        h("div",{lang:env.lang(),style:"margin-top:2px"},t.u),
        t.f&&t.f.trim()!==t.u.trim()?h("div",{lang:env.lang(),style:"margin-top:6px;color:var(--ok)"},"✏️ "+t.f):h("div",{class:"small",style:"margin-top:4px;color:var(--ok)"},"✅ Алдаагүй!")));
      put(root,aiBubble(t.r));
    });
    if(D.err)put(root,h("div",{class:"fb bad"},D.err));
    if(D.fin){
      put(root,h("div",{class:"note",style:"text-align:center;margin-top:10px"},h("div",{style:"font-size:40px"},D.sl>=7&&D.sa>=7?"🏆":"🎤"),
        h("div",{style:"font-weight:800;font-size:18px"},"Мэтгэлцээн дууслаа!"),
        h("div",{style:"margin-top:6px"},"📝 Хэл: ",h("b",null,D.sl+" / 10")," · 💡 Аргумент: ",h("b",null,D.sa+" / 10")),
        h("div",{class:"muted"},"+"+D.xp+" XP"),
        h("div",{class:"muted small",style:"margin-top:6px"},"✏️ Ногоон өнгөөр засварласан өгүүлбэрүүдээ дахин уншаарай. Оноог AI өгсөн тул ойролцоо үнэлгээ.")),
        h("div",{class:"row"},h("button",{class:"btn",onclick:function(){D=null;env.render();}},"Өөр сэдэв"),h("button",{class:"btn primary",onclick:function(){begin(D.topic,D.side==="for"?"against":"for");}},"🔄 Байр сууриа солих")));
      return root;
    }
    if(D.busy){put(root,h("p",{class:"muted"},"🤖 AI бодож байна…"));return root;}
    if(!D.open&&!D.turns.length){put(root,h("button",{class:"btn",onclick:function(){begin(D.topic,D.side);}},"🔄 Дахин эхлүүлэх"));return root;}
    var ta=h("textarea",{class:"tin",rows:"3",lang:env.lang(),maxlength:"600","aria-label":"Таны аргумент",placeholder:env.langName()+" хэлээр аргументаа бичнэ үү…",style:"width:100%;margin-top:8px"});
    ta.value=D.draft||"";ta.addEventListener("input",function(){D.draft=ta.value;});
    ta.addEventListener("keydown",function(ev){if(ev.key==="Enter"&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();send();}});
    put(root,ta,h("div",{class:"row"},mic(ta),h("button",{class:"btn primary",onclick:send},"📤 Илгээх")));
    return root;
  }
  window.Debate={view:view,has:function(l){return l!=="ug";},_loose:loose};
})();
