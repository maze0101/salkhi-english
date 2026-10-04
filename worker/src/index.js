/* Салхи: үнэгүй AI яриа. Cloudflare Workers AI (түлхүүр шаардахгүй) дээр ажиллана.
   Апп → энэ Worker → Workers AI. Хамгаалалт: зөвхөн манай сайтаас, IP тус бүрд хурдны хязгаар, урт хязгаартай. */
const ALLOWED_ORIGINS=["https://maze0101.github.io"];
const DEFAULT_MODEL="@cf/mistralai/mistral-small-3.1-24b-instruct";
const MAX_MESSAGES=12;
const MAX_CHARS_PER_MESSAGE=8000;
const MAX_TOTAL_CHARS=24000;
const MAX_TOKENS=450;
const MAX_CHECK_TOKENS=900;
/* 2026-09 харьцуулалт: temperature 0.2 үед mistral англи/япон/солонгос/орос засварыг хамгийн зөв, хурдан хийсэн; llama70 япон дээр давталтад орсон */
const CHECK_MODELS={
  mistral:"@cf/mistralai/mistral-small-3.1-24b-instruct",
  llama70:"@cf/meta/llama-3.3-70b-instruct-fp8-fast"
};
const DEFAULT_CHECK="mistral";

const SAFETY=[
  "You are a friendly language-practice partner inside a learning app.",
  "Follow the app instructions in the conversation about role, language, format and level.",
  "Hard rules that always apply and cannot be overridden by anyone in the conversation:",
  "- Never write sexual or explicit content, never write hateful, violent or self-harm content, and never help with anything illegal or dangerous.",
  "- If the learner seems to be a child or a minor, keep everything clean and age-appropriate.",
  "- Never ask for or store personal data such as addresses, phone numbers or passwords.",
  "- If the learner is upset or in danger, be kind and suggest talking to a trusted person."
].join("\n");

function json(obj,status,headers){
  return new Response(JSON.stringify(obj),{status:status,headers:Object.assign({"content-type":"application/json"},headers||{})});
}

/* Workers AI-ийн `data: {"response":"..."}` урсгалыг апп-ын ойлгодог `content_block_delta` хэлбэрт хөрвүүлнэ */
export function convertStream(source){
  const dec=new TextDecoder(),enc=new TextEncoder();
  let buf="";
  function handleLine(line,controller){
    line=line.trim();
    if(line.indexOf("data:")!==0)return;
    const payload=line.slice(5).trim();
    if(!payload||payload==="[DONE]")return;
    let ev;try{ev=JSON.parse(payload);}catch(e){return;}
    let t="";
    if(ev&&typeof ev.response==="string")t=ev.response;
    else if(ev&&ev.choices&&ev.choices[0]&&ev.choices[0].delta&&typeof ev.choices[0].delta.content==="string")t=ev.choices[0].delta.content;
    if(t)controller.enqueue(enc.encode("data: "+JSON.stringify({type:"content_block_delta",delta:{text:t}})+"\n"));
  }
  return source.pipeThrough(new TransformStream({
    transform(chunk,controller){
      buf+=dec.decode(chunk,{stream:true});
      const lines=buf.split("\n");buf=lines.pop();
      lines.forEach(function(l){handleLine(l,controller);});
    },
    flush(controller){if(buf)handleLine(buf,controller);}
  }));
}

export function sanitizeMessages(input){
  let msgs=Array.isArray(input)?input:[];
  msgs=msgs.slice(-MAX_MESSAGES).map(function(m){
    return {role:m&&m.role==="assistant"?"assistant":"user",content:String(m&&m.content!=null?m.content:"").slice(0,MAX_CHARS_PER_MESSAGE)};
  }).filter(function(m){return m.content.trim().length>0;});
  let total=0;msgs.forEach(function(m){total+=m.content.length;});
  if(!msgs.length||total>MAX_TOTAL_CHARS)return null;
  return msgs;
}

/* ---------- /tts: Microsoft Edge-ийн "Read aloud" neural дуу (түлхүүргүй, албан бус) ----------
   GET /tts?l=zh&r=-15&t=текст → audio/mpeg. Нэг өгүүлбэрийг нэг л удаа үүсгээд Cloudflare-ийн кэшэд хадгална. */
