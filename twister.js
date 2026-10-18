/* Салхи: 👅 хэл зүгшрүүлэх үгс — хэл бүрт алдартай tongue twister-ууд, монгол утга (ja/ko/zh-д уншлагатай).
   🐢 удаан / 🔊 хэвийн сонсоод 🎤 хэлнэ: яриа танигчийн хариуг зорилтот бичвэртэй LCS-ээр харьцуулж,
   үг (CJK-д тэмдэгт) бүрийг ✅/❌ болгон нарийвчлал %, хугацааг харуулна. Дээд амжилт sget "twBest" {lang:i:{acc,sec}}.
   XP: 80%+ бол 3 (өдөрт нэг twister-т нэг л удаа). Утгыг Claude бичсэн. */
(function(){
  var T={
    en:[
      ["She sells seashells by the seashore.","","Тэр далайн эрэг дээр далайн хясаа зардаг."],
      ["Peter Piper picked a peck of pickled peppers.","","Питер Пайпер нэг сагс даршилсан чинжүү түүв."],
      ["Red lorry, yellow lorry, red lorry, yellow lorry.","","Улаан ачааны машин, шар ачааны машин…"],
      ["Unique New York, unique New York.","","Давтагдашгүй Нью-Йорк."],
      ["Toy boat, toy boat, toy boat.","","Тоглоом завь, тоглоом завь, тоглоом завь."],
      ["Three free throws.","","Гурван чөлөөт шидэлт."],
      ["A proper copper coffee pot.","","Жинхэнэ зэс кофены сав."],
      ["Six slippery snails slid slowly seaward.","","Зургаан гулгамтгай эмгэн хумс далай руу аажуухан гулгав."],
      ["I scream, you scream, we all scream for ice cream.","","Би орилно, чи орилно, бид бүгд зайрмаг гэж орилно. (I scream ≈ ice cream)"],
      ["Betty Botter bought some butter, but she said the butter's bitter.","","Бетти Боттер цөцгийн тос авсан ч тос нь гашуун байна гэв."],
      ["How much wood would a woodchuck chuck if a woodchuck could chuck wood?","","Америк тарвага мод шидэж чаддаг бол хэр их мод шидэх байсан бол?"]
    ],
    de:[
      ["Fischers Fritz fischt frische Fische.","","Загасчны Фриц шинэхэн загас барьдаг."],
      ["Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid.","","Улаан байцаа улаан байцаа хэвээр, хуримын даашинз хуримын даашинз хэвээр."],
      ["Kleine Kinder können keine kleinen Kirschkerne knacken.","","Бяцхан хүүхдүүд жижиг интоорын үрийг хагалж чаддаггүй."],
      ["Sieben Schneeschipper schippen sieben Schippen Schnee.","","Долоон цас цэвэрлэгч долоон хүрз цас хусна."],
      ["Zehn zahme Ziegen zogen zehn Zentner Zucker zum Zoo.","","Арван номхон ямаа арван центнер элсэн чихэр амьтны хүрээлэн рүү чирэв."],
      ["Zwischen zwei Zwetschgenzweigen zwitschern zwei Schwalben.","","Хоёр чавганы мөчрийн хооронд хоёр хараацай жиргэнэ."],
      ["Wenn Fliegen hinter Fliegen fliegen, fliegen Fliegen Fliegen nach.","","Ялаанууд ялааны ард нисвэл ялаа ялааг дагаж нисдэг."],
      ["Schnecken erschrecken, wenn Schnecken an Schnecken schlecken.","","Эмгэн хумс эмгэн хумсыг долоовол эмгэн хумс цочдог."],
      ["Der Cottbuser Postkutscher putzt den Cottbuser Postkutschkasten.","","Котбусын шуудангийн тэрэгчин Котбусын шуудангийн тэрэгний хайрцгийг цэвэрлэнэ."]
    ],
    ru:[
      ["Мама мыла Милу мылом.","","Ээж Милаг савангаар угаав."],
      ["На дворе трава, на траве дрова.","","Хашаанд өвс, өвсөн дээр түлээ."],
      ["Шла Саша по шоссе и сосала сушку.","","Саша хурдны замаар алхангаа хатаасан цагираган боов (сушка) хөхөж явлаа."],
      ["От топота копыт пыль по полю летит.","","Туурайн төвөргөөнөөс тоос тал даяар бужигнана."],
      ["Карл у Клары украл кораллы, а Клара у Карла украла кларнет.","","Карл Клараас шүр хулгайлж, Клара Карлаас кларнет хулгайлав."],
      ["Корабли лавировали, лавировали, да не вылавировали.","","Хөлөг онгоцууд эргэлдсээр байсан ч гарч чадсангүй."],
      ["Ехал Грека через реку, видит Грека — в реке рак.","","Грек гол гаталж явахдаа голд хавч байгааг харав."],
      ["Бык тупогуб, тупогубенький бычок, у быка бела губа была тупа.","","Бух мохоо уруултай, мохоо уруултай бяцхан бух, бухын цагаан уруул мохоо байв."],
      ["Четыре чёрненьких чумазеньких чертёнка чертили чёрными чернилами чертёж.","","Дөрвөн хар, бохир бяцхан чөтгөр хар бэхээр зураг зурав."]
    ],
    ja:[
      ["生麦生米生卵","なまむぎ なまごめ なまたまご","Түүхий арвай, түүхий будаа, түүхий өндөг."],
      ["バスガス爆発","ばす がす ばくはつ","Автобусны хийн дэлбэрэлт."],
      ["東京特許許可局","とうきょう とっきょ きょかきょく","Токиогийн патентын зөвшөөрлийн газар."],
      ["隣の客はよく柿食う客だ","となりの きゃくは よく かき くう きゃくだ","Хажуугийн зочин их хурма иддэг зочин."],
      ["赤巻紙青巻紙黄巻紙","あかまきがみ あおまきがみ きまきがみ","Улаан ороосон цаас, цэнхэр ороосон цаас, шар ороосон цаас."],
      ["すもももももももものうち","すもも も もも も もも の うち","Чавга ч, тоор ч тоорын төрөл. (李も桃も桃のうち)"],
      ["新春シャンソンショー","しんしゅん しゃんそん しょー","Шинэ жилийн шансоны тоглолт."],
      ["坊主が屏風に上手に坊主の絵を描いた","ぼうずが びょうぶに じょうずに ぼうずの えを かいた","Лам хаалт дэлгэц дээр ламын зургийг чадмаг зурав."]
    ],
    ko:[
      ["내가 그린 기린 그림은 잘 그린 기린 그림이다.","naega geurin girin geurimeun jal geurin girin geurimida","Миний зурсан анааштай зураг бол сайн зурсан анааштай зураг."],
      ["간장 공장 공장장은 강 공장장이고 된장 공장 공장장은 공 공장장이다.","ganjang gongjang gongjangjangeun gang gongjangjangigo doenjang gongjang gongjangjangeun gong gongjangjangida","Шар буурцгийн сүмсний үйлдвэрийн дарга нь Кан дарга, шар буурцгийн зуурмагийн үйлдвэрийн дарга нь Гон дарга."],
      ["경찰청 철창살은 외철창살이냐 쌍철창살이냐?","gyeongchalcheong cheolchangsareun oecheolchangsarinya ssangcheolchangsarinya","Цагдаагийн газрын төмөр торны саваа дан уу, давхар уу?"],
      ["들의 콩깍지는 깐 콩깍지인가 안 깐 콩깍지인가?","deurui kongkkakjineun kkan kongkkakjiinga an kkan kongkkakjiinga","Талбайн буурцгийн хальс хуулсан хальс уу, хуулаагүй хальс уу?"],
      ["저기 계신 저 분이 박 법학박사이시고 여기 계신 이 분이 백 법학박사이시다.","jeogi gyesin jeo buni bak beophakbaksaisigo yeogi gyesin i buni baek beophakbaksaisida","Тэнд байгаа тэр хүн бол хууль зүйн доктор Пак, энд байгаа энэ хүн бол хууль зүйн доктор Бэк."]
    ],
    zh:[
      ["妈妈骑马，马慢，妈妈骂马。","māma qí mǎ, mǎ màn, māma mà mǎ","Ээж морь унав, морь удаан тул ээж морийг загнав."],
      ["四是四，十是十，十四是十四，四十是四十。","sì shì sì, shí shì shí, shísì shì shísì, sìshí shì sìshí","Дөрөв бол дөрөв, арав бол арав, арван дөрөв бол арван дөрөв, дөч бол дөч."],
      ["八百标兵奔北坡。","bābǎi biāobīng bēn běi pō","Найман зуун цэрэг хойд энгэр рүү гүйв."],
      ["红鲤鱼与绿鲤鱼与驴。","hóng lǐyú yǔ lǜ lǐyú yǔ lǘ","Улаан мөрөг загас, ногоон мөрөг загас ба илжиг."],
      ["吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。","chī pútao bù tǔ pútao pí, bù chī pútao dào tǔ pútao pí","Усан үзэм идэхдээ хальсыг нь нулимдаггүй, идэхгүй байхдаа харин хальс нулимна."],
      ["黑化肥发灰，灰化肥发黑。","hēi huàféi fā huī, huī huàféi fā hēi","Хар бордоо саарал болдог, саарал бордоо хар болдог."]
    ]
  };
  var env=null,h=null,S={i:null,rec:false,res:null,err:""};
  function put(el){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c!=null&&c!==false)el.append(c);}}
  function cjk(){return ["ja","zh","ko"].indexOf(env.lang())>=0;}
  function kata2hira(s){return s.replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60);});}
  /* харьцуулах нэгжүүд: латин/кирилл — үг, CJK — тэмдэгт (цэг тэмдэг, зайгүй) */
  function units(s,lang){
    s=String(s||"").normalize("NFC").toLowerCase().replace(/ё/g,"е");
    if(["ja","zh","ko"].indexOf(lang)>=0)return Array.from(kata2hira(s).replace(/[\s\p{P}\p{S}]/gu,""));
    return s.replace(/[’']/g,"'").replace(/[^\p{L}\p{N}' ]/gu," ").split(/\s+/).filter(Boolean);
  }
  /* LCS — зорилтот нэгж бүр таарсан эсэх */
  function align(tg,hy){
    var n=tg.length,m=hy.length,d=[],i,j;
    for(i=0;i<=n;i++){d.push(new Array(m+1).fill(0));}
    for(i=n-1;i>=0;i--)for(j=m-1;j>=0;j--)d[i][j]=tg[i]===hy[j]?d[i+1][j+1]+1:Math.max(d[i+1][j],d[i][j+1]);
    var ok=new Array(n).fill(false);i=0;j=0;
    while(i<n&&j<m){if(tg[i]===hy[j]){ok[i]=true;i++;j++;}else if(d[i+1][j]>=d[i][j+1])i++;else j++;}
    return ok;
  }
  function score(item,alts){
    var L=env.lang(),best=null;
    alts.forEach(function(a){
      [item[0],L==="ja"?item[1]:null].forEach(function(t,k){
        if(!t)return;
        var tg=units(t,L),ok=align(tg,units(a,L)),acc=Math.round(ok.filter(Boolean).length/Math.max(1,tg.length)*100);
        if(!best||acc>best.acc)best={acc:acc,ok:ok,tg:tg,heard:a,read:k===1};
      });
    });
    return best||{acc:0,ok:[],tg:units(item[0],L),heard:""};
  }
  function record(item,idx){
    var SR=env.SR();if(!SR){S.err="Энэ хөтөч яриа таних боломжгүй (Chrome/Edge ашиглана уу).";env.render();return;}
    env.askMic(function(){
      try{
        var r=new SR(),t0=Date.now(),done=false;r.lang=env.srLang();r.maxAlternatives=5;r.interimResults=false;
        S.rec=r;S.res=null;S.err="";env.render();
        r.onresult=function(e){
          done=true;var alts=[].map.call(e.results[0],function(a){return a.transcript;});
          var res=score(item,alts);res.sec=Math.max(0.5,(Date.now()-t0)/1000);S.res=res;
          var b=env.sget("twBest",{})||{},k=env.lang()+":"+idx,prev=b[k];
          res.rec=!prev||res.acc>prev.acc||(res.acc===prev.acc&&res.sec<prev.sec);
          if(res.rec&&res.acc>0){b[k]={acc:res.acc,sec:Math.round(res.sec*10)/10};env.sset("twBest",b);}
          var day=new Date().toDateString(),xo=env.sget("twxp",{})||{};if(xo.d!==day)xo={d:day};
          if(res.acc>=80&&!xo[k]){xo[k]=1;env.sset("twxp",xo);env.addXP(3);res.xp=3;if(res.acc===100)env.celebrate();}
          env.logAct("tw");
        };
        r.onerror=function(ev){if(!done){done=true;S.err=ev&&ev.error==="no-speech"?"Дуу сонсогдсонгүй. Дахин оролдоорой.":"Яриа танихад алдаа гарлаа.";}};
        r.onend=function(){S.rec=false;env.render();};
        r.start();
      }catch(e){S.rec=false;S.err="Микрофон эхлүүлж чадсангүй.";env.render();}
    },function(){env.toast(env.micHint(),6000);});
  }
  function view(e){
    env=e;h=e.h;var root=h("div"),L=env.lang(),list=T[L]||[];
    put(root,h("button",{class:"back",onclick:function(){if(S.rec&&S.rec.stop)S.rec.stop();S={i:null,rec:false,res:null,err:""};e.close();}},"‹ Сорил"));
    put(root,h("h2",null,"👅 Хэл зүгшрүүлэх"));
    var b=env.sget("twBest",{})||{};
    if(S.i==null||!list[S.i]){
      S.i=null;
      put(root,h("p",{class:"muted"},"Эх хэлтнүүдийн ч хэл орооцолддог хэллэгүүд. Эхлээд 🐢 удаан сонсоод, дараа нь аль болох хурдан, тод хэлж 🎤 бичүүлээрэй."));
      list.forEach(function(it,i){
        var r=b[L+":"+i];
        put(root,h("button",{class:"gamecard",type:"button",style:"margin:10px 0 0",onclick:function(){S.i=i;S.res=null;S.err="";env.render();window.scrollTo(0,0);}},
          h("i",{"aria-hidden":"true"},r&&r.acc>=80?"⭐":"👅"),
          h("div",null,h("b",{lang:L},it[0]),h("span",null,it[2]+(r?" · 🏆 "+r.acc+"% · "+r.sec+"с":"")))));
      });
      return root;
    }
    var it=list[S.i];
    put(root,h("div",{class:"note",style:"text-align:center"},
      h("div",{lang:L,style:"font-size:"+(cjk()?26:22)+"px;font-weight:800;line-height:1.35"},it[0]),
      it[1]?h("div",{class:"muted",style:"margin-top:4px"},it[1]):null,
      h("div",{class:"small",style:"margin-top:8px"},"🇲🇳 "+it[2])));
    put(root,h("div",{class:"row",style:"flex-wrap:wrap;margin-top:8px"},
      h("button",{class:"btn",onclick:function(){env.speak(it[0],null,true);}},"🐢 Удаан"),
      h("button",{class:"btn",onclick:function(){env.speak(it[0]);}},"🔊 Хэвийн"),
      h("button",{class:"btn primary",style:S.rec?"background:var(--danger);border-color:var(--danger)":"",onclick:function(){if(S.rec){if(S.rec.stop)S.rec.stop();return;}env.stop();record(it,S.i);}},S.rec?"⏹ Зогсоох":"🎤 Хэлэх")));
    if(S.rec)put(root,h("p",{class:"muted",style:"text-align:center"},"🔴 Сонсож байна… одоо хэлээрэй!"));
    if(S.err)put(root,h("div",{class:"fb bad"},S.err));
    var R=S.res;
    if(R){
      var marks=h("div",{lang:L,style:"display:flex;flex-wrap:wrap;gap:"+(cjk()?"2":"6")+"px;justify-content:center;margin:8px 0;font-size:"+(cjk()?22:18)+"px"});
      R.tg.forEach(function(u,i){marks.append(h("span",{style:"padding:2px 4px;border-radius:6px;background:"+(R.ok[i]?"color-mix(in srgb,var(--ok) 18%,transparent)":"color-mix(in srgb,var(--danger) 18%,transparent)")},u));});
      put(root,h("div",{class:"fb "+(R.acc>=80?"ok":R.acc<50?"bad":""),style:"margin-top:10px;text-align:center"},
        h("div",{style:"font-size:30px;font-weight:800"},R.acc+"%"),
        h("div",{class:"small"},"⏱ "+R.sec.toFixed(1)+" секунд"+(R.xp?" · +"+R.xp+" XP":"")+(R.rec&&R.acc>0?" · 🏆 шинэ амжилт":"")),
        marks,
        h("div",{class:"muted small"},"Сонссон: «"+(R.heard||"—")+"»"),
        h("div",{class:"small",style:"margin-top:4px"},R.acc===100?"Төгс! Одоо илүү хурдан хэлж үз 🚀":R.acc>=80?"Сайн байна! Улаан хэсгийг анхаараарай.":"Улаанаар тэмдэглэсэн хэсгийг 🐢 удаан сонсоод дахин оролдоорой.")));
    }
    var r=b[L+":"+S.i];
    if(r)put(root,h("p",{class:"muted small",style:"text-align:center"},"Дээд амжилт: "+r.acc+"% · "+r.sec+" секунд"));
    put(root,h("div",{class:"row",style:"margin-top:10px"},
      h("button",{class:"btn ghost",onclick:function(){S.i=null;S.res=null;env.render();}},"‹ Жагсаалт"),
      h("button",{class:"btn",onclick:function(){S.i=(S.i+1)%list.length;S.res=null;S.err="";env.render();}},"Дараагийх ›")));
    return root;
  }
  window.Twister={view:view,has:function(l){return !!(T[l]&&T[l].length);},
    /* тест: оноо тооцох */
    _score:function(e,item,alts){var o=env;env=e;try{return score(item,alts);}finally{env=o;}},_data:T};
})();
