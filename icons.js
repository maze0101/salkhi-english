/* Салхи: өнгөлөг дүүрсэн icon-ууд (2026-10-19).
   Карт (.gamecard > i), хэрэгслийн товч (.toolgrid .btn), гарчиг (h3), сегмент товчны эхний эможиг
   өнгөт градиент хавтан дээрх цагаан шугаман дүрсээр солино. Апп-ын код эможи бичсээр байна —
   энэ файл DOM-д гарсны дараа MutationObserver-ээр сольдог тул бусад модульд өөрчлөлт хэрэггүй.
   Газрын зурагт байхгүй эможи хэвээрээ үлдэнэ (window.__icMiss-д бичигдэнэ). */
(function(){
  var C={ // [гэгээлэг, бараан] градиент
    red:["#FF7A7A","#E03131"],orange:["#FFB061","#F76707"],amber:["#FFC94D","#E67700"],green:["#6EDC8C","#2B9348"],
    teal:["#4FE0B6","#0CA678"],cyan:["#4DD4E6","#0C8599"],blue:["#7CC4FF","#1C7ED6"],indigo:["#94A9FF","#3B5BDB"],
    violet:["#B9A1FF","#6741D9"],grape:["#EBA2FA","#AE3EC9"],pink:["#FFA3C4","#D6336C"],slate:["#AEBBC9","#526172"]
  };
  var W='fill="#fff"';
  var G={
    film:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7.5 5l2.5 5M13.5 5l2.5 5"/>',
    bag:'<path d="M5.5 8h13l-1 12.5h-11z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
    chart:'<path d="M3 21h18M6 17v-5M11 17V7M16 17v-8M20.5 17V4"/>',
    shuffle:'<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    letters:'<text x="12" y="16.6" text-anchor="middle" font-size="12.5" font-weight="800" '+W+' stroke="none" font-family="Inter,system-ui,sans-serif">Aa</text>',
    pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    zap:'<path d="M13 2 4 14h7l-1 8 9-12h-7z" '+W+'/>',
    music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    keyboard:'<rect x="2" y="6" width="20" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7.5 14h9"/>',
    speak:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 8.5h8M8 12.5h5"/>',
    ear:'<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
    puzzle:'<path d="M15.4 4.6H19a1 1 0 0 1 1 1v3.6h-.7a2 2 0 1 0 0 4h.7V18a1 1 0 0 1-1 1h-3.6v-.7a2 2 0 1 0-4 0v.7H6a1 1 0 0 1-1-1v-4.6h.7a2 2 0 1 0 0-4H5V5.6a1 1 0 0 1 1-1h5.4v-.7a2 2 0 1 1 4 0z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" '+W+'/>',
    headphones:'<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    board:'<rect x="3" y="3" width="18" height="12.5" rx="1.5"/><path d="M12 15.5V19M8 21.5l4-2.5 4 2.5M7 7.5h6M7 11h4"/>',
    users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    camera:'<path d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5z"/><circle cx="12" cy="13" r="3.5"/>',
    scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 9.5h10M7 14.5h6"/>',
    lock:'<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2"/>',
    wind:'<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
    chess:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    bricks:'<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9.3h18M3 14.6h18M9 4v5.3M15 9.3v5.3M9 14.6V20"/>',
    tv:'<rect x="2" y="7" width="20" height="13" rx="2.5"/><path d="m17 2-5 5-5-5"/>',
    printer:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    tag:'<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.6" '+W+'/>',
    map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.5 4 2.5 4-2.5 4-2.5M9 9.5h.01M15 9.5h.01"/>',
    repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9zM9 11h6M9 15h6M9 19h3"/>',
    scroll:'<path d="M8 21h11a2 2 0 0 0 2-2v-1H10v1a2 2 0 1 1-4 0V5a2 2 0 0 0-2-2h12a2 2 0 0 1 2 2v13"/><path d="M10 8h5M10 12h5"/>',
    hand:'<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-2a2 2 0 0 0-4 0"/>',
    temple:'<path d="M3 21h18M5 21V11M19 21V11M9.5 21v-6h5v6M2 11l10-7 10 7z"/>',
    gamepad:'<rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6.5 12h4M8.5 10v4"/><path d="M15 13h.01M18 11h.01"/>',
    book:'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    library:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5M9 7h7"/>',
    mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
    volume:'<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    hash:'<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    sparkles:'<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z" '+W+'/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" '+W+'/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    news:'<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9h4"/><path d="M10 7h8M10 11h8M10 15h5"/>',
    notebook:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 2v20M12 7h4M12 11h4"/>',
    grad:'<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v5"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2.5"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
    medal:'<circle cx="12" cy="15" r="6"/><path d="M8.5 10.2 5 2h5l2 4 2-4h5l-3.5 8.2"/>',
    trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    star:'<path d="m12 2.5 3 6.1 6.7 1-4.9 4.7 1.2 6.7-6-3.2-6 3.2 1.2-6.7-4.9-4.7 6.7-1z" '+W+'/>',
    fire:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.6 1.4 2.8 2.5 2.8z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    bot:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4.5M9 13.5h.01M15 13.5h.01M2 13v3M22 13v3"/><circle cx="12" cy="3.5" r="1" '+W+'/>',
    timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    palette:'<path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2c0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3a2 2 0 0 1 2-2h2.3A5.6 5.6 0 0 0 22 10c0-4.4-4.5-8-10-8z"/><circle cx="13.5" cy="6.5" r="1.1" '+W+'/><circle cx="17.5" cy="10.5" r="1.1" '+W+'/><circle cx="8.5" cy="7.5" r="1.1" '+W+'/><circle cx="6.5" cy="12.5" r="1.1" '+W+'/>',
    chat:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
    home:'<path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    bulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    heart:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    cards:'<rect x="2" y="6" width="14" height="16" rx="2"/><path d="M8 2h12a2 2 0 0 1 2 2v14"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
    flag:'<path d="M4 22V4M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1"/>',
    pointer:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    web:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/><circle cx="12" cy="12" r="4.5"/>',
    rocket:'<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="m12 15-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    brain:'<path d="M12 5a3 3 0 1 0-6 .1 4 4 0 0 0-2.5 5.8A4 4 0 0 0 6 18a4 4 0 0 0 6 1.5zM12 5a3 3 0 1 1 6 .1 4 4 0 0 1 2.5 5.8A4 4 0 0 1 18 18a4 4 0 0 1-6 1.5zM12 5v14.5"/>'
  };
  var M={ // эможи → [дүрс, өнгө]
    "🎬":["film","red"],"🛍":["bag","pink"],"📊":["chart","blue"],"🪤":["shuffle","orange"],"🔤":["letters","indigo"],
    "✒":["pen","violet"],"✍":["pen","violet"],"⚡":["zap","amber"],"🎵":["music","pink"],"🎶":["music","pink"],"⌨":["keyboard","slate"],
    "🗣":["speak","teal"],"👂":["ear","cyan"],"🧩":["puzzle","green"],"🎯":["target","red"],"🎧":["headphones","violet"],
    "🔗":["link","blue"],"👩‍🏫":["board","orange"],"🧑‍🏫":["board","orange"],"🤝":["users","teal"],"📷":["camera","slate"],
    "📸":["scan","indigo"],"🔐":["lock","amber"],"🔒":["lock","slate"],"👅":["wind","pink"],"♞":["chess","slate"],"🧱":["bricks","orange"],
    "📺":["tv","indigo"],"🖨":["printer","slate"],"📄":["file","blue"],"📱":["phone","violet"],"🏷":["tag","orange"],
    "🗺":["map","green"],"😂":["smile","amber"],"🔁":["repeat","red"],"📝":["clipboard","blue"],"📜":["scroll","amber"],
    "🤟":["hand","grape"],"🙌":["hand","orange"],"🎎":["temple","red"],"🎮":["gamepad","indigo"],"📖":["book","blue"],
    "📚":["library","orange"],"🎤":["mic","pink"],"🎙":["mic","grape"],"🔊":["volume","cyan"],"🔢":["hash","indigo"],
    "✨":["sparkles","violet"],"👁":["eye","teal"],"📰":["news","slate"],"📒":["notebook","amber"],"🎓":["grad","indigo"],
    "💼":["briefcase","orange"],"🏅":["medal","amber"],"📈":["trend","green"],"🏆":["trophy","amber"],"⭐":["star","amber"],
    "🌟":["star","amber"],"🔥":["fire","orange"],"🌍":["globe","teal"],"🌏":["globe","teal"],"🌎":["globe","teal"],"🌐":["globe","blue"],
    "🤖":["bot","indigo"],"⏱":["timer","cyan"],"⏰":["timer","red"],"📅":["calendar","red"],"🗓":["calendar","red"],"🌙":["moon","violet"],
    "🎁":["gift","pink"],"🔔":["bell","amber"],"⚙":["gear","slate"],"🎨":["palette","grape"],"💬":["chat","blue"],"🏠":["home","green"],
    "✈":["plane","blue"],"✅":["check","green"],"💡":["bulb","amber"],"❤":["heart","red"],"🃏":["cards","violet"],"🗂":["cards","blue"],
    "🔍":["search","blue"],"🔎":["search","blue"],"🌤":["sun","amber"],"☀":["sun","amber"],"🧭":["compass","teal"],"🏁":["flag","slate"],
    "👉":["pointer","blue"],"🕸":["web","violet"],"🚀":["rocket","indigo"],"🧠":["brain","pink"],"👥":["users","blue"],"🎲":["cards","red"],"🇲🇳":["flag","red"]
  };
  var miss=window.__icMiss={};
  var RE=/^\s*([\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*️?)\s*/u;
  function key(e){return e.replace(/️/g,"").replace(/[\u{1F3FB}-\u{1F3FF}]/gu,"");}
  function tile(e,size){
    var m=M[key(e)];if(!m){miss[e]=1;return null;}
    var s=document.createElement("span"),c=C[m[1]];
    s.className="ict"+(size?" "+size:"");s.setAttribute("aria-hidden","true");
    s.style.setProperty("--ia",c[0]);s.style.setProperty("--ib",c[1]);
    s.innerHTML='<svg viewBox="0 0 24 24">'+G[m[0]]+'</svg>';
    return s;
  }
  // элементийн эхний бичвэрийн эхэнд эможи байвал хавтангаар солино
  function lead(el,size){
    if(el.querySelector(".ict"))return;
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),n;
    while((n=w.nextNode())&&!n.nodeValue.trim()){}
    if(!n)return;
    var m=n.nodeValue.match(RE);if(!m)return;
    var t=tile(m[1],size);if(!t)return;
    n.nodeValue=n.nodeValue.slice(m[0].length);
    n.parentNode.insertBefore(t,n);
  }
  function card(i){
    if(i.firstElementChild)return; // зураг, svg аль хэдийн байгаа
    var e=i.textContent.trim();if(!e)return;
    var m=M[key(e)];if(!m){miss[e]=1;return;}
    var c=C[m[1]];i.classList.add("ict");i.style.setProperty("--ia",c[0]);i.style.setProperty("--ib",c[1]);
    i.innerHTML='<svg viewBox="0 0 24 24">'+G[m[0]]+'</svg>';
  }
  function scan(){
    var r=document.querySelector(".app")||document.body;
    r.querySelectorAll(".gamecard>i:not(.ict)").forEach(card);
    r.querySelectorAll(".toolgrid .btn").forEach(function(b){lead(b,"s");});
    r.querySelectorAll("h3,.note>b:first-child,.note>div:first-child>b:first-child").forEach(function(b){lead(b,"s");});
    r.querySelectorAll(".seg button,.modes button").forEach(function(b){lead(b,"xs");});
  }
  var queued=false;
  function later(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;scan();});}
  window.SalkhiIcons={scan:scan,tile:tile};
  function start(){scan();new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
