import worker,{parseTTS,elSpeed} from "./src/index.js";
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log("✅",n);}else{fail++;console.log("❌",n,x||"");}};
function fakeEdge(){
  const f=async()=>{const L={};const ws={accept(){},addEventListener(t,fn){(L[t]=L[t]||[]).push(fn);},close(){},
    send(m){if(/Path:ssml/.test(m))setTimeout(()=>{const head=new TextEncoder().encode("Path:audio\r\n"),au=new Uint8Array([9,9]);
      const b=new Uint8Array(2+head.length+au.length);b[1]=head.length;b.set(head,2);b.set(au,2+head.length);
      (L.message||[]).forEach(fn=>fn({data:b.buffer}));(L.message||[]).forEach(fn=>fn({data:"Path:turn.end\r\n"}));},0);}};
    f.n=(f.n||0)+1;return {status:101,webSocket:ws};};return f;
}
function fakeKV(){const m=new Map();return {m,async get(k,t){const v=m.get(k);if(v==null)return null;return t==="arrayBuffer"?v:v;},async put(k,v){m.set(k,v instanceof Uint8Array?v.buffer.slice(0):v);}};}
function fakeEL(status=200){const f=async(url,init)=>{f.calls.push({url,init});if(status!==200)return new Response("nope",{status});return new Response(new Uint8Array(200).fill(7));};f.calls=[];return f;}
const waits=[];const ctx={waitUntil:p=>waits.push(p)};
const env=(o={})=>Object.assign({TTS_LIMITER:{limit:async()=>({success:true})},EDGE_FETCH:fakeEdge()},o);
const U=q=>new Request("https://salkhi-ai.test/tts?"+q);
const body=async r=>new Uint8Array(await r.arrayBuffer());

ck("parseTTS: v=hd kept",parseTTS(new URL("https://x/tts?l=en&v=hd&t=hi")).hd===true);
ck("parseTTS: Mongolian never HD",parseTTS(new URL("https://x/tts?l=mn&v=hd&t=sain")).hd===undefined);
ck("speed clamps to ElevenLabs range",elSpeed(-35)===0.7&&elSpeed(0)===1&&elSpeed(50)===1.2&&elSpeed(-15)===0.85);

let r=await worker.fetch(new Request("https://x/tts/status"),env(),ctx);
ck("status: hd false without key",(await r.json()).hd===false);
r=await worker.fetch(new Request("https://x/tts/status"),env({ELEVENLABS_API_KEY:"k",TTS_KV:fakeKV()}),ctx);
ck("status: hd true with key + KV",(await r.json()).hd===true&&r.headers.get("access-control-allow-origin")==="*");

let e=env();r=await worker.fetch(U("l=en&v=hd&t=hello"),e,ctx);
ck("no key: v=hd quietly uses Edge",r.status===200&&(await body(r)).join()==="9,9");

let kv=fakeKV(),el=fakeEL();e=env({ELEVENLABS_API_KEY:"secret",TTS_KV:kv,EL_FETCH:el});
r=await worker.fetch(U("l=ru&r=-15&v=hd&t="+encodeURIComponent("Привет")),e,ctx);await Promise.all(waits);
let b=await body(r),call=el.calls[0],sent=call&&JSON.parse(call.init.body);
ck("HD: returns ElevenLabs audio",r.status===200&&b.length===200&&r.headers.get("x-tts")==="hd");
ck("HD: key in header, not URL",call.init.headers["xi-api-key"]==="secret"&&!/secret/.test(call.url));
ck("HD: multilingual_v2, speed 0.85, no language_code",sent.model_id==="eleven_multilingual_v2"&&sent.voice_settings.speed===0.85&&sent.language_code===undefined);
ck("HD: audio stored in KV + counter",[...kv.m.keys()].some(k=>k.startsWith("hd:"))&&[...kv.m.keys()].some(k=>k.startsWith("elchars:")));
r=await worker.fetch(U("l=ru&r=-15&v=hd&t="+encodeURIComponent("Привет")),e,ctx);
ck("HD: second request served from KV, no new charge",el.calls.length===1&&(await body(r)).length===200);

e=env({ELEVENLABS_API_KEY:"k",TTS_KV:fakeKV(),EL_FETCH:fakeEL(),ELEVENLABS_MODEL:"eleven_flash_v2_5"});
await worker.fetch(U("l=ja&v=hd&t=hi"),e,ctx);
ck("flash v2.5 gets language_code",JSON.parse(e.EL_FETCH.calls[0].init.body).language_code==="ja");

kv=fakeKV();el=fakeEL();e=env({ELEVENLABS_API_KEY:"k",TTS_KV:kv,EL_FETCH:el,ELEVENLABS_DAILY_CHARS:"10"});
r=await worker.fetch(U("l=en&v=hd&t=this%20is%20too%20long"),e,ctx);
ck("budget exceeded: Edge, not stored as HD",el.calls.length===0&&(await body(r)).join()==="9,9"&&r.headers.get("cache-control")==="no-store");

kv=fakeKV();e=env({ELEVENLABS_API_KEY:"k",TTS_KV:kv,EL_FETCH:fakeEL(401)});
r=await worker.fetch(U("l=de&v=hd&t=Hallo"),e,ctx);
ck("ElevenLabs error: falls back to Edge, no-store",r.status===200&&(await body(r)).join()==="9,9"&&r.headers.get("x-tts")==="fallback"&&![...kv.m.keys()].some(k=>k.startsWith("hd:")));

r=await worker.fetch(U("l=en&v=hd&t=hi"),env({ELEVENLABS_API_KEY:"k",TTS_KV:fakeKV(),EL_FETCH:fakeEL(),TTS_LIMITER:{limit:async()=>({success:false})}}),ctx);
ck("HD is rate limited too",r.status===429);
console.log("\nPASS",pass,"FAIL",fail);process.exit(fail?1:0);