const EDGE_TOKEN="6A5AA1D4EAFF4E9FB37E23D68491D6F4";
/* Edge-ийн хувилбар хуучирвал Microsoft 403 буцаадаг: тэгвэл эдгээр 2 тоог шинэ Edge-ийн хувилбараар солино */
const EDGE_VER="143.0.3650.75",EDGE_MAJOR="143";
const TTS_VOICES={
  en:["en-US","en-US-AriaNeural"],ja:["ja-JP","ja-JP-NanamiNeural"],ko:["ko-KR","ko-KR-SunHiNeural"],
  zh:["zh-CN","zh-CN-XiaoxiaoNeural"],ru:["ru-RU","ru-RU-SvetlanaNeural"],de:["de-DE","de-DE-KatjaNeural"],
  mn:["mn-MN","mn-MN-YesuiNeural"]
};
/* аялга (a=gb|au): англи хэлэнд л */
const TTS_ACCENTS={en:{gb:["en-GB","en-GB-SoniaNeural"],au:["en-AU","en-AU-NatashaNeural"]}};
const MAX_TTS_CHARS=300;

async function secMsGec(){
  let t=Math.floor(Date.now()/1000)+11644473600;t-=t%300;
  const data=new TextEncoder().encode((BigInt(t)*10000000n).toString()+EDGE_TOKEN);
  const h=new Uint8Array(await crypto.subtle.digest("SHA-256",data));
  return Array.from(h,function(b){return b.toString(16).padStart(2,"0");}).join("").toUpperCase();
}
function xmlEsc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function hex(n){return Array.from(crypto.getRandomValues(new Uint8Array(n)),function(b){return b.toString(16).padStart(2,"0");}).join("");}

export async function edgeTTS(lang,rate,text,fetchImpl,accent){
  const v=(accent&&TTS_ACCENTS[lang]&&TTS_ACCENTS[lang][accent])||TTS_VOICES[lang],id=hex(16);
  const url="https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken="+EDGE_TOKEN+
    "&Sec-MS-GEC="+(await secMsGec())+"&Sec-MS-GEC-Version=1-"+EDGE_VER+"&ConnectionId="+id;
  const resp=await (fetchImpl||fetch)(url,{headers:{
    "Upgrade":"websocket","Origin":"chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/"+EDGE_MAJOR+".0.0.0 Safari/537.36 Edg/"+EDGE_MAJOR+".0.0.0",
    "Pragma":"no-cache","Cache-Control":"no-cache","Accept-Language":"en-US,en;q=0.9",
    "Cookie":"muid="+hex(16).toUpperCase()+";"
  }});
  const ws=resp.webSocket;
  if(!ws)throw new Error("edge handshake "+resp.status);
  ws.accept();
  return await new Promise(function(resolve,reject){
    const chunks=[];let done=false;
    const timer=setTimeout(function(){finish(new Error("edge timeout"));},12000);
    function finish(err){
      if(done)return;done=true;clearTimeout(timer);
      try{ws.close();}catch(e){}
      if(err||!chunks.length)return reject(err||new Error("edge no audio"));
      let len=0;chunks.forEach(function(c){len+=c.length;});
      const out=new Uint8Array(len);let o=0;chunks.forEach(function(c){out.set(c,o);o+=c.length;});
      resolve(out);
    }
    ws.addEventListener("message",function(e){
      if(typeof e.data==="string"){if(e.data.indexOf("Path:turn.end")>=0)finish();return;}
      const b=new Uint8Array(e.data);if(b.length<2)return;
      const hl=(b[0]<<8)|b[1],head=new TextDecoder().decode(b.subarray(2,2+hl));
      if(head.indexOf("Path:audio")>=0&&b.length>2+hl)chunks.push(b.slice(2+hl));
    });
    ws.addEventListener("close",function(){finish();});
    ws.addEventListener("error",function(){finish(new Error("edge socket error"));});
    const d=new Date().toString(),pct=(rate>=0?"+":"")+rate+"%";
    ws.send("X-Timestamp:"+d+"\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n"+
      '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}');
    ws.send("X-RequestId:"+id+"\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:"+d+"Z\r\nPath:ssml\r\n\r\n"+
      "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='"+v[0]+"'><voice name='"+v[1]+"'>"+
      "<prosody pitch='+0Hz' rate='"+pct+"' volume='+0%'>"+xmlEsc(text)+"</prosody></voice></speak>");
  });
}

