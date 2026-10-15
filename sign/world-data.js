/* Салхи: 🌍 дэлхийн дохионы хэлүүд — апп-ын хэл бүрт харгалзах дохионы хэл (sign.js «Дэлхий» таб).
   Хурууны үсгийн зураг: Wikimedia Commons-оос татаж sign/world/<хэл>/-д хадгалсан (Commons олон зургийг зэрэг хүсэхэд 429 буцаадаг),
   өөрчлөөгүй; файл бүрийн зохиогч, лиценз, эх хаяг sign/world/SOURCE.txt-д. CC BY / CC BY-SA / CC0:
     JSL «*-jsl-yubimoji.png» — Nesnad, agoramachina (CC BY / CC BY-SA 3.0–4.0)
     KSL «KSL *.jpg» — Kwamikagami (CC BY-SA 3.0)
     BSL «BSL letter *.svg» — Coloringbuddymike (CC BY-SA 3.0)
     DGS «Fingeralphabet *.jpg» — Deutsche Gehörlosenhilfe Bayern e.V., Richard Huber (CC BY / CC BY-SA 4.0)
     RSL «Novgorod Art and History Museum - Russian manual alphabet.jpg» — Александр Сигачёв (CC0)
   2026-10-15-нд Commons API-аар бүх файл байгаа, лиценз нь дээрх гэдгийг шалгасан.
   Үгийн видео: SpreadTheSign (spreadthesign.com — iframe хориглосон тул шинэ таб), Солонгос: 국립국어원 한국수어사전 (sldict.korean.go.kr).
   48 үгийн орчуулга: sign.js WORDS-ийн дарааллаар (hello … time). */
