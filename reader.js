/* Салхи: 📄 Өөрийн бичвэрээр сурах — нийтлэл, дууны үг, хадмалаа буулгахад үг бүрийг толь бичигтэй тулгана:
   мэддэг үг (энгийн), толь бичигт байгаа шинэ үг (цэнхэр), толь бичигт байхгүй үг (тасархай доогуур зураас → AI-аас асууна).
   Үг дээр дарахад утга, дуудлага, 🔖 хадгалах / ➕ миний үгсэд нэмэх. CJK (zh, ja) зайгүй тул толь бичгээр хамгийн урт тааралтаар хуваана.
   Сүүлийн 5 бичвэр localStorage-д (синк хийхгүй — том байж болно). Бичвэрээ уншиж дуусгавал +5 XP. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var MAX=5000,LS="salkhi:rdTexts",env=null,h=null,R={text:null,sel:null,ai:{},busy:{},mnDraft:{},doneKey:""};
  var CJK=/[぀-ヿ㐀-鿿豈-﫿ㇰ-ㇿｦ-ﾟ]/;
  var KO_PART=["에서는","에게서","으로는","에서","에게","한테","께서","까지","부터","으로","처럼","보다","하고","이랑","은","는","이","가","을","를","에","도","와","과","의","로","만","요","랑"];
  function lsGet(){try{var a=JSON.parse(localStorage.getItem(LS));return Array.isArray(a)?a:[];}catch(e){return [];}}
  function lsSet(a){try{localStorage.setItem(LS,JSON.stringify(a.slice(0,5)));}catch(e){}}
  function norm(s){return String(s).toLowerCase().replace(/[’]/g,"'").trim();}
  /* толь бичгийн индекс: үг (жижиг үсгээр), артикльгүй хэлбэр, дуудлага (ja кана) */
  function index(){
    var lang=env.lang();
    if(R.ix&&R.ix.lang===lang&&R.ix.n===env.all().length)return R.ix;
    var m={},max=1;
    env.all().forEach(function(w){
      var keys=[norm(w[1])];
      var bare=norm(w[1]).replace(/^(to|the|a|an|der|die|das|sich)\s+/,"");if(bare!==keys[0])keys.push(bare);
      if(lang==="ja"&&w[7]&&/^[぀-ヿ]+$/.test(w[7]))keys.push(w[7]);
      keys.forEach(function(k){if(k&&!m[k]){m[k]=w;var L=Array.from(k).length;if(CJK.test(k)&&L>max)max=L;}});
    });
    R.ix={lang:lang,n:env.all().length,m:m,max:Math.min(max,10)};
    return R.ix;
  }
  /* англи: хэлбэрийг үндэс рүү (cats→cat, studied→study, making→make, running→run) */
  var EN_IRR={am:"be",is:"be",are:"be",was:"be",were:"be",been:"be",being:"be",has:"have",had:"have",does:"do",did:"do",done:"do",
    went:"go",gone:"go",ate:"eat",eaten:"eat",saw:"see",seen:"see",took:"take",taken:"take",made:"make",got:"get",gotten:"get",came:"come",
    said:"say",knew:"know",known:"know",thought:"think",bought:"buy",brought:"bring",told:"tell",found:"find",gave:"give",given:"give",
    left:"leave",felt:"feel",kept:"keep",met:"meet",ran:"run",sat:"sit",slept:"sleep",spoke:"speak",spoken:"speak",stood:"stand",
    taught:"teach",understood:"understand",wrote:"write",written:"write",began:"begin",begun:"begin",became:"become",chose:"choose",
    drank:"drink",drove:"drive",fell:"fall",flew:"fly",forgot:"forget",grew:"grow",heard:"hear",lost:"lose",paid:"pay",read:"read",
    sang:"sing",sold:"sell",sent:"send",spent:"spend",swam:"swim",won:"win",wore:"wear",children:"child",men:"man",women:"woman",
    people:"person",feet:"foot",teeth:"tooth",mice:"mouse",better:"good",best:"good",worse:"bad",worst:"bad"};
  function enLemmas(t){
    var c=[t];
    if(EN_IRR[t])c.push(EN_IRR[t]);
    if(/'s$/.test(t))c.push(t.slice(0,-2));
    if(/ies$/.test(t))c.push(t.slice(0,-3)+"y");
    if(/es$/.test(t))c.push(t.slice(0,-2));
    if(/s$/.test(t))c.push(t.slice(0,-1));
    if(/ied$/.test(t))c.push(t.slice(0,-3)+"y");
    if(/ed$/.test(t)){c.push(t.slice(0,-2),t.slice(0,-1));if(/(.)\1ed$/.test(t))c.push(t.slice(0,-3));}
    if(/ing$/.test(t)){c.push(t.slice(0,-3),t.slice(0,-3)+"e");if(/(.)\1ing$/.test(t))c.push(t.slice(0,-4));}
    if(/er$/.test(t))c.push(t.slice(0,-2));
    if(/est$/.test(t))c.push(t.slice(0,-3));
    if(/ly$/.test(t))c.push(t.slice(0,-2));
    return c;
  }
  function lookup(t){
    var ix=index(),k=norm(t),lang=env.lang();
    if(ix.m[k])return ix.m[k];
    if(lang==="en"){var c=enLemmas(k);for(var i=0;i<c.length;i++)if(ix.m[c[i]])return ix.m[c[i]];}
    if(lang==="ko")for(var j=0;j<KO_PART.length;j++){var p=KO_PART[j];if(k.length>p.length&&k.slice(-p.length)===p&&ix.m[k.slice(0,-p.length)])return ix.m[k.slice(0,-p.length)];}
    if(lang==="ru"||lang==="de"||lang==="ug")for(var n=1;n<=3&&k.length-n>=3;n++){var s=k.slice(0,-n);if(ix.m[s])return ix.m[s];}
    return null;
  }
  /* бичвэрийг жетон болгоно: {t, w (толь бичгийн үг|null), word (үг мөн эсэх)} */
  function tokenize(text){
    var out=[],ix=index();
    var parts=text.match(/[\p{L}\p{M}\p{N}'’-]+|[^\p{L}\p{M}\p{N}'’-]+/gu)||[];
    for(var i=0;i<parts.length;i++){
      var p=parts[i];
      if(!/[\p{L}]/u.test(p)){out.push({t:p});continue;}
      if(CJK.test(p)){cjk(p,out,ix);continue;}
      /* 2-3 үгтэй хэллэг (get up, ice cream): зай авч дараагийн үгтэй нийлүүлж үзнэ */
      var hit=null,span=1;
      for(var n=3;n>=2&&!hit;n--){
        var seg=[p],ok=true;
        for(var k=1;k<n;k++){var sp=parts[i+2*k-1],nx=parts[i+2*k];if(!sp||sp!==" "||!nx||!/[\p{L}]/u.test(nx)){ok=false;break;}seg.push(nx);}
        if(ok&&ix.m[norm(seg.join(" "))]){hit=ix.m[norm(seg.join(" "))];span=n;}
      }
      if(hit){out.push({t:parts.slice(i,i+2*span-1).join(""),w:hit,word:true});i+=2*(span-1);continue;}
      out.push({t:p,w:lookup(p),word:true});
    }
    return out;
  }
  function cjk(run,out,ix){
    var ch=Array.from(run),i=0,miss="";
    var flush=function(){if(miss){out.push({t:miss,w:null,word:true});miss="";}};
    while(i<ch.length){
      var hit=null,len=0;
      if(CJK.test(ch[i]))for(var n=Math.min(ix.max,ch.length-i);n>=1;n--){var s=ch.slice(i,i+n).join("");if(ix.m[s]&&(n>1||!/[぀-ゟ]/.test(s))){hit=ix.m[s];len=n;break;}}
      if(hit){flush();out.push({t:ch.slice(i,i+len).join(""),w:hit,word:true});i+=len;}
      else{
        /* япон: хирагана (нөхцөл, туслах үг) тусдаа жетон; бусад таараагүй тэмдэгтийг нийлүүлнэ */
        if(/[぀-ゟ]/.test(ch[i])){flush();out.push({t:ch[i]});}else miss+=ch[i];
        i++;
      }
    }
    flush();
  }
  function stats(toks){
    var seen={},n=0,known=0,nw=0,ud=0;
    toks.forEach(function(x){
      if(!x.word)return;var k=x.w?"w:"+x.w[1]:"u:"+norm(x.t);if(seen[k])return;seen[k]=1;n++;
      if(!x.w)ud++;else if(env.known(x.w))known++;else nw++;
    });
    return {n:n,known:known,nw:nw,ud:ud,pct:n?Math.round(known/n*100):0};
  }
  function sentenceOf(i,toks){
    var a=i,b=i;
    while(a>0&&!/[.!?。！？\n]/.test(toks[a-1].t))a--;
    while(b<toks.length-1&&!/[.!?。！？\n]/.test(toks[b].t))b++;
    return toks.slice(a,b+1).map(function(x){return x.t;}).join("").trim().slice(0,300);
  }
  /* AI зөвхөн үндсэн хэлбэр ба англи тайлбарыг өгнө (Workers AI ба m2m100 монгол утгыг ихэвчлэн буруу гаргадаг:
     rainbow → «савхын хүрд», «хөнгөн цагаан»). Монгол утгыг Салхины толь бичгээс, эсвэл Google Translate / хэрэглэгч өөрөө. */
  function loose(t){
    var m=String(t||"").match(/\{[\s\S]*?\}/);if(!m)return null;
    try{return JSON.parse(m[0]);}catch(e){}
    var o={},re=/"?(base|en)"?\s*:\s*"?([^",}]+)/g,x;while((x=re.exec(m[0])))o[x[1]]=x[2].trim();
    return o.base?o:null;
  }
  var GT={en:"en",ja:"ja",ko:"ko",zh:"zh-CN",ru:"ru",de:"de",ug:"ug"};
  function gtURL(text){return "https://translate.google.com/?sl="+(GT[env.lang()]||"auto")+"&tl=mn&op=translate&text="+encodeURIComponent(text);}
  function askAI(tok,sent){
    var key=norm(tok.t);if(R.busy[key]||R.ai[key])return;
    R.busy[key]=true;env.render();
    var q="In this "+env.langEn()+" sentence: \""+sent+"\"\n"+
      "What is the dictionary (base) form of \""+tok.t+"\", and what does it mean in simple English?\n"+
      "Reply with ONLY valid JSON: {\"base\":\"<dictionary form in "+env.langEn()+">\",\"en\":\"<short English meaning>\"}";
    Promise.resolve(env.ai([{role:"user",content:q}],{task:"check"})).then(function(r){
      R.busy[key]=false;
      var j=loose(r),base=j&&String(j.base||"").slice(0,60),hit=base?lookup(base):null;
      R.ai[key]=hit?{w:hit,base:base}:j&&base?{base:base,en:String(j.en||"").slice(0,120)}:{err:r==null?"AI одоогоор ажиллахгүй байна.":"AI хариулж чадсангүй."};
      env.render();
    },function(){R.busy[key]=false;R.ai[key]={err:"AI хариулж чадсангүй."};env.render();});
  }
  function panel(toks){
    var s=R.sel;if(s==null||!toks[s])return null;
    var tok=toks[s],w=tok.w,key=norm(tok.t),sent=sentenceOf(s,toks);
    var box=h("div",{class:"note",style:"position:sticky;bottom:calc(76px + env(safe-area-inset-bottom));margin-top:12px;box-shadow:0 6px 24px rgba(0,0,0,.18);z-index:5"});
    put(box,h("button",{class:"btn ghost",style:"float:right;padding:2px 8px;margin:0","aria-label":"Хаах",onclick:function(){R.sel=null;env.render();}},"✕"));
    if(w){
      put(box,h("div",{style:"font-weight:800;font-size:20px"},w[1]),w[7]?h("div",{class:"muted small"},w[7]):null,
        h("div",{style:"font-size:17px;margin-top:4px;color:var(--sky)"},w[2]),
        w[3]?h("div",{class:"muted small",style:"margin-top:6px"},w[3]+(w[8]?" — "+w[8]:"")):null,
        h("div",{class:"muted small",style:"margin-top:4px"},env.known(w)?"✅ Та энэ үгийг мэднэ":"🆕 Шинэ үг (Салхины толь бичгээс)"),
        h("div",{class:"row",style:"margin-top:8px"},h("button",{class:"btn",onclick:function(){env.speak(w[1]);}},"🔊 Сонсох"),
          h("button",{class:"btn"+(env.isSaved(w)?"":" primary"),onclick:function(){env.toggleSave(w);env.toast(env.isSaved(w)?"🔖 Хадгалсан үгсэд нэмлээ":"Хадгалснаас хаслаа",1500);env.render();}},env.isSaved(w)?"🔖 Хадгалсан":"🔖 Хадгалах")));
    }else{
      var a=R.ai[key],base=a&&a.base||tok.t;
      put(box,h("div",{style:"font-weight:800;font-size:20px"},tok.t),h("div",{class:"muted small"},"Салхины толь бичигт алга"));
      if(a&&a.w){
        put(box,h("div",{class:"muted small",style:"margin-top:4px"},"Үндсэн хэлбэр: ",h("b",null,a.w[1])," — Салхины толь бичгээс"),
          h("div",{style:"font-size:17px;margin-top:2px;color:var(--sky)"},a.w[2]),
          h("div",{class:"row",style:"margin-top:8px"},h("button",{class:"btn",onclick:function(){env.speak(a.w[1]);}},"🔊 Сонсох"),
            h("button",{class:"btn"+(env.isSaved(a.w)?"":" primary"),onclick:function(){env.toggleSave(a.w);env.render();}},env.isSaved(a.w)?"🔖 Хадгалсан":"🔖 Хадгалах")));
        return box;
      }
      if(a&&a.en)put(box,h("div",{style:"margin-top:4px"},norm(base)!==key?h("div",{class:"muted small"},"Үндсэн хэлбэр: "+base):null,
        h("div",null,"🇬🇧 "+a.en),h("div",{class:"muted small"},"🤖 AI-ийн англи тайлбар")));
      if(a&&a.err)put(box,h("div",{class:"fb bad"},a.err));
      put(box,h("div",{class:"row",style:"margin-top:8px;flex-wrap:wrap"},
        h("button",{class:"btn",onclick:function(){env.speak(tok.t);}},"🔊 Сонсох"),
        h("a",{class:"btn",href:gtURL(sent&&sent.length<200?sent:tok.t),target:"_blank",rel:"noopener",style:"text-decoration:none"},"🌐 Google орчуулга"),
        !a||a.err?h("button",{class:"btn",disabled:!!R.busy[key],onclick:function(){delete R.ai[key];askAI(tok,sent);}},R.busy[key]?"Түр хүлээ…":"🤖 Үндсэн хэлбэрийг олох"):null));
      /* монгол утгаа өөрөө бичээд миний үгсэд нэмэх */
      if(env.hasWord(base))put(box,h("div",{class:"fb ok",style:"margin-top:6px"},"✅ «"+base+"» миний үгсэд бий"));
      else{
        var mi=h("input",{class:"tin",placeholder:"Монгол утга (ж: солонго)","aria-label":"Монгол утга",style:"margin-top:8px",value:R.mnDraft[key]||""});
        mi.addEventListener("input",function(){R.mnDraft[key]=mi.value;});
        put(box,mi,h("button",{class:"btn primary",style:"margin-top:6px",onclick:function(){
          var mn=String(mi.value||"").trim();if(!mn){env.toast("Монгол утгыг бичнэ үү");mi.focus();return;}
          env.addWord(base,mn,sent,"",null);R.ix=null;delete R.mnDraft[key];env.toast("➕ «"+base+"» миний үгсэд нэмэгдлээ",1800);env.render();}},"➕ Миний үгсэд нэмэх"));
      }
    }
    return box;
  }
  function editor(root){
    var ta=h("textarea",{class:"tin",rows:"8",maxlength:String(MAX),placeholder:"Энд "+env.langName().toLowerCase()+" бичвэрээ буулгана уу: нийтлэл, дууны үг, кино хадмал, мессеж…","aria-label":"Бичвэр",style:"width:100%;font-size:16px;line-height:1.5"});
    ta.value=R.draft||"";
    ta.addEventListener("input",function(){R.draft=ta.value;});
    put(root,ta,h("div",{class:"row"},
      h("button",{class:"btn primary",onclick:function(){
        var t=String(ta.value||"").trim().slice(0,MAX);
        if(t.length<2){env.toast("Бичвэрээ буулгана уу");return;}
        var a=lsGet().filter(function(x){return !(x.l===env.lang()&&x.t===t);});a.unshift({l:env.lang(),t:t,at:Date.now()});lsSet(a);
        R.text=t;R.sel=null;R.draft="";env.render();window.scrollTo(0,0);
      }},"📖 Унших"),
      navigator.clipboard&&navigator.clipboard.readText?h("button",{class:"btn",onclick:function(){navigator.clipboard.readText().then(function(t){ta.value=String(t||"").slice(0,MAX);R.draft=ta.value;},function(){env.toast("Хуулсан бичвэрийг уншиж чадсангүй — гараараа буулгана уу");});}},"📋 Буулгах"):null));
    var prev=lsGet().filter(function(x){return x.l===env.lang();});
    if(prev.length){
      put(root,h("h3",{style:"margin:18px 0 6px"},"Сүүлд уншсан"));
      prev.forEach(function(x){
        put(root,h("button",{class:"lrow",type:"button",onclick:function(){R.text=x.t;R.sel=null;env.render();window.scrollTo(0,0);}},
          h("span",{class:"hexb ico"},"📄"),h("span",{style:"flex:1;min-width:0"},h("div",{class:"t",style:"overflow:hidden;text-overflow:ellipsis;white-space:nowrap"},x.t.slice(0,60)),h("div",{class:"muted small"},x.t.length+" тэмдэгт")),h("span",{"aria-hidden":"true"},"›")));
      });
    }
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    if(R.lang!==e.lang()){R.lang=e.lang();R.text=null;R.sel=null;R.ai={};}
    put(root,h("button",{class:"back",onclick:function(){if(R.text){R.text=null;R.sel=null;env.render();}else{env.stop();e.close();}}},R.text?"‹ Бичвэрүүд":"‹ Үгс"));
    put(root,h("h2",null,"📄 Өөрийн бичвэрээр сурах"));
    if(!R.text){
      put(root,h("p",{class:"muted"},"Дуртай нийтлэл, дууны үг, кино хадмалаа буулгаарай. Мэдэхгүй үгсийг тодруулж, дээр нь дарахад утгыг нь харуулна."));
      editor(root);return root;
    }
    var toks=tokenize(R.text),st=stats(toks);
    put(root,h("div",{class:"note",style:"display:flex;gap:12px;align-items:center;flex-wrap:wrap"},
      h("div",{style:"font-size:28px;font-weight:800"},st.pct+"%"),
      h("div",{style:"flex:1;min-width:160px"},h("div",{style:"font-weight:700"},st.n+" үгийн "+st.known+" нь танд мэдэгдэж байна"),
        h("div",{class:"muted small"},"🔵 "+st.nw+" шинэ үг (толь бичигт бий) · ┅ "+st.ud+" толь бичигт алга"))));
    var body=h("div",{lang:env.lang(),style:"font-size:19px;line-height:1.9;margin-top:12px;white-space:pre-wrap;word-break:break-word"});
    toks.forEach(function(x,i){
      if(!x.word){put(body,document.createTextNode(x.t));return;}
      var cls=!x.w?"ud":env.known(x.w)?"kn":"nw",sel=R.sel===i;
      var st2="cursor:pointer;border-radius:4px;padding:0 1px;"+(cls==="nw"?"background:color-mix(in srgb,var(--sky) 16%,transparent);color:inherit;":cls==="ud"?"text-decoration:underline dotted;text-underline-offset:4px;":"")+(sel?"outline:2px solid var(--sky);":"");
      put(body,h("span",{role:"button",tabindex:"0","data-rt":cls,style:st2,onclick:function(){R.sel=i;env.render();},onkeydown:function(ev){if(ev.key==="Enter"){R.sel=i;env.render();}}},x.t));
    });
    put(root,body);
    var news=[],seen={};toks.forEach(function(x){if(x.w&&!env.known(x.w)&&!env.isSaved(x.w)&&!seen[x.w[1]]){seen[x.w[1]]=1;news.push(x.w);}});
    var dk=env.lang()+":"+R.text.length+":"+R.text.slice(0,40);
    put(root,h("div",{class:"row",style:"margin-top:14px;flex-wrap:wrap"},
      h("button",{class:"btn",onclick:function(){env.speakList((R.text.match(/[^.!?。！？\n]+[.!?。！？]*/g)||[]).map(function(s){return s.trim();}).filter(Boolean).slice(0,40));}},"🔊 Бүгдийг унших"),
      news.length?h("button",{class:"btn",onclick:function(){news.forEach(function(w){env.toggleSave(w);});env.toast("🔖 "+news.length+" шинэ үгийг хадгаллаа — Үгс → Хадгалсан",2500);env.render();}},"🔖 "+news.length+" шинэ үгийг хадгалах"):null,
      h("button",{class:"btn primary",disabled:R.doneKey===dk,onclick:function(){R.doneKey=dk;env.addXP(5);env.logAct("rd");env.toast("✅ Уншиж дууслаа! +5 XP",2000);env.render();}},R.doneKey===dk?"✅ Дууссан":"✅ Уншиж дууслаа")));
    var p=panel(toks);if(p)put(root,p);
    return root;
  }
  window.Reader={view:view,_loose:loose,
    /* тест болон бусад модульд: бичвэрийн жетон, статистик */
    analyze:function(e,text){var o=env,oh=h,oi=R.ix;env=e;h=e.h;R.ix=null;try{var t=tokenize(text);return {toks:t,stats:stats(t)};}finally{env=o;h=oh;R.ix=oi;}}};
})();
