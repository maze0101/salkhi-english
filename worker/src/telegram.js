/* Салхи: 💬 Telegram бот — өдөр бүр «өдрийн үг» + нэг асуулт (товчоор хариулна).
   Тохиргоо (нэг удаа):
     1) Telegram-д @BotFather → /newbot → токен авна
     2) npx wrangler secret put TG_TOKEN   (BotFather-ийн токен)
        npx wrangler secret put TG_SECRET  (өөрөө зохиосон урт нууц үг, зөвхөн a-z A-Z 0-9 _ -)
        wrangler.toml [vars] TG_BOT = "<ботын username, @-гүй>"
     3) deploy хийгээд https://<worker>/tg/setup?key=<TG_SECRET> хаягийг нэг удаа нээнэ (webhook + командуудыг бүртгэнэ)
   Төлөв (TTS_KV): "tg:subs" = {chatId: {l: хэл}}; "tg:day:{огноо}" = илгээлтийн явц; "tg:w:{хэл}" = үгсийн кэш (7 хоног).
   Үнэгүй багцын нэг удаагийн 50 хүсэлтийн хязгаараас болж өглөөний илгээлтийг 10 минут тутам хэсэгчлэн хийнэ
   (UTC 01–02 цагт 10 минут тутам = Монголын цагаар 09:00–10:50, 12 удаа × BUDGET ≈ 450 захиалагч/өдөр). */

const SITE="https://maze0101.github.io/salkhi-english/";
export const TG_LANGS={en:"🇬🇧 Англи",ja:"🇯🇵 Япон",ko:"🇰🇷 Солонгос",zh:"🇨🇳 Хятад",ru:"🇷🇺 Орос",de:"🇩🇪 Герман",ug:"Уйгур"};
const BUDGET=40;

export function tgConfigured(env){return !!(env.TG_TOKEN&&env.TG_SECRET&&env.TTS_KV);}
function api(env,method,body){
  const F=env.TG_FETCH||fetch;
  return F("https://api.telegram.org/bot"+env.TG_TOKEN+"/"+method,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
}
/* Монголын цагаар (UTC+8) өнөөдрийн огноо */
export function dayMN(now){return new Date((now||Date.now())+8*3600000).toISOString().slice(0,10);}
function hash(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return x>>>0;}
function esc(s){return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]);}

