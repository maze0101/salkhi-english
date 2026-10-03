/* Салхи: гадаадад амьдрах нөхцөлүүд (AI ярианы дасгал) — эмнэлгийн яаралтай тусламж, цагдаа, банк, байр түрээс,
   визний алба, цагийн ажлын ярилцлага. Нөхцөл бүрт хэрэгтэй хэллэг, бичиг баримтын үгс.
   SCEN мөр: [id, гарчиг, AI-ийн дүр, горим]. Хэллэг: id|хэллэг|галиг|монгол утга */
(function(){
  var SCEN=[
    ["er","🚑 Яаралтай тусламж, эмнэлэг","a nurse at the emergency reception of a hospital abroad. The learner is a foreign resident who feels unwell or got hurt. Ask about symptoms, pain, allergies, insurance and ID one step at a time","adult"],
    ["police","👮 Цагдаад хандах","a police officer at a local police station. The learner is a foreign resident whose wallet or phone was stolen, or who needs to report a problem. Ask what happened, when, where, and for ID and contact details, one question at a time","adult"],
    ["bank","🏦 Банкинд данс нээх","a bank clerk helping a foreign resident open an account, get a card and send money home. Ask for documents (passport, residence card, address), explain forms and fees simply","adult"],
    ["rent","🏠 Байр түрээслэх","a real-estate agent showing an apartment to a foreign resident. Talk about rent, deposit, the contract period, utilities, rules of the building and when they can move in","adult"],
    ["visa","🛂 Виз, шилжилт хөдөлгөөний алба","an officer at the immigration office. The learner is a foreign resident extending a visa or residence card. Ask about the purpose of stay, employer or school, documents and address, one question at a time","adult"],
    ["jobint","💼 Цагийн ажлын ярилцлага","a manager interviewing a foreign applicant for a part-time job in a restaurant, factory or shop. Ask about experience, available days and hours, language ability, visa status and when they can start","adult"]
  ];
  var LV={er:"b1",police:"b1",bank:"b1",rent:"b1",visa:"b2",jobint:"a2"};
  var P={
en:`er|I need to see a doctor. It's urgent.||Надад эмчид үзүүлэх хэрэгтэй байна. Яаралтай.
er|It hurts here.||Энд өвдөж байна.
er|I have a high fever and a headache.||Би өндөр халуунтай, толгой өвдөж байна.
er|I'm allergic to penicillin.||Би пенициллинд харшилтай.
er|Here is my health insurance card.||Энэ миний эрүүл мэндийн даатгалын карт.
er|Can I get a prescription?||Жор бичүүлж болох уу?
er|Please call an ambulance!||Түргэн тусламж дуудаад өгөөч!
police|I'd like to report a theft.||Би хулгайн хэрэг мэдүүлмээр байна.
police|My wallet was stolen on the bus.||Автобусанд миний түрийвчийг хулгайлсан.
police|It happened about an hour ago.||Нэг цагийн өмнө болсон.
police|Can I get a police report for my insurance?||Даатгалдаа өгөх цагдаагийн тодорхойлолт авч болох уу?
police|I don't speak English well. Is there an interpreter?||Би англиар сайн ярьдаггүй. Орчуулагч байгаа юу?
police|Here is my passport and residence card.||Энэ миний паспорт, оршин суух үнэмлэх.
bank|I'd like to open a bank account.||Би банкны данс нээлгэмээр байна.
bank|What documents do I need?||Ямар бичиг баримт хэрэгтэй вэ?
bank|I want to send money to Mongolia.||Би Монгол руу мөнгө шилжүүлмээр байна.
bank|What is the fee for an international transfer?||Олон улсын шилжүүлгийн шимтгэл хэд вэ?
bank|I lost my bank card. Please block it.||Би банкны картаа гээчихлээ. Хаагаад өгөөч.
bank|I forgot my PIN.||Би пин кодоо мартчихлаа.
rent|How much is the rent per month?||Сарын түрээс хэд вэ?
rent|How much is the deposit?||Барьцаа мөнгө хэд вэ?
rent|Are utilities included?||Ус, цахилгааны төлбөр орсон уу?
rent|How long is the contract?||Гэрээ хэр удаан хугацаатай вэ?
rent|When can I move in?||Би хэзээ орж болох вэ?
rent|The heating doesn't work. Can you fix it?||Халаалт ажиллахгүй байна. Засаж өгөх үү?
visa|I'd like to extend my visa.||Би визээ сунгуулмаар байна.
visa|My residence card expires next month.||Миний оршин суух үнэмлэхний хугацаа ирэх сард дуусна.
visa|I work for a company here.||Би энд нэг компанид ажилладаг.
visa|Here is my employment contract.||Энэ миний хөдөлмөрийн гэрээ.
visa|How long does it take?||Хэр удаан хугацаа шаардлагатай вэ?
visa|Do I need to make an appointment?||Цаг захиалах шаардлагатай юу?
jobint|I'm interested in this part-time job.||Би энэ цагийн ажлыг сонирхож байна.
jobint|I can work on weekdays after 5 p.m.||Би ажлын өдрүүдэд оройн 5 цагаас хойш ажиллаж чадна.
jobint|I have experience working in a restaurant.||Би ресторанд ажиллаж байсан туршлагатай.
jobint|My visa allows me to work 20 hours a week.||Миний виз долоо хоногт 20 цаг ажиллахыг зөвшөөрдөг.
jobint|When can I start?||Би хэзээнээс ажиллаж эхлэх вэ?
jobint|How much is the hourly wage?||Цагийн цалин хэд вэ?`,
ko:`er|진료를 받고 싶어요. 급해요.|jillyoreul batgo sipeoyo. geuphaeyo.|Эмчид үзүүлмээр байна. Яаралтай.
er|여기가 아파요.|yeogiga apayo.|Энд өвдөж байна.
er|열이 많이 나고 머리가 아파요.|yeori mani nago meoriga apayo.|Халуун их байгаа, толгой өвдөж байна.
er|페니실린 알레르기가 있어요.|penisillin allereugiga isseoyo.|Пенициллинд харшилтай.
er|건강보험증 여기 있어요.|geongang boheomjeung yeogi isseoyo.|Эрүүл мэндийн даатгалын үнэмлэх энд байна.
er|처방전 받을 수 있어요?|cheobangjeon badeul su isseoyo?|Жор авч болох уу?
er|구급차를 불러 주세요!|gugeupchareul bulleo juseyo!|Түргэн тусламж дуудаад өгөөч!
police|도난 신고를 하고 싶어요.|donan singoreul hago sipeoyo.|Хулгайн хэрэг мэдүүлмээр байна.
police|버스에서 지갑을 도난당했어요.|beoseueseo jigabeul donandanghaesseoyo.|Автобусанд түрийвчээ хулгайд алдсан.
police|한 시간 전쯤에 일어났어요.|han sigan jeonjjeume ireonasseoyo.|Нэг цагийн өмнө болсон.
police|사건 사고 사실 확인원을 받을 수 있어요?|sageon sago sasil hwaginwoneul badeul su isseoyo?|Хэргийн тодорхойлолт авч болох уу?
police|통역사가 있어요?|tongyeoksaga isseoyo?|Орчуулагч байгаа юу?
police|여권하고 외국인등록증이에요.|yeogwonhago oegugin deungnokjeungieyo.|Энэ миний паспорт болон гадаадын иргэний үнэмлэх.
bank|통장을 만들고 싶어요.|tongjangeul mandeulgo sipeoyo.|Данс нээлгэмээр байна.
bank|어떤 서류가 필요해요?|eotteon seoryuga piryohaeyo?|Ямар бичиг баримт хэрэгтэй вэ?
bank|몽골로 송금하고 싶어요.|monggollo songgeumhago sipeoyo.|Монгол руу мөнгө шилжүүлмээр байна.
bank|해외 송금 수수료가 얼마예요?|haeoe songgeum susuryoga eolmayeyo?|Гадаад шилжүүлгийн шимтгэл хэд вэ?
bank|카드를 잃어버렸어요. 정지해 주세요.|kadeureul ireobeoryeosseoyo. jeongjihae juseyo.|Картаа гээчихлээ. Хаагаад өгөөч.
bank|비밀번호를 잊어버렸어요.|bimilbeonhoreul ijeobeoryeosseoyo.|Нууц үгээ мартчихлаа.
rent|월세가 얼마예요?|wolsega eolmayeyo?|Сарын түрээс хэд вэ?
rent|보증금이 얼마예요?|bojeunggeumi eolmayeyo?|Барьцаа мөнгө хэд вэ?
rent|관리비가 포함돼 있어요?|gwallibiga pohamdwae isseoyo?|Байрны үйлчилгээний төлбөр орсон уу?
rent|계약 기간이 얼마나 돼요?|gyeyak gigani eolmana dwaeyo?|Гэрээний хугацаа хэр вэ?
rent|언제 이사 올 수 있어요?|eonje isa ol su isseoyo?|Хэзээ нүүж орж болох вэ?
rent|보일러가 고장 났어요.|boilleoga gojang nasseoyo.|Халаагуур эвдэрчихсэн.
visa|비자를 연장하고 싶어요.|bijareul yeonjanghago sipeoyo.|Визээ сунгуулмаар байна.
visa|체류 기간이 다음 달에 끝나요.|cheryu gigani daeum dare kkeunnayo.|Оршин суух хугацаа ирэх сард дуусна.
visa|저는 회사에서 일해요.|jeoneun hoesaeseo ilhaeyo.|Би компанид ажилладаг.
visa|근로계약서 여기 있어요.|geullo gyeyakseo yeogi isseoyo.|Хөдөлмөрийн гэрээ энд байна.
visa|얼마나 걸려요?|eolmana geollyeoyo?|Хэр удах вэ?
visa|하이코리아에서 방문 예약을 해야 돼요?|haikoriaeseo bangmun yeyageul haeya dwaeyo?|HiKorea-аар цаг захиалах ёстой юу?
jobint|아르바이트에 지원하고 싶어요.|areubaiteue jiwonhago sipeoyo.|Цагийн ажилд өргөдөл гаргамаар байна.
jobint|평일 저녁 5시 이후에 일할 수 있어요.|pyeongil jeonyeok daseot si ihue ilhal su isseoyo.|Ажлын өдөр оройн 5 цагаас хойш ажиллаж чадна.
jobint|식당에서 일한 경험이 있어요.|sikdangeseo ilhan gyeongheomi isseoyo.|Хоолны газарт ажиллаж байсан туршлагатай.
jobint|일주일에 20시간 일할 수 있어요.|iljuire isip sigan ilhal su isseoyo.|Долоо хоногт 20 цаг ажиллаж чадна.
jobint|언제부터 일할 수 있어요?|eonjebuteo ilhal su isseoyo?|Хэзээнээс ажиллаж болох вэ?
jobint|시급이 얼마예요?|sigeubi eolmayeyo?|Цагийн цалин хэд вэ?`,
ja:`er|診察をお願いします。急いでいます。|shinsatsu o onegai shimasu. isoide imasu.|Эмчид үзүүлмээр байна. Яаралтай.
er|ここが痛いです。|koko ga itai desu.|Энд өвдөж байна.
er|熱が高くて、頭が痛いです。|netsu ga takakute, atama ga itai desu.|Халуун өндөр, толгой өвдөж байна.
er|ペニシリンのアレルギーがあります。|penishirin no arerugī ga arimasu.|Пенициллинд харшилтай.
er|保険証はこれです。|hokenshō wa kore desu.|Даатгалын үнэмлэх энэ байна.
er|処方箋をもらえますか。|shohōsen o moraemasu ka.|Жор авч болох уу?
er|救急車を呼んでください！|kyūkyūsha o yonde kudasai!|Түргэн тусламж дуудаад өгөөч!
police|盗難届を出したいです。|tōnan todoke o dashitai desu.|Хулгайн мэдүүлэг гаргамаар байна.
police|バスで財布を盗まれました。|basu de saifu o nusumaremashita.|Автобусанд түрийвчээ хулгайлуулсан.
police|一時間ぐらい前です。|ichijikan gurai mae desu.|Нэг цаг орчмын өмнө.
police|受理番号を教えてください。|juri bangō o oshiete kudasai.|Хүлээн авсан дугаарыг хэлж өгнө үү.
police|通訳の人はいますか。|tsūyaku no hito wa imasu ka.|Орчуулагч байгаа юу?
police|パスポートと在留カードです。|pasupōto to zairyū kādo desu.|Паспорт болон оршин суугчийн карт.
bank|口座を開きたいです。|kōza o hirakitai desu.|Данс нээлгэмээр байна.
bank|何が必要ですか。|nani ga hitsuyō desu ka.|Юу хэрэгтэй вэ?
bank|モンゴルに送金したいです。|mongoru ni sōkin shitai desu.|Монгол руу мөнгө шилжүүлмээр байна.
bank|海外送金の手数料はいくらですか。|kaigai sōkin no tesūryō wa ikura desu ka.|Гадаад шилжүүлгийн шимтгэл хэд вэ?
bank|キャッシュカードをなくしました。止めてください。|kyasshu kādo o nakushimashita. tomete kudasai.|Картаа гээчихлээ. Хаагаад өгөөч.
bank|暗証番号を忘れました。|anshō bangō o wasuremashita.|Пин кодоо мартчихлаа.
rent|家賃はいくらですか。|yachin wa ikura desu ka.|Түрээс хэд вэ?
rent|敷金と礼金はいくらですか。|shikikin to reikin wa ikura desu ka.|Барьцаа болон талархлын мөнгө хэд вэ?
rent|管理費は含まれていますか。|kanrihi wa fukumarete imasu ka.|Байрны үйлчилгээний төлбөр орсон уу?
rent|契約期間はどのくらいですか。|keiyaku kikan wa dono kurai desu ka.|Гэрээний хугацаа хэр вэ?
rent|いつから入居できますか。|itsu kara nyūkyo dekimasu ka.|Хэзээнээс орж болох вэ?
rent|お湯が出ません。直してもらえますか。|oyu ga demasen. naoshite moraemasu ka.|Халуун ус гарахгүй байна. Засаж өгөх үү?
visa|在留期間を更新したいです。|zairyū kikan o kōshin shitai desu.|Оршин суух хугацаагаа сунгуулмаар байна.
visa|在留カードの期限が来月までです。|zairyū kādo no kigen ga raigetsu made desu.|Картын хугацаа ирэх сар хүртэл.
visa|会社で働いています。|kaisha de hataraite imasu.|Компанид ажилладаг.
visa|雇用契約書を持ってきました。|koyō keiyakusho o motte kimashita.|Хөдөлмөрийн гэрээгээ авчирсан.
visa|どのくらいかかりますか。|dono kurai kakarimasu ka.|Хэр удах вэ?
visa|予約が必要ですか。|yoyaku ga hitsuyō desu ka.|Цаг захиалах шаардлагатай юу?
jobint|アルバイトに応募したいです。|arubaito ni ōbo shitai desu.|Цагийн ажилд өргөдөл гаргамаар байна.
jobint|平日の夕方5時から働けます。|heijitsu no yūgata goji kara hatarakemasu.|Ажлын өдөр оройн 5 цагаас ажиллаж чадна.
jobint|レストランで働いた経験があります。|resutoran de hataraita keiken ga arimasu.|Ресторанд ажилласан туршлагатай.
jobint|資格外活動許可を持っています。|shikakugai katsudō kyoka o motte imasu.|Ажиллах зөвшөөрөлтэй (оюутан).
jobint|いつから働けますか。|itsu kara hatarakemasu ka.|Хэзээнээс ажиллаж болох вэ?
jobint|時給はいくらですか。|jikyū wa ikura desu ka.|Цагийн цалин хэд вэ?`,
zh:`er|我要看急诊。|wǒ yào kàn jízhěn.|Би яаралтай тусламжид үзүүлмээр байна.
er|我这里疼。|wǒ zhèlǐ téng.|Энд өвдөж байна.
er|我发高烧，头疼。|wǒ fā gāoshāo, tóu téng.|Өндөр халуунтай, толгой өвдөж байна.
er|我对青霉素过敏。|wǒ duì qīngméisù guòmǐn.|Пенициллинд харшилтай.
er|这是我的医保卡。|zhè shì wǒ de yībǎo kǎ.|Энэ миний эмнэлгийн даатгалын карт.
er|可以给我开药吗？|kěyǐ gěi wǒ kāi yào ma?|Эм бичиж өгөх үү?
er|请叫救护车！|qǐng jiào jiùhùchē!|Түргэн тусламж дуудаач!
police|我要报案。|wǒ yào bào'àn.|Хэрэг мэдүүлмээр байна.
police|我的钱包在公交车上被偷了。|wǒ de qiánbāo zài gōngjiāochē shàng bèi tōu le.|Автобусанд түрийвчийг минь хулгайлсан.
police|大概一个小时以前。|dàgài yí ge xiǎoshí yǐqián.|Ойролцоогоор нэг цагийн өмнө.
police|可以给我开一个报案证明吗？|kěyǐ gěi wǒ kāi yí ge bào'àn zhèngmíng ma?|Хэрэг мэдүүлсэн тодорхойлолт гаргаж өгөх үү?
police|有翻译吗？|yǒu fānyì ma?|Орчуулагч байгаа юу?
police|这是我的护照和居留许可。|zhè shì wǒ de hùzhào hé jūliú xǔkě.|Энэ миний паспорт, оршин суух зөвшөөрөл.
bank|我想开一个银行账户。|wǒ xiǎng kāi yí ge yínháng zhànghù.|Банкны данс нээлгэмээр байна.
bank|需要什么证件？|xūyào shénme zhèngjiàn?|Ямар бичиг баримт хэрэгтэй вэ?
bank|我想往蒙古汇款。|wǒ xiǎng wǎng Měnggǔ huìkuǎn.|Монгол руу мөнгө шилжүүлмээр байна.
bank|国际汇款的手续费是多少？|guójì huìkuǎn de shǒuxùfèi shì duōshao?|Олон улсын шилжүүлгийн шимтгэл хэд вэ?
bank|我的银行卡丢了，请帮我挂失。|wǒ de yínhángkǎ diū le, qǐng bāng wǒ guàshī.|Картаа гээчихлээ, хаагаад өгөөч.
bank|我忘了密码。|wǒ wàng le mìmǎ.|Нууц кодоо мартчихлаа.
rent|房租一个月多少钱？|fángzū yí ge yuè duōshao qián?|Сарын түрээс хэд вэ?
rent|押金是多少？|yājīn shì duōshao?|Барьцаа мөнгө хэд вэ?
rent|水电费包括在内吗？|shuǐdiànfèi bāokuò zài nèi ma?|Ус, цахилгааны төлбөр орсон уу?
rent|合同签多长时间？|hétong qiān duō cháng shíjiān?|Гэрээг хэр хугацаагаар хийх вэ?
rent|什么时候可以搬进来？|shénme shíhou kěyǐ bān jìnlái?|Хэзээ нүүж орж болох вэ?
rent|暖气坏了，能修一下吗？|nuǎnqì huài le, néng xiū yíxià ma?|Халаалт эвдэрчихлээ, засаж өгөх үү?
visa|我想延长签证。|wǒ xiǎng yáncháng qiānzhèng.|Визээ сунгуулмаар байна.
visa|我的居留许可下个月到期。|wǒ de jūliú xǔkě xià ge yuè dàoqī.|Оршин суух зөвшөөрөл ирэх сард дуусна.
visa|我在一家公司工作。|wǒ zài yì jiā gōngsī gōngzuò.|Би нэг компанид ажилладаг.
visa|这是我的劳动合同。|zhè shì wǒ de láodòng hétong.|Энэ миний хөдөлмөрийн гэрээ.
visa|需要多长时间？|xūyào duō cháng shíjiān?|Хэр удах вэ?
visa|需要预约吗？|xūyào yùyuē ma?|Цаг захиалах хэрэгтэй юу?
jobint|我想应聘这个兼职。|wǒ xiǎng yìngpìn zhège jiānzhí.|Энэ цагийн ажилд орохыг хүсч байна.
jobint|我工作日下午五点以后可以上班。|wǒ gōngzuòrì xiàwǔ wǔ diǎn yǐhòu kěyǐ shàngbān.|Ажлын өдөр 5 цагаас хойш ажиллаж чадна.
jobint|我在饭店工作过。|wǒ zài fàndiàn gōngzuò guo.|Ресторанд ажиллаж байсан.
jobint|我会说一点儿中文。|wǒ huì shuō yìdiǎnr Zhōngwén.|Би хятадаар бага зэрэг ярьдаг.
jobint|我什么时候可以开始上班？|wǒ shénme shíhou kěyǐ kāishǐ shàngbān?|Хэзээнээс ажиллаж эхлэх вэ?
jobint|时薪是多少？|shíxīn shì duōshao?|Цагийн цалин хэд вэ?`,
ru:`er|Мне нужен врач. Это срочно.||Надад эмч хэрэгтэй. Яаралтай.
er|У меня болит здесь.||Энд өвдөж байна.
er|У меня высокая температура и болит голова.||Өндөр халуунтай, толгой өвдөж байна.
er|У меня аллергия на пенициллин.||Пенициллинд харшилтай.
er|Вот мой полис медицинского страхования.||Энэ миний эрүүл мэндийн даатгалын гэрчилгээ.
er|Можно мне рецепт?||Жор авч болох уу?
er|Вызовите скорую помощь!||Түргэн тусламж дуудаарай!
police|Я хочу заявить о краже.||Хулгайн хэрэг мэдүүлмээр байна.
police|У меня украли кошелёк в автобусе.||Автобусанд түрийвчийг минь хулгайлсан.
police|Это случилось около часа назад.||Ойролцоогоор нэг цагийн өмнө болсон.
police|Можно получить справку для страховой?||Даатгалд өгөх тодорхойлолт авч болох уу?
police|Мне нужен переводчик.||Надад орчуулагч хэрэгтэй.
police|Вот мой паспорт и миграционная карта.||Энэ миний паспорт, шилжилт хөдөлгөөний карт.
bank|Я хочу открыть счёт.||Данс нээлгэмээр байна.
bank|Какие документы нужны?||Ямар бичиг баримт хэрэгтэй вэ?
bank|Я хочу перевести деньги в Монголию.||Монгол руу мөнгө шилжүүлмээр байна.
bank|Какая комиссия за международный перевод?||Олон улсын шилжүүлгийн шимтгэл хэд вэ?
bank|Я потерял карту. Заблокируйте её, пожалуйста.||Картаа гээчихлээ. Хаагаад өгөөч.
bank|Я забыл ПИН-код.||Пин кодоо мартчихлаа.
rent|Сколько стоит аренда в месяц?||Сарын түрээс хэд вэ?
rent|Какой залог?||Барьцаа хэд вэ?
rent|Коммунальные услуги включены?||Орон сууцны төлбөр орсон уу?
rent|На какой срок договор?||Гэрээ ямар хугацаатай вэ?
rent|Когда можно въехать?||Хэзээ орж болох вэ?
rent|Не работает отопление. Можете починить?||Халаалт ажиллахгүй байна. Засаж өгөх үү?
visa|Я хочу продлить визу.||Визээ сунгуулмаар байна.
visa|Срок моей регистрации заканчивается в следующем месяце.||Бүртгэлийн хугацаа ирэх сард дуусна.
visa|Я работаю в компании.||Би компанид ажилладаг.
visa|Вот мой трудовой договор.||Энэ миний хөдөлмөрийн гэрээ.
visa|Сколько времени это займёт?||Хэр удах вэ?
visa|Нужно записаться заранее?||Урьдчилж цаг авах хэрэгтэй юу?
jobint|Я хочу устроиться на подработку.||Цагийн ажилд ормоор байна.
jobint|Я могу работать по будням после пяти.||Ажлын өдөр таван цагаас хойш ажиллаж чадна.
jobint|У меня есть опыт работы в ресторане.||Ресторанд ажилласан туршлагатай.
jobint|У меня есть патент на работу.||Ажиллах патенттай.
jobint|Когда я могу начать?||Хэзээнээс эхэлж болох вэ?
jobint|Какая оплата в час?||Цагийн цалин хэд вэ?`,
de:`er|Ich brauche einen Arzt. Es ist dringend.||Надад эмч хэрэгтэй. Яаралтай.
er|Es tut hier weh.||Энд өвдөж байна.
er|Ich habe hohes Fieber und Kopfschmerzen.||Өндөр халуунтай, толгой өвдөж байна.
er|Ich bin allergisch gegen Penicillin.||Пенициллинд харшилтай.
er|Hier ist meine Versichertenkarte.||Энэ миний даатгалын карт.
er|Kann ich ein Rezept bekommen?||Жор авч болох уу?
er|Rufen Sie bitte einen Krankenwagen!||Түргэн тусламж дуудаач!
police|Ich möchte einen Diebstahl anzeigen.||Хулгайн хэрэг мэдүүлмээр байна.
police|Mein Geldbeutel wurde im Bus gestohlen.||Автобусанд түрийвчийг минь хулгайлсан.
police|Das war vor etwa einer Stunde.||Ойролцоогоор нэг цагийн өмнө болсон.
police|Kann ich eine Bescheinigung für die Versicherung bekommen?||Даатгалд өгөх тодорхойлолт авч болох уу?
police|Gibt es einen Dolmetscher?||Орчуулагч байгаа юу?
police|Hier sind mein Pass und mein Aufenthaltstitel.||Энэ миний паспорт, оршин суух зөвшөөрөл.
bank|Ich möchte ein Konto eröffnen.||Данс нээлгэмээр байна.
bank|Welche Unterlagen brauche ich?||Ямар бичиг баримт хэрэгтэй вэ?
bank|Ich möchte Geld in die Mongolei überweisen.||Монгол руу мөнгө шилжүүлмээр байна.
bank|Wie hoch ist die Gebühr für eine Auslandsüberweisung?||Гадаад шилжүүлгийн шимтгэл хэд вэ?
bank|Ich habe meine Karte verloren. Bitte sperren Sie sie.||Картаа гээчихлээ. Хаагаад өгөөч.
bank|Ich habe meine PIN vergessen.||Пин кодоо мартчихлаа.
rent|Wie hoch ist die Miete im Monat?||Сарын түрээс хэд вэ?
rent|Wie hoch ist die Kaution?||Барьцаа хэд вэ?
rent|Sind die Nebenkosten inklusive?||Нэмэлт төлбөр (ус, халаалт) орсон уу?
rent|Wie lange läuft der Mietvertrag?||Түрээсийн гэрээ хэр хугацаатай вэ?
rent|Wann kann ich einziehen?||Хэзээ нүүж орж болох вэ?
rent|Die Heizung funktioniert nicht.||Халаалт ажиллахгүй байна.
visa|Ich möchte mein Visum verlängern.||Визээ сунгуулмаар байна.
visa|Mein Aufenthaltstitel läuft nächsten Monat ab.||Оршин суух зөвшөөрлийн хугацаа ирэх сард дуусна.
visa|Ich arbeite bei einer Firma hier.||Би энд нэг компанид ажилладаг.
visa|Hier ist mein Arbeitsvertrag.||Энэ миний хөдөлмөрийн гэрээ.
visa|Wie lange dauert das?||Хэр удах вэ?
visa|Brauche ich einen Termin?||Цаг товлох хэрэгтэй юу?
jobint|Ich interessiere mich für den Minijob.||Би энэ цагийн ажлыг сонирхож байна.
jobint|Ich kann werktags ab 17 Uhr arbeiten.||Ажлын өдөр 17 цагаас ажиллаж чадна.
jobint|Ich habe Erfahrung in der Gastronomie.||Хоолны газарт ажилласан туршлагатай.
jobint|Ich darf 20 Stunden pro Woche arbeiten.||Долоо хоногт 20 цаг ажиллах эрхтэй.
jobint|Wann kann ich anfangen?||Хэзээнээс эхэлж болох вэ?
jobint|Wie hoch ist der Stundenlohn?||Цагийн цалин хэд вэ?`
  };
  function phrases(lang,id){
    return String(P[lang]||"").split("\n").map(function(r){return r.split("|");}).filter(function(r){return r[0]===id&&r.length>=4;})
      .map(function(r){return {t:r[1],r:r[2],mn:r[3]};});
  }
  window.ABROAD={scen:SCEN,lv:LV,phrases:phrases,ids:SCEN.map(function(s){return s[0];})};
})();
