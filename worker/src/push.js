/* Салхи: Web Push (апп хаалттай үед ч ирэх мэдэгдэл).
   RFC 8291 (aes128gcm шифрлэлт) + RFC 8292 (VAPID) — зөвхөн WebCrypto, гадны сан хэрэггүй.
   /push: наадамд хэн нэгнийг гүйцэж түрүүлсэн хэрэглэгчийн апп дуудна. Worker тухайн хүний Firebase токеноор
   бүлгийн өгөгдлийг уншиж (Firebase өөрөө токеныг шалгана), хоёулаа нэг бүлэгт, дуудагч үнэхээр илүү XP-тэй
   эсэхийг шалгаад, зөвхөн тогтсон загвартай мессеж илгээнэ — дурын бичвэр, дурын хүн рүү илгээх боломжгүй.
   Нууц: VAPID_PRIVATE (JWK-ийн d), VAPID_PUBLIC (65 байт түлхүүрийн base64url). */

const enc=new TextEncoder();
export function b64u(buf){let s="";const b=new Uint8Array(buf);for(let i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
export function unb64u(s){s=String(s).replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";const bin=atob(s),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
function cat(...a){const n=a.reduce((x,y)=>x+y.length,0),o=new Uint8Array(n);let p=0;a.forEach(x=>{o.set(x,p);p+=x.length;});return o;}
async function hmac(key,data){const k=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return new Uint8Array(await crypto.subtle.sign("HMAC",k,data));}

/* VAPID JWT (ES256): WebCrypto-гийн ECDSA гарын үсэг аль хэдийн JWS-ийн r||s хэлбэртэй */
export async function vapidAuth(endpoint,pub,priv,sub){
  const P=unb64u(pub);
  const jwk={kty:"EC",crv:"P-256",d:priv,x:b64u(P.slice(1,33)),y:b64u(P.slice(33,65)),ext:true};
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
  const head=b64u(enc.encode(JSON.stringify({typ:"JWT",alg:"ES256"})));
  const body=b64u(enc.encode(JSON.stringify({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+12*3600,sub:sub||"mailto:salkhi@example.com"})));
  const sig=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,enc.encode(head+"."+body));
  return "vapid t="+head+"."+body+"."+b64u(sig)+", k="+pub;
}

/* RFC 8291: мессежийг хүлээн авагчийн p256dh/auth түлхүүрээр шифрлэнэ */
export async function encrypt(p256dh,authSecret,payload,salt,asKeys){
  const ua=unb64u(p256dh),auth=unb64u(authSecret);
  const kp=asKeys||await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
  const asPub=new Uint8Array(await crypto.subtle.exportKey("raw",kp.publicKey));
  const uaKey=await crypto.subtle.importKey("raw",ua,{name:"ECDH",namedCurve:"P-256"},false,[]);
  const shared=new Uint8Array(await crypto.subtle.deriveBits({name:"ECDH",public:uaKey},kp.privateKey,256));
  const prkKey=await hmac(auth,shared);
  const ikm=await hmac(prkKey,cat(enc.encode("WebPush: info\0"),ua,asPub,new Uint8Array([1])));
  salt=salt||crypto.getRandomValues(new Uint8Array(16));
  const prk=await hmac(salt,ikm);
  const cek=(await hmac(prk,cat(enc.encode("Content-Encoding: aes128gcm\0"),new Uint8Array([1])))).slice(0,16);
  const nonce=(await hmac(prk,cat(enc.encode("Content-Encoding: nonce\0"),new Uint8Array([1])))).slice(0,12);
  const key=await crypto.subtle.importKey("raw",cek,{name:"AES-GCM"},false,["encrypt"]);
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:nonce},key,cat(enc.encode(payload),new Uint8Array([2]))));
  const rs=new Uint8Array([0,0,16,0]); /* 4096 */
  return cat(salt,rs,new Uint8Array([asPub.length]),asPub,ct);
}