/* words-<хэл>.js: window.WORDS_MORE.xx=`түвшин|үг|монгол|жишээ|жишээний орчуулга|дуудлага|ангилал` */
export function parseWords(src){
  const m=String(src).match(/`([\s\S]*)`/);if(!m)return [];
  const out=[],seen={};
  m[1].split("\n").forEach(line=>{
    const x=line.trim().split("|");
    if(x.length<4||!x[1]||!x[2]||x[1].length>30||seen[x[1]])return;
    seen[x[1]]=1;out.push([x[1],x[2],x[3]||"",x[4]||"",x[5]||""]);
  });
  return out;
}
async function words(env,lang){
  const k="tg:w:"+lang,c=await env.TTS_KV.get(k,{type:"json"});
  if(c&&c.length)return c;
  const F=env.SITE_FETCH||fetch,r=await F((env.SITE_URL||SITE)+"words-"+lang+".js");
  if(!r.ok)throw new Error("words "+lang+" "+r.status);
  const w=parseWords(await r.text());
  if(w.length>=4)await env.TTS_KV.put(k,JSON.stringify(w),{expirationTtl:7*86400});
  return w;
}
/* өдрийн үг ба асуулт: тухайн өдөр, хэлээр тогтмол (бүх захиалагч ижил үг авна) */
export function dailyPick(list,day,lang){
  const n=list.length,a=hash(day+":"+lang)%n;
  let q=(a+1+hash(lang+":"+day)%(n-1))%n;
  const used={[a]:1,[q]:1},wrong=[];
  for(let i=1;wrong.length<2&&i<n;i++){const j=(q+i*7)%n;if(!used[j]&&list[j][1]!==list[q][1]){used[j]=1;wrong.push(j);}}
  const opts=[q].concat(wrong),s=hash(day+lang+"o");
  for(let i=opts.length-1;i>0;i--){const j=(s>>>(i*3))%(i+1);[opts[i],opts[j]]=[opts[j],opts[i]];}
  return {w:a,q:q,opts:opts};
}
export function dailyMessage(list,day,lang){
  const p=dailyPick(list,day,lang),w=list[p.w],q=list[p.q];
  const text="🌬️ <b>Өдрийн үг</b> · "+TG_LANGS[lang]+"\n\n"+
    "<b>"+esc(w[0])+"</b>"+(w[4]?"  <i>"+esc(w[4])+"</i>":"")+"\n🇲🇳 "+esc(w[1])+
    (w[2]?"\n\n📝 "+esc(w[2])+(w[3]?"\n— "+esc(w[3]):""):"")+
    "\n\n❓ «<b>"+esc(q[0])+"</b>» гэж юу гэсэн үг вэ?";
  const kb=p.opts.map(i=>[{text:list[i][1].slice(0,60),callback_data:"a:"+(i===p.q?1:0)+":"+lang+":"+p.q}]);
  kb.push([{text:"📱 Салхи апп-аар үргэлжлүүлэх",url:SITE}]);
  return {text,reply_markup:{inline_keyboard:kb}};
}
function langKeyboard(){
  const ks=Object.keys(TG_LANGS),rows=[];
  for(let i=0;i<ks.length;i+=2)rows.push(ks.slice(i,i+2).map(l=>({text:TG_LANGS[l],callback_data:"l:"+l})));
  return {inline_keyboard:rows};
}
async function subs(env){return (await env.TTS_KV.get("tg:subs",{type:"json"}))||{};}
async function setSub(env,chat,val){
  const s=await subs(env);
  if(val)s[chat]=val;else delete s[chat];
  await env.TTS_KV.put("tg:subs",JSON.stringify(s));
}
const HELP="Сайн уу! 🌬️ Би <b>Салхи</b> — гадаад хэл сурах апп-ын бот.\n\nӨдөр бүр өглөө 9–11 цагийн хооронд <b>өдрийн үг</b> ба нэг асуулт илгээнэ.\n\n"+
  "/lang — хэл сонгох\n/word — өнөөдрийн үгийг одоо авах\n/stop — илгээлтийг зогсоох\n\n📱 Апп: "+SITE;

async function sendDaily(env,chat,lang,now){
  const list=await words(env,lang);
  if(list.length<4)return api(env,"sendMessage",{chat_id:chat,text:"Энэ хэлний үг одоогоор ачаалагдсангүй. Дараа дахин оролдоно уу."});
  const m=dailyMessage(list,dayMN(now),lang);
  return api(env,"sendMessage",{chat_id:chat,text:m.text,parse_mode:"HTML",reply_markup:m.reply_markup,disable_web_page_preview:true});
}

/* POST /tg — Telegram webhook */
export async function handleTelegram(req,env,now){
  if(!tgConfigured(env))return new Response("not configured",{status:503});
  if(req.headers.get("X-Telegram-Bot-Api-Secret-Token")!==env.TG_SECRET)return new Response("forbidden",{status:403});
  let u;try{u=await req.json();}catch(e){return new Response("ok");}
  try{
    if(u.callback_query){
      const cq=u.callback_query,chat=cq.message&&cq.message.chat&&cq.message.chat.id,d=String(cq.data||"");
      if(d.startsWith("l:")&&TG_LANGS[d.slice(2)]&&chat!=null){
        const lang=d.slice(2);
        await setSub(env,String(chat),{l:lang});
        await api(env,"answerCallbackQuery",{callback_query_id:cq.id,text:TG_LANGS[lang]+" сонгогдлоо ✅"});
        await api(env,"sendMessage",{chat_id:chat,text:"✅ "+TG_LANGS[lang]+" хэлээр өдөр бүр өглөө өдрийн үг илгээнэ. Өнөөдрийнхийг одоо харъя 👇"});
        await sendDaily(env,chat,lang,now);
      }else if(d.startsWith("a:")){
        const p=d.split(":"),ok=p[1]==="1",lang=p[2],qi=+p[3];
        let right="";
        if(TG_LANGS[lang]&&!ok){const list=await words(env,lang);if(list[qi])right=" Зөв хариулт: "+list[qi][1];}
        await api(env,"answerCallbackQuery",{callback_query_id:cq.id,text:ok?"✅ Зөв! Гайхалтай 🎉":"❌ Буруу."+right,show_alert:!ok});
      }else await api(env,"answerCallbackQuery",{callback_query_id:cq.id});
      return new Response("ok");
    }
    const msg=u.message;if(!msg||!msg.chat)return new Response("ok");
    const chat=msg.chat.id,t=String(msg.text||"").trim().split(/[\s@]/)[0].toLowerCase();
    if(t==="/start"||t==="/lang")await api(env,"sendMessage",{chat_id:chat,text:(t==="/start"?HELP+"\n\n":"")+"👇 Аль хэлийг сурах вэ?",parse_mode:"HTML",reply_markup:langKeyboard(),disable_web_page_preview:true});
    else if(t==="/stop"){await setSub(env,String(chat),null);await api(env,"sendMessage",{chat_id:chat,text:"Өдрийн үгийн илгээлтийг зогсоолоо. Дахин эхлүүлэх бол /start 🌬️"});}
    else if(t==="/word"){
      const s=(await subs(env))[String(chat)];
      if(s)await sendDaily(env,chat,s.l,now);
      else await api(env,"sendMessage",{chat_id:chat,text:"Эхлээд хэлээ сонгоорой 👇",reply_markup:langKeyboard()});
    }else await api(env,"sendMessage",{chat_id:chat,text:HELP,parse_mode:"HTML",disable_web_page_preview:true});
  }catch(e){console.error("tg update failed",e&&e.message);}
  return new Response("ok");
}