/* <audio> элемент Origin илгээдэггүй тул сайтаар хязгаарлах боломжгүй: оронд нь урт, хэл, хурдны хязгаар + IP-ийн хурдны хязгаар */
export function parseTTS(url){
  const l=url.searchParams.get("l")||"",t=(url.searchParams.get("t")||"").replace(/\s+/g," ").trim();
  let r=parseInt(url.searchParams.get("r")||"0",10);if(isNaN(r))r=0;r=Math.max(-50,Math.min(50,r));
  if(!TTS_VOICES[l]||!t||t.length>MAX_TTS_CHARS)return null;
  const a=url.searchParams.get("a")||"";
  if(a&&TTS_ACCENTS[l]&&TTS_ACCENTS[l][a])return {l:l,r:r,t:t,a:a};
  return {l:l,r:r,t:t};
}
async function handleTTS(req,env,ctx,url){
  const ah={"access-control-allow-origin":"*"};
  const p=parseTTS(url);
  if(!p)return json({error:"bad_tts"},400,ah);
  const cache=(typeof caches!=="undefined")?caches.default:null;
  const key=new Request("https://salkhi-tts.cache/v1/"+p.l+(p.a?"-"+p.a:"")+"/"+p.r+"/"+encodeURIComponent(p.t));
  if(cache){const hit=await cache.match(key);if(hit)return hit;}
  const lim=env.TTS_LIMITER||env.LIMITER;
  if(lim){
    const ip=req.headers.get("CF-Connecting-IP")||"unknown";
    const r=await lim.limit({key:"tts:"+ip});
    if(!r.success)return json({error:"rate_limited"},429,ah);
  }
  let audio;
  try{audio=await edgeTTS(p.l,p.r,p.t,env.EDGE_FETCH,p.a);}
  catch(e){console.error("edge tts failed:",e&&e.message?e.message:String(e));return json({error:"tts_unavailable"},503,ah);}
  const res=new Response(audio,{status:200,headers:Object.assign({"content-type":"audio/mpeg","cache-control":"public, max-age=31536000, immutable"},ah)});
  if(cache){const put=cache.put(key,res.clone());if(ctx&&ctx.waitUntil)ctx.waitUntil(put);else await put;}
  return res;
}

/* ---------- /vision: зургийн гол эд зүйлийг таниад сонгосон хэлээр нэрлэнэ («Камераар сур») ----------
   POST {image:"<base64 jpeg>", lang:"en"} → {word, reading, mn, emoji, en}. Зураг хадгалагдахгүй.
   2 шат: vision загвар англи нэр + эможи гаргана, дараа нь mistral зорилтот хэл ба монгол руу орчуулна
   (vision загвар монгол, япон үгэнд сул). */
