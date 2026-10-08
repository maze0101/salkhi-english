/* Салхи: AI багштай утсаар ярьж байгаа мэт дуу хоолойгоор ярилцах.
   AI ярина (TTS) → апп автоматаар сонсоно (SpeechRecognition) → AI хариулж, алдааг монголоор засна.
   Яриа таних боломжгүй хөтөчид бичиж хариулна. Дуусахад засваруудын дүгнэлт, XP. */
(function(){
  var TOPICS=[
    ["free","☕","Чөлөөт яриа","a warm, curious tutor having a relaxed everyday chat. Ask about the learner's day, hobbies, family, food and plans"],
    ["day","🏠","Өдөр тутмын амьдрал","a friendly neighbour talking about daily routines, shopping, weather, transport and weekend plans"],
    ["travel","✈️","Аялал","a hotel receptionist and then a local guide helping a tourist: check-in, directions, food, sightseeing and small problems"],
    ["job","💼","Ажлын ярилцлага","a polite job interviewer. Ask typical interview questions one at a time and react to the answers"],
    ["school","🎓","Сургууль, оюутан","a classmate talking about school subjects, exams, teachers, university plans and student life"],
    ["ielts","📝","IELTS Speaking","an IELTS speaking examiner. Run Part 1 questions, then one Part 2 topic, then Part 3 discussion questions. Stay formal but kind",["en"]]
  ];
  var env=null,h=null,C=null,tick=null;

  function fresh(){return {stage:"pick",topic:null,msgs:[],state:"idle",live:"",t0:0,fixes:[],ctl:null,rec:null,showMn:false,typed:"",err:"",xp:0,mute:false,hint:null};}
  /* засварын эхний мөр = зассан өгүүлбэр (rules()-д тэгж хүссэн) */
  function fixLine(f){return String(f||"").split("\n").map(function(s){return s.trim();}).filter(Boolean)[0]||"";}
  function words(t){return String(t||"").trim().split(/\s+/).filter(Boolean).length;}
  /* 💡 «Юу хэлэх вэ?» — AI-н сүүлийн асуултад хариулах 2 жишээ (түвшинд тохирсон, монгол орчуулгатай) */
  function askHint(last){
    if(!C||!last||C.hint==="load")return;
    var cur=C,LN=env.langEn();C.hint="load";paint();
    var t=[{role:"user",content:"A language learner (level: "+env.level()+") must answer this "+LN+" question from their tutor: \""+last.reply+"\"\n"+
      "Give exactly 2 short, natural example answers the learner could say, at their level, in "+LN+". Format each on its own line as: <"+LN+" answer> || <Mongolian (Cyrillic) translation>. No numbering, no other text."}];
    Promise.resolve(env.ai(t,{signal:new AbortController().signal,onText:function(){}})).then(function(res){
      if(C!==cur)return;
      var L=String(res&&res.text||"").split("\n").map(function(s){var p=s.replace(/^[\s\-*\d.)]+/,"").split("||");return p.length>=2?[p[0].trim(),p[1].trim()]:null;}).filter(function(x){return x&&x[0];}).slice(0,2);
      C.hint=L.length?{for:last,list:L}:null;if(!L.length)C.err="Санаа олдсонгүй. Дахин оролдоно уу.";paint();
    },function(){if(C===cur){C.hint=null;paint();}});
  }
  function paint(){if(env&&visible())env.render();}
  function visible(){return !!(env&&env.visible()&&C);}
  function fmt(ms){var s=Math.max(0,Math.round(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
  function topic(){return TOPICS.filter(function(t){return t[0]===C.topic;})[0]||TOPICS[0];}

  function rules(){
    var LN=env.langEn(),t=topic(),cjk=["ja","ko","zh"].indexOf(env.lang())>=0;
    return "You are "+t[3]+". This is a SPOKEN phone-style practice call inside a language-learning app for Mongolian speakers; you are an AI tutor and say so honestly if asked. Speak only "+LN+". Learner level: "+env.level()+".\n"+
      "Rules:\n- Reply with 1 or 2 short, natural spoken sentences at the learner's level, then ask exactly ONE question. Never use lists, markdown or emojis.\n"+
      (cjk?"- After each "+LN+" sentence add its romanized reading in parentheses.\n":"")+
      "- The learner's words come from speech recognition, so ignore punctuation, capital letters and obvious mis-hearings. Only correct real grammar or word-choice mistakes.\n"+
      "- If there is a real mistake, add a line containing only ### after your reply, then write in Mongolian (Cyrillic): the corrected "+LN+" sentence, then a one-sentence explanation in Mongolian. If there is no mistake, do not write ###.\n"+
      "- If the learner speaks Mongolian, reply in simple "+LN+" and after ### give the "+LN+" version of what they wanted to say.\n"+
      "- After your reply and BEFORE any ### add a line containing only @@@ and then a natural Mongolian translation of your reply.";
  }
  function turns(){
    var t=[{role:"user",content:rules()+"\n\nStart the call now: greet the learner warmly in one short sentence and ask one easy question. Do not write ###."}];
    C.msgs.forEach(function(m){if(m.text)t.push({role:m.role==="ai"?"assistant":"user",content:m.text});});
    return t;
  }

  /* ---------- дуудлагын урсгал ---------- */
  function start(id){
    C=fresh();C.topic=id;C.stage="call";C.t0=Date.now();
    startTick();aiTurn();
  }
  function startTick(){
    clearInterval(tick);
    tick=setInterval(function(){
      if(!visible()){hang(true);return;}
      var e=document.getElementById("vctime");if(e)e.textContent=fmt(Date.now()-C.t0);
    },1000);
  }
  function setState(s){C.state=s;paint();}
  function aiTurn(){
    var cur=C,ai={role:"ai",text:"",reply:"",mn:""};
    C.msgs.push(ai);C.ctl=new AbortController();setState("think");
    Promise.resolve(env.ai(turns(),{signal:C.ctl.signal,onText:function(){}})).then(function(res){
      if(C!==cur)return;
      if(!res||!res.text){C.msgs.pop();C.err="AI одоогоор холбогдсонгүй. Интернэтээ шалгаад дахин оролдоно уу.";setState("idle");return;}
      var p=env.parse(res.text);
      ai.text=res.text;ai.reply=p.reply;ai.mn=p.mn;
      if(p.fix){
        for(var i=C.msgs.length-2;i>=0;i--)if(C.msgs[i].role==="me"){C.msgs[i].fix=p.fix;C.fixes.push({said:C.msgs[i].text,fix:p.fix});break;}
      }
      say(ai.reply);
    }).catch(function(e){
      if(C!==cur||(e&&e.code==="cancelled"))return;
      C.msgs.pop();C.err=env.errCopy(e&&e.code);setState("idle");
    });
  }
  function say(t,slow){
    if(!C)return;setState("speak");
    var cur=C;
    env.speak(t,function(){if(C===cur&&C.state==="speak"&&visible())listen();},slow);
  }
  function listen(){
    if(!C||C.stage!=="call")return;
    if(!env.SR()||C.mute){setState("idle");return;}
    env.askMic(function(){
      if(!C||C.stage!=="call")return;
      try{
        var SRc=env.SR(),r=new SRc(),fin="",cur=C;
        r.lang=env.srLang();r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
        r.onresult=function(e){
          var interim="";fin="";
          for(var i=0;i<e.results.length;i++){if(e.results[i].isFinal)fin+=e.results[i][0].transcript;else interim+=e.results[i][0].transcript;}
          C.live=(fin+" "+interim).trim();
          var el=document.getElementById("vclive");if(el)el.textContent=C.live||"…";
        };
        r.onerror=function(e){if(e.error==="not-allowed"||e.error==="service-not-allowed"){C.err=env.micHint();C.mute=true;}};
        r.onend=function(){
          if(C!==cur)return;C.rec=null;
          var said=(fin||C.live||"").trim();C.live="";
          if(said&&C.state==="listen")send(said);
          else if(C.state==="listen")setState("idle");
        };
        C.rec=r;C.live="";setState("listen");r.start();
      }catch(e){setState("idle");}
    },function(){C.err=env.micHint();C.mute=true;setState("idle");});
  }
  function stopRec(){if(C&&C.rec){try{C.rec.abort();}catch(e){}C.rec=null;}}
  function send(text){
    text=String(text||"").trim();if(!text||!C)return;
    stopRec();env.stop();C.err="";C.hint=null;
    C.msgs.push({role:"me",text:text});
    aiTurn();
  }
  function hang(silent){
    clearInterval(tick);tick=null;
    if(!C)return;
    stopRec();env.stop();if(C.ctl)try{C.ctl.abort();}catch(e){}
    var n=C.msgs.filter(function(m){return m.role==="me";}).length;
    if(silent){C=null;return;}
    if(!n){C=null;paint();return;}
    /* нарийвчлал (засваргүй хариултын хувь) өндөр бол бонус XP */
    C.acc=Math.round((n-C.fixes.length)/n*100);
    C.stage="sum";C.dur=Date.now()-C.t0;C.xp=Math.min(30,n*3)+(n>=3&&C.acc>=80?5:0);env.reward(C.xp);
    if(env.mb)C.fixes.forEach(function(f){env.mb(f.said,f.fix);});
    paint();
  }

  /* ---------- дэлгэц ---------- */
  function viewPick(root){
    root.append(h("button",{class:"back",onclick:function(){C=null;env.close();}},"‹ Ярианы дасгал"));
    root.append(h("h2",null,"📞 AI багштай дуудлага"));
    root.append(h("p",{class:"muted"},"Утсаар ярьж байгаа юм шиг "+env.langName().toLowerCase()+" хэлээр ярилц. AI чамайг сонсоод хариулна, алдааг чинь монголоор тайлбарлана."));
    if(!env.SR())root.append(h("div",{class:"note small"},"⚠️ Энэ хөтөч яриа таних боломжгүй тул бичиж хариулна. Android дээр Chrome, iPhone дээр Safari ашиглавал ярьж болно."));
    TOPICS.forEach(function(t){
      if(t[4]&&t[4].indexOf(env.lang())<0)return;
      root.append(h("button",{class:"gamecard",type:"button",style:"margin:10px 0 0",onclick:function(){start(t[0]);}},
        h("i",{"aria-hidden":"true"},t[1]),h("div",null,h("b",null,t[2]),h("span",null,"Дарахад дуудлага эхэлнэ"))));
    });
    root.append(h("p",{class:"muted small",style:"margin-top:14px"},"💡 Чихэвч зүүвэл AI-н дуу микрофонд орохгүй, илүү сайн ажиллана."));
  }
  function viewCall(root){
    var last=null;for(var i=C.msgs.length-1;i>=0;i--)if(C.msgs[i].role==="ai"&&C.msgs[i].reply){last=C.msgs[i];break;}
    var myLast=null;for(var j=C.msgs.length-1;j>=0;j--)if(C.msgs[j].role==="me"){myLast=C.msgs[j];break;}
    var t=topic(),lab={think:"💭 Бодож байна…",speak:"🔊 Ярьж байна",listen:"🎙️ Сонсож байна — ярь",idle:"Чиний ээлж"}[C.state];
    var wrap=h("div",{id:"vcroot",style:"text-align:center"});
    wrap.append(h("div",{class:"muted small"},t[1]+" "+t[2]+" · ",h("span",{id:"vctime"},fmt(Date.now()-C.t0))));
    wrap.append(h("div",{class:"vcorb"+(C.state==="listen"?" on":C.state==="speak"?" talk":""),"aria-hidden":"true"},"🦊"));
    wrap.append(h("div",{style:"font-weight:700;margin:4px 0 10px","aria-live":"polite"},lab));
    if(last){
      var box=h("div",{class:"note",style:"text-align:left"},h("div",{style:"font-size:18px;line-height:1.45"},last.reply));
      if(last.mn)box.append(C.showMn?h("div",{class:"muted small",style:"margin-top:6px"},"🇲🇳 "+last.mn):h("button",{class:"btn ghost",style:"margin-top:6px;padding:4px 10px",onclick:function(){C.showMn=true;paint();}},"🇲🇳 Орчуулга"));
      box.append(h("div",{class:"row",style:"margin-top:8px"},
        h("button",{class:"btn ghost",onclick:function(){stopRec();say(last.reply);}},"🔁 Дахин"),
        h("button",{class:"btn ghost",onclick:function(){stopRec();say(last.reply,true);}},"🐢 Удаан")));
      wrap.append(box);
    }
    if(myLast&&myLast.fix)wrap.append(h("div",{class:"note",style:"text-align:left;border-color:var(--sky)"},
      h("div",{class:"muted small"},"✏️ Чи: «"+myLast.text+"»"),h("div",{style:"margin-top:4px;white-space:pre-wrap"},myLast.fix),
      fixLine(myLast.fix)?h("button",{class:"btn ghost",style:"margin-top:6px;padding:4px 10px",onclick:function(){stopRec();say(fixLine(myLast.fix),true);}},"🔊 Зөв хувилбарыг сонсох"):null));
    else if(myLast&&last&&C.msgs.indexOf(last)>C.msgs.indexOf(myLast))
      wrap.append(h("div",{class:"fb ok",style:"margin:0 0 8px"},"✅ Алдаагүй өгүүлбэр!"));
    /* 💡 юу хэлэхээ мэдэхгүй бол жишээ хариулт */
    if(last&&(C.state==="idle"||C.state==="listen")){
      if(C.hint&&C.hint.for===last){
        var hb=h("div",{class:"note",style:"text-align:left"},h("div",{class:"muted small",style:"font-weight:700"},"💡 Ингэж хариулж болно — сонсоод өөрөө хэлээрэй:"));
        C.hint.list.forEach(function(x){
          hb.append(h("button",{type:"button",class:"opt",style:"margin-top:6px",onclick:function(){stopRec();env.speak(x[0]);}},
            h("div",{style:"font-weight:700"},"🔊 "+x[0]),h("div",{class:"muted small"},x[1])));
        });
        wrap.append(hb);
      }else wrap.append(h("button",{class:"btn ghost",style:"margin-bottom:8px",disabled:C.hint==="load",onclick:function(){askHint(last);}},C.hint==="load"?"💭 Санаа бодож байна…":"💡 Юу хэлэх вэ? Санаа өг"));
    }
    if(C.state==="listen")wrap.append(h("div",{id:"vclive",class:"note",style:"min-height:48px;font-size:17px"},C.live||"…"));
    if(C.err)wrap.append(h("div",{class:"fb bad",style:"text-align:left"},C.err));
    var row=h("div",{class:"row"});
    if(C.state==="listen")row.append(h("button",{class:"btn primary",onclick:function(){if(C.rec)try{C.rec.stop();}catch(e){}}},"✅ Болсон"));
    else if(C.state==="idle"&&env.SR()&&!C.mute)row.append(h("button",{class:"btn primary",onclick:function(){if(!last&&!C.msgs.length){aiTurn();return;}listen();}},"🎙️ Ярих"));
    else if(C.state==="idle"&&!C.msgs.length)row.append(h("button",{class:"btn primary",onclick:aiTurn},"🔄 Дахин оролдох"));
    row.append(h("button",{class:"btn",style:"background:var(--danger);color:#fff;border-color:var(--danger)",onclick:function(){hang(false);}},"📵 Дуусгах"));
    wrap.append(row);
    /* бичиж хариулах (яриа таних боломжгүй эсвэл чимээтэй орчинд) */
    if(C.state!=="think"&&last){
      var ti=h("input",{class:"tin",placeholder:"⌨️ Эсвэл бичиж хариул…","aria-label":"Бичиж хариулах",value:C.typed,style:"margin-top:10px"});
      ti.addEventListener("input",function(){C.typed=ti.value;});
      ti.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.isComposing){e.preventDefault();var v=C.typed;C.typed="";send(v);}});
      ti.addEventListener("focus",function(){if(C.state==="listen"){stopRec();C.state="idle";}});
      wrap.append(ti);
    }
    root.append(wrap);
  }
  function viewSum(root){
    var mine=C.msgs.filter(function(m){return m.role==="me";}),n=mine.length;
    var nw=mine.reduce(function(a,m){return a+words(m.text);},0),avg=n?Math.round(nw/n*10)/10:0;
    root.append(h("h2",null,"📞 Дуудлага дууслаа"));
    root.append(h("div",{class:"note",style:"text-align:center"},
      h("div",{style:"font-size:40px"},C.acc>=80?"🏆":"🎉"),
      h("div",{style:"font-weight:700"},fmt(C.dur)+" ярьсан · "+n+" удаа хариулсан"),
      h("div",{style:"display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 6px"},
        [[C.acc+"%","Нарийвчлал"],[String(nw),"Нийт үг"],[String(avg),"Үг / хариулт"]].map(function(s){
          return h("div",null,h("div",{style:"font-weight:800;font-size:22px"},s[0]),h("div",{class:"muted small"},s[1]));
        })),
      h("div",{class:"muted"},"+"+C.xp+" XP"+(n>=3&&C.acc>=80?" (нарийвчлалын бонус +5)":"")),
      avg&&avg<5?h("div",{class:"muted small",style:"margin-top:6px"},"💡 Дараагийн удаа арай урт, 2 өгүүлбэрээр хариулж үзээрэй."):null));
    root.append(h("h3",{style:"margin:16px 0 6px"},C.fixes.length?"✏️ Засварууд ("+C.fixes.length+")":"✅ Алдаа олдсонгүй. Гайхалтай!"));
    if(C.fixes.length&&env.mb)root.append(h("p",{class:"muted small",style:"margin:0 0 6px"},"Засварууд «Алдааны дэвтэр»-т хадгалагдлаа."));
    C.fixes.forEach(function(f){
      var fl=fixLine(f.fix);
      root.append(h("div",{class:"note",style:"margin:8px 0"},h("div",{class:"muted small"},"Чи: «"+f.said+"»"),h("div",{style:"margin-top:4px;white-space:pre-wrap"},f.fix),
        fl?h("button",{class:"btn ghost",style:"margin-top:6px;padding:4px 10px",onclick:function(){env.speak(fl,null,true);}},"🔊 Сонсох"):null));
    });
    root.append(h("div",{class:"row"},
      h("button",{class:"btn",onclick:function(){C=null;env.close();}},"Буцах"),
      h("button",{class:"btn primary",onclick:function(){start(C.topic);}},"📞 Дахин залгах")));
  }
  window.VoiceCall={
    view:function(e){
      env=e;h=e.h;var root=h("div");
      if(!C)C=fresh();
      if(C.stage==="pick")viewPick(root);else if(C.stage==="call")viewCall(root);else viewSum(root);
      return root;
    },
    stop:function(){hang(true);},
    /* өөр хэсгээс (ж: 🧳 аяллын бэлтгэл) шууд тодорхой сэдвээр залгах */
    begin:function(e,id){env=e;h=e.h;start(id);},
    active:function(){return !!(C&&C.stage==="call");}
  };
})();
