/* node test-telegram.mjs — Telegram бот: үгс задлах, өдрийн үг, webhook командууд, хэсэгчилсэн илгээлт */
import {parseWords,dailyPick,dailyMessage,dayMN,handleTelegram,handleTgSetup,runTgDaily} from "./src/telegram.js";
import worker from "./src/index.js";
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log("✅",n);}else{fail++;console.log("❌",n,x||"");}};

const SRC="window.WORDS_MORE=window.WORDS_MORE||{};\nwindow.WORDS_MORE.en=`a1|breakfast|өглөөний цай|I eat breakfast at seven.|Би долоон цагт өглөөний цайгаа уудаг.||basic\n"+
  "a1|lunch|өдрийн хоол|We have lunch at noon.|Бид үд дунд өдрийн хоол иддэг.||basic\na1|dinner|оройн хоол|Dinner is ready.|Оройн хоол бэлэн боллоо.||basic\n"+
  "a1|morning|өглөө|Good morning!|Өглөөний мэнд!||time\na1|night|шөнө|||\nbroken line\na1|lunch|давхардсан|||\na2|evening|орой|She walks in the evening.|Тэр орой алхдаг.||time`;";
const W=parseWords(SRC);
ck("parseWords keeps 6 valid unique words",W.length===6,JSON.stringify(W.map(w=>w[0])));
ck("parseWords fields: word, mn, example, example-mn",W[0][0]==="breakfast"&&W[0][1]==="өглөөний цай"&&/seven/.test(W[0][2])&&/долоон/.test(W[0][3]));
ck("dayMN uses Mongolian time (UTC 17:00 = next day MN)",dayMN(Date.UTC(2026,9,13,17,0))==="2026-10-14");

let allOk=true;
for(let d=1;d<=60;d++){const day="2026-11-"+String(d%30+1).padStart(2,"0")+"x"+d;const p=dailyPick(W,day,"en");
  if(p.w===p.q||p.opts.length!==3||new Set(p.opts).size!==3||p.opts.indexOf(p.q)<0||new Set(p.opts.map(i=>W[i][1])).size!==3)allOk=false;}
ck("dailyPick: word≠quiz, 3 distinct options incl. the answer (60 days)",allOk);
ck("dailyPick is stable for the same day",JSON.stringify(dailyPick(W,"2026-10-13","en"))===JSON.stringify(dailyPick(W,"2026-10-13","en")));
const M=dailyMessage(W,"2026-10-13","en");
ck("message has word, quiz, 3 answer buttons + app link",/Өдрийн үг/.test(M.text)&&/гэж юу гэсэн үг вэ/.test(M.text)&&M.reply_markup.inline_keyboard.length===4&&M.reply_markup.inline_keyboard[3][0].url);
ck("exactly one button is marked correct",M.reply_markup.inline_keyboard.slice(0,3).filter(r=>r[0].callback_data.startsWith("a:1:")).length===1);
ck("callback_data within Telegram's 64 bytes",M.reply_markup.inline_keyboard.slice(0,3).every(r=>Buffer.byteLength(r[0].callback_data)<=64));
{const L4=[["<b>","x","",""," "],["a&b","1","","",""],["c","2","","",""],["d","3","","",""]];let esc=true;for(let d=0;d<20;d++){const t=dailyMessage(L4,"d"+d,"en").text;if(/<b>[^<]*<b>|a&b/.test(t))esc=false;}
ck("HTML special chars in words are escaped",esc);}