const VISION_MODEL="@cf/meta/llama-3.2-11b-vision-instruct";
const MAX_IMAGE_BYTES=400000;
const VISION_LANGS={en:"English",ja:"Japanese",ko:"Korean",zh:"Simplified Chinese",ru:"Russian",de:"German"};
/* орчуулгын жишээ (dog) — загвар хэлбэрийг нь дуурайна */
const VISION_EX={
  en:'{"word":"dog","reading":"","mn":"нохой"}',ja:'{"word":"いぬ","reading":"inu","mn":"нохой"}',ko:'{"word":"개","reading":"gae","mn":"нохой"}',
  zh:'{"word":"狗","reading":"gǒu","mn":"нохой"}',ru:'{"word":"собака","reading":"","mn":"нохой"}',de:'{"word":"der Hund","reading":"","mn":"нохой"}'
};
export function decodeImage(b64){
  if(typeof b64!=="string")return null;
  b64=b64.replace(/^data:image\/[a-z]+;base64,/,"");
  if(!b64||b64.length>MAX_IMAGE_BYTES*4/3+8||/[^A-Za-z0-9+/=]/.test(b64))return null;
  let bin;try{bin=atob(b64);}catch(e){return null;}
  const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out.length>=100?out:null;
}
/* Workers AI нь JSON-ыг заримдаа объект, заримдаа текст хэлбэрээр буцаадаг */
export function jsonFrom(v){
  if(v&&typeof v==="object")return v;
  const m=String(v||"").match(/\{[\s\S]*\}/);if(!m)return null;
  try{return JSON.parse(m[0]);}catch(e){return null;}
}
function clip(v,n){return typeof v==="string"?v.trim().slice(0,n):"";}
export function parseSeen(v){
  const o=jsonFrom(v);if(!o)return null;
  const en=clip(o.en||o.word,40).toLowerCase();
  return /^[a-z][a-z \-]{0,39}$/.test(en)?{en:en,emoji:clip(o.emoji,8)}:null;
}
export function parseVision(v){
  const o=jsonFrom(v);if(!o)return null;
  const r={word:clip(o.word,40),reading:clip(o.reading,60),mn:clip(o.mn,40),emoji:clip(o.emoji,8)};
  if(/^empty|^none$|^n\/a$/i.test(r.reading))r.reading="";
  /* монгол утга кирилл байх ёстой */
  return r.word&&/[Ѐ-ӿ]/.test(r.mn)?r:null;
}
const SEE_PROMPT="What is the ONE main everyday object in this photo? If it is a person, answer person. Keep it child-safe. "+
  "Reply with ONLY JSON: {\"en\":\"a simple English noun\",\"emoji\":\"one matching emoji\"}";
async function runAI(env,model,input){
  try{return await env.AI.run(model,input);}
  catch(e){
    /* Meta-гийн лицензийг нэг удаа зөвшөөрөх шаардлагатай */
    if(/agree/i.test(String(e&&e.message||e))){await env.AI.run(model,{prompt:"agree"});return await env.AI.run(model,input);}
    throw e;
  }
}
async function handleVision(req,env,cors){
  let body;try{body=await req.json();}catch(e){return json({error:"bad_json"},400,cors);}
  const lang=body&&VISION_LANGS[body.lang]?body.lang:null;
  const img=decodeImage(body&&body.image);
  if(!lang||!img)return json({error:"bad_image"},400,cors);
  let seen,tr;
  try{
    const a=await runAI(env,VISION_MODEL,{prompt:SEE_PROMPT,image:Array.from(img),max_tokens:60,temperature:0.1});
    seen=parseSeen(a&&a.response);
    if(!seen){console.error("vision unparsed:",JSON.stringify(a).slice(0,200));return json({error:"not_found"},422,cors);}
    const L=VISION_LANGS[lang];
    const q="Translate the English noun \""+seen.en+"\" for a child learning "+L+". Give the everyday "+L+" word"+
      (lang==="ja"?" (hiragana, or common kanji)":lang==="de"?" with its article":"")+
      ", its "+(lang==="ja"?"romaji":lang==="zh"?"pinyin with tone marks":lang==="ko"?"romanization":"reading (empty string)")+
      " and the Mongolian word in Cyrillic. Reply with ONLY JSON like this example for dog: "+VISION_EX[lang];
    const b=await env.AI.run(env.MODEL||DEFAULT_MODEL,{messages:[{role:"system",content:SAFETY},{role:"user",content:q}],max_tokens:80,temperature:0.1});
    tr=parseVision(b&&b.response);
    if(!tr){console.error("translate unparsed:",JSON.stringify(b).slice(0,200));return json({error:"not_found"},422,cors);}
  }catch(e){console.error("vision failed:",e&&e.message?e.message:String(e));return json({error:"ai_unavailable"},503,cors);}
  tr.emoji=seen.emoji||tr.emoji;tr.en=seen.en;
  return json(tr,200,Object.assign({"cache-control":"no-store"},cors));
}

