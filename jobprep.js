/* Салхи: гадаадад ажиллахад бэлтгэх — Солонгосын EPS-TOPIK, Японы 特定技能 (JFT-Basic), англи (IELTS General/OET),
   хятад (HSK, худалдаа/тээвэр), орос (патентын шалгалт), герман (Goethe B1, Pflege).
   Ажлын байрны үгс сэдвээр + 20 асуулттай загвар шалгалт. Мөр: сэдэв|үг|галиг|монгол утга|эможи */
(function(){
  var CATS={
    safe:"🦺 Аюулгүй ажиллагаа",tool:"🔧 Багаж хэрэгсэл",fact:"🏭 Үйлдвэр",build:"🏗️ Барилга",farm:"🌾 Хөдөө аж ахуй",
    care:"🦽 Асаргаа",food:"🍽️ Хоол, зочид буудал",trade:"🛒 Худалдаа",trans:"🚚 Тээвэр, логистик",law:"⚖️ Бичиг баримт, хууль",talk:"💬 Ажлын яриа",money:"📄 Цалин, гэрээ, амьдрал",health:"🏥 Эрүүл мэнд"
  };
  var DATA={
ko:`safe|안전모|anjeonmo|Хамгаалалтын малгай|⛑️
safe|안전화|anjeonhwa|Хамгаалалтын гутал|🥾
safe|장갑|janggap|Бээлий|🧤
safe|마스크|maseukeu|Амны хаалт|😷
safe|보안경|boangyeong|Хамгаалалтын нүдний шил|🥽
safe|소화기|sohwagi|Гал унтраагуур|🧯
safe|비상구|bisanggu|Яаралтай гарц|🚪
safe|금연|geumyeon|Тамхи татахыг хориглоно|🚭
safe|출입금지|churip geumji|Орохыг хориглоно|⛔
safe|위험|wiheom|Аюултай|⚠️
safe|화재|hwajae|Гал түймэр|🔥
safe|감전 주의|gamjeon juui|Цахилгаанд цохиулахаас болгоомжил|⚡
safe|낙하물 주의|nakhamul juui|Дээрээс унах зүйлээс болгоомжил|🪨
safe|응급처치|eunggeup cheochi|Анхны тусламж|🩹
tool|망치|mangchi|Алх|🔨
tool|드라이버|deuraibeo|Халив|🪛
tool|톱|top|Хөрөө|🪚
tool|사다리|sadari|Шат|🪜
tool|렌치|renchi|Гайкны түлхүүр|🔧
tool|줄자|julja|Метр хэмжүүр|📏
tool|가위|gawi|Хайч|✂️
tool|못|mot|Хадаас|📌
tool|손수레|sonsure|Гар тэрэг|🛒
fact|공장|gongjang|Үйлдвэр|🏭
fact|기계|gigye|Машин, тоног төхөөрөмж|⚙️
fact|지게차|jigecha|Сэрээт ачигч|🚜
fact|상자|sangja|Хайрцаг|📦
fact|포장|pojang|Савлах|🎁
fact|불량품|bullyangpum|Гологдол бүтээгдэхүүн|❌
fact|창고|changgo|Агуулах|🏬
fact|재료|jaeryo|Материал, түүхий эд|🧱
fact|조립|jorip|Угсрах|🔩
fact|용접|yongjeop|Гагнах|👨‍🏭
build|공사장|gongsajang|Барилгын талбай|🏗️
build|벽돌|byeokdol|Тоосго|🧱
build|시멘트|siment|Цемент|🪣
build|나무|namu|Мод, банз|🪵
build|철근|cheolgeun|Арматур|🔩
farm|농장|nongjang|Ферм|🚜
farm|비닐하우스|binil hauseu|Хүлэмж|🌱
farm|소|so|Үхэр|🐄
farm|돼지|dwaeji|Гахай|🐖
farm|닭|dak|Тахиа|🐔
farm|수확|suhwak|Ургац хураах|🌾
talk|알겠습니다|algetseumnida|Ойлголоо|👌
talk|다시 한번 말씀해 주세요|dasi hanbeon malsseumhae juseyo|Дахиад нэг хэлээд өгөөч|🔁
talk|도와주세요|dowa juseyo|Туслаач|🆘
talk|다쳤어요|dachyeosseoyo|Би гэмтчихлээ|🤕
talk|쉬는 시간|swineun sigan|Завсарлага|☕
talk|출근|chulgeun|Ажилдаа ирэх|🌅
talk|퇴근|toegeun|Ажлаасаа тарах|🌇
talk|야근|yageun|Шөнийн илүү цагийн ажил|🌙
talk|잔업|janeop|Илүү цагийн ажил|⏰
talk|반장님|banjangnim|Багийн ахлагч|👷
talk|사장님|sajangnim|Захирал, эзэн|👔
talk|동료|dongnyo|Хамт ажиллагч|🤝
talk|수고하셨습니다|sugohasyeotseumnida|Ажилласанд баярлалаа|🙏
talk|죄송합니다|joesonghamnida|Уучлаарай|🙇
money|월급|wolgeup|Сарын цалин|💰
money|계약서|gyeyakseo|Гэрээ|📄
money|외국인등록증|oegugin deungnokjeung|Гадаадын иргэний үнэмлэх|🪪
money|휴가|hyuga|Амралт|🏖️
money|기숙사|gisuksa|Дотуур байр|🏠
money|보험|boheom|Даатгал|🛡️
money|통장|tongjang|Банкны дэвтэр, данс|🏦
health|병원|byeongwon|Эмнэлэг|🏥
health|약|yak|Эм|💊
health|아파요|apayo|Өвдөж байна|🤒
health|구급차|gugeupcha|Түргэн тусламжийн машин|🚑`,
ja:`safe|危険|kiken|Аюултай|⚠️
safe|立入禁止|tachiiri kinshi|Орохыг хориглоно|⛔
safe|非常口|hijouguchi|Яаралтай гарц|🚪
safe|消火器|shoukaki|Гал унтраагуур|🧯
safe|禁煙|kin'en|Тамхи татахыг хориглоно|🚭
safe|ヘルメット|herumetto|Хамгаалалтын малгай|⛑️
safe|手袋|tebukuro|Бээлий|🧤
safe|安全靴|anzengutsu|Хамгаалалтын гутал|🥾
safe|火事|kaji|Гал түймэр|🔥
safe|地震|jishin|Газар хөдлөлт|🌏
safe|避難|hinan|Аюулаас зугтах, нүүлгэн шилжүүлэх|🏃
care|車いす|kurumaisu|Тэргэнцэр|🦽
care|食事介助|shokuji kaijo|Хооллоход туслах|🍽️
care|入浴|nyuuyoku|Усанд оруулах|🛁
care|着替え|kigae|Хувцас солих|👕
care|体温|taion|Биеийн халуун|🌡️
care|血圧|ketsuatsu|Цусны даралт|🩺
care|利用者|riyousha|Үйлчлүүлэгч (асрамжийн)|👵
care|転倒|tentou|Унах, хөл алдах|🤕
food|いらっしゃいませ|irasshaimase|Тавтай морилно уу|🙇
food|ご注文はお決まりですか|gochuumon wa okimari desu ka|Захиалгаа шийдсэн үү?|📝
food|少々お待ちください|shoushou omachi kudasai|Түр хүлээнэ үү|⏳
food|手洗い|tearai|Гар угаах|🧼
food|消毒|shoudoku|Ариутгал|🧴
food|賞味期限|shoumi kigen|Хэрэглэх хугацаа|📅
food|冷蔵庫|reizouko|Хөргөгч|🧊
food|包丁|houchou|Гал тогооны хутга|🔪
food|お会計|okaikei|Тооцоо|🧾
talk|おはようございます|ohayou gozaimasu|Өглөөний мэнд|🌅
talk|お疲れ様です|otsukaresama desu|Ажилласанд баярлалаа|🙏
talk|申し訳ございません|moushiwake gozaimasen|Маш их уучлаарай|🙇
talk|かしこまりました|kashikomarimashita|Ойлголоо (хүндэтгэлтэй)|👌
talk|もう一度お願いします|mou ichido onegaishimasu|Дахиад нэг хэлээд өгөөч|🔁
talk|報告|houkoku|Тайлагнах|📢
talk|連絡|renraku|Мэдэгдэх, холбогдох|📞
talk|相談|soudan|Зөвлөлдөх|💬
talk|残業|zangyou|Илүү цагийн ажил|⏰
talk|休憩|kyuukei|Завсарлага|☕
talk|遅刻|chikoku|Хоцрох|🏃
talk|上司|joushi|Удирдлага, дарга|👔
talk|先輩|senpai|Ахлах ажилтан|🧑‍💼
money|給料|kyuuryou|Цалин|💰
money|寮|ryou|Дотуур байр|🏠
money|在留カード|zairyuu kaado|Оршин суугчийн карт|🪪
money|契約|keiyaku|Гэрээ|📄
money|保険|hoken|Даатгал|🛡️
money|銀行口座|ginkou kouza|Банкны данс|🏦
health|病院|byouin|Эмнэлэг|🏥
health|薬|kusuri|Эм|💊
health|けがをしました|kega o shimashita|Би гэмтчихлээ|🤕
health|気分が悪いです|kibun ga warui desu|Биеийн байдал муу байна|🤒
health|救急車|kyuukyuusha|Түргэн тусламжийн машин|🚑`,
en:`safe|Danger||Аюултай|⚠️
safe|No entry||Орохыг хориглоно|⛔
safe|Emergency exit||Яаралтай гарц|🚪
safe|Fire extinguisher||Гал унтраагуур|🧯
safe|No smoking||Тамхи татахыг хориглоно|🚭
safe|Hard hat||Хамгаалалтын малгай|⛑️
safe|Safety boots||Хамгаалалтын гутал|🥾
safe|Gloves||Бээлий|🧤
safe|Caution: wet floor||Болгоомжил, шал нойтон|💧
safe|First aid||Анхны тусламж|🩹
safe|High voltage||Өндөр хүчдэл|⚡
tool|hammer||Алх|🔨
tool|screwdriver||Халив|🪛
tool|saw||Хөрөө|🪚
tool|ladder||Шат|🪜
tool|wrench||Гайкны түлхүүр|🔧
tool|tape measure||Метр хэмжүүр|📏
food|Can I take your order?||Захиалгаа өгөх үү?|📝
food|Here is your bill.||Таны тооцоо энэ байна.|🧾
food|Wash your hands||Гараа угаа|🧼
food|kitchen||Гал тогоо|🍳
food|housekeeping||Өрөө цэвэрлэгээ|🛏️
food|check-in||Зочид буудалд бүртгүүлэх|🏨
care|patient||Өвчтөн|🛌
care|wheelchair||Тэргэнцэр|🦽
care|blood pressure||Цусны даралт|🩺
care|medicine||Эм|💊
care|to bathe someone||Усанд оруулах|🛁
talk|I understand.||Ойлголоо.|👌
talk|Could you repeat that, please?||Дахин хэлж өгнө үү?|🔁
talk|I need help.||Надад тусламж хэрэгтэй.|🆘
talk|Sorry, I'm late.||Уучлаарай, хоцорчихлоо.|🏃
talk|break||Завсарлага|☕
talk|shift||Ээлж|🕘
talk|overtime||Илүү цагийн ажил|⏰
talk|manager||Менежер, дарга|👔
talk|coworker||Хамт ажиллагч|🤝
talk|I finished the task.||Даалгавраа дуусгалаа.|✅
money|salary||Цалин|💰
money|contract||Гэрээ|📄
money|work permit||Ажлын зөвшөөрөл|🪪
money|day off||Амралтын өдөр|🏖️
money|bank account||Банкны данс|🏦
money|insurance||Даатгал|🛡️
money|payslip||Цалингийн хуудас|🧾
health|hospital||Эмнэлэг|🏥
health|I'm hurt.||Би гэмтчихлээ.|🤕
health|I feel sick.||Миний бие муу байна.|🤒
health|ambulance||Түргэн тусламжийн машин|🚑`,
zh:`safe|危险|wēixiǎn|Аюултай|⚠️
safe|禁止入内|jìnzhǐ rùnèi|Орохыг хориглоно|⛔
safe|安全出口|ānquán chūkǒu|Яаралтай гарц|🚪
safe|灭火器|mièhuǒqì|Гал унтраагуур|🧯
safe|禁止吸烟|jìnzhǐ xīyān|Тамхи татахыг хориглоно|🚭
safe|安全帽|ānquánmào|Хамгаалалтын малгай|⛑️
safe|手套|shǒutào|Бээлий|🧤
safe|小心地滑|xiǎoxīn dì huá|Болгоомжил, шал хальтиргаатай|💧
trade|价格|jiàgé|Үнэ|🏷️
trade|便宜|piányi|Хямд|💸
trade|贵|guì|Үнэтэй|💎
trade|打折|dǎzhé|Хөнгөлөлт|🔖
trade|样品|yàngpǐn|Дээж, загвар|🧪
trade|订货|dìnghuò|Бараа захиалах|📝
trade|质量|zhìliàng|Чанар|✅
trade|批发|pīfā|Бөөний худалдаа|📦
trade|发票|fāpiào|Нэхэмжлэх, баримт|🧾
trade|合同|hétong|Гэрээ|📄
trade|付款|fùkuǎn|Төлбөр төлөх|💳
trans|仓库|cāngkù|Агуулах|🏬
trans|货物|huòwù|Ачаа, бараа|📦
trans|卡车|kǎchē|Ачааны машин|🚚
trans|司机|sījī|Жолооч|🚗
trans|海关|hǎiguān|Гааль|🛃
trans|发货|fāhuò|Бараа илгээх|📤
trans|到货|dàohuò|Бараа ирэх|📥
trans|集装箱|jízhuāngxiāng|Чингэлэг|🚢
trans|口岸|kǒu'àn|Хилийн боомт|🛂
talk|明白了|míngbai le|Ойлголоо|👌
talk|请再说一遍|qǐng zài shuō yí biàn|Дахин хэлж өгнө үү|🔁
talk|请帮帮我|qǐng bāngbang wǒ|Туслаач|🆘
talk|老板|lǎobǎn|Эзэн, дарга|👔
talk|同事|tóngshì|Хамт ажиллагч|🤝
talk|加班|jiābān|Илүү цагаар ажиллах|⏰
talk|休息|xiūxi|Амрах, завсарлага|☕
talk|上班|shàngbān|Ажилдаа явах|🌅
talk|下班|xiàbān|Ажлаасаа тарах|🌇
talk|辛苦了|xīnkǔ le|Ажилласанд баярлалаа|🙏
money|工资|gōngzī|Цалин|💰
money|签证|qiānzhèng|Виз|🪪
money|工作许可|gōngzuò xǔkě|Ажлын зөвшөөрөл|📋
money|银行卡|yínhángkǎ|Банкны карт|💳
money|宿舍|sùshè|Дотуур байр|🏠
money|护照|hùzhào|Гадаад паспорт|🛂
health|医院|yīyuàn|Эмнэлэг|🏥
health|我受伤了|wǒ shòushāng le|Би гэмтчихлээ|🤕
health|我不舒服|wǒ bù shūfu|Миний бие тавгүй байна|🤒
health|救护车|jiùhùchē|Түргэн тусламжийн машин|🚑`,
ru:`safe|Опасно||Аюултай|⚠️
safe|Вход воспрещён||Орохыг хориглоно|⛔
safe|Запасный выход||Нөөц гарц|🚪
safe|Огнетушитель||Гал унтраагуур|🧯
safe|Не курить||Тамхи татахыг хориглоно|🚭
safe|Каска||Хамгаалалтын малгай|⛑️
safe|Перчатки||Бээлий|🧤
safe|Осторожно, высокое напряжение||Болгоомжил, өндөр хүчдэл|⚡
safe|Аптечка||Анхны тусламжийн хайрцаг|🩹
build|стройка||Барилгын талбай|🏗️
build|кирпич||Тоосго|🧱
build|цемент||Цемент|🪣
build|доска||Банз|🪵
build|молоток||Алх|🔨
build|лестница||Шат|🪜
law|патент||Патент (ажлын зөвшөөрөл)|📋
law|миграционная карта||Цагаачлалын карт|🪪
law|регистрация||Оршин суугаа газрын бүртгэл|🏠
law|паспорт||Паспорт|🛂
law|трудовой договор||Хөдөлмөрийн гэрээ|📄
law|медицинский полис||Эрүүл мэндийн даатгал|🛡️
law|штраф||Торгууль|💸
law|налог||Татвар|🧾
talk|Понятно.||Ойлголоо.|👌
talk|Повторите, пожалуйста.||Дахин хэлж өгнө үү.|🔁
talk|Помогите!||Туслаарай!|🆘
talk|Извините, я опоздал.||Уучлаарай, би хоцорчихлоо.|🏃
talk|перерыв||Завсарлага|☕
talk|смена||Ээлж|🕘
talk|начальник||Дарга|👔
talk|коллега||Хамт ажиллагч|🤝
talk|выходной||Амралтын өдөр|🏖️
money|зарплата||Цалин|💰
money|общежитие||Дотуур байр|🏠
money|банковская карта||Банкны карт|💳
health|больница||Эмнэлэг|🏥
health|Я поранился.||Би гэмтчихлээ.|🤕
health|Мне плохо.||Миний бие муу байна.|🤒
health|скорая помощь||Түргэн тусламж|🚑`,
de:`safe|Gefahr||Аюул|⚠️
safe|Zutritt verboten||Орохыг хориглоно|⛔
safe|Notausgang||Яаралтай гарц|🚪
safe|Feuerlöscher||Гал унтраагуур|🧯
safe|Rauchen verboten||Тамхи татахыг хориглоно|🚭
safe|Schutzhelm||Хамгаалалтын малгай|⛑️
safe|Handschuhe||Бээлий|🧤
safe|Erste Hilfe||Анхны тусламж|🩹
care|der Patient||Өвчтөн|🛌
care|der Rollstuhl||Тэргэнцэр|🦽
care|der Blutdruck||Цусны даралт|🩺
care|das Medikament||Эм|💊
care|waschen||Угаах (хүнийг)|🛁
care|die Pflegekraft||Асрагч, сувилагч|🧑‍⚕️
care|der Notfall||Яаралтай тохиолдол|🚨
care|das Fieber||Халуурал|🌡️
food|Was darf es sein?||Юу авах вэ?|📝
food|die Rechnung||Тооцоо|🧾
food|Hände waschen||Гараа угаах|🧼
food|die Küche||Гал тогоо|🍳
food|der Kühlschrank||Хөргөгч|🧊
talk|Verstanden.||Ойлголоо.|👌
talk|Können Sie das bitte wiederholen?||Дахин хэлж өгнө үү?|🔁
talk|Ich brauche Hilfe.||Надад тусламж хэрэгтэй.|🆘
talk|Entschuldigung, ich bin zu spät.||Уучлаарай, хоцорчихлоо.|🏃
talk|die Pause||Завсарлага|☕
talk|die Schicht||Ээлж|🕘
talk|die Überstunden||Илүү цагийн ажил|⏰
talk|der Chef||Дарга|👔
talk|der Kollege||Хамт ажиллагч|🤝
talk|der Feierabend||Ажлын өдрийн төгсгөл|🌇
money|das Gehalt||Цалин|💰
money|der Arbeitsvertrag||Хөдөлмөрийн гэрээ|📄
money|die Aufenthaltserlaubnis||Оршин суух зөвшөөрөл|🪪
money|die Krankenversicherung||Эрүүл мэндийн даатгал|🛡️
money|das Konto||Банкны данс|🏦
money|der Urlaub||Амралт|🏖️
money|die Ausbildung||Мэргэжлийн сургалт|🎓
health|das Krankenhaus||Эмнэлэг|🏥
health|Ich habe mich verletzt.||Би гэмтчихлээ.|🤕
health|Mir ist schlecht.||Миний бие муу байна.|🤒
health|der Krankenwagen||Түргэн тусламжийн машин|🚑`

  };
  var INFO={
    ko:{n:"EPS-TOPIK (Солонгос)",d:"Солонгост хөдөлмөрийн гэрээгээр (E-9 виз) ажиллахад өгдөг солонгос хэлний шалгалт.",
      parts:["Унших, сонсох гэсэн хоёр хэсэгтэй, 50 орчим асуулт","Ажлын байрны үг, аюулгүй ажиллагааны тэмдэг, өдөр тутмын яриа их гардаг","Зурагтай асуулт олон: тэмдэг, багаж, үйлдлийг таних"]},
    ja:{n:"特定技能 · JFT-Basic (Япон)",d:"Японд «Тусгай ур чадвар» визээр ажиллахад япон хэлний шалгалт (JFT-Basic эсвэл JLPT N4) болон салбарын ур чадварын шалгалт өгдөг.",
      parts:["JFT-Basic: үсэг ба үгийн сан, яриа ба илэрхийлэл, сонсох, унших гэсэн 4 хэсэг","Асаргаа (介護), хоол үйлчилгээ, үйлдвэр зэрэг салбарын үгс хэрэгтэй","Хүндэтгэлийн хэллэг (かしこまりました, 申し訳ございません) заавал сур"]},
    en:{n:"Ажлын англи хэл · IELTS General, OET",d:"Австрали, Их Британи, Канад зэрэг оронд ажиллах, ажлын виз авахад ихэвчлэн IELTS General шаардагддаг. Эмч, сувилагчид OET өгдөг.",
      parts:["IELTS General: сонсох, унших, бичих, ярих гэсэн 4 хэсэг","Аюулгүй ажиллагаа, үйлчилгээ, асаргааны үгс хэрэгтэй","Ажлын яриа: ээлж, илүү цаг, тусламж хүсэх, уучлалт гуйх"]},
    zh:{n:"HSK · Ажлын хятад хэл",d:"Хятадад ажиллах, худалдаа хийхэд HSK гэрчилгээ (ихэвчлэн HSK 3–4) хэрэгтэй болдог. Хилийн боомт, худалдаа, тээврийн салбарт хятад хэл их хэрэглэгддэг.",
      parts:["HSK: сонсох, унших, (HSK 3-аас эхлэн) бичих хэсэгтэй","Худалдааны үг: үнэ, хөнгөлөлт, дээж, нэхэмжлэх, гэрээ","Тээвэр: агуулах, гааль, чингэлэг, бараа илгээх, хүлээн авах"]},
    ru:{n:"Патентын шалгалт · Орос",d:"Орост ажлын патент авахад «Комплексный экзамен» өгдөг: орос хэл, Оросын түүх, хууль тогтоомжийн үндэс.",
      parts:["Орос хэл: унших, бичих, сонсох, ярих","Бичиг баримт: патент, цагаачлалын карт, бүртгэл, татвар","Барилга, аюулгүй ажиллагааны үгс, ажлын яриа"]},
    de:{n:"Goethe B1 · Pflege, Ausbildung (Герман)",d:"Германд асаргааны ажил (Pflege) эсвэл мэргэжлийн сургалтаар (Ausbildung) ажиллахад ихэвчлэн Goethe эсвэл telc-ийн B1–B2 гэрчилгээ шаардагддаг.",
      parts:["Goethe B1: унших, сонсох, бичих, ярих гэсэн 4 модуль","Асаргааны үгс: өвчтөн, цусны даралт, эм, ээлж","Бичиг баримт: хөдөлмөрийн гэрээ, оршин суух зөвшөөрөл, даатгал"]}
  };
  var J={sec:"home",cat:null,flip:{},T:null},env=null;
  function h(){return env.h.apply(null,arguments);}
  function rows(lang){
    return (DATA[lang]||"").split("\n").map(function(r){var p=r.split("|");return {c:p[0],w:p[1],r:p[2],mn:p[3],e:p[4]};}).filter(function(x){return x.w&&x.mn;});
  }
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function bestKey(){return "jobbest:"+env.lang();}

  function viewHome(root){
    var lang=env.lang(),info=INFO[lang],all=rows(lang),best=env.sget(bestKey(),null);
    root.append(h("div",{class:"note"},
      h("div",{style:"font-weight:800;font-size:18px"},"💼 "+info.n),
      h("p",{style:"margin:6px 0 0"},info.d),
      h("ul",{style:"margin:8px 0 0;padding-left:20px"},info.parts.map(function(x){return h("li",{style:"margin-top:4px"},x);}))));
    root.append(h("button",{class:"btn primary",style:"width:100%;margin-top:12px",onclick:startTest},"⏱ Загвар шалгалт (20 асуулт)"+(best!=null?" · Шилдэг: "+best+"%":"")));
    root.append(h("h3",{style:"margin:20px 0 8px"},"Сэдвээр үг сурах"));
    Object.keys(CATS).forEach(function(c){
      var n=all.filter(function(x){return x.c===c;}).length;if(!n)return;
      root.append(h("button",{class:"lrow",type:"button",onclick:function(){J.sec="cat";J.cat=c;J.flip={};env.render();window.scrollTo(0,0);}},
        h("span",{class:"hexb"},CATS[c].split(" ")[0]),
        h("span",{style:"flex:1"},h("div",{class:"t"},CATS[c].split(" ").slice(1).join(" ")),h("div",{class:"muted small"},n+" үг")),
        h("span",{"aria-hidden":"true"},"›")));
    });
  }
  function viewCat(root){
    root.append(h("button",{class:"back",onclick:function(){J.sec="home";env.render();}},"‹ Сэдвүүд"));
    root.append(h("h2",null,CATS[J.cat]));
    root.append(h("p",{class:"muted small"},"Картыг дарвал утга нь гарна. 🔊 дээр дарж сонс."));
    rows(env.lang()).filter(function(x){return x.c===J.cat;}).forEach(function(x){
      var open=!!J.flip[x.w];
      root.append(h("div",{class:"srow",style:"gap:10px;align-items:center"},
        h("span",{style:"font-size:30px;flex:none","aria-hidden":"true"},x.e),
        h("button",{type:"button",style:"flex:1;text-align:left;background:none;border:0;padding:4px 0;color:inherit;font:inherit;cursor:pointer","aria-expanded":String(open),onclick:function(){J.flip[x.w]=!open;env.render();}},
          h("div",{style:"font-weight:800;font-size:18px"},x.w),
          x.r?h("div",{class:"muted small"},x.r):null,
          open?h("div",{style:"margin-top:2px"},"🇲🇳 "+x.mn):h("div",{class:"muted small"},"Утгыг харах ›")),
        env.speakBtn(x.w)));
    });
  }
  /* загвар шалгалт: утга олох, монголоос сонгох, сонсох, тэмдэг (аюулгүй ажиллагаа) */
  function startTest(){
    var all=rows(env.lang());if(all.length<8){env.toast("Үг хүрэлцэхгүй байна");return;}
    var safe=all.filter(function(x){return x.c==="safe";}),qs=[];
    var kinds=shuffle(["mean","mean","mean","mean","mean","rev","rev","rev","rev","rev","ear","ear","ear","ear","ear","sign","sign","sign","sign","sign"]);
    var used={};
    kinds.forEach(function(k){
      var pool=(k==="sign"?safe:all).filter(function(x){return !used[x.w];});if(!pool.length)pool=all;
      var w=pool[Math.floor(Math.random()*pool.length)];used[w.w]=1;
      var others=shuffle(all.filter(function(x){return x!==w&&x.mn!==w.mn;})).slice(0,3);
      qs.push({k:k,w:w,o:shuffle([w].concat(others)),picked:null});
    });
    J.T={qs:qs,i:0,score:0};J.sec="test";env.render();window.scrollTo(0,0);
    autoSay();
  }
  function autoSay(){var q=J.T&&J.T.qs[J.T.i];if(q&&q.k==="ear")setTimeout(function(){env.speak(q.w.w);},300);}
  function viewTest(root){
    var T=J.T;
    root.append(h("button",{class:"back",onclick:function(){J.T=null;J.sec="home";env.render();}},"‹ Буцах"));
    if(T.i>=T.qs.length)return viewResult(root);
    var q=T.qs[T.i],w=q.w,done=q.picked!=null;
    root.append(h("p",{class:"muted small"},"Асуулт "+(T.i+1)+" / "+T.qs.length+" · Зөв: "+T.score));
    root.append(h("div",{class:"bar"},h("i",{style:"width:"+(T.i/T.qs.length*100)+"%"})));
    var label=function(o){return q.k==="rev"?o.w:o.mn;};
    if(q.k==="mean"){
      root.append(h("div",{class:"q"},"Энэ үг ямар утгатай вэ?"));
      root.append(h("div",{style:"display:flex;gap:10px;align-items:center;margin:6px 0"},h("div",{style:"font-size:clamp(26px,8vw,38px);font-weight:800"},w.w),env.speakBtn(w.w)));
    }else if(q.k==="rev"){
      root.append(h("div",{class:"q"},"Энэ үгийг "+({ko:"солонгосоор",ja:"японоор",en:"англиар",zh:"хятадаар",ru:"оросоор",de:"германаар"}[env.lang()]||"")+" олоорой"));
      root.append(h("div",{style:"font-size:24px;font-weight:800;margin:6px 0"},w.mn));
    }else if(q.k==="ear"){
      root.append(h("div",{class:"q"},"Сонсоод утгыг нь сонго"));
      root.append(h("button",{class:"btn primary",style:"font-size:26px;padding:12px 26px","aria-label":"Дахин сонсох",onclick:function(){env.speak(w.w);}},"🔊"));
    }else{
      root.append(h("div",{class:"q"},"Энэ тэмдэг юу гэсэн утгатай вэ?"));
      root.append(h("div",{class:"note",style:"text-align:center;border:3px solid var(--danger)"},h("div",{style:"font-size:64px;line-height:1.1"},w.e),h("div",{style:"font-size:26px;font-weight:800;margin-top:4px"},w.w)));
    }
    q.o.forEach(function(o){
      var cls="opt";if(done){if(o===w)cls+=" ok";else if(o===q.picked)cls+=" bad";}
      root.append(h("button",{class:cls,disabled:done,onclick:function(){q.picked=o;if(o===w){T.score++;env.addXP(2);}env.speak(w.w);env.render();}},label(o)));
    });
    if(done){
      root.append(h("div",{class:"fb "+(q.picked===w?"ok":"bad")},(q.picked===w?"Зөв! ":"Буруу. ")+w.e+" "+w.w+(w.r?" ("+w.r+")":"")+" — "+w.mn));
      root.append(h("div",{class:"row"},h("button",{class:"btn primary",onclick:function(){T.i++;env.render();window.scrollTo(0,0);autoSay();}},T.i+1<T.qs.length?"Дараагийх ›":"Дүнгээ харах 🏁")));
    }
  }
  function viewResult(root){
    var T=J.T,pct=Math.round(T.score/T.qs.length*100),best=env.sget(bestKey(),null);
    if(!T.saved){T.saved=true;if(best==null||pct>best)env.sset(bestKey(),pct);if(pct>=80)env.celebrate();}
    root.append(h("div",{class:"note",style:"text-align:center;margin-top:10px"},
      h("div",{style:"font-size:44px"},pct>=80?"🏆":pct>=60?"👍":"💪"),
      h("div",{style:"font-weight:800;font-size:26px"},pct+"%"),
      h("div",null,T.score+" / "+T.qs.length+" зөв"),
      h("div",{class:"muted",style:"margin-top:6px"},pct>=80?"Маш сайн! Шалгалтад бэлэн болж байна.":pct>=60?"Сайн байна. Алдсан сэдвүүдээ давтаарай.":"Сэдвүүдийн үгсийг дахин давтаад оролдоорой.")));
    var miss=T.qs.filter(function(q){return q.picked!==q.w;});
    if(miss.length){
      root.append(h("p",{class:"muted small",style:"margin:14px 0 6px"},"Алдсан үгс"));
      miss.forEach(function(q){root.append(h("div",{class:"srow"},h("span",null,q.w.e+" "+q.w.w+" — "+q.w.mn),env.speakBtn(q.w.w)));});
    }
    root.append(h("div",{class:"row"},
      h("button",{class:"btn",onclick:function(){J.T=null;J.sec="home";env.render();}},"Сэдвүүд"),
      h("button",{class:"btn primary",onclick:startTest},"Дахин өгөх")));
  }

  window.JobPrep={
    has:function(lang){return !!DATA[lang];},
    view:function(e){
      env=e;var root=h("div");
      if(J.lang!==env.lang()){J.lang=env.lang();J.sec="home";J.T=null;}
      if(J.sec==="test"&&J.T)viewTest(root);
      else if(J.sec==="cat"&&J.cat)viewCat(root);
      else viewHome(root);
      return root;
    }
  };
})();
