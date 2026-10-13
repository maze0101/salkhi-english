/* Салхи: 📥 Anki руу экспорт — үгсээ Anki-ийн шууд импортолдог .txt (таб тусгаарлагчтай, толгой мөртэй) файл болгоно.
   Нүүр: үг (+ дуудлага); ар: монгол утга, жишээ өгүүлбэр, орчуулга, 🧠 санах арга. Шошго: salkhi <хэл> <түвшин>.
   Anki 2.1.54+: Файл → Импорт; толгой мөрүүд (#separator, #html, #notetype, #deck, #tags column) тохиргоог өөрөө тавина. */
(function(){
  var env=null,h=null;
  function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/[\t\r\n]+/g," ").trim();}
  function sets(){
    var all=env.all();
    return [
      ["saved","🔖 Хадгалсан үгс",env.all().filter(env.isSaved)],
      ["hard","😓 Хэцүү ба алдсан үгс",dedupe(env.mistakes().concat(env.all().filter(env.hard)))],
      ["learning","📖 Сурч буй үгс",env.all().filter(function(w){var b=env.box(w);return b>0&&b<2;})],
      ["mine","✍️ Миний нэмсэн үгс",env.all().filter(function(w){return w[5]==="mine";})],
      ["all","📚 "+env.langName()+" хэлний бүх үг",all]
    ];
  }
  function dedupe(a){var s={};return a.filter(function(w){if(!w||s[w[1]])return false;s[w[1]]=1;return true;});}
  function build(list,setName){
    var L=env.lang(),deck="Салхи::"+env.langName();
    var out=["#separator:Tab","#html:true","#notetype:Basic","#deck:"+deck,"#tags column:3"];
    list.forEach(function(w){
      var front=esc(w[1])+(w[7]?"<br><small>"+esc(w[7])+"</small>":"");
      var mn=env.mnemo?env.mnemo(w):null;
      var back=esc(w[2])+(w[3]?"<br><br><i>"+esc(w[3])+"</i>":"")+(w[8]?"<br>"+esc(w[8]):"")+(mn?"<br><br>🧠 "+esc(mn):"");
      var tags=["salkhi","salkhi_"+L,w[0]&&/^[abc][12]$/.test(w[0])?w[0]:"",setName].filter(Boolean).join(" ");
      out.push(front+"\t"+back+"\t"+tags);
    });
    return out.join("\n")+"\n";
  }
  function download(text,name){
    var b=new Blob([text],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");
    a.href=URL.createObjectURL(b);a.download=name;document.body.append(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1000);
  }
  function panel(e){
    env=e;h=e.h;
    var wrap=h("div",{class:"note",style:"margin-top:12px"}),S=sets();
    var sel=h("select",{class:"tin","aria-label":"Аль үгсийг экспортлох",style:"margin-top:6px"});
    S.forEach(function(s,i){var o=h("option",{value:String(i)},s[1]+" ("+s[2].length+")");if(!s[2].length)o.disabled=true;sel.append(o);});
    var first=S.findIndex(function(s){return s[2].length;});if(first>=0)sel.value=String(first);
    wrap.append(h("div",{style:"font-weight:700"},"📥 Anki руу экспортлох"),
      h("div",{class:"muted small"},"Үгсээ Anki картын апп руу шилжүүлнэ. Anki → Файл → Импорт → энэ файлыг сонгоход шууд карт болно."),
      sel,
      h("button",{class:"btn",style:"margin-top:8px",onclick:function(){
        var s=S[+sel.value];if(!s||!s[2].length){env.toast("Энэ жагсаалтад үг алга");return;}
        download(build(s[2],s[0]),"salkhi-"+env.lang()+"-"+s[0]+".txt");
        env.toast("📥 "+s[2].length+" карт татагдлаа",2000);
      }},"⬇️ Татах"));
    return wrap;
  }
  window.Anki={panel:panel,_build:function(e,list,name){var o=env;env=e;try{return build(list,name);}finally{env=o;}}};
})();
