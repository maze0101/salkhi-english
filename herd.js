/* Салхи: 🐑 Үгийн сүрэг — сурсан үг бүр нэг хонь. Давтах хугацаа нь болоогүй үг хашаандаа, хэтэрсэн үг
   хэтэрсэн хоногийнхоо хэрээр хол бэлчинэ (SRS-ийн state.due). Төөрсөн хонин дээр дарж үгийг зөв хариулбал хонь
   хашаандаа буцна (env.grade → SRS шинэчлэгдэнэ). Хэцүү үг — хар хонь. Хонины байрлал үгийн нэрээс тогтмол тооцогдоно. */
(function(){
  var env=null,h=null,S={q:null};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function hash(s){var x=7;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))%100003;return x;}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0,t=a[i];a[i]=a[j];a[j]=t;}return a;}
  /* сурсан үгс: хайрцаг ≥1 (ядаж нэг удаа зөв хариулсан) */
  function flock(){
    var now=Date.now();
    return env.all().filter(function(w){return env.box(w)>=1;}).map(function(w){
      var d=env.due(w),late=d&&d<now?(now-d)/86400000:0;
      return {w:w,late:late,hard:env.hard(w)};
    });
  }
  /* хашаа: зүүн талд дугуй; төөрсөн хонь хоцорсон хоногоор хол (хамгийн ихдээ 14 хоног = талбайн ирмэг) */
  function spot(s,W,H){
    var k=hash(s.w[1]),a=(k%360)*Math.PI/180,r;
    var px=W*0.24,py=H*0.58,pr=Math.min(W,H)*0.2;
    if(s.late<=0){r=(k%97)/97*pr*0.78;return [px+Math.cos(a)*r,py+Math.sin(a)*r*0.7];}
    var f=Math.min(1,s.late/14);r=pr*1.15+f*(Math.max(W,H)*0.7);
    var x=px+Math.abs(Math.cos(a))*r,y=py+Math.sin(a)*r*0.45;
    return [Math.max(14,Math.min(W-14,x)),Math.max(H*0.3,Math.min(H-12,y))];
  }
  function field(list){
    var W=340,H=230,NS="http://www.w3.org/2000/svg";
    var svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.setAttribute("role","img");
    svg.setAttribute("aria-label","Бэлчээр: "+list.filter(function(s){return s.late<=0;}).length+" хонь хашаанд, "+list.filter(function(s){return s.late>0;}).length+" нь төөрсөн");
    svg.style.cssText="width:100%;height:auto;display:block;border-radius:14px;background:linear-gradient(#BFE3FF,#E8F6FF 38%,#B6E3A1 38%,#8FCF7A)";
    svg.innerHTML='<path d="M0 88 Q60 60 120 84 T240 78 T340 86 V96 H0Z" fill="#9BD08A" opacity=".7"/>'+
      '<g fill="none" stroke="#8B5E34" stroke-width="3"><ellipse cx="'+W*0.24+'" cy="'+H*0.58+'" rx="'+Math.min(W,H)*0.21+'" ry="'+Math.min(W,H)*0.15+'"/></g>'+
      '<g stroke="#8B5E34" stroke-width="3">'+[0,1,2,3,4,5,6,7,8,9].map(function(i){var a=i/10*Math.PI*2,x=W*0.24+Math.cos(a)*Math.min(W,H)*0.21,y=H*0.58+Math.sin(a)*Math.min(W,H)*0.15;return '<line x1="'+x+'" y1="'+(y-9)+'" x2="'+x+'" y2="'+(y+2)+'"/>';}).join("")+'</g>'+
      '<g transform="translate('+(W*0.24-14)+','+(H*0.58-62)+')"><path d="M0 22 L14 8 L28 22 Z" fill="#E03131"/><rect x="3" y="22" width="22" height="16" rx="2" fill="#fff" stroke="#ccc"/><rect x="11" y="28" width="6" height="10" fill="#E67700"/></g>';
    list.slice(0,80).forEach(function(s){
      var p=spot(s,W,H),g=document.createElementNS(NS,"g");
      g.setAttribute("transform","translate("+p[0].toFixed(1)+","+p[1].toFixed(1)+")");
      var body=s.hard?"#3A3A3A":"#FFFFFF",head=s.hard?"#1E1E1E":"#3A3A3A";
      g.innerHTML='<ellipse cx="0" cy="0" rx="9" ry="6.5" fill="'+body+'" stroke="#9AA" stroke-width=".8"/><circle cx="8" cy="-3" r="3.6" fill="'+head+'"/><path d="M-5 5v4M4 5v4" stroke="#333" stroke-width="1.4"/>';
      if(s.late>0){
        g.style.cursor="pointer";g.setAttribute("tabindex","0");g.setAttribute("role","button");g.setAttribute("aria-label","Төөрсөн хонь: "+s.w[1]);
        var go=function(){ask(s);};g.addEventListener("click",go);g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
        var t=document.createElementNS(NS,"title");t.textContent=s.w[1];g.append(t);
      }
      svg.append(g);
    });
    return svg;
  }
  function ask(s){
    var others=shuffle(env.all().filter(function(w){return w[2]!==s.w[2];})).slice(0,3).map(function(w){return w[2];});
    S.q={s:s,opts:shuffle(others.concat([s.w[2]])),picked:null,t0:Date.now()};env.speak(s.w[1]);env.render();
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),list=flock();
    put(root,h("button",{class:"back",onclick:function(){S.q=null;e.close();}},"‹ Буцах"));
    put(root,h("h2",null,"🐑 Үгийн сүрэг"));
    if(!list.length){put(root,h("p",{class:"muted"},"Сүрэг чинь хоосон байна. Үг цээжилж, зөв хариулах бүрт нэг хонь нэмэгдэнэ."));return root;}
    var stray=list.filter(function(s){return s.late>0;}).sort(function(a,b){return b.late-a.late;});
    var home=list.length-stray.length,black=list.filter(function(s){return s.hard;}).length;
    put(root,h("p",{class:"muted"},"Сурсан үг бүр нэг хонь. Давтах хугацаа нь хэтэрсэн үг сүргээсээ төөрч, хол бэлчинэ. Төөрсөн хонин дээр дарж үгийг таавал хашаандаа буцна."));
    put(root,h("div",{class:"row",style:"gap:6px;flex-wrap:wrap;margin:6px 0 10px"},
      h("span",{class:"stat"},"🐑 Нийт "+list.length),h("span",{class:"stat"},"🏠 Хашаанд "+home),
      h("span",{class:"stat",style:stray.length?"color:var(--danger)":""},"🌾 Төөрсөн "+stray.length),black?h("span",{class:"stat"},"🐏 Хар хонь "+black):null));
    put(root,field(list));
    if(S.q){
      var q=S.q,s=q.s,card=h("div",{class:"note",style:"margin-top:12px"});
      put(card,h("div",{class:"muted small"},"Төөрсөн хонь · "+Math.ceil(s.late)+" хоног хэтэрсэн"));
      put(card,h("div",{style:"display:flex;align-items:center;gap:8px;margin:4px 0 8px"},h("b",{lang:env.lang(),style:"font-size:22px;flex:1"},s.w[1]),env.speakBtn(s.w[1])));
      q.opts.forEach(function(o){
        var cls="opt"+(q.picked==null?"":o===s.w[2]?" ok":o===q.picked?" bad":"");
        put(card,h("button",{class:cls,style:"width:100%;margin-top:6px",disabled:q.picked!=null,onclick:function(){
          q.picked=o;var ok=o===s.w[2];env.grade(s.w,ok,Date.now()-q.t0);
          env.toast(ok?"🐑 Хонь хашаандаа буцлаа!":"Хонь бас л төөрсөөр… 10 минутын дараа дахин оролд");env.render();
        }},o));
      });
      if(q.picked!=null)put(card,h("button",{class:"btn primary",style:"width:100%;margin-top:10px",onclick:function(){
        var nx=flock().filter(function(x){return x.late>0;}).sort(function(a,b){return b.late-a.late;})[0];
        if(nx)ask(nx);else{S.q=null;env.toast("🎉 Бүх хонь хашаандаа байна!");env.render();}
      }},"Дараагийн төөрсөн хонь ›"));
      put(root,card);
    }else if(stray.length){
      put(root,h("div",{class:"row",style:"margin-top:12px;gap:8px"},
        h("button",{class:"btn primary",style:"flex:1",onclick:function(){ask(stray[0]);}},"🐎 Хамгийн холын хонийг эргүүлэх"),
        stray.length>5?h("button",{class:"btn",onclick:function(){S.q=null;env.review();}},"Бүгдийг хураах"):null));
    }else put(root,h("div",{class:"note",style:"margin-top:12px"},"🎉 Бүх хонь хашаандаа байна. Маргааш дахин шалгаарай."));
    return root;
  }
  /* нүүрний товч мэдээлэл: хэдэн хонь төөрсөн */
  function strays(e){env=e;h=e.h;return flock().filter(function(s){return s.late>0;}).length;}
  window.Herd={view:view,strays:strays};
})();
