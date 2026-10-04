/* Салхи: 🇲🇳 Монгол баяр, ёс заншлаа гадаад хүнд тайлбарлах — Цагаан сар, Наадам, гэрт зочлох.
   Сэдэв бүрт: хэллэгүүд (хэллэг|галиг|монгол утга), гадаад найздаа хэлэх богино тайлбар, шалгах асуулт.
   Баярын үеэр (Цагаан сар ≈ 1–2-р сар, Наадам 7-р сар) нүүр хуудсанд санал болгоно. */
(function(){
  var T={
    ts:{i:"🌙",t:"Цагаан сар",when:[0,1],mn:"Сар шинийн баяр: битүүн, золгох ёс, бууз, ул боов, хадаг."},
    nd:{i:"🏹",t:"Наадам",when:[6],mn:"Эрийн гурван наадам: бөх, морь, сур харваа. 7-р сарын 11–15."},
    ger:{i:"🛖",t:"Гэрт зочлох",when:[],mn:"Монгол гэрт зочлох ёс: босгон дээр гишгэхгүй, баруун гараар авах, цай, айраг."}
  };
  var D={
en:{
ts:{p:`Happy Lunar New Year!||Сар шинэдээ сайхан шинэлээрэй!
We greet our elders by supporting their arms.||Бид ахмадууд руугаа гараа сунган золгодог.
This is a steamed dumpling called buuz.||Үүнийг бууз гэдэг.
We stay up on the eve, called Bituun.||Битүүний орой бид оройтож унтдаг.
Please take it with your right hand.||Баруун гараараа аваарай.
Have you rested well this year?||Сайхан шинэлж байна уу?`,ex:"Tsagaan Sar is the Mongolian Lunar New Year. The evening before, called Bituun, families eat a big dinner. On the first day, younger people greet their elders by holding their arms, and everyone eats buuz.|Цагаан сар бол монголчуудын сар шинийн баяр. Өмнөх орой нь буюу битүүнд гэр бүлүүд том зоог барьдаг. Шинийн нэгэнд залуучууд ахмадуудтайгаа гарнаас нь түшин золгож, бүгд бууз иддэг.",q:["What is the evening before Tsagaan Sar called?","Bituun","Naadam","Buuz"]},
nd:{p:`Naadam is our biggest summer festival.||Наадам бол манай хамгийн том зуны баяр.
The three manly games are wrestling, horse racing and archery.||Эрийн гурван наадам бол бөх, морь, сур харваа.
The jockeys are young children.||Морь унаачид нь бага насны хүүхдүүд.
Let's go and watch the wrestling.||Бөх үзэхээр явцгаая.
Would you like to try khuushuur?||Хуушуур амсаж үзэх үү?
The winner of the wrestling is called the Lion.||Бөхийн аваргыг арслан гэдэг.`,ex:"Naadam takes place every July. There are three main sports: wrestling, horse racing and archery. Children ride the horses in races of up to 30 kilometres, and people eat khuushuur, a fried meat pastry.|Наадам жил бүрийн 7-р сард болдог. Гурван гол төрөл бий: бөх, морь, сур харваа. Хүүхдүүд 30 хүртэл км уралдаанд морь унадаг, хүмүүс хуушуур иддэг.",q:["Who rides the horses in the Naadam race?","Children","Wrestlers","Archers"]},
ger:{p:`Please come in and sit down.||Ороод сууна уу.
Please don't step on the threshold.||Босгон дээр бүү гишгээрэй.
Have some milk tea.||Сүүтэй цай уугаарай.
Take it with your right hand, or with both hands.||Баруун гараараа эсвэл хоёр гараараа аваарай.
This is airag, fermented mare's milk.||Энэ бол айраг, гүүний исгэлэн сүү.
Hold the dogs!||Нохой хорио!`,ex:"When you visit a Mongolian ger, shout \"Hold the dogs!\" before you go near. Go in without stepping on the threshold and move to the left. Accept tea with your right hand or both hands, and at least taste what you are given.|Монгол гэрт зочлохдоо ойртохоосоо өмнө «Нохой хорио!» гэж дуудна. Босгон дээр гишгэлгүй орж, зүүн тийш явна. Цайг баруун эсвэл хоёр гараараа авч, өгсөн зүйлээс заавал амсана.",q:["Which hand should you use to take tea?","The right hand","The left hand","It doesn't matter"]}},
ja:{
ts:{p:`旧正月おめでとうございます。|きゅうしょうがつ おめでとうございます|Сар шинэдээ сайхан шинэлээрэй.
モンゴルの旧正月はツァガーンサルです。|もんごるの きゅうしょうがつは つぁがーんさるです|Монголын сар шинэ бол Цагаан сар.
お年寄りの腕を支えて挨拶します。|おとしよりの うでを ささえて あいさつします|Ахмад хүний гарыг түшин золгодог.
これはボーズという蒸し餃子です。|これは ぼーずという むしぎょうざです|Энэ бол бууз гэдэг жигнэсэн банш.
右手で受け取ってください。|みぎてで うけとって ください|Баруун гараараа аваарай.`,ex:"ツァガーンサルはモンゴルの旧正月です。前の晩をビトゥーンと言い、家族で食事をします。元日には若い人がお年寄りの腕を支えて挨拶し、みんなでボーズを食べます。|Цагаан сар бол монголын сар шинэ. Өмнөх оройг битүүн гэх бөгөөд гэр бүлээрээ хоол иддэг. Шинийн нэгэнд залуус ахмадын гарыг түшин золгож, бүгд бууз иддэг.",q:["ツァガーンサルの前の晩は何と言いますか。","ビトゥーン","ナーダム","ボーズ"]},
nd:{p:`ナーダムは夏の一番大きいお祭りです。|なーだむは なつの いちばん おおきい おまつりです|Наадам бол зуны хамгийн том баяр.
相撲、競馬、弓を競います。|すもう、けいば、ゆみを きそいます|Бөх, морь, сур харваагаар өрсөлддөг.
子どもが馬に乗ります。|こどもが うまに のります|Хүүхдүүд морь унадаг.
一緒に相撲を見に行きましょう。|いっしょに すもうを みに いきましょう|Хамт бөх үзэхээр явцгаая.
ホーショールを食べてみませんか。|ほーしょーるを たべて みませんか|Хуушуур идэж үзэх үү?`,ex:"ナーダムは毎年七月に行われます。モンゴル相撲、競馬、弓の三つの競技があります。競馬では子どもが馬に乗り、みんなでホーショールを食べます。|Наадам жил бүр 7-р сард болдог. Монгол бөх, морины уралдаан, сур харваа гэсэн гурван төрөл бий. Морины уралдаанд хүүхдүүд унаж, бүгд хуушуур иддэг.",q:["ナーダムの競馬ではだれが馬に乗りますか。","子ども","大人の力士","弓の選手"]},
ger:{p:`どうぞ、入って座ってください。|どうぞ、はいって すわって ください|Ороод сууна уу.
敷居を踏まないでください。|しきいを ふまないで ください|Босгон дээр бүү гишгээрэй.
ミルクティーをどうぞ。|みるくてぃーを どうぞ|Сүүтэй цай уугаарай.
右手か両手で受け取ってください。|みぎてか りょうてで うけとって ください|Баруун эсвэл хоёр гараараа аваарай.
これは馬乳酒のアイラグです。|これは ばにゅうしゅの あいらぐです|Энэ бол гүүний сүүн айраг.`,ex:"モンゴルのゲルを訪ねるときは、近づく前に「犬をつかまえて！」と声をかけます。敷居を踏まずに入り、お茶は右手か両手で受け取ります。|Монгол гэрт зочлохдоо ойртохоосоо өмнө «Нохой хорио!» гэж дуудна. Босгон дээр гишгэлгүй орж, цайг баруун эсвэл хоёр гараараа авна.",q:["ゲルに入るとき、何を踏んではいけませんか。","敷居","じゅうたん","いす"]}},
ko:{
ts:{p:`설날 잘 보내세요!|seollal jal bonaeseyo|Сар шинэдээ сайхан шинэлээрэй!
몽골의 설날은 차강사르예요.|monggorui seollareun chagangsareuyeyo|Монголын сар шинэ бол Цагаан сар.
어른의 팔을 받쳐서 인사해요.|eoreunui pareul batchyeoseo insahaeyo|Ахмадын гарыг түшин золгодог.
이것은 보즈라는 찐만두예요.|igeoseun bojeuraneun jjinmanduyeyo|Энэ бол бууз гэдэг жигнэсэн банш.
오른손으로 받으세요.|oreunsoneuro badeuseyo|Баруун гараараа аваарай.`,ex:"차강사르는 몽골의 설날이에요. 전날 저녁을 비퉁이라고 하고 가족이 함께 식사해요. 설날 아침에는 젊은 사람이 어른의 팔을 받쳐서 인사하고 모두 보즈를 먹어요.|Цагаан сар бол монголын сар шинэ. Өмнөх оройг битүүн гэх бөгөөд гэр бүлээрээ хоол иддэг. Шинийн нэгний өглөө залуус ахмадын гарыг түшин золгож, бүгд бууз иддэг.",q:["차강사르 전날 저녁을 뭐라고 해요?","비퉁","나담","보즈"]},
nd:{p:`나담은 여름의 가장 큰 축제예요.|nadameun yeoreumui gajang keun chukjeyeyo|Наадам бол зуны хамгийн том баяр.
씨름, 경마, 활쏘기를 해요.|ssireum, gyeongma, hwalssogireul haeyo|Бөх, морь, сур харваа болдог.
어린이들이 말을 타요.|eorinideuri mareul tayo|Хүүхдүүд морь унадаг.
같이 씨름 보러 가요.|gachi ssireum boreo gayo|Хамт бөх үзэхээр явъя.
호쇼르 먹어 볼래요?|hosyoreu meogeo bollaeyo|Хуушуур идэж үзэх үү?`,ex:"나담은 매년 7월에 열려요. 몽골 씨름, 경마, 활쏘기 세 가지 경기가 있어요. 경마에서는 어린이들이 말을 타고, 사람들은 호쇼르를 먹어요.|Наадам жил бүр 7-р сард болдог. Монгол бөх, морь, сур харваа гэсэн гурван төрөл бий. Морины уралдаанд хүүхдүүд унаж, хүмүүс хуушуур иддэг.",q:["나담 경마에서 누가 말을 타요?","어린이들","씨름 선수들","궁수들"]},
ger:{p:`어서 들어와서 앉으세요.|eoseo deureowaseo anjeuseyo|Ороод сууна уу.
문지방을 밟지 마세요.|munjibangeul bapji maseyo|Босгон дээр бүү гишгээрэй.
수테차 드세요.|sutecha deuseyo|Сүүтэй цай уугаарай.
오른손이나 두 손으로 받으세요.|oreunsonina du soneuro badeuseyo|Баруун эсвэл хоёр гараараа аваарай.
이것은 마유주 아이락이에요.|igeoseun mayuju airagieyo|Энэ бол гүүний сүүн айраг.`,ex:"몽골 게르를 방문할 때는 가까이 가기 전에 \"개 좀 잡아 주세요!\"라고 외쳐요. 문지방을 밟지 말고 들어가서, 차는 오른손이나 두 손으로 받아요.|Монгол гэрт зочлохдоо ойртохоосоо өмнө «Нохой хорио!» гэж дуудна. Босгон дээр гишгэлгүй орж, цайг баруун эсвэл хоёр гараараа авна.",q:["게르에 들어갈 때 무엇을 밟으면 안 돼요?","문지방","카펫","의자"]}},
zh:{
ts:{p:`新年快乐！|xīnnián kuàilè|Сар шинэдээ сайхан шинэлээрэй!
蒙古的春节叫白月节。|Ménggǔ de chūnjié jiào Báiyuè jié|Монголын сар шинийг Цагаан сар гэдэг.
我们扶着长辈的胳膊拜年。|wǒmen fúzhe zhǎngbèi de gēbo bàinián|Бид ахмадын гарыг түшин золгодог.
这是蒙古包子，叫"布兹"。|zhè shì Ménggǔ bāozi, jiào bùzī|Энэ бол монгол бууз.
请用右手接。|qǐng yòng yòushǒu jiē|Баруун гараараа аваарай.`,ex:"白月节是蒙古的春节。除夕叫\"比图恩\"，全家一起吃饭。初一早上，年轻人扶着长辈的胳膊拜年，大家一起吃布兹。|Цагаан сар бол монголын сар шинэ. Битүүний орой гэр бүлээрээ хоол иддэг. Шинийн нэгний өглөө залуус ахмадын гарыг түшин золгож, бүгд бууз иддэг.",q:["白月节的除夕叫什么？","比图恩","那达慕","布兹"]},
nd:{p:`那达慕是夏天最大的节日。|Nàdámù shì xiàtiān zuì dà de jiérì|Наадам бол зуны хамгийн том баяр.
有摔跤、赛马和射箭。|yǒu shuāijiāo, sàimǎ hé shèjiàn|Бөх, морь, сур харваа бий.
骑马的是小孩子。|qí mǎ de shì xiǎo háizi|Морь унаач нь бага насны хүүхдүүд.
我们一起去看摔跤吧。|wǒmen yìqǐ qù kàn shuāijiāo ba|Хамт бөх үзэхээр явъя.
你想尝尝蒙古馅饼吗？|nǐ xiǎng chángchang Ménggǔ xiànbǐng ma|Хуушуур амсаж үзэх үү?`,ex:"那达慕每年七月举行，有摔跤、赛马和射箭三项比赛。赛马时小孩子骑马，大家还吃蒙古馅饼。|Наадам жил бүр 7-р сард болдог, бөх, морь, сур харваа гэсэн гурван төрөлтэй. Морины уралдаанд хүүхдүүд унаж, бүгд хуушуур иддэг.",q:["那达慕赛马时谁骑马？","小孩子","摔跤手","射箭手"]},
ger:{p:`请进，请坐。|qǐng jìn, qǐng zuò|Ороод сууна уу.
请不要踩门槛。|qǐng búyào cǎi ménkǎn|Босгон дээр бүү гишгээрэй.
请喝奶茶。|qǐng hē nǎichá|Сүүтэй цай уугаарай.
请用右手或者双手接。|qǐng yòng yòushǒu huòzhě shuāngshǒu jiē|Баруун эсвэл хоёр гараараа аваарай.
这是马奶酒。|zhè shì mǎnǎijiǔ|Энэ бол айраг.`,ex:"去蒙古包做客时，走近前要喊\"看住狗！\"。进门不要踩门槛，用右手或双手接茶。|Монгол гэрт зочлохдоо ойртохоосоо өмнө «Нохой хорио!» гэж дуудна. Босгон дээр гишгэлгүй орж, цайг баруун эсвэл хоёр гараараа авна.",q:["进蒙古包时不能踩什么？","门槛","地毯","椅子"]}},
ru:{
ts:{p:`С Новым годом по лунному календарю!||Сар шинэдээ сайхан шинэлээрэй!
Монгольский Новый год называется Цагаан Сар.||Монголын шинэ жилийг Цагаан сар гэдэг.
Мы приветствуем старших, поддерживая их руки.||Бид ахмадуудын гарыг түшин золгодог.
Это бууз — монгольские манты.||Энэ бол бууз — монгол манти.
Возьмите, пожалуйста, правой рукой.||Баруун гараараа аваарай.`,ex:"Цагаан Сар — это монгольский Новый год. Вечер накануне называется Битүүн, вся семья ужинает вместе. Утром молодые приветствуют старших, поддерживая их руки, и все едят бууз.|Цагаан сар бол монголын шинэ жил. Өмнөх оройг битүүн гэх бөгөөд гэр бүлээрээ хамт оройн хоол иддэг. Өглөө нь залуус ахмадын гарыг түшин золгож, бүгд бууз иддэг.",q:["Как называется вечер накануне Цагаан Сара?","Битүүн","Наадам","Бууз"]},
nd:{p:`Наадам — самый большой летний праздник.||Наадам бол зуны хамгийн том баяр.
Это борьба, скачки и стрельба из лука.||Энэ бол бөх, морь, сур харваа.
На лошадях скачут дети.||Морь унадаг нь хүүхдүүд.
Пойдём смотреть борьбу!||Бөх үзэхээр явъя!
Хотите попробовать хуушуур?||Хуушуур амсаж үзэх үү?`,ex:"Наадам проходит каждый год в июле. В нём три вида состязаний: борьба, скачки и стрельба из лука. В скачках участвуют дети, а люди едят хуушуур.|Наадам жил бүр 7-р сард болдог. Бөх, морь, сур харваа гэсэн гурван төрөл бий. Морины уралдаанд хүүхдүүд оролцож, хүмүүс хуушуур иддэг.",q:["Кто скачет на лошадях на Наадаме?","Дети","Борцы","Лучники"]},
ger:{p:`Проходите, садитесь, пожалуйста.||Ороод сууна уу.
Не наступайте на порог, пожалуйста.||Босгон дээр бүү гишгээрэй.
Выпейте чаю с молоком.||Сүүтэй цай уугаарай.
Берите правой рукой или двумя руками.||Баруун эсвэл хоёр гараараа аваарай.
Это айраг — кумыс из кобыльего молока.||Энэ бол айраг — гүүний сүү.`,ex:"Подходя к юрте, крикните «Придержите собак!». Входите, не наступая на порог, и берите чай правой рукой или двумя руками.|Гэрт ойртохдоо «Нохой хорио!» гэж дуудна. Босгон дээр гишгэлгүй орж, цайг баруун эсвэл хоёр гараараа авна.",q:["На что нельзя наступать, входя в юрту?","На порог","На ковёр","На стул"]}},
de:{
ts:{p:`Frohes Mondneujahr!||Сар шинэдээ сайхан шинэлээрэй!
Das mongolische Neujahr heißt Tsagaan Sar.||Монголын шинэ жилийг Цагаан сар гэдэг.
Wir begrüßen die Älteren, indem wir ihre Arme stützen.||Бид ахмадуудын гарыг түшин золгодог.
Das sind Buuz, gedämpfte Teigtaschen.||Энэ бол бууз, жигнэсэн банш.
Bitte nimm es mit der rechten Hand.||Баруун гараараа аваарай.`,ex:"Tsagaan Sar ist das mongolische Mondneujahr. Am Vorabend, Bituun genannt, isst die Familie zusammen. Am Neujahrsmorgen begrüßen die Jüngeren die Älteren, indem sie ihre Arme stützen, und alle essen Buuz.|Цагаан сар бол монголын сар шинэ. Өмнөх оройг битүүн гэх бөгөөд гэр бүлээрээ хоол иддэг. Шинийн өглөө залуус ахмадын гарыг түшин золгож, бүгд бууз иддэг.",q:["Wie heißt der Vorabend von Tsagaan Sar?","Bituun","Naadam","Buuz"]},
nd:{p:`Naadam ist unser größtes Sommerfest.||Наадам бол манай хамгийн том зуны баяр.
Es gibt Ringen, Pferderennen und Bogenschießen.||Бөх, морь, сур харваа бий.
Die Reiter sind Kinder.||Морь унаач нь хүүхдүүд.
Lass uns das Ringen anschauen!||Бөх үзэцгээе!
Möchtest du Khuushuur probieren?||Хуушуур амсаж үзэх үү?`,ex:"Naadam findet jedes Jahr im Juli statt. Es gibt drei Wettkämpfe: Ringen, Pferderennen und Bogenschießen. Beim Rennen reiten Kinder die Pferde, und alle essen Khuushuur.|Наадам жил бүр 7-р сард болдог. Бөх, морь, сур харваа гэсэн гурван төрөл бий. Морины уралдаанд хүүхдүүд унаж, бүгд хуушуур иддэг.",q:["Wer reitet beim Naadam-Pferderennen?","Kinder","Ringer","Bogenschützen"]},
ger:{p:`Komm herein und setz dich bitte.||Ороод сууна уу.
Bitte tritt nicht auf die Schwelle.||Босгон дээр бүү гишгээрэй.
Trink bitte Milchtee.||Сүүтэй цай уугаарай.
Nimm es mit der rechten Hand oder mit beiden Händen.||Баруун эсвэл хоёр гараараа аваарай.
Das ist Airag, gegorene Stutenmilch.||Энэ бол айраг, гүүний исгэлэн сүү.`,ex:"Bevor du dich einer Jurte näherst, ruf \"Haltet die Hunde fest!\". Geh hinein, ohne auf die Schwelle zu treten, und nimm den Tee mit der rechten Hand oder mit beiden Händen.|Гэрт ойртохоосоо өмнө «Нохой хорио!» гэж дуудна. Босгон дээр гишгэлгүй орж, цайг баруун эсвэл хоёр гараараа авна.",q:["Worauf darf man beim Betreten der Jurte nicht treten?","Auf die Schwelle","Auf den Teppich","Auf den Stuhl"]}}
  };
  var env=null,h=null,S={lang:null,t:null,pick:null,opts:null};
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
  function rows(p){return String(p).split("\n").map(function(l){var x=l.split("|");return x.length>=3?[x[0],x[1],x[2]]:[x[0],"",x[x.length-1]];}).filter(function(r){return r[0];});}
  function season(){var m=new Date().getMonth();return Object.keys(T).filter(function(k){return T[k].when.indexOf(m)>=0;})[0]||null;}
  function viewTopic(root,k){
    var d=D[env.lang()][k],t=T[k],ex=d.ex.split("|");
    root.append(h("h3",{style:"margin:6px 0"},t.i+" "+t.t),h("p",{class:"muted small"},t.mn));
    root.append(h("h3",{style:"margin:14px 0 6px;font-size:16px"},"💬 Хэрэгтэй хэллэг"));
    rows(d.p).forEach(function(r){
      root.append(h("div",{class:"srow",style:"align-items:flex-start"},h("span",{style:"flex:1"},h("b",null,r[0]),r[1]?h("div",{class:"muted small"},r[1]):null,h("div",{class:"small"},r[2])),env.speakBtn(r[0])));
    });
    root.append(h("div",{class:"note",style:"margin-top:12px"},h("div",{style:"font-weight:700"},"🗣 Гадаад найздаа ингэж тайлбарлаарай"),
      h("p",{style:"margin:8px 0;line-height:1.5"},ex[0]),env.speakBtn(ex[0]),h("p",{class:"muted small",style:"margin:8px 0 0"},"🇲🇳 "+ex[1])));
    root.append(h("p",{style:"font-weight:700;margin-top:14px"},"✅ "+d.q[0]));
    if(!S.opts)S.opts=shuffle(d.q.slice(1));
    S.opts.forEach(function(o){
      var cls="opt";if(S.pick!=null){if(o===d.q[1])cls+=" ok";else if(o===S.pick)cls+=" bad";}
      root.append(h("button",{class:cls,disabled:S.pick!=null,onclick:function(){
        S.pick=o;if(o===d.q[1]){var dn=env.sget("mnhol",{})||{},key=env.lang()+":"+k;if(!dn[key]){dn[key]=1;env.sset("mnhol",dn);env.addXP(5);}env.celebrate();}env.render();
      }},o));
    });
    if(S.pick!=null)root.append(h("div",{class:"fb "+(S.pick===d.q[1]?"ok":"bad")},S.pick===d.q[1]?"Зөв! +5 XP":"Зөв хариулт: "+d.q[1]));
  }
  window.MnHoliday={
    has:function(lang){return !!D[lang];},
    season:function(){return season();},
    title:function(k){return T[k]?T[k].i+" "+T[k].t:"";},
    view:function(e,open){
      env=e;h=e.h;var root=h("div");
      if(S.lang!==env.lang()){S.lang=env.lang();S.t=null;}
      if(open&&T[open]&&S.t!==open){S.t=open;S.pick=null;S.opts=null;}
      root.append(h("button",{class:"back",onclick:function(){if(S.t){S.t=null;S.pick=null;S.opts=null;env.render();}else env.close();}},S.t?"‹ Сэдвүүд":"‹ Дүрэм"));
      root.append(h("h2",null,"🇲🇳 Монгол ёс заншлаа тайлбарлах"));
      if(S.t){viewTopic(root,S.t);return root;}
      root.append(h("p",{class:"muted"},"Гадаад найз, зочиндоо Монголын баяр, ёс заншлыг "+({en:"англи",ja:"япон",ko:"солонгос",zh:"хятад",ru:"орос",de:"герман"}[env.lang()])+" хэлээр тайлбарлаж сур."));
      var dn=env.sget("mnhol",{})||{},cur=season();
      Object.keys(T).forEach(function(k){
        root.append(h("button",{class:"lrow",type:"button",onclick:function(){S.t=k;S.pick=null;S.opts=null;env.render();window.scrollTo(0,0);}},
          h("span",{class:"hexb ico"},dn[env.lang()+":"+k]?"✅":T[k].i),
          h("span",{style:"flex:1;text-align:left"},h("div",{class:"t"},T[k].t+(cur===k?" · 🎉 яг одоо":"")),h("div",{class:"muted small"},T[k].mn)),h("span",{"aria-hidden":"true"},"›")));
      });
      return root;
    }
  };
})();
