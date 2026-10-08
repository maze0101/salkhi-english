/* node test-push.mjs — Web Push шифрлэлт (RFC 8291) ба /push хандалтын шалгалт */
import {encrypt,vapidAuth,b64u,unb64u,handlePush} from "./src/push.js";
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log("✅",n);}else{fail++;console.log("❌",n,x||"");}};
const S=crypto.subtle,enc=new TextEncoder();
async function hmac(k,d){return new Uint8Array(await S.sign("HMAC",await S.importKey("raw",k,{name:"HMAC",hash:"SHA-256"},false,["sign"]),d));}
const cat=(...a)=>{const o=new Uint8Array(a.reduce((x,y)=>x+y.length,0));let p=0;a.forEach(x=>{o.set(x,p);p+=x.length;});return o;};

/* хүлээн авагч (хөтөч) талын тайлах — RFC 8291-ийн дагуу бие даан бичсэн */
async function decrypt(body,uaKeys,uaPub,auth){
  const salt=body.slice(0,16),idlen=body[20],asPub=body.slice(21,21+idlen),ct=body.slice(21+idlen);
  const asKey=await S.importKey("raw",asPub,{name:"ECDH",namedCurve:"P-256"},false,[]);
  const shared=new Uint8Array(await S.deriveBits({name:"ECDH",public:asKey},uaKeys.privateKey,256));
  const ikm=await hmac(await hmac(auth,shared),cat(enc.encode("WebPush: info\0"),uaPub,asPub,new Uint8Array([1])));
  const prk=await hmac(salt,ikm);
  const cek=(await hmac(prk,cat(enc.encode("Content-Encoding: aes128gcm\0"),new Uint8Array([1])))).slice(0,16);
  const nonce=(await hmac(prk,cat(enc.encode("Content-Encoding: nonce\0"),new Uint8Array([1])))).slice(0,12);
  const pt=new Uint8Array(await S.decrypt({name:"AES-GCM",iv:nonce},await S.importKey("raw",cek,{name:"AES-GCM"},false,["decrypt"]),ct));
  ck("record ends with 0x02 delimiter",pt[pt.length-1]===2);
  return new TextDecoder().decode(pt.slice(0,-1));
}
const ua=await S.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
const uaPub=new Uint8Array(await S.exportKey("raw",ua.publicKey)),auth=crypto.getRandomValues(new Uint8Array(16));
const msg=JSON.stringify({t:"Салхи",b:"🤼 Бат чамайг гүйцэж түрүүллээ!"});
const body=await encrypt(b64u(uaPub),b64u(auth),msg);
ck("header: rs=4096, keyid 65 bytes",body[18]===16&&body[19]===0&&body[20]===65);
ck("round-trip decrypt gives the same message",await decrypt(body,ua,uaPub,auth)===msg);

/* VAPID: гарын үсгийг нийтийн түлхүүрээр шалгана */
const vk=await S.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
const jwk=await S.exportKey("jwk",vk.privateKey),pub=b64u(await S.exportKey("raw",vk.publicKey));
const hdr=await vapidAuth("https://fcm.googleapis.com/fcm/send/abc",pub,jwk.d,"mailto:t@t");
const m=/^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(hdr);
ck("vapid header shape",!!m&&m[4]===pub);
const claims=JSON.parse(new TextDecoder().decode(unb64u(m[2])));
ck("aud is push service origin",claims.aud==="https://fcm.googleapis.com");
ck("ES256 signature verifies",await S.verify({name:"ECDSA",hash:"SHA-256"},vk.publicKey,unb64u(m[3]),enc.encode(m[1]+"."+m[2])));

/* /push хандалт: хуурамч Firebase + push үйлчилгээ */
const tok=u=>"x."+b64u(enc.encode(JSON.stringify({user_id:u})))+".y";
const DB={"/lg/2026-10-05/0/3":{A:{name:"Бат",wxp:90},B:{name:"Сараа",wxp:80},C:{name:"Номин",wxp:120}},
  "/pushsub/B":{ep:"https://push.example/b",p:b64u(uaPub),a:b64u(auth)},"/pushsub/C":{ep:"https://push.example/c",p:b64u(uaPub),a:b64u(auth)}};
let pushed=[];const kv=new Map();
const env={VAPID_PUBLIC:pub,VAPID_PRIVATE:jwk.d,
  DB_FETCH:async u=>{const p=new URL(u).pathname.replace(/\.json$/,"");return new Response(JSON.stringify(DB[p]??null),{status:200});},
  PUSH_FETCH:async(u,init)=>{pushed.push({u,body:new Uint8Array(init.body)});return new Response("",{status:201});},
  TTS_KV:{get:async k=>kv.get(k)??null,put:async(k,v)=>{kv.set(k,v);}}};
const json=(o,s)=>new Response(JSON.stringify(o),{status:s});
const call=async b=>{const r=await handlePush(new Request("https://w/push",{method:"POST",body:JSON.stringify(b)}),env,{},json);return {s:r.status,j:await r.json()};};
const base={token:tok("A"),kind:"lg",wk:"2026-10-05",tier:0,g:3};
let r=await call({...base,to:["B"]});
ck("A passed B → push sent",r.s===200&&r.j.sent===1&&pushed.length===1&&pushed[0].u==="https://push.example/b");
const got=JSON.parse(await decrypt(pushed[0].body,ua,uaPub,auth));
ck("message names the passer and B's new rank",/Бат чамайг гүйцэж/.test(got.b)&&/3-р байр/.test(got.b),got.b);
r=await call({...base,to:["B"]});ck("same pair again within 3h → not sent",r.j.sent===0&&pushed.length===1);
r=await call({...base,to:["C"]});ck("C still has more XP → refused",r.j.sent===0&&pushed.length===1);
r=await call({...base,token:tok("Z"),to:["B"]});ck("caller not in group → 403",r.s===403);
r=await call({...base,to:["A"]});ck("cannot notify yourself",r.s===400);
r=await call({...base,kind:"lg",tier:"0/../x",to:["B"]});ck("path injection rejected",r.s===400);
const env2={...env};delete env2.VAPID_PRIVATE;
r=await handlePush(new Request("https://w/push",{method:"POST",body:JSON.stringify({...base,to:["B"]})}),env2,{},json);ck("no VAPID secret → 501",r.status===501);

console.log("\n"+pass+" passed, "+fail+" failed");process.exit(fail?1:0);