export async function sendPush(env,sub,msg){
  if(!sub||typeof sub.ep!=="string"||!/^https:\/\//.test(sub.ep))return 0;
  const body=await encrypt(sub.p,sub.a,JSON.stringify(msg));
  const r=await (env.PUSH_FETCH||fetch)(sub.ep,{method:"POST",body,headers:{
    "authorization":await vapidAuth(sub.ep,env.VAPID_PUBLIC,env.VAPID_PRIVATE,env.VAPID_SUB),
    "content-encoding":"aes128gcm","content-type":"application/octet-stream","ttl":"43200","urgency":"normal","topic":"salkhi-league"}});
  return r.status;
}

const FIREBASE_DB="https://salkhi-english-6922-default-rtdb.firebaseio.com";
function uidOf(token){try{const p=JSON.parse(new TextDecoder().decode(unb64u(token.split(".")[1])));return String(p.user_id||p.sub||"");}catch(e){return "";}}
function clean(s,n){return String(s||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,n);}

/* body: {token, kind:"lg"|"plg", wk, tier, g | code, to:[uid…]} */
export async function handlePush(req,env,cors,json){
  let b;try{b=await req.json();}catch(e){return json({error:"bad_json"},400,cors);}
  if(!env.VAPID_PUBLIC||!env.VAPID_PRIVATE)return json({error:"push_not_configured"},501,cors);
  const token=String(b&&b.token||""),wk=String(b&&b.wk||""),kind=b&&b.kind,to=Array.isArray(b&&b.to)?b.to.slice(0,3).map(String):[];
  const me=uidOf(token);
  if(!token||token.length>4000||!me||!/^\d{4}-\d{2}-\d{2}$/.test(wk)||!to.length||to.some(u=>!/^[A-Za-z0-9_-]{1,64}$/.test(u)||u===me))return json({error:"bad_request"},400,cors);
  let path,label;
  if(kind==="lg"&&/^([0-9]|10)$/.test(String(b.tier))&&/^\d{1,6}$/.test(String(b.g))){path="/lg/"+wk+"/"+b.tier+"/"+b.g;label="Долоо хоногийн наадам";}
  else if(kind==="plg"&&/^[A-HJ-NP-Z2-9]{6}$/.test(String(b.code))){path="/plgx/"+b.code+"/"+wk;label=null;}
  else return json({error:"bad_request"},400,cors);
  const F=env.DB_FETCH||fetch,db=env.FIREBASE_DB_URL||FIREBASE_DB,auth=".json?auth="+encodeURIComponent(token);
  const gr=await F(db+path+auth);
  if(gr.status===401||gr.status===403)return json({error:"forbidden"},403,cors);
  if(!gr.ok)return json({error:"db_unavailable"},503,cors);
  const grp=(await gr.json())||{};
  if(!grp[me])return json({error:"not_in_group"},403,cors);
  if(kind==="plg"){
    const [mr,lr]=await Promise.all([F(db+"/plgm/"+b.code+auth),F(db+"/plg/"+b.code+"/name"+auth)]);
    const mem=mr.ok?(await mr.json())||{}:{};if(!mem[me])return json({error:"not_in_group"},403,cors);
    Object.keys(grp).forEach(u=>{if(!mem[u])delete grp[u];});
    label="«"+clean(lr.ok?await lr.json():"",30)+"» лиг";
  }
  const x=u=>+(grp[u]&&grp[u].wxp)||0,myX=x(me),name=clean(grp[me].name,20)||"Найз";
  const rank=u=>1+Object.keys(grp).filter(v=>x(v)>x(u)).length;
  let sent=0;
  for(const t of to){
    if(!grp[t]||myX<=x(t))continue;
    /* нэг хосод 3 цагт 1, нэг хүлээн авагчид өдөрт 4 удаа */
    const day=new Date(Date.now()+8*3600000).toISOString().slice(0,10),pk="pushp:"+me+":"+t,dk="pushd:"+t+":"+day;
    if(env.TTS_KV){
      if(await env.TTS_KV.get(pk))continue;
      const n=parseInt(await env.TTS_KV.get(dk)||"0",10)||0;if(n>=4)continue;
      await Promise.all([env.TTS_KV.put(pk,"1",{expirationTtl:3*3600}),env.TTS_KV.put(dk,String(n+1),{expirationTtl:172800})]);
    }
    const sr=await F(db+"/pushsub/"+t+auth);
    const sub=sr.ok?await sr.json():null;if(!sub)continue;
    let st=0;try{st=await sendPush(env,sub,{t:"Салхи · Наадам",b:"🤼 "+name+" чамайг гүйцэж түрүүллээ! "+label+" · одоо "+rank(t)+"-р байр. Байраа буцааж ав 💪",u:"./#lg",tag:"salkhi-league"});}catch(e){st=0;}
    if(st>=200&&st<300)sent++;
  }
  return json({sent},200,cors);
}
