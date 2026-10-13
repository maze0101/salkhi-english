/* Салхи: 🧠 санах арга (мнемоник) — үгийн картын доор. Гадаад үгийг монгол ойролцоо дуудлагатай үгтэй холбосон
   богино дүрслэл: «bear (баавгай) — "Бээр!" гэж хашгирахад баавгай гарч ирэв».
   Суралцагч өөрөө бичнэ: 1) төстэй дуудлагатай монгол үг 2) түүнийг утгатай холбосон дүрслэл. AI санал байхгүй —
   Workers AI-ийн монгол бичвэр утгагүй гарсан (туршилт: «Боров хүнээс зээлэхэд санаагүй хүнээс зээлээдээ»).
   Хадгалалт: sget "mnem" = {"<хэл>:<үг>": {s, at}} (синк хийгдэнэ, 300 хүртэл). Хэцүү үгэнд хүрээ нь тодорно. */
(function(){
  /* native append() null-ийг "null" бичвэр болгодог тул алгасна */
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  var KEY="mnem",MAXN=300,env=null,h=null,M={edit:null,snd:"",img:""};
  var EX="bear (баавгай) → «бээр» — Анчин «Бээр!» гэж хашгирахад баавгай гарч ирэв.";
  function all(){var m=env.sget(KEY,{});return m&&typeof m==="object"?m:{};}
  function key(w){return env.lang()+":"+w[1];}
  function get(w){return all()[key(w)]||null;}
  function saveM(w,s){
    var m=all();
    if(s)m[key(w)]={s:String(s).slice(0,300),at:Date.now()};else delete m[key(w)];
    var ks=Object.keys(m);
    if(ks.length>MAXN)ks.sort(function(a,b){return (m[a].at||0)-(m[b].at||0);}).slice(0,ks.length-MAXN).forEach(function(k){delete m[k];});
    env.sset(KEY,m);
  }
  function editor(wrap,w,cur){
    var snd=h("input",{class:"tin",maxlength:"40","aria-label":"Төстэй дуудлагатай монгол үг",placeholder:"1. Төстэй сонсогдох монгол үг (ж: бээр)",value:M.snd,style:"margin-top:6px"});
    var img=h("textarea",{class:"tin",rows:"2",maxlength:"240","aria-label":"Санах арга",placeholder:"2. Утгатай нь холбосон дүрслэл (ж: Анчин «Бээр!» гэж хашгирахад баавгай гарч ирэв.)",style:"width:100%;margin-top:6px"});
    img.value=M.img;
    snd.addEventListener("input",function(){M.snd=snd.value;});img.addEventListener("input",function(){M.img=img.value;});
    put(wrap,h("div",{style:"font-weight:700"},"🧠 "+w[1]+(w[7]?" ["+w[7]+"]":"")+" — "+w[2]),
      h("div",{class:"muted small",style:"margin-top:2px"},"Үгийг чангаар хэлээд ямар монгол үг шиг сонсогдож байгааг бод. Тэр үгийг утгатай нь хөгжилтэй, тод дүрслэлээр холбо."),
      h("button",{class:"btn ghost",style:"padding:4px 10px;margin-top:4px",onclick:function(){env.speak(w[1]);}},"🔊 Үгийг сонсох"),
      snd,img,
      h("div",{class:"row"},
        h("button",{class:"btn",onclick:function(){M.edit=null;env.render();}},"Болих"),
        h("button",{class:"btn primary",onclick:function(){
          var a=String(M.snd||"").trim(),b=String(M.img||"").trim();
          if(!b){env.toast("Дүрслэлээ бичнэ үү");img.focus();return;}
          saveM(w,(a?"«"+a+"» — ":"")+b);M.edit=null;env.toast("🧠 Хадгаллаа",1500);env.render();}},"✅ Хадгалах")));
    setTimeout(function(){if(snd.isConnected&&document.activeElement!==snd&&document.activeElement!==img)(cur?img:snd).focus();},0);
  }
  function box(e,w){
    env=e;h=e.h;
    if(!w)return null;
    var k=key(w),cur=get(w),hard=e.hard&&e.hard(w);
    var wrap=h("div",{class:"note",style:"margin-top:10px"+(hard&&!cur?";border-color:var(--warn,#e0a100)":"")});
    if(M.edit===k){editor(wrap,w,cur);return wrap;}
    if(cur){
      put(wrap,h("div",{class:"muted small",style:"font-weight:700"},"🧠 Санах арга"),
        h("div",{style:"margin-top:4px;font-size:16px;line-height:1.5"},cur.s),
        h("div",{class:"row",style:"margin-top:6px"},
          h("button",{class:"btn ghost",style:"padding:4px 10px",onclick:function(){
            var m=/^«([^»]*)» — ([\s\S]*)$/.exec(cur.s);M.snd=m?m[1]:"";M.img=m?m[2]:cur.s;M.edit=k;env.render();}},"✏️ Засах"),
          h("button",{class:"btn ghost",style:"padding:4px 10px",onclick:function(){if(confirm("Санах аргыг устгах уу?")){saveM(w,null);env.render();}}},"🗑 Устгах")));
      return wrap;
    }
    put(wrap,h("div",{style:"font-weight:700"},hard?"🧠 Энэ үг танд хэцүү байна — санах арга нэмээрэй":"🧠 Санах арга"),
      h("div",{class:"muted small",style:"margin-top:2px"},"Жишээ: "+EX),
      h("button",{class:"btn",style:"margin-top:6px",onclick:function(){M.edit=k;M.snd="";M.img="";env.render();}},"✍️ Санах арга бичих"));
    return wrap;
  }
  window.Mnemo={box:box,get:function(e,w){var o=env;env=e;try{return get(w);}finally{env=o;}},count:function(e){var o=env;env=e;try{return Object.keys(all()).length;}finally{env=o;}}};
})();
