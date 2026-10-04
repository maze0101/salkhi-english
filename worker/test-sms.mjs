import worker,{parsePhones,smsConfigured} from "./src/index.js";
let pass=0,fail=0;const ck=(n,c,x)=>{if(c){pass++;console.log("✅",n);}else{fail++;console.log("❌",n,x||"");}};
const O="https://maze0101.github.io";
function fakeDB(opts={}){
  const store={phones:opts.phones===undefined?"99112233, 88114455; 976-95556677 12345 99112233":opts.phones,log:opts.log||0},calls=[];
  const f=async(url,init={})=>{calls.push([init.method||"GET",url]);
    if(opts.deny)return new Response('{"error":"Permission denied"}',{status:401});
    if(url.includes("/smsphones/"))return new Response(JSON.stringify(store.phones),{status:200});
    if(url.includes("/smslog/")){if(init.method==="PUT"){store.log=JSON.parse(init.body);return new Response(init.body,{status:200});}return new Response(JSON.stringify(store.log||null),{status:200});}
    return new Response("null",{status:404});};
  f.store=store;f.calls=calls;return f;
}
function fakeSMS(okFor){const sent=[];const f=async(url,init={})=>{sent.push({url,init});return new Response("{}",{status:okFor&&!okFor(url,init)?500:200});};f.sent=sent;return f;}
const post=(body)=>new Request("https://w.test/sms",{method:"POST",headers:{Origin:O,"content-type":"application/json"},body:JSON.stringify(body)});
const B={code:"ABC123",token:"tok",text:"Салхи: apple - алим"};
ck("parsePhones normalises and dedupes",JSON.stringify(parsePhones("99112233, 88114455; 976-95556677 12345 99112233"))==='["99112233","88114455","95556677"]');
ck("not configured by default",smsConfigured({})===false);
let r=await worker.fetch(post(B),{});ck("501 when not configured",r.status===501);
const tw={SMS_PROVIDER:"twilio",TWILIO_SID:"AC1",TWILIO_TOKEN:"t",TWILIO_FROM:"+15550001111"};
let db=fakeDB(),sm=fakeSMS();r=await worker.fetch(post(B),Object.assign({DB_FETCH:db,SMS_FETCH:sm},tw));let j=await r.json();
ck("twilio: sends to 3 numbers",r.status===200&&j.sent===3&&sm.sent.length===3,JSON.stringify(j));
ck("twilio: E.164 + basic auth",sm.sent[0].init.body.includes("To=%2B97699112233")&&sm.sent[0].init.headers.authorization==="Basic "+btoa("AC1:t"));
ck("daily counter incremented",db.store.log===1);
ck("uses teacher token for DB",db.calls.every(c=>c[1].includes("auth=tok")));
db=fakeDB({log:2});r=await worker.fetch(post(B),Object.assign({DB_FETCH:db,SMS_FETCH:fakeSMS()},tw));ck("429 at daily limit",r.status===429);
db=fakeDB({deny:true});r=await worker.fetch(post(B),Object.assign({DB_FETCH:db,SMS_FETCH:fakeSMS()},tw));ck("403 when not the teacher",r.status===403);
db=fakeDB({phones:""});r=await worker.fetch(post(B),Object.assign({DB_FETCH:db,SMS_FETCH:fakeSMS()},tw));ck("400 without phones",r.status===400);
const ht={SMS_PROVIDER:"http",SMS_HTTP_URL:"https://api.x.mn/send?key={key}&to={to}&text={text}",SMS_HTTP_KEY:"K"};
db=fakeDB();sm=fakeSMS(u=>!u.includes("88114455"));r=await worker.fetch(post(B),Object.assign({DB_FETCH:db,SMS_FETCH:sm},ht));j=await r.json();
ck("http GET template filled + failures counted",sm.sent[0].url==="https://api.x.mn/send?key=K&to=99112233&text="+encodeURIComponent(B.text)&&j.sent===2&&j.failed===1,JSON.stringify(j)+" "+sm.sent[0].url);
const hp={SMS_PROVIDER:"http",SMS_HTTP_URL:"https://api.x.mn/send",SMS_HTTP_METHOD:"POST",SMS_HTTP_BODY:'{"to":"{to976}","msg":"{text}"}'};
sm=fakeSMS();r=await worker.fetch(post(Object.assign({},B,{text:'say "hi"'})),Object.assign({DB_FETCH:fakeDB(),SMS_FETCH:sm},hp));
ck("http POST JSON template",JSON.parse(sm.sent[0].init.body).to==="97699112233"&&JSON.parse(sm.sent[0].init.body).msg==='say "hi"',sm.sent[0].init.body);
r=await worker.fetch(new Request("https://w.test/sms",{method:"POST",headers:{Origin:"https://evil.example","content-type":"application/json"},body:JSON.stringify(B)}),tw);ck("403 from other origin",r.status===403);
r=await worker.fetch(post(Object.assign({},B,{code:"bad"})),tw);ck("400 bad code",r.status===400);
r=await worker.fetch(new Request("https://w.test/sms/status",{headers:{Origin:O}}),tw);ck("status reports configured",(await r.json()).configured===true);
console.log("\nPASS",pass,"FAIL",fail);
