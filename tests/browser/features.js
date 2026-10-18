/* Салхи 2.1: шинэ модулиудыг (кроссворд, хэл зүгшрүүлэх, аялал, хошин яриа, аудио ном, караоке, шууд орчуулга, бүрэн офлайн) шалгана.
   Ажиллуулах: node tests/browser/features.js   (дэлгэцийн зургууд: tests/browser/out/)
   Бинго, найз сэрээх нь Firebase/worker шаарддаг тул энд биш (worker/test-push.mjs, DB дүрмийн тест). */
const path=require("path"),{open,sleep}=require("./harness");
let fails=0;
function check(name,ok,info){console.log((ok?"✓ ":"✗ ")+name+(info!=null?" — "+info:""));if(!ok)fails++;}

(async()=>{
  const t=await open({width:375,height:812,out:path.join(__dirname,"out")});
  const watchdog=setTimeout(()=>{console.log("✗ TIMEOUT");t.close().then(()=>process.exit(2));},180000);
  try{
    const song={id:"s1",lang:"en",title:"Test song",lines:[["Hello my friend","Сайн уу найз минь"],["How are you today","Өнөөдөр ямар байна"],["See you soon","Удахгүй уулзъя"]],words:[],ts:1};
    await t.goto("localStorage.setItem('salkhi:songs',JSON.stringify(["+JSON.stringify(song)+"]));localStorage.setItem('salkhi:level',JSON.stringify('a1'));");
    /* хойшлуулсан модулиуд ачаалагдтал хүлээнэ */
    for(let i=0;i<30&&!(await t.ev("!!(window.Crossword&&window.Twister&&window.Journey&&window.Jokes&&window.ABook)"));i++)await sleep(300);
    check("модулиуд ачаалагдлаа",await t.ev("!!(window.Crossword&&window.Twister&&window.Journey&&window.Jokes&&window.ABook)"));

    /* 🧩 кроссворд */
    await t.ev("__t.state.tab='play';__t.ui.play.sec='games';__t.renderTabs();__t.render();1");await sleep(300);
    check("Сорил: кроссворд хавтан",await t.ev("/Өдрийн кроссворд/.test(document.body.textContent)"));
    check("Сорил: хэл зүгшрүүлэх хавтан",await t.ev("/Хэл зүгшрүүлэх/.test(document.body.textContent)"));
    await t.click("Өдрийн кроссворд");await t.click("Өнөөдрийн кроссворд");
    const nw=await t.ev("(Crossword._cur()||{words:[]}).words.length");
    check("кроссворд үүслээ (4–8 үг)",nw>=4&&nw<=8,nw+" үг");
    check("кроссворд: нүднүүд",await t.ev("document.querySelectorAll('[role=grid] button').length")>=12);
    /* огтлолцол зөв: нэг нүдэнд хоёр үг таарвал үсэг нь ижил */
    check("кроссворд: огтлолцол зөв",await t.ev(`(function(){var C=Crossword._cur(),m={};return C.words.every(function(p){return p.a.every(function(ch,i){var k=(p.r+(p.d==='v'?i:0))+':'+(p.c+(p.d==='h'?i:0));if(m[k]&&m[k]!==ch)return false;m[k]=ch;return true;});});})()`));
    await t.shot("f01-crossword");
    /* бүх үгийг бичиж бөглөнө */
    const xp0=await t.ev("__t.state.xp");
    for(let i=0;i<nw;i++){
      const ok=await t.ev(`(function(){var C=Crossword._cur(),w=C.words[C.sel];var inp=document.querySelector('.note input.tin');if(!inp)return false;inp.value=w.w[1];inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return true;})()`);
      if(!ok)break;await sleep(120);
    }
    check("кроссворд дууслаа + XP",await t.ev("Crossword._cur().done")&&(await t.ev("__t.state.xp"))>xp0,xp0+" → "+await t.ev("__t.state.xp"));
    check("кроссворд: өнөөдрийнх тэмдэглэгдсэн",await t.ev("Crossword.doneToday(function(k,d){try{var v=JSON.parse(localStorage.getItem('salkhi:'+k));return v==null?d:v;}catch(e){return d;}},'en')"));
    await t.shot("f02-crossword-done");

    /* 👅 хэл зүгшрүүлэх: оноо тооцоолол */
    const env="{lang:function(){return 'en';}}";
    check("twister: төгс = 100%",await t.ev("Twister._score("+env+",Twister._data.en[0],['She sells seashells by the seashore']).acc")===100);
    const part=await t.ev("Twister._score("+env+",Twister._data.en[0],['she sells sea shells by the shore']).acc");
    check("twister: хэсэгчлэн зөв",part>=50&&part<100,part+"%");
    check("twister: япон — уншлагаар таарна",await t.ev("Twister._score({lang:function(){return 'ja';}},Twister._data.ja[0],['なまむぎなまごめなまたまご']).acc")===100);
    await t.ev("__t.ui.play.cw=false;__t.ui.play.tw=true;__t.render();1");await sleep(200);await t.click("She sells");
    check("twister: дэлгэц",await t.ev("/🐢 Удаан/.test(document.body.textContent)&&/Хэлэх/.test(document.body.textContent)"));
    await t.shot("f03-twister");
    await t.ev("__t.ui.play.tw=false;1");

    /* 🗺️ аялал, 😂 хошин яриа */
    await t.ev("__t.state.tab='words';__t.renderTabs();__t.ui.wtool='trip';__t.render();1");await sleep(300);
    check("аялал: зам SVG",await t.ev("!!document.querySelector('svg[aria-label^=\"Аяллын зам\"]')"));
    check("аялал: London",await t.ev("/London/.test(document.body.textContent)"));
    await t.shot("f04-journey");
    await t.ev("__t.ui.wtool='joke';__t.render();1");await sleep(200);
    const xj=await t.ev("__t.state.xp");await t.click("😂 Тайлбар");
    check("хошин: тайлбар нээгдэнэ",await t.ev("/💡/.test(document.body.textContent)"));
    check("хошин: анх нээхэд +1 XP",(await t.ev("__t.state.xp"))===xj+1);
    await t.shot("f05-jokes");
    await t.ev("__t.ui.wtool=null;__t.render();1");await sleep(200);
    check("хэрэгслүүдэд аялал, хошин",await t.ev("/Хэлний аялал/.test(document.body.textContent)&&/Хошин яриа/.test(document.body.textContent)"));

    /* 📚 аудио ном */
    await t.ev("__t.state.tab='listen';__t.ui.listen.mode='book';__t.renderTabs();__t.render();1");await sleep(300);
    check("аудио ном: түүхийн жагсаалт",await t.ev("document.querySelectorAll('#main .lrow').length")>=3);
    await t.ev("document.querySelector('#main .lrow').click();1");await sleep(200);
    check("аудио ном: тоглуулагч",await t.ev("/Тоглуулах/.test(document.body.textContent)&&/Унтах таймер/.test(document.body.textContent)"));
    await t.shot("f06-abook");

    /* 🎤 караоке (автомат хэмнэл) */
    await t.ev("__t.ui.listen.mode='song';__t.render();1");await sleep(200);
    await t.click("Test song");await t.click("🎤 Караоке");await t.click("🐇 Хурдан");await t.click("Эхлэх");
    await sleep(1900);
    const kc=await t.ev("(function(){var c=document.getElementById('kr-cur');if(!c)return null;return {n:c.children.length,lit:[...c.children].filter(x=>x.style.color).length,t:c.textContent};})()");
    check("караоке: мөр гарлаа",kc&&kc.n>0,kc&&kc.t);
    await sleep(900);
    const kc2=await t.ev("[...document.getElementById('kr-cur').children].filter(x=>x.style.color).length");
    check("караоке: үгс тодорч байна",kc2>0,kc2);
    await t.shot("f07-karaoke");
    await t.click("⏹ Зогсоох");

    /* 🔎 шууд орчуулга: #main доторх үгийг сонгоно */
    await t.ev("__t.state.tab='words';__t.renderTabs();__t.render();1");await sleep(300);
    await t.ev("(function(){var p=document.createElement('p');p.id='qtt';p.textContent='I like the apple';document.getElementById('main').prepend(p);var r=document.createRange();var n=p.firstChild;r.setStart(n,11);r.setEnd(n,16);var s=getSelection();s.removeAllRanges();s.addRange(r);})();1");
    /* headless хөтөч таймерыг удаашруулдаг тул 4 секунд хүртэл хүлээнэ */
    const until=async js=>{for(let i=0;i<16;i++){if(await t.ev(js))return true;await sleep(250);}return false;};
    await until("!!document.querySelector('.qt')");
    check("шууд орчуулга: цонх",await t.ev("!!document.querySelector('.qt')"));
    check("шууд орчуулга: алим",await t.ev("/алим/i.test((document.querySelector('.qt')||{}).textContent||'')"),await t.ev("(document.querySelector('.qt')||{}).textContent||''"));
    await sleep(600);await t.shot("f08-quick");
    await t.ev("getSelection().removeAllRanges();1");
    check("шууд орчуулга: сонголт арилахад хаагдана",await until("!document.querySelector('.qt')"));

    /* 📥 бүрэн офлайн: «🌐 Бүгд» */
    await t.ev("__t.state.tab='stats';__t.ui.set=true;__t.renderTabs();__t.render();1");await sleep(300);
    const has=await t.click("🌐 Бүгд");
    check("офлайн: 🌐 Бүгд сонголт",has&&await t.ev("/🌐 Бүгд татах/.test(document.body.textContent)"));

    check("JS алдаагүй",t.errors.length===0,t.errors.join(" | ")||null);
  }catch(e){check("тест",false,e.message);}
  clearTimeout(watchdog);await t.close();
  console.log(fails?fails+" алдаа":"Бүгд амжилттай");process.exit(fails?1:0);
})();
