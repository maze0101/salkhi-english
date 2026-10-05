/* Салхи: 📸 камераар орчуулах — хоолны цэс, тэмдэг, сав баглаа боодлын зургийг авахад worker-ийн /ocr бичвэрийг уншиж,
   монголоор орчуулаад, доторх гол үгсийг тайлбарлана. Үгийг «Миний үгс»-д нэмж болно. Зургийг хаана ч хадгалахгүй. */
(function(){
  var env=null,h=null,O={img:null,busy:false,err:"",res:null};
  function shrink(file,cb){
    var img=new Image(),url=URL.createObjectURL(file);
    img.onload=function(){
      var s=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement("canvas");
      c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
      /* worker 400 КБ хүртэл хүлээж авна: багтах хүртэл чанарыг бууруулна */
      var q=0.85,d=c.toDataURL("image/jpeg",q);
      while(d.length>520000&&q>0.4){q-=0.1;d=c.toDataURL("image/jpeg",q);}
      cb(d.length<=530000?d:null);
    };
    img.onerror=function(){URL.revokeObjectURL(url);cb(null);};
    img.src=url;
  }
  function send(d){
    O.img=d;O.busy=true;O.err="";O.res=null;env.render();
    fetch(env.ocrURL(),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({lang:env.lang(),image:d.split(",")[1]})})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,status:r.status,j:j};});})
      .then(function(x){
        O.busy=false;
        if(x.ok&&x.j&&x.j.mn){O.res=x.j;env.addXP(3);}
        else O.err=x.j&&x.j.error==="no_text"?"Зурган дээр уншигдах бичвэр олдсонгүй. Ойроос, гэрэлтэй газар дахин аваарай.":x.status===429?"Хэт олон удаа илгээлээ. Түр хүлээгээд дахин оролдоорой.":"Бичвэрийг уншиж чадсангүй. Дахин оролдоорой.";
        env.render();
      }).catch(function(){O.busy=false;O.err="Интернэт холболтоо шалгаарай.";env.render();});
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    root.append(h("button",{class:"back",onclick:function(){O={img:null,busy:false,err:"",res:null};e.close();}},"‹ Тоглоомууд"));
    root.append(h("h2",null,"📸 Камераар орчуулах"));
    root.append(h("p",{class:"muted"},"Хоолны цэс, тэмдэг, барааны шошгоны зургийг ав. Доторх "+e.langName().toLowerCase()+" бичвэрийг уншиж, монголоор орчуулаад, гол үгсийг тайлбарлана."));
    var file=h("input",{type:"file",accept:"image/*",capture:"environment",style:"display:none","aria-label":"Зураг сонгох"});
    file.addEventListener("change",function(){var f=file.files[0];if(!f)return;shrink(f,function(d){if(d)send(d);else{O.err="Зургийг уншиж чадсангүй.";e.render();}});});
    root.append(file);
    if(O.img)root.append(h("img",{src:O.img,alt:"Авсан зураг",style:"display:block;width:100%;max-height:280px;object-fit:contain;border-radius:18px;background:var(--surface);margin:8px 0"}));
    if(O.busy)root.append(h("div",{class:"note",style:"text-align:center"},"🔍 Бичвэрийг уншиж байна…"));
    if(O.err)root.append(h("div",{class:"fb bad"},O.err));
    if(O.res){
      var r=O.res;
      root.append(h("div",{class:"note"},h("div",{class:"muted small"},"📄 Бичвэр"),h("div",{style:"white-space:pre-wrap;margin-top:4px;font-size:16px"},r.text),
        h("div",{class:"row",style:"margin-top:6px"},h("button",{class:"btn ghost",onclick:function(){e.speak(r.text);}},"🔊 Уншуулах"))));
      root.append(h("div",{class:"note"},h("div",{class:"muted small"},"🇲🇳 Орчуулга"),h("div",{style:"white-space:pre-wrap;margin-top:4px"},r.mn)));
      if(r.words&&r.words.length){
        root.append(h("h3",{style:"margin:14px 0 6px"},"🔑 Үгс"));
        r.words.forEach(function(w){
          var has=e.hasWord(w.w);
          root.append(h("div",{class:"srow"},h("span",{style:"flex:1"},h("b",null,w.w),w.r?h("span",{class:"muted"}," ("+w.r+")"):null,h("span",{class:"muted"}," — "+w.mn)),e.speakBtn(w.w),
            has?h("span",{class:"muted small"},"✅"):h("button",{class:"btn ghost",style:"padding:4px 10px","aria-label":"Миний үгс-д нэмэх",onclick:function(){e.addWord(w.w,w.mn,"","",w.r||"");e.toast("➕ «Миний үгс»-д нэмэгдлээ");e.render();}},"➕")));
        });
      }
    }
    root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:12px;font-size:19px",disabled:O.busy,onclick:function(){file.value="";file.click();}},O.res||O.err?"📸 Дахин зураг авах":"📸 Зураг авах"));
    root.append(h("p",{class:"muted small",style:"margin-top:12px"},"Зургийг зөвхөн уншихад ашиглана, хаана ч хадгалахгүй."));
    return root;
  }
  window.Ocr={view:view};
})();
