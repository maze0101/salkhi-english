/* Салхи: тоо сурах (0–10000). Хэл бүрийн тоог үгээр үүсгэж, жагсаалт, сонсоод бичих, уншлага сонгох дасгал хийнэ. */
(function(){
  /* ---------- тоог үгээр ---------- */
  var EN1="zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" "),
      EN10=",,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety".split(",");
  function en(n){
    if(n<20)return EN1[n];
    if(n<100)return EN10[Math.floor(n/10)]+(n%10?"-"+EN1[n%10]:"");
    if(n<1000)return EN1[Math.floor(n/100)]+" hundred"+(n%100?" and "+en(n%100):"");
    var t=Math.floor(n/1000),r=n%1000;
    return en(t)+" thousand"+(r?(r<100?" and ":" ")+en(r):"");
  }
  var DE1=",ein,zwei,drei,vier,fünf,sechs,sieben,acht,neun,zehn,elf,zwölf,dreizehn,vierzehn,fünfzehn,sechzehn,siebzehn,achtzehn,neunzehn".split(","),
      DE10=",,zwanzig,dreißig,vierzig,fünfzig,sechzig,siebzig,achtzig,neunzig".split(",");
  function de99(n){
    if(n<20)return DE1[n];
    var o=n%10,t=DE10[Math.floor(n/10)];
    return o?DE1[o]+"und"+t:t;
  }
  function deCore(n){
    var s="",t=Math.floor(n/1000),h=Math.floor(n%1000/100),r=n%100;
    if(t)s+=de99(t)+"tausend";
    if(h)s+=DE1[h]+"hundert";
    if(r)s+=r===1?"eins":de99(r);
    return s;
  }
  function de(n){return n===0?"null":n===1?"eins":deCore(n);}
  var RU1="ноль один два три четыре пять шесть семь восемь девять десять одиннадцать двенадцать тринадцать четырнадцать пятнадцать шестнадцать семнадцать восемнадцать девятнадцать".split(" "),
      RU10=",,двадцать,тридцать,сорок,пятьдесят,шестьдесят,семьдесят,восемьдесят,девяносто".split(","),
      RU100=",сто,двести,триста,четыреста,пятьсот,шестьсот,семьсот,восемьсот,девятьсот".split(",");
  function ru999(n,fem){
    var w=[],h=Math.floor(n/100),r=n%100;
    if(h)w.push(RU100[h]);
    if(r>=20){w.push(RU10[Math.floor(r/10)]);r=r%10;}
    if(r>0){w.push(fem&&r===1?"одна":fem&&r===2?"две":RU1[r]);}
    return w.join(" ");
  }
  function ru(n){
    if(n===0)return RU1[0];
    var t=Math.floor(n/1000),r=n%1000,w=[];
    if(t){
      var l=t%10,ll=t%100,form=(ll>=11&&ll<=14)?"тысяч":l===1?"тысяча":(l>=2&&l<=4)?"тысячи":"тысяч";
      w.push(ru999(t,true)+" "+form);
    }
    if(r)w.push(ru999(r,false));
    return w.join(" ");
  }
  var JA1=",いち,に,さん,よん,ご,ろく,なな,はち,きゅう".split(","),
      JA100=",ひゃく,にひゃく,さんびゃく,よんひゃく,ごひゃく,ろっぴゃく,ななひゃく,はっぴゃく,きゅうひゃく".split(","),
      JA1000=",せん,にせん,さんぜん,よんせん,ごせん,ろくせん,ななせん,はっせん,きゅうせん".split(","),
      JK=",一,二,三,四,五,六,七,八,九".split(",");
  function ja(n){
    if(n===0)return "ゼロ";if(n===10000)return "いちまん";
    var s="",t=Math.floor(n/1000),h=Math.floor(n%1000/100),d=Math.floor(n%100/10),o=n%10;
    s+=JA1000[t]+JA100[h];
    if(d)s+=(d===1?"":JA1[d])+"じゅう";
    s+=JA1[o];
    return s;
  }
  function jaK(n){
    if(n===0)return "零";if(n===10000)return "一万";
    var s="",t=Math.floor(n/1000),h=Math.floor(n%1000/100),d=Math.floor(n%100/10),o=n%10;
    if(t)s+=(t===1?"":JK[t])+"千";if(h)s+=(h===1?"":JK[h])+"百";if(d)s+=(d===1?"":JK[d])+"十";s+=JK[o];
    return s;
  }
  var KO1=",일,이,삼,사,오,육,칠,팔,구".split(","),
      KON1=",하나,둘,셋,넷,다섯,여섯,일곱,여덟,아홉".split(","),
      KON10=",열,스물,서른,마흔,쉰,예순,일흔,여든,아흔".split(",");
  function ko(n){
    if(n===0)return "영";if(n===10000)return "만";
    var s="",t=Math.floor(n/1000),h=Math.floor(n%1000/100),d=Math.floor(n%100/10),o=n%10;
    if(t)s+=(t===1?"":KO1[t])+"천";if(h)s+=(h===1?"":KO1[h])+"백";if(d)s+=(d===1?"":KO1[d])+"십";s+=KO1[o];
    return s;
  }
  function koN(n){return n>0&&n<100?KON10[Math.floor(n/10)]+KON1[n%10]:"";}
  var ZH=["零","一","二","三","四","五","六","七","八","九"],
      PY={"零":"líng","一":"yī","二":"èr","两":"liǎng","三":"sān","四":"sì","五":"wǔ","六":"liù","七":"qī","八":"bā","九":"jiǔ","十":"shí","百":"bǎi","千":"qiān","万":"wàn"};
  function zh(n){
    if(n===0)return "零";if(n===10000)return "一万";
    var q=Math.floor(n/1000),b=Math.floor(n%1000/100),s=Math.floor(n%100/10),g=n%10,out="",zero=false;
    if(q)out+=(q===2?"两":ZH[q])+"千";
    if(b)out+=ZH[b]+"百";else if(q&&(s||g))zero=true;
    if(s){if(zero){out+="零";zero=false;}out+=(s===1&&!q&&!b?"":ZH[s])+"十";}
    else if((q||b)&&g)zero=true;
    if(g){if(zero)out+="零";out+=ZH[g];}
    return out;
  }
  function zhPy(w){return Array.from(w).map(function(c){return PY[c]||c;}).join(" ");}
  /* {w: үндсэн уншлага (дуудах), r: нэмэлт мөр} */
  function word(lang,n){
    if(lang==="en")return {w:en(n)};
    if(lang==="de")return {w:de(n)};
    if(lang==="ru")return {w:ru(n)};
    if(lang==="ja")return {w:ja(n),r:jaK(n)};
    if(lang==="ko"){var nn=koN(n);return {w:ko(n),r:nn?"уугуул: "+nn:""};}
    if(lang==="zh"){var z=zh(n);return {w:z,r:zhPy(z)};}
    return {w:String(n)};
  }

  /* ---------- UI ---------- */
  var S={mode:"list",lv:1,cur:null,ans:"",done:false,ok:false,opts:null,score:0,n:0,lang:null},env=null;
  var LV=[[10,"0–10"],[100,"0–100"],[9999,"0–9999"]];
  function h(){return env.h.apply(null,arguments);}
  function rnd(){var max=LV[S.lv][0];return Math.floor(Math.random()*(max+1));}
  function say(n){env.speak(word(env.lang(),n).w);}
  function newQ(){
    var n=rnd();if(S.cur!=null&&n===S.cur)n=(n+1)%(LV[S.lv][0]+1);
    S.cur=n;S.ans="";S.done=false;S.ok=false;
    if(S.mode==="pick"){
      var seen={},o=[n];seen[n]=1;
      var tries=[n+1,n-1,n+10,n-10,Number(String(n).split("").reverse().join("")),n+100,n-100,n+2];
      tries.forEach(function(x){if(o.length<4&&x>=0&&x<=Math.max(LV[S.lv][0],10)&&!seen[x]){seen[x]=1;o.push(x);}});
      while(o.length<4){var r=rnd();if(!seen[r]){seen[r]=1;o.push(r);}}
      S.opts=o.sort(function(){return Math.random()-.5;});
    }else if(S.mode==="hear")setTimeout(function(){say(n);},250);
  }
  function viewList(root){
    var L=env.lang(),rows=[];
    for(var i=0;i<=20;i++)rows.push(i);
    [30,40,50,60,70,80,90,100,101,110,200,300,600,800,1000,2000,3000,8000,10000].forEach(function(x){rows.push(x);});
    root.append(h("p",{class:"muted small"},"Мөрийг дарж дуудлагыг сонсоно уу."));
    rows.forEach(function(n){
      var w=word(L,n);
      root.append(h("button",{class:"srow",type:"button",style:"width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);font:inherit;color:inherit;cursor:pointer;gap:12px",onclick:function(){env.speak(w.w);}},
        h("b",{style:"min-width:56px;font-size:20px"},String(n)),
        h("span",{style:"flex:1"},h("div",{style:"font-weight:700"},w.w),w.r?h("div",{class:"muted small"},w.r):null),
        h("span",{"aria-hidden":"true"},"🔊")));
    });
  }
  function feedback(root){
    var w=word(env.lang(),S.cur);
    root.append(h("div",{class:"fb "+(S.ok?"ok":"bad")},(S.ok?"Зөв! +2 XP · ":"Буруу. Зөв нь: ")+S.cur+" — "+w.w+(w.r?" ("+w.r+")":"")));
    root.append(h("div",{class:"row"},h("button",{class:"btn",onclick:function(){say(S.cur);}},"🔊 Дахин сонсох"),
      h("button",{class:"btn primary",onclick:function(){newQ();env.render();}},"Дараагийх ›")));
  }
  function grade(ok){S.done=true;S.ok=ok;S.n++;if(ok){S.score++;env.addXP(2);}env.render();}
  function viewHear(root){
    root.append(h("p",{class:"muted"},"Тоог сонсоод цифрээр бичээрэй."));
    root.append(h("button",{class:"btn primary",style:"width:100%;font-size:26px;margin:6px 0","aria-label":"Сонсох",onclick:function(){say(S.cur);}},"🔊"));
    var inp=h("input",{class:"tin",type:"text",inputmode:"numeric",autocomplete:"off","aria-label":"Тоо",value:S.ans,disabled:S.done,style:"text-align:center;font-size:28px;letter-spacing:2px"});
    var check=function(){if(S.done)return;var v=inp.value.replace(/\D/g,"");if(!v){inp.focus();return;}S.ans=v;grade(Number(v)===S.cur);};
    inp.addEventListener("keydown",function(e){if(e.key==="Enter")check();});
    root.append(inp);
    if(!S.done){root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:8px",onclick:check},"Шалгах"));setTimeout(function(){if(document.body.contains(inp))inp.focus();},50);}
    else feedback(root);
  }
  function viewPick(root){
    var L=env.lang();
    root.append(h("p",{class:"muted"},"Энэ тоог хэрхэн уншдаг вэ?"));
    root.append(h("div",{class:"note",style:"text-align:center;font-size:52px;font-weight:800;padding:12px"},String(S.cur)));
    S.opts.forEach(function(o){
      var w=word(L,o),cls="opt";
      if(S.done){if(o===S.cur)cls+=" ok";else if(o===S.picked)cls+=" bad";}
      root.append(h("button",{class:cls,disabled:S.done,onclick:function(){S.picked=o;say(S.cur);grade(o===S.cur);}},w.w+(w.r&&L!=="ko"?"  ·  "+w.r:"")));
    });
    if(S.done)feedback(root);
  }
  window.NumLearn={
    view:function(e){
      env=e;var root=h("div");
      if(S.lang!==env.lang()){S.lang=env.lang();S.cur=null;S.score=0;S.n=0;}
      root.append(h("div",{class:"seg",style:"margin-top:8px"},[["list","Жагсаалт"],["hear","Сонсох"],["pick","Унших"]].map(function(m){
        return h("button",{"aria-pressed":String(S.mode===m[0]),onclick:function(){S.mode=m[0];S.cur=null;env.render();}},m[1]);
      })));
      if(S.mode!=="list")root.append(h("div",{class:"seg"},LV.map(function(l,i){
        return h("button",{"aria-pressed":String(S.lv===i),onclick:function(){S.lv=i;newQ();env.render();}},l[1]);
      })));
      if(S.mode==="list")viewList(root);
      else{
        if(S.cur==null)newQ();
        if(S.mode==="hear")viewHear(root);else viewPick(root);
        root.append(h("p",{class:"muted small",style:"margin-top:12px"},"Оноо: "+S.score+" / "+S.n));
      }
      return root;
    },
    _word:word
  };
})();
