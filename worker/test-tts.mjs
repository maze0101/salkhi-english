import worker,{parseTTS} from "./src/index.js";
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log("✅",n);}else{fail++;console.log("❌",n,x||"");}};
function fakeEdge(opts={}){
  const calls=[];
  const f=async(url,init)=>{
    calls.push({url,init});
    if(opts.status)return {status:opts.status,webSocket:null};
    const L={};const ws={accept(){},addEventListener(t,fn){(L[t]=L[t]||[]).push(fn);},close(){},
      send(m){ws.sent=(ws.sent||[]).concat(m);if(/Path:ssml/.test(m)){setTimeout(()=>{
        const head=new TextEncoder().encode("X-RequestId:x\r\nPath:audio\r\n"),audio=new Uint8Array([1,2,3,4]);
        const b=new Uint8Array(2+head.length+audio.length);b[0]=head.length>>8;b[1]=head.length&255;b.set(head,2);b.set(audio,2+head.length);
        (L.message||[]).forEach(fn=>fn({data:b.buffer}));
        (L.message||[]).forEach(fn=>fn({data:"X-RequestId:x\r\nPath:turn.end\r\n\r\n{}"}));
      },0);}}};
    f.ws=ws;return {status:101,webSocket:ws};
  };
  f.calls=calls;return f;
}
const env=(over={})=>Object.assign({TTS_LIMITER:{limit:async()=>({success:true})}},over);
const U=(q)=>new Request("https://salkhi-ai.test/tts?"+q);
ck("parseTTS: valid",JSON.stringify(parseTTS(new URL("https://x/tts?l=zh&r=-15&t=%E4%BD%A0%E5%A5%BD")))==='{"l":"zh","r":-15,"t":"你好"}');
ck("parseTTS: unknown language rejected",parseTTS(new URL("https://x/tts?l=xx&t=hi"))===null);
ck("parseTTS: too long rejected",parseTTS(new URL("https://x/tts?l=en&t="+"a".repeat(301)))===null);
ck("parseTTS: empty rejected",parseTTS(new URL("https://x/tts?l=en&t=%20%20"))===null);
ck("parseTTS: rate clamped to ±50",parseTTS(new URL("https://x/tts?l=en&r=999&t=hi")).r===50);
let ef=fakeEdge();
let r=await worker.fetch(U("l=zh&r=-15&t="+encodeURIComponent("我叫<Bat>")),env({EDGE_FETCH:ef}));
let buf=new Uint8Array(await r.arrayBuffer());
ck("returns mp3 audio with CORS *",r.status===200&&r.headers.get("content-type")==="audio/mpeg"&&r.headers.get("access-control-allow-origin")==="*"&&buf.join()==="1,2,3,4",r.status);
ck("uses the Chinese voice and the requested rate",ef.ws.sent.some(m=>/zh-CN-XiaoxiaoNeural/.test(m)&&/rate='-15%'/.test(m)));
ck("escapes XML in the text",ef.ws.sent.some(m=>/我叫&lt;Bat&gt;/.test(m)));
ck("sends a Sec-MS-GEC token and Edge version",/Sec-MS-GEC=[0-9A-F]{64}&Sec-MS-GEC-Version=1-\d+/.test(ef.calls[0].url));
r=await worker.fetch(U("l=en&t=hi"),env({EDGE_FETCH:fakeEdge({status:403})}));
ck("Edge refusal -> 503 (app falls back to Google)",r.status===503);
r=await worker.fetch(U("l=en&t=hi"),env({EDGE_FETCH:fakeEdge(),TTS_LIMITER:{limit:async()=>({success:false})}}));
ck("rate limited -> 429",r.status===429);
r=await worker.fetch(U("l=xx&t=hi"),env({EDGE_FETCH:fakeEdge()}));
ck("bad language -> 400",r.status===400);
r=await worker.fetch(new Request("https://salkhi-ai.test/chat",{method:"POST",body:"{}"}),env());
ck("/chat still requires our Origin (403)",r.status===403);
console.log("\nPASS",pass,"FAIL",fail);process.exit(fail?1:0);