/* ---- mock env ---- */
const kv=new Map(),calls=[];let siteFetches=0,blocked=new Set();
const env={TG_TOKEN:"123:ABC",TG_SECRET:"s3cret",TG_BOT:"salkhi_bot",
  TTS_KV:{get:async(k,o)=>{const v=kv.get(k);return v==null?null:(o&&o.type==="json"?JSON.parse(v):v);},put:async(k,v)=>{kv.set(k,v);}},
  SITE_FETCH:async u=>{siteFetches++;return new Response(/words-(en|ru)\.js$/.test(u)?SRC:"",{status:/words-(en|ru)\.js$/.test(u)?200:404});},
  TG_FETCH:async(u,o)=>{const m=u.split("/").pop(),b=JSON.parse(o.body);calls.push({m,b});
    if(m==="sendMessage"&&blocked.has(String(b.chat_id)))return new Response('{"ok":false}',{status:403});
    return new Response(JSON.stringify({ok:true,result:true}));}};
const hook=(body,secret)=>handleTelegram(new Request("https://w.dev/tg",{method:"POST",headers:{"X-Telegram-Bot-Api-Secret-Token":secret??"s3cret"},body:JSON.stringify(body)}),env,Date.UTC(2026,9,13,2,0));

let r=await hook({message:{chat:{id:7},text:"/start"}},"wrong");
ck("webhook rejects a wrong secret (403)",r.status===403&&calls.length===0);
r=await hook({message:{chat:{id:7},text:"/start"}});
ck("/start replies with help + language keyboard",r.status===200&&calls.length===1&&calls[0].b.reply_markup.inline_keyboard.flat().length===7);
calls.length=0;
await hook({callback_query:{id:"c1",data:"l:en",message:{chat:{id:7}}}});
ck("choosing a language subscribes the chat",JSON.parse(kv.get("tg:subs"))["7"].l==="en");
ck("…answers the button, confirms, and sends today's word",calls.map(c=>c.m).join(",")==="answerCallbackQuery,sendMessage,sendMessage"&&/Өдрийн үг/.test(calls[2].b.text));
ck("words are cached in KV after the first fetch",kv.has("tg:w:en")&&siteFetches===1);
const right=calls[2].b.reply_markup.inline_keyboard.slice(0,3).map(x=>x[0]).find(b=>b.callback_data.startsWith("a:1:"));
const wrong=calls[2].b.reply_markup.inline_keyboard.slice(0,3).map(x=>x[0]).find(b=>b.callback_data.startsWith("a:0:"));
calls.length=0;
await hook({callback_query:{id:"c2",data:right.callback_data,message:{chat:{id:7}}}});
ck("correct answer → ✅ toast",calls[0].m==="answerCallbackQuery"&&/Зөв!/.test(calls[0].b.text)&&!calls[0].b.show_alert);
calls.length=0;
await hook({callback_query:{id:"c3",data:wrong.callback_data,message:{chat:{id:7}}}});
ck("wrong answer → alert with the right meaning",/Буруу/.test(calls[0].b.text)&&calls[0].b.text.indexOf(right.text)>=0&&calls[0].b.show_alert===true,calls[0]&&calls[0].b.text);
calls.length=0;
await hook({message:{chat:{id:7},text:"/word@salkhi_bot"}});
ck("/word (with @botname) sends today's word",calls.length===1&&/Өдрийн үг/.test(calls[0].b.text));
calls.length=0;
await hook({message:{chat:{id:99},text:"/word"}});
ck("/word before choosing a language asks for one",calls.length===1&&calls[0].b.reply_markup&&/хэлээ сонго/.test(calls[0].b.text));
calls.length=0;
await hook({message:{chat:{id:7},text:"/stop"}});
ck("/stop unsubscribes",!JSON.parse(kv.get("tg:subs"))["7"]&&/зогсоолоо/.test(calls[0].b.text));
calls.length=0;
await hook({message:{chat:{id:7},text:"hello"}});
ck("free text gets the help message",calls.length===1&&/\/lang/.test(calls[0].b.text));
calls.length=0;
await hook({edited_message:{chat:{id:7}}});
ck("unknown update types are ignored with 200",calls.length===0);

