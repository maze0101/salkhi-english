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
  function parse(t){var m=String(t||"").match(/\{[\s\S]*\}/);if(!m)return null;try{var j=JSON.parse(m[0]);return j&&j.text?j:null;}catch(e){return null;}}
  function open(it){
    var key=env.lang()+"|"+env.lvCode()+"|"+it.link,c=cache();
    N.cur={it:it,key:key,art:c[key]||null};N.pick=null;N.showMn=false;env.render();window.scrollTo(0,0);
    if(N.cur.art)return;
    N.busy=true;
    var LN=env.langEn(),cjk=["ja","ko","zh"].indexOf(env.lang())>=0;
    var q="Rewrite this real news item for a Mongolian learner of "+LN+" at level "+env.level()+".\nHeadline: "+it.t+"\nSummary: "+(it.d||"(none)")+"\n"+
      "Rules: write in "+LN+(env.lang()==="zh"?" (Simplified Chinese)":"")+", 4-6 short, clear sentences. Use ONLY facts from the headline and summary; do not invent names, numbers or details. If it is short, explain the background in general words.\n"+
      "Reply with ONLY JSON: {\"title\":\"<simple "+LN+" title>\",\"text\":\"<the simplified article"+(cjk?" with romanization in parentheses after each sentence":"")+">\",\"mn\":\"<Mongolian (Cyrillic) translation>\","+
      "\"words\":[[\"<key "+LN+" word>\",\"<Mongolian>\"],[\"...\",\"...\"],[\"...\",\"...\"],[\"...\",\"...\"],[\"...\",\"...\"]],\"q\":\"<one comprehension question in Mongolian>\",\"o\":[\"<answer A in Mongolian>\",\"<B>\",\"<C>\"],\"a\":<index 0-2 of the correct answer>}";
    var cur=N.cur;
    Promise.resolve(env.ai([{role:"user",content:q}])).then(function(r){
      N.busy=false;if(N.cur!==cur)return;
      var j=parse(r);
      if(!j){cur.err="AI мэдээг хялбаршуулж чадсангүй.";env.render();return;}
      cur.art=j;var c2=cache();c2[key]=j;var ks=Object.keys(c2);if(ks.length>30)delete c2[ks[0]];env.sset(CK,c2);env.render();
    });
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
