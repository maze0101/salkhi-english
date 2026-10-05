/* Салхи: 🗓️ өдрийн 5 минутын хичээл — апп нээхэд нэг товч. Апп өөрөө хөтөлбөр гаргана:
   🔁 давтлага (давтах хугацаа болсон 4 үг) → 🆕 2 шинэ үг (карт + шалгалт) → 🎧 сонсоод сонгох (2) → 🗣️ чангаар хэлэх (1).
   Нийт ~10 алхам ≈ 5 минут. Дуусгавал +15 XP, өдөрт нэг удаа. */
(function(){
  var KEY="d5",env=null,h=null,L=null;
  function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function doneToday(){var d=env.sget(KEY,{});return !!(d&&d[today()+":"+env.lang()]);}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function opts(w,field){
    var pool=env.pool(),seen={};seen[w[field]]=1;
    var o=shuffle(pool).filter(function(x){if(seen[x[field]]||x[1]===w[1])return false;seen[x[field]]=1;return true;}).slice(0,3).map(function(x){return x[field];});
    return shuffle([w[field]].concat(o));
  }
  function build(){
    var steps=[],used={};
    var rev=env.due(4);if(rev.length<2)rev=rev.concat(shuffle(env.known()).filter(function(w){return rev.indexOf(w)<0;}).slice(0,2-rev.length));
    rev.forEach(function(w){used[w[1]]=1;steps.push({k:"rev",w:w,o:opts(w,2)});});
    var fresh=shuffle(env.fresh()).filter(function(w){return !used[w[1]];}).slice(0,2);
    fresh.forEach(function(w){used[w[1]]=1;steps.push({k:"card",w:w});});
    fresh.forEach(function(w){steps.push({k:"rev",w:w,o:opts(w,2),fresh:true});});
    shuffle(env.pool()).filter(function(w){return !used[w[1]]&&w[1].length<=24;}).slice(0,2).forEach(function(w){used[w[1]]=1;steps.push({k:"hear",w:w,o:opts(w,1)});});
    var sw=fresh[0]||rev[0];
    if(sw&&env.SR())steps.push({k:"say",w:sw});
    return steps;
  }
  function start(e){env=e;h=e.h;var s=build();if(s.length<3){e.toast("Хичээл гаргахад үг хүрэлцэхгүй байна");return false;}L={steps:s,i:0,ok:0,pick:null,said:null,t0:Date.now()};return true;}
  function next(){L.i++;L.pick=null;L.said=null;env.render();window.scrollTo(0,0);if(L.i<L.steps.length&&L.steps[L.i].k==="hear")setTimeout(function(){env.speak(L.steps[L.i].w[1]);},300);}
  function finish(root){
    if(!L.fin){
      L.fin=true;var d=env.sget(KEY,{})||{};d[today()+":"+env.lang()]=1;
      var ks=Object.keys(d).sort();while(ks.length>60)delete d[ks.shift()];env.sset(KEY,d);
      env.addXP(15);env.celebrate();
    }
    var min=Math.max(1,Math.round((Date.now()-L.t0)/60000));
    root.append(h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:44px"},"🎉"),
      h("b",{style:"font-size:19px"},"Өнөөдрийн хичээл дууслаа!"),
      h("div",{class:"muted"},L.ok+" / "+L.steps.filter(function(s){return s.k!=="card";}).length+" зөв · "+min+" минут · +15 XP"),
      h("div",{class:"small",style:"margin-top:6px"},"🔥 Маргааш дахин уулзъя.")));
    root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){L=null;env.close();}},"Дуусгах")));
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    if(!L){root.append(h("p",{class:"muted"},"…"));return root;}
    var n=L.steps.length;
    root.append(h("div",{style:"display:flex;align-items:center;gap:10px;margin-bottom:10px"},
      h("button",{class:"btn ghost",style:"padding:6px 10px","aria-label":"Хаах",onclick:function(){L=null;e.stop();e.close();}},"✕"),
      h("div",{style:"flex:1;height:10px;border-radius:10px;background:var(--line);overflow:hidden",role:"progressbar","aria-valuemin":"0","aria-valuemax":String(n),"aria-valuenow":String(L.i)},
        h("i",{style:"display:block;height:100%;width:"+Math.round(L.i/n*100)+"%;background:var(--neon);transition:width .3s"}))));
    if(L.i>=n){finish(root);return root;}
    var s=L.steps[L.i],w=s.w;
    var lab={rev:s.fresh?"🆕 Шинэ үгээ шалга":"🔁 Давтлага",card:"🆕 Шинэ үг",hear:"🎧 Сонсоод сонго",say:"🗣️ Чангаар хэл"}[s.k];
    root.append(h("div",{class:"muted small",style:"font-weight:600"},lab));
    if(s.k==="card"){
      root.append(h("div",{class:"note",style:"text-align:center;margin-top:8px"},
        h("div",{style:"font:800 34px/1.2 var(--font)"},w[1]),w[7]?h("div",{class:"muted"},w[7]):null,
        h("div",{style:"font-size:20px;font-weight:700;margin-top:6px"},w[2]),
        w[3]?h("div",{style:"margin-top:8px"},"«"+w[3]+"»"):null,w[8]?h("div",{class:"muted small"},w[8]):null));
      root.append(h("div",{class:"row"},e.speakBtn(w[1]),h("button",{class:"btn primary",onclick:next},"Ойлголоо ›")));
      return root;
    }
    if(s.k==="say"){
      root.append(h("p",{style:"margin:8px 0 4px"},"Энэ үгийг чангаар хэлээрэй:"));
      root.append(h("div",{style:"text-align:center;font:800 34px/1.3 var(--font);margin:8px 0"},w[1]),h("div",{class:"muted",style:"text-align:center"},w[2]));
      var st=h("div",{class:"fb","aria-live":"polite"});
      if(L.said!=null)st.className="fb "+(L.said?"ok":"bad"),st.textContent=L.said?"Сайн байна! 🎉":"Дахин оролдоод үзээрэй, эсвэл алгас.";
      root.append(h("div",{class:"row"},e.speakBtn(w[1]),h("button",{class:"btn primary",onclick:function(){
        e.listen(w[1],function(ok){L.said=ok;if(ok){L.ok++;e.celebrate();setTimeout(next,900);}e.render();});
      }},"🎤 Хэлэх"),h("button",{class:"btn ghost",onclick:next},"Алгасах")),st);
      return root;
    }
    var q=s.k==="hear"?"Сонссон үгээ сонго":"Энэ үгийн утга аль нь вэ?",ans=s.k==="hear"?w[1]:w[2];
    root.append(h("p",{style:"margin:8px 0"},q));
    if(s.k==="hear")root.append(h("div",{class:"row",style:"justify-content:center"},h("button",{class:"btn",style:"font-size:20px;padding:14px 22px",onclick:function(){e.speak(w[1]);}},"🔊 Дахин сонсох")));
    else root.append(h("div",{style:"text-align:center;font:800 32px/1.3 var(--font);margin:6px 0"},w[1]));
    s.o.forEach(function(o){
      var cls="opt"+(L.pick!=null?(o===ans?" ok":o===L.pick?" bad":""):"");
      root.append(h("button",{class:cls,disabled:L.pick!=null,onclick:function(){
        L.pick=o;var ok=o===ans;if(ok)L.ok++;
        if(s.k==="rev")e.grade(w,ok);else{e.addXP(ok?2:0);if(ok)e.celebrate();}
        if(s.k!=="hear")e.speak(w[1]);
        e.render();
      }},o));
    });
    if(L.pick!=null){
      root.append(h("div",{class:"fb "+(L.pick===ans?"ok":"bad")},L.pick===ans?"Зөв!":"Зөв нь: "+ans+(s.k==="hear"?" ("+w[2]+")":"")));
      root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:next},L.i<n-1?"Дараагийх ›":"Дуусгах 🏁")));
    }
    return root;
  }
  function card(e,open){
    env=e;h=e.h;var done=doneToday();
    return h("button",{class:"note",type:"button",style:"display:flex;align-items:center;gap:12px;width:100%;text-align:left;margin:0 0 12px;color:inherit;font:inherit;cursor:pointer"+(done?"":";border-color:var(--sky);border-width:2px"),onclick:done?function(){e.toast("✅ Өнөөдрийн хичээл дууссан. Маргааш дахин!");}:open},
      h("span",{style:"font-size:30px","aria-hidden":"true"},done?"✅":"🗓️"),
      h("span",{style:"flex:1"},h("b",null,done?"Өнөөдрийн хичээл дууссан":"Өнөөдрийн 5 минут"),h("div",{class:"muted small"},done?"Маргааш шинэ хичээл гарна":"Давтлага, шинэ үг, сонсох, ярих — апп өөрөө бэлдсэн")),
      done?null:h("span",{class:"btn primary",style:"flex:none;padding:8px 14px"},"Эхлэх"));
  }
  window.Daily5={start:start,view:view,card:card,done:function(e){env=e;return doneToday();},active:function(){return !!L;}};
})();
