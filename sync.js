/* Салхи: Google нэвтрэлт + явцын синк (Firebase Realtime Database: progress/<uid>).
   Нэргүй (anonymous) бүртгэлийг Google-тэй холбодог тул uid (найзууд, код) хэвээр үлдэнэ.
   Түлхүүр бүрд сүүлд өөрчлөгдсөн цаг (mt) хадгална: тохиргоо, жагсаалт → шинэ нь ялна,
   XP, өдрийн XP, хичээлийн оноо гэх мэт → хоёр талын их нь. «Явц тэглэх» (rst)-ээс өмнөх өгөгдөл буцаж сэргэхгүй. */
(function(){
  var SDK="https://www.gstatic.com/firebasejs/10.12.2/",P="salkhi:",META=P+"_sync";
  var SYNC=["level","box","due","xp","daily","lessons","chat","stars","listenOk","goal","custom","saved","tasks","lang","freeze","frozen","frzMark",
    "langxp","miss","stories","speech","exam","mbook","act","games","examLog","writes","wex","kxlog","kxopt","aimem","aiopt","certName","wxCity"];
  var DEEP={xp:1,daily:1,langxp:1,lessons:1,chat:1,listenOk:1,act:1,games:1,stories:1,exam:1};
  function synced(k){return SYNC.indexOf(k)>=0||/^amiss:(en|ja|ko|zh|ru|de)$/.test(k);}

  function meta(){try{var m=JSON.parse(localStorage.getItem(META));if(m&&typeof m==="object")return m;}catch(e){}return {};}
  function setMeta(m){try{localStorage.setItem(META,JSON.stringify(m));}catch(e){}}
  function now(){return Date.now();}

  /* ---------- Firebase ачаалах, хэрэглэгч ---------- */
  function cfg(){return window.SALKHI_FB&&window.SALKHI_FB.databaseURL?window.SALKHI_FB:null;}
  function loadScript(src){
    return new Promise(function(ok,fail){
      var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=function(){fail(new Error("load "+src));};
      document.head.appendChild(s);
    });
  }
  var sdkP=null,readyP=null;
  function load(){
    if(!cfg())return Promise.reject(new Error("no-config"));
    if(!sdkP)sdkP=(window.firebase&&window.firebase.database&&window.firebase.auth?Promise.resolve():
      loadScript(SDK+"firebase-app-compat.js").then(function(){return loadScript(SDK+"firebase-auth-compat.js");}).then(function(){return loadScript(SDK+"firebase-database-compat.js");}))
      .then(function(){if(!firebase.apps.length)firebase.initializeApp(cfg());});
    sdkP.catch(function(){sdkP=null;});
    return sdkP;
  }
  /* хадгалагдсан нэвтрэлт сэргэтэл хүлээнэ (эс бөгөөс signInAnonymously Google хэрэглэгчийг солино) */
  function ready(){
    if(!readyP)readyP=load().then(function(){
      return new Promise(function(ok){var off=firebase.auth().onAuthStateChanged(function(u){off();ok(u);});});
    });
    readyP.catch(function(){readyP=null;});
    return readyP.then(function(){return firebase.auth().currentUser;});
  }
  /* social.js-д: одоогийн хэрэглэгч, байхгүй бол нэргүй */
  function user(){
    return ready().then(function(u){return u||firebase.auth().signInAnonymously().then(function(c){return c.user;});});
  }
  function isGoogle(u){return !!(u&&!u.isAnonymous&&u.providerData.some(function(p){return p.providerId==="google.com";}));}

  /* ---------- нэгтгэх ---------- */
  function snapshot(){
    var m=meta(),o={data:{},mt:m.mt||{},rst:m.rst||0};
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(k&&k.indexOf(P)===0&&synced(k.slice(P.length)))o.data[k.slice(P.length)]=localStorage.getItem(k);
    }
    return o;
  }
  function parse(s){try{return JSON.parse(s);}catch(e){return undefined;}}
  function isObj(x){return x&&typeof x==="object"&&!Array.isArray(x);}
  function deepMax(a,b,aNewer){
    if(typeof a==="number"&&typeof b==="number")return Math.max(a,b);
    if(isObj(a)&&isObj(b)){
      var o={},k;
      for(k in a)o[k]=k in b?deepMax(a[k],b[k],aNewer):a[k];
      for(k in b)if(!(k in a))o[k]=b[k];
      return o;
    }
    return aNewer?a:b;
  }
  function merge(L,R){
    var out={data:{},mt:{},rst:Math.max(L.rst||0,R.rst||0)},keys={},k;
    for(k in L.data)keys[k]=1;
    for(k in R.data)keys[k]=1;
    for(k in keys){
      if(!synced(k))continue;
      var lv=L.data[k],rv=R.data[k],lm=L.mt[k]||0,rm=R.mt[k]||0;
      /* нөгөө тал тэглэсний дараа өөрчлөгдөөгүй бол хуучирсан */
      if(lv!==undefined&&lm<(R.rst||0))lv=undefined;
      if(rv!==undefined&&rm<(L.rst||0))rv=undefined;
      if(lv===undefined&&rv===undefined)continue;
      var v,m=Math.max(lm,rm);
      if(rv===undefined){v=lv;m=lm;}
      else if(lv===undefined){v=rv;m=rm;}
      else if(DEEP[k]){
        var a=parse(lv),b=parse(rv);
        v=a===undefined?rv:b===undefined?lv:JSON.stringify(deepMax(a,b,lm>=rm));
      }
      else v=rm>lm?rv:lv;
      out.data[k]=v;if(m)out.mt[k]=m;
    }
    return out;
  }
  function same(a,b){
    var k;
    for(k in a.data)if(a.data[k]!==b.data[k])return false;
    for(k in b.data)if(!(k in a.data))return false;
    return (a.rst||0)===(b.rst||0);
  }
  /* нэгтгэсэн үр дүнг localStorage-д бичнэ; өгөгдөл өөрчлөгдсөн эсэхийг буцаана */
  function apply(M){
    var L=snapshot(),changed=false,k;
    for(k in M.data)if(L.data[k]!==M.data[k]){try{localStorage.setItem(P+k,M.data[k]);changed=true;}catch(e){}}
    for(k in L.data)if(!(k in M.data)){localStorage.removeItem(P+k);changed=true;}
    var m=meta();m.mt=M.mt;m.rst=M.rst;setMeta(m);
    return changed;
  }
  function remoteObj(v){var o=v&&typeof v.j==="string"?parse(v.j):null;return o&&isObj(o.data)?{data:o.data,mt:isObj(o.mt)?o.mt:{},rst:+o.rst||0}:{data:{},mt:{},rst:0};}

  /* ---------- татах / илгээх ---------- */
  var busy=false,timer=null,lastErr="",tst=null,onChange=null;
  function ref(u){return firebase.database().ref("progress/"+u.uid);}
  function push(){
    if(!meta().g)return Promise.resolve();
    return ready().then(function(u){
      if(!isGoogle(u))return;
      var L=snapshot();
      return ref(u).transaction(function(cur){
        var M=merge(L,remoteObj(cur));
        return {j:JSON.stringify(M),ts:now()};
      }).then(function(){var m=meta();m.last=now();setMeta(m);lastErr="";});
    }).catch(function(e){lastErr=String(e&&e.message||e);});
  }
  /* эхлэхэд: серверийнхтэй нэгтгээд, өөрчлөгдсөн бол хуудсыг дахин ачаална */
  function pull(silent){
    if(busy)return Promise.resolve();
    busy=true;
    return ready().then(function(u){
      if(!isGoogle(u)){var m=meta();delete m.g;setMeta(m);return;}
      return ref(u).once("value").then(function(snap){
        var R=remoteObj(snap.val()),M=merge(snapshot(),R),changed=apply(M);
        var m=meta();m.last=now();setMeta(m);lastErr="";
        var p=same(M,R)?Promise.resolve():ref(u).set({j:JSON.stringify(M),ts:now()});
        return p.then(function(){
          if(changed){
            var n=+sessionStorage.getItem("salkhi:syncReload")||0;
            if(n<2){sessionStorage.setItem("salkhi:syncReload",String(n+1));if(!silent&&tst)tst("☁️ Явц синк хийгдлээ");setTimeout(function(){location.reload();},silent?0:600);return;}
          }
          sessionStorage.removeItem("salkhi:syncReload");
        });
      });
    }).catch(function(e){lastErr=String(e&&e.message||e);}).then(function(){busy=false;});
  }
  function touch(k){
    if(!synced(k))return;
    var m=meta();m.mt=m.mt||{};m.mt[k]=now();setMeta(m);
    if(m.g){clearTimeout(timer);timer=setTimeout(push,5000);}
  }
  function reset(){var m=meta();m.rst=now();setMeta(m);if(m.g){clearTimeout(timer);timer=setTimeout(push,1500);}}

  /* ---------- нэвтрэх / гарах ---------- */
  function afterLogin(){
    var m=meta(),u=firebase.auth().currentUser;m.g=1;m.name=u&&(u.displayName||u.email)||"";setMeta(m);
    if(onChange)onChange();
    if(window.Social&&window.Social.reset)window.Social.reset();
    return pull();
  }
  function linkOrSignIn(u,provider,redirect){
    if(u&&u.isAnonymous)return redirect?u.linkWithRedirect(provider):u.linkWithPopup(provider);
    return redirect?firebase.auth().signInWithRedirect(provider):firebase.auth().signInWithPopup(provider);
  }
  /* Google бүртгэл өөр uid-д холбогдсон байвал (өөр төхөөрөмж) тэр бүртгэл рүү шилжинэ */
  function handleErr(e){
    var c=e&&e.code||"";
    if((c==="auth/credential-already-in-use"||c==="auth/email-already-in-use")&&e.credential)
      return firebase.auth().signInWithCredential(e.credential).then(afterLogin);
    throw e;
  }
  function signIn(){
    return ready().then(function(u){
      var pr=new firebase.auth.GoogleAuthProvider();pr.setCustomParameters({prompt:"select_account"});
      return linkOrSignIn(u,pr,false).then(afterLogin,function(e){
        var c=e&&e.code||"";
        if(c==="auth/popup-blocked"||c==="auth/operation-not-supported-in-this-environment"){
          sessionStorage.setItem("salkhi:gredir","1");
          return linkOrSignIn(u,pr,true);
        }
        return handleErr(e);
      });
    });
  }
  function signOut(){
    clearTimeout(timer);
    return push().then(function(){return ready();}).then(function(){
      var m=meta();delete m.g;delete m.last;delete m.name;setMeta(m);
      if(onChange)onChange();
      if(window.Social&&window.Social.reset)window.Social.reset();
      return firebase.auth().signOut();
    });
  }
  function errText(e){
    var c=e&&e.code||"",m=String(e&&e.message||e);
    if(c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request")return "";
    if(c==="auth/operation-not-allowed"||/configuration-not-found/.test(m))return "Firebase дээр Google нэвтрэлт асаагаагүй байна.";
    if(c==="auth/unauthorized-domain")return "Энэ домэйн Firebase-ийн Authorized domains-д алга.";
    if(c==="auth/network-request-failed")return "Интернэт холболтоо шалгана уу.";
    if(/PERMISSION_DENIED|permission_denied/i.test(m))return "Firebase-ийн дүрэм (database.rules.json) шинэчлэгдээгүй байна.";
    return "Нэвтэрч чадсангүй: "+m;
  }

  /* ---------- «Явц» таб дахь самбар ---------- */
  function panel(h,rerender,toast){
    var wrap=h("div",{style:"margin-top:22px"});
    wrap.append(h("h2",{style:"font-size:18px"},"☁️ Явц хадгалах (Google)"));
    if(!cfg()){wrap.append(h("p",{class:"muted small"},"Firebase тохиргоо алга."));return wrap;}
    var m=meta(),body=h("div");wrap.append(body);
    function paint(u){
      body.textContent="";
      if(isGoogle(u)&&m.g){
        body.append(h("p",{class:"muted small"},"Нэвтэрсэн: "+(u.displayName||"")+(u.email?" · "+u.email:"")),
          h("p",{class:"muted small"},m.last?"Сүүлд синк хийсэн: "+new Date(m.last).toLocaleString():"Синк хийгдээгүй"),
          lastErr?h("p",{class:"muted small",style:"color:var(--bad,#c33)"},errText({message:lastErr})):"",
          h("div",{class:"row",style:"flex-wrap:wrap"},
            h("button",{class:"btn",onclick:function(e){e.target.disabled=true;push().then(function(){toast(lastErr?errText({message:lastErr}):"☁️ Хадгаллаа");m=meta();rerender();});}},"🔄 Одоо синк хийх"),
            h("button",{class:"btn ghost",onclick:function(){signOut().then(function(){toast("Гарлаа. Явц энэ төхөөрөмж дээр үлдэнэ.");rerender();},function(e){toast(errText(e));});}},"Гарах")));
      }else{
        body.append(h("p",{class:"muted small"},"Google-ээр нэвтэрвэл явц тань хадгалагдаж, утас, компьютер хооронд автоматаар шилжинэ. Найзууд тань хэвээр үлдэнэ."),
          h("button",{class:"btn primary",onclick:function(e){
            var b=e.target;b.disabled=true;b.textContent="Түр хүлээнэ үү...";
            signIn().then(function(){toast("✅ Нэвтэрлээ");m=meta();rerender();},function(err){var t=errText(err);if(t)toast(t);b.disabled=false;rerender();});
          }},"🔐 Google-ээр нэвтрэх"));
      }
    }
    if(m.g){body.append(h("p",{class:"muted small"},"Уншиж байна..."));ready().then(paint,function(){paint(null);});}
    else paint(null);
    return wrap;
  }

  /* толгой хэсгийн товчинд: Firebase ачаалалгүйгээр нэвтэрсэн эсэхийг мэдэх */
  function account(){var m=meta();return m.g?{name:m.name||""}:null;}
  function quickSignIn(){
    if(!cfg())return Promise.resolve();
    return signIn().then(function(){if(tst)tst("✅ Нэвтэрлээ. Явц тань хадгалагдана.");},function(e){var t=errText(e);if(t&&tst)tst(t);});
  }

  /* ---------- эхлэл ---------- */
  function boot(toast,changed){
    tst=toast||null;onChange=changed||null;
    if(!cfg())return;
    if(sessionStorage.getItem("salkhi:gredir")){
      sessionStorage.removeItem("salkhi:gredir");
      load().then(function(){return firebase.auth().getRedirectResult();}).then(function(r){if(r&&r.user)return afterLogin();},function(e){
        return Promise.resolve().then(function(){return handleErr(e);}).catch(function(e2){var t=errText(e2);if(t&&tst)tst(t);});
      });
      return;
    }
    if(meta().g)pull(true);
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"&&meta().g&&timer){clearTimeout(timer);timer=null;push();}});
  }

  window.SalkhiSync={account:account,quickSignIn:quickSignIn,touch:touch,reset:reset,panel:panel,boot:boot,signIn:signIn,signOut:signOut,push:push,pull:pull,_merge:merge};
  window.SalkhiFB={load:load,ready:ready,user:user};
})();
