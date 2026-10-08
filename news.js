/* Салхи: 📰 хялбаршуулсан мэдээ — өдрийн бодит мэдээний гарчиг, товчийг (BBC/DW + Монголын тухай) worker-ийн /news-ээс авч,
   дарахад AI суралцагчийн түвшинд 4-6 өгүүлбэрээр дахин бичнэ (зөвхөн эх мэдээний баримтаар), монгол орчуулга, гол үгс, 1 асуулттай. */
(function(){
  var CK="newsc",env=null,h=null,N={items:null,lang:null,err:"",cur:null,busy:false,pick:null,showMn:false};
  function cache(){var c=env.sget(CK,{});return c&&typeof c==="object"?c:{};}
  function load(){
    N.items=null;N.err="";N.lang=env.lang();
    var u=env.newsURL();if(!u){N.err="Мэдээний үйлчилгээ тохируулаагүй байна.";N.items=[];return;}
    fetch(u+"?lang="+env.lang()).then(function(r){return r.ok?r.json():null;}).then(function(j){
      N.items=j&&Array.isArray(j.items)?j.items:[];if(!N.items.length)N.err="Одоогоор мэдээ татаж чадсангүй.";env.render();
    }).catch(function(){N.items=[];N.err="Интернэт холболтоо шалгаарай.";env.render();});
  }
  /* AI-н хариу: мөр бүрийн формат (TITLE:/TEXT:/MN:/WORD:/Q:/A:/B:/C:/ANSWER:) — үнэгүй загвар JSON-ийг ихэвчлэн эвддэг тул.
     Хуучин кэш эсвэл өөр AI JSON буцаавал түүнийг ч уншина. */
  function parse(t){
    t=String(t||"").replace(/```[a-z]*\n?/gi,"");
    var o={words:[],o:[]},abc={A:0,B:1,C:2};
    t.split(/\r?\n/).forEach(function(l){
      var m=/^\s*\**\s*(TITLE|TEXT|MN|WORD|Q|A|B|C|ANSWER)\s*\**\s*[:：]\s*(.*)$/i.exec(l);if(!m)return;
      var k=m[1].toUpperCase(),v=m[2].trim();if(!v)return;
      if(k==="TITLE")o.title=v;else if(k==="TEXT")o.text=v;else if(k==="MN")o.mn=v;else if(k==="Q")o.q=v;
      else if(k==="WORD"){var p=v.split(/\s+[=—–-]\s+|\s*=\s*/);if(p[0]&&p[1])o.words.push([p[0].trim(),p.slice(1).join(" ").trim()]);}
      else if(k in abc)o.o[abc[k]]=v;
      else if(k==="ANSWER"){var a=/[ABC]/i.exec(v);if(a)o.a=abc[a[0].toUpperCase()];}
    });
    if(o.text){if(!(o.o.length===3&&o.o[0]&&o.o[1]&&o.o[2]&&o.a!=null)){delete o.q;o.o=[];delete o.a;}return o;}
    var m=t.match(/\{[\s\S]*\}/);if(!m)return null;
    try{var j=JSON.parse(m[0]);return j&&j.text?j:null;}catch(e){return null;}
  }
  function open(it){
    var key=env.lang()+"|"+env.lvCode()+"|"+it.link,c=cache();
    N.cur={it:it,key:key,art:c[key]||null};N.pick=null;N.showMn=false;env.render();window.scrollTo(0,0);
    if(N.cur.art)return;
    N.busy=true;
    var LN=env.langEn(),cjk=["ja","ko","zh"].indexOf(env.lang())>=0;
    var q="Rewrite this real news item for a Mongolian learner of "+LN+" at level "+env.level()+".\nHeadline: "+it.t+"\nSummary: "+(it.d||"(none)")+"\n"+
      "Rules: write in "+LN+(env.lang()==="zh"?" (Simplified Chinese)":"")+", 4-6 short, clear sentences. Use ONLY facts from the headline and summary; do not invent names, numbers or details. If it is short, explain the background in general words.\n"+
      "Answer in EXACTLY this plain-text format, one item per line, no JSON, no markdown:\n"+
      "TITLE: <simple "+LN+" title>\nTEXT: <the simplified article on one line"+(cjk?", with romanization in parentheses after each sentence":"")+">\nMN: <natural Mongolian (Cyrillic) translation of TEXT, on one line>\n"+
      "WORD: <key "+LN+" word> = <Mongolian meaning>\nWORD: ...\nWORD: ...\nWORD: ...\nWORD: ...\n"+
      "Q: <one comprehension question in Mongolian>\nA: <answer option in Mongolian>\nB: <answer option>\nC: <answer option>\nANSWER: <A, B or C>";
    var cur=N.cur,tries=0;
    /* нямбай горим (task:"check" — бага temperature, урт хариу); формат эвдэрвэл нэг удаа дахин оролдоно */
    (function ask(){
      Promise.resolve(env.ai([{role:"user",content:q}],{task:"check"})).then(function(r){
        if(N.cur!==cur){N.busy=false;return;}
        var j=parse(r);
        if(!j&&r&&++tries<2){ask();return;}
        N.busy=false;
        if(!j){cur.err=r?"AI мэдээг хялбаршуулж чадсангүй.":"AI-тай холбогдож чадсангүй. Түр хүлээгээд дахин оролдоно уу.";env.render();return;}
        cur.art=j;var c2=cache();c2[key]=j;var ks=Object.keys(c2);if(ks.length>30)delete c2[ks[0]];env.sset(CK,c2);env.render();
      });
    })();
  }
  function viewArt(root){
    var cur=N.cur,a=cur.art,it=cur.it;
    root.append(h("button",{class:"back",onclick:function(){env.stop();N.cur=null;env.render();}},"‹ Мэдээ"));
    if(cur.err){root.append(h("div",{class:"fb bad"},cur.err),h("button",{class:"btn",onclick:function(){open(it);}},"🔄 Дахин оролдох"));return;}
    if(!a){root.append(h("p",{class:"muted"},"🤖 Мэдээг таны түвшинд хялбаршуулж байна…"),h("p",{class:"small"},it.t));return;}
    root.append(h("h2",{style:"margin-bottom:4px"},a.title||it.t));
    root.append(h("div",{class:"muted small"},(it.mn?"🇲🇳 ":"")+it.src+(it.ts?" · "+new Date(it.ts).toLocaleDateString():"")));
    var box=h("div",{class:"note",style:"margin-top:10px"},h("div",{style:"font-size:17px;line-height:1.6;white-space:pre-wrap"},a.text));
    box.append(h("div",{class:"row",style:"margin-top:8px"},h("button",{class:"btn ghost",onclick:function(){env.speak(env.clean(a.text));}},"🔊 Сонсох"),
      h("button",{class:"btn ghost",onclick:function(){N.showMn=!N.showMn;env.render();}},N.showMn?"🇲🇳 Нуух":"🇲🇳 Орчуулга")));
    if(N.showMn&&a.mn)box.append(h("div",{class:"muted",style:"margin-top:6px;white-space:pre-wrap"},a.mn));
    root.append(box);
    var ws=(Array.isArray(a.words)?a.words:[]).filter(function(w){return Array.isArray(w)&&w[0];});
    if(ws.length){
      root.append(h("h3",{style:"margin:14px 0 6px"},"🔑 Гол үгс"));
      ws.forEach(function(w){
        var has=env.hasWord(w[0]);
        root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},h("b",null,w[0]),h("span",{class:"muted"}," — "+(w[1]||""))),env.speakBtn(w[0]),
          has?h("span",{class:"muted small"},"✅"):h("button",{class:"btn ghost",style:"padding:4px 10px","aria-label":"Миний үгс-д нэмэх",onclick:function(){env.addWord(w[0],w[1]||"","","","");env.toast("➕ «Миний үгс»-д нэмэгдлээ");env.render();}},"➕")));
      });
    }
    if(a.q&&Array.isArray(a.o)&&a.o.length>=2){
      root.append(h("h3",{style:"margin:14px 0 6px"},"❓ "+a.q));
      a.o.forEach(function(o,i){
        var cls="opt"+(N.pick!=null?(i===+a.a?" ok":i===N.pick?" bad":""):"");
        root.append(h("button",{class:cls,disabled:N.pick!=null,onclick:function(){N.pick=i;if(i===+a.a){env.addXP(5);env.celebrate();}else env.addXP(1);env.logAct("r");env.render();}},o));
      });
      if(N.pick!=null)root.append(h("div",{class:"fb "+(N.pick===+a.a?"ok":"bad")},N.pick===+a.a?"Зөв! 🎉":"Зөв хариулт: "+a.o[+a.a]));
    }
    root.append(h("a",{href:it.link,target:"_blank",rel:"noopener",class:"muted small",style:"display:block;margin-top:14px"},"Эх мэдээг унших ↗"));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    if(N.cur){viewArt(root);return root;}
    if(N.items===null||N.lang!==e.lang())load();
    root.append(h("p",{class:"muted"},"Өнөөдрийн бодит мэдээг таны түвшинд ("+e.lvName()+") хялбаршуулж уншуулна."));
    if(N.err)root.append(h("div",{class:"fb bad"},N.err));
    if(!N.items){root.append(h("p",{class:"muted"},"Ачаалж байна…"));return root;}
    N.items.forEach(function(it){
      var done=!!cache()[e.lang()+"|"+e.lvCode()+"|"+it.link];
      root.append(h("button",{class:"lrow",type:"button",style:"margin-top:8px",onclick:function(){open(it);}},
        h("span",{class:"hexb ico"},it.mn?"🇲🇳":"📰"),
        h("span",{style:"flex:1;text-align:left;min-width:0"},h("div",{class:"t",style:"overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical"},it.t),
          h("div",{class:"muted small"},it.src+(done?" · ✅ уншсан":""))),
        h("span",{"aria-hidden":"true"},"›")));
    });
    root.append(h("button",{class:"btn ghost",style:"width:100%;margin-top:10px",onclick:function(){load();e.render();}},"🔄 Шинэчлэх"));
    return root;
  }
  window.News={view:view};
})();
