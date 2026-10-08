/* node test-weekly.mjs — ням гарагийн наадмын push: бүлэг олох, хэсэгчлэх, бичвэр */
import {runWeekly,weekKeyMN,weeklyText} from "./src/weekly.js";
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log("✅",n);}else{fail++;console.log("❌",n,x||"");}};
ck("week key: Sunday 21:00 MN is still the Monday-start week","2026-10-05"===weekKeyMN(Date.UTC(2026,9,11,13,0)));
ck("week key: Monday 00:30 MN is the new week","2026-10-12"===weekKeyMN(Date.UTC(2026,9,11,16,30)));
const L=xs=>xs.map((x,i)=>({u:"u"+i,x}));
ck("promotion zone text",/Сумын заан цол хүртэх бүсэд/.test(weeklyText(2,8,0,90,L([100,90,80]))));
ck("gap to top 5 text",/Эхний 5-д орохад 11 XP дутуу/.test(weeklyText(7,8,0,40,L([100,90,80,70,50,45,40,30]))));
const l12=L([120,110,100,90,80,70,60,50,40,30,20,10]);
ck("demotion zone text (tier>0, 10+ people)",/цол буурах бүсэд/.test(weeklyText(11,12,3,20,l12))&&/21 XP цуглуулбал/.test(weeklyText(11,12,3,20,l12)));
/* 3 тир-д нийт 45 хүн: tier0 25 (2 бүлэг), tier1 20 (1 бүлэг); хүн бүр сануулгатай */
const S=crypto.subtle,b64=b=>Buffer.from(b).toString("base64url");
const ua=await S.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]),uaP=b64(await S.exportKey("raw",ua.publicKey)),uaA=b64(crypto.getRandomValues(new Uint8Array(16)));
const vk=await S.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign"]),vj=await S.exportKey("jwk",vk.privateKey),vp=b64(await S.exportKey("raw",vk.publicKey));
const wk="2026-10-05",DB={};DB["/lgn/"+wk+"/0"]=25;DB["/lgn/"+wk+"/1"]=20;
const mk=(n,off)=>{const o={};for(let i=0;i<n;i++){o["p"+(off+i)]={name:"n",wxp:(i*7)%50+1};DB["/pushsub/p"+(off+i)]={ep:"https://push.example/"+(off+i),p:uaP,a:uaA};}return o;};
DB["/pushsub/broken"]={ep:"https://push.example/broken",p:"!!",a:"??"};
DB["/lg/"+wk+"/0/0"]=mk(20,0);DB["/lg/"+wk+"/0/1"]=mk(5,20);DB["/lg/"+wk+"/1/0"]=mk(20,25);DB["/lg/"+wk+"/0/1"].broken={name:"b",wxp:3};
let calls=0,signups=0,maxPerRun=0,runCalls=0;const sent=new Set(),kv=new Map();
const env={VAPID_PUBLIC:vp,VAPID_PRIVATE:vj.d,
  TTS_KV:{get:async(k,o)=>{const v=kv.get(k);return v==null?null:(o&&o.type==="json"?JSON.parse(v):v);},put:async(k,v)=>{kv.set(k,v);}},
  DB_FETCH:async u=>{calls++;runCalls++;const U=new URL(u);
    if(U.host.includes("identitytoolkit")){signups++;return new Response(JSON.stringify({idToken:"T",refreshToken:"R",expiresIn:"3600"}));}
    const p=U.pathname.replace(/\.json$/,"");return new Response(JSON.stringify(DB[p]??null));},
  PUSH_FETCH:async u=>{runCalls++;sent.add(u);return new Response("",{status:201});}};
let runs=0,r;const t0=Date.UTC(2026,9,11,11,0);
do{runCalls=0;try{r=await runWeekly(env,t0+runs*600000);}catch(e){r={err:e.message};}runs++;maxPerRun=Math.max(maxPerRun,runCalls);}while(r&&!r.done&&!r.err&&runs<20);
ck("finished without error",r&&r.done,JSON.stringify(r));
ck("every one of 45 members got exactly one push",sent.size===45&&r.sent===45,sent.size+" / "+(r&&r.sent));
ck("each run stays within 50 subrequests",maxPerRun<=50,"max "+maxPerRun);
ck("signed in anonymously only once (token cached)",signups===1,signups);
const again=await runWeekly(env,t0+3600000);ck("later runs that week do nothing",again.done===true&&sent.size===45);
console.log("\nruns:",runs,"· "+pass+" passed, "+fail+" failed");process.exit(fail?1:0);
