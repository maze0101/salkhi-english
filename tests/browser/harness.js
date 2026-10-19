/* Салхи: хөтчийн туршилтын суурь — репог локал серверээр үйлчилж, headless Edge/Chrome-ийг CDP-ээр удирдана.
   /t.html нь index.html-тэй ижил, гэхдээ үндсэн IIFE-ийн төгсгөлд window.__t = {state, ui, render, …} дэгээ нэмнэ
   (апп-ын дотоод функцүүд гаднаас харагддаггүй). Node 18+ (fetch), Node 22+ (WebSocket) хэрэгтэй.
   Хөтчийн замыг BROWSER орчны хувьсагчаар солино. Зөвхөн өөрийн эхлүүлсэн хөтчийг хаана. */
const http=require("http"),fs=require("fs"),path=require("path"),os=require("os"),{spawn}=require("child_process");

const ROOT=path.resolve(__dirname,"..","..");
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".mp4":"video/mp4",".jpg":"image/jpeg"};
const HOOK="window.__t={state:state,ui:ui,render:render,renderTabs:renderTabs,startGame:startGame,lvUp:lvUp,rankUp:rankUp,addXP:addXP,"+
  "pfShareImg:pfShareImg,nmLatin:nmLatin,nmHangul:nmHangul,nmKata:nmKata,bedOpen:bedOpen,homeLabels:homeLabels,WORDS:WORDS,sset:sset};\n";
const BROWSERS=[process.env.BROWSER,"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe","C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome","/usr/bin/chromium","/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].filter(Boolean);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function serve(port){
  return http.createServer((q,r)=>{
    let p=decodeURIComponent(q.url.split("?")[0]);
    if(p==="/t.html"){
      let s=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");const i=s.lastIndexOf("})();\n</script>");
      if(i<0){r.writeHead(500);r.end("hook point not found");return;}
      r.writeHead(200,{"content-type":"text/html"});r.end(s.slice(0,i)+HOOK+s.slice(i));return;
    }
    if(p.endsWith("/"))p+="index.html";
    const f=path.join(ROOT,p);if(!f.startsWith(ROOT)){r.writeHead(403);r.end();return;}
    fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{"content-type":MIME[path.extname(f)]||"application/octet-stream"});r.end(d);});
  }).listen(port);
}

/* opts: {width,height,dpr,dark,out} → {ev, send, shot, elshot, click, goto, errors, close} */
async function open(opts={}){
  const port=8800+Math.floor(Math.random()*400),dbg=9400+Math.floor(Math.random()*400);
  const exe=BROWSERS.find(b=>fs.existsSync(b));if(!exe)throw new Error("Хөтөч олдсонгүй — BROWSER=<зам> өгнө үү");
  const out=opts.out||fs.mkdtempSync(path.join(os.tmpdir(),"salkhi-test-"));fs.mkdirSync(out,{recursive:true});
  const prof=fs.mkdtempSync(path.join(os.tmpdir(),"salkhi-prof-"));
  const srv=serve(port);
  const br=spawn(exe,["--headless=new","--remote-debugging-port="+dbg,"--user-data-dir="+prof,"--no-first-run","about:blank"]);
  let tabs;for(let i=0;i<60;i++){try{tabs=await (await fetch("http://127.0.0.1:"+dbg+"/json")).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==="page");const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={},errors=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend[m.id]){pend[m.id](m);delete pend[m.id];}
    if(m.method==="Runtime.exceptionThrown")errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  const ev=async js=>{const r=await send("Runtime.evaluate",{expression:js,awaitPromise:true,returnByValue:true});
    if(r.result?.exceptionDetails)throw new Error("eval: "+(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text));return r.result?.result?.value;};
  await send("Runtime.enable");await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride",{width:opts.width||375,height:opts.height||812,deviceScaleFactor:opts.dpr||1,mobile:(opts.width||375)<560});
  if(opts.dark)await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-color-scheme",value:"dark"}]});
  const base="http://localhost:"+port+"/t.html";
  return {
    ev,send,errors,out,
    /* хоосон төлөвтэй эхэлж, seed(localStorage) хийгээд дахин ачаална */
    async goto(seed){
      await send("Page.navigate",{url:base});await sleep(1500);
      await ev("localStorage.clear();localStorage.setItem('salkhi:_sync',JSON.stringify({skip:1}));localStorage.setItem('salkhi:seenVer',JSON.stringify('9.9.9'));localStorage.setItem('salkhi:rkback','1');localStorage.setItem('salkhi:onb',JSON.stringify({goal:'travel',ts:1}));"+(seed||"")+";1");
      await send("Page.reload");await sleep(3500);
      if(!(await ev("!!window.__t")))throw new Error("__t дэгээ ачаалагдсангүй");
    },
    async shot(name){const r=await send("Page.captureScreenshot",{format:"png"});fs.writeFileSync(path.join(out,name+".png"),Buffer.from(r.result.data,"base64"));},
    async elshot(name,sel){
      const r=JSON.parse(await ev("(function(){var e=document.querySelector("+JSON.stringify(sel)+");if(!e)return 'null';var b=e.getBoundingClientRect();return JSON.stringify({x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height});})()"));
      if(!r)return false;
      const q=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:r.x,y:r.y,width:Math.max(1,r.w),height:Math.max(1,r.h),scale:1}});
      fs.writeFileSync(path.join(out,name+".png"),Buffer.from(q.result.data,"base64"));return true;
    },
    /* бичвэр эсвэл aria-label-аар товч дарна */
    async click(text){const r=await ev("(function(){var b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes("+JSON.stringify(text)+")||(x.getAttribute('aria-label')||'').includes("+JSON.stringify(text)+"));if(!b)return false;b.click();return true;})()");await sleep(350);return r;},
    async close(){try{ws.close();}catch(e){}br.kill();srv.close();await sleep(300);try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}}
  };
}
module.exports={open,sleep,ROOT};
