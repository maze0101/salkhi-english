/* Салхи: 🏙️ Хотын ан — гудамжинд гадаад бичигтэй хаяг, самбар, шошгоны зургийг авч цуглуулна.
   Worker /ocr бичвэрийг уншиж монголоор орчуулна; самбар бүр +10 оноо, «Миний үгс»-т нэмсэн үг бүр +2.
   Байршлыг (зөвшөөрвөл) хадгалж OpenStreetMap дээр харуулна. Цуглуулга sget("hunt") — сүүлийн 40, жижиг зурагтай. */
(function(){
  var env=null,h=null,S={busy:false,res:null,err:null,img:null,geo:null,open:null};
  var KEY="hunt";
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function list(){var a=env.sget(KEY,[]);return Array.isArray(a)?a:[];}
  function save(a){env.sset(KEY,a.slice(0,40));}
  function shrink(file,max,q,cb){
    var fr=new FileReader();fr.onload=function(){
      var im=new Image();im.onload=function(){
        var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");
        c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);
        cb(c.toDataURL("image/jpeg",q));
      };im.onerror=function(){cb(null);};im.src=fr.result;
    };fr.readAsDataURL(file);
  }
  function locate(){
    S.geo=null;if(!navigator.geolocation)return;
    try{navigator.geolocation.getCurrentPosition(function(p){S.geo=[+p.coords.latitude.toFixed(5),+p.coords.longitude.toFixed(5)];},function(){},{maximumAge:300000,timeout:8000});}catch(e){}
  }
  function scan(file){
    var url=env.ocrURL();if(!url){S.err="Камераар унших үйлчилгээ одоогоор алга.";env.render();return;}
    S.busy=true;S.err=null;S.res=null;env.render();locate();
    shrink(file,160,.6,function(th){S.img=th;});
    shrink(file,1024,.82,function(big){
      if(!big){S.busy=false;S.err="Зургийг уншиж чадсангүй.";env.render();return;}
      fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({lang:env.lang(),image:big.split(",")[1]})})
        .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
        .then(function(x){
          S.busy=false;
          if(!x.ok||!x.j||!x.j.mn){S.err=x.j&&x.j.error==="no_text"?"Зурагт бичиг олдсонгүй. Самбарыг ойроос, тод авна уу.":"Уншиж чадсангүй. Дахин оролдоно уу.";}
          else S.res=x.j;
          env.render();
        },function(){S.busy=false;S.err="Интернэт холболтоо шалгана уу.";env.render();});
    });
  }
  function collect(){
    var a=list(),r=S.res;
    a.unshift({ts:Date.now(),lang:env.lang(),text:String(r.text||"").slice(0,300),mn:String(r.mn||"").slice(0,400),words:(r.words||[]).slice(0,12),img:S.img||null,geo:S.geo});
    save(a);env.addXP(10);env.toast("🏙️ Самбар цуглуулгад нэмэгдлээ! +10 XP");S.res=null;S.img=null;env.render();
  }
  function score(a){return a.length*10;}
  function osm(g){return "https://www.openstreetmap.org/?mlat="+g[0]+"&mlon="+g[1]+"#map=17/"+g[0]+"/"+g[1];}
  function wordRow(w){
    var has=env.hasWord(w.w);
    return h("div",{style:"display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--line)"},
      h("div",{style:"flex:1;min-width:0"},h("b",{lang:env.lang()},w.w),w.r?h("span",{class:"muted small"}," "+w.r):null,h("div",{class:"muted small"},w.mn)),
      h("button",{class:"btn ghost","aria-label":"Сонсох",style:"padding:6px 8px",onclick:function(){env.speak(w.w);}},"🔊"),
      h("button",{class:"btn",style:"padding:6px 10px",disabled:has,onclick:function(){env.addWord(w.w,w.mn,"","",w.r||null);env.addXP(2);env.toast("➕ «"+w.w+"» Миний үгст нэмэгдлээ");env.render();}},has?"✓":"➕"));
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),a=list().filter(function(x){return x.lang===env.lang();});
    put(root,h("button",{class:"back",onclick:function(){S.res=null;S.err=null;S.open=null;e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"🏙️ Хотын ан"));
    put(root,h("p",{class:"muted"},"Гудамж, дэлгүүр, кафе, автобусны буудлаас "+env.langName().toLowerCase()+" бичигтэй хаяг, самбар, шошго хайж зургийг нь ав. Апп уншиж орчуулна, самбар бүр нэг оноо болно."));
    put(root,h("div",{class:"row",style:"gap:6px;flex-wrap:wrap;margin-bottom:10px"},
      h("span",{class:"stat"},"🪧 "+a.length+" самбар"),h("span",{class:"stat"},"⭐ "+score(a)+" оноо"),
      h("span",{class:"stat"},"📍 "+a.filter(function(x){return x.geo;}).length+" газар")));
    var inp=h("input",{type:"file",accept:"image/*",capture:"environment",style:"display:none",onchange:function(){if(inp.files&&inp.files[0])scan(inp.files[0]);inp.value="";}});
    put(root,inp);
    if(S.busy)put(root,h("div",{class:"note"},"⏳ Бичгийг уншиж, орчуулж байна…"));
    else if(S.res){
      var r=S.res,card=h("div",{class:"note"});
      if(S.img)put(card,h("img",{src:S.img,alt:"",style:"width:96px;height:96px;object-fit:cover;border-radius:12px;float:right;margin:0 0 8px 8px"}));
      put(card,h("div",{class:"muted small"},"Бичиг"),h("div",{lang:env.lang(),style:"font-weight:600;white-space:pre-wrap"},r.text),
        h("div",{class:"muted small",style:"margin-top:8px"},"🇲🇳 Орчуулга"),h("div",{style:"white-space:pre-wrap"},r.mn));
      (r.words||[]).forEach(function(w){put(card,wordRow(w));});
      put(card,h("div",{class:"row",style:"margin-top:10px;gap:8px"},
        h("button",{class:"btn primary",style:"flex:1",onclick:collect},"🪧 Цуглуулгад нэмэх"),
        h("button",{class:"btn",onclick:function(){S.res=null;env.render();}},"Болих")));
      put(root,card);
    }else{
      if(S.err)put(root,h("div",{class:"note",style:"color:var(--danger)"},S.err));
      put(root,h("button",{class:"btn primary",style:"width:100%",onclick:function(){inp.click();}},"📷 Самбарын зураг авах"));
    }
    if(a.length){
      put(root,h("h3",{style:"margin-top:18px"},"🪧 Миний цуглуулга"));
      a.forEach(function(x,i){
        var on=S.open===x.ts,c=h("div",{class:"note",style:"margin-top:8px;cursor:pointer",onclick:function(){S.open=on?null:x.ts;env.render();}});
        put(c,h("div",{style:"display:flex;gap:10px;align-items:center"},
          x.img?h("img",{src:x.img,alt:"",style:"width:52px;height:52px;object-fit:cover;border-radius:10px;flex:none"}):h("span",{style:"font-size:30px"},"🪧"),
          h("div",{style:"flex:1;min-width:0"},h("b",{lang:env.lang(),style:"display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"},x.text.split("\n")[0]),
            h("div",{class:"muted small"},new Date(x.ts).toLocaleDateString("mn-MN")+" · "+(x.words||[]).length+" үг"))));
        if(on){
          put(c,h("div",{style:"margin-top:8px;white-space:pre-wrap"},x.mn));
          (x.words||[]).forEach(function(w){put(c,wordRow(w));});
          put(c,h("div",{class:"row",style:"margin-top:8px;gap:8px"},
            x.geo?h("a",{class:"btn",href:osm(x.geo),target:"_blank",rel:"noopener",onclick:function(ev){ev.stopPropagation();}},"🗺️ Газрын зураг"):null,
            h("button",{class:"btn ghost",onclick:function(ev){ev.stopPropagation();var all=list().filter(function(y){return y.ts!==x.ts;});save(all);S.open=null;env.render();}},"🗑️ Устгах")));
        }
        put(root,c);
      });
    }
    return root;
  }
  window.Hunt={view:view};
})();
