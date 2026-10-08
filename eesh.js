/* Салхи: ЭЕШ-ийн (Элсэлтийн ерөнхий шалгалт) бэлтгэл — англи, орос хэл.
   ЭЕШ-ийн хэлбэрийн A–E хувилбартай асуултууд: дүрэм, үгийн сан, алдаа олох, харилцан яриа, уншиж ойлгох.
   Мөр: хэсэг|асуулт|зөв;буруу;буруу;буруу;буруу|тайлбар  (зөв хариулт эхэндээ, үзүүлэхдээ холино)
   Алдаа олох: e|[хэсэг]-үүдтэй өгүүлбэр|алдаатай хэсгийн дугаар (0-оос)|тайлбар
   Харилцан ярианд "//" нь шинэ мөр. */
(function(){
  var SEC={g:"Дүрэм",v:"Үгийн сан",e:"Алдаа олох",d:"Харилцан яриа",r:"Уншиж ойлгох",
    z:"Зөв бичих дүрэм",u:"Үг зүй",o:"Өгүүлбэр зүй",y:"Утга, найруулга",l:"Уран зохиол"};
  var SECI={g:"✏️",v:"📖",e:"🔍",d:"💬",r:"📰",z:"✍️",u:"🔤",o:"🧩",y:"💭",l:"📜"};
  /* хичээл: "lang" = апп-ын гадаад хэл (en/ru), "mn" = Монгол хэл (апп-ын хэлээс үл хамаарна) */
  var ORDERS={lang:["g","v","e","d","r"],mn:["z","u","o","y","l","e","r"]};
  var MIXES={lang:{g:10,v:6,e:4,d:4,r:2},mn:{z:6,u:6,o:5,y:5,l:5,e:3,r:2}}; /* r: эх бичвэрийн тоо */
  var MIN=45,ABC="ABCDE";
  var NAME={en:"Англи хэл",ru:"Орос хэл",mn:"Монгол хэл"};
  var DATA={
en:`g|If I ___ you, I would apologize.|were;am;will be;have been;be|2-р нөхцөл (одоогийн бодит бус): If + Past Simple, would + V. «to be» бүх биед «were» болно.
g|She has lived in Darkhan ___ 2015.|since;for;from;during;ago|Present Perfect + since + эхэлсэн цэг (он, өдөр). for + үргэлжилсэн хугацаа (5 years).
g|By the time we arrived, the film ___.|had already started;already started;has already started;was already starting;already starts|Өнгөрсөн нэг үйлээс өмнө дууссан үйл → Past Perfect (had + V3).
g|The letter ___ yesterday by my brother.|was written;wrote;is written;has written;was writing|Идэвхгүй хэв, өнгөрсөн цаг: was/were + V3.
g|I'm looking forward to ___ you soon.|seeing;see;saw;have seen;be seeing|look forward to-ийн «to» нь угтвар үг тул араас нь -ing хэлбэр орно.
g|He is ___ honest man.|an;a;the;one;—|«honest»-ийн h дуудагддаггүй, эгшгээр эхэлж байгаа тул an.
g|This is the ___ book I have ever read.|most interesting;more interesting;interestingest;most interested;much interesting|«ever»-тэй хэтэрхий зэрэг: the most + урт тэмдэг нэр.
g|Neither Bat nor his sisters ___ at home now.|are;is;was;be;has|Neither…nor-д үйл үг өөртөө ойр нэр үгтэй тохирно: sisters → are.
g|You ___ smoke here. It's forbidden.|mustn't;don't have to;needn't;might;shouldn't have|Хориглол = mustn't. «don't have to» = шаардлагагүй гэсэн утгатай.
g|I wish I ___ more time to study.|had;have;will have;would have had;am having|wish + Past Simple = одоо биелэхгүй байгаа хүсэл.
g|She asked me where ___.|I lived;did I live;do I live;I live in;lived I|Шууд бус асуулт: асуултын үгийн дараа энгийн дараалал (subject + verb), цаг нэг шат хойш шилжинэ.
g|The man ___ car was stolen called the police.|whose;who;which;whom;that's|Өмчлөлийн холбоос төлөөний үг: whose + нэр үг.
g|We ___ TV when the lights went out.|were watching;watched;are watching;have watched;had watch|Үргэлжилж байсан үйлийг өөр үйл тасалсан: Past Continuous + Past Simple.
g|Look at those dark clouds! It ___ rain.|is going to;goes to;is going;will to;going to|Одоо харагдаж буй нотолгоонд үндэслэсэн таамаг → be going to + V.
g|He's used to ___ up early.|getting;get;got;have got;be getting|be used to + -ing = дассан. «used to + V» = урьд нь хийдэг байсан.
g|I don't know ___ he will come or not.|whether;that;what;which;unless|«or not»-той хамт «…эсэх» утга → whether.
g|There isn't ___ milk left in the fridge.|much;many;a few;few;several|Тоологдохгүй нэр (milk) + үгүйсгэл → much.
g|Hardly ___ the house when it started to rain.|had we left;we had left;we left;did we leave;have we left|Hardly / No sooner / Never-ээр эхэлсэн өгүүлбэрт урвуу дараалал: had + subject + V3.
g|The children enjoyed ___ at the party.|themselves;them;theirs;their;themself|enjoy oneself = зугаацах. they → themselves.
g|If it had not rained, we ___ to the park.|would have gone;would go;will go;went;had gone|3-р нөхцөл: If + had + V3, would have + V3.
g|My bag is ___ than yours.|heavier;more heavy;heaviest;heavyer;the heavier|-y-ээр төгссөн богино тэмдэг нэр: heavy → heavier.
g|She made me ___ the whole report again.|write;to write;writing;written;wrote|make + хүн + V (to-гүй).
g|I have never been to Japan, and ___.|neither has my sister;so has my sister;my sister has too;either has my sister;neither my sister has|Үгүйсгэлтэй санааг дэмжих: neither + туслах үйл үг + subject.
g|The National Museum ___ in 1924.|was founded;founded;has founded;is founding;was found|found (байгуулах) → founded. Идэвхгүй хэв, өнгөрсөн цаг. «found» нь find-ийн V2 тул «was found» = олдсон.
g|You're coming tonight, ___?|aren't you;are you;don't you;won't you;isn't it|Tag question: эерэг өгүүлбэр → сөрөг асуулт, ижил туслах үйл үг (are).
g|He suggested ___ to the cinema.|going;to go;go;goes;gone|suggest + -ing.
g|I'd rather you ___ here.|didn't smoke;don't smoke;not smoke;won't smoke;not to smoke|would rather + өөр хүн + Past Simple.
g|This time next week I ___ on the beach.|will be lying;will lie;am lying;lie;will have lain|Ирээдүйн тодорхой мөчид үргэлжилж байх үйл → Future Continuous.
g|By 2030, they ___ the new airport.|will have finished;will finish;finish;are finishing;have finished|By + ирээдүйн хугацаа → Future Perfect (will have + V3).
g|She is good ___ mathematics.|at;in;on;for;with|good at = …-д сайн.
g|It depends ___ the weather.|on;of;from;in;at|depend on.
g|I've been waiting ___ two hours.|for;since;during;while;from|for + үргэлжилсэн хугацаа.
g|Do you mind ___ the window?|opening;to open;open;opened;to opening|mind + -ing.
g|The more you practise, ___ you become.|the better;better;the best;more better;the more good|The + харьцуулсан зэрэг …, the + харьцуулсан зэрэг.
g|He ___ be at home — his car is outside.|must;can't;mustn't;needn't;shall|Нотолгоонд үндэслэсэн итгэлтэй дүгнэлт → must.
g|She ___ have seen me — she was in Ulaanbaatar then.|can't;must;should;mustn't;need|Өнгөрсөнд боломжгүй байсныг дүгнэх → can't have + V3.
g|I ___ my homework yet.|haven't finished;didn't finish;don't finish;hadn't finished;am not finishing|yet + Present Perfect.
g|The news ___ very surprising.|was;were;are;have been;be|news — тоологдохгүй, ганц тоо.
g|My parents let me ___ late on Saturdays.|stay;to stay;staying;stayed;stays|let + хүн + V (to-гүй).
g|She has two brothers, ___ are doctors.|both of whom;both of them;who both of;both whom;which both|Холбоос өгүүлбэрт угтвар үгийн дараа whom: both of whom.
g|Unless you ___ harder, you will fail.|work;don't work;will work;worked;would work|unless = if not. Үгүйсгэлийг давхардуулахгүй, 1-р нөхцөл: unless + Present Simple.
v|The doctor ___ me some medicine for my cough.|prescribed;described;subscribed;inscribed;transcribed|prescribe = (эмч) эм бичиж өгөх. describe = дүрслэх.
v|Please ___ the form and return it by Friday.|fill in;fill up;fall in;feel in;fill on|fill in a form = маягт бөглөх.
v|We had to ___ the meeting because the manager was ill.|put off;put on;put up;put out;put in|put off = хойшлуулах.
v|She ___ her grandmother — they have the same eyes.|takes after;takes off;takes up;takes over;takes in|take after = (төрөл садангийн) хэн нэгэнтэй адилхан байх.
v|Choose the synonym of "huge".|enormous;tiny;narrow;fragile;ancient|huge = enormous = асар том.
v|Choose the opposite of "generous".|mean;kind;wealthy;polite;brave|generous (өгөөмөр) ↔ mean (харамч).
v|I can't ___ the noise any longer!|stand;stay;carry;hold on;keep|can't stand = тэвчиж чадахгүй.
v|He ___ a mistake in the test.|made;did;took;had;got|make a mistake (do биш).
v|Could you ___ me a favour?|do;make;give;take;have|do someone a favour = хэн нэгэнд туслах.
v|The flight was ___ because of the snowstorm.|cancelled;refused;denied;rejected;deleted|cancel a flight = нислэг цуцлах.
v|A person who writes books is called an ___.|author;editor;actor;owner;audience|author = зохиолч.
v|"Reliable" means ___.|can be trusted;very expensive;easy to break;full of energy;hard to find|reliable = найдвартай.
v|I'm ___ in learning about Mongolian history.|interested;interesting;interest;interestingly;interests|-ed төгсгөлтэй тэмдэг нэр хүний мэдрэмж, -ing төгсгөлтэй нь юмны шинжийг илэрхийлнэ.
v|The ___ of the river is about 1000 km.|length;long;lengthen;longly;lenght|long (тэмдэг нэр) → length (нэр үг).
v|Choose the word that does NOT belong.|carrot;apple;banana;grape;cherry|carrot нь хүнсний ногоо, бусад нь жимс.
v|The opposite of "ancient" is ___.|modern;old;historic;antique;former|ancient (эртний) ↔ modern (орчин үеийн).
v|He ___ his driving test on the first try.|passed;succeeded;won;achieved;managed|pass a test = шалгалт өгч тэнцэх. succeed-д «in» хэрэгтэй.
v|It's too dark. Can you ___ the light?|turn on;turn off;turn down;turn over;turn into|turn on = асаах.
v|She made an important ___.|decision;decisive;decided;deciding;decide|decide (үйл үг) → decision (нэр үг). make a decision.
v|My little brother is afraid ___ dogs.|of;from;with;about;for|afraid of.
v|The bank ___ me money to buy a car.|lent;borrowed;owed;paid;earned|lend = зээлдүүлэх (өгөх), borrow = зээлж авах.
v|She works as a ___ — she looks after patients in a hospital.|nurse;lawyer;pilot;plumber;journalist|nurse = сувилагч.
v|Choose the correct spelling.|necessary;neccessary;necesary;neccesary;nessesary|necessary: нэг c, хоёр s.
v|The concert was so ___ that many people fell asleep.|boring;exciting;amazing;thrilling;bored|Юмны шинж → boring. (bored = уйдсан хүн.)
v|We ___ the bus by two minutes and had to walk.|missed;lost;failed;passed;left|miss the bus = автобусаа хоцрох.
v|"Benefit" is closest in meaning to ___.|advantage;damage;loss;reason;problem|benefit = ашиг тус = advantage.
v|He apologised ___ being late.|for;about;of;to;with|apologise for something.
v|Water ___ at 100 degrees Celsius.|boils;freezes;melts;burns;cooks|boil = буцлах.
e|She [don't] like [coffee], but her [husband] drinks it [every] [morning].|0|She (3-р бие, ганц тоо) → doesn't like.
e|I [have seen] that film [yesterday] [with] my [best] friend.|0|yesterday (тодорхой өнгөрсөн хугацаа) → Past Simple: saw.
e|[There is] many [students] in [our] class [this] [year].|0|many students (олон тоо) → There are.
e|He [is] [more taller] than [his] father [now].|1|Харьцуулсан зэргийг давхардуулахгүй: taller.
e|[If] I [will see] him tomorrow, I [will tell] him [the] news.|1|If-тэй нөхцөлийн хэсэгт will хэрэглэхгүй → If I see him.
e|My sister [enjoys] [to read] books [in] [the] evening.|1|enjoy + -ing → reading.
e|The [informations] you [gave] me [was] very [useful] [today].|0|information нь тоологдохгүй, олон тоо болдоггүй.
e|We [arrived] [to] Ulaanbaatar [late] [at] night.|1|arrive in (хот, улс) / arrive at (байр). «arrive to» гэж хэрэглэдэггүй.
e|[Each] of the boys [have] [his] own [bicycle].|1|Each of + олон тоо → үйл үг ганц тоо: has.
e|She [has been] [living] here [since] [three] years.|2|Үргэлжилсэн хугацаа → for three years.
e|[Although] it was raining, [but] we [went] [for] a walk.|1|although болон but-ийг нэг өгүүлбэрт хамт хэрэглэхгүй.
e|The film was [so] [bored] that I [left] [before] the end.|1|Юмны шинж → boring.
e|[Who's] bag [is] this? [It] [looks] expensive.|0|Өмчлөл → Whose bag. (Who's = who is.)
e|I [look forward to] [hear] [from] you [soon].|1|look forward to + -ing → hearing.
e|He [said] me [that] he [would] be [late].|0|say-д шууд хүн орохгүй: told me эсвэл said to me.
d|A: Would you like some more tea?//B: ___|No, thanks. I've had enough.;Yes, it does.;No, I didn't.;Here you are.;You're welcome.|Санал болгосныг эелдгээр татгалзах хариу.
d|A: Thank you so much for your help!//B: ___|You're welcome.;Yes, please.;Never mind.;Same to you.;Excuse me.|Талархалд «You're welcome» гэж хариулна.
d|A: I'm sorry I'm late.//B: ___|That's all right. Come in.;Yes, you are sorry.;You're welcome.;Congratulations!;Help yourself.|Уучлал гуйхад «That's all right / No problem» гэж хариулна.
d|A: How long does it take to get to the airport?//B: ___|About forty minutes by taxi.;It's ten kilometres.;At eight o'clock.;By taxi, please.;Twice a week.|How long does it take = хэр удаан явах вэ → хугацаагаар хариулна.
d|A: Could you tell me the way to the post office?//B: ___|Go straight and turn left at the corner.;It's open until six.;Yes, I could.;I posted it yesterday.;It costs 500 tugriks.|Зам асуухад чиглэл зааж хариулна.
d|A: What does your father do?//B: ___|He's an engineer.;He's tall and kind.;He's doing well, thanks.;He likes football.;He does it every day.|What does he do? = Ямар ажил хийдэг вэ?
d|A: Shall we go to the cinema tonight?//B: ___|Good idea! What's on?;Yes, I did.;Yes, we shall go yesterday.;No, it isn't.;I'm watching TV yesterday.|Shall we…? = санал. Зөвшөөрөх: Good idea!
d|A: How often do you go swimming?//B: ___|Twice a week.;For two hours.;At the sports centre.;Last Sunday.;With my friends.|How often = хэр олон удаа → давтамжаар хариулна.
d|A: Can I help you?//B: ___|Yes, I'm looking for a winter jacket.;No, you can't.;Yes, help yourself.;I can help you too.;Not at all.|Дэлгүүрт худалдагч «Can I help you?» гэж асуухад хэрэгтэй зүйлээ хэлнэ.
d|A: I've passed my exam!//B: ___|Congratulations! Well done!;Never mind.;Bless you!;What a pity!;Get well soon!|Амжилтад баяр хүргэнэ.
d|A: ___//B: It's 25 degrees and sunny.|What's the weather like today?;What time is it?;What's the temperature of you?;Is it a good day?;How's it going?|Цаг агаарын тухай асуулт: What's the weather like?
d|A: Do you mind if I open the window?//B: ___|No, not at all. Go ahead.;Yes, of course. Go ahead.;You're welcome.;I'm afraid I can't.;It doesn't matter for you.|Do you mind…? = «Танд саад болох уу?» Зөвшөөрвөл «No, not at all» гэнэ. «Yes» гэвэл «саад болно» гэсэн утгатай.
d|A: Have you ever been to Khuvsgul Lake?//B: ___|Yes, I went there last summer.;Yes, I go there tomorrow.;No, I haven't went.;Yes, I have been there next year.;No, I don't.|Have you ever…? → Yes, I have / тодорхой хугацаатай бол Past Simple.`,
ru:`g|Я живу в ___.|Улан-Баторе;Улан-Батор;Улан-Батора;Улан-Батору;Улан-Батором|Хаана? → в + Предложный падеж: в Улан-Баторе.
g|Я иду ___ школу.|в;на;к;из;у|Хаашаа? → в + Винительный: в школу.
g|У меня нет ___.|брата;брат;брату;братом;брате|нет + Родительный падеж: брата.
g|Я пишу письмо ___.|маме;мама;маму;мамой;мамы|Хэнд? (кому?) → Дательный падеж: маме.
g|Он интересуется ___.|музыкой;музыка;музыку;музыке;музыки|интересоваться + Творительный: музыкой.
g|Вчера мы ___ в театр.|ходили;идём;пойдём;ходим;идти|Өнгөрсөнд очоод буцаж ирсэн → ходили.
g|Завтра я ___ к другу.|пойду;ходил;шёл;пошёл;хожу|Ирээдүйд нэг удаа очих → пойду.
g|Каждое утро я ___ зарядку.|делаю;сделаю;сделал;сделать;сделала|Байнга давтагддаг үйл → несовершенный вид: делаю.
g|Я уже ___ эту книгу. Можешь взять её.|прочитал;читаю;читал бы;прочитаю;читать|Дууссан, үр дүнтэй үйл → совершенный вид: прочитал.
g|В классе двадцать пять ___.|студентов;студента;студенты;студентам;студент|5–20, мөн 5–9-өөр төгсгөлтэй тоо + Родительный олон тоо: студентов.
g|Мы купили два ___ хлеба.|батона;батон;батонов;батонам;батоне|2, 3, 4 + Родительный ганц тоо: два батона.
g|___ двадцать лет.|Мне;Я;Меня;Мной;Моя|Нас хэлэхдээ Дательный: Мне двадцать лет.
g|Это книга ___ брата.|моего;мой;моему;моим;мою|Хэний? (чья?) → Родительный: моего брата.
g|Я горжусь ___.|своей страной;своя страна;свою страну;своей стране;своей страны|гордиться + Творительный.
g|Мы встретились около ___.|кинотеатра;кинотеатр;кинотеатру;кинотеатром;кинотеатре|около + Родительный.
g|Студенты ___ экзамен в июне.|сдают;сдаёт;сдаю;сдаёшь;сдаём|Студенты (олон тоо, 3-р бие) → сдают.
g|Если бы у меня было время, я ___ с тобой.|пошёл бы;пойду;иду;пошёл;ходил|Сослагательное наклонение: если бы …, өнгөрсөн цаг + бы.
g|Книга, ___ я читаю, очень интересная.|которую;который;которая;которой;которое|книга (эм хүйс) + читать что? (Винительный) → которую.
g|Мой отец работает ___.|врачом;врач;врача;врачу;о враче|работать кем? → Творительный: врачом.
g|Мы поедем на море ___.|летом;лето;летний;лета;летнем|Хэзээ? (улирал) → летом, зимой, весной, осенью.
g|Я ___ в Москве два года назад.|был;буду;быть;будешь;есть|два года назад → өнгөрсөн цаг: был.
g|Сестра старше ___ на три года.|меня;мне;мной;я;мой|старше + Родительный: меня (= чем я).
g|Эта задача ___ той.|сложнее;сложная;самая сложная;сложно;сложной|Харьцуулсан зэрэг: сложнее.
g|Я не знаю, придёт ___ он сегодня.|ли;бы;же;то;не|Шууд бус асуулт (…эсэх) → ли.
g|Мы долго ___ автобус.|ждали;ждать;ждут;ждёт;ждала|мы + өнгөрсөн цаг → ждали.
g|Нам ___ сделать домашнее задание.|нужно;нужен;нужна;нужны;нужный|Дательный + нужно + инфинитив.
g|Я родился ___ 2008 году.|в;на;с;по;к|в + … году (Предложный).
g|Мы были ___ концерте.|на;в;к;у;по|Арга хэмжээ (концерт, урок, работа) → на + Предложный.
g|Я давно не видел ___.|своих друзей;свои друзья;своим друзьям;своими друзьями;своих друзьях|видеть кого? → Винительный (амьд олон тоо = Родительный хэлбэр): своих друзей.
g|Анна ___ домой в шесть часов.|вернулась;вернулся;вернулось;вернулись;вернуться|Эм хүйс, өнгөрсөн цаг: вернулась.
v|Противоположное слово к «высокий»:|низкий;большой;длинный;широкий;узкий|высокий (өндөр) ↔ низкий (нам).
v|Синоним слова «красивый»:|прекрасный;умный;старый;грустный;быстрый|красивый ≈ прекрасный (сайхан).
v|Я ___ ключи и не могу открыть дверь.|потерял;нашёл;купил;открыл;сделал|потерять = гээх.
v|Мы ___ билеты в кино заранее.|купили;заплатили;потратили;стоили;открыли|купить билеты = тасалбар худалдаж авах.
v|Какое слово лишнее?|стол;яблоко;груша;банан;виноград|стол нь тавилга, бусад нь жимс.
v|Врач, который лечит зубы, — это ___.|стоматолог;окулист;юрист;повар;водитель|стоматолог = шүдний эмч.
v|Моя сестра ___ в университете.|учится;учит;изучает;учиться;учат|учиться (где?) = суралцах. учить = цээжлэх/заах. изучать + юуг.
v|Я ___ русский язык три года.|изучаю;учусь;учится;изучает;учимся|изучать + Винительный: изучаю русский язык.
v|Сегодня очень ___, надень шапку.|холодно;жарко;тепло;душно;солнечно|Малгай өмсөх → хүйтэн: холодно.
v|Он ___ вопрос учителю.|задал;сказал;ответил;рассказал;поставил|задать вопрос = асуулт тавих.
v|Самолёт ___ в 10 часов.|вылетает;выходит;выезжает;выплывает;выносит|Онгоц → вылетать (нисэж гарах).
v|Слово «быстро» противоположно слову ___.|медленно;скоро;громко;легко;рано|быстро (хурдан) ↔ медленно (удаан).
v|Месяц после марта — ___.|апрель;февраль;май;июнь;январь|март → апрель.
v|Где можно купить лекарства?|в аптеке;в библиотеке;в музее;на почте;в театре|аптека = эмийн сан.
v|«Сколько это стоит?» — это вопрос о ___.|цене;времени;погоде;возрасте;адресе|стоить = үнэтэй байх → цена (үнэ).
v|Он хорошо ___ на гитаре.|играет;поёт;рисует;слушает;танцует|играть на + хөгжмийн зэмсэг. играть в + спорт, тоглоом.
v|Поздравляю ___ днём рождения!|с;на;в;к;за|поздравлять с + Творительный.
v|Мы ___ автобус уже двадцать минут.|ждём;видим;едем;садимся;приходим|ждать автобус = автобус хүлээх.
v|Синоним слова «большой»:|огромный;маленький;узкий;тихий;светлый|большой ≈ огромный (асар том).
v|Мой брат — ___: он лечит животных.|ветеринар;учитель;инженер;строитель;продавец|ветеринар = малын эмч.
e|Я [живу] [в] [Москва] [уже] [два года].|2|в + Предложный: в Москве.
e|Вчера [мы] [пойдём] [в] [кино] [вместе].|1|Вчера → өнгөрсөн цаг: ходили / пошли.
e|У [меня] [нет] [время] [на] [отдых].|2|нет + Родительный: времени.
e|Я [интересуюсь] [историю] [и] [литературой] [давно].|1|интересоваться + Творительный: историей.
e|Она [звонила] [своей] [подруга] [вчера] [вечером].|2|звонить кому? → Дательный: подруге.
e|Мой друг [живёт] [в большом] [доме] [около] [река].|4|около + Родительный: около реки.
e|[Пять] [студент] [сдали] [экзамен] [хорошо].|1|пять + Родительный олон тоо: пять студентов.
e|[Мама] [пришёл] [домой] [поздно] [вечером].|1|Мама — эм хүйс: пришла.
e|Я [пишу] [письмо] [ручкой] [моей] [брату].|3|брат — эр хүйс, Дательный: моему (своему) брату.
e|Эта книга [гораздо] [более интереснее], [чем] [та] [книга].|1|Давхар харьцуулалт болохгүй: интереснее эсвэл более интересная.
e|[Каждый] [день] я [хожу] [на] [университет].|3|университет → в университет.
e|Если бы [я] [знал], я [помогу] [тебе] [обязательно].|2|Если бы … → помог бы.
d|— Как тебя зовут?//— ___|Меня зовут Бат.;Мне 17 лет.;Я из Монголии.;У меня всё хорошо.;Я живу в Дархане.|Как тебя зовут? = Чамайг хэн гэдэг вэ?
d|— Спасибо за помощь!//— ___|Не за что.;Извините.;Поздравляю!;Будьте здоровы!;Приятного аппетита!|Талархалд «Не за что / Пожалуйста» гэж хариулна.
d|— Сколько стоит эта книга?//— ___|Пятьсот рублей.;Пять часов.;Пятого мая.;Пять страниц.;Пять лет.|Сколько стоит? = Хэдэн төгрөг вэ? → үнэ.
d|— Который час?//— ___|Половина третьего.;Третьего июня.;Три года.;В третьем классе.;Три раза.|Который час? = Хэдэн цаг болж байна? Половина третьего = 2:30.
d|— Извините, как пройти к метро?//— ___|Идите прямо, потом направо.;Метро очень большое.;Я не люблю метро.;Метро открыли давно.;Спасибо, не надо.|Зам асуухад чиглэл зааж хариулна.
d|— Можно войти?//— ___|Да, конечно, входите.;Нет, спасибо, я сыт.;Можно, я не знаю.;Входите, до свидания.;Да, это мой.|Можно войти? = Орж болох уу?
d|— Что ты будешь делать в субботу?//— ___|Пойду в гости к бабушке.;Я делал уроки.;В субботу была хорошая погода.;Суббота — шестой день.;Я ходил в кино.|Ирээдүйн тухай асуулт → ирээдүй цагаар хариулна.
d|— Я сдал экзамен!//— ___|Поздравляю! Молодец!;Не за что.;Как жаль!;Выздоравливай!;Приятного аппетита!|Амжилтад баяр хүргэнэ: Поздравляю!
d|— Как вы себя чувствуете?//— ___|Спасибо, уже лучше.;Меня зовут Анна.;Я чувствую книгу.;Я из Улан-Батора.;В понедельник.|Биеийн байдлын тухай асуулт.
d|— ___//— Я учусь в 11 классе.|В каком классе ты учишься?;Где ты живёшь?;Сколько тебе лет?;Что ты любишь?;Как тебя зовут?|Хариултаас асуултыг тааварлана: хэддүгээр ангид?`,
mn:`z|«аймаг» гэдэг үгийг харьяалахын тийн ялгалаар зөв бичсэнийг сонго.|аймгийн;аймагийн;аймгын;аймаагийн;аймгиин|Г-ээр төгссөн үгэнд эгшгээр эхэлсэн нөхцөл залгахад сул эгшиг гээгдэнэ: аймаг → аймгийн.
z|«ном» гэдэг үгийг заахын тийн ялгалаар зөв бичсэнийг сонго.|номыг;номийг;номуг;номэг;номиг|Эр үгэнд -ыг (ж, ч, ш, г, ь, и-ээр төгссөнөөс бусад), эм үгэнд -ийг залгана: номыг.
z|«морь» гэдэг үгийг заахын тийн ялгалаар зөв бичсэнийг сонго.|морийг;морьыг;морыг;морьийг;мориыг|Ь-ээр төгссөн үгэнд -ийг залгахад ь гээгдэнэ: морь → морийг.
z|«хүүхэд» гэдэг үгийн олон тоог зөв бичсэнийг сонго.|хүүхдүүд;хүүхэдүүд;хүүхдууд;хүүхэдууд;хүүхэднүүд|Эгшгээр эхэлсэн дагаврын өмнө сул эгшиг гээгдэнэ, эм үг тул -үүд: хүүхдүүд.
z|«Улаанбаатар» гэдэг үгийг өгөх оршихын тийн ялгалаар зөв бичсэнийг сонго.|Улаанбаатарт;Улаанбаатарад;Улаанбаатард;Улаанбаатарта;Улаанбаатарын|В, р, с, г-ээр төгссөн үгэнд -т залгана: Улаанбаатарт.
z|«анги» гэдэг үгийг өгөх оршихын тийн ялгалаар зөв бичсэнийг сонго.|ангид;ангит;ангийд;ангида;ангэд|И-ээр төгссөн үгэнд -д шууд залгана: ангид.
z|«нохой» гэдэг үгийг харьяалахын тийн ялгалаар зөв бичсэнийг сонго.|нохойн;нохойгийн;нохойны;нохойын;нохоины|Й-ээр төгссөн үгэнд -н залгана: нохойн, далайн.
z|«мал» гэдэг үгийг харьяалахын тийн ялгалаар зөв бичсэнийг сонго.|малын;малийн;малны;малгийн;малин|Эр үгэнд -ын, эм үгэнд -ийн залгана: малын.
z|«далай» гэдэг үгийг үйлдэхийн тийн ялгалаар зөв бичсэнийг сонго.|далайгаар;далайаар;далайар;далаайгаар;далайгоор|Урт эгшиг, хос эгшиг, й-ээр төгссөн үгэнд эгшгээр эхэлсэн нөхцөлийн өмнө «г» жийрэглэнэ: далайгаар.
z|«гэр» гэдэг үгийг гарахын тийн ялгалаар зөв бичсэнийг сонго.|гэрээс;гэраас;гэрөөс;гэрээсэ;гэрс|Эм үг тул -ээс: гэрээс.
z|«ой» гэдэг үгийг гарахын тийн ялгалаар зөв бичсэнийг сонго.|ойгоос;ойоос;ойгаас;ойоосоо;оойгоос|Й-ээр төгссөн үгэнд «г» жийрэглэж, о эгшигтэй тул -оос: ойгоос.
z|«ус» гэдэг үгийг үйлдэхийн тийн ялгалаар зөв бичсэнийг сонго.|усаар;усгаар;усоор;усаад;уснаар|Эр үг, гийгүүлэгчээр төгссөн тул -аар: усаар.
z|Аль нь зөв бичигдсэн бэ?|Монгол Улс;монгол улс;Монгол улс;МОНГОЛ улс;монгол Улс|Улсын албан ёсны нэрийн үг бүрийг том үсгээр эхэлж бичнэ: Монгол Улс.
u|Монгол хэлэнд хэдэн тийн ялгал байдаг вэ?|8;6;7;9;10|Нэрлэхийн, харьяалахын, өгөх оршихын, заахын, гарахын, үйлдэхийн, хамтрахын, чиглэхийн — нийт 8.
u|«Би ахаасаа ном авлаа.» өгүүлбэрийн «ахаасаа» ямар тийн ялгалтай вэ?|Гарахын;Өгөх оршихын;Заахын;Хамтрахын;Үйлдэхийн|-аас/-ээс/-оос/-өөс — гарахын тийн ялгал (хэнээс? юунаас?). Араас нь ерөнхий хамаатуулах -аа залгасан.
u|«Бид галт тэргээр явлаа.» өгүүлбэрийн «галт тэргээр» ямар тийн ялгалтай вэ?|Үйлдэхийн;Хамтрахын;Гарахын;Чиглэхийн;Харьяалахын|-аар/-ээр/-оор/-өөр — үйлдэхийн тийн ялгал (юугаар?).
u|«Дүү найзтайгаа кино үзэв.» өгүүлбэрийн «найзтайгаа» ямар тийн ялгалтай вэ?|Хамтрахын;Үйлдэхийн;Өгөх оршихын;Заахын;Нэрлэхийн|-тай/-тэй/-той — хамтрахын тийн ялгал (хэнтэй?).
u|«Тэр сургууль руу явав.» өгүүлбэрийн «сургууль руу» ямар тийн ялгалтай вэ?|Чиглэхийн;Гарахын;Өгөх оршихын;Хамтрахын;Заахын|руу/рүү, луу/лүү — чиглэхийн тийн ялгал (хаашаа?).
u|«уншжээ» үйл үг ямар цагтай вэ?|Өнгөрсөн цаг;Одоо цаг;Ирээдүй цаг;Тушаах хэлбэр;Хүсэх хэлбэр|-жээ/-чээ нь өнгөрсөн цагийн нөхцөл: уншжээ, ирчээ.
u|«бичээч» үгийн «-ээч» нь ямар дагавар вэ?|Үйлээс нэр бүтээх;Нэрээс нэр бүтээх;Нэрээс үйл бүтээх;Үйлээс үйл бүтээх;Тийн ялгалын нөхцөл|бичи- (үйл) + -ээч → бичээч (нэр).
u|«ажиллах» үгийн «-ла-» нь ямар дагавар вэ?|Нэрээс үйл бүтээх;Үйлээс нэр бүтээх;Нэрээс нэр бүтээх;Олон тооны дагавар;Хамаатуулах нөхцөл|ажил (нэр) + -ла- → ажилла- (үйл).
u|Аль нь төлөөний үг вэ?|тэд;тэнгэр;тэвчих;тэгш;тэмээ|тэд — гуравдугаар биеийн олон тооны төлөөний үг.
u|«Хөөх, ямар гоё юм бэ!» өгүүлбэрийн «хөөх» ямар аймгийн үг вэ?|Аялга үг;Сул үг;Дайвар үг;Төлөөний үг;Үйл үг|Сэтгэлийн хөдлөлийг илэрхийлсэн тул аялга үг.
u|Аль нь сул үг вэ?|ч;ном;гоё;гүйх;тав|ч, л, бол, нь мэт бие даасан утгагүй, туслах үүрэгтэй үгсийг сул үг гэнэ.
u|«Сайхан» гэдэг үг ямар аймгийн үг вэ?|Тэмдэг нэр;Нэр үг;Үйл үг;Тооны нэр;Дайвар үг|Юмны шинж чанарыг заадаг (ямар?) тул тэмдэг нэр.
u|«хүүхдүүд» гэдэг үгийн «-үүд» нь юу вэ?|Олон тооны дагавар;Тийн ялгалын нөхцөл;Хамаатуулах нөхцөл;Үйл бүтээх дагавар;Цагийн нөхцөл|-ууд/-үүд, -нууд/-нүүд, -чууд/-чүүд, -нар, -д — олон тооны дагаврууд.
o|«Бат ном уншив.» өгүүлбэрийн өгүүлэгдэхүүн аль нь вэ?|Бат;ном;уншив;ном уншив;Бат ном|Хэн? гэсэн асуултад хариулж, үйлийг үйлдэгчийг заасан — өгүүлэгдэхүүн.
o|«Манай ангийн сурагчид маш сайн сурдаг.» өгүүлбэрийн өгүүлэхүүн аль нь вэ?|сурдаг;сурагчид;маш сайн;манай;ангийн|Өгүүлэгдэхүүний үйл, байдлыг илэрхийлж, өгүүлбэрийг төгсгөж буй гишүүн — өгүүлэхүүн.
o|«Улаан цэцэг дэлгэрэв.» өгүүлбэрийн «улаан» ямар гишүүн вэ?|Тодотгол;Өгүүлэгдэхүүн;Өгүүлэхүүн;Тусагдахуун;Байц|Нэр үгийн өмнө орж, ямар? гэсэн асуултад хариулна — тодотгол.
o|«Бат номыг уншив.» өгүүлбэрийн «номыг» ямар гишүүн вэ?|Тусагдахуун;Байц;Тодотгол;Өгүүлэгдэхүүн;Өгүүлэхүүн|Үйл тусаж буй зүйлийг (юуг?) заасан — тусагдахуун.
o|«Бид өглөө эрт босов.» өгүүлбэрийн «өглөө эрт» ямар гишүүн вэ?|Байц;Тусагдахуун;Тодотгол;Өгүүлэгдэхүүн;Хаяглал|Үйлийн цаг хугацааг (хэзээ?) заасан — цаг хугацааны байц.
o|Аль нь нийлмэл өгүүлбэр вэ?|Бороо орсон тул бид гэртээ үлдэв.;Би номын санд очив.;Аав, ээж хоёр ирэв.;Миний дүү гоё зурдаг.;Өнөөдөр цаг агаар сайхан байна.|«Бороо орсон» ба «бид гэртээ үлдэв» гэсэн хоёр өгүүлбэр «тул»-аар холбогдсон тул нийлмэл өгүүлбэр.
o|«Багш аа, би асуулт асууж болох уу?» өгүүлбэрийн «Багш аа» юу вэ?|Хаяглал;Өгүүлэгдэхүүн;Оршил үг;Тодотгол;Тусагдахуун|Хандаж буй этгээдийг заасан — хаяглал. Өгүүлбэрийн гишүүн болохгүй, таслалаар тусгаарлана.
o|«Мэдээж, тэр шалгалтандаа тэнцэнэ.» өгүүлбэрийн «мэдээж» юу вэ?|Оршил үг;Хаяглал;Өгүүлэгдэхүүн;Байц;Тодотгол|Ярьж буй хүний итгэл, хандлагыг илэрхийлсэн — оршил үг. Таслалаар тусгаарлана.
o|Тоочин гишүүдийг хооронд нь ямар тэмдгээр тусгаарладаг вэ?|Таслал;Цэг;Хоёр цэг;Асуултын тэмдэг;Хаалт|Жишээ нь: Би алим, лийр, усан үзэм авлаа.
y|«Гоё» гэдэг үгтэй ойролцоо утгатай үгийг сонго.|сайхан;муухай;хурдан;өндөр;хүйтэн|гоё ≈ сайхан.
y|«Өгөөмөр» гэдэг үгийн эсрэг утгатай үгийг сонго.|харамч;эелдэг;баян;ухаалаг;зоригтой|өгөөмөр ↔ харамч.
y|«Эртний» гэдэг үгийн эсрэг утгатай үгийг сонго.|орчин үеийн;хуучин;түүхэн;өвөг;урьдын|эртний ↔ орчин үеийн.
y|«Ам алдах» хэлц үгийн утга аль нь вэ?|амлах;дуугүй болох;хоол идэх;худал хэлэх;уурлах|ам алдах = амлалт өгөх, амлах.
y|«Нүүр улайх» хэлц үгийн утга аль нь вэ?|ичих;уурлах;баярлах;өвдөх;ядрах|нүүр улайх = ичих.
y|«Чих тавих» хэлц үгийн утга аль нь вэ?|анхааралтай сонсох;унтах;чихээ таглах;гомдох;мартах|чих тавих = чагнах, анхааралтай сонсох.
y|«Эвт шаазгай ___ барина.» зүйр цэцэн үгийг гүйцээ.|буга;туулай;загас;морь;чоно|Эвтэй байвал сул дорой ч их зүйлийг бүтээнэ гэсэн утгатай.
y|«Мянга сонсохоор ___ үз.» зүйр цэцэн үгийг гүйцээ.|нэг;хоёр;мянга;зуу;арав|Олон удаа сонссоноос нэг удаа өөрийн нүдээр үзсэн нь дээр.
y|Аль өгүүлбэрт утга давхардсан (илүү үг орсон) байна?|Бид уул руу дээшээ өгсөв.;Бид уул руу өгсөв.;Бид уулын орой руу авирав.;Бид уулнаас буув.;Бид ууланд гарав.|«Өгсөх» нь дээш явах гэсэн утгатай тул «дээшээ» илүүдэж байна.
l|«Миний нутаг» шүлгийн зохиолч хэн бэ?|Д.Нацагдорж;Ц.Дамдинсүрэн;Б.Явуухулан;Ч.Лодойдамба;Д.Пүрэвдорж|«Хэнтий, Хангай, Соёны өндөр сайхан нуруунууд…» — Д.Нацагдорж (1906–1937).
l|«Учиртай гурван толгой» жүжгийн зохиолч хэн бэ?|Д.Нацагдорж;Ч.Ойдов;С.Эрдэнэ;Л.Түдэв;Б.Ринчен|Д.Нацагдоржийн зохиол. Гол дүрүүд нь Юндэн, Нансалмаа, Балган.
l|«Учиртай гурван толгой» жүжгийн гол дүр аль нь вэ?|Нансалмаа;Ерөөлт;Цогт тайж;Гэсэр;Жангар|Юндэн, Нансалмаа, Балган нар гол дүрүүд.
l|«Тунгалаг Тамир» романы зохиолч хэн бэ?|Ч.Лодойдамба;Д.Нацагдорж;С.Буяннэмэх;Д.Намдаг;Б.Ринчен|Ч.Лодойдамбын роман — Тамирын голын хөндийн ард түмний амьдралыг XX зууны эхэн үеэс өгүүлнэ.
l|«Монголын нууц товчоо» хэдэн онд бичигдсэн гэж ихэнх судлаачид үздэг вэ?|1240;1206;1162;1368;1921|Зохиолын төгсгөлд «Хулгана жил… бичиж дуусгав» гэсэн нь 1240 онд тохирно гэж үздэг.
l|«Хөх судар» зохиолын зохиогч хэн бэ?|В.Инжинаш;Д.Равжаа;Д.Нацагдорж;Ц.Дамдинсүрэн;Ч.Лодойдамба|Ванчинбалын Инжинаш (1837–1892) — «Их Юан улсын мандсан төрийн Хөх судар».
l|Д.Равжаа ямар бүтээлээрээ алдартай вэ?|«Саран хөхөөгийн намтар»;«Миний нутаг»;«Хөх судар»;«Тунгалаг Тамир»;«Жангар»|Догшин ноён хутагт Д.Равжаа (1803–1856) «Саран хөхөөгийн намтар» жүжгийг бичсэн.
l|Ойрад монголчуудын алдарт баатарлаг тууль аль нь вэ?|Жангар;Гэсэр;Хөх судар;Тунгалаг Тамир;Миний нутаг|«Жангар» — ойрадын баатарлаг тууль.
l|Монгол яруу найргийн уламжлалт гол онцлог аль нь вэ?|Толгой холбох;Мөрийн сүүлийг заавал холбох;Шүлэг заавал 4 мөртэй байх;Мөр бүр асуултаар төгсөх;Үг бүр том үсгээр эхлэх|Монгол шүлэгт мөрийн эхний үеийг ижил авиагаар холбож, толгой холбодог.
e|[Манай] [аймагийн] [сургууль] [шинэ] [байранд] орсон.|1|Сул эгшиг гээгдэнэ: аймгийн.
e|[Хүүхэдүүд] [талбай] [дээр] [бөмбөг] [тоглож] байна.|0|Эгшгээр эхэлсэн дагаврын өмнө сул эгшиг гээгдэнэ: хүүхдүүд.
e|Би [номийг] [уншаад] [найздаа] [өгсөн] [юм].|0|Эр үгэнд -ыг залгана: номыг.
e|[Ах] [маань] [Улаанбаатарад] [ажилладаг] [эмч].|2|Р-ээр төгссөн үгэнд -т залгана: Улаанбаатарт.
e|[Тэр] [морьыг] [сайн] [уядаг] [хүн].|1|Ь-ээр төгссөн үгэнд -ийг залгахад ь гээгдэнэ: морийг.`
  };
  /* уншиж ойлгох: q = [асуулт, зөв, буруу×4] */
  var READ={
en:[
{t:"The Gobi Desert",p:["The Gobi is one of the largest deserts in the world. It covers parts of southern Mongolia and northern China. Many people imagine a desert as an endless sea of sand, but most of the Gobi is actually bare rock and gravel. Only about five percent of it is covered by sand dunes, such as the famous Khongoryn Els, which can be up to 300 metres high.",
"The climate of the Gobi is extreme. In summer the temperature can rise above 40°C, while in winter it can fall below −40°C. Rain is rare, and strong winds often cause dust storms in spring.",
"Despite these hard conditions, the Gobi is home to many animals, including the wild Bactrian camel, the Gobi bear and the argali sheep. Scientists have also found many dinosaur fossils there. In the 1920s, an American expedition discovered some of the first dinosaur eggs known to science at a place called the Flaming Cliffs."],
q:[["What is the text mainly about?","The Gobi's land, climate, animals and fossils","How to travel across the Gobi","Why deserts are dangerous for people","The history of the Mongolian Empire","Life in northern China"],
["According to the text, most of the Gobi is covered by ___.","rock and gravel","sand dunes","lakes","forests","ice"],
["The word \"rare\" in paragraph 2 means ___.","not common","very heavy","very cold","dangerous","warm"],
["Which statement is TRUE according to the text?","Dinosaur eggs were found at the Flaming Cliffs.","The Gobi is only in Mongolia.","It is always hot in the Gobi.","Dust storms usually happen in autumn.","Khongoryn Els is 3000 metres high."]]},
{t:"Phones Before Bed",p:["Many teenagers take their phones to bed. Surveys in many countries show that a large number of students use their phones in the last hour before they sleep. Doctors say this habit can be harmful.",
"There are two main reasons. First, the blue light from screens tells the brain that it is still daytime, so the body produces less melatonin, the hormone that makes us feel sleepy. Second, games and social media keep the mind active and excited, which makes it harder to relax.",
"Lack of sleep affects more than just mood. Students who do not sleep enough often find it difficult to concentrate in class, and their test results may suffer. Experts suggest a simple rule: switch off all screens at least one hour before going to bed and keep the phone outside the bedroom. Reading a paper book or listening to calm music are good alternatives."],
q:[["According to the text, blue light from screens ___.","makes the body produce less melatonin","helps us fall asleep","is good for the eyes","comes only from TVs","makes the brain think it is night"],
["The word \"alternatives\" in the last paragraph means ___.","other choices","problems","hormones","rules","results"],
["What do experts advise?","Turn off screens an hour before bed.","Use the phone only for music.","Sleep with the phone nearby.","Play calm games before sleep.","Study late at night."],
["The writer's main purpose is to ___.","explain why screens before bed are harmful and give advice","advertise a new phone","describe a medical experiment","tell a funny story","compare two countries"]]},
{t:"English Speaking Club",p:["ENGLISH SPEAKING CLUB — Do you want to improve your spoken English? Join our free club at the City Library!",
"When: every Tuesday and Thursday, 5:00–6:30 p.m. Who: students in grades 9–12. What we do: discussions, games, short presentations and a film night on the last Friday of every month.",
"Please bring a notebook and a positive attitude! To join, write your name and grade on the list at the library reception desk before 15 September. Places are limited to 25 students."],
q:[["How often does the club meet, not counting film nights?","twice a week","once a week","every day","once a month","three times a week"],
["Who can join the club?","students in grades 9–12","all adults","teachers only","primary school children","anyone over 18"],
["When are the film nights?","on the last Friday of each month","every Tuesday","every Thursday","on 15 September","every weekend"],
["Which statement is NOT true?","Members must pay a small fee.","The club meets at the City Library.","Only 25 students can join.","Members give short presentations.","You should sign up before 15 September."]]},
{t:"The Örtöö",p:["In the 13th century the Mongol Empire became the largest land empire in history. To control such a huge territory, Chinggis Khaan and his successors needed a fast way to send messages. They created a system of relay stations called örtöö.",
"The stations were built every 30 to 60 kilometres. At each one, riders could get fresh horses, food and a place to rest. A messenger carrying an important letter could ride to the next station, change horses and continue at once. In this way, news could travel 200 kilometres or more in a single day.",
"Messengers carried a special metal tablet called a paiza, which showed that they worked for the khan. Travellers with a paiza could use the stations freely. Marco Polo, who visited the empire, was amazed by this system and described it in his famous book. Many historians believe the örtöö was one of the main reasons the empire could be governed so successfully."],
q:[["Why was the örtöö created?","to send messages quickly across the empire","to train soldiers","to sell horses","to collect taxes from travellers","to build roads in China"],
["What was a paiza?","a tablet showing that a person worked for the khan","a type of horse","a relay station","a book by Marco Polo","a letter to the khan"],
["The word \"successors\" in paragraph 1 refers to ___.","the rulers who came after Chinggis Khaan","his enemies","the messengers","the travellers","the historians"],
["Which statement is TRUE?","Riders changed horses at the stations.","The stations were 500 km apart.","Marco Polo built the örtöö.","Anyone could use the stations without a paiza.","News took a month to travel 200 km."]]}
],
ru:[
{t:"Байкал",p:["Байкал — самое глубокое озеро на Земле. Его глубина — 1642 метра. В Байкале находится около двадцати процентов всей пресной воды планеты. Озеро расположено в Сибири, недалеко от границы с Монголией.",
"В Байкал впадает более трёхсот рек, а вытекает только одна — Ангара. Самая большая река, которая впадает в Байкал, — Селенга. Она начинается в Монголии.",
"Вода в Байкале очень чистая и прозрачная. В озере живут животные, которых нет больше нигде в мире, например байкальская нерпа. Каждый год сюда приезжают тысячи туристов."],
q:[["Какая река вытекает из Байкала?","Ангара","Селенга","Волга","Туул","Орхон"],
["Где начинается река Селенга?","в Монголии","в Москве","в Китае","в Байкале","в Казахстане"],
["Слово «прозрачная» значит ___.","через неё всё хорошо видно","очень холодная","солёная","грязная","глубокая"],
["Что НЕ верно?","Байкал находится в Европе.","Байкал — самое глубокое озеро.","В Байкал впадает более 300 рек.","В Байкале живёт нерпа.","На Байкал приезжают туристы."]]},
{t:"Письмо другу",p:["Привет, Саша!","Спасибо за твоё письмо. Извини, что долго не отвечала: в мае у нас были экзамены. Теперь я свободна! Летом я поеду к бабушке в деревню. Она живёт в Хэнтийском аймаке, около красивой реки. Там я буду ездить на лошади, помогать бабушке доить коров и собирать ягоды. Вечером мы будем пить чай с молоком и слушать бабушкины истории.",
"А что ты будешь делать летом? Может быть, ты приедешь в Монголию? Я покажу тебе нашу степь! Пиши! Твоя подруга Сарнай"],
q:[["Почему Сарнай долго не отвечала?","У неё были экзамены.","Она была больна.","Она была в деревне.","Она потеряла адрес.","Она не любит писать."],
["Где живёт бабушка Сарнай?","в деревне в Хэнтийском аймаке","в Улан-Баторе","в Москве","у моря","в городе Дархан"],
["Что Сарнай НЕ будет делать летом?","учиться в школе","ездить на лошади","собирать ягоды","помогать бабушке","пить чай с молоком"],
["Что Сарнай предлагает Саше?","приехать в Монголию","написать бабушке","сдать экзамены","купить лошадь","поехать на море"]]},
{t:"Наадам",p:["Наадам — главный национальный праздник Монголии. Его отмечают каждый год в июле. Наадам называют «тремя играми мужей», потому что в программе праздника три вида соревнований: борьба, скачки и стрельба из лука.",
"Сегодня в стрельбе из лука участвуют и женщины, а в скачках — дети. Юные наездники скачут на лошадях от 10 до 30 километров. Победителя борьбы награждают почётным званием, например «Арслан» (лев) или «Аварга» (великан).",
"В 2010 году ЮНЕСКО включило Наадам в список нематериального культурного наследия человечества."],
q:[["Почему Наадам называют «тремя играми мужей»?","В нём три вида соревнований.","Он длится три дня.","В нём участвуют три мужчины.","Его отмечают три раза в год.","Его придумали три хана."],
["Кто участвует в скачках?","дети","только женщины","пожилые люди","туристы","борцы"],
["Что значит звание «Арслан»?","лев","великан","лошадь","лук","праздник"],
["Что верно?","ЮНЕСКО включило Наадам в свой список в 2010 году.","Наадам отмечают зимой.","Женщины не участвуют в Наадаме.","Дети скачут 100 километров.","Наадам — китайский праздник."]]}
],
mn:[
{t:"Хөвсгөл нуур",p:["Хөвсгөл нуур Монгол орны хойд хэсэгт, Хөвсгөл аймагт оршдог. Энэ бол манай орны хамгийн гүн нуур бөгөөд хамгийн гүн хэсэг нь 260 гаруй метр хүрдэг. Монгол орны цэнгэг усны нөөцийн гол хэсэг энд хадгалагддаг тул ард түмэн түүнийг «Хөх сувд» хэмээн хайрлан нэрлэдэг.",
"Хөвсгөл нууранд олон жижиг гол горхи цутгадаг ч, түүнээс ганцхан Эгийн гол урсан гардаг. Эгийн гол Сэлэнгэ мөрөнд цутгаж, улмаар Байгаль нуурт хүрдэг.",
"Нуурын ус маш тунгалаг тул 20 гаруй метрийн гүнд байгаа чулуу ч харагддаг. Өвлийн улиралд нуур зузаан мөсөөр хучигдана. Сүүлийн жилүүдэд жуулчдын тоо нэмэгдэж, эрэг орчмын хог хаягдал ихэссэн нь байгаль хамгаалагчдын санааг зовоож байна."],
q:[["Эх бичвэрийн гол санаа юу вэ?","Хөвсгөл нуурын байршил, онцлог ба тулгамдсан асуудал","Монголын бүх нуурын жагсаалт","Байгаль нуурын түүх","Жуулчны аялалын зар","Загас агнуурын дүрэм"],
["Хөвсгөл нуураас ямар гол урсан гардаг вэ?","Эгийн гол","Сэлэнгэ мөрөн","Туул гол","Орхон гол","Хэрлэн гол"],
["«Тунгалаг» гэдэг үгийн утга аль нь вэ?","цэвэр, ёроол нь харагдахуйц","маш хүйтэн","давстай","гүехэн","бохир"],
["Аль нь эх бичвэрт тохирохгүй вэ?","Хөвсгөл нуур Монголын өмнөд хэсэгт оршдог.","Нуурын хамгийн гүн хэсэг 260 гаруй метр.","Өвөлдөө нуур мөсөөр хучигдана.","Эгийн гол Сэлэнгэ мөрөнд цутгадаг.","Жуулчдын тоо нэмэгдэж байна."]]},
{t:"Монгол бичиг",p:["Монгол бичиг буюу уйгаржин монгол бичиг нь олон зууны турш монголчуудын үндсэн бичиг байсаар ирсэн. Энэ бичгийг дээрээс доош, зүүнээс баруун тийш босоо мөрөөр бичдэг нь бусад олон бичгээс ялгардаг онцлог юм.",
"XX зууны дунд үед Монгол Улс кирилл үсэгт шилжсэн боловч монгол бичгийг сургуульд үргэлжлүүлэн заасаар байна. Олон хүн шинэ жилийн мэнд, хүндэтгэлийн бичгийг монгол бичгээр бичих дуртай.",
"2013 онд ЮНЕСКО монгол уран бичлэгийг яаралтай хамгаалах шаардлагатай биет бус соёлын өвийн жагсаалтад бүртгэсэн. Энэ нь эртний бичгийн соёлоо хойч үедээ өвлүүлэхийн ач холбогдлыг дахин сануулсан үйл явдал болов."],
q:[["Монгол бичгийг хэрхэн бичдэг вэ?","дээрээс доош, зүүнээс баруун тийш","баруунаас зүүн тийш, хэвтээ","зүүнээс баруун тийш, хэвтээ","доороос дээш","баруунаас зүүн тийш, босоо"],
["ЮНЕСКО монгол уран бичлэгийг хэдэн онд бүртгэсэн бэ?","2013","1941","2010","1946","2005"],
["«Өвлүүлэх» гэдэг үгийн утга аль нь вэ?","хойч үедээ үлдээж дамжуулах","мартах","худалдах","устгах","өвөл болох"],
["Зохиогчийн гол зорилго юу вэ?","Монгол бичгийн онцлог, ач холбогдлыг танилцуулах","Кирилл үсгийг магтах","Шинэ жилийн мэнд хүргэх","ЮНЕСКО-гийн түүхийг өгүүлэх","Бичгийн хэрэгсэл сурталчлах"]]}
]
  };
  var TIPS0=[
    "Эхлээд мэддэг асуултуудаа хариулж, хэцүүг нь алгасаад дараа нь эргэж ир. Доорх дугааруудаар дурын асуулт руу шилжиж болно.",
    "Уншлагын даалгаварт эхлээд асуултаа уншаад, дараа нь хариултыг нь текстээс хай.",
    "Хариултаа мэдэхгүй бол илт буруу хувилбаруудыг хасаад, үлдсэнээс нь сонго."
  ];
  var TIPS={
    lang:TIPS0.concat(["Дүрмийн асуултад хоосон зайн өмнөх, араас орсон үгсэд анхаар: since/for, If, yet, ago гэх мэт үгс цагийг заадаг."]),
    mn:TIPS0.concat(["Нөхцөл, дагаврын асуултад эхлээд үгийн үндсийг олж, эр/эм үг эсэх, юугаар төгссөнийг тодорхойл.",
      "Өгүүлбэрийн гишүүнийг асуултаар ол: хэн? юу? — өгүүлэгдэхүүн, юуг? — тусагдахуун, ямар? — тодотгол, хэзээ? хаана? яаж? — байц."])
  };
  var DESC={
    lang:"Элсэлтийн ерөнхий шалгалтын хэлбэрийн A–E хувилбартай даалгаврууд: дүрэм, үгийн сан, алдаа олох, харилцан яриа, уншиж ойлгох. Асуулт бүр монгол тайлбартай.",
    mn:"Монгол хэл, уран зохиолын ЭЕШ-ийн хэлбэрийн A–E хувилбартай даалгаврууд: зөв бичих дүрэм, үг зүй, өгүүлбэр зүй, утга найруулга, уран зохиол, алдаа олох, уншиж ойлгох. Асуулт бүр тайлбартай."
  };
  var X={sec:"home",T:null,P:null},env=null,bank={};
  function h(){return env.h.apply(null,arguments);}
  function subj(){return env.sget("eeshSubj",null)==="mn"?"mn":"lang";}
  function cur(){return subj()==="mn"?"mn":env.lang();} /* өгөгдөл, статистикийн түлхүүр */
  function ord(){return ORDERS[subj()];}
  function mix(){return MIXES[subj()];}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function hid(s){var x=0;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))|0;return (x>>>0).toString(36);}
  function items(lang){
    if(bank[lang])return bank[lang];
    var out=[];
    (DATA[lang]||"").split("\n").forEach(function(r){
      r=r.trim();if(!r)return;var p=r.split("|");
      if(p[0]==="e"){var parts=[],m,re=/\[([^\]]+)\]/g;while((m=re.exec(p[1])))parts.push(m[1]);out.push({s:"e",q:p[1],o:parts,a:+p[2],x:p[3]||"",fixed:true});}
      else out.push({s:p[0],q:p[1],o:p[2].split(";"),a:0,x:p[3]||""});
    });
    (READ[lang]||[]).forEach(function(R){R.q.forEach(function(q){out.push({s:"r",q:q[0],o:q.slice(1),a:0,x:"",p:R});});});
    out.forEach(function(it){it.id=hid(it.s+"|"+(it.p?it.p.t+"|":"")+it.q);});
    return bank[lang]=out;
  }
  function inst(it){
    var o=it.o.map(function(t,i){return {t:t,ok:i===it.a};});
    return {it:it,o:it.fixed?o:shuffle(o),pick:null};
  }
  function skey(){return "eesh:"+cur();}
  function stats(){var S=env.sget(skey(),null)||{};S.w=S.w||{};S.s=S.s||{};S.log=S.log||[];return S;}
  function record(S,q){
    var ok=q.pick!=null&&q.o[q.pick].ok,s=S.s[q.it.s]||(S.s[q.it.s]=[0,0]);
    s[1]++;if(ok){s[0]++;delete S.w[q.it.id];}else S.w[q.it.id]=1;
    return ok;
  }
  function wrongItems(){var S=stats();return items(cur()).filter(function(it){return S.w[it.id];});}
  function daysLeft(){
    var d=env.sget("eeshDate",null);if(!d)return null;
    var t=new Date(d+"T00:00:00"),n=new Date();n.setHours(0,0,0,0);
    var k=Math.round((t-n)/864e5);return isNaN(k)?null:k;
  }

  /* ---------- асуулт зурах ---------- */
  function qBody(q){
    var it=q.it,box=h("div",{class:"q",style:"margin-top:12px;line-height:1.55"});
    if(it.s==="e"){
      box.append(h("div",{class:"muted small",style:"font-weight:600;margin-bottom:6px"},cur()==="mn"?"Алдаатай хэсгийг ол":cur()==="ru"?"Найдите ошибку · Алдаатай хэсгийг ол":"Find the mistake · Алдаатай хэсгийг ол"));
      var i=0,s=h("div");
      it.q.split(/(\[[^\]]+\])/).forEach(function(part){
        if(!part)return;
        if(part[0]==="["){s.append(h("span",{style:"text-decoration:underline;text-underline-offset:4px;font-weight:700"},part.slice(1,-1)),h("sup",{style:"color:var(--sky);font-weight:800;margin:0 2px"},ABC[i++]));}
        else s.append(part);
      });
      box.append(s);
    }else if(it.s==="d"){
      it.q.split("//").forEach(function(l){box.append(h("div",null,l));});
    }else box.append(it.q);
    return box;
  }
  function passage(R,open){
    var box=h("div",{class:"note",style:"margin-top:12px;"+(open?"":"max-height:42vh;overflow:auto")},h("div",{style:"font-weight:800"},R.t));
    R.p.forEach(function(x){box.append(h("p",{style:"margin:6px 0 0;line-height:1.55"},x));});
    return box;
  }
  function optLabel(q,i){return ABC[i]+")  "+q.o[i].t;}
  /* алдаа олох даалгаварт «зөв хариулт» нь алдаатай хэсэг өөрөө тул тэгж нэрлэнэ */
  function rightLabel(q){var i=q.o.findIndex(function(o){return o.ok;});return q.it.s==="e"?"Алдаатай хэсэг: "+ABC[i]+") "+q.o[i].t:q.o[i].t;}

  /* ---------- загвар тест ---------- */
  function startTest(){
    var all=items(cur()),qs=[],M=mix();
    ord().forEach(function(s){if(s!=="r")shuffle(all.filter(function(it){return it.s===s;})).slice(0,M[s]).forEach(function(it){qs.push(inst(it));});});
    shuffle(READ[cur()]||[]).slice(0,M.r).forEach(function(R){all.forEach(function(it){if(it.p===R)qs.push(inst(it));});});
    X.T={qs:qs,i:0,t0:Date.now(),end:Date.now()+MIN*60000,done:false,quit:false};X.sec="test";
    env.render();window.scrollTo(0,0);
  }
  function finishTest(){
    var T=X.T;if(T.done)return;
    T.done=true;env.clearTimer();
    var S=stats(),ok=0,sec={};
    T.qs.forEach(function(q){var r=record(S,q),s=sec[q.it.s]||(sec[q.it.s]={n:0,ok:0});s.n++;if(r){s.ok++;ok++;}});
    T.sec=sec;T.ok=ok;T.pct=Math.round(ok/T.qs.length*100);T.used=Math.round((Math.min(Date.now(),T.end)-T.t0)/1000);
    T.newBest=S.best!=null&&T.pct>S.best;if(S.best==null||T.pct>S.best)S.best=T.pct;
    var d=new Date();S.log.push({d:d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),pct:T.pct});
    if(S.log.length>30)S.log.shift();
    env.sset(skey(),S);
    T.xp=10+Math.round(T.pct/5);env.addXP(T.xp);
    if(T.pct>=80)env.celebrate();
  }
  function viewTest(root){
    var T=X.T;
    if(!T.done&&Date.now()>=T.end)finishTest();
    root.append(h("button",{class:"back",onclick:function(){
      if(!T.done&&!T.quit){T.quit=true;env.toast("Дахин дарвал тест цуцлагдана");env.render();return;}
      env.clearTimer();X.T=null;X.sec="home";env.render();
    }},T.done?"‹ ЭЕШ":T.quit?"‹ Тийм, цуцлах":"‹ Цуцлах"));
    if(T.done)return viewTestResult(root);
    var q=T.qs[T.i],answered=T.qs.filter(function(x){return x.pick!=null;}).length;
    root.append(h("div",{style:"display:flex;align-items:center;gap:10px"},
      h("h2",{style:"flex:1;margin:0;font-size:19px"},SEC[q.it.s]+" · "+(T.i+1)+"/"+T.qs.length),
      h("span",{class:"big",id:"eeshclock"},"⏱ "+env.fmtSec((T.end-Date.now())/1000))));
    root.append(h("div",{class:"bar"},h("i",{style:"width:"+(answered/T.qs.length*100)+"%"})));
    env.startTimer(function(){
      var e=document.getElementById("eeshclock");
      if(!e){env.clearTimer();return;}
      var r=(T.end-Date.now())/1000;
      if(r<=0){finishTest();env.render();return;}
      e.textContent="⏱ "+env.fmtSec(r);
    });
    if(q.it.p)root.append(passage(q.it.p));
    root.append(qBody(q));
    q.o.forEach(function(o,i){
      var sel=q.pick===i;
      root.append(h("button",{class:"opt","aria-pressed":String(sel),style:sel?"border-color:var(--sky);background:var(--dune-2);font-weight:700":null,
        onclick:function(){q.pick=sel?null:i;env.render();}},optLabel(q,i)));
    });
    root.append(h("div",{class:"row"},
      h("button",{class:"btn",disabled:T.i===0,onclick:function(){T.i--;env.render();window.scrollTo(0,0);}},"‹ Өмнөх"),
      T.i+1<T.qs.length?h("button",{class:"btn primary",onclick:function(){T.i++;env.render();window.scrollTo(0,0);}},"Дараах ›"):null));
    var grid=h("div",{style:"display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:6px;margin-top:16px"});
    T.qs.forEach(function(x,i){
      var cur=i===T.i,done=x.pick!=null;
      grid.append(h("button",{type:"button","aria-label":"Асуулт "+(i+1)+(done?", хариулсан":""),"aria-current":cur?"true":null,
        style:"padding:8px 0;border-radius:10px;font-weight:700;border:"+(cur?"2px solid var(--sky)":"1px solid var(--line)")+";background:"+(done?"var(--dune)":"var(--surface)")+";color:inherit",
        onclick:function(){T.i=i;env.render();window.scrollTo(0,0);}},String(i+1)));
    });
    root.append(grid);
    root.append(h("p",{class:"muted small",style:"margin:8px 0 0"},"Хариулсан: "+answered+" / "+T.qs.length));
    root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:function(){
      var left=T.qs.length-answered;
      if(left&&!T.sure){T.sure=true;env.toast(left+" асуулт хариулаагүй байна. Дахин дарвал дуусгана.");env.render();return;}
      finishTest();env.render();window.scrollTo(0,0);
    }},T.sure?"Тийм, дуусгах 🏁":"Тестээ дуусгах 🏁"));
  }
  function secBars(root,sec){
    ord().forEach(function(k){
      var s=sec[k];if(!s||!s.n)return;var p=Math.round(s.ok/s.n*100);
      root.append(h("div",{style:"margin-top:10px"},
        h("div",{style:"display:flex;justify-content:space-between"},h("span",null,SECI[k]+" "+SEC[k]),h("b",null,s.ok+"/"+s.n)),
        h("div",{class:"bar"},h("i",{style:"width:"+p+"%;"+(p<60?"background:var(--danger)":"")}))));
    });
  }
  function review(root,list){
    var ul=h("ul",{class:"exl"}),lastP=null;
    list.forEach(function(q){
      var it=q.it,mine=q.pick!=null?q.o[q.pick]:null;
      if(it.p&&it.p!==lastP){lastP=it.p;ul.append(h("li",null,h("details",null,h("summary",{class:"muted small"},"📰 "+it.p.t+" — эх бичвэрийг харах"),passage(it.p,true))));}
      ul.append(h("li",null,
        h("div",{class:"muted small"},SECI[it.s]+" "+SEC[it.s]),
        h("div",{style:"font-weight:600;white-space:pre-line"},it.s==="e"?it.q.replace(/[\[\]]/g,""):it.q.split("//").join("\n")),
        h("div",{style:"color:var(--ok)"},"✓ "+rightLabel(q)),
        mine?h("div",{style:"color:var(--danger)"},"✗ "+mine.t):h("div",{class:"muted small"},"Хариулаагүй"),
        it.x?h("div",{class:"muted small",style:"margin-top:4px"},"💡 "+it.x):null));
    });
    root.append(ul);
  }
  function viewTestResult(root){
    var T=X.T;
    root.append(h("div",{class:"note",style:"text-align:center;margin-top:10px"},
      h("div",{style:"font-size:44px"},T.pct>=80?"🏆":T.pct>=60?"👍":"💪"),
      h("div",{style:"font-weight:800;font-size:26px"},T.pct+"%"),
      h("div",null,T.ok+" / "+T.qs.length+" зөв"+(T.newBest?" · Шинэ дээд амжилт!":"")),
      h("div",{class:"muted small",style:"margin-top:6px"},"Зарцуулсан хугацаа "+env.fmtSec(T.used)+" · +"+T.xp+" XP")));
    secBars(root,T.sec);
    var weak=ord().filter(function(k){return T.sec[k]&&T.sec[k].ok/T.sec[k].n<0.6;});
    if(weak.length)root.append(h("div",{class:"note",style:"margin-top:14px"},"📌 Анхаарах хэсэг: "+weak.map(function(k){return SEC[k];}).join(", ")+". ЭЕШ нүүрнээс тухайн хэсгийн дасгалыг хийгээрэй."));
    var wrong=T.qs.filter(function(q){return q.pick==null||!q.o[q.pick].ok;});
    if(wrong.length){root.append(h("p",{class:"muted small",style:"margin-top:16px"},"Алдсан асуултууд ("+wrong.length+") — тайлбартай"));review(root,wrong);}
    root.append(h("div",{class:"row"},
      h("button",{class:"btn",onclick:function(){X.T=null;X.sec="home";env.render();}},"ЭЕШ нүүр"),
      h("button",{class:"btn primary",onclick:startTest},"Дахин өгөх")));
  }

  /* ---------- хэсгээр дасгал, алдсанаа давтах (шууд хариу, тайлбартай) ---------- */
  function startPractice(sec){
    var all=items(cur()),list;
    if(sec==="miss"){
      list=shuffle(wrongItems()).slice(0,10);
      list.sort(function(a,b){return (a.p?1:0)-(b.p?1:0)||(a.p&&b.p?a.p.t.localeCompare(b.p.t):0);});
    }else if(sec==="r"){
      var Rs=READ[cur()]||[],S=stats(),fresh=Rs.filter(function(R){return all.some(function(it){return it.p===R&&!(it.id in (S.seen||{}));});});
      var R=shuffle(fresh.length?fresh:Rs)[0];list=all.filter(function(it){return it.p===R;});
    }else list=shuffle(all.filter(function(it){return it.s===sec;})).slice(0,10);
    if(!list.length){env.toast("Асуулт алга");return;}
    X.P={sec:sec,qs:list.map(inst),i:0,score:0};X.sec="prac";env.render();window.scrollTo(0,0);
  }
  function viewPractice(root){
    var P=X.P;
    root.append(h("button",{class:"back",onclick:function(){X.P=null;X.sec="home";env.render();}},"‹ ЭЕШ"));
    if(P.i>=P.qs.length)return viewPracResult(root);
    var q=P.qs[P.i],done=q.pick!=null;
    root.append(h("h2",{style:"margin:0;font-size:19px"},(P.sec==="miss"?"🔁 Алдсанаа давтах":SECI[P.sec]+" "+SEC[P.sec])+" · "+(P.i+1)+"/"+P.qs.length));
    root.append(h("div",{class:"bar"},h("i",{style:"width:"+(P.i/P.qs.length*100)+"%"})));
    if(q.it.p)root.append(passage(q.it.p));
    root.append(qBody(q));
    q.o.forEach(function(o,i){
      var cls="opt";if(done){if(o.ok)cls+=" ok";else if(i===q.pick)cls+=" bad";}
      root.append(h("button",{class:cls,disabled:done,onclick:function(){
        q.pick=i;var S=stats();if(q.it.p){S.seen=S.seen||{};S.seen[q.it.id]=1;}
        var ok=record(S,q);if(env.combo)env.combo(ok);
        if(ok){P.score++;env.addXP(1);}
        env.sset(skey(),S);env.render();
      }},optLabel(q,i)));
    });
    if(done){
      var ok=q.o[q.pick].ok;
      root.append(h("div",{class:"fb "+(ok?"ok":"bad")},ok?"Зөв! 🎉":"Буруу. "+(q.it.s==="e"?rightLabel(q):"Зөв хариулт: "+rightLabel(q))));
      if(q.it.x)root.append(h("div",{class:"note"},"💡 "+q.it.x));
      root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){P.i++;env.render();window.scrollTo(0,0);}},P.i+1<P.qs.length?"Дараагийх ›":"Дүнгээ харах 🏁")));
    }
  }
  function viewPracResult(root){
    var P=X.P,pct=Math.round(P.score/P.qs.length*100);
    if(!P.cheered){P.cheered=true;if(pct>=80)env.celebrate();}
    root.append(h("div",{class:"note",style:"text-align:center;margin-top:10px"},
      h("div",{style:"font-size:40px"},pct>=80?"🏆":pct>=60?"👍":"💪"),
      h("div",{style:"font-weight:800;font-size:24px"},P.score+" / "+P.qs.length),
      h("div",{class:"muted small",style:"margin-top:4px"},pct>=80?"Маш сайн!":"Алдсан асуултууд «Алдсанаа давтах» хэсэгт хадгалагдлаа.")));
    root.append(h("div",{class:"row"},
      h("button",{class:"btn",onclick:function(){X.P=null;X.sec="home";env.render();}},"ЭЕШ нүүр"),
      h("button",{class:"btn primary",onclick:function(){startPractice(P.sec);}},"Дахиад")));
  }

  /* ---------- нүүр ---------- */
  function viewHome(root){
    var lang=cur(),sj=subj(),S=stats(),all=items(lang),nMiss=wrongItems().length,dl=daysLeft();
    var tabs=h("div",{class:"seg",role:"group","aria-label":"ЭЕШ хичээл",style:"display:flex;gap:6px;margin-bottom:10px"});
    [["lang","🌍 "+NAME[env.lang()]],["mn","🇲🇳 Монгол хэл"]].forEach(function(t){
      var on=sj===t[0];
      tabs.append(h("button",{type:"button","aria-pressed":String(on),
        style:"flex:1;padding:10px;border-radius:12px;font-weight:700;border:"+(on?"2px solid var(--sky)":"1px solid var(--line)")+";background:"+(on?"var(--dune-2)":"var(--surface)")+";color:inherit",
        onclick:function(){if(on)return;env.sset("eeshSubj",t[0]==="mn"?"mn":null);env.render();}},t[1]));
    });
    root.append(tabs);
    root.append(h("div",{class:"note"},
      h("div",{style:"font-weight:800;font-size:18px"},"🎓 ЭЕШ · "+NAME[lang]),
      h("p",{style:"margin:6px 0 0"},DESC[sj]),
      h("ul",{style:"margin:8px 0 0;padding-left:20px"},TIPS[sj].map(function(x){return h("li",{style:"margin-top:4px"},x);}))));
    var inp=h("input",{type:"date",value:env.sget("eeshDate","")||"","aria-label":"ЭЕШ өгөх өдөр",style:"flex:none;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:inherit;font:inherit",
      onchange:function(e){env.sset("eeshDate",e.target.value||null);env.render();}});
    root.append(h("div",{class:"note",style:"display:flex;gap:10px;align-items:center;flex-wrap:wrap"},
      h("div",{style:"flex:1;min-width:160px"},dl==null?h("span",null,"📅 Шалгалтын өдрөө оруулбал хэдэн өдөр үлдсэнийг харуулна."):
        dl>0?h("span",null,"📅 ЭЕШ хүртэл ",h("b",{style:"font-size:20px"},dl)," өдөр"+(dl<=30?" — өдөр бүр 1 тест өгөөрэй!":"")):
        dl===0?h("b",null,"📅 Өнөөдөр ЭЕШ! Амжилт хүсье! 🍀"):h("span",{class:"muted"},"📅 Шалгалтын өдөр өнгөрсөн. Шинэ өдрөө оруулна уу.")),
      inp));
    var M=mix(),nT=ord().reduce(function(a,k){return k==="r"?a:a+Math.min(M[k],all.filter(function(it){return it.s===k;}).length);},0)+(READ[lang]||[]).slice(0,M.r).reduce(function(a,R){return a+R.q.length;},0);
    root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:startTest},"⏱ Загвар тест ("+nT+" асуулт · "+MIN+" мин)"+(S.best!=null?" · Шилдэг: "+S.best+"%":"")));
    root.append(h("p",{class:"muted small",style:"margin:6px 0 0"},"Тестийн үеэр хариуг харуулахгүй. Асуултуудын хооронд чөлөөтэй шилжиж, хариултаа өөрчилж болно."));
    if(nMiss)root.append(h("button",{class:"lrow",type:"button",style:"margin-top:14px",onclick:function(){startPractice("miss");}},
      h("span",{class:"hexb ico"},"🔁"),h("span",{style:"flex:1"},h("div",{class:"t"},"Алдсанаа давтах"),h("div",{class:"muted small"},nMiss+" асуулт · зөв хариулбал жагсаалтаас хасагдана")),h("span",{"aria-hidden":"true"},"›")));
    root.append(h("h3",{style:"margin:20px 0 8px"},"Хэсгээр дасгал"));
    ord().forEach(function(k){
      var n=all.filter(function(it){return it.s===k;}).length,s=S.s[k];
      root.append(h("button",{class:"lrow",type:"button",onclick:function(){startPractice(k);}},
        h("span",{class:"hexb ico"},SECI[k]),
        h("span",{style:"flex:1"},h("div",{class:"t"},SEC[k]),h("div",{class:"muted small"},(k==="r"?(READ[lang]||[]).length+" эх бичвэр · ":"")+n+" асуулт"+(s&&s[1]?" · Зөв "+Math.round(s[0]/s[1]*100)+"%":""))),
        h("span",{"aria-hidden":"true"},"›")));
    });
    if(S.log.length){
      root.append(h("p",{class:"muted small",style:"margin-top:18px"},"Сүүлийн загвар тестүүд"));
      S.log.slice(-5).reverse().forEach(function(r){root.append(h("div",{class:"srow"},h("span",null,r.d),h("span",{class:"big"},r.pct+"%")));});
    }
    root.append(h("p",{class:"muted small",style:"margin-top:18px"},"ℹ️ Эдгээр нь дасгал хийх зориулалттай, ЭЕШ-ийн хэлбэрийг дуурайлгасан асуултууд. Шалгалтын албан ёсны бүтэц, жишиг даалгаврыг Боловсролын үнэлгээний төвийн (eec.mn) мэдээллээс шалгаарай."));
  }

  window.Eesh={
    has:function(lang){return !!DATA[lang];},
    view:function(e){
      env=e;var root=h("div");
      if(X.lang!==cur()){if(X.T&&!X.T.done)env.clearTimer();X.lang=cur();X.sec="home";X.T=null;X.P=null;}
      if(X.sec==="test"&&X.T)viewTest(root);
      else if(X.sec==="prac"&&X.P)viewPractice(root);
      else viewHome(root);
      return root;
    }
  };
})();