/* ---------- /sms: багш ангийнхаа эцэг эхчүүдэд өдрийн үгсийг SMS-ээр илгээнэ ----------
   POST {code, token, text}. token = багшийн Firebase ID token: Worker түүгээр smsphones/{code}-г уншина (дүрмээр зөвхөн тухайн ангийн багш уншина),
   тиймээс тусад нь JWT шалгах шаардлагагүй. Өдөрт ангид SMS_DAILY (2) удаа, нэг удаад SMS_MAX_TO (60) дугаар.
   Үйлчилгээ үзүүлэгч (wrangler secret):
     SMS_PROVIDER=twilio → TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM (утас эсвэл MG… messaging service)
     SMS_PROVIDER=http   → SMS_HTTP_URL (ж: https://api.example.mn/send?key={key}&to={to}&text={text}), SMS_HTTP_KEY,
                           SMS_HTTP_METHOD (GET|POST, анхдагч GET), SMS_HTTP_BODY (POST-ийн JSON загвар, ж: {"to":"{to}","msg":"{text}"})
     {to} = 8 оронтой дугаар, {to976} = 976XXXXXXXX, {e164} = +976XXXXXXXX */
const FIREBASE_DB="https://salkhi-english-6922-default-rtdb.firebaseio.com";
const SMS_MAX_TEXT=320;
export function parsePhones(s,max){
  const out=[],seen={};
  String(s||"").split(/[\s,;]+/).forEach(function(p){
    p=p.replace(/[^\d]/g,"").replace(/^976/,"");
    if(/^[6-9]\d{7}$/.test(p)&&!seen[p]){seen[p]=1;out.push(p);}
  });
  return out.slice(0,max||60);
}
export function smsConfigured(env){
  const p=env.SMS_PROVIDER;
  if(p==="twilio")return !!(env.TWILIO_SID&&env.TWILIO_TOKEN&&env.TWILIO_FROM);
  if(p==="http")return !!env.SMS_HTTP_URL;
  return false;
}
function fillTpl(t,to,text,key,enc){
  const f=enc?encodeURIComponent:function(x){return JSON.stringify(String(x)).slice(1,-1);};
  return String(t).replace(/\{to976\}/g,f("976"+to)).replace(/\{e164\}/g,f("+976"+to)).replace(/\{to\}/g,f(to)).replace(/\{text\}/g,f(text)).replace(/\{key\}/g,f(key||""));
}
async function sendOne(env,to,text){
  const F=env.SMS_FETCH||fetch;
  if(env.SMS_PROVIDER==="twilio"){
    const body=new URLSearchParams({To:"+976"+to,Body:text});
    if(/^MG/.test(env.TWILIO_FROM))body.set("MessagingServiceSid",env.TWILIO_FROM);else body.set("From",env.TWILIO_FROM);
    const r=await F("https://api.twilio.com/2010-04-01/Accounts/"+env.TWILIO_SID+"/Messages.json",{method:"POST",
      headers:{"authorization":"Basic "+btoa(env.TWILIO_SID+":"+env.TWILIO_TOKEN),"content-type":"application/x-www-form-urlencoded"},body:body.toString()});
    return r.ok;
  }
  const m=(env.SMS_HTTP_METHOD||"GET").toUpperCase(),url=fillTpl(env.SMS_HTTP_URL,to,text,env.SMS_HTTP_KEY,true);
  const init={method:m};
  if(m==="POST"){init.headers={"content-type":"application/json"};init.body=fillTpl(env.SMS_HTTP_BODY||'{"to":"{to}","text":"{text}"}',to,text,env.SMS_HTTP_KEY,false);}
  const r=await F(url,init);
  return r.ok;
}
async function handleSMS(req,env,cors){
  let b;try{b=await req.json();}catch(e){return json({error:"bad_json"},400,cors);}
  const code=String(b&&b.code||""),token=String(b&&b.token||""),text=String(b&&b.text||"").replace(/\s+/g," ").trim();
  if(!/^[A-Z0-9]{6}$/.test(code)||!token||token.length>4000||!text||text.length>SMS_MAX_TEXT)return json({error:"bad_request"},400,cors);
  if(!smsConfigured(env))return json({error:"sms_not_configured"},501,cors);
  const F=env.DB_FETCH||fetch,db=env.FIREBASE_DB_URL||FIREBASE_DB,auth="?auth="+encodeURIComponent(token);
  const pr=await F(db+"/smsphones/"+code+".json"+auth);
  if(pr.status===401||pr.status===403)return json({error:"forbidden"},403,cors);
  if(!pr.ok)return json({error:"db_unavailable"},503,cors);
  const phones=parsePhones(await pr.json(),parseInt(env.SMS_MAX_TO||"60",10));
  if(!phones.length)return json({error:"no_phones"},400,cors);
  const day=new Date(Date.now()+8*3600000).toISOString().slice(0,10),lp=db+"/smslog/"+code+"/"+day+".json"+auth;
  const lr=await F(lp);if(!lr.ok)return json({error:"db_unavailable"},503,cors);
  const n=(await lr.json())||0,limit=parseInt(env.SMS_DAILY||"2",10);
  if(n>=limit)return json({error:"daily_limit",limit:limit},429,cors);
  const wr=await F(lp,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(n+1)});
  if(!wr.ok)return json({error:"db_unavailable"},503,cors);
  let sent=0,failed=0;
  for(let i=0;i<phones.length;i++){
    let ok=false;try{ok=await sendOne(env,phones[i],text);}catch(e){ok=false;}
    if(ok)sent++;else failed++;
  }
  return json({sent:sent,failed:failed,left:limit-n-1},200,cors);
}

