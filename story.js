/* Салхи: 🧩 салбарласан AI түүх — суралцагч гол дүр болж, алхам бүрт 3 сонголтоос нэгийг сонгоно; түүх тэр сонголтоор өрнөнө.
   7 алхмын дараа төгсгөл. Бичвэр нь суралцагчийн түвшинд, монгол орчуулга ба гол үгсийн тайлбартай. */
(function(){
  var STEPS=7;
  var PLOTS={
    en:[["🗽","Нью-Йоркт төөрсөн өдөр","You arrive in New York for the first time, your phone battery dies and you must find your hotel."],["🕵️","Лондонгийн нууцлаг захидал","In a London café you find a mysterious letter addressed to you."],["🎤","Шоуны шалгаруулалт","You go to an audition for a famous TV talent show."]],
    ja:[["🗼","Токиод төөрсөн өдөр","You arrive in Tokyo, take the wrong train and must find your hotel in Shinjuku."],["🍣","Сушины газрын нууц","You start a part-time job at a small sushi restaurant in Osaka."],["⛩️","Киотогийн сүмийн оньсого","At a Kyoto temple an old monk gives you a riddle."]],
    ko:[["🏙️","Сөүлд анхны өдөр","You arrive in Seoul as an exchange student and must reach your dormitory."],["🎤","K-pop дадлагажигч","You join a K-pop agency as a trainee for one day."],["🍜","Пусаны зах","At a Busan fish market you help a lost child find her grandmother."]],
    zh:[["🏯","Бээжинд төөрсөн өдөр","You arrive in Beijing and get lost near the Forbidden City."],["🐼","Пандагийн цэцэрлэг","You volunteer for a day at a panda centre in Chengdu."],["🍵","Цайны дэлгүүрийн нууц","An old tea shop owner in Shanghai asks for your help."]],
    ru:[["🚂","Транссибирийн галт тэрэг","You travel on the Trans-Siberian train and your bag disappears."],["❄️","Москвагийн өвөл","You must reach an important meeting in snowy Moscow."],["🏞️","Байгалийн эрэгт","You go camping by Lake Baikal with new friends."]],
    de:[["🏰","Берлинд анхны өдөр","You arrive in Berlin for a new job and your train is cancelled."],["🎄","Зул сарын зах","At a Christmas market in Munich you find a lost wallet."],["⛰️","Альпийн аялал","You go hiking in the Alps and the weather suddenly changes."]]
  };
  var env=null,h=null,T=null;
  function parse(t){var m=String(t||"").match(/\{[\s\S]*\}/);if(!m)return null;try{var j=JSON.parse(m[0]);return j&&j.text?j:null;}catch(e){return null;}}
  function prompt(){
    var LN=env.langEn(),cjk=["ja","ko","zh"].indexOf(env.lang())>=0,last=T.steps.length>=STEPS-1;
    var hist=T.steps.map(function(s,i){return "Part "+(i+1)+": "+s.text+(s.pick?"\nThe learner chose: "+s.pick:"");}).join("\n");
    return "You write an interactive choose-your-own-adventure story in "+LN+" for a Mongolian learner. The learner is the main character (\"you\"). Level: "+env.level()+". Keep it fun, safe and positive.\n"+
      "Story setup: "+T.plot[2]+"\n"+(hist?"Story so far:\n"+hist+"\n":"")+
      (last?"Write the FINAL part: resolve the story with a satisfying ending based on the choices. choices must be an empty array and end must be true.\n":"Write part "+(T.steps.length+1)+" of "+STEPS+": 3-4 short sentences that continue from the learner's last choice and end with a decision.\n")+
      "Reply with ONLY one JSON object:\n{\"text\":\"<"+LN+" text"+(cjk?" with romanization in parentheses after each sentence":"")+">\",\"mn\":\"<natural Mongolian (Cyrillic) translation>\",\"words\":[[\"<useful "+LN+" word from the text>\",\"<Mongolian>\"],[\"...\",\"...\"],[\"...\",\"...\"]],"+
      "\"choices\":"+(last?"[]":"[[\"<short "+LN+" choice>\",\"<Mongolian>\"],[\"...\",\"...\"],[\"...\",\"...\"]]")+",\"end\":"+(last?"true":"false")+"}";
  }
  function step(){
    T.busy=true;T.err="";env.render();
    var cur=T;
    Promise.resolve(env.ai([{role:"user",content:prompt()}])).then(function(r){
      if(T!==cur)return;T.busy=false;
      var j=parse(r);
      if(!j){T.err="AI түүхийг үргэлжлүүлж чадсангүй.";env.render();return;}
      if(!Array.isArray(j.choices))j.choices=[];
      T.steps.push({text:String(j.text),mn:String(j.mn||""),words:Array.isArray(j.words)?j.words.slice(0,4):[],choices:j.choices.slice(0,3),end:!!j.end||!j.choices.length});
      T.showMn=false;
      if(T.steps[T.steps.length-1].end&&!T.rewarded){T.rewarded=true;env.addXP(15);env.logAct("r");env.celebrate();}
      env.render();window.scrollTo(0,0);
      env.speak(env.clean(j.text));
    });
  }
  function view(e){
    env=e;h=e.h;var root=h("div");
    if(!T){
      root.append(h("p",{class:"muted"},"Чи гол дүр! Алхам бүрт 3 сонголтоос нэгийг сонгож, түүхийг өөрөө өрнүүл. Нэг түүх "+STEPS+" алхамтай."));
      (PLOTS[e.lang()]||PLOTS.en).forEach(function(p){
        root.append(h("button",{class:"gamecard",type:"button",onclick:function(){T={plot:p,steps:[],busy:false};step();}},h("i",{"aria-hidden":"true"},p[0]),h("div",null,h("b",null,p[1]),h("span",null,"Сонголтоороо өрнөдөг түүх"))));
      });
      return root;
    }
    root.append(h("div",{style:"display:flex;align-items:center;gap:8px"},h("b",{style:"flex:1"},T.plot[0]+" "+T.plot[1]),
      h("span",{class:"muted small"},Math.min(T.steps.length,STEPS)+" / "+STEPS),
      h("button",{class:"btn ghost",style:"padding:4px 10px",onclick:function(){e.stop();T=null;e.render();}},"✕")));
    root.append(h("div",{style:"height:6px;border-radius:6px;background:var(--line);overflow:hidden;margin:8px 0 12px"},h("i",{style:"display:block;height:100%;width:"+Math.round(T.steps.length/STEPS*100)+"%;background:var(--sky)"})));
    var s=T.steps[T.steps.length-1];
    if(s){
      var box=h("div",{class:"note"},h("div",{style:"font-size:17px;line-height:1.6;white-space:pre-wrap"},s.text));
      box.append(h("div",{class:"row",style:"margin-top:8px"},h("button",{class:"btn ghost",onclick:function(){e.speak(e.clean(s.text));}},"🔊 Сонсох"),
        h("button",{class:"btn ghost",onclick:function(){T.showMn=!T.showMn;e.render();}},T.showMn?"🇲🇳 Нуух":"🇲🇳 Орчуулга")));
      if(T.showMn&&s.mn)box.append(h("div",{class:"muted",style:"margin-top:6px;white-space:pre-wrap"},s.mn));
      root.append(box);
      if(s.words.length)root.append(h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin:8px 0"},s.words.map(function(w){
        return Array.isArray(w)&&w[0]?h("button",{class:"chip",onclick:function(){e.speak(w[0]);}},h("b",null,w[0]),h("span",{class:"muted"}," "+(w[1]||""))):null;})));
    }
    if(T.err)root.append(h("div",{class:"fb bad"},T.err),h("button",{class:"btn",onclick:step},"🔄 Дахин оролдох"));
    else if(T.busy)root.append(h("p",{class:"muted"},"✍️ Түүх бичигдэж байна…"));
    else if(s&&s.end){
      root.append(h("div",{class:"note",style:"text-align:center"},h("div",{style:"font-size:40px"},"🏁"),h("b",null,"Түүх дууслаа!"),h("div",{class:"muted"},"+15 XP")));
      root.append(h("div",{class:"row"},h("button",{class:"btn",onclick:function(){T=null;e.render();}},"Өөр түүх"),h("button",{class:"btn primary",onclick:function(){var p=T.plot;T={plot:p,steps:[],busy:false};step();}},"🔁 Өөр замаар дахин")));
    }else if(s){
      root.append(h("p",{style:"font-weight:700;margin:12px 0 4px"},"Чи юу хийх вэ?"));
      s.choices.forEach(function(c){
        if(!Array.isArray(c)||!c[0])return;
        root.append(h("button",{class:"opt",onclick:function(){s.pick=c[0];e.stop();step();}},h("div",null,c[0]),h("div",{class:"muted small"},c[1]||"")));
      });
    }
    return root;
  }
  window.AiStory={view:view};
})();