window.SIGN_WORLD=(function(){
  var C="sign/world/";
  function sts(code){return function(q){return "https://www.spreadthesign.com/"+code+"/search/?q="+encodeURIComponent(q);};}
  function split(s){return s.split("|");}
  return {
    langs:{en:"bsl",ja:"jsl",ko:"ksl",zh:"csl",ru:"rsl",de:"dgs"},
    list:{
      bsl:{flag:"🇬🇧",name:"Британийн дохионы хэл",native:"British Sign Language (BSL)",
        facts:["Их Британид хэрэглэгддэг. Англи хэлтэй ч ASL-ээс тэс өөр хэл — хоёулаа ойлголцдоггүй.","Хурууны цагаан толгой нь ХОЁР гараар үсэглэдэг (ASL нэг гараар).","Их Британи 2022 онд «BSL Act» хуулиар албан ёсны хэл гэж хүлээн зөвшөөрсөн."],
        abc:"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(function(x){return [x,C+"bsl/"+x.toLowerCase()+".svg"];}),abcCredit:"Зураг: Coloringbuddymike, Wikimedia Commons, CC BY-SA 3.0",
        dict:{name:"SpreadTheSign (BSL)",url:sts("en.gb")},
        /* апп дотор: SignBSL хуудас iframe-д (тэд хориглоогүй) — 48 үгийн хуудас бүгд байгааг шалгасан */
        frame:{name:"SignBSL.com",url:function(q){return "https://www.signbsl.com/sign/"+q.toLowerCase().replace(/ +/g,"-");}},
        words:split("hello|thank you|sorry|please|yes|no|goodbye|name|understand|mother|father|brother|sister|family|child|friend|teacher|water|food|eat|drink|toilet|help|home|school|work|doctor|money|sleep|happy|sad|love|tired|hungry|sick|good|bad|what|who|where|when|why|how|today|tomorrow|yesterday|now|time")},
      jsl:{flag:"🇯🇵",name:"Японы дохионы хэл",native:"日本手話 (Nihon Shuwa, JSL)",
        facts:["Японд хэрэглэгддэг. Солонгос, Тайванийн дохионы хэлтэй ойр гэр бүлийн хэл.","Хурууны үсэг (指文字, yubimoji) нь хираганы үе бүрт нэг тэмдэг: 45 тэмдэг + дуудлагын 4 нэмэлт хөдөлгөөн.","Ихэнх эгшиг, үе нь ASL-ийн үсгээс гаралтай; бусад нь катакана, тооны хэлбэрээс."],
        abc:split("あ:A|い:I|う:U|え:E|お:O|か:Ka|き:Ki|く:Ku|け:Ke-|こ:Ko|さ:Sa|し:Shi|す:Su|せ:Se|そ:So|た:TA|ち:CHI|つ:TSU|て:TE|と:To|な:NA|に:NI|ぬ:NU|ね:NE|の:NO|は:HA|ひ:HI|ふ:FU|へ:HE|ほ:HO|ま:MA|み:MI|む:MU|め:ME|も:MO|や:Ya|ゆ:Yu|よ:YO").map(function(x){var p=x.split(":");return [p[0],C+"jsl/"+p[1].toLowerCase().replace(/-$/,"")+".png"];}),
        abcNote:"ら・わ・ん мөрийн тэмдгийг SpreadTheSign дээрээс үзнэ үү.",abcCredit:"Зураг: Nesnad, agoramachina, Wikimedia Commons, CC BY / CC BY-SA",
        dict:{name:"SpreadTheSign (JSL)",url:sts("ja.jp")},
        words:split("こんにちは|ありがとう|ごめんなさい|お願いします|はい|いいえ|さようなら|名前|分かる|母|父|兄弟|姉妹|家族|子ども|友達|先生|水|食べ物|食べる|飲む|トイレ|助ける|家|学校|仕事|医者|お金|寝る|嬉しい|悲しい|愛|疲れる|お腹がすく|病気|良い|悪い|何|誰|どこ|いつ|なぜ|どうやって|今日|明日|昨日|今|時間")},
      ksl:{flag:"🇰🇷",name:"Солонгосын дохионы хэл",native:"한국수어 (Hanguk Sueo, KSL)",
        facts:["Өмнөд Солонгост хэрэглэгддэг. 2016 оны «한국수화언어법» хуулиар солонгос хэлтэй адил эрхтэй албан ёсны хэл болсон.","Хурууны үсэг нь нэг гараар, хангылийн үсгийн хэлбэрийг дуурайдаг: 14 гийгүүлэгч + 1 давхар + 17 эгшиг.","Албан ёсны толь бичгийг Солонгосын Үндэсний хэлний хүрээлэн (국립국어원) гаргадаг."],
        abc:split("ㄱ:g|ㄴ:n|ㄷ:d|ㄹ:r|ㅁ:m|ㅂ:b|ㅅ:s|ㅆ:ss|ㅇ:ng|ㅈ:j|ㅊ:ch|ㅋ:k|ㅌ:t|ㅍ:p|ㅎ:h|ㅏ:a|ㅐ:ae|ㅑ:ya|ㅒ:yae|ㅓ:eo|ㅔ:e|ㅕ:yeo|ㅖ:ye|ㅗ:o|ㅚ:oe|ㅛ:yo|ㅜ:u|ㅟ:wi|ㅠ:yu|ㅡ:eu|ㅢ:ui|ㅣ:i").map(function(x){var p=x.split(":");return [p[0],C+"ksl/"+p[1]+".jpg"];}),
        abcCredit:"Зураг: Kwamikagami, Wikimedia Commons, CC BY-SA 3.0",
        dict:{name:"한국수어사전 (국립국어원)",url:function(q){return "https://sldict.korean.go.kr/front/search/searchAllList.do?searchKeyword="+encodeURIComponent(q);}},
        /* апп дотор: албан ёсны толийн хайлтын хуудас iframe-д (тэд хориглоогүй) — үр дүн дээр дарж видеог үзнэ */
        frame:{name:"한국수어사전",url:function(q){return "https://sldict.korean.go.kr/front/search/searchAllList.do?searchKeyword="+encodeURIComponent(q);}},
        words:split("안녕하세요|감사합니다|미안합니다|부탁합니다|네|아니요|안녕히 가세요|이름|이해하다|어머니|아버지|형제|자매|가족|아이|친구|선생님|물|음식|먹다|마시다|화장실|돕다|집|학교|일|의사|돈|자다|기쁘다|슬프다|사랑|피곤하다|배고프다|아프다|좋다|나쁘다|무엇|누구|어디|언제|왜|어떻게|오늘|내일|어제|지금|시간")},
      csl:{flag:"🇨🇳",name:"Хятадын дохионы хэл",native:"中国手语 (Zhōngguó Shǒuyǔ, CSL)",
        facts:["Хятадад хэрэглэгддэг. Улсын нийтлэг дохионы хэл (国家通用手语) стандартчилагдсан.","Хурууны үсэг нь пиньинь (латин галиг) дээр суурилсан — үсэг бүрт нэг гарын хэлбэр, мөн ZH, CH, SH, NG-д тусгай тэмдэг.","Ихэнх үгийг иероглифийн хэлбэр эсвэл утгаар нь дохиолдог тул хурууны үсэг бага хэрэглэнэ."],
        abc:null,abcNote:"Нээлттэй лицензтэй хүснэгт олдсонгүй — SpreadTheSign дээр «字母» гэж хайж үзнэ үү.",
        dict:{name:"SpreadTheSign (CSL)",url:sts("zh.hans.cn")},
        words:split("你好|谢谢|对不起|请|是|不|再见|名字|明白|妈妈|爸爸|哥哥|姐姐|家庭|孩子|朋友|老师|水|食物|吃|喝|厕所|帮助|家|学校|工作|医生|钱|睡觉|高兴|难过|爱|累|饿|生病|好|坏|什么|谁|哪里|什么时候|为什么|怎么|今天|明天|昨天|现在|时间")},
      rsl:{flag:"🇷🇺",name:"Оросын дохионы хэл",native:"Русский жестовый язык (РЖЯ)",
        facts:["Орос болон ТУХН-ийн орнуудад хэрэглэгддэг. 2012 оны хуулиар Орост харилцааны хэл гэж хүлээн зөвшөөрсөн.","Дактил цагаан толгой нь нэг гараар — орос үсэг бүрт (33) нэг тэмдэг.","Францын дохионы хэлтэй ижил үндэстэй (XIX зуун)."],
        chart:C+"rsl/chart.jpg",chartAlt:"Оросын дактил цагаан толгой — Новгородын музейн үзмэр",
        abcCredit:"Гэрэл зураг: Александр Сигачёв, Wikimedia Commons, CC0",
        dict:{name:"SpreadTheSign (РЖЯ)",url:sts("ru.ru")},
        words:split("привет|спасибо|извините|пожалуйста|да|нет|до свидания|имя|понимать|мама|папа|брат|сестра|семья|ребёнок|друг|учитель|вода|еда|есть|пить|туалет|помогать|дом|школа|работа|врач|деньги|спать|радостный|грустный|любовь|устать|голодный|больной|хорошо|плохо|что|кто|где|когда|почему|как|сегодня|завтра|вчера|сейчас|время")},
      dgs:{flag:"🇩🇪",name:"Германы дохионы хэл",native:"Deutsche Gebärdensprache (DGS)",
        facts:["Германд хэрэглэгддэг. 2002 онд албан ёсны хэл гэж хүлээн зөвшөөрсөн.","Хурууны цагаан толгой нэг гараар — латин 26 үсгээс гадна Ä, Ö, Ü, SCH-д тусгай тэмдэгтэй.","Австри, Швейцарийн дохионы хэл DGS-ээс ялгаатай."],
        abc:split("A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|Sch|T|U|V|W|X|Y|Z|Ä|Ö|Ü").map(function(x){return [x.toUpperCase(),C+"dgs/"+x.toLowerCase().replace("ä","ae").replace("ö","oe").replace("ü","ue")+".jpg"];}),
        abcCredit:"Зураг: Deutsche Gehörlosenhilfe Bayern e.V., Richard Huber, Wikimedia Commons, CC BY / CC BY-SA 4.0",
        dict:{name:"SpreadTheSign (DGS)",url:sts("de.de")},
        /* апп дотор тоглох видео: SignDict (signdict.org) — CC BY / BY-SA (NC лицензтэйг оруулаагүй), sign/world/dgs-v/-д хуулсан (API-ийн заавар: hotlink хийхгүй).
           [файл, лиценз, зохиогч, эх хуудас] */
        vid:{dir:"sign/world/dgs-v/",src:"SignDict",map:{"hallo":["hallo.mp4","by-sa/3.0/de","Philipps - dgs.wikisign.org","http://dgs.wikisign.org/Hallo"],
      "danke":["danke.mp4","by-sa/3.0/de","Philipps - dgs.wikisign.org","http://dgs.wikisign.org/Danke"],
      "Entschuldigung":["entschuldigung.mp4","by-sa/3.0/de","Philipps - dgs.wikisign.org","http://dgs.wikisign.org/Entschuldigung"],
      "bitte":["bitte.mp4","by-sa/3.0/de","Philipps - dgs.wikisign.org","http://dgs.wikisign.org/Bitte_(Antwort)"],
      "ja":["ja.mp4","by-sa/3.0/de","Cellx - dgs.wikisign.org","http://dgs.wikisign.org/Ja"],
      "nein":["nein.mp4","by-sa/3.0/de","Cellx - dgs.wikisign.org","http://dgs.wikisign.org/Nein"],
      "Name":["name.mp4","by-sa/3.0/de","Philipps - dgs.wikisign.org","http://dgs.wikisign.org/Name"],
      "verstehen":["verstehen.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Verstehen"],
      "Mutter":["mutter.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Mutter"],
      "Vater":["vater.mp4","by-sa/3.0/de","134.130.170.101 - dgs.wikisign.org","http://dgs.wikisign.org/Vater"],
      "Bruder":["bruder.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Bruder"],
      "Schwester":["schwester.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Schwester"],
      "Familie":["familie.mp4","by-sa/3.0/de","Cellx - dgs.wikisign.org","http://dgs.wikisign.org/Familie"],
      "Kind":["kind.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Kind"],
      "Lehrer":["lehrer.mp4","by-sa/3.0/de","Vampir - dgs.wikisign.org","http://dgs.wikisign.org/Lehrer"],
      "Wasser":["wasser.mp4","by-sa/3.0/de","Philipps - dgs.wikisign.org","http://dgs.wikisign.org/Wasser"],
      "Toilette":["toilette.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Toilette"],
      "Schule":["schule.mp4","by-sa/3.0/de","Yesilgoez - dgs.wikisign.org","http://dgs.wikisign.org/Schule"],
      "Arbeit":["arbeit.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Arbeit"],
      "Arzt":["arzt.mp4","by-sa/3.0/de","Marco - dgs.wikisign.org","http://dgs.wikisign.org/Arzt"],
      "Geld":["geld.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Geld"],
      "froh":["froh.mp4","by-sa/3.0/de","134.130.170.90 - dgs.wikisign.org","http://dgs.wikisign.org/Froh"],
      "gut":["gut.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Gut"],
      "wer":["wer.mp4","by/4.0","senidevelop.de","https://signdict.org/entry/4653"],
      "wo":["wo.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Wo"],
      "wann":["wann.mp4","by/4.0","senidevelop.de","https://signdict.org/entry/3629"],
      "wie":["wie.mp4","by-sa/3.0/de","134.130.170.112 - dgs.wikisign.org","http://dgs.wikisign.org/Wie"],
      "heute":["heute.mp4","by-sa/3.0/de","Cellx - dgs.wikisign.org","http://dgs.wikisign.org/Heute"],
      "morgen":["morgen.mp4","by-sa/3.0/de","Cellx - dgs.wikisign.org","http://dgs.wikisign.org/Morgen_(kommender_Tag)"],
      "gestern":["gestern.mp4","by-sa/3.0/de","Cellx - dgs.wikisign.org","http://dgs.wikisign.org/Gestern"]}},
        words:split("hallo|danke|Entschuldigung|bitte|ja|nein|tschüss|Name|verstehen|Mutter|Vater|Bruder|Schwester|Familie|Kind|Freund|Lehrer|Wasser|Essen|essen|trinken|Toilette|helfen|Zuhause|Schule|Arbeit|Arzt|Geld|schlafen|froh|traurig|Liebe|müde|hungrig|krank|gut|schlecht|was|wer|wo|wann|warum|wie|heute|morgen|gestern|jetzt|Zeit")}
    }
  };
})();
