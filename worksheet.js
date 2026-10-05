/* Салхи: 🖨️ хэвлэх ажлын хуудас — сонгосон үгсээс A4 хуудас үүсгэж хэвлэнэ (эсвэл «PDF болгон хадгалах»).
   4 дасгал: хос холбох, монголоор орчуулах, өгүүлбэр нөхөх (үгийн сантай), монголоос бичих + тусдаа хариултын хуудас.
   Интернэтгүй хөдөөний сургуульд багш хэвлээд тараана. Үгийн жагсаалт: ангилал, алдсан/хадгалсан үгс, багшийн жагсаалт. */
(function(){
  var env=null,h=null,W={src:"cat",n:12};
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function blank(sent,word){
    var s=String(sent||""),w=String(word||"").replace(/^(to|the|a|an|der|die|das)\s+/i,"");
    if(!s||!w)return null;
    var i=s.toLowerCase().indexOf(w.toLowerCase());
    return i<0?null:s.slice(0,i)+"________"+s.slice(i+w.length);
  }
  /* words: [[word, mn, example, exampleMn]] */
  function html(title,words,langName){
    var ws=words.slice(0,24),L=Math.min(ws.length,10);
    var m=shuffle(ws).slice(0,Math.min(8,ws.length)),mR=shuffle(m),abc="ABCDEFGHIJ";
    var tr=shuffle(ws).slice(0,Math.min(6,ws.length));
    var fill=shuffle(ws.filter(function(w){return blank(w[2],w[0]);})).slice(0,6);
    var wr=shuffle(ws.filter(function(w){return fill.indexOf(w)<0;})).slice(0,Math.min(6,ws.length));
    var css="@page{size:A4;margin:14mm}body{font-family:Arial,'Noto Sans',sans-serif;color:#111;font-size:13pt;line-height:1.45}h1{font-size:19pt;margin:0}h2{font-size:14pt;margin:18px 0 6px;border-bottom:1.5px solid #333;padding-bottom:2px}"+
      ".meta{display:flex;justify-content:space-between;margin:6px 0 4px;font-size:12pt}.two{display:grid;grid-template-columns:1fr 1fr;gap:4px 28px}.ln{border-bottom:1px solid #999;display:inline-block;min-width:170px;height:1.1em}"+
      ".bank{border:1.5px dashed #555;padding:6px 10px;border-radius:6px;margin:4px 0 8px}.key{page-break-before:always}.small{font-size:10.5pt;color:#555}ol{margin:4px 0;padding-left:22px}li{margin:5px 0}";
    var o="<!doctype html><html><head><meta charset='utf-8'><title>"+esc(title)+"</title><style>"+css+"</style></head><body>";
    o+="<h1>"+esc(title)+"</h1><div class='meta'><span>Нэр: <span class='ln'></span></span><span>Анги: <span class='ln' style='min-width:70px'></span></span><span>Огноо: <span class='ln' style='min-width:90px'></span></span></div>";
    o+="<div class='small'>Салхи · "+esc(langName)+" хэл · "+ws.length+" үг</div>";
    o+="<h2>1. Үгийг утгатай нь холбо</h2><div class='two'><ol>"+m.map(function(w){return "<li>"+esc(w[0])+" &nbsp;___</li>";}).join("")+"</ol><div>"+mR.map(function(w,i){return "<div>"+abc[i]+". "+esc(w[1])+"</div>";}).join("")+"</div></div>";
    o+="<h2>2. Монголоор орчуул</h2><ol class='two'>"+tr.map(function(w){return "<li>"+esc(w[0])+" — <span class='ln'></span></li>";}).join("")+"</ol>";
    if(fill.length){
      o+="<h2>3. Өгүүлбэрийг нөхөж бич</h2><div class='bank'><b>Үгийн сан:</b> "+shuffle(fill).map(function(w){return esc(String(w[0]).replace(/^(to)\s+/i,""));}).join(" · ")+"</div><ol>"+
        fill.map(function(w){return "<li>"+esc(blank(w[2],w[0]))+(w[3]?"<div class='small'>("+esc(w[3])+")</div>":"")+"</li>";}).join("")+"</ol>";
    }
    o+="<h2>"+(fill.length?"4":"3")+". "+esc(langName)+" хэлээр бич</h2><ol class='two'>"+wr.map(function(w){return "<li>"+esc(w[1])+" — <span class='ln'></span></li>";}).join("")+"</ol>";
    o+="<div class='key'><h1>Хариулт</h1><h2>1</h2><div>"+m.map(function(w,i){return (i+1)+"–"+abc[mR.indexOf(w)];}).join(", ")+"</div>";
    o+="<h2>2</h2><ol>"+tr.map(function(w){return "<li>"+esc(w[0])+" — "+esc(w[1])+"</li>";}).join("")+"</ol>";
    if(fill.length)o+="<h2>3</h2><ol>"+fill.map(function(w){return "<li>"+esc(w[2])+"</li>";}).join("")+"</ol>";
    o+="<h2>"+(fill.length?"4":"3")+"</h2><ol>"+wr.map(function(w){return "<li>"+esc(w[1])+" — "+esc(w[0])+"</li>";}).join("")+"</ol></div>";
    return o+"</body></html>";
  }
  /* хуудсыг нууц iframe-д ачаалж хэвлэнэ (PWA/iOS-д шинэ цонх хаагдаж болдог) */
  function print(title,words,langName){
    if(!words||words.length<4){(env&&env.toast||alert)("Хэвлэхэд дор хаяж 4 үг хэрэгтэй");return;}
    var f=document.createElement("iframe");f.setAttribute("aria-hidden","true");
    f.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.append(f);
    var d=f.contentDocument;d.open();d.write(html(title,words,langName));d.close();
    setTimeout(function(){try{f.contentWindow.focus();f.contentWindow.print();}catch(e){}setTimeout(function(){f.remove();},60000);},400);
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    root.append(h("button",{class:"back",onclick:function(){e.close();}},"‹ Үгс"));
    root.append(h("h2",null,"🖨️ Ажлын хуудас хэвлэх"));
    root.append(h("p",{class:"muted"},"Сонгосон үгсээр A4 ажлын хуудас үүсгэнэ: хос холбох, орчуулах, өгүүлбэр нөхөх, бичих + хариултын хуудас. Хэвлэх цонхонд «PDF болгон хадгалах»-ыг сонгож болно."));
    var srcs=e.sources();
    root.append(h("div",{style:"display:flex;flex-direction:column;gap:6px;margin:8px 0"},srcs.map(function(s){
      return h("button",{class:"opt",style:"margin:0;text-align:left"+(W.src===s.id?";border-color:var(--sky);border-width:2px":""),disabled:s.words.length<4,onclick:function(){W.src=s.id;e.render();}},
        h("b",null,s.name),h("span",{class:"muted small"}," · "+s.words.length+" үг"+(s.words.length<4?" (хангалтгүй)":"")));
    })));
    root.append(h("div",{class:"muted small"},"Үгийн тоо"));
    root.append(h("div",{class:"seg",style:"margin:4px 0 12px"},[8,12,16,24].map(function(n){return h("button",{"aria-pressed":String(W.n===n),onclick:function(){W.n=n;e.render();}},String(n));})));
    var cur=srcs.filter(function(s){return s.id===W.src;})[0]||srcs[0];
    root.append(h("button",{class:"btn primary",style:"width:100%",disabled:!cur||cur.words.length<4,onclick:function(){
      print(cur.name+" — ажлын хуудас",shuffle(cur.words).slice(0,W.n),e.langName());e.addXP(1);
    }},"🖨️ Хэвлэх / PDF"));
    return root;
  }
  window.Worksheet={view:view,print:function(e,title,words,langName){env=e;print(title,words,langName);},_html:html};
})();
