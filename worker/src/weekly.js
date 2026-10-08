/* Салхи: ням гарагийн орой «Наадам дуусахад …» push (апп хаалттай байсан ч).
   Worker өөрөө Firebase-д anonymous хэрэглэгчээр нэвтэрч (апп-ын адил, auth != null уншилт),
   lgn/{wk}/{tier} тоолуураас бүлгүүдийг олж, бүлэг бүрийн гишүүдэд байрыг нь илгээнэ.
   Үнэгүй багцын нэг удаагийн 50 хүсэлтийн хязгаараас болж ажлыг хэсэгчлэн хийж, явцыг KV-д хадгална.
   Хувийн лигүүдийг (plg) жагсааж уншиж болохгүй тул энд хамаарахгүй. */
import {sendPush} from "./push.js";

const FIREBASE_DB="https://salkhi-english-6922-default-rtdb.firebaseio.com";
const API_KEY="AIzaSyDWn7v1QLzQXBpKeW54Ry_mmhxg230b-Fk"; /* вэб апп-ын нийтийн түлхүүр (firebase-config.js) */
const TIERS=["Сумын начин","Сумын заан","Аймгийн начин","Аймгийн заан","Аймгийн арслан","Улсын начин","Улсын харцага","Улсын заан","Улсын гарьд","Улсын арслан","Улсын аварга"];
const GROUP=20,PROMO=5,DEMO=3,DEMO_MIN=10,BUDGET=40;

/* Монголын цагаар (UTC+8) энэ долоо хоногийн даваа гараг — апп-ын weekKey()-тэй ижил */
export function weekKeyMN(now){
  const d=new Date((now||Date.now())+8*3600000);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
  return d.toISOString().slice(0,10);
}
/* хэрэглэгч бүрт илгээх бичвэр */
export function weeklyText(rank,n,tier,myX,list){
  if(rank<=PROMO&&tier<TIERS.length-1&&n>1)return "🤼 Наадам өнөө шөнө дуусна! Чи "+rank+"-р байрт — "+TIERS[tier+1]+" цол хүртэх бүсэд байна. Байраа хамгаал!";
  if(tier>0&&n>=DEMO_MIN&&rank>n-DEMO){const need=list[n-DEMO-1].x-myX+1;return "⚠️ Наадам өнөө шөнө дуусна! Чи "+rank+"-р байрт — цол буурах бүсэд байна. "+need+" XP цуглуулбал аюулгүй.";}
  if(tier<TIERS.length-1&&n>PROMO){const need=list[PROMO-1].x-myX+1;return "🤼 Наадам өнөө шөнө дуусна! Чи "+rank+"-р байрт. Эхний "+PROMO+"-д орохад "+need+" XP дутуу — "+TIERS[tier+1]+" цол ойрхон байна!";}
  return "🤼 Наадам өнөө шөнө дуусна! Чи "+rank+"-р байрт ("+n+" хүн). Өнөөдөр XP цуглуулаад байраа ахиул!";
}
async function token(env,F){
  const kv=env.TTS_KV,c=await kv.get("fbtok",{type:"json"});
  if(c&&c.exp>Date.now()+120000)return c.t;
  let r;
  if(c&&c.rt)r=await F("https://securetoken.googleapis.com/v1/token?key="+API_KEY,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:"grant_type=refresh_token&refresh_token="+encodeURIComponent(c.rt)});
  if(!r||!r.ok)r=await F("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key="+API_KEY,{method:"POST",headers:{"content-type":"application/json"},body:'{"returnSecureToken":true}'});
  if(!r.ok)throw new Error("auth "+r.status);
  const j=await r.json(),t=j.idToken||j.id_token,rt=j.refreshToken||j.refresh_token,exp=Date.now()+(parseInt(j.expiresIn||j.expires_in||"3600",10)*1000);
  await kv.put("fbtok",JSON.stringify({t,rt,exp}));
  return t;
}
/* нэг удаагийн ажил: BUDGET хүртэл гадны хүсэлт, явцыг KV "wkpush:{wk}"-д */
export async function runWeekly(env,now){
  if(!env.TTS_KV||!env.VAPID_PRIVATE||!env.VAPID_PUBLIC)return {skip:"not_configured"};
  const F=env.DB_FETCH||fetch,db=env.FIREBASE_DB_URL||FIREBASE_DB,wk=weekKeyMN(now),key="wkpush:"+wk;
  const S=(await env.TTS_KV.get(key,{type:"json"}))||{q:null,gi:0,mi:0,sent:0};
  if(S.done)return {done:true,sent:S.sent};
  let used=0;const t=await token(env,F);used++;
  const auth=".json?auth="+encodeURIComponent(t);
  if(!S.q){
    S.q=[];
    for(let tier=0;tier<TIERS.length;tier++){
      const r=await F(db+"/lgn/"+wk+"/"+tier+auth);used++;
      const n=r.ok?(+(await r.json())||0):0;
      for(let g=0;g*GROUP<n;g++)S.q.push([tier,g]);
    }
  }
  while(S.gi<S.q.length&&used<BUDGET){
    const [tier,g]=S.q[S.gi];
    const r=await F(db+"/lg/"+wk+"/"+tier+"/"+g+auth);used++;
    const all=r.ok?(await r.json())||{}:{};
    const list=Object.keys(all).map(u=>({u,x:+all[u].wxp||0})).sort((a,b)=>b.x-a.x);
    while(S.mi<list.length&&used+2<=BUDGET){
      const me=list[S.mi],rank=1+list.filter(v=>v.x>me.x).length;S.mi++;
      const sr=await F(db+"/pushsub/"+me.u+auth);used++;
      const sub=sr.ok?await sr.json():null;
      if(!sub||list.length<2)continue;
      /* эвдэрсэн бүртгэл бүх ажлыг зогсоохгүй */
      let st=0;try{st=await sendPush(env,sub,{t:"Салхи · Наадам",b:weeklyText(rank,list.length,tier,me.x,list),u:"./#lg",tag:"salkhi-league"});}catch(e){st=0;}used++;
      if(st>=200&&st<300)S.sent++;
    }
    if(S.mi>=list.length){S.gi++;S.mi=0;}
  }
  if(S.gi>=S.q.length)S.done=true;
  await env.TTS_KV.put(key,JSON.stringify(S),{expirationTtl:8*86400});
  return {done:!!S.done,sent:S.sent,groups:S.q.length,at:S.gi};
}
