/* Салхи: 💌 Нууц захидал — найздаа захидал бичиж холбоосоор илгээнэ. Захидлыг нээхийн тулд хүлээн авагч
   3 үгийн (монгол утгаас нь) гадаад үгийг зөв сонгох ёстой. Захидал нь зөв гурван үгээс гаргасан түлхүүрээр XOR
   кодлогдсон тул холбоос дотор хариулт, бичвэр ил байхгүй (тоглоомын түвшний нууцлал, жинхэнэ шифр биш).
   Сервергүй: бүх зүйл #lt=<base64url JSON> холбоосонд. {v,l,f,q:[{mn,o:[4 үг]}],c,k} — k = бичвэрийн хэш. */
(function(){
  var env=null,h=null,S={mode:"home",msg:"",picks:null,link:null,inbox:null,sel:[],tries:0,open:null};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0,t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function b64u(bytes){var s="";bytes.forEach(function(b){s+=String.fromCharCode(b);});return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
  function unb64u(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";var b=atob(s),o=new Uint8Array(b.length);for(var i=0;i<b.length;i++)o[i]=b.charCodeAt(i);return o;}
  var TE=new TextEncoder(),TD=new TextDecoder();
  function xor(bytes,key){var k=TE.encode(key),o=new Uint8Array(bytes.length);for(var i=0;i<bytes.length;i++)o[i]=bytes[i]^k[(i*7+3)%k.length]^((i*131)&255);return o;}
  function hash(s){var x=2166136261;for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0;}return x.toString(36);}
  function keyOf(words){return words.map(function(w){return String(w).toLowerCase();}).join("␟")+"·salkhi";}
  function pick3(){
    var pool=env.pool().filter(function(w){return w[1].length<=24&&w[2].length<=40;});
    return shuffle(pool).slice(0,3);
  }
  function build(){
    var msg=S.msg.trim().slice(0,400),all=env.all();
    var q=S.picks.map(function(w){
      var o=shuffle(all.filter(function(y){return y[1]!==w[1]&&y[1].length<=24;})).slice(0,3).map(function(y){return y[1];});
      return {mn:w[2],o:shuffle(o.concat([w[1]]))};
    });
    var p={v:1,l:env.lang(),f:(env.sget("ltName","")||"Найз").slice(0,24),q:q,c:b64u(xor(TE.encode(msg),keyOf(S.picks.map(function(w){return w[1];})))),k:hash(msg)};
    S.link=location.href.split("#")[0]+"#lt="+b64u(TE.encode(JSON.stringify(p)));
    env.addXP(3);
  }
  function tryOpen(){
    var p=S.inbox,words=S.sel.map(function(i,qi){return p.q[qi].o[i];});
    var msg="";try{msg=TD.decode(xor(unb64u(p.c),keyOf(words)));}catch(e){}
    if(hash(msg)===p.k){
      S.open=msg;var box=env.sget("ltIn",[]);if(!Array.isArray(box))box=[];
      box.unshift({ts:Date.now(),f:p.f,l:p.l,m:msg});env.sset("ltIn",box.slice(0,30));
      env.addXP(5);env.celebrate();
    }else{S.tries++;S.sel=[];env.toast("🔒 Ядаж нэг хариулт буруу байна. Дахин оролд!");}
    env.render();
  }
  /* холбоосоор ирсэн захидал: модуль ачаалагдахад нэг удаа уншина */
  function readHash(){
    var m=/[#&]lt=([A-Za-z0-9_-]+)/.exec(location.hash||"");if(!m)return false;
    try{var p=JSON.parse(TD.decode(unb64u(m[1])));if(p&&p.v===1&&Array.isArray(p.q)&&p.c&&p.k){S.inbox=p;S.mode="read";S.sel=[];S.tries=0;S.open=null;}}catch(e){}
    try{history.replaceState(null,"",location.href.split("#")[0]);}catch(e){}
    return !!S.inbox;
  }
  function home(root){
    put(root,h("p",{class:"muted"},"Найздаа захидал бич. Захидлыг нээхийн тулд тэр "+env.langName().toLowerCase()+" 3 үгийг зөв таах ёстой. Хамт сурч буй найзууддаа хөгжилтэй сорил болно."));
    put(root,h("button",{class:"btn primary",style:"width:100%",onclick:function(){S.mode="write";S.picks=pick3();S.link=null;env.render();}},"✉️ Захидал бичих"));
    var box=env.sget("ltIn",[]);
    if(Array.isArray(box)&&box.length){
      put(root,h("h3",{style:"margin-top:18px"},"📬 Нээсэн захидлууд"));
      box.forEach(function(x){put(root,h("div",{class:"note",style:"margin-top:8px"},h("div",{class:"muted small"},"✉️ "+x.f+" · "+new Date(x.ts).toLocaleDateString("mn-MN")),h("div",{style:"white-space:pre-wrap;margin-top:4px"},x.m)));});
    }
  }
  function write(root){
    if(S.link){
      put(root,h("div",{class:"note"},h("b",null,"💌 Захидал бэлэн!"),h("p",{class:"muted small",style:"margin:4px 0 8px"},"Холбоосыг найздаа илгээ. Тэр Салхи апп дээр нээгээд 3 үгийг таавал захидал чинь гарч ирнэ."),
        h("input",{class:"tin",readonly:true,value:S.link,style:"width:100%;font-size:12px",onclick:function(ev){ev.target.select();}})));
      put(root,h("div",{class:"row",style:"margin-top:10px;gap:8px"},
        navigator.share?h("button",{class:"btn primary",style:"flex:1",onclick:function(){navigator.share({title:"Салхи — нууц захидал",text:"💌 Чамд нууц захидал ирлээ! Нээхийн тулд 3 үг таа:",url:S.link}).catch(function(){});}},"📤 Илгээх"):null,
        h("button",{class:"btn"+(navigator.share?"":" primary"),style:navigator.share?"":"flex:1",onclick:function(){(navigator.clipboard?navigator.clipboard.writeText(S.link):Promise.reject()).then(function(){env.toast("📋 Холбоос хуулагдлаа");},function(){env.toast("Холбоосыг дарж хуулна уу");});}},"📋 Хуулах"),
        h("button",{class:"btn ghost",onclick:function(){S.mode="home";S.msg="";S.link=null;env.render();}},"Болсон")));
      return;
    }
    var nm=h("input",{class:"tin",placeholder:"Таны нэр",value:env.sget("ltName",""),maxlength:24,style:"width:100%",oninput:function(){env.sset("ltName",nm.value);}});
    var ta=h("textarea",{class:"tin",rows:"5",maxlength:400,placeholder:"Захидлаа энд бич (монголоор ч болно)…",style:"width:100%;margin-top:8px;resize:vertical",oninput:function(){S.msg=ta.value;}});ta.value=S.msg;
    put(root,h("label",{class:"muted small"},"Хэнээс"),nm,ta);
    if(!S.picks||S.picks.length<3){put(root,h("p",{class:"muted"},"Захидал түгжихэд ядаж 3 үг сурсан байх хэрэгтэй."));return;}
    put(root,h("div",{class:"note",style:"margin-top:10px"},h("b",null,"🔐 Түгжээний 3 үг"),h("div",{class:"muted small"},"Найз чинь эдгээрийн монгол утгыг хараад "+env.langName().toLowerCase()+" үгийг сонгоно."),
      h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"},S.picks.map(function(w){return h("span",{class:"chip"},h("b",{lang:env.lang()},w[1]),h("span",{class:"muted"}," "+w[2]));})),
      h("button",{class:"btn ghost",style:"margin-top:6px",onclick:function(){S.picks=pick3();env.render();}},"🔄 Өөр үгс")));
    put(root,h("div",{class:"row",style:"margin-top:10px;gap:8px"},
      h("button",{class:"btn primary",style:"flex:1",onclick:function(){if(!S.msg.trim()){env.toast("Захидлаа бичнэ үү");return;}build();env.render();}},"🔒 Түгжээд холбоос үүсгэх"),
      h("button",{class:"btn",onclick:function(){S.mode="home";env.render();}},"Болих")));
  }
  function read(root){
    var p=S.inbox;
    if(S.open!=null){
      put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:44px"},"💌"),h("div",{class:"muted small"},p.f+"-аас ирсэн захидал")));
      put(root,h("div",{class:"note",style:"margin-top:10px;white-space:pre-wrap;font-size:17px;line-height:1.6"},S.open));
      put(root,h("div",{class:"row",style:"margin-top:12px;gap:8px"},h("button",{class:"btn primary",style:"flex:1",onclick:function(){S.inbox=null;S.mode="write";S.msg="";S.picks=pick3();S.link=null;env.render();}},"✉️ Хариу бичих"),
        h("button",{class:"btn",onclick:function(){S.inbox=null;S.mode="home";env.render();}},"Болсон")));
      return;
    }
    put(root,h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:44px"},"🔒💌"),h("b",null,p.f+" чамд нууц захидал илгээжээ!"),
      h("div",{class:"muted small"},"Захидлыг нээхийн тулд монгол утгад тохирох үгийг сонго.")));
    if(p.l!==env.lang())put(root,h("p",{class:"muted small"},"Энэ захидлын үгс өөр хэл дээр байна — хэцүү ч гэсэн оролдоод үз!"));
    p.q.forEach(function(q,qi){
      put(root,h("div",{class:"note",style:"margin-top:10px"},h("div",{class:"muted small"},(qi+1)+"/3 · Утга"),h("b",{style:"font-size:17px"},q.mn),
        h("div",{style:"display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px"},q.o.map(function(w,i){
          return h("button",{class:"opt",lang:p.l,"aria-pressed":String(S.sel[qi]===i),style:S.sel[qi]===i?"border-color:var(--sel-line);background:var(--sel-bg);color:var(--sel-ink)":"",onclick:function(){S.sel[qi]=i;env.render();}},w);
        }))));
    });
    var ready=p.q.every(function(q,qi){return S.sel[qi]!=null;});
    put(root,h("button",{class:"btn primary",style:"width:100%;margin-top:12px",disabled:!ready,onclick:tryOpen},"🔓 Захидал нээх"+(S.tries?" ("+S.tries+" оролдлого)":"")));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    put(root,h("button",{class:"back",onclick:function(){S.mode="home";S.inbox=null;e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"💌 Нууц захидал"));
    if(S.mode==="read"&&S.inbox)read(root);else if(S.mode==="write")write(root);else home(root);
    return root;
  }
  var got=readHash();
  window.Letter={view:view,pending:function(){return S.mode==="read"&&!!S.inbox;}};
  if(got&&window.openWTool)window.openWTool("letter");
  /* апп нээлттэй байхад захидлын холбоос дээр дарвал хуудас дахин ачаалагдахгүй — зөвхөн hash солигдоно */
  window.addEventListener("hashchange",function(){if(readHash()&&window.openWTool)window.openWTool("letter");});
})();
