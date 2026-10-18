/* Салхи: 🎲 ангийн бингогийн Realtime Database дүрмийг локал эмулятор дээр шалгана.
   Ажиллуулах: node tests/rules/bingo-rules.js
   Эмуляторын jar: RTDB_EMU орчны хувьсагч эсвэл ~/.cache/firebase/emulators/firebase-database-emulator-*.jar (firebase-tools татсан). Java хэрэгтэй.
   Эмулятор: ?auth=<гарын үсэггүй JWT> = тухайн хэрэглэгч; Authorization толгой = админ. */
const fs=require("fs"),path=require("path"),os=require("os"),{spawn}=require("child_process");
const NS="salkhi-english-6922-default-rtdb",PORT=9400+Math.floor(Math.random()*300),BASE="http://127.0.0.1:"+PORT;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fails=0;const check=(n,ok,x)=>{console.log((ok?"✓ ":"✗ ")+n+(x!=null?" — "+x:""));if(!ok)fails++;};
function jar(){
  if(process.env.RTDB_EMU)return process.env.RTDB_EMU;
  const d=path.join(os.homedir(),".cache","firebase","emulators");
  const f=fs.existsSync(d)&&fs.readdirSync(d).filter(x=>/^firebase-database-emulator-.*\.jar$/.test(x)).sort().pop();
  return f?path.join(d,f):null;
}
const b64=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
const tok=uid=>b64({alg:"none",typ:"JWT"})+"."+b64({sub:uid,user_id:uid,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,aud:"salkhi-english-6922",iss:"https://securetoken.google.com/salkhi-english-6922"})+".";
async function req(method,p,body,uid){
  const u=BASE+p+".json?ns="+NS+(uid?"&auth="+tok(uid):"");
  const h={"content-type":"application/json"};if(!uid)h.authorization="Bearer owner";
  const r=await fetch(u,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
  return r.status;
}
const ok=s=>s===200,denied=s=>s===401||s===403;

(async()=>{
  const j=jar();if(!j){console.log("✗ эмуляторын jar олдсонгүй (RTDB_EMU=<зам>)");process.exit(2);}
  const emu=spawn("java",["-jar",j,"--port",String(PORT)],{stdio:"ignore"});
  try{
    for(let i=0;i<60;i++){try{await fetch(BASE+"/.json?ns="+NS);break;}catch(e){await sleep(250);}}
    const rules=fs.readFileSync(path.join(__dirname,"..","..","database.rules.json"),"utf8");
    const rr=await fetch(BASE+"/.settings/rules.json?ns="+NS,{method:"PUT",headers:{authorization:"Bearer owner"},body:rules});
    check("дүрэм ачаалагдлаа",rr.ok,rr.status);
    /* T = багш, S = сурагч, X = гадны хүн */
    await req("PUT","/classes/ABC123",{name:"5а",teacher:"T",lang:"en"});
    await req("PUT","/members/ABC123/S",{name:"Сараа",ts:1});
    const game={st:"on",w:JSON.stringify(Array.from({length:16},(_,i)=>["w"+i,"утга"+i])),c:"[]",ts:{".sv":"timestamp"}};
    check("багш бинго эхлүүлнэ",ok(await req("PUT","/bingo/ABC123",game,"T")));
    check("сурагч бинго эхлүүлж чадахгүй",denied(await req("PUT","/bingo/ABC123",game,"S")));
    check("сурагч бингог уншина",ok(await req("GET","/bingo/ABC123",undefined,"S")));
    check("гадны хүн бингог уншиж чадахгүй",denied(await req("GET","/bingo/ABC123",undefined,"X")));
    check("багш үг дуудна (c)",ok(await req("PUT","/bingo/ABC123/c","[3,7]","T")));
    check("сурагч үг дуудаж чадахгүй",denied(await req("PUT","/bingo/ABC123/c","[1]","S")));
    check("хэт урт c татгалзана",denied(await req("PUT","/bingo/ABC123/c","x".repeat(500),"T")));
    const win={name:"Сараа",card:JSON.stringify([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]),ts:{".sv":"timestamp"}};
    check("сурагч БИНГО илгээнэ",ok(await req("PUT","/bingowin/ABC123/S",win,"S")));
    check("өөр хүний нэрээр илгээж чадахгүй",denied(await req("PUT","/bingowin/ABC123/X",win,"S")));
    check("гишүүн биш хүн илгээж чадахгүй",denied(await req("PUT","/bingowin/ABC123/X",win,"X")));
    check("ts-гүй (хуурамч цаг) татгалзана",denied(await req("PUT","/bingowin/ABC123/S",{name:"Сараа",card:"[]",ts:5},"S")));
    check("багш ялагчдыг уншина",ok(await req("GET","/bingowin/ABC123",undefined,"T")));
    check("сурагч бусдын илгээлтийг уншиж чадахгүй",denied(await req("GET","/bingowin/ABC123",undefined,"S")));
    check("сурагч өөрийнхөө илгээлтийг уншина",ok(await req("GET","/bingowin/ABC123/S",undefined,"S")));
    check("багш дуусгана (bingo устгах)",ok(await req("DELETE","/bingo/ABC123",undefined,"T")));
    check("бинго дууссаны дараа илгээж чадахгүй",denied(await req("PUT","/bingowin/ABC123/S",win,"S")));
    check("багш ялагчдыг цэвэрлэнэ",ok(await req("DELETE","/bingowin/ABC123",undefined,"T")));
  }catch(e){check("тест",false,e.message);}
  emu.kill();
  console.log(fails?fails+" алдаа":"Бүгд амжилттай");process.exit(fails?1:0);
})();