/* ---- setup ---- */
calls.length=0;
let s=await handleTgSetup(new URL("https://w.dev/tg/setup?key=nope"),env);
ck("setup rejects a wrong key",s.status===403&&calls.length===0);
s=await handleTgSetup(new URL("https://w.dev/tg/setup?key=s3cret"),env);
ck("setup registers webhook with secret + commands",s.status===200&&calls[0].m==="setWebhook"&&calls[0].b.url==="https://w.dev/tg"&&calls[0].b.secret_token==="s3cret"&&calls[1].m==="setMyCommands");

/* ---- daily cron: 100 subscribers (en/ru + 1 unknown lang), 3 blocked ---- */
const subs={};for(let i=0;i<100;i++)subs[String(1000+i)]={l:i%2?"en":"ru"};subs["5555"]={l:"xx"};
kv.set("tg:subs",JSON.stringify(subs));blocked=new Set(["1003","1050","1099"]);kv.delete("tg:w:en");kv.delete("tg:w:ru");
let runs=0,maxCalls=0,res;const t0=Date.UTC(2026,9,14,1,0);const got=new Map();
do{calls.length=0;const sf=siteFetches;res=await runTgDaily(env,t0+runs*600000);runs++;maxCalls=Math.max(maxCalls,calls.length+(siteFetches-sf));
  calls.filter(c=>c.m==="sendMessage").forEach(c=>got.set(String(c.b.chat_id),(got.get(String(c.b.chat_id))||0)+1));}while(!res.done&&runs<20);
ck("daily run finishes in several batches",res.done&&runs===3,JSON.stringify(res)+" runs="+runs);
ck("every subscriber got exactly one message",got.size===100&&[...got.values()].every(v=>v===1),got.size);
ck("sent count excludes blocked users",res.sent===97,res.sent);
ck("each run stays within 50 subrequests",maxCalls<=50,"max "+maxCalls);
ck("blocked users are removed from subscribers",["1003","1050","1099"].every(id=>!JSON.parse(kv.get("tg:subs"))[id])&&Object.keys(JSON.parse(kv.get("tg:subs"))).length===98);
calls.length=0;res=await runTgDaily(env,t0+3600000);
ck("a later run the same day sends nothing",res.done&&calls.length===0);
/* шинэ захиалагч илгээлтийн дундуур нэмэгдвэл (жагсаалтын эхэнд эрэмбэлэгдэх id) бусдыг алгасахгүй */
kv.set("tg:subs",JSON.stringify({"200":{l:"en"},"400":{l:"en"},"600":{l:"en"}}));blocked=new Set();
const t1=Date.UTC(2026,9,15,1,0),k1="tg:day:"+dayMN(t1);kv.set(k1,JSON.stringify({last:"400",sent:2}));
const s2=JSON.parse(kv.get("tg:subs"));s2["100"]={l:"en"};kv.set("tg:subs",JSON.stringify(s2));
calls.length=0;res=await runTgDaily(env,t1);
ck("resume after cursor sends only the remaining subscriber",calls.filter(c=>c.m==="sendMessage").map(c=>String(c.b.chat_id)).join()==="600"&&res.done);
ck("not configured → skipped",(await runTgDaily({},t0)).skip==="not_configured");

/* ---- index.js routing ---- */
const ctx={waitUntil:p=>p};
r=await worker.fetch(new Request("https://w.dev/tg/status"),env,ctx);
ck("/tg/status reports configured + bot name",(await r.json()).bot==="salkhi_bot");
r=await worker.fetch(new Request("https://w.dev/tg",{method:"POST",headers:{"X-Telegram-Bot-Api-Secret-Token":"bad"},body:"{}"}),env,ctx);
ck("/tg route reaches the webhook handler (no Origin needed)",r.status===403);
let which="";const env2=Object.assign({},env,{TTS_KV:{get:async()=>{which="tg";return null;},put:async()=>{}}});
await worker.scheduled({cron:"*/10 1-2 * * *"},env2,{waitUntil:p=>p.catch(()=>{})});
ck("daily cron string routes to the Telegram job",which==="tg");

console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
