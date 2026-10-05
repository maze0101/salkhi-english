/* Салхи: ⏳ цаг хугацааны капсул — суралцагч өөрийнхөө тухай 60 хүртэл секунд ярьж бичүүлнэ.
   30 хоног тутам дахин бичүүлж, анхны ба сүүлийн бичлэгийг зэрэгцүүлэн сонсож, үгийн тоо, хурд, шинэ үгсийг харьцуулна,
   хүсвэл AI монголоор дүгнэнэ. Бичлэг зөвхөн энэ төхөөрөмж дээр (IndexedDB) хадгалагдана. */
(function(){
  var GAP=30,MAXS=60;
  var Q={
    en:["Who are you? Introduce yourself.","What do you like doing in your free time?","What did you do yesterday?","Why are you learning English?"],
    ja:["じこしょうかいを してください。","ひまな とき なにを しますか。","きのう なにを しましたか。","どうして にほんごを べんきょうしますか。"],
    ko:["자기소개를 해 주세요.","시간이 있을 때 뭐 해요?","어제 뭐 했어요?","왜 한국어를 배워요?"],
    zh:["请介绍一下你自己。","你有空的时候喜欢做什么？","你昨天做了什么？","你为什么学中文？"],
    ru:["Расскажите о себе.","Что вы любите делать в свободное время?","Что вы делали вчера?","Почему вы изучаете русский язык?"],
    de:["Stell dich bitte vor.","Was machst du gern in deiner Freizeit?","Was hast du gestern gemacht?","Warum lernst du Deutsch?"]
  };
  var QMN=["Өөрийгөө танилцуул","Чөлөөт цагаараа юу хийх дуртай вэ?","Өчигдөр юу хийсэн бэ?","Яагаад энэ хэлийг сурч байгаа вэ?"];
  var env=null,h=null,S={recs:null,err:"",rec:null,mode:"home",ai:null,aiBusy:false},DBP=null,urls={};

  function db(){
    if(DBP)return DBP;
    DBP=new Promise(function(ok,no){
      try{var r=indexedDB.open("salkhi-capsule",1);r.onupgradeneeded=function(){r.result.createObjectStore("cap",{keyPath:"id"});};r.onsuccess=function(){ok(r.result);};r.onerror=function(){no(r.error);};}catch(e){no(e);}
    });
    DBP.catch(function(){DBP=null;});
    return DBP;
  }
  function tx(mode,fn){return db().then(function(d){return new Promise(function(ok,no){var t=d.transaction("cap",mode),st=t.objectStore("cap"),r=fn(st);t.oncomplete=function(){ok(r&&r.result);};t.onerror=function(){no(t.error);};});});}
  function load(){
    tx("readonly",function(st){return st.getAll();}).then(function(all){S.recs=(all||[]).sort(function(a,b){return a.ts-b.ts;});paint();},
      function(){S.recs=[];S.err="Энэ төхөөрөмж дээр бичлэг хадгалах боломжгүй байна.";paint();});
  }
  function paint(){if(env)env.render();}
  function mine(){var L=env.lang();return (S.recs||[]).filter(function(r){return r.lang===L;});}
  function days(ts){return Math.floor((Date.now()-ts)/86400000);}
  function fmtD(ts){var d=new Date(ts);return d.getFullYear()+"."+String(d.getMonth()+1).padStart(2,"0")+"."+String(d.getDate()).padStart(2,"0");}
  function url(r){if(!urls[r.id])urls[r.id]=URL.createObjectURL(r.blob);return urls[r.id];}
  function words(t){
    t=String(t||"").toLowerCase().trim();if(!t)return [];
    if(/[぀-ヿ一-鿿]/.test(t))return Array.from(t.replace(/[\s、。！？!?,.]/g,""));
    return t.split(/[^\p{L}\p{N}'-]+/u).filter(Boolean);
  }
  function stats(r){
    var w=words(r.text),u={};w.forEach(function(x){u[x]=1;});
    return {n:w.length,u:Object.keys(u).length,wpm:r.dur?Math.round(w.length/(r.dur/60)):0,set:u};
  }

  /* ---------- бичих ---------- */
  function startRec(){
    if(!navigator.mediaDevices||!window.MediaRecorder){S.err="Энэ хөтөч дуу бичих боломжгүй байна.";paint();return;}
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      var mime=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"].filter(function(m){return MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m);})[0]||"";
      var mr=new MediaRecorder(stream,mime?{mimeType:mime}:undefined),chunks=[],R={mr:mr,t0:Date.now(),text:"",live:"",sr:null,stream:stream};
      mr.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
      mr.onstop=function(){
        stream.getTracks().forEach(function(t){t.stop();});
        if(R.sr)try{R.sr.stop();}catch(e){}
        clearInterval(R.tick);
        var dur=(Date.now()-R.t0)/1000;
        if(R.cancel||dur<3){S.rec=null;S.mode="home";paint();return;}
        var blob=new Blob(chunks,{type:mr.mimeType||mime||"audio/webm"});
        var rec={id:"c"+Date.now(),lang:env.lang(),ts:Date.now(),blob:blob,dur:Math.round(dur),text:(R.text+" "+R.live).trim()};
        tx("readwrite",function(st){return st.put(rec);}).then(function(){
          S.rec=null;S.mode="home";S.ai=null;S.recs.push(rec);env.reward(mine().length>1?15:10);paint();
          env.toast(mine().length>1?"⏳ Шинэ капсул хадгалагдлаа. Ахицаа хараарай!":"⏳ Анхны капсул хадгалагдлаа. 30 хоногийн дараа уулзъя!");
        },function(){S.rec=null;S.err="Хадгалж чадсангүй.";paint();});
      };
      /* яриа таних (боломжтой бол) — үг тоолох, AI дүгнэлтэд */
      var SR=env.SR();
      if(SR){try{
        var sr=new SR();sr.lang=env.srLang();sr.continuous=true;sr.interimResults=true;
        sr.onresult=function(e){var fin="",it="";for(var i=0;i<e.results.length;i++){if(e.results[i].isFinal)fin+=e.results[i][0].transcript+" ";else it+=e.results[i][0].transcript;}R.text=fin.trim();R.live=it;};
        sr.onend=function(){if(R.mr.state==="recording")try{sr.start();}catch(e){}};
        sr.onerror=function(){};
        sr.start();R.sr=sr;
      }catch(e){}}
      R.tick=setInterval(function(){
        var s=(Date.now()-R.t0)/1000,el=document.getElementById("capt");
        if(el)el.textContent=Math.floor(s)+" / "+MAXS+" сек";
        if(s>=MAXS&&mr.state==="recording")mr.stop();
      },250);
      S.rec=R;mr.start(250);paint();
    }).catch(function(){S.err=env.micHint();paint();});
  }
  function stopRec(cancel){var R=S.rec;if(!R)return;R.cancel=!!cancel;if(R.mr.state==="recording")R.mr.stop();}

  /* ---------- AI харьцуулалт ---------- */
  function askAI(a,b){
    S.aiBusy=true;S.ai=null;paint();
    var LN=env.langEn(),p="A Mongolian learner of "+LN+" recorded themselves speaking freely twice, "+days(a.ts)+" days apart. Speech-recognition transcripts:\nFIRST ("+fmtD(a.ts)+", "+a.dur+"s): "+(a.text||"(empty)")+"\nLATEST ("+fmtD(b.ts)+", "+b.dur+"s): "+(b.text||"(empty)")+
      "\n\nWrite 4 short sentences IN MONGOLIAN (Cyrillic) for the learner: what clearly improved (vocabulary, sentence length, tenses, fluency), one thing still to work on with one concrete "+LN+" example, and warm encouragement. Ignore punctuation and recognition errors. No markdown.";
    Promise.resolve(env.ai([{role:"user",content:p}])).then(function(t){S.aiBusy=false;S.ai=t||"AI одоогоор холбогдсонгүй.";paint();},function(){S.aiBusy=false;S.ai="AI одоогоор холбогдсонгүй.";paint();});
  }

  /* ---------- дэлгэц ---------- */
  function card(e,open){
    env=e;h=e.h;
    if(!window.indexedDB)return null;
    if(!S.recs){load();return h("div");}
    var m=mine(),last=m[m.length-1],due=last&&days(last.ts)>=GAP;
    return h("button",{class:"lrow",type:"button",style:"margin-top:12px"+(due?";border-color:var(--sky)":""),onclick:open},
      h("span",{class:"hexb ico"},"⏳"),
      h("span",{style:"flex:1;text-align:left"},h("div",{class:"t"},"Цаг хугацааны капсул"+(due?" · шинэ капсул нээх цаг боллоо!":"")),
        h("div",{class:"muted small"},!m.length?"Өнөөдрийн ярианаасаа бичүүлж хадгал. 30 хоногийн дараа ахицаа сонс.":m.length+" капсул · дараагийнх "+(due?"одоо":Math.max(1,GAP-days(last.ts))+" хоногийн дараа"))),
      h("span",{"aria-hidden":"true"},"›"));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    if(!S.recs){load();root.append(h("p",{class:"muted"},"Ачаалж байна…"));return root;}
    root.append(h("button",{class:"back",onclick:function(){if(S.rec)stopRec(true);S.mode="home";e.close();}},"‹ "+e.back()));
    root.append(h("h2",null,"⏳ Цаг хугацааны капсул"));
    if(S.err)root.append(h("div",{class:"fb bad"},S.err));
    var m=mine(),qs=Q[env.lang()]||Q.en;
    if(S.mode==="rec"){
      root.append(h("p",{class:"muted"},"Доорх асуултуудад "+env.langName().toLowerCase()+" хэлээр чөлөөтэй хариул. Алдаа гаргахаас бүү ай, энэ бол зөвхөн чамд зориулсан бичлэг."));
      var ql=h("div",{class:"note"});
      qs.forEach(function(q,i){ql.append(h("div",{style:"margin:4px 0"},h("b",null,q),h("div",{class:"muted small"},QMN[i])));});
      root.append(ql);
      if(!S.rec){
        root.append(h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.mode="home";paint();}},"Болих"),h("button",{class:"btn primary",onclick:startRec},"🎙️ Бичиж эхлэх")));
      }else{
        root.append(h("div",{class:"vcorb on",style:"margin-top:14px","aria-hidden":"true"},"🎙️"));
        root.append(h("div",{id:"capt",style:"text-align:center;font-weight:700"},"0 / "+MAXS+" сек"));
        root.append(h("div",{class:"row"},h("button",{class:"btn",onclick:function(){stopRec(true);}},"Цуцлах"),h("button",{class:"btn primary",onclick:function(){stopRec(false);}},"⏹ Дуусгах")));
      }
      return root;
    }
    var last=m[m.length-1];
    root.append(h("p",{class:"muted"},"Анхны бичлэгээ хадгалаад, 30 хоног тутам дахин ярь. Өнөөдрийн чи өмнөх өөрийгөө хэр гүйцсэнийг сонсоорой."));
    if(!m.length){
      root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:8px",onclick:function(){S.mode="rec";S.err="";paint();}},"🎙️ Анхны капсулаа бичих"));
      return root;
    }
    var due=days(last.ts)>=GAP;
    root.append(h("button",{class:"btn"+(due?" primary":""),style:"width:100%;margin-top:8px",onclick:function(){S.mode="rec";S.err="";paint();}},due?"🎙️ Шинэ капсул бичих":"🎙️ Одоо дахин бичих ("+(GAP-days(last.ts))+" хоног эрт)"));
    if(m.length>=2){
      var a=m[0],b=last,sa=stats(a),sb=stats(b),fresh=Object.keys(sb.set).filter(function(x){return !sa.set[x];});
      root.append(h("h3",{style:"margin:18px 0 6px"},"📈 Анхны чи vs одоогийн чи ("+days(a.ts)+" хоног)"));
      var tbl=h("div",{style:"display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:6px;font-size:14px"});
      [["",fmtD(a.ts),fmtD(b.ts)],["⏱ Хугацаа",a.dur+" сек",b.dur+" сек"],["💬 Хэлсэн үг",String(sa.n),String(sb.n)],["🔤 Өөр өөр үг",String(sa.u),String(sb.u)],["⚡ Үг/минут",String(sa.wpm),String(sb.wpm)]].forEach(function(r,i){
        r.forEach(function(c,j){tbl.append(h("div",{style:(i===0?"font-weight:700;":"")+(j===2&&i>0&&parseFloat(r[2])>parseFloat(r[1])?"color:var(--ok);font-weight:700":"")},c+(j===2&&i>0&&parseFloat(r[2])>parseFloat(r[1])?" ▲":"")));});
      });
      root.append(h("div",{class:"note"},tbl,
        h("div",{class:"row"},h("audio",{controls:true,src:url(a),preload:"none",style:"width:100%"})),
        h("div",{class:"row",style:"margin-top:4px"},h("audio",{controls:true,src:url(b),preload:"none",style:"width:100%"}))));
      if(fresh.length)root.append(h("div",{class:"note small"},h("b",null,"✨ Шинээр хэрэглэсэн үгс: "),fresh.slice(0,20).join(", ")));
      if(!a.text&&!b.text)root.append(h("p",{class:"muted small"},"Яриа таних боломжгүй байсан тул үгийн тоог тооцож чадсангүй. Бичлэгээ сонсож харьцуулаарай."));
      else if(S.ai)root.append(h("div",{class:"note",style:"white-space:pre-wrap"},"🤖 "+S.ai));
      else root.append(h("button",{class:"btn",style:"width:100%",disabled:S.aiBusy,onclick:function(){askAI(a,b);}},S.aiBusy?"AI дүгнэж байна…":"🤖 AI-аар ахицаа дүгнүүлэх"));
    }
    root.append(h("h3",{style:"margin:18px 0 6px"},"🗂 Бүх капсул"));
    m.slice().reverse().forEach(function(r){
      root.append(h("div",{class:"note",style:"margin:8px 0"},
        h("div",{style:"display:flex;align-items:center;gap:8px"},h("b",{style:"flex:1"},fmtD(r.ts)+" · "+r.dur+" сек"),
          h("button",{class:"btn ghost",style:"padding:4px 10px","aria-label":"Устгах",onclick:function(){
            if(S.rm!==r.id){S.rm=r.id;env.toast("Дахин дарвал энэ бичлэг устгагдана");return;}
            tx("readwrite",function(st){return st.delete(r.id);}).then(function(){S.recs=S.recs.filter(function(x){return x.id!==r.id;});S.ai=null;paint();});
          }},"🗑")),
        h("audio",{controls:true,src:url(r),preload:"none",style:"width:100%;margin-top:6px"}),
        r.text?h("div",{class:"muted small",style:"margin-top:4px"},"«"+r.text+"»"):null));
    });
    return root;
  }
  window.Capsule={card:card,view:view,
    due:function(e){env=e;h=e.h;if(!S.recs)return false;var m=mine(),l=m[m.length-1];return !!(l&&days(l.ts)>=GAP);},
    stop:function(){if(S.rec)stopRec(true);}};
})();
