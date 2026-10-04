/* Салхи: 🎙 дуу хоолойн тэмдэглэл — өдөр бүр нэг тогтмол өгүүлбэрийг бичүүлж хадгална (IndexedDB, зөвхөн энэ төхөөрөмж дээр).
   Ижил өгүүлбэрийн эхний ба сүүлийн бичлэгийг зэрэгцүүлж сонсоход ахиц илт сонсогдоно. Эцэг эхтэй файлаар хуваалцана. */
(function(){
  /* хэл бүрт 5 тогтмол өгүүлбэр: өдрөөр ээлжилнэ, ингэснээр нэг өгүүлбэр сар бүр хэд хэдэн удаа бичигдэнэ */
  var SENT={
    en:[["Hello! My name is Saraa and I live in Mongolia.","Сайн байна уу! Намайг Сараа гэдэг, би Монголд амьдардаг."],["I like reading books and playing with my friends.","Би ном унших, найзуудтайгаа тоглох дуртай."],["Yesterday the weather was cold, but today it is sunny.","Өчигдөр хүйтэн байсан ч өнөөдөр нартай байна."],["Could you tell me where the library is, please?","Номын сан хаана байгааг хэлж өгөөч?"],["When I grow up, I want to travel around the world.","Томоод би дэлхийгээр аялмаар байна."]],
    ja:[["こんにちは。わたしはサラです。モンゴルにすんでいます。","Сайн байна уу. Би Сараа. Монголд амьдардаг."],["ほんをよむのと、ともだちとあそぶのがすきです。","Ном унших, найзуудтайгаа тоглох дуртай."],["きのうはさむかったですが、きょうははれています。","Өчигдөр хүйтэн байсан ч өнөөдөр цэлмэг байна."],["としょかんはどこですか。おしえてください。","Номын сан хаана вэ? Хэлж өгөөч."],["おおきくなったら、せかいをりょこうしたいです。","Томоод дэлхийгээр аялмаар байна."]],
    ko:[["안녕하세요. 저는 사라예요. 몽골에 살아요.","Сайн байна уу. Би Сараа. Монголд амьдардаг."],["저는 책 읽기와 친구들과 노는 것을 좋아해요.","Би ном унших, найзуудтайгаа тоглох дуртай."],["어제는 추웠지만 오늘은 날씨가 맑아요.","Өчигдөр хүйтэн байсан ч өнөөдөр цэлмэг байна."],["도서관이 어디에 있는지 알려 주세요.","Номын сан хаана байгааг хэлж өгөөч."],["커서 세계 여행을 하고 싶어요.","Томоод дэлхийгээр аялмаар байна."]],
    zh:[["你好！我叫萨拉，我住在蒙古。","Сайн байна уу! Намайг Сараа гэдэг, Монголд амьдардаг."],["我喜欢看书，也喜欢和朋友一起玩。","Би ном унших, найзуудтайгаа тоглох дуртай."],["昨天很冷，可是今天天气很好。","Өчигдөр хүйтэн байсан ч өнөөдөр цаг агаар сайхан."],["请问，图书馆在哪儿？","Уучлаарай, номын сан хаана байдаг вэ?"],["长大以后，我想去世界各地旅行。","Томоод дэлхийгээр аялмаар байна."]],
    ru:[["Здравствуйте! Меня зовут Сара, я живу в Монголии.","Сайн байна уу! Намайг Сараа гэдэг, би Монголд амьдардаг."],["Я люблю читать книги и играть с друзьями.","Би ном унших, найзуудтайгаа тоглох дуртай."],["Вчера было холодно, а сегодня солнечно.","Өчигдөр хүйтэн байсан бол өнөөдөр нартай."],["Скажите, пожалуйста, где находится библиотека?","Номын сан хаана байдгийг хэлж өгөөч?"],["Когда я вырасту, я хочу путешествовать по миру.","Томоод би дэлхийгээр аялмаар байна."]],
    de:[["Hallo! Ich heiße Sara und wohne in der Mongolei.","Сайн байна уу! Намайг Сараа гэдэг, Монголд амьдардаг."],["Ich lese gern Bücher und spiele mit meinen Freunden.","Би ном унших, найзуудтайгаа тоглох дуртай."],["Gestern war es kalt, aber heute scheint die Sonne.","Өчигдөр хүйтэн байсан ч өнөөдөр нартай."],["Können Sie mir sagen, wo die Bibliothek ist?","Номын сан хаана байгааг хэлж өгөхгүй юу?"],["Wenn ich groß bin, möchte ich um die Welt reisen.","Томоод дэлхийгээр аялмаар байна."]]
  };
  var env=null,h=null,S={recs:null,rec:null,err:"",sid:null},DBP=null;
  function db(){
    if(DBP)return DBP;
    DBP=new Promise(function(ok,no){
      try{var r=indexedDB.open("salkhi-voice",1);r.onupgradeneeded=function(){r.result.createObjectStore("rec",{keyPath:"id"});};r.onsuccess=function(){ok(r.result);};r.onerror=function(){no(r.error);};}catch(e){no(e);}
    });
    DBP.catch(function(){DBP=null;});
    return DBP;
  }
  function tx(mode,fn){return db().then(function(d){return new Promise(function(ok,no){var t=d.transaction("rec",mode),st=t.objectStore("rec"),r=fn(st);t.oncomplete=function(){ok(r&&r.result);};t.onerror=function(){no(t.error);};});});}
  function load(){
    tx("readonly",function(st){return st.getAll();}).then(function(all){S.recs=(all||[]).sort(function(a,b){return a.ts-b.ts;});env.render();},function(){S.recs=[];S.err="Энэ төхөөрөмж дээр бичлэг хадгалах боломжгүй байна.";env.render();});
  }
  function today(){var d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);}
  function todaySid(){return today()%5;}
  function mine(){var L=env.lang();return (S.recs||[]).filter(function(r){return r.lang===L;});}
  function ext(t){return /mp4|aac|m4a/.test(t)?"m4a":/ogg/.test(t)?"ogg":"webm";}
  function fmt(ts){var d=new Date(ts);return d.getFullYear()+"."+String(d.getMonth()+1).padStart(2,"0")+"."+String(d.getDate()).padStart(2,"0");}
  var cur=null;
  function play(r){stop();var u=URL.createObjectURL(r.blob);cur=new Audio(u);cur.onended=function(){URL.revokeObjectURL(u);};cur.play().catch(function(){});return cur;}
  function stop(){if(cur){try{cur.pause();}catch(e){}cur=null;}}
  function playPair(a,b){var x=play(a);x.onended=function(){setTimeout(function(){play(b);},600);};}
  function record(sid){
    if(S.rec){S.rec.stop();return;}
    if(!navigator.mediaDevices||!window.MediaRecorder){S.err="Энэ хөтөч дуу бичихийг дэмжихгүй байна.";env.render();return;}
    stop();
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      var mr=new MediaRecorder(stream),chunks=[];
      mr.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
      mr.onstop=function(){
        clearTimeout(S.tm);stream.getTracks().forEach(function(t){t.stop();});S.rec=null;
        var blob=new Blob(chunks,{type:mr.mimeType||"audio/webm"});
        if(blob.size<800){S.err="Бичлэг хэт богино байна. Дахин оролдоно уу.";env.render();return;}
        var r={id:Date.now()+"-"+Math.random().toString(36).slice(2,6),ts:Date.now(),lang:env.lang(),sid:sid,blob:blob};
        tx("readwrite",function(st){return st.put(r);}).then(function(){
          var first=!mine().some(function(x){return Math.floor(x.ts/86400000)===Math.floor(r.ts/86400000);});
          S.recs.push(r);if(first)env.addXP(5);env.toast("🎙 Хадгалагдлаа");env.render();
        },function(){S.err="Хадгалж чадсангүй (санах ой дүүрсэн байж магадгүй).";env.render();});
      };
      S.rec=mr;S.err="";mr.start();S.tm=setTimeout(function(){if(mr.state==="recording")mr.stop();},20000);env.render();
    },function(){S.err="Микрофоны зөвшөөрөл өгөөгүй байна. Хөтчийн тохиргооноос зөвшөөрнө үү.";env.render();});
  }
  function share(a,b){
    var files=[a,b].filter(Boolean).map(function(r,i){return new File([r.blob],"salkhi-"+(i?"odoo":"ehend")+"-"+fmt(r.ts)+"."+ext(r.blob.type),{type:r.blob.type||"audio/webm"});});
    var text="Салхи: миний "+({en:"англи",ja:"япон",ko:"солонгос",zh:"хятад",ru:"орос",de:"герман"}[env.lang()])+" хэлний ахиц — "+fmt(a.ts)+" ба "+fmt(b.ts)+"-ны бичлэг 🎙";
    if(navigator.canShare&&navigator.canShare({files:files})){navigator.share({files:files,text:text}).catch(function(){});return;}
    files.forEach(function(f){var u=URL.createObjectURL(f),l=document.createElement("a");l.href=u;l.download=f.name;document.body.append(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u);},4000);});
    env.toast("Бичлэгүүд татагдлаа — эцэг эхдээ илгээгээрэй");
  }
  function del(r){
    if(!confirm(fmt(r.ts)+"-ны бичлэгийг устгах уу?"))return;
    tx("readwrite",function(st){return st.delete(r.id);}).then(function(){S.recs=S.recs.filter(function(x){return x!==r;});env.render();});
  }
  function view(root){
    var L=env.lang(),SS=SENT[L]||SENT.en,sid=S.sid==null?todaySid():S.sid,s=SS[sid],M=mine(),doneToday=M.some(function(r){return Math.floor((r.ts-new Date().getTimezoneOffset()*60000)/86400000)===today();});
    root.append(h("p",{class:"muted"},"Өдөр бүр нэг өгүүлбэр бичүүлээрэй. Хэдэн долоо хоногийн дараа эхний бичлэгтэйгээ харьцуулж сонсоход ахиц тань сонсогдоно. Бичлэг зөвхөн энэ төхөөрөмж дээр хадгалагдана."));
    var card=h("div",{class:"note",style:"text-align:center"},
      h("div",{class:"muted small"},(doneToday?"✅ Өнөөдрийн бичлэг хийгдсэн · ":"📅 Өнөөдрийн өгүүлбэр · ")+(sid+1)+" / 5"),
      h("div",{style:"font-size:20px;font-weight:800;margin:8px 0;line-height:1.4"},s[0]),h("div",{class:"muted small"},s[1]),
      h("div",{class:"row",style:"justify-content:center;flex-wrap:wrap"},
        h("button",{class:"btn",onclick:function(){env.speak(s[0]);}},"🔊 Жишээ сонсох"),
        h("button",{class:"btn primary",style:S.rec?"background:var(--danger);border-color:var(--danger);color:#fff":"",onclick:function(){record(sid);}},S.rec?"⏹ Зогсоох":"🎙 Бичүүлэх")));
    root.append(card);
    root.append(h("div",{class:"seg",style:"margin-top:8px;flex-wrap:wrap"},SS.map(function(x,i){return h("button",{"aria-pressed":String(sid===i),"aria-label":"Өгүүлбэр "+(i+1),onclick:function(){S.sid=i;env.render();}},String(i+1));})));
    if(S.rec)root.append(h("div",{class:"fb"},"🔴 Бичиж байна… өгүүлбэрээ уншаад «Зогсоох» дарна уу (дээд тал 20 сек)."));
    if(S.err)root.append(h("div",{class:"fb bad"},S.err));
    var same=M.filter(function(r){return r.sid===sid;});
    if(same.length>=2){
      var a=same[0],b=same[same.length-1],days=Math.max(1,Math.round((b.ts-a.ts)/86400000));
      root.append(h("div",{class:"note",style:"margin-top:12px"},h("b",null,"📈 Ахицаа сонс"),
        h("div",{class:"muted small",style:"margin:4px 0 8px"},"Энэ өгүүлбэрийн эхний ("+fmt(a.ts)+") ба сүүлийн ("+fmt(b.ts)+") бичлэг · "+days+" хоногийн зөрүү"),
        h("div",{class:"row",style:"flex-wrap:wrap"},
          h("button",{class:"btn",onclick:function(){play(a);}},"▶️ Эхэнд"),h("button",{class:"btn",onclick:function(){play(b);}},"▶️ Одоо"),
          h("button",{class:"btn primary",onclick:function(){playPair(a,b);}},"🔁 Дараалан"),
          h("button",{class:"btn ghost",onclick:function(){share(a,b);}},"📤 Эцэг эхэд илгээх"))));
    }
    var days=Object.keys(M.reduce(function(o,r){o[fmt(r.ts)]=1;return o;},{})).length;
    root.append(h("h3",{style:"margin:18px 0 6px"},"🗂 Бичлэгүүд ("+M.length+" · "+days+" өдөр)"));
    if(!M.length)root.append(h("p",{class:"muted small"},"Одоогоор бичлэг алга. Эхний бичлэгээ хийгээрэй!"));
    M.slice().reverse().slice(0,40).forEach(function(r){
      root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},fmt(r.ts)+" · №"+(r.sid+1),h("div",{class:"muted small"},(SS[r.sid]||["",""])[0].slice(0,46))),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Тоглуулах",onclick:function(){play(r);}},"▶️"),
        h("button",{class:"btn ghost",style:"padding:6px 10px;flex:none","aria-label":"Устгах",onclick:function(){del(r);}},"🗑")));
    });
  }
  window.VoiceDiary={
    card:function(e,open){
      env=e;h=e.h;if(!S.recs)load();
      var n=mine().length;
      return h("button",{class:"lrow",type:"button",style:"margin-top:12px",onclick:open},
        h("span",{class:"hexb ico"},"🎙"),h("span",{style:"flex:1"},h("div",{class:"t"},"Дуу хоолойн тэмдэглэл"),h("div",{class:"muted small"},n?n+" бичлэг · ахицаа сонсох":"Өдөр бүр нэг өгүүлбэр бичүүлж ахицаа сонс")),h("span",{"aria-hidden":"true"},"›"));
    },
    view:function(e){
      env=e;h=e.h;var root=h("div");
      root.append(h("button",{class:"back",onclick:function(){if(S.rec)S.rec.stop();stop();S.sid=null;env.close();}},"‹ Профайл"),h("h2",null,"🎙 Дуу хоолойн тэмдэглэл"));
      if(!S.recs){load();root.append(h("p",{class:"muted"},"Ачаалж байна…"));return root;}
      view(root);return root;
    }
  };
})();
