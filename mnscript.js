/* Салхи: ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ — уйгаржин монгол бичиг сурах.
   Үсэг (эхний/дунд/сүүлийн хэлбэр), үгс (утга нь сурч буй хэлээр), тест, кирилл ⇄ бичиг хөрвүүлэгч (толь + тийн ялгал + таамаг), хуруугаар бичих дасгал.
   Үсгийн хэлбэрийг фонт (Noto Sans Mongolian) өөрөө сонгоно; ZWJ (U+200D)-ээр байрлалыг нь хүчээр үзүүлнэ. */
(function(){
  var FONT="'Noto Sans Mongolian','Mongolian Baiti','Menk Qagan Tig',serif",ZWJ="‍";
  /* [бичиг, кирилл, латин галиг, тайлбар] — сургуулийн «а, э, и, о, у, ө, ү, н, б…» дараалал */
  var VOW=[["ᠠ","а","a","Эр эгшиг"],["ᠡ","э","e","Эм эгшиг"],["ᠢ","и","i","Саармаг эгшиг"],["ᠣ","о","o","Эр эгшиг; «у»-тай ижил хэлбэртэй"],["ᠤ","у","u","Эр эгшиг; «о»-той ижил хэлбэртэй"],["ᠥ","ө","ö","Эм эгшиг; эхний үед «о»-оос сүүлтэй"],["ᠦ","ү","ü","Эм эгшиг; «ө»-тэй ижил хэлбэртэй"]];
  var CON=[["ᠨ","н","n","Эгшгийн өмнө цэгтэй"],["ᠩ","нг","ng","Үгийн эхэнд хэзээ ч ирэхгүй"],["ᠪ","б","b","Монгол үгийн «в» ч ихэвчлэн ᠪ"],["ᠫ","п","p","Харь үгэнд"],["ᠬ","х","q/k","Эр эгшгийн өмнө хоёр цэгтэй"],["ᠭ","г","ɣ/g","Эр эгшгийн өмнө цэггүй"],["ᠮ","м","m",""],["ᠯ","л","l",""],["ᠰ","с","s",""],["ᠱ","ш","š","«с» дээр цэг нэмнэ"],["ᠲ","т","t",""],["ᠳ","д","d","Үгийн эхэнд «т»-тэй адил"],["ᠴ","ч","č","Монгол үгийн «ц» ч мөн ᠴ"],["ᠵ","ж","ǰ","Монгол үгийн «з» ч мөн ᠵ"],["ᠶ","й","y","я, е, ё, ю-ийн эхний хэсэг"],["ᠷ","р","r","Үгийн эхэнд бараг ирэхгүй"],["ᠸ","в","w","Харь үгэнд"],["ᠹ","ф","f","Харь үгэнд"],["ᠺ","к","k","Харь үгэнд"],["ᠼ","ц","c","Харь үгэнд"],["ᠽ","з","z","Харь үгэнд"],["ᠾ","һ","h","Харь үгэнд"]];
  /* [бичиг, кирилл, утга/тайлбар] */
  var WORDS=[
    ["ᠮᠣᠩᠭᠣᠯ","монгол","mongɣol"],["ᠰᠠᠯᠬᠢ","салхи","salki — манай апп!"],["ᠡᠬᠡ","ээж","eke"],["ᠠᠪᠤ","аав","abu"],
    ["ᠡᠮᠡᠭᠡ","эмээ","emege"],["ᠡᠪᠦᠭᠡ","өвөө","ebüge"],["ᠳᠡᠭᠦᠦ","дүү","degüü"],["ᠬᠡᠦᠬᠡᠳ","хүүхэд","keüked"],
    ["ᠬᠦᠮᠦᠨ","хүн","kümün"],["ᠨᠠᠢᠵᠤ","найз","naiǰu"],["ᠭᠡᠷ","гэр","ger"],["ᠬᠣᠲᠠ","хот","qota"],
    ["ᠠᠭᠤᠯᠠ","уул","aɣula"],["ᠤᠰᠤ","ус","usu"],["ᠭᠠᠯ","гал","ɣal"],["ᠨᠠᠷᠠ","нар","nara"],
    ["ᠲᠩᠷᠢ","тэнгэр","tngri"],["ᠮᠣᠳᠣ","мод","modu"],["ᠴᠡᠴᠡᠭ","цэцэг","čečeg"],["ᠮᠣᠷᠢ","морь","mori"],
    ["ᠬᠣᠨᠢ","хонь","qoni"],["ᠦᠬᠡᠷ","үхэр","üker"],["ᠲᠡᠮᠡᠭᠡ","тэмээ","temege"],["ᠨᠣᠬᠠᠢ","нохой","noqai"],
    ["ᠰᠦᠨ","сүү","sün"],["ᠴᠠᠢ","цай","čai"],["ᠮᠢᠬᠠ","мах","miqa"],["ᠨᠣᠮ","ном","nom"],
    ["ᠪᠢᠴᠢᠭ","бичиг","bičig"],["ᠬᠡᠯᠡ","хэл","kele"],["ᠡᠷᠳᠡᠮ","эрдэм","erdem"],["ᠤᠬᠠᠭᠠᠨ","ухаан","uqaɣan"],
    ["ᠰᠤᠷᠭᠠᠭᠤᠯᠢ","сургууль","surɣaɣuli"],["ᠡᠳᠦᠷ","өдөр","edür"],["ᠰᠦᠨᠢ","шөнө","söni"],["ᠵᠢᠯ","жил","ǰil"],
    ["ᠨᠢᠭᠡ","нэг","nige"],["ᠬᠣᠶᠠᠷ","хоёр","qoyar"],["ᠭᠤᠷᠪᠠ","гурав","ɣurba"],["ᠳᠦᠷᠪᠡ","дөрөв","dörbe"],["ᠲᠠᠪᠤ","тав","tabu"],
    ["ᠰᠠᠢᠬᠠᠨ","сайхан","saiqan"],["ᠠᠮᠤᠷ","амар","amur"],["ᠪᠠᠶᠠᠷ","баяр","bayar"],["ᠮᠥᠩᠬᠡ","мөнх","möngke"],
    ["ᠬᠠᠭᠠᠨ","хаан","qaɣan"],["ᠴᠢᠩᠭᠢᠰ","Чингис","čingɣis"],["ᠤᠯᠠᠭᠠᠨᠪᠠᠭᠠᠲᠤᠷ","Улаанбаатар","ulaɣanbaɣatur"],
    ["ᠡᠬᠡ ᠣᠷᠣᠨ","эх орон","eke oron"],["ᠰᠠᠢᠨ ᠪᠠᠢᠨ᠎ᠠ ᠤᠤ","сайн байна уу","sain baina uu"]
  ];
  var LETTERS=VOW.concat(CON);
  /* Үгийн утга сурч буй хэлээр: en|ja|ko|zh|ru|de */
  var MEAN={},ML=["en","ja","ko","zh","ru","de"];
  ("монгол=Mongolian|モンゴル|몽골|蒙古|монгольский|mongolisch\nсалхи=wind|風|바람|风|ветер|Wind\nээж=mother|母|어머니|妈妈|мама|Mutter\nаав=father|父|아버지|爸爸|папа|Vater\n"+
   "эмээ=grandmother|祖母|할머니|奶奶|бабушка|Großmutter\nөвөө=grandfather|祖父|할아버지|爷爷|дедушка|Großvater\nдүү=younger sibling|弟・妹|동생|弟弟/妹妹|младший брат, сестра|jüngeres Geschwister\n"+
   "хүүхэд=child|子ども|아이|孩子|ребёнок|Kind\nхүн=person|人|사람|人|человек|Mensch\nнайз=friend|友だち|친구|朋友|друг|Freund\nгэр=home, ger|家・ゲル|집, 게르|家，蒙古包|дом, юрта|Zuhause, Jurte\n"+
   "хот=city|都市|도시|城市|город|Stadt\nуул=mountain|山|산|山|гора|Berg\nус=water|水|물|水|вода|Wasser\nгал=fire|火|불|火|огонь|Feuer\nнар=sun|太陽|해|太阳|солнце|Sonne\n"+
   "тэнгэр=sky|空|하늘|天空|небо|Himmel\nмод=tree|木|나무|树|дерево|Baum\nцэцэг=flower|花|꽃|花|цветок|Blume\nморь=horse|馬|말|马|лошадь|Pferd\nхонь=sheep|羊|양|绵羊|овца|Schaf\n"+
   "үхэр=cow|牛|소|牛|корова|Rind\nтэмээ=camel|ラクダ|낙타|骆驼|верблюд|Kamel\nнохой=dog|犬|개|狗|собака|Hund\nсүү=milk|牛乳|우유|牛奶|молоко|Milch\nцай=tea|お茶|차|茶|чай|Tee\n"+
   "мах=meat|肉|고기|肉|мясо|Fleisch\nном=book|本|책|书|книга|Buch\nбичиг=script, writing|文字|글, 문자|文字|письменность|Schrift\nхэл=language|言語|언어|语言|язык|Sprache\n"+
   "эрдэм=knowledge|学問|학문|学问|знание|Wissen\nухаан=mind, wisdom|知恵|지혜|智慧|ум|Verstand\nсургууль=school|学校|학교|学校|школа|Schule\nөдөр=day|日|날|白天|день|Tag\nшөнө=night|夜|밤|夜晚|ночь|Nacht\n"+
   "жил=year|年|해|年|год|Jahr\nнэг=one|一|하나|一|один|eins\nхоёр=two|二|둘|二|два|zwei\nгурав=three|三|셋|三|три|drei\nдөрөв=four|四|넷|四|четыре|vier\nтав=five|五|다섯|五|пять|fünf\n"+
   "сайхан=beautiful|きれいな|아름다운|美好|прекрасный|schön\nамар=peaceful, easy|穏やかな|평안한|安宁|спокойный|ruhig\nбаяр=joy, holiday|喜び・祝日|기쁨, 명절|喜悦，节日|радость, праздник|Freude, Fest\n"+
   "мөнх=eternal|永遠の|영원한|永恒|вечный|ewig\nхаан=king, khan|王・ハーン|왕, 칸|可汗|хан|Khan\nчингис=Chinggis (Genghis)|チンギス|칭기즈|成吉思|Чингис|Dschingis\nулаанбаатар=Ulaanbaatar|ウランバートル|울란바토르|乌兰巴托|Улан-Батор|Ulaanbaatar\n"+
   "эх орон=homeland|祖国|조국|祖国|родина|Heimat\nсайн байна уу=hello|こんにちは|안녕하세요|你好|здравствуйте|hallo").split("\n").forEach(function(r){r=r.split("=");MEAN[r[0]]=r[1].split("|");});
  function meaning(cyr,lang){var m=MEAN[String(cyr).toLowerCase()],i=ML.indexOf(lang);return m&&i>=0?m[i]:"";}
  /* Кирилл → бичиг, үсэгчлэн (ойролцоо): урт эгшгийг нэг болгоно, «нг»→ᠩᠭ, в/з/ц-г монгол хэлбэрээр */
  var MAP={"а":"ᠠ","э":"ᠡ","и":"ᠢ","ы":"ᠢ","о":"ᠣ","у":"ᠤ","ө":"ᠥ","ү":"ᠦ","й":"ᠢ","ь":"ᠢ","ъ":"","н":"ᠨ","б":"ᠪ","п":"ᠫ","х":"ᠬ","г":"ᠭ","м":"ᠮ","л":"ᠯ","с":"ᠰ","ш":"ᠱ","щ":"ᠱ","т":"ᠲ","д":"ᠳ","ч":"ᠴ","ж":"ᠵ","р":"ᠷ","в":"ᠪ","ф":"ᠹ","к":"ᠺ","ц":"ᠴ","з":"ᠵ","һ":"ᠾ","я":"ᠶᠠ","е":"ᠶᠡ","ё":"ᠶᠣ","ю":"ᠶᠤ"};
  var VS="аэиыоуөү";
  /* Толь: кирилл=бичиг. Эндээс олдсон үгийг зөв бичгээр, олдоогүйг дүрмээр таамаглана. */
  var DICT={};
  ("би=ᠪᠢ|чи=ᠴᠢ|та=ᠲᠠ|бид=ᠪᠢᠳᠡ|тэр=ᠲᠡᠷᠡ|энэ=ᠡᠨᠡ|тэд=ᠲᠡᠳᠡ|юу=ᠶᠠᠭᠤ|хэн=ᠬᠡᠨ|бол=ᠪᠣᠯ|байна=ᠪᠠᠢᠨ᠎ᠠ|биш=ᠪᠢᠰᠢ|үгүй=ᠦᠭᠡᠢ|тийм=ᠲᠡᠢᠮᠦ|ба=ᠪᠠ|болон=ᠪᠣᠯᠤᠨ|"+
   "миний=ᠮᠢᠨᠦ|чиний=ᠴᠢᠨᠦ|уу=ᠤᠤ|үү=ᠦᠦ|их=ᠶᠡᠬᠡ|бага=ᠪᠠᠭ᠎ᠠ|сайн=ᠰᠠᠢᠨ|муу=ᠮᠠᠭᠤ|шинэ=ᠰᠢᠨ᠎ᠡ|хуучин=ᠬᠠᠭᠤᠴᠢᠨ|том=ᠲᠣᠮᠤ|жижиг=ᠵᠢᠵᠢᠭ|олон=ᠣᠯᠠᠨ|нэр=ᠨᠡᠷ᠎ᠡ|үг=ᠦᠭᠡ|"+
   "хэлэх=ᠬᠡᠯᠡᠬᠦ|явах=ᠶᠠᠪᠤᠬᠤ|ирэх=ᠢᠷᠡᠬᠦ|идэх=ᠢᠳᠡᠬᠦ|уух=ᠤᠤᠬᠤ|унших=ᠤᠩᠰᠢᠬᠤ|бичих=ᠪᠢᠴᠢᠬᠦ|сурах=ᠰᠤᠷᠬᠤ|мэдэх=ᠮᠡᠳᠡᠬᠦ|үзэх=ᠦᠵᠡᠬᠦ|харах=ᠬᠠᠷᠠᠬᠤ|сонсох=ᠰᠣᠨᠣᠰᠬᠤ|хийх=ᠬᠢᠬᠦ|өгөх=ᠥᠭᠬᠦ|авах=ᠠᠪᠬᠤ|"+
   "баярлалаа=ᠪᠠᠶᠠᠷᠯᠠᠯ᠎ᠠ|уучлаарай=ᠠᠭᠤᠴᠢᠯᠠᠷᠠᠢ|ах=ᠠᠬ᠎ᠠ|эгч=ᠡᠭᠡᠴᠢ|хүү=ᠬᠦᠦ|охин=ᠣᠬᠢᠨ|эхнэр=ᠡᠬᠡᠨᠡᠷ|нөхөр=ᠨᠥᠬᠦᠷ|багш=ᠪᠠᠭᠰᠢ|эмч=ᠡᠮᠴᠢ|ард=ᠠᠷᠠᠳ|улс=ᠤᠯᠤᠰ|нутаг=ᠨᠤᠲᠤᠭ|газар=ᠭᠠᠵᠠᠷ|тал=ᠲᠠᠯ᠎ᠠ|"+
   "гол=ᠭᠣᠣᠯ|нуур=ᠨᠠᠭᠤᠷ|далай=ᠳᠠᠯᠠᠢ|ой=ᠣᠢ|хад=ᠬᠠᠳᠠ|чулуу=ᠴᠢᠯᠠᠭᠤ|цас=ᠴᠠᠰᠤ|бороо=ᠪᠣᠷᠤᠭ᠎ᠠ|од=ᠣᠳᠤ|сар=ᠰᠠᠷ᠎ᠠ|орой=ᠣᠷᠣᠢ|маргааш=ᠮᠠᠷᠭᠠᠰᠢ|цаг=ᠴᠠᠭ|хавар=ᠬᠠᠪᠤᠷ|зун=ᠵᠤᠨ|намар=ᠨᠠᠮᠤᠷ|өвөл=ᠡᠪᠦᠯ|"+
   "улаан=ᠤᠯᠠᠭᠠᠨ|цагаан=ᠴᠠᠭᠠᠨ|хар=ᠬᠠᠷ᠎ᠠ|хөх=ᠬᠥᠬᠡ|ногоон=ᠨᠣᠭᠣᠭᠠᠨ|шар=ᠰᠢᠷ᠎ᠠ|алт=ᠠᠯᠲᠠ|мөнгө=ᠮᠥᠩᠭᠦ|айраг=ᠠᠢᠷᠠᠭ|хоол=ᠬᠣᠭᠣᠯᠠ|бууз=ᠪᠤᠤᠵᠠ|гурил=ᠭᠤᠷᠢᠯ|давс=ᠳᠠᠪᠤᠰᠤ|тос=ᠲᠣᠰᠤ|"+
   "ямаа=ᠶᠠᠮᠠᠭ᠎ᠠ|адуу=ᠠᠳᠠᠭᠤ|мал=ᠮᠠᠯ|шувуу=ᠰᠢᠪᠠᠭᠤ|загас=ᠵᠢᠭᠠᠰᠤ|чоно=ᠴᠢᠨ᠎ᠠ|толгой=ᠲᠣᠯᠣᠭᠠᠢ|гар=ᠭᠠᠷ|хөл=ᠬᠥᠯ|нүд=ᠨᠢᠳᠦ|чих=ᠴᠢᠬᠢ|ам=ᠠᠮ|шүд=ᠰᠢᠳᠦ|зүрх=ᠵᠢᠷᠦᠬᠡ|"+
   "зургаа=ᠵᠢᠷᠭᠤᠭ᠎ᠠ|долоо=ᠳᠣᠯᠣᠭ᠎ᠠ|найм=ᠨᠠᠢᠮᠠ|ес=ᠶᠢᠰᠦ|арав=ᠠᠷᠪᠠ|зуу=ᠵᠠᠭᠤ|мянга=ᠮᠢᠩᠭ᠎ᠠ|дуу=ᠳᠠᠭᠤ|бөх=ᠪᠥᠬᠡ|наадам=ᠨᠠᠭᠠᠳᠤᠮ|баатар=ᠪᠠᠭᠠᠲᠤᠷ|ажил=ᠠᠵᠢᠯ|эрүүл=ᠡᠷᠡᠭᠦᠯ|сэтгэл=ᠰᠡᠳᠬᠢᠯ|"+
   "хүсэл=ᠬᠦᠰᠡᠯ|зам=ᠵᠠᠮ|хуур=ᠬᠤᠭᠤᠷ|морин=ᠮᠣᠷᠢᠨ|дэлхий=ᠳᠡᠯᠡᠬᠡᠢ|хүмүүс=ᠬᠦᠮᠦᠰ|хайр=ᠬᠠᠢᠷ᠎ᠠ|амьдрал=ᠠᠮᠢᠳᠤᠷᠠᠯ|эрдэнэ=ᠡᠷᠳᠡᠨᠢ|бат=ᠪᠠᠲᠤ|болд=ᠪᠣᠯᠤᠳ|гэрэл=ᠭᠡᠷᠡᠯ|оюун=ᠣᠶᠤᠨ|"+
   "сувд=ᠰᠤᠪᠤᠳ|тэмүүлэн=ᠲᠡᠮᠦᠭᠦᠯᠡᠨ|ариун=ᠠᠷᠢᠭᠤᠨ|энх=ᠡᠩᠬᠡ|туяа=ᠲᠤᠶᠠ|хүрэл=ᠬᠦᠷᠡᠯ|төмөр=ᠲᠡᠮᠦᠷ|хулан=ᠬᠤᠯᠠᠨ|дорж=ᠳᠣᠷᠵᠢ|ган=ᠭᠠᠩ|хангай=ᠬᠠᠩᠭᠠᠢ|говь=ᠭᠣᠪᠢ").split("|").forEach(function(p){p=p.split("=");DICT[p[0]]=p[1];});
  WORDS.forEach(function(w){DICT[w[1].toLowerCase()]=w[0];});
  var RDICT={};Object.keys(DICT).forEach(function(k){if(!RDICT[DICT[k]])RDICT[DICT[k]]=k;});
  var NNBSP=" ",MVS="᠎";
  /* Үсэгчлэн таамаг: урт эгшиг аа→aɣa, ээ→ege, оо→oɣo (уугуул үгэнд ихэвчлэн ингэж бичдэг) */
  function guess(w){
    var o="",prev="";
    for(var i=0;i<w.length;i++){
      var c=w[i],nx=w[i+1]||"";
      if(!(c in MAP)){o+=c;prev="";continue;}
      if(VS.indexOf(c)>=0&&c===prev){if(c==="а")o+="ᠭᠠ";else if(c==="э")o+="ᠭᠡ";else if(c==="о")o+="ᠭᠣ";else if(c==="у")o+="ᠤ";else if(c==="ү")o+="ᠦ";prev="";continue;}
      if(c==="и"&&nx==="й"){o+="ᠢ";i++;prev="и";continue;}    /* ий→и */
      if(c==="й"&&VS.indexOf(prev)<0){o+="ᠶ";prev=c;continue;}
      if(c==="ь"&&VS.indexOf(nx)>=0){prev=c;continue;}         /* зөөлний тэмдэг эгшгийн өмнө */
      if(c==="н"&&nx==="г"){o+="ᠩ";prev=c;continue;}
      if(c==="е"&&VS.indexOf(prev)<0&&prev){o+="ᠡ";prev=c;continue;}
      o+=MAP[c];prev=c;
    }
    return o;
  }
  /* Тийн ялгалын нөхцөл: монгол бичигт үгээс тусад нь (NNBSP-ээр) залгана */
  var SUF=[["гийн","gen"],["ийн","gen"],["ын","gen"],["ний","gen"],["ны","gen"],["н","gen"],["ийг","acc"],["ыг","acc"],["г","acc"],
    ["гаас","abl"],["гээс","abl"],["гоос","abl"],["гөөс","abl"],["аас","abl"],["ээс","abl"],["оос","abl"],["өөс","abl"],["тай","com"],["тэй","com"],["той","com"],
    ["гаар","ins"],["гээр","ins"],["гоор","ins"],["гөөр","ins"],["аар","ins"],["ээр","ins"],["оор","ins"],["өөр","ins"],
    ["руу","to"],["рүү","to"],["луу","to"],["лүү","to"],["ад","dat"],["эд","dat"],["од","dat"],["өд","dat"],["д","dat"],["т","dat"]];
  function front(s){return /[ᠡᠥᠦ]/.test(s);}
  function vEnd(s){return /[ᠠᠡᠢᠣᠤᠥᠦ]$/.test(s);}
  function sufMn(t,s){
    var f=front(s),v=vEnd(s);
    if(t==="gen")return v?"ᠶᠢᠨ":/ᠨ$/.test(s)?(f?"ᠦ":"ᠤ"):(f?"ᠦᠨ":"ᠤᠨ");
    if(t==="acc")return v?"ᠶᠢ":"ᠢ";
    if(t==="dat")return v||/[ᠨᠮᠯᠩ]$/.test(s)?(f?"ᠳᠦ":"ᠳᠤ"):(f?"ᠲᠦ":"ᠲᠤ");
    if(t==="abl")return f?"ᠡᠴᠡ":"ᠠᠴᠠ";
    if(t==="com")return f?"ᠲᠡᠢ":"ᠲᠠᠢ";
    if(t==="ins")return v?(f?"ᠪᠡᠷ":"ᠪᠠᠷ"):(f?"ᠢᠶᠡᠷ":"ᠢᠶᠠᠷ");
    if(t==="to")return f?"ᠷᠦᠭᠦ":"ᠷᠤᠭᠤ";
    return "";
  }
  function stemOf(w){
    if(DICT[w])return [w,null];
    for(var i=0;i<SUF.length;i++){
      var sf=SUF[i][0];if(w.length<=sf.length+1||w.slice(-sf.length)!==sf)continue;
      var r=w.slice(0,-sf.length),c=[r,r+"ь",r.replace(/и$/,"ь"),r.replace(/ий$/,"ь"),r+r.slice(-1)];
      for(var j=0;j<c.length;j++)if(DICT[c[j]])return [c[j],SUF[i][1]];
    }
    return null;
  }
  /* Кирилл → бичиг: [{c:кирилл, s:бичиг, ok:тольд байсан эсэх}] */
  function toMn(txt){
    var low=String(txt).toLowerCase().replace(/\s+/g," ").trim(),out=[];if(!low)return out;
    var ws=low.split(" ");
    for(var i=0;i<ws.length;i++){
      var m=ws[i].match(/^(.*?)([.,!?;:»«"]*)$/),w=m[1],p=m[2].replace(/\./g,"᠃").replace(/,/g,"᠂");
      var two=ws[i+1]&&(w+" "+ws[i+1]).replace(/[.,!?]+$/,"");
      if(two&&DICT[two]){out.push({c:ws[i]+" "+ws[i+1],s:DICT[two],ok:1});i++;continue;}
      var st=stemOf(w);
      if(st){var s=DICT[st[0]];out.push({c:ws[i],s:st[1]?s+NNBSP+sufMn(st[1],s)+p:s+p,ok:1});}
      else out.push({c:ws[i],s:guess(w)+p,ok:0});
    }
    return out;
  }
  /* Бичиг → латин галиг (яг) ба кирилл (толь эсвэл ойролцоо) */
  var LAT={"ᠠ":"a","ᠡ":"e","ᠢ":"i","ᠣ":"o","ᠤ":"u","ᠥ":"ö","ᠦ":"ü","ᠧ":"ē","ᠨ":"n","ᠩ":"ng","ᠪ":"b","ᠫ":"p","ᠬ":"q","ᠭ":"ɣ","ᠮ":"m","ᠯ":"l","ᠰ":"s","ᠱ":"š","ᠲ":"t","ᠳ":"d","ᠴ":"č","ᠵ":"ǰ","ᠶ":"y","ᠷ":"r","ᠸ":"w","ᠹ":"f","ᠺ":"k","ᠼ":"c","ᠽ":"z","ᠾ":"h","᠃":".","᠂":",","᠎":"-"," ":"-"};
  function lat(s){var f=front(s);return Array.from(s).map(function(c){var l=LAT[c];if(l==null)return /[᠋-᠍‌‍]/.test(c)?"":c;if(f&&c==="ᠬ")return "k";if(f&&c==="ᠭ")return "g";return l;}).join("");}
  function cyrGuess(s){
    var f=front(s),l=lat(s.replace(/[᠎ ]/g,"")).replace(/ŋ/g,"ng");
    l=l.replace(/aɣa/g,"аа").replace(/oɣo/g,"оо").replace(/[ae]ɣu|uɣu/g,"уу").replace(/ege/g,"ээ").replace(/üge/g,"өө").replace(/eü|üü/g,"үү").replace(/ai/g,"ай").replace(/ei/g,"эй").replace(/oi/g,"ой").replace(/ui/g,"уй").replace(/üi/g,"үй");
    l=l.replace(/([^aeiouöüаэоуүөй])[aeuü]$/,"$1").replace(/([^aeiouöüаэоуүөй])i$/,"$1ь");
    l=l.replace(/([aeiouöüаэоуүө])b/g,"$1в").replace(/b$/,"в");
    var M={a:"а",e:f?"э":"э",i:"и",o:"о",u:"у","ö":"ө","ü":"ү",n:"н",b:"б",p:"п",q:"х",k:"х","ɣ":"г",g:"г",m:"м",l:"л",s:"с","š":"ш",t:"т",d:"д","č":"ч","ǰ":"ж",y:"й",r:"р",w:"в",f:"ф",c:"ц",z:"з",h:"һ","ē":"э","-":""};
    return l.replace(/ya/g,"я").replace(/ye/g,"е").replace(/yo/g,"ё").replace(/yu/g,"ю").split("").map(function(c){return M[c]!=null?M[c]:c;}).join("");
  }
  var SUFC=[[/^(ᠶᠢᠨ|ᠤᠨ|ᠦᠨ|ᠤ|ᠦ)$/,"ын","ийн"],[/^(ᠶᠢ|ᠢ)$/,"ыг","ийг"],[/^(ᠳᠤ|ᠳᠦ)$/,"д","д"],[/^(ᠲᠤ|ᠲᠦ)$/,"т","т"],[/^(ᠠᠴᠠ|ᠡᠴᠡ)$/,"аас","ээс"],[/^(ᠲᠠᠢ|ᠲᠡᠢ)$/,"тай","тэй"],[/^(ᠪᠠᠷ|ᠪᠡᠷ|ᠢᠶᠠᠷ|ᠢᠶᠡᠷ)$/,"аар","ээр"],[/^(ᠷᠤᠭᠤ|ᠷᠦᠭᠦ)$/,"руу","рүү"]];
  /* [{s:бичиг, l:латин, c:кирилл, ok}] */
  function fromMn(txt){
    /* NNBSP-г \s гэж тасдахгүй; энгийн зайгаар салгасан нөхцөлийг өмнөх үгэнд нь наана */
    var toks=[];
    String(txt).replace(/[‍]/g,"").split(/[^\S ]+/).filter(Boolean).forEach(function(t){
      var bare=t.replace(/[᠃᠂.,!?]+$/,"");
      if(toks.length&&toks[toks.length-1].indexOf(NNBSP)<0&&SUFC.some(function(x){return x[0].test(bare);}))toks[toks.length-1]+=NNBSP+t;else toks.push(t);
    });
    return toks.map(function(tok){
      var m=tok.match(/^(.*?)([᠃᠂.,!?]*)$/),w=m[1],p=m[2].replace(/᠃/g,".").replace(/᠂/g,","),parts=w.split(NNBSP),st=parts[0],sf=parts[1]||"";
      var c=RDICT[st],ok=!!c;if(!c)c=cyrGuess(st);
      if(sf){var hit=SUFC.filter(function(x){return x[0].test(sf);})[0];c+=hit?(front(st)?hit[2]:hit[1]):"-"+cyrGuess(sf);}
      return {s:tok,l:lat(w)+p,c:c+p,ok:ok};
    });
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
  /* о/у, ө/ү ганцаараа ижил харагддаг тул нэг асуултад хамт гаргахгүй */
  var TWIN={"о":"у","у":"о","ө":"ү","ү":"ө"};
  function pick(a,n,not){return shuffle(a.filter(function(x){return x!==not&&x[1]!==TWIN[not[1]];})).slice(0,n);}
  var fontOk=false;
  function loadFont(){
    if(fontOk)return;fontOk=true;
    var l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian&display=swap";document.head.appendChild(l);
  }
  function mn(txt,size,extra){return h("span",{lang:"mn-Mong",style:"font-family:"+FONT+";writing-mode:vertical-lr;text-orientation:sideways;font-size:"+(size||32)+"px;line-height:1.3;display:inline-block;"+(extra||"")},txt);}

  var env=null,h=null,S={tab:"les",sel:null,q:null,conv:"",li:null,lq:null};
  function tabs(root){
    var T=[["les","🎓 Хичээл"],["abc","🔤 Үсэг"],["word","📖 Үг"],["quiz","✅ Тест"],["conv","🔄 Хөрвүүлэх"],["draw","✍️ Бичих"]];
    root.append(h("div",{class:"row",style:"flex-wrap:wrap;gap:6px;margin:8px 0 12px"},T.map(function(t){
      return h("button",{class:"btn"+(S.tab===t[0]?" primary":""),onclick:function(){S.tab=t[0];S.sel=null;if(t[0]==="quiz")S.q=null;if(t[0]==="les"){S.li=null;S.lq=null;}env.render();}},t[1]);})));
  }
  function forms(ch){return [["Ганцаар",ch],["Эхэнд",ch+ZWJ],["Дунд",ZWJ+ch+ZWJ],["Сүүлд",ZWJ+ch]];}
  function viewAbc(root){
    root.append(h("p",{class:"muted small"},"Монгол бичгийг дээрээс доош, зүүнээс баруун тийш бичнэ. Үсэг бүр үгийн эхэнд, дунд, сүүлд өөр хэлбэртэй. Үсэг дээр дарж хэлбэрүүдийг нь үзээрэй."));
    if(S.sel){
      var L=S.sel;
      root.append(h("div",{class:"note",style:"margin-bottom:12px"},
        h("div",{style:"display:flex;align-items:center;gap:12px"},mn(L[0],56),h("div",null,h("div",{style:"font-size:22px;font-weight:700"},L[1]+" · "+L[2]),L[3]?h("div",{class:"muted small"},L[3]):null)),
        h("div",{style:"display:flex;gap:10px;justify-content:space-around;margin-top:10px;text-align:center"},forms(L[0]).map(function(f){
          return h("div",null,mn(f[1],44,"min-height:64px"),h("div",{class:"muted small"},f[0]));}))));
    }
    [["Эгшиг (7)",VOW],["Гийгүүлэгч",CON]].forEach(function(g){
      root.append(h("h3",{style:"margin:12px 0 6px;font-size:16px"},g[0]));
      root.append(h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px"},g[1].map(function(L){
        return h("button",{class:"opt"+(S.sel===L?" ok":""),style:"display:flex;flex-direction:column;align-items:center;padding:8px 4px;margin:0",onclick:function(){S.sel=L;env.render();window.scrollTo(0,0);}},
          mn(L[0],30,"min-height:40px"),h("b",null,L[1]));})));
    });
  }
  function viewWords(root){
    root.append(h("p",{class:"muted small"},"Монгол бичгийн үг кирилл бичгээс өөрөөр бичигддэг: «ус» → usu, «уул» → aɣula. Дарахад галиг, дуудлагыг нь гаргана."));
    var lg=env.lang();
    root.append(h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px"},WORDS.map(function(w){
      var open=S.sel===w,tr=meaning(w[1],lg);
      return h("button",{class:"opt"+(open?" ok":""),style:"display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;margin:0",onclick:function(){S.sel=open?null:w;env.render();if(!open&&tr)env.speak(tr);}},
        mn(w[0],28,"min-height:90px;max-height:200px"),h("b",null,w[1]),tr?h("span",{class:"small",style:"color:var(--accent,#2563eb)"},tr):null,open?h("span",{class:"muted small"},w[2]):null);})));
  }
  function newQuiz(){
    var qs=[],ls=shuffle(LETTERS).slice(0,4),ws=shuffle(WORDS).slice(0,6);
    ls.forEach(function(L){qs.push({s:L[0],a:L[1],o:shuffle([L[1]].concat(pick(LETTERS,3,L).map(function(x){return x[1];})))});});
    ws.forEach(function(w,i){
      if(i%2)qs.push({c:w[1],a:w[0],o:shuffle([w[0]].concat(pick(WORDS,3,w).map(function(x){return x[0];}))),mn:1});
      else qs.push({s:w[0],a:w[1],o:shuffle([w[1]].concat(pick(WORDS,3,w).map(function(x){return x[1];})))});
    });
    return {qs:shuffle(qs),i:0,ok:0,p:null};
  }

  /* Дараалсан хичээл: үсгээ бүлгээр нь сурч, 6 асуулттай тестэд 5+ авбал дараагийнх нээгдэж цол ахина */
  var LES=[{t:"Эгшиг 1: а, э, и",L:"ᠠᠡᠢ"},{t:"Эгшиг 2: о, у, ө, ү",L:"ᠣᠤᠥᠦ"},{t:"н, б, х, г",L:"ᠨᠪᠬᠭ"},{t:"м, л, с, ш",L:"ᠮᠯᠰᠱ"},
    {t:"т, д, ч, ж",L:"ᠲᠳᠴᠵ"},{t:"й, р, нг",L:"ᠶᠷᠩ"},{t:"Харь үгийн үсэг: п, в, ф, к, ц, з, һ",L:"ᠫᠸᠹᠺᠼᠽᠾ"},{t:"Нөхцөл залгах (-ын, -ыг, -д…)",suf:1}];
  var RANKS=[[0,"🌱 Шинэ сурагч"],[1,"👀 Бичиг танигч"],[3,"✒️ Бичээч"],[5,"📜 Түшмэл"],[7,"🦉 Бичгийн мэргэн"],[8,"🏆 Их бичээч"]];
  function lesSt(){var o=env.sget("mnscript",{})||{};o.les=o.les||{};return o;}
  function passedN(o){return LES.filter(function(_,i){return (o.les[i]||0)>=5;}).length;}
  function rankOf(n){var r=RANKS[0];RANKS.forEach(function(x){if(n>=x[0])r=x;});return r;}
  function nextRank(n){return RANKS.filter(function(x){return x[0]>n;})[0]||null;}
  function letterRow(ch){return LETTERS.filter(function(L){return L[0]===ch;})[0];}
  function known(i){var k="";for(var j=0;j<=i&&j<LES.length;j++)k+=LES[j].L||"";return k;}
  function lesWords(i){
    var k=known(i),cur=LES[i].L||"";
    return Object.keys(DICT).filter(function(c){var w=DICT[c];return c.indexOf(" ")<0&&Array.from(w).every(function(ch){return k.indexOf(ch)>=0;})&&Array.from(cur).some(function(ch){return w.indexOf(ch)>=0;});}).map(function(c){return [DICT[c],c];});
  }
  var SUFEX=["монголын","ээжийн","морийг","гэрт","хотод","уулаас","найзтай","гараар","улсын","номыг"];
  function sufQ(){
    return shuffle(SUFEX).slice(0,6).map(function(c){
      var r=toMn(c)[0],st=stemOf(c),base=DICT[st[0]];
      var wrong=shuffle(["gen","acc","dat","abl","com","ins"].filter(function(t){return t!==st[1];})).slice(0,3).map(function(t){return base+NNBSP+sufMn(t,base);});
      return {c:c,a:r.s,o:shuffle([r.s].concat(wrong)),mn:1};
    });
  }
  function letterQ(L,pool){return {s:L[0],a:L[1],o:shuffle([L[1]].concat(pick(pool,3,L).map(function(x){return x[1];})))};}
  function lesQuiz(i){
    if(LES[i].suf)return {qs:sufQ(),i:0,ok:0,p:null};
    var k=known(i),pool=LETTERS.filter(function(L){return k.indexOf(L[0])>=0;}),qs=[];
    Array.from(LES[i].L).forEach(function(ch){qs.push(letterQ(letterRow(ch),pool));});
    var ws=lesWords(i);
    if(ws.length>=4)shuffle(ws).slice(0,3).forEach(function(w){qs.push({s:w[0],a:w[1],o:shuffle([w[1]].concat(shuffle(ws.filter(function(x){return x!==w;})).slice(0,3).map(function(x){return x[1];})))});});
    var rest=shuffle(pool.filter(function(L){return !qs.some(function(q){return q.s===L[0];});}));
    while(qs.length<6)qs.push(letterQ(rest.length?rest.pop():pool[Math.floor(Math.random()*pool.length)],pool));
    return {qs:shuffle(qs).slice(0,6),i:0,ok:0,p:null};
  }
  function rankCard(n){
    var r=rankOf(n),nx=nextRank(n);
    return h("div",{class:"note",style:"margin:4px 0 12px"},h("b",null,"🏅 Цол: "+r[1]),
      h("div",{style:"height:6px;border-radius:3px;background:var(--line,#e5e7eb);margin:8px 0 4px;overflow:hidden"},h("div",{style:"height:100%;width:"+Math.round(n/LES.length*100)+"%;background:var(--accent,#2563eb)"})),
      h("div",{class:"muted small"},n+" / "+LES.length+" хичээл"+(nx?" · дараагийн цол "+nx[1]+" хүртэл "+(nx[0]-n)+" хичээл":" · Бүх хичээлээ давлаа!")));
  }
  function viewLes(root){
    var o=lesSt(),n=passedN(o);
    if(S.li==null){
      root.append(rankCard(n));
      LES.forEach(function(L,i){
        var sc=o.les[i],pass=(sc||0)>=5,open=i===0||(o.les[i-1]||0)>=5;
        root.append(h("button",{class:"lrow",type:"button",disabled:!open,style:open?"":"opacity:.5",onclick:function(){S.li=i;S.lq=null;env.render();window.scrollTo(0,0);}},
          h("span",{class:"hexb ico"},pass?"✅":open?String(i+1):"🔒"),
          h("span",{style:"flex:1;text-align:left"},h("div",{class:"t"},(i+1)+". "+L.t),h("div",{class:"muted small"},sc!=null?"Хамгийн сайн: "+sc+" / 6":open?"6 асуулт · 5+ авбал давна":"Өмнөх хичээлээ дав")),h("span",{"aria-hidden":"true"},"›")));
      });
      return;
    }
    var i=S.li,L=LES[i];
    root.append(h("button",{class:"back",onclick:function(){S.li=null;S.lq=null;env.render();}},"‹ Хичээлүүд"));
    root.append(h("h3",{style:"margin:6px 0"},(i+1)+". "+L.t));
    if(!S.lq){
      if(L.suf){
        root.append(h("p",null,"Монгол бичигт тийн ялгалын нөхцлийг үгнээс тусад нь, нарийн зайгаар (NNBSP) залгаж бичдэг. Эр үгэнд эр эгшигтэй (u, a), эм үгэнд эм эгшигтэй (ü, e) хувилбарыг нь залгана. Эгшгээр төгссөн үгэнд өөр хувилбар бий."));
        [["Харьяалах (-ын)","ᠤᠨ ᠦᠨ ᠶᠢᠨ"],["Заах (-ыг)","ᠢ ᠶᠢ"],["Өгөх оршихын (-д)","ᠳᠤ ᠳᠦ ᠲᠤ ᠲᠦ"],["Гарахын (-аас)","ᠠᠴᠠ ᠡᠴᠡ"],["Хамтрахын (-тай)","ᠲᠠᠢ ᠲᠡᠢ"],["Үйлдэхийн (-аар)","ᠪᠠᠷ ᠪᠡᠷ ᠢᠶᠠᠷ ᠢᠶᠡᠷ"]].forEach(function(r){
          root.append(h("div",{style:"display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line,#e5e7eb)"},h("span",{style:"flex:1"},r[0]),h("span",{style:"display:flex;gap:12px;align-items:flex-start"},r[1].split(" ").map(function(x){return mn(x,24);}))));});
        root.append(h("p",{class:"muted small",style:"margin-top:10px"},"Жишээ"));
        root.append(h("div",{style:"display:flex;flex-wrap:wrap;gap:12px"},SUFEX.slice(0,6).map(function(c){return h("div",{style:"text-align:center"},mn(toMn(c)[0].s,26,"min-height:90px"),h("div",{class:"small"},c));})));
      }else{
        Array.from(L.L).forEach(function(ch){var R=letterRow(ch);
          root.append(h("div",{class:"note",style:"margin-bottom:8px"},h("div",{style:"display:flex;align-items:center;gap:10px"},mn(R[0],40),h("div",null,h("b",{style:"font-size:18px"},R[1]+" · "+R[2]),R[3]?h("div",{class:"muted small"},R[3]):null)),
            h("div",{style:"display:flex;justify-content:space-around;text-align:center;margin-top:6px"},forms(R[0]).map(function(f){return h("div",null,mn(f[1],32,"min-height:48px"),h("div",{class:"muted small"},f[0]));}))));});
        var ws=lesWords(i).slice(0,8);
        if(ws.length){root.append(h("p",{class:"muted small"},"Эдгээр үсгээр бичих үгс"));
          root.append(h("div",{style:"display:flex;flex-wrap:wrap;gap:12px"},ws.map(function(w){return h("div",{style:"text-align:center"},mn(w[0],26,"min-height:80px"),h("div",{class:"small"},w[1]));})));}
      }
      root.append(h("button",{class:"btn primary",style:"margin-top:14px",onclick:function(){S.lq=lesQuiz(i);env.render();window.scrollTo(0,0);}},"Тест өгөх (6)"));
      return;
    }
    var Q=S.lq;
    if(Q.i>=Q.qs.length){
      if(!Q.saved){
        Q.saved=1;var before=passedN(o);o.les[i]=Math.max(o.les[i]||0,Q.ok);env.sset("mnscript",o);env.addXP(Q.ok*3);
        Q.rank=rankOf(passedN(o));Q.up=rankOf(before)!==Q.rank;if(Q.up||Q.ok===Q.qs.length)env.celebrate();
      }
      root.append(h("h2",null,Q.ok+" / "+Q.qs.length),h("p",null,Q.ok>=5?"Давлаа! 🎉":"5-аас дээш оноо авбал давна. Дахиад оролдоорой."),h("p",{class:"muted"},"+"+(Q.ok*3)+" XP"));
      if(Q.up)root.append(h("div",{class:"note",style:"text-align:center;font-size:18px;font-weight:700"},"🏅 Шинэ цол: "+Q.rank[1]));
      root.append(h("div",{class:"row",style:"margin-top:10px"},h("button",{class:"btn",onclick:function(){S.lq=null;env.render();}},"Дахин унших"),
        Q.ok>=5&&i+1<LES.length?h("button",{class:"btn primary",onclick:function(){S.li=i+1;S.lq=null;env.render();window.scrollTo(0,0);}},"Дараагийн хичээл ›"):h("button",{class:"btn primary",onclick:function(){S.li=null;S.lq=null;env.render();}},"Жагсаалт")));
      return;
    }
    quizStep(root,Q);
  }
  function viewQuiz(root){
    if(!S.q)S.q=newQuiz();
    var Q=S.q;
    if(Q.i>=Q.qs.length){
      var best=Math.max((env.sget("mnscript",{})||{}).best||0,Q.ok);
      if(!Q.saved){Q.saved=1;var st0=env.sget("mnscript",{})||{};st0.best=best;env.sset("mnscript",st0);env.addXP(Q.ok*2);if(Q.ok===Q.qs.length)env.celebrate();}
      root.append(h("h2",null,Q.ok+" / "+Q.qs.length),h("p",{class:"muted"},"+"+(Q.ok*2)+" XP · Хамгийн сайн: "+best),
        h("button",{class:"btn primary",onclick:function(){S.q=null;env.render();}},"Дахин"));
      return;
    }
    quizStep(root,Q);
  }
  function quizStep(root,Q){
    var q=Q.qs[Q.i];
    root.append(h("p",{class:"muted small"},(Q.i+1)+" / "+Q.qs.length+(q.mn?" · Монгол бичгээр нь сонго":" · Кириллээр юу вэ?")));
    root.append(h("div",{style:"text-align:center;margin:10px 0"},q.mn?h("div",{style:"font-size:26px;font-weight:700"},q.c):mn(q.s,48,"min-height:80px")));
    root.append(h("div",{style:q.mn?"display:grid;grid-template-columns:repeat(4,1fr);gap:6px":""},q.o.map(function(o){
      var cls="opt";if(Q.p!=null){if(o===q.a)cls+=" ok";else if(o===Q.p)cls+=" bad";}
      return h("button",{class:cls,disabled:Q.p!=null,style:q.mn?"display:flex;justify-content:center;margin:0":"",onclick:function(){Q.p=o;if(o===q.a)Q.ok++;env.render();}},q.mn?mn(o,26,"min-height:90px"):o);})));
    if(Q.p!=null)root.append(h("div",{class:"fb "+(Q.p===q.a?"ok":"bad")},Q.p===q.a?"Зөв!":(q.mn?"Зөв хариултыг ногооноор харууллаа":"Зөв хариулт: "+q.a)),
      h("button",{class:"btn primary",style:"margin-top:8px",onclick:function(){Q.i++;Q.p=null;env.render();}},"Дараах ›"));
  }
  function viewConv(root){
    var rev=S.dir==="rev";
    root.append(h("div",{class:"row",style:"gap:6px;margin-bottom:8px"},
      h("button",{class:"btn"+(rev?"":" primary"),onclick:function(){S.dir="fwd";env.render();}},"Кирилл → Монгол бичиг"),
      h("button",{class:"btn"+(rev?" primary":""),onclick:function(){S.dir="rev";env.render();}},"Монгол бичиг → Кирилл")));
    var leg=h("p",{class:"muted small",style:"margin:6px 0 0"},"✓ тольд байгаа (зөв бичиг) · ≈ дүрмээр таамагласан, зөрж болно");
    if(!rev){
      root.append(h("p",{class:"muted small"},"Үг, өгүүлбэрээ кириллээр бич. ~200 үгийн тольтой, тийн ялгалын нөхцөлийг (-ын, -ыг, -д, -аас, -тай, -аар, -руу) монгол бичгийн дүрмээр тусад нь залгана."));
      var out=h("div"),cur=[];
      var draw=function(){
        cur=toMn(S.conv);out.textContent="";if(!cur.length)return;
        out.append(h("div",{style:"min-height:140px;display:flex;justify-content:center;padding:12px;border:1px solid var(--line,#ddd);border-radius:12px;margin-top:8px;overflow-x:auto"},mn(cur.map(function(x){return x.s;}).join(" "),36,"max-height:340px")),
          h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"},cur.map(function(x){
            return h("span",{class:"small",style:"padding:3px 8px;border-radius:8px;border:1px "+(x.ok?"solid #16a34a":"dashed #d97706")},(x.ok?"✓ ":"≈ ")+x.c);})),leg);
      };
      var inp=h("textarea",{rows:2,placeholder:"Жишээ: Монголын сайхан нутаг",style:"width:100%;font-size:18px;padding:10px;box-sizing:border-box;resize:vertical",oninput:function(){S.conv=inp.value;draw();}});
      inp.value=S.conv;root.append(inp,out);draw();
      root.append(h("button",{class:"btn",style:"margin-top:8px",onclick:function(){var t=cur.map(function(x){return x.s;}).join(" ");if(navigator.clipboard&&t)navigator.clipboard.writeText(t);}},"📋 Монгол бичгийг хуулах"));
      return;
    }
    root.append(h("p",{class:"muted small"},"Монгол бичгийн текстээ буулгах (paste) эсвэл доорх товчлуураар бич. Латин галиг нь яг, кирилл нь толь/дүрмээр гарна."));
    var out2=h("div"),ta=h("textarea",{rows:2,lang:"mn-Mong",placeholder:"ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ",style:"width:100%;height:180px;font-size:24px;padding:10px;box-sizing:border-box;resize:none;writing-mode:vertical-lr;font-family:"+FONT,oninput:function(){S.rconv=ta.value;draw2();}});
    var draw2=function(){
      var r=fromMn(S.rconv||"");out2.textContent="";if(!r.length)return;
      out2.append(h("div",{class:"note",style:"margin-top:8px"},
        h("div",{style:"font-size:20px;font-weight:700"},r.map(function(x){return x.c;}).join(" ")),
        h("div",{class:"muted small",style:"margin-top:4px"},"Галиг: "+r.map(function(x){return x.l;}).join(" "))),
        h("div",{style:"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"},r.map(function(x){
          return h("span",{style:"display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;border:1px "+(x.ok?"solid #16a34a":"dashed #d97706")},mn(x.s,18),h("span",{class:"small"},(x.ok?"✓ ":"≈ ")+x.c));})),leg);
    };
    ta.value=S.rconv||"";root.append(ta);
    var key=function(t,v){return h("button",{class:"btn",style:"flex:none;min-width:38px;padding:4px 6px",onclick:function(){
      if(v==="⌫")ta.value=Array.from(ta.value).slice(0,-1).join("");else ta.value+=v;S.rconv=ta.value;draw2();}},t);};
    root.append(h("div",{style:"display:flex;flex-wrap:wrap;gap:4px;margin-top:6px"},
      LETTERS.map(function(L){return key(h("span",null,mn(L[0],18,"max-height:28px"),h("span",{class:"small"}," "+L[1])),L[0]);}),
      key("Зай"," "),key("-нөхцөл",NNBSP),key("салангид -а",MVS+"ᠠ"),key("⌫","⌫")));
    root.append(out2);draw2();
  }
  function viewDraw(root){
    if(!S.sel)S.sel=LETTERS[0];
    root.append(h("p",{class:"muted small"},"Бүдэг үсгийг хуруугаараа дагаж зур. Монгол бичигт эхлээд «нуруу» (босоо зураас)-ыг дээрээс доош татна."));
    root.append(h("div",{style:"display:flex;gap:4px;overflow-x:auto;padding-bottom:6px"},LETTERS.map(function(L){
      return h("button",{class:"btn"+(S.sel===L?" primary":""),style:"flex:none;padding:4px 8px",onclick:function(){S.sel=L;env.render();}},L[1]);})));
    var W=260,H=300,cv=h("canvas",{width:W*2,height:H*2,style:"width:"+W+"px;height:"+H+"px;touch-action:none;border:1px solid var(--line,#ddd);border-radius:12px;background:#fff;display:block;margin:8px auto"});
    var x=cv.getContext("2d");
    function bg(){
      x.clearRect(0,0,W*2,H*2);x.save();x.fillStyle="rgba(37,99,235,.15)";x.font="360px "+FONT;x.textAlign="center";x.textBaseline="middle";
      x.translate(W,H);x.rotate(Math.PI/2);x.fillText(S.sel[0],0,0);x.restore();
      x.strokeStyle="rgba(0,0,0,.12)";x.setLineDash([8,8]);x.beginPath();x.moveTo(W,0);x.lineTo(W,H*2);x.stroke();x.setLineDash([]);
    }
    bg();if(document.fonts&&document.fonts.load)document.fonts.load("360px 'Noto Sans Mongolian'",S.sel[0]).then(bg,function(){});
    var down=false;
    function pt(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)*2,(e.clientY-r.top)*2];}
    cv.addEventListener("pointerdown",function(e){down=true;cv.setPointerCapture(e.pointerId);var p=pt(e);x.strokeStyle="#111";x.lineWidth=18;x.lineCap="round";x.lineJoin="round";x.beginPath();x.moveTo(p[0],p[1]);});
    cv.addEventListener("pointermove",function(e){if(!down)return;var p=pt(e);x.lineTo(p[0],p[1]);x.stroke();});
    cv.addEventListener("pointerup",function(){down=false;});
    root.append(h("div",{style:"text-align:center"},h("b",{style:"font-size:20px"},S.sel[1]+" · "+S.sel[2])),cv,
      h("div",{class:"row",style:"justify-content:center"},h("button",{class:"btn",onclick:bg},"🧽 Арилгах")));
  }
  window.MnScript={
    view:function(e){
      env=e;h=e.h;loadFont();var root=h("div");
      root.append(h("button",{class:"back",onclick:function(){S.sel=null;env.close();}},"‹ Дүрэм"));
      root.append(h("h2",{style:"display:flex;align-items:center;gap:10px"},mn("ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ",22,"max-height:120px"),"Монгол бичиг"));
      tabs(root);
      ({les:viewLes,abc:viewAbc,word:viewWords,quiz:viewQuiz,conv:viewConv,draw:viewDraw})[S.tab](root);
      return root;
    }
  };
})();