/* GET /tg/setup?key=TG_SECRET — webhook, командуудыг бүртгэнэ */
export async function handleTgSetup(url,env){
  if(!tgConfigured(env))return {status:503,body:{error:"not_configured"}};
  if(url.searchParams.get("key")!==env.TG_SECRET)return {status:403,body:{error:"forbidden"}};
  const hook=url.origin+"/tg";
  const a=await (await api(env,"setWebhook",{url:hook,secret_token:env.TG_SECRET,allowed_updates:["message","callback_query"],drop_pending_updates:true})).json();
  const b=await (await api(env,"setMyCommands",{commands:[{command:"word",description:"Өнөөдрийн үг"},{command:"lang",description:"Хэл сонгох"},{command:"stop",description:"Илгээлтийг зогсоох"}]})).json();
  return {status:200,body:{webhook:a,commands:b,url:hook}};
}

/* cron: өнөөдрийн үгийг захиалагчдад хэсэгчлэн илгээнэ. Явц KV "tg:day:{огноо}" = {last, sent}:
   индекс биш сүүлд илгээсэн chatId-аас үргэлжилнэ (хасагдсан/шинэ захиалагч дарааллыг шилжүүлж хэн нэгнийг алгасахгүй) */
export async function runTgDaily(env,now){
  if(!tgConfigured(env))return {skip:"not_configured"};
  const day=dayMN(now),key="tg:day:"+day,kv=env.TTS_KV;
  const S=(await kv.get(key,{type:"json"}))||{last:"",sent:0};
  if(S.done)return {done:true,sent:S.sent};
  const all=await subs(env),ids=Object.keys(all).sort().filter(id=>id>S.last);
  let used=0,gone=[],i=0;
  const cache={};
  while(i<ids.length&&used<BUDGET){
    const id=ids[i],lang=all[id].l;
    S.last=id;i++;
    if(!TG_LANGS[lang])continue;
    if(!cache[lang]){const had=await kv.get("tg:w:"+lang);cache[lang]=1;if(!had)used++;}
    let r;try{r=await sendDaily(env,id,lang,now);}catch(e){r=null;}
    used++;
    /* 403: хэрэглэгч ботыг блоклосон эсвэл устгасан — жагсаалтаас хасна */
    if(r&&r.status===403)gone.push(id);
    else if(r&&r.ok)S.sent++;
  }
  if(i>=ids.length)S.done=true;
  if(gone.length){const s=await subs(env);gone.forEach(g=>delete s[g]);await kv.put("tg:subs",JSON.stringify(s));}
  await kv.put(key,JSON.stringify(S),{expirationTtl:3*86400});
  return {done:!!S.done,sent:S.sent,of:ids.length,removed:gone.length};
}
