# «Найз» хэсгийг ажиллуулах заавар (Firebase, үнэгүй)

Апп-д найзууд, хамтрагчтай ярих, нээлттэй өрөө, үгийн сорилт орсон. Эдгээр нь жижиг сервер шаарддаг тул Firebase-д нэг удаа тохиргоо хийнэ. Бүртгэл шаардахгүй (нэвтрэлтгүй / anonymous).

1. https://console.firebase.google.com руу Google акаунтаараа орж **Add project** дарна (нэр: `salkhi`, Analytics шаардлагагүй).
2. **Build → Authentication → Get started → Sign-in method → Anonymous** гэж идэвхжүүлнэ.
3. **Build → Realtime Database → Create database**. Бүсийг сонгоод **Start in locked mode**.
4. Realtime Database → **Rules** табд `database.rules.json` файлын бүх агуулгыг хуулж тавиад **Publish** дарна.
5. ⚙ **Project settings → General → Your apps → Web (`</>`)** нэмж, гарсан `firebaseConfig`-ийн `apiKey`, `authDomain`, `databaseURL`, `projectId`-г `firebase-config.js` файлд тавина (жишээг тэр файлаас үз). Эдгээр нь нууц түлхүүр биш.
6. Authentication → **Settings → Authorized domains** хэсэгт `maze0101.github.io` нэмэгдсэн эсэхийг шалгана.

## Хамгаалалт
- Хүүхдийн горимд «Найз» хэсэг байхгүй.
- Нээлттэй өрөө зөвхөн том хүний горимд. Холбоос, утасны дугаар илгээх боломжгүй, 2 секундэд 1 мессеж.
- Зохисгүй зурвас дээр дарж **Мэдэгдэх** эсвэл **Хаах** боломжтой.
- Мэдэгдсэн зүйлийг Firebase Console → Realtime Database → `reports` дотроос хараад, `rooms/<хэл>/<зурвасын key>` замаар устгана.

## Google нэвтрэлт + явцын синк («Явц» таб → ☁️ Явц хадгалах)
1. Firebase Console → **Authentication → Sign-in method → Add new provider → Google** → Enable, support email сонгоод **Save**.
2. Realtime Database → **Rules** табд шинэчлэгдсэн `database.rules.json`-ийг дахин хуулж **Publish** дарна (`progress` хэсэг нэмэгдсэн).
3. Authentication → Settings → **Authorized domains**-д `maze0101.github.io` байгаа эсэхийг шалгана.

Нэргүй бүртгэлийг Google-тэй холбодог тул найзууд, код хэвээр үлдэнэ. Явц `progress/<uid>`-д хадгалагдана. API түлхүүр, горим, загвар зэрэг төхөөрөмжийн тохиргоо синк хийгдэхгүй.

## Багш, анги (Профайл → 🏫 Анги)
Realtime Database → **Rules** табд шинэчлэгдсэн `database.rules.json`-ийг дахин хуулж **Publish** дарна (`classes`, `members`, `tasks`, `cstats`, `mycls`, `wlists`, `board`, `tlessons`, `live`, `livekey`, `liveans` хэсэг нэмэгдсэн).
- Ангийн нэр, кодыг нэвтэрсэн хэн ч уншиж болно (кодоор нэгдэхэд хэрэгтэй).
- Даалгаврыг зөвхөн ангийн гишүүд болон багш уншина. Даалгавар нэмэх, устгахыг зөвхөн багш хийнэ.
- Сурагчдын явц (`cstats`), гишүүдийн жагсаалтыг зөвхөн тухайн ангийн багш харна. Сурагч зөвхөн өөрийнхөө явцыг бичнэ.
- Үгсийн жагсаалтыг (`wlists`) зөвхөн багш бичиж, ангийн гишүүд уншина.
- 7 хоногийн рейтинг (`board`): багш асаасан үед л (`classes/<код>/board = true`) ангийн гишүүд бие биеийнхээ 7 хоногийн XP-г харна.
- Багшийн хичээлийг (`tlessons`) зөвхөн багш бичиж, ангийн гишүүд уншина.
- Шууд тест (`live`, `livekey`, `liveans`): тестийг зөвхөн багш удирдана; зөв хариулт (`livekey`) зөвхөн багшид харагдана. Сурагч асуулт бүрт нэг л удаа, хугацаандаа хариулна (серверийн цагаар шалгана), бусдын хариултыг харахгүй.
