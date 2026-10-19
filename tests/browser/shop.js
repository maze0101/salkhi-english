/* Одны дэлгүүр: шинэ ангиллууд (🎉 эффект, 🔔 дуу, 🏷️ цол, 🌄 тэнгэр), шинэ загвар (Монгол хээ), 🎁 нууц хайрцаг.
   node tests/browser/shop.js   (зураг: tests/browser/out/shop-*.png) */
const {open,sleep}=require("./harness");
const path=require("path");
(async()=>{
  const t=await open({out:path.join(__dirname,"out"),height:1100});let fail=0;
  const ok=(c,m)=>{console.log((c?"✓ ":"✗ ")+m);if(!c)fail++;};
  const buy=async(label)=>{const a=await t.click(label);await sleep(150);const b=await t.click(label);await sleep(400);return a&&b;};
  try{
    await t.goto("localStorage.setItem('salkhi:stars','2000');");
    await t.ev("__t.state.stars=2000;__t.state.tab='stats';__t.ui.shop=true;__t.renderTabs();__t.render();1");await sleep(400);
    for(const c of ["Баярын эффект","Дууны багц","Цол","Тэнгэрийн чимэглэл","Апп-ын өнгө"])ok(await t.ev("[...document.querySelectorAll('.app h3')].some(x=>x.textContent.includes("+JSON.stringify(c)+"))"),"ангилал: "+c);
    await t.shot("shop-1");
    ok(await buy("Нууц хайрцаг — 35 од"),"🎁 хайрцаг худалдаж авсан");
    ok(await t.ev("!!document.querySelector('[aria-label=\"Нууц хайрцаг\"]')"),"🎁 хайрцагны цонх гарсан");await t.shot("shop-box");
    await t.ev("var d=document.querySelector('[aria-label=\"Нууц хайрцаг\"]');d&&d.remove();1");
    ok(await buy("Туйлын туяа — 90 од"),"🌌 туйлын туяа");
    ok(await t.ev("!!document.querySelector('.salkhi-hero .hfx-aurora')"),"нүүрэнд туяа гарсан");
    ok(await buy("Монгол хээ — 100 од"),"🏵️ Монгол хээ");
    ok(await t.ev("document.documentElement.getAttribute('data-skin')")==="hee","data-skin=hee");
    ok(await buy("Цасан ширхэг — 50 од"),"❄️ эффект");
    ok(await buy("Хэлний хаан — 200 од"),"👑 цол");
    ok(await buy("Морин хуур — 60 од"),"🎻 дууны багц");
    const st=await t.ev("JSON.parse(localStorage.getItem('salkhi:shop'))");
    ok(st.fx==="fx:snow"&&st.ttl==="ttl:khan"&&st.snd==="snd:khuur"&&st.sky==="sky:aurora"&&st.skin==="skin:hee","сонголт хадгалагдсан "+JSON.stringify({fx:st.fx,ttl:st.ttl,snd:st.snd,sky:st.sky,skin:st.skin}));
    await t.ev("scrollTo(0,0);1");await sleep(300);await t.shot("shop-2");
    await t.ev("__t.ui.shop=false;__t.render();scrollTo(0,0);1");await sleep(400);
    ok(await t.ev("document.querySelector('.app').textContent.includes('Хэлний хаан')"),"профайл дээр цол харагдана");await t.shot("shop-profile");
    // хуучин сонголтыг буцаах
    await t.ev("__t.ui.shop=true;__t.render();1");await sleep(300);
    ok(await t.click("Сонгох"),"анхны загвар руу буцаах товч");
    ok(t.errors.length===0,"JS алдаагүй"+(t.errors.length?": "+t.errors.join(" | "):""));
  }finally{await t.close();}
  console.log(fail?fail+" алдаа":"бүгд зөв");process.exit(fail?1:0);
})();
