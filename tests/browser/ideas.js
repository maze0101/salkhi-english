/* 2026-10-19 модулиуд: 🐑 сүрэг, 🏙️ хотын ан, ⛅ цаг агаарын хичээл, 👻 сүүдэр, 💌 захидал, 🎵 дуу, 🌙 зүүд, 📰 монгол мэдээ, 🚌 автобус, 👄 уруул.
   AI/камер/OCR шаарддаг хэсгүүдийн зөвхөн эхний дэлгэцийг шалгана (сүлжээгүй орчинд ч ажиллана).
   node tests/browser/ideas.js   (зураг: tests/browser/out/ideas-*.png) */
const {open,sleep}=require("./harness");
const path=require("path");
(async()=>{
  const t=await open({out:path.join(__dirname,"out"),height:1000});let fail=0;
  const ok=(c,m)=>{console.log((c?"✓ ":"✗ ")+m);if(!c)fail++;};
  try{
    await t.goto(`localStorage.setItem('salkhi:wx',JSON.stringify({"0":{at:Date.now(),t:-6,c:71,day:1,w:9}}));`);
    // 40 үгийг «сурсан» болгож, 15-ыг нь 1–15 хоног хэтэрсэн болгоно
    const n=await t.ev(`(function(){var s=__t.state,ws=__t.WORDS.filter(function(w){return (w[6]||'en')==='en';}).slice(0,40);
      ws.forEach(function(w,i){s.box[w[1]]=2;s.due[w[1]]=i<15?Date.now()-(i+1)*86400000:Date.now()+5*86400000;});__t.sset('box',s.box);__t.sset('due',s.due);return ws.length;})()`);
    ok(n===40,"40 үг сурсан болголоо");
    for(const m of ["Herd","Hunt","WxLesson","Ghost","Letter","MySong","Dream","MnNews","Commute","Lips","openWTool"])ok(await t.ev("!!window."+m),"модуль ачаалагдсан: "+m);
    const tools=[["herd","Үгийн сүрэг"],["hunt","Хотын ан"],["wxl","Цаг агаарын хичээл"],["letter","Нууц захидал"],["song","Миний үгсийн дуу"],["dream","Зүүдний тэмдэглэл"],["mnn","Монгол мэдээг орчуул"],["bus","Автобусны горим"],["lips","Уруулын толь"]];
    for(const [k,title] of tools){
      await t.ev("openWTool('"+k+"');1");await sleep(500);
      const h2=await t.ev("(document.querySelector('.app h2')||{}).textContent||''");
      ok(h2.includes(title),k+" нээгдсэн ("+h2.trim()+")");await t.shot("ideas-"+k);
      await t.ev("(document.querySelector('.app .back')||{click(){}}).click();1");await sleep(300);
    }
    // 🐑 сүрэг: төөрсөн хонь → асуулт → хариулт
    await t.ev("openWTool('herd');1");await sleep(400);
    const stray=await t.ev("document.querySelectorAll('.app svg g[role=button]').length");
    ok(stray>0,"сүрэгт төөрсөн хонь харагдана: "+stray);
    if(stray){await t.ev("document.querySelector('.app svg g[role=button]').dispatchEvent(new MouseEvent('click',{bubbles:true}));1");await sleep(400);
      ok(await t.ev("document.querySelectorAll('.app .opt').length")===4,"хонины асуулт 4 сонголттой");
      await t.ev("document.querySelector('.app .opt').click();1");await sleep(400);await t.shot("ideas-herd-q");}
    // 💌 захидал: бичих → холбоос → тэр холбоосоор нээх
    await t.ev("openWTool('letter');1");await sleep(300);
    await t.click("Захидал бичих");await sleep(300);
    await t.ev("var ta=document.querySelector('.app textarea');ta.value='Сайн уу! Hello friend';ta.dispatchEvent(new Event('input'));1");
    const words=await t.ev("[...document.querySelectorAll('.app .chip b')].map(b=>b.textContent)");
    await t.click("Түгжээд холбоос");await sleep(300);
    const link=await t.ev("(document.querySelector('.app input.tin[readonly]')||{}).value||''");
    ok(/#lt=/.test(link),"захидлын холбоос үүссэн");
    if(link){
      await t.send("Page.navigate",{url:link.replace(/^http:\/\/localhost:\d+\/[^#]*/,(await t.ev("location.origin"))+"/t.html")});await sleep(4500);
      ok(await t.ev("!!document.querySelector('.app h2')&&document.querySelector('.app h2').textContent.includes('Нууц захидал')"),"холбоосоор захидал нээгдсэн");
      // зөв үгсийг сонгоно
      await t.ev("(function(ws){document.querySelectorAll('.app .note').forEach(function(n){n.querySelectorAll('.opt').forEach(function(b){if(ws.indexOf(b.textContent)>=0)b.click();});});})("+JSON.stringify(words)+");1");await sleep(300);
      // дахин зурагдсан тул дахин сонгоно (нэг удаад нэг мөр шинэчлэгддэг)
      for(let i=0;i<3;i++){await t.ev("(function(ws){var ns=[...document.querySelectorAll('.app .note')];ns.forEach(function(n){var bs=[...n.querySelectorAll('.opt')];if(bs.some(b=>b.getAttribute('aria-pressed')==='true'))return;var b=bs.find(b=>ws.indexOf(b.textContent)>=0);if(b)b.click();});})("+JSON.stringify(words)+");1");await sleep(250);}
      await t.click("Захидал нээх");await sleep(400);
      const shown=await t.ev("document.querySelector('.app').textContent.includes('Hello friend')");
      ok(shown,"зөв хариултаар захидал тайлагдсан");await t.shot("ideas-letter-open");
    }
    // 👻 уралдаан: 15 асуулт
    await t.ev("__t.state.tab='play';__t.renderTabs();__t.ui.play.sec='games';__t.ui.play.ghost=true;__t.render();1");await sleep(300);
    await t.click("Эхлэх");await sleep(300);
    for(let i=0;i<200;i++){
      const done=await t.ev("!!document.querySelector('.app').textContent.match(/Анхны гүйлт|түрүүллээ/)");if(done)break;
      await t.ev("(function(){var w=document.querySelector('.app .note b').textContent,it=__t.WORDS.filter(function(x){return x[1]===w;})[0];var bs=[...document.querySelectorAll('.app .opt')];var b=it&&bs.find(function(b){return b.textContent===it[2];})||bs[0];b.click();})();1");await sleep(40);
    }
    ok(await t.ev("!!document.querySelector('.app').textContent.match(/Анхны гүйлт|түрүүллээ/)"),"сүүдрийн уралдаан дууссан");await t.shot("ideas-ghost");
    ok(await t.ev("JSON.parse(localStorage.getItem('salkhi:ghost:en')||'[]').length")===1,"гүйлт хадгалагдсан");
    ok(t.errors.length===0,"JS алдаагүй"+(t.errors.length?": "+t.errors.join(" | "):""));
  }finally{await t.close();}
  console.log(fail?fail+" алдаа":"бүгд зөв");process.exit(fail?1:0);
})();
