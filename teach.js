/* Салхи: «Багш болох» — суралцагч өөрийн сурсан 3 үгийг гэрийнхэндээ (ээж, аав, эмээ…) заана.
   1) Заах карт: үг, дуудлага, утга, жишээ, заах заавар  2) Утсаа «сурагч»-даа өгөөд богино шалгалт
   3) Дүн: «багшийн оноо», XP. Бусдад заах нь өөрөө хамгийн сайн цээжлэх арга (protégé effect). */
(function(){
  var WHO=["Ээж","Аав","Эмээ","Өвөө","Ах, эгч","Дүү","Найз"],N=3,LOG="teach";
  var env=null,h=null;
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function log(){var l=env.sget(LOG,[]);return Array.isArray(l)?l:[];}
  function points(){return log().reduce(function(a,r){return a+(r.ok||0);},0);}

  function start(e){
    env=e;h=e.h;
    var known=e.known(),pool=e.pool();
    var src=known.length>=N?known:pool;
    var pick=[],seen={};
    shuffle(src).some(function(w){if(seen[w[2]]||seen[w[1]])return false;seen[w[2]]=seen[w[1]]=1;pick.push(w);return pick.length>=N;});
    if(pick.length<N)return null;
    return {kind:"teach",t0:Date.now(),done:false,miss:0,score:0,words:pick,step:"teach",i:0,who:null,qi:0,q:null,ans:null,fromKnown:known.length>=N};
  }
  function makeQ(G){
    var w=G.words[G.qi],others=shuffle(env.pool().filter(function(x){return x[2]!==w[2]&&x[1]!==w[1];})).slice(0,3).map(function(x){return x[2];});
    G.q={w:w,o:shuffle([w[2]].concat(others))};G.ans=null;
    setTimeout(function(){env.speak(w[1]);},250);
  }
  function view(root,G,e){
    env=e;h=e.h;
    var n=G.words.length;
    if(G.step==="teach"){
      var w=G.words[G.i];
      e.gameHead(root,"👩‍🏫 Багш болох",h("span",{class:"big"},(G.i+1)+"/"+n));
      if(G.i===0)root.append(h("p",{class:"muted"},(G.fromKnown?"Чиний цээжилсэн":"Энэ")+" "+n+" үгийг гэрийнхэндээ заана. Эхлээд карт бүрийг хамт уншаарай, дараа нь тэднийг шалгана."));
      root.append(h("div",{class:"note",style:"text-align:center;margin-top:10px"},
        h("div",{style:"font:800 34px/1.2 var(--font);margin:6px 0"},w[1]),
        w[7]?h("div",{class:"muted"},w[7]):null,
        h("div",{style:"font-size:20px;font-weight:700;margin:8px 0"},"= "+w[2]),
        w[3]?h("div",{style:"margin-top:6px"},"«"+w[3]+"»"):null,
        w[8]&&w[3]?h("div",{class:"muted small"},w[8]):null));
      root.append(h("div",{class:"row"},e.speakBtn(w[1]),w[3]?h("button",{class:"btn",onclick:function(){e.speak(w[3]);}},"🔊 Өгүүлбэр"):null));
      root.append(h("div",{class:"note small",style:"margin-top:10px"},
        h("b",null,"Ингэж заа:"),
        h("div",null,"1. Үгийг 2 удаа чангаар хэлж, давтуул 🗣️"),
        h("div",null,"2. Утгыг нь монголоор тайлбарла, гараараа дохиод үзүүл 🙌"),
        h("div",null,"3. Үгээ ашиглан өөрөө нэг өгүүлбэр зохиож хэл ✨")));
      root.append(h("div",{class:"row"},
        G.i>0?h("button",{class:"btn",onclick:function(){G.i--;e.render();}},"‹ Өмнөх"):null,
        h("button",{class:"btn primary",onclick:function(){if(G.i<n-1){G.i++;e.render();window.scrollTo(0,0);}else{G.step="who";e.render();window.scrollTo(0,0);}}},G.i<n-1?"Дараагийн үг ›":"Заачихлаа ✅")));
      return root;
    }
    if(G.step==="who"){
      e.gameHead(root,"👩‍🏫 Багш болох",null);
      root.append(h("div",{style:"text-align:center;font-size:52px;margin:10px 0"},"📱➡️🧑"));
      root.append(h("p",{style:"text-align:center;font-weight:700"},"Хэнд заасан бэ? Сонгоод утсаа түүнд өг."));
      root.append(h("div",{style:"display:flex;flex-wrap:wrap;gap:8px;justify-content:center"},WHO.map(function(x){
        return h("button",{class:"chip",style:"font-size:16px;padding:10px 16px",onclick:function(){G.who=x;G.step="quiz";G.qi=0;makeQ(G);e.render();window.scrollTo(0,0);}},x);
      })));
      return root;
    }
    if(G.step==="quiz"){
      var q=G.q;
      e.gameHead(root,"📝 "+G.who+" шалгуулж байна",h("span",{class:"big"},(G.qi+1)+"/"+n));
      root.append(h("p",{class:"muted"},G.who+", энэ үгийн утга аль нь вэ? 🔊 дарж сонсоорой."));
      root.append(h("div",{style:"text-align:center;font:800 32px/1.3 var(--font);margin:10px 0"},q.w[1]));
      root.append(h("div",{class:"row",style:"justify-content:center"},e.speakBtn(q.w[1])));
      q.o.forEach(function(o){
        var cls="opt"+(G.ans!=null?(o===q.w[2]?" ok":o===G.ans?" bad":""):"");
        root.append(h("button",{class:cls,disabled:G.ans!=null,onclick:function(){
          G.ans=o;if(o===q.w[2]){G.score++;e.celebrate();}else G.miss++;e.render();
        }},o));
      });
      if(G.ans!=null){
        var ok=G.ans===q.w[2];
        root.append(h("div",{class:"fb "+(ok?"ok":"bad")},ok?"Зөв! Багш нь сайн заажээ 🎉":"Зөв нь: "+q.w[2]+". Багш дахиад нэг заагаарай 🙂"));
        root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){
          if(G.qi<n-1){G.qi++;makeQ(G);}else{G.step="done";}e.render();window.scrollTo(0,0);
        }},G.qi<n-1?"Дараагийн ›":"Дүн харах 🏁")));
      }
      return root;
    }
    /* дүн */
    e.gameHead(root,"👩‍🏫 Багш болох",null);
    if(!G.logged){
      G.logged=true;
      var l=log();l.push({d:Date.now(),who:G.who,n:n,ok:G.score});env.sset(LOG,l.slice(-60));
      e.logAct("t");
    }
    var tp=points(),title=tp>=60?"🏅 Мастер багш":tp>=30?"⭐ Ахлах багш":tp>=10?"📘 Багш":"🌱 Шинэ багш";
    e.gameOver(root,G,[G.who+": "+G.score+" / "+n+" зөв",G.score===n?"Чи жинхэнэ багш боллоо! 👩‍🏫":"Дараагийн удаа илүү сайн заана 💪","Багшийн оноо: "+tp+" · "+title],5+G.score*3,"teach");
    return root;
  }
  window.Teach={start:start,view:view,points:function(e){env=e;return points();},count:function(e){env=e;return log().length;}};
})();
