/* Салхи: хятад / япон / солонгос ханзны харьцуулалт */
(function(){
  /* [утга, хялбарчилсан (zh), уламжлалт (zh), япон (шинжитай), солонгос (ханжа), pinyin, япон он-ёми, солонгос] */
  var DIFF=[
    ["сурах","学","學","学","學","xué","gaku","학 (hak)"],
    ["улс","国","國","国","國","guó","koku","국 (guk)"],
    ["хэл (үг)","语","語","語","語","yǔ","go","어 (eo)"],
    ["ном","书","書","書","書","shū","sho","서 (seo)"],
    ["уулзалт, нийгэм","会","會","会","會","huì","kai","회 (hoe)"],
    ["машин, тэрэг","车","車","車","車","chē","sha","차 (cha)"],
    ["хаалга","门","門","門","門","mén","mon","문 (mun)"],
    ["морь","马","馬","馬","馬","mǎ","ba","마 (ma)"],
    ["шувуу","鸟","鳥","鳥","鳥","niǎo","chō","조 (jo)"],
    ["загас","鱼","魚","魚","魚","yú","gyo","어 (eo)"],
    ["салхи","风","風","風","風","fēng","fū","풍 (pung)"],
    ["хайр","爱","愛","愛","愛","ài","ai","애 (ae)"],
    ["анагаах ухаан","医","醫","医","醫","yī","i","의 (ui)"],
    ["цахилгаан","电","電","電","電","diàn","den","전 (jeon)"],
    ["хаах, холбогдох","关","關","関","關","guān","kan","관 (gwan)"],
    ["цаг","时","時","時","時","shí","ji","시 (si)"],
    ["хооронд","间","間","間","間","jiān","kan","간 (gan)"],
    ["нээх","开","開","開","開","kāi","kai","개 (gae)"],
    ["дорно","东","東","東","東","dōng","tō","동 (dong)"],
    ["бие","体","體","体","體","tǐ","tai","체 (che)"],
    ["цэг","点","點","点","點","diǎn","ten","점 (jeom)"],
    ["гарах, илрэх","发","發","発","發","fā","hatsu","발 (bal)"],
    ["дамжих, эрхлэх","经","經","経","經","jīng","kei","경 (gyeong)"],
    ["зөв, эсрэг","对","對","対","對","duì","tai","대 (dae)"],
    ["одоо","现","現","現","現","xiàn","gen","현 (hyeon)"],
    ["бодит","实","實","実","實","shí","jitsu","실 (sil)"],
    ["агаар, сүнс","气","氣","気","氣","qì","ki","기 (gi)"],
    ["урт","长","長","長","長","cháng","chō","장 (jang)"],
    ["арван мянга","万","萬","万","萬","wàn","man","만 (man)"],
    ["худалдаж авах","买","買","買","買","mǎi","bai","매 (mae)"],
    ["зарах","卖","賣","売","賣","mài","bai","매 (mae)"],
    ["унших","读","讀","読","讀","dú","doku","독 (dok)"],
    ["бичих","写","寫","写","寫","xiě","sha","사 (sa)"],
    ["ярих","说","說","説","說","shuō","setsu","설 (seol)"],
    ["харах","见","見","見","見","jiàn","ken","견 (gyeon)"],
    ["зураг","图","圖","図","圖","tú","zu","도 (do)"],
    ["эм","药","藥","薬","藥","yào","yaku","약 (yak)"],
    ["байлдаан","战","戰","戦","戰","zhàn","sen","전 (jeon)"],
    ["өөрчлөх","变","變","変","變","biàn","hen","변 (byeon)"],
    ["хүүхэд","儿","兒","児","兒","ér","ji","아 (a)"],
    ["эцэг эх, хамаатан","亲","親","親","親","qīn","shin","친 (chin)"],
    ["Ази","亚","亞","亜","亞","yà","a","아 (a)"],
    ["өргөн","广","廣","広","廣","guǎng","kō","광 (gwang)"]
  ];
  /* Гурван хэлэнд адил бичигддэг ханз: [ханз, утга, pinyin, япон, солонгос] */
  var SAME=[
    ["人","хүн","rén","jin / nin","인 (in)"],
    ["日","нар, өдөр","rì","nichi / jitsu","일 (il)"],
    ["月","сар","yuè","getsu / gatsu","월 (wol)"],
    ["山","уул","shān","san","산 (san)"],
    ["水","ус","shuǐ","sui","수 (su)"],
    ["火","гал","huǒ","ka","화 (hwa)"],
    ["木","мод","mù","moku / boku","목 (mok)"],
    ["金","алт, металл","jīn","kin","금 (geum)"],
    ["土","шороо","tǔ","do / to","토 (to)"],
    ["大","том","dà","dai / tai","대 (dae)"],
    ["小","жижиг","xiǎo","shō","소 (so)"],
    ["中","дунд","zhōng","chū","중 (jung)"],
    ["天","тэнгэр","tiān","ten","천 (cheon)"],
    ["上","дээр","shàng","jō","상 (sang)"],
    ["下","доор","xià","ka / ge","하 (ha)"]
  ];
  /* Хэлбэр адил, утга өөр: [үг, япон, хятад, солонгос] (солонгос хоосон бол ашиглагддаггүй) */
  var FRIENDS=[
    ["手紙","てがみ (tegami) — захидал","手纸 shǒuzhǐ — бие засах цаас",""],
    ["勉強","べんきょう (benkyō) — хичээллэх","勉强 miǎnqiǎng — албаар, хүчээр",""],
    ["汽車","きしゃ (kisha) — уурын/ердийн галт тэрэг","汽车 qìchē — автомашин",""],
    ["走","はしる (hashiru) — гүйх","走 zǒu — алхах",""],
    ["愛人","あいじん (aijin) — хайртай хүн (гэрлээгүй)","爱人 àiren — нөхөр/эхнэр (Хятадын газар нутагт)","애인 (aein) — хайрт залуу/охин"],
    ["先生","せんせい (sensei) — багш, эмч","先生 xiānsheng — ноён (Mr.), нөхөр","선생 (seonsaeng) — багш"],
    ["娘","むすめ (musume) — охин","娘 niáng — ээж",""],
    ["湯","ゆ (yu) — халуун ус","汤 tāng — шөл",""],
    ["老婆","ろうば (rōba) — хөгшин эмэгтэй","老婆 lǎopo — эхнэр (ярианы хэлэнд)",""],
    ["丈夫","じょうぶ (jōbu) — бат бөх","丈夫 zhàngfu — нөхөр",""],
    ["新聞","しんぶん (shinbun) — сонин","新闻 xīnwén — мэдээ",""],
    ["大家","たいか (taika) — том мастер, эрхэм","大家 dàjiā — бүгдээрээ",""],
    ["怪我","けが (kega) — гэмтэл","怪我 guài wǒ — намайг буруутгах",""],
    ["工夫","くふう (kufū) — арга, сэтгэл гаргах","工夫 gōngfu — цаг хугацаа; кунг-фу","공부 (gongbu) — хичээллэх"]
  ];
  var st={part:"diff"};

  function view(env){
    var h=env.h,root=h("div");
    root.append(h("p",{class:"muted"},"Япон, солонгос, хятад хэл нэг ижил ханзаас гаралтай ч бичлэг ба утга нь заримдаа ялгаатай."));
    var seg=h("div",{class:"seg",style:"margin-top:4px"});
    [["diff","Хэлбэр"],["same","Ижил"],["fr","Утга"]].forEach(function(t){
      seg.append(h("button",{"aria-pressed":String(st.part===t[0]),onclick:function(){st.part=t[0];env.rerender();}},t[1]));
    });
    root.append(seg);

    function box(label,glyph,read,lang,badge){
      return h("button",{class:"note",style:"text-align:center;padding:10px 6px;margin:0;font:inherit",onclick:function(){env.speakAs(lang,glyph,read);},"aria-label":label+" "+glyph},
        h("div",{class:"muted small"},label),
        h("div",{style:"font-size:34px;line-height:1.2;font-weight:700"},glyph),
        h("div",{class:"muted small"},read),
        badge?h("div",{class:"small",style:"color:var(--sky,#3a7bd5);margin-top:2px"},badge):null);
    }
    if(st.part==="diff"){
      root.append(h("p",{class:"muted small"},"Хятад: 简体 (хялбарчилсан) ба 繁體 (уламжлалт). Япон: шинэ хэлбэр (新字体). Солонгос: уламжлалт ханжа. Хайрцаг дээр дарж сонсоорой."));
      DIFF.forEach(function(r){
        var simp=r[1],trad=r[2],ja=r[3],ko=r[4];
        var jaBadge=ja===trad?"繁體-тэй ижил":ja===simp?"简体-тэй ижил":"япон хэлбэр";
        var grid=h("div",{style:"display:grid;grid-template-columns:1fr 1fr;gap:8px"},
          box("简体 (хятад)",simp,r[5],"zh",simp===trad?"уламжлалттай ижил":""),
          box("繁體 (хятад)",trad,r[5],"zh",""),
          box("日本 (япон)",ja,r[6],"ja",jaBadge),
          box("韓國 (солонгос)",ko,r[7],"ko",ko===trad?"繁體-тэй ижил":""));
        root.append(h("div",{style:"margin-top:14px"},h("div",{style:"font-weight:700;margin-bottom:6px"},r[0]),grid));
      });
    }else if(st.part==="same"){
      root.append(h("p",{class:"muted small"},"Эдгээр ханз гурван хэлэнд ижил бичигддэг, харин дуудлага нь өөр."));
      SAME.forEach(function(r){
        root.append(h("div",{class:"note",style:"display:flex;align-items:center;gap:12px"},
          h("div",{style:"font-size:38px;font-weight:700;width:52px;text-align:center"},r[0]),
          h("div",{style:"flex:1;min-width:0"},h("div",{style:"font-weight:700"},r[1]),
            h("div",{class:"muted small"},"🇨🇳 "+r[2]+"  ·  🇯🇵 "+r[3]+"  ·  🇰🇷 "+r[4]))));
      });
    }else{
      root.append(h("p",{class:"muted small"},"Ижил бичигддэг боловч утга нь огт өөр үгс. Андуурч болзошгүй тул анхаараарай."));
      FRIENDS.forEach(function(r){
        var c=h("div",{class:"note"},h("div",{style:"font-size:28px;font-weight:700;margin-bottom:4px"},r[0]),
          h("div",null,"🇯🇵 "+r[1]),h("div",null,"🇨🇳 "+r[2]));
        if(r[3])c.append(h("div",null,"🇰🇷 "+r[3]));
        root.append(c);
      });
    }
    return root;
  }
  window.HanziCompare={view:view};
})();
