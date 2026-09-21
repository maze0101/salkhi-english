import worker,{convertStream,sanitizeMessages} from "./src/index.js";
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log("✅",n);}else{fail++;console.log("❌",n,x||"");}};
const ORIGIN="https://maze0101.github.io";
function mkStream(chunks){const enc=new TextEncoder();return new ReadableStream({start(c){chunks.forEach(x=>c.enqueue(enc.encode(x)));c.close();}});}
async function readAll(res){return await res.text();}
function req(method,path,opts={}){return new Request("https://salkhi-ai.test"+path,{method,headers:Object.assign({"content-type":"application/json"},opts.headers||{}),body:opts.body===undefined?undefined:(typeof opts.body==="string"?opts.body:JSON.stringify(opts.body))});}
let lastRun=null;
const okEnv=(over={})=>Object.assign({AI:{run:async(model,input)=>{lastRun={model,input};return mkStream(['data: {"response":"Hel"}\n\nda','ta: {"response":"lo!"}\n\n','data: {"response":""}\n','data: [DONE]\n\n']);}},LIMITER:{limit:async()=>({success:true})}},over);
const goodBody={messages:[{role:"user",content:"rules... Begin now"},{role:"assistant",content:"Hi!"},{role:"user",content:"lol hi"}]};

// CORS preflight
let r=await worker.fetch(req("OPTIONS","/chat",{headers:{Origin:ORIGIN}}),okEnv());
ck("preflight 204 with allow-origin for our site",r.status===204&&r.headers.get("access-control-allow-origin")===ORIGIN);
r=await worker.fetch(req("OPTIONS","/chat",{headers:{Origin:"https://evil.example"}}),okEnv());
ck("preflight never echoes a foreign origin",r.headers.get("access-control-allow-origin")===ORIGIN);
// routing / origin
r=await worker.fetch(req("GET","/"),okEnv());ck("GET / health text",r.status===200);
r=await worker.fetch(req("POST","/other",{headers:{Origin:ORIGIN},body:goodBody}),okEnv());ck("unknown path 404",r.status===404);
r=await worker.fetch(req("POST","/chat",{headers:{Origin:"https://evil.example"},body:goodBody}),okEnv());ck("foreign origin blocked (403) and AI never called",r.status===403&&lastRun===null);
r=await worker.fetch(req("POST","/chat",{body:goodBody}),okEnv());ck("missing Origin blocked (403)",r.status===403);
// rate limit
r=await worker.fetch(req("POST","/chat",{headers:{Origin:ORIGIN,"CF-Connecting-IP":"1.2.3.4"},body:goodBody}),okEnv({LIMITER:{limit:async({key})=>({success:false})}}));
ck("rate limited -> 429",r.status===429);
let seenKey=null;await worker.fetch(req("POST","/chat",{headers:{Origin:ORIGIN,"CF-Connecting-IP":"9.9.9.9"},body:goodBody}),okEnv({LIMITER:{limit:async({key})=>{seenKey=key;return{success:true};}}}));
ck("rate limit is keyed by client IP",seenKey==="9.9.9.9");
// validation
r=await worker.fetch(req("POST","/chat",{headers:{Origin:ORIGIN},body:"{not json"}),okEnv());ck("bad JSON -> 400",r.status===400);
r=await worker.fetch(req("POST","/chat",{headers:{Origin:ORIGIN},body:{messages:[]}}),okEnv());ck("no messages -> 400",r.status===400);
r=await worker.fetch(req("POST","/chat",{headers:{Origin:ORIGIN},body:{messages:[{role:"user",content:"x".repeat(8000)},{role:"user",content:"y".repeat(8000)},{role:"user",content:"z".repeat(8000)},{role:"user",content:"w".repeat(8000)}]}}),okEnv());
ck("oversized total prompt -> 400",r.status===400);
ck("sanitize: caps history to last 12, forces roles",(()=>{const m=[];for(let i=0;i<30;i++)m.push({role:i%2?"assistant":"system",content:"m"+i});const s=sanitizeMessages(m);return s.length===12&&s.every(x=>x.role==="user"||x.role==="assistant")&&s[11].content==="m29";})());
ck("sanitize: drops empty and truncates long messages",(()=>{const s=sanitizeMessages([{role:"user",content:"   "},{role:"user",content:"a".repeat(9000)}]);return s.length===1&&s[0].content.length===8000;})());
// happy path
lastRun=null;
r=await worker.fetch(req("POST","/chat",{headers:{Origin:ORIGIN},body:goodBody}),okEnv());
const out=await readAll(r);
ck("happy path 200 event-stream with CORS",r.status===200&&/text\/event-stream/.test(r.headers.get("content-type"))&&r.headers.get("access-control-allow-origin")===ORIGIN);
const lines=out.split("\n").filter(l=>l.startsWith("data:")).map(l=>JSON.parse(l.slice(5)));
ck("converted to content_block_delta (handles chunks split mid-line, skips empty/[DONE])",lines.length===2&&lines.every(l=>l.type==="content_block_delta")&&lines.map(l=>l.delta.text).join("")==="Hello!",out);
ck("model is Llama 3.1 8B, streaming, capped tokens",lastRun.model==="@cf/meta/llama-3.1-8b-instruct"&&lastRun.input.stream===true&&lastRun.input.max_tokens===450);
ck("hard safety system prompt always prepended",lastRun.input.messages[0].role==="system"&&/Never write sexual or explicit content/.test(lastRun.input.messages[0].content)&&lastRun.input.messages.length===4);
// AI failure (quota exhausted etc.)
r=await worker.fetch(req("POST","/chat",{headers:{Origin:ORIGIN},body:goodBody}),okEnv({AI:{run:async()=>{throw new Error("quota");}}}));
ck("AI failure -> 503 (app falls back to scripted)",r.status===503);
// stream converter direct
const conv=await new Response(convertStream(mkStream(['data: {"response":"A"}\ndata: {"response":"B"}','\n']))).text();
ck("stream flush handles trailing line without newline",/"text":"A"/.test(conv)&&/"text":"B"/.test(conv));
console.log("\nPASS",pass,"FAIL",fail);process.exit(fail?1:0);
