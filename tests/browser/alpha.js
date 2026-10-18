/* Салхи: Үсэг → ✨ Дасгал (alphaplus.js) — 7 хэл бүрт бүх хэрэгслийг нээж, гол логикийг шалгана.
   Ажиллуулах: node tests/browser/alpha.js   (дэлгэцийн зургууд: tests/browser/out/) */
const path=require("path"),{open,sleep}=require("./harness");
let fails=0;
function check(name,ok,info){console.log((ok?"✓ ":"✗ ")+name+(info!=null?" — "+info:""));if(!ok)fails++;}
const LANGN={en:"Англи",ja:"Япон",ko:"Солонгос",zh:"Хятад",ru:"Орос",de:"Герман",ug:"Уйгур"};

(async()=>{
  const t=await open({width:375,height:812,out:path.join(__dirname,"out")});
  const watchdog=setTimeout(()=>{console.log("✗ TIMEOUT");t.close().then(()=>process.exit(2));},480000);
  try{
    await t.goto();
    for(let i=0;i<30&&!(await t.ev("!!window.AlphaPlus"));i++)await sleep(300);
    check("модуль ачаалагдлаа",await t.ev("!!window.AlphaPlus"));
    /* цэвэр логик */
    check("пиньинь: j+ü → ju",await t.ev("AlphaPlus._pySpell('j','ü')")==="ju");
    check("пиньинь: эхлэлгүй iu → you",await t.ev("AlphaPlus._pySpell('','iu')")==="you");
    check("пиньинь аяс: hao3 → hǎo",await t.ev("AlphaPlus._pyTone('hao',3)")==="hǎo");
    check("пиньинь аяс: liu4 → liù",await t.ev("AlphaPlus._pyTone('liu',4)")==="liù");
    check("пиньинь аяс: gou → gǒu",await t.ev("AlphaPlus._pyTone('gou',3)")==="gǒu");
    check("солонгос задлал: 한 = ㅎ+ㅏ+ㄴ",await t.ev("JSON.stringify(AlphaPlus._koParts('한'))")==='{"i":18,"v":0,"f":4}');

    /* тестийн хариулт эзэмшилтэд бүртгэгдэнэ */
    await t.ev("__t.state.tab='alpha';__t.ui.alpha.sec='qz';__t.renderTabs();__t.render();1");await sleep(300);
    await t.ev("document.querySelector('#main .opt').click();1");await sleep(200);
    check("тест → эзэмшилт бүртгэгдлээ",await t.ev("Object.keys(JSON.parse(localStorage.getItem('salkhi:amast:en')||'{}')).length")===1);

    for(const L of ["en","ja","ko","zh","ru","de","ug"]){
      await t.ev("(function(){var b=[...document.querySelectorAll('#langs button')].find(x=>x.textContent.replace(' β','')==='"+LANGN[L]+"');if(b&&__t.state.lang!=='"+L+"')b.click();})();1");
      await sleep(1500);
      await t.ev("__t.state.tab='alpha';__t.ui.alpha.sec='plus';__t.renderTabs();__t.render();1");await sleep(300);
      const cards=await t.ev("[...document.querySelectorAll('#main .gamecard b')].map(b=>b.textContent)");
      check(L+": хэл солигдлоо",await t.ev("__t.state.lang")===L);
      check(L+": дасгалын хавтан",cards.length>=5,cards.length+" — "+cards.join(", "));
      for(const name of cards){
        await t.ev("[...document.querySelectorAll('#main .gamecard')].find(x=>x.querySelector('b').textContent==="+JSON.stringify(name)+").click();1");await sleep(250);
        const ok=await t.ev("!!document.querySelector('#main .back')&&document.querySelector('#main').textContent.length>80");
        if(!ok)check(L+": "+name+" нээгдсэнгүй",false);
        if(L==="ko"&&name==="Үе бүтээгч"){
          await t.click("ㅎ");await t.click("ㅏ");
          await t.ev("[...document.querySelectorAll('#main button')].filter(b=>b.textContent==='ㄴ').pop().click();1");await sleep(200);
          check("ko: ㅎ+ㅏ+ㄴ → 한",await t.ev("/한/.test(document.querySelector('#main .note').textContent)"));
          await t.shot("a-ko-builder");
        }
        if(L==="ja"&&name==="Үе бүтээгч"){
          await t.click("き");await t.click("゛ дакутэн");await t.click("+ ゃ");
          check("ja: き+゛+ゃ → ぎゃ gya",await t.ev("/ぎゃ/.test(document.querySelector('#main .note').textContent)&&/gya/.test(document.querySelector('#main .note').textContent)"));
          await t.shot("a-ja-builder");
        }
        if(L==="en"&&name==="Үсэг → үг"){
          await t.ev("document.querySelector('#main .ag button').click();1");await sleep(200);
          const n=await t.ev("(document.querySelector('#main .note .muted.small')||{}).textContent||''");
          check("en: A үсгээр эхэлсэн үгс",/[1-9]\d* үг/.test(n),n);await t.shot("a-en-letterwords");
        }
        if(L==="ru"&&name==="Гар бичмэл"){
          check("ru: Marck Script фонт ачаалж байна",await t.ev("[...document.querySelectorAll('link')].some(l=>/Marck\\+Script/.test(l.href))"));
          await sleep(800);await t.shot("a-ru-cursive");
        }
        if(L==="de"&&name==="Хурдан таних"){
          await t.click("⚡ Эхлэх");
          await t.ev("document.querySelector('#main .opt').click();1");await sleep(150);
          check("de: хурдан таних тоолж байна",await t.ev("/✅ [01]/.test(document.querySelector('#main').textContent)"));
          await t.shot("a-de-speed");
        }
        if(L==="en"&&name==="Үсгийн эзэмшилт"){await t.shot("a-en-mastery");check("en: эзэмшилтийн 🔴/🟢 тоо",await t.ev("/🔴|🟢/.test(document.querySelector('#main').textContent)"));}
        if(L==="zh"&&name==="Үе бүтээгч")await t.shot("a-zh-builder");
        if(L==="ru"&&name==="Хуурамч найз үсгүүд")await t.shot("a-ru-ff");
        await t.ev("(document.querySelector('#main .back')||{click(){}}).click();1");await sleep(200);
      }
    }
    check("JS алдаагүй",t.errors.length===0,t.errors.join(" | ")||null);
  }catch(e){check("тест",false,e.message);}
  clearTimeout(watchdog);await t.close();
  console.log(fails?fails+" алдаа":"Бүгд амжилттай");process.exit(fails?1:0);
})();
