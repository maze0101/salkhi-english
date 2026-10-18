/* Салхи: 🧩 өдрийн кроссворд — сурч буй үгсээс (gameWords) өдөр бүр жижиг кроссворд үүсгэнэ. Сэжүүр нь монгол утга.
   Нүд = нэг тэмдэгт: en/de/ru/ug үсэг, ko үе, ja кана (ханзтай үгэнд w[7] уншлага), zh ханз.
   Хариултаа бүтэн үгээр бичнэ (IME-д ээлтэй): ja — ханз ч болно, zh — өнгөгүй пиньинь ч болно.
   Өдрийн тоглоом нь огноо+хэлээр тогтмол (seed), «Шинэ кроссворд» дарвал өөр seed. sget "cwDone" {lang:date}. XP: үг бүр 2 (≤16). */
(function(){
  var N=15,MAXW=8,env=null,h=null,C=null;
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function rng(seed){var s=0;for(var i=0;i<seed.length;i++)s=(s*31+seed.charCodeAt(i))>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
  function shuffle(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function today(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}
  function kata2hira(s){return s.replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60);});}
  function low(s){var L=env.lang();s=String(s||"").normalize("NFC").toLowerCase().trim();if(L==="ru"||L==="ug")s=s.replace(/ё/g,"е");if(L==="ja")s=kata2hira(s);return s;}
  function pinyin(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/ü/g,"v").replace(/[^a-z]/g,"");}
  /* үгийн нүднүүд {a: харьцуулах тэмдэгтүүд, s: харуулах тэмдэгтүүд} эсвэл null — хоосон зай, цэг тэмдэг, хэт урт/богино үгийг алгасна.
     ja: катаканаг хираганатай тулгаж огтлолцуулна, гэхдээ нүдэнд эх бичлэгээрээ (スポーツ) харагдана */
  function cells(w){
    var L=env.lang(),s=String(w[1]||"").replace(/\s*\([^)]*\)/g,"").trim();
    if(L==="de"||L==="en")s=s.replace(/^(der|die|das|to|the|a|an)\s+/i,"");
    if(L==="ja"){
      if(!/^[぀-ヿー]+$/.test(s)){var r=String(w[7]||"").replace(/\s+/g,"");if(/^[぀-ヿー]+$/.test(r))s=r;else return null;}
    }
    if(L==="zh"&&!/^[㐀-鿿]+$/.test(s))return null;
    if(L==="ko"&&!/^[가-힣]+$/.test(s))return null;
    if(["en","de","ru","ug"].indexOf(L)>=0&&!/^[\p{L}]+$/u.test(s))return null;
    var a=Array.from(low(s)),cjk=["ja","zh","ko"].indexOf(L)>=0;
    if(a.length<(cjk?2:3)||a.length>(cjk?6:9))return null;
    return {a:a,s:Array.from(s.toLowerCase())};
  }
  /* --- байршуулах: эхний үг хэвтээ, бусдыг нь аль хэдийн байгаа үсэгтэй огтлолцуулж тавина --- */
  function fits(g,a,r,c,dr,dc){
    var n=a.length,cross=0;
    var br=r-dr,bc=c-dc,er=r+dr*n,ec=c+dc*n;
    if(br>=0&&bc>=0&&g[br][bc])return -1;
    if(er<N&&ec<N&&g[er]&&g[er][ec])return -1;
    for(var i=0;i<n;i++){
      var rr=r+dr*i,cc=c+dc*i;if(rr<0||cc<0||rr>=N||cc>=N)return -1;
      var x=g[rr][cc];
      if(x){if(x!==a[i])return -1;cross++;continue;}
      /* шинэ нүдний хажууд (огтлолцолгүй газар) өөр үсэг наалдахгүй */
      var s1=dr?(cc>0?g[rr][cc-1]:null):(rr>0?g[rr-1][cc]:null),s2=dr?(cc<N-1?g[rr][cc+1]:null):(rr<N-1?g[rr+1][cc]:null);
      if(s1||s2)return -1;
    }
    return cross;
  }
  /* нэг оролдлого: first-ийг голд хэвтээ тавиад бусдыг 2 удаа гүйлгэж огтлолцуулна */
  function attempt(cand,fi,r){
    var g=[];for(var i=0;i<N;i++){g.push([]);for(var j=0;j<N;j++)g[i].push(null);}
    var placed=[],used={},first=cand[fi];used[fi]=1;
    function lay(it,rr,cc,dr,dc){for(var k=0;k<it.a.length;k++)g[rr+dr*k][cc+dc*k]=it.a[k];placed.push({w:it.w,a:it.a,s:it.s,r:rr,c:cc,d:dr?"v":"h"});}
    lay(first,7,Math.floor((N-first.a.length)/2),0,1);
    for(var pass=0;pass<2;pass++)cand.forEach(function(it,ci){
      if(placed.length>=MAXW||used[ci])return;
      var best=null;
      placed.forEach(function(p){
        p.a.forEach(function(ch,pi){
          it.a.forEach(function(ch2,ii){
            if(ch!==ch2)return;
            var dr=p.d==="h"?1:0,dc=p.d==="h"?0:1;
            var pr=p.r+(p.d==="v"?pi:0),pc=p.c+(p.d==="h"?pi:0);
            var rr=pr-dr*ii,cc=pc-dc*ii,f=fits(g,it.a,rr,cc,dr,dc);
            if(f>0&&(!best||f>best.f||(f===best.f&&r()<.4)))best={f:f,r:rr,c:cc,dr:dr,dc:dc};
          });
        });
      });
      if(best){used[ci]=1;lay(it,best.r,best.c,best.dr,best.dc);}
    });
    return placed;
  }
  function build(seed){
    var r=rng(seed),seen={},cand=[];
    shuffle(env.pool(),r).forEach(function(w){var c=cells(w);if(!c)return;var k=c.a.join("");if(seen[k])return;seen[k]=1;cand.push({w:w,a:c.a,s:c.s});});
    if(cand.length<4)return null;
    cand=cand.slice(0,400);
    /* хэд хэдэн эхлэлийн үгээр оролдож хамгийн олон үгтэйг нь авна (ko/zh-д давхцах тэмдэгт цөөн) */
    var placed=[];
    for(var t=0;t<12&&t<cand.length&&placed.length<MAXW;t++){var p=attempt(cand,t,r);if(p.length>placed.length)placed=p;}
    if(placed.length<4)return null;
    /* хүрээг тайрч дугаарлана */
    var r0=N,c0=N,r1=0,c1=0;
    placed.forEach(function(p){var er=p.r+(p.d==="v"?p.a.length-1:0),ec=p.c+(p.d==="h"?p.a.length-1:0);r0=Math.min(r0,p.r);c0=Math.min(c0,p.c);r1=Math.max(r1,er);c1=Math.max(c1,ec);});
    placed.forEach(function(p){p.r-=r0;p.c-=c0;});
    placed.sort(function(a,b){return a.r-b.r||a.c-b.c;});
    var num={},n=0;
    placed.forEach(function(p){var k=p.r+":"+p.c;if(!num[k])num[k]=++n;p.n=num[k];});
    return {rows:r1-r0+1,cols:c1-c0+1,words:placed,seed:seed,solved:{},hint:{},sel:0,wrong:false,done:false,t0:Date.now()};
  }
  function cellMap(){
    var m={};
    C.words.forEach(function(p,wi){
      p.a.forEach(function(ch,i){
        var k=(p.r+(p.d==="v"?i:0))+":"+(p.c+(p.d==="h"?i:0));
        if(!m[k])m[k]={ch:p.s[i]||ch,ws:[],n:null};
        m[k].ws.push(wi);if(i===0)m[k].n=p.n;
        if(C.solved[wi]||C.hint[k])m[k].show=true;
      });
    });
    return m;
  }
  function accept(p,v){
    var L=env.lang(),x=low(v).replace(/\s+/g,"");if(!x)return false;
    if(x===p.a.join(""))return true;
    if(x===low(p.w[1]).replace(/\s+/g,""))return true;
    if(L==="zh"&&p.w[7]&&pinyin(v)&&pinyin(v)===pinyin(p.w[7]))return true;
    return false;
  }
  function finish(){
    C.done=true;
    var xp=Math.min(16,C.words.length*2);env.addXP(xp);C.xp=xp;
    var d=env.sget("cwDone",{})||{};if(C.seed===env.lang()+":"+today()){d[env.lang()]=today();env.sset("cwDone",d);}
    env.logAct("cw");env.celebrate();
  }
  function start(fresh){
    var base=env.lang()+":"+today();
    C=build(fresh?base+":"+Date.now():base);
    for(var i=1;!C&&i<6;i++)C=build((fresh?base+":"+Date.now():base)+":"+i);
    if(!C){env.toast("Кроссворд хийхэд тохирох үг хүрэлцэхгүй байна. Түвшин эсвэл ангиллаа өргөжүүлээрэй.");return;}
    env.render();
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){C=null;e.close();}},"‹ Сорил"));
    put(root,h("h2",null,"🧩 Өдрийн кроссворд"));
    if(C&&C.lang!==undefined&&C.lang!==env.lang())C=null;
    if(!C){
      var dn=(env.sget("cwDone",{})||{})[env.lang()]===today();
      put(root,h("p",{class:"muted"},"Сурч буй "+env.langName().toLowerCase()+" үгсээсээ хийсэн жижиг кроссворд. Сэжүүр нь монгол утга — үгээ бүтнээр нь бичээд нүдэнд байршуулна."));
      if(env.lang()==="ja")put(root,h("p",{class:"muted small"},"Япон: нүдэнд хирагана байна. Ханзаар бичсэн ч зөв гэж үзнэ."));
      if(env.lang()==="zh")put(root,h("p",{class:"muted small"},"Хятад: ханз эсвэл өнгөгүй пиньинь (ж: pengyou) бичиж болно."));
      put(root,h("button",{class:"btn primary",style:"width:100%",onclick:function(){start(false);}},dn?"✅ Өнөөдрийнх дууссан · дахин тоглох":"▶️ Өнөөдрийн кроссворд"));
      put(root,h("button",{class:"btn ghost",style:"width:100%;margin-top:8px",onclick:function(){start(true);}},"🔀 Шинэ кроссворд"));
      return root;
    }
    C.lang=env.lang();
    var m=cellMap(),cur=C.words[C.sel],curCells={};
    if(cur)cur.a.forEach(function(_,i){curCells[(cur.r+(cur.d==="v"?i:0))+":"+(cur.c+(cur.d==="h"?i:0))]=1;});
    var sz=Math.max(26,Math.min(44,Math.floor((Math.min(window.innerWidth||400,560)-40)/C.cols)));
    var grid=h("div",{role:"grid","aria-label":"Кроссворд",style:"display:grid;grid-template-columns:repeat("+C.cols+","+sz+"px);gap:2px;justify-content:center;margin:10px auto"});
    for(var r=0;r<C.rows;r++)for(var c=0;c<C.cols;c++){
      var k=r+":"+c,x=m[k];
      if(!x){grid.append(h("div",{style:"width:"+sz+"px;height:"+sz+"px"}));continue;}
      (function(x){
        var on=curCells[k];
        var cell=h("button",{type:"button","aria-label":(x.n?x.n+" ":"")+(x.show?x.ch:"хоосон нүд"),
          style:"position:relative;width:"+sz+"px;height:"+sz+"px;padding:0;border:2px solid "+(on?"var(--sky)":"var(--line)")+";border-radius:6px;background:"+(on?"color-mix(in srgb,var(--sky) 14%,var(--surface))":"var(--surface)")+";color:var(--ink);font-weight:800;font-size:"+Math.round(sz*.5)+"px;cursor:pointer;text-transform:uppercase",
          onclick:function(){var i=x.ws.indexOf(C.sel);C.sel=x.ws[(i+1)%x.ws.length];C.wrong=false;env.render();}},
          x.n?h("span",{style:"position:absolute;top:1px;left:3px;font-size:9px;font-weight:700;color:var(--ink-2)"},String(x.n)):null,
          x.show?h("span",{lang:env.lang()},x.ch):null);
        grid.append(cell);
      })(x);
    }
    put(root,grid);
    if(C.done){
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},"🎉"),h("b",null,"Кроссворд дууслаа!"),
        h("div",{class:"muted"},C.words.length+" үг · "+Math.max(1,Math.round((Date.now()-C.t0)/60000))+" мин · +"+C.xp+" XP")));
      put(root,h("div",{class:"row"},h("button",{class:"btn",onclick:function(){C=null;env.render();}},"Буцах"),h("button",{class:"btn primary",onclick:function(){start(true);}},"🔀 Шинэ кроссворд")));
    }else if(cur){
      var solved=!!C.solved[C.sel];
      var box=h("div",{class:"note"},h("div",{class:"muted small"},cur.n+" "+(cur.d==="h"?"→ хэвтээ":"↓ босоо")+" · "+cur.a.length+" нүд"),
        h("div",{style:"font-size:20px;font-weight:800;margin:4px 0"},cur.w[2]));
      if(solved)put(box,h("div",{class:"fb ok"},"✅ "+cur.w[1]+(cur.w[7]&&cur.w[7]!==cur.w[1]?" ("+cur.w[7]+")":"")));
      else{
        var inp=h("input",{class:"tin",lang:env.lang(),autocomplete:"off",autocapitalize:"off",autocorrect:"off",spellcheck:"false","aria-label":"Хариулт",placeholder:"Үгээ бич…",style:C.wrong?"border-color:var(--danger)":""});
        var composing=false;
        var check=function(){
          if(composing)return;
          if(accept(cur,inp.value)){
            C.solved[C.sel]=true;C.wrong=false;
            if(C.words.every(function(_,i){return C.solved[i];}))finish();
            else{for(var i=1;i<=C.words.length;i++){var j=(C.sel+i)%C.words.length;if(!C.solved[j]){C.sel=j;break;}}}
            env.render();
          }else{C.wrong=true;env.render();}
        };
        inp.addEventListener("compositionstart",function(){composing=true;});
        inp.addEventListener("compositionend",function(){composing=false;});
        inp.addEventListener("keydown",function(ev){if(ev.key==="Enter"&&!ev.isComposing&&!composing){ev.preventDefault();check();}});
        put(box,inp);
        if(C.wrong)put(box,h("div",{class:"fb bad",style:"margin-top:6px"},"Таарсангүй — дахин оролдоорой."));
        put(box,h("div",{class:"row",style:"margin-top:8px"},
          h("button",{class:"btn primary",onclick:check},"Шалгах"),
          h("button",{class:"btn ghost",onclick:function(){
            /* хараахан харагдаагүй эхний нүдийг нээнэ */
            for(var i=0;i<cur.a.length;i++){var k=(cur.r+(cur.d==="v"?i:0))+":"+(cur.c+(cur.d==="h"?i:0));if(!m[k].show){C.hint[k]=1;break;}}
            C.wrong=false;env.render();
          }},"💡 Нэг үсэг"),
          h("button",{class:"btn ghost","aria-label":"Сонсох",onclick:function(){env.speak(cur.w[1]);}},"🔊")));
        setTimeout(function(){if(inp.isConnected&&!("ontouchstart" in window))inp.focus();},0);
      }
      put(root,box);
    }
    /* сэжүүрийн жагсаалт */
    var list=h("div",{style:"margin-top:12px"});
    [["h","→ Хэвтээ"],["v","↓ Босоо"]].forEach(function(dd){
      var ws=C.words.map(function(p,i){return [p,i];}).filter(function(x){return x[0].d===dd[0];});
      if(!ws.length)return;
      put(list,h("div",{class:"small",style:"font-weight:700;margin:8px 0 4px"},dd[1]));
      ws.forEach(function(x){
        var p=x[0],i=x[1];
        put(list,h("button",{type:"button",class:"srow",style:"width:100%;text-align:left;background:"+(i===C.sel?"var(--line)":"none")+";border:0;border-radius:8px;padding:6px 8px;color:inherit;font:inherit;cursor:pointer",onclick:function(){C.sel=i;C.wrong=false;env.render();}},
          h("span",null,p.n+". "+p.w[2]+" ("+p.a.length+")"),h("span",null,C.solved[i]?"✅":"")));
      });
    });
    put(root,list);
    if(!C.done)put(root,h("button",{class:"btn ghost",style:"width:100%;margin-top:10px",onclick:function(){C=null;env.render();}},"Гарах"));
    return root;
  }
  window.Crossword={view:view,
    doneToday:function(sg,l){return (sg("cwDone",{})||{})[l]===today();},
    /* тест: одоогийн тоглоом, тогтмол seed-ээр кроссворд үүсгэх */
    _cur:function(){return C;},
    _build:function(e,seed){var o=env;env=e;try{return build(seed);}finally{env=o;}}};
})();
