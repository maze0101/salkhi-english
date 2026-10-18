/* Салхи: утасны хэмжээнд (375px) гол урсгалуудыг шалгах smoke тест.
   Ажиллуулах: node tests/browser/smoke.js   (дэлгэцийн зургууд: tests/browser/out/, git-д орохгүй)
   Алдаа гарвал exit code 1. */
const path=require("path"),{open,sleep}=require("./harness");
let fails=0;
function check(name,ok,info){console.log((ok?"✓ ":"✗ ")+name+(info!=null?" — "+info:""));if(!ok)fails++;}

(async()=>{
  const t=await open({width:375,height:812,out:path.join(__dirname,"out")});
  const watchdog=setTimeout(()=>{console.log("✗ TIMEOUT");t.close().then(()=>process.exit(2));},150000);
  try{
    /* 7 хоногийн идэвх, 200 од, Наадмын медаль */
    await t.goto(`var d=new Date(),day=(d.getDay()+6)%7,dl={},act={};for(var i=0;i<=day;i++){var x=new Date();x.setDate(d.getDate()-i);var k=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');dl[k]=60;act[k]={r:2,l:2,wn:6,g:3,p:4};}
      localStorage.setItem('salkhi:daily',JSON.stringify(dl));localStorage.setItem('salkhi:act',JSON.stringify(act));localStorage.setItem('salkhi:xp','3000');localStorage.setItem('salkhi:stars','200');
      localStorage.setItem('salkhi:evmedal',JSON.stringify({'naadam:2026':{ic:'🏇',t:'Наадмын алтан медаль',ev:'Наадмын сорил',d:'2026-07-10'}}));`);
    await t.shot("01-home");
    check("нүүр: тэмцээний товч",await t.ev("!!document.querySelector('#heroev b')"));
    check("нүүр: 🌐 сонголтын товч",await t.ev("!!document.querySelector('.stat.pick')"));
    check("нүүр: ⭐ чип",await t.ev("(document.querySelector('.starchip')||{}).textContent"),await t.ev("(document.querySelector('.starchip')||{}).textContent"));
    check("нүүр: 7 хоногийн даалгавар",await t.ev("document.querySelectorAll('.wq-row').length===3"));
    check("түвшин толгой = профайл",await t.ev("__t.state.xp===3000"));

    const s0=await t.ev("__t.state.stars");
    await t.ev("[...document.querySelectorAll('.wq-row button')].filter(b=>!b.disabled)[0].click();1");await sleep(300);
    check("даалгаврын од",await t.ev("__t.state.stars")===s0+15,s0+" → "+await t.ev("__t.state.stars"));

    const r0=await t.ev("document.querySelector('#heroev b').textContent");await sleep(5600);
    check("тэмцээний товч солигдоно",await t.ev("document.querySelector('#heroev b').textContent")!==r0);

    await t.ev("__t.state.tab='stats';__t.renderTabs();__t.render();1");await sleep(400);await t.shot("02-profile");
    await t.ev("__t.ui.pfTab='prog';__t.render();1");await sleep(300);
    check("профайл карт",await t.ev("!!document.querySelector('.pf-card')"));
    check("ур чадварын диаграм",await t.ev("!!document.querySelector('.note svg[role=img]')"));

    await t.ev("__t.ui.hub=true;__t.render();1");await sleep(300);
    check("медалийн цомог 1/13",/1 \/ 13/.test(await t.ev("(document.querySelector('.alb')||{parentNode:{}}).parentNode.textContent||''")));

    await t.ev("__t.ui.hub=false;__t.ui.shop=true;__t.render();1");await sleep(300);await t.shot("03-shop");
    await t.click("Говь — 80");await t.click("Авах уу");
    check("дэлгүүр: Говь өнгө",await t.ev("document.documentElement.getAttribute('data-skin')")==="gobi");
    await t.click("2× XP · 15 минут");await t.click("Авах уу");
    const x0=await t.ev("__t.state.xp");await t.ev("__t.addXP(10);1");
    check("2× XP",await t.ev("__t.state.xp")===x0+20);

    await t.ev("__t.ui.shop=false;__t.state.tab='words';__t.renderTabs();1");
    for(const w of ["wall","loan","name","lbl"]){await t.ev("__t.ui.wtool='"+w+"';__t.render();1");await sleep(200);check("хэрэгсэл: "+w,await t.ev("!!document.querySelector('h2')"));}
    check("нэр: Бат → 바트 / バト",await t.ev("__t.nmHangul('Бат')+' '+__t.nmKata('Бат')")==="바트 バト");
    check("шошго: хаалга → door",await t.ev("__t.homeLabels().some(x=>x.w[1]==='door')"));

    await t.ev("__t.ui.wtool=null;__t.state.tab='play';__t.renderTabs();__t.startGame('pass');1");await sleep(300);
    check("ээлжлэн тоглох",await t.ev("/Ээлжлэн тоглох/.test(document.body.textContent)"));

    check("JS алдаагүй",t.errors.length===0,t.errors.join(" | ")||null);
  }catch(e){check("тест",false,e.message);}
  clearTimeout(watchdog);await t.close();
  console.log(fails?fails+" алдаа":"Бүгд амжилттай");process.exit(fails?1:0);
})();