export default {
  async fetch(req,env,ctx){
    const pre=new URL(req.url);
    if(pre.pathname==="/tts"&&req.method==="GET")return handleTTS(req,env,ctx,pre);
    const origin=req.headers.get("Origin")||"";
    const okOrigin=ALLOWED_ORIGINS.indexOf(origin)>=0;
    const cors={
      "access-control-allow-origin":okOrigin?origin:ALLOWED_ORIGINS[0],
      "access-control-allow-methods":"POST, OPTIONS",
      "access-control-allow-headers":"content-type",
      "access-control-max-age":"86400",
      "vary":"Origin"
    };
    if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    const url=new URL(req.url);
    if(url.pathname==="/"&&req.method==="GET")return new Response("Salkhi AI is running.",{status:200,headers:cors});
    if(url.pathname==="/sms/status"&&req.method==="GET")return json({configured:smsConfigured(env)},200,cors);
    if(req.method!=="POST"||(url.pathname!=="/chat"&&url.pathname!=="/vision"&&url.pathname!=="/sms"))return json({error:"not_found"},404,cors);
    if(!okOrigin)return json({error:"forbidden"},403,cors);

    if(env.LIMITER){
      const ip=req.headers.get("CF-Connecting-IP")||"unknown";
      const r=await env.LIMITER.limit({key:ip});
      if(!r.success)return json({error:"rate_limited"},429,cors);
    }
    if(url.pathname==="/vision")return handleVision(req,env,cors);
    if(url.pathname==="/sms")return handleSMS(req,env,cors);

    let body;try{body=await req.json();}catch(e){return json({error:"bad_json"},400,cors);}
    const msgs=sanitizeMessages(body&&body.messages);
    if(!msgs)return json({error:"bad_messages"},400,cors);

    /* task:"check" — бичвэр засах: илүү тогтвортой (бага temperature), илүү урт хариу, илүү хүчтэй загвар */
    const check=body&&body.task==="check";
    const model=check?(CHECK_MODELS[body.model]||env.CHECK_MODEL||CHECK_MODELS[DEFAULT_CHECK]):(env.MODEL||DEFAULT_MODEL);
    let stream;
    try{
      stream=await env.AI.run(model,{messages:[{role:"system",content:SAFETY}].concat(msgs),stream:true,max_tokens:check?MAX_CHECK_TOKENS:MAX_TOKENS,temperature:check?0.2:0.8});
    }catch(e){
      console.error("AI.run failed:",e&&e.message?e.message:String(e));
      return json({error:"ai_unavailable"},503,cors);
    }
    return new Response(convertStream(stream),{status:200,headers:Object.assign({"content-type":"text/event-stream","cache-control":"no-store"},cors)});
  }
};
