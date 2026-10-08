/* Салхи: Google нэвтрэлт + явцын синк (Firebase Realtime Database: progress/<uid>).
   Нэргүй (anonymous) бүртгэлийг Google-тэй холбодог тул uid (найзууд, код) хэвээр үлдэнэ.
   Түлхүүр бүрд сүүлд өөрчлөгдсөн цаг (mt) хадгална: тохиргоо, жагсаалт → шинэ нь ялна,
   XP, өдрийн XP, хичээлийн оноо гэх мэт → хоёр талын их нь. «Явц тэглэх» (rst)-ээс өмнөх өгөгдөл буцаж сэргэхгүй. */
(function(){
  var SDK="https://www.gstatic.com/firebasejs/10.12.2/",P="salkhi:",META=P+"_sync";
  var SYNC=["level","box","due","srs","xp","daily","lessons","chat","stars","listenOk","goal","custom","saved","tasks","lang","freeze","frozen","frzMark",
    "langxp","miss","stories","speech","exam","mbook","act","games","examLog","writes","wex","kxlog","kxopt","aimem","aiopt","certName","wxCity","kidlv","prsent","camlog"];
  var DEEP={xp:1,daily:1,langxp:1,lessons:1,chat:1,listenOk:1,act:1,games:1,stories:1,exam:1};
  function synced(k){return SYNC.indexOf(k)>=0||/^(amiss|jobbest):(en|ja|ko|zh|ru|de)$/.test(k);}

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
  function isAcct(u){return !!(u&&!u.isAnonymous);}

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
  /* нэр, и-мэйл: Firebase Console-оос хэн нэвтэрснийг харахад */
  function rec(u,M){return {j:JSON.stringify(M),ts:now(),name:u.displayName||"",email:u.email||""};}
  function push(){
    if(!meta().g)return Promise.resolve();
    return ready().then(function(u){
      if(!isAcct(u))return;
      var L=snapshot();
      return ref(u).transaction(function(cur){
        var M=merge(L,remoteObj(cur));
        return rec(u,M);
      }).then(function(){var m=meta();m.last=now();setMeta(m);lastErr="";});
    }).catch(function(e){lastErr=String(e&&e.message||e);});
  }
  /* эхлэхэд: серверийнхтэй нэгтгээд, өөрчлөгдсөн бол хуудсыг дахин ачаална */
  function pull(silent){
    if(busy)return Promise.resolve();
    busy=true;
    return ready().then(function(u){
      if(!isAcct(u)){var m=meta();delete m.g;setMeta(m);return;}
      return ref(u).once("value").then(function(snap){
        var R=remoteObj(snap.val()),M=merge(snapshot(),R),changed=apply(M);
        var m=meta();m.last=now();m.name=u.displayName||u.email||m.name||"";m.email=u.email||"";m.photo=u.photoURL||"";setMeta(m);lastErr="";
        var v=snap.val()||{},p=same(M,R)?(v.name===(u.displayName||"")&&v.email===(u.email||"")?Promise.resolve():ref(u).update({name:u.displayName||"",email:u.email||""})):ref(u).set(rec(u,M));
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
    var m=meta(),u=firebase.auth().currentUser;m.g=1;m.name=u&&(u.displayName||u.email)||"";m.email=u&&u.email||"";m.photo=u&&u.photoURL||"";setMeta(m);
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
  /* и-мэйлээр бүртгүүлэх: нэргүй бүртгэлд холбоно (uid, найзууд хэвээр) */
  function register(name,email,pw){
    return ready().then(function(u){
      var cred=firebase.auth.EmailAuthProvider.credential(email,pw);
      return (u&&u.isAnonymous?u.linkWithCredential(cred):firebase.auth().createUserWithEmailAndPassword(email,pw));
    }).then(function(c){
      var u=c.user||firebase.auth().currentUser;
      return name&&u?u.updateProfile({displayName:name}):null;
    }).then(afterLogin);
  }
  function emailSignIn(email,pw){
    return ready().then(function(){return firebase.auth().signInWithEmailAndPassword(email,pw);}).then(afterLogin);
  }
  function resetPw(email){
    return load().then(function(){firebase.auth().languageCode="mn";return firebase.auth().sendPasswordResetEmail(email);});
  }
  function signOut(){
    clearTimeout(timer);
    return push().then(function(){return ready();}).then(function(){
      var m=meta();delete m.g;delete m.last;delete m.name;delete m.email;delete m.photo;setMeta(m);
      if(onChange)onChange();
      if(window.Social&&window.Social.reset)window.Social.reset();
      return firebase.auth().signOut();
    });
  }
  function errText(e){
    var c=e&&e.code||"",m=String(e&&e.message||e);
    if(c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request")return "";
    if(c==="auth/operation-not-allowed"||/configuration-not-found/.test(m))return "Энэ нэвтрэх арга Firebase дээр асаагаагүй байна.";
    if(c==="auth/unauthorized-domain")return "Энэ домэйн Firebase-ийн Authorized domains-д алга.";
    if(c==="auth/network-request-failed"||/^load https?:/.test(m)||/network/i.test(m))return "Интернэт холболтоо шалгана уу.";
    if(c==="auth/invalid-email")return "И-мэйл хаяг буруу байна.";
    if(c==="auth/missing-password"||c==="auth/weak-password")return "Нууц үг дор хаяж 6 тэмдэгт байна.";
    if(c==="auth/email-already-in-use"||c==="auth/credential-already-in-use")return "Энэ и-мэйл бүртгэлтэй байна. «Нэвтрэх» табаар орно уу.";
    if(c==="auth/invalid-credential"||c==="auth/wrong-password"||c==="auth/user-not-found"||c==="auth/invalid-login-credentials")return "И-мэйл эсвэл нууц үг буруу байна.";
    if(c==="auth/too-many-requests")return "Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу.";
    if(c==="auth/provider-already-linked")return "Энэ бүртгэл аль хэдийн холбогдсон байна.";
    if(/PERMISSION_DENIED|permission_denied/i.test(m))return "Firebase-ийн дүрэм (database.rules.json) шинэчлэгдээгүй байна.";
    return "Нэвтэрч чадсангүй: "+m;
  }

  /* ---------- бүтэн дэлгэцийн нэвтрэх хуудас ---------- */
  var GLOGO='<svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  var EYE='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.5M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M2 2l20 20"/></svg>';
  var H=null,authEl=null;
  function closeAuth(skip){
    if(!authEl)return;
    authEl.remove();authEl=null;document.body.style.overflow="";
    if(skip){var m=meta();m.skip=1;setMeta(m);}
  }
  function kid(){return document.documentElement.getAttribute("data-mode")==="kid";}
  function openAuth(tab){
    var h=H;if(!h||authEl||!cfg())return;
    var st={tab:tab||"in",busy:false,msg:"",ok:false};
    var box=h("div",{class:"auth-in"});
    authEl=h("div",{class:"auth",role:"dialog","aria-modal":"true","aria-label":"Нэвтрэх"},box);
    var name=h("input",{class:"auth-f",type:"text",autocomplete:"name",maxlength:"40","aria-label":"Нэр"});
    var email=h("input",{class:"auth-f",type:"email",autocomplete:"email",inputmode:"email",spellcheck:"false","aria-label":"И-мэйл"});
    var pw=h("input",{class:"auth-f",type:"password",autocomplete:"current-password",minlength:"6","aria-label":"Нууц үг"});
    function run(p,okMsg){
      st.busy=true;st.msg="";paint();
      p.then(function(){st.busy=false;if(okMsg&&tst)tst(okMsg);closeAuth(false);},function(e){st.busy=false;st.ok=false;st.msg=errText(e);paint();});
    }
    function submit(e){
      if(e)e.preventDefault();
      if(st.busy)return;
      var em=email.value.trim(),p=pw.value;
      if(st.tab==="forgot"){
        if(!em){st.msg="И-мэйлээ оруулна уу.";paint();return;}
        st.busy=true;st.msg="";paint();
        resetPw(em).then(function(){st.busy=false;st.ok=true;st.msg="Нууц үг сэргээх холбоос "+em+" хаяг руу илгээгдлээ.";paint();},function(er){st.busy=false;st.ok=false;st.msg=errText(er);paint();});
        return;
      }
      if(!em||!p){st.msg="И-мэйл, нууц үгээ оруулна уу.";paint();return;}
      if(st.tab==="up")run(register(name.value.trim(),em,p),"✅ Бүртгэл үүслээ. Явц тань хадгалагдана.");
      else run(emailSignIn(em,p),"✅ Нэвтэрлээ");
    }
    function paint(){
      box.textContent="";
      pw.setAttribute("autocomplete",st.tab==="up"?"new-password":"current-password");
      box.append(h("button",{type:"button",class:"auth-x","aria-label":"Хаах",onclick:function(){closeAuth(true);}},"✕"));
      var logo=h("div",{class:"auth-logo"},h("img",{src:"icon.svg",alt:"",width:"56",height:"56"}),h("span",null,"САЛХИ"));
      box.append(logo,h("p",{class:"auth-sub"},st.tab==="forgot"?"Бүртгэлтэй и-мэйлээ оруулбал нууц үг сэргээх холбоос илгээнэ.":"Хэл сурах явцаа хадгалж, бүх төхөөрөмж дээрээ үргэлжлүүлээрэй."));
      if(kid()&&st.tab!=="forgot")box.append(h("p",{class:"auth-kid"},"👨‍👩‍👧 Хүүхэд минь, ээж аавдаа туслуулаад тэдний и-мэйлээр бүртгүүлээрэй."));
      if(st.tab!=="forgot")box.append(h("div",{class:"auth-seg",role:"tablist"},
        h("button",{type:"button",role:"tab","aria-selected":String(st.tab==="in"),onclick:function(){st.tab="in";st.msg="";paint();}},"Нэвтрэх"),
        h("button",{type:"button",role:"tab","aria-selected":String(st.tab==="up"),onclick:function(){st.tab="up";st.msg="";paint();}},"Бүртгүүлэх")));
      var form=h("form",{class:"auth-form",novalidate:"novalidate"});
      form.addEventListener("submit",submit);
      if(st.tab==="up")form.append(h("label",{class:"auth-l"},kid()?"Хүүхдийн нэр":"Нэр"),name);
      form.append(h("label",{class:"auth-l"},kid()&&st.tab!=="forgot"?"Эцэг эхийн и-мэйл":"И-мэйл"),email);
      if(st.tab!=="forgot"){
        var shown=pw.type==="text";
        var eye=h("button",{type:"button",class:"auth-eye","aria-label":shown?"Нууц үгийг нуух":"Нууц үгийг харах","aria-pressed":String(shown),onclick:function(){
          var on=pw.type==="password";pw.type=on?"text":"password";eye.innerHTML=on?EYE_OFF:EYE;
          eye.setAttribute("aria-pressed",String(on));eye.setAttribute("aria-label",on?"Нууц үгийг нуух":"Нууц үгийг харах");pw.focus();
        }});
        eye.innerHTML=shown?EYE_OFF:EYE;
        form.append(h("label",{class:"auth-l"},"Нууц үг"),h("div",{class:"auth-pw"},pw,eye));
        if(st.tab==="in")form.append(h("button",{type:"button",class:"auth-link",onclick:function(){st.tab="forgot";st.msg="";paint();}},"Нууц үгээ мартсан уу?"));
      }
      if(st.msg)form.append(h("p",{class:"auth-msg"+(st.ok?" ok":""),role:"alert"},st.msg));
      form.append(h("button",{type:"submit",class:"auth-main",disabled:st.busy?"disabled":null},
        st.busy?"Түр хүлээнэ үү...":st.tab==="up"?"Бүртгүүлэх":st.tab==="forgot"?"Холбоос илгээх":"Нэвтрэх"));
      box.append(form);
      if(st.tab==="forgot"){
        box.append(h("button",{type:"button",class:"auth-link center",onclick:function(){st.tab="in";st.msg="";paint();}},"← Нэвтрэх рүү буцах"));
      }else{
        var g=h("button",{type:"button",class:"auth-g",disabled:st.busy?"disabled":null,onclick:function(){run(signIn(),"✅ Нэвтэрлээ. Явц тань хадгалагдана.");}});
        g.innerHTML=GLOGO;g.append(h("span",null,"Google-ээр үргэлжлүүлэх"));
        box.append(h("div",{class:"auth-or"},h("span",null,"эсвэл")),g);
      }
      box.append(h("button",{type:"button",class:"auth-link center",onclick:function(){closeAuth(true);}},"Нэвтрэхгүйгээр үргэлжлүүлэх"));
    }
    paint();
    document.body.style.overflow="hidden";
    document.body.append(authEl);
    authEl.addEventListener("keydown",function(e){if(e.key==="Escape")closeAuth(true);});
  }

  /* ---------- «Профайл» табын дээд карт ---------- */
  /* st: {lvl,xp,streak}; auth=false бол (хүүхдийн горим) нэвтрэх товчгүй */
  function profileCard(h,rerender,toast,st,auth){
    var m=meta(),signed=!!(m.g&&cfg()&&auth),nm=signed?(m.name||"Хэрэглэгч"):"Зочин";
    var av=h("div",{class:"pf-av","aria-hidden":"true"});
    if(signed&&m.photo){var im=h("img",{src:m.photo,alt:"",referrerpolicy:"no-referrer"});im.onerror=function(){im.remove();av.textContent=nm.charAt(0).toUpperCase();};av.append(im);}
    else av.textContent=signed?nm.charAt(0).toUpperCase():"👤";
    var info=h("div",{class:"pf-info"},h("div",{class:"pf-name"},nm));
    if(signed&&m.email&&m.email!==nm)info.append(h("div",{class:"pf-mail"},m.email));
    info.append(h("div",{class:"pf-chips"},h("span",null,"Lv "+st.lvl),h("span",null,st.xp+" XP"),h("span",null,"🔥 "+st.streak)));
    var card=h("div",{class:"pf-card"},h("div",{class:"pf-top"},av,info));
    if(!auth||!cfg())return card;
    if(signed){
      card.append(h("p",{class:"pf-sync"},(lastErr?"⚠️ "+errText({message:lastErr}):"☁️ "+(m.last?"Синк хийсэн: "+new Date(m.last).toLocaleString():"Синк хийгдээгүй"))),
        h("div",{class:"row",style:"flex-wrap:wrap;margin-top:10px"},
          h("button",{class:"btn",onclick:function(e){e.currentTarget.disabled=true;push().then(function(){toast(lastErr?errText({message:lastErr}):"☁️ Хадгаллаа");rerender();});}},"🔄 Синк хийх"),
          h("button",{class:"btn ghost",onclick:function(){signOut().then(function(){toast("Гарлаа. Явц энэ төхөөрөмж дээр үлдэнэ.");rerender();},function(e){toast(errText(e));});}},"Гарах")));
    }else{
      card.append(h("p",{class:"pf-sync"},"Нэвтэрвэл явц тань хадгалагдаж, бүх төхөөрөмж дээр үргэлжилнэ."),
        h("button",{class:"btn primary",style:"width:100%;margin-top:10px",onclick:function(){openAuth("in");}},"🔐 Нэвтрэх / Бүртгүүлэх"));
    }
    return card;
  }

  /* толгой хэсгийн товчинд: Firebase ачаалалгүйгээр нэвтэрсэн эсэхийг мэдэх */
  function account(){var m=meta();return m.g?{name:m.name||"",email:m.email||""}:null;}

  /* ---------- эхлэл ---------- */
  /* askFirst: эхний удаа (нэвтрээгүй, алгасаагүй) нэвтрэх хуудсыг харуулах эсэх */
  function boot(toast,changed,h,askFirst){
    tst=toast||null;onChange=changed||null;H=h||null;
    if(!cfg())return;
    if(sessionStorage.getItem("salkhi:gredir")){
      sessionStorage.removeItem("salkhi:gredir");
      load().then(function(){return firebase.auth().getRedirectResult();}).then(function(r){if(r&&r.user)return afterLogin();},function(e){
        return Promise.resolve().then(function(){return handleErr(e);}).catch(function(e2){var t=errText(e2);if(t&&tst)tst(t);});
      });
      return;
    }
    if(meta().g)pull(true);
    else if(askFirst&&!meta().skip)setTimeout(function(){openAuth("in");},400);
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"&&meta().g&&timer){clearTimeout(timer);timer=null;push();}});
  }

  window.SalkhiSync={account:account,openAuth:openAuth,touch:touch,reset:reset,profileCard:profileCard,boot:boot,signIn:signIn,signOut:signOut,push:push,pull:pull,_merge:merge};
  window.SalkhiFB={load:load,ready:ready,user:user};
})();
