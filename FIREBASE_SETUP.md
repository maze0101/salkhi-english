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
