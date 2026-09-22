/* Equilibria · comportamiento y efectos de scroll de las landings */
(function(){
  "use strict";
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- próxima sesión (viernes, hora de Perú) ---------- */
  var meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","setiembre","octubre","noviembre","diciembre"];
  function proximoViernes(){
    try{
      var fmt=new Intl.DateTimeFormat("en-US",{timeZone:"America/Lima",weekday:"short",hour:"numeric",hour12:false,year:"numeric",month:"numeric",day:"numeric"});
      var p={};fmt.formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
      var dows={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
      var dow=dows[p.weekday],hora=parseInt(p.hour,10)%24;
      var suma=(5-dow+7)%7; if(suma===0&&hora>=20) suma=7;
      var d=new Date(Date.UTC(+p.year,+p.month-1,+p.day+suma));
      return "Viernes "+d.getUTCDate()+" de "+meses[d.getUTCMonth()];
    }catch(e){ return "Este viernes"; }
  }
  var txt=proximoViernes();
  document.querySelectorAll("[data-fecha]").forEach(function(el){
    el.textContent = el.getAttribute("data-fecha")==="min" ? txt.toLowerCase() : txt;
  });
  var y=document.getElementById("year"); if(y) y.textContent=new Date().getFullYear();

  /* ---------- barra de progreso de lectura ---------- */
  if(!RM){
    var bar=document.createElement("div");
    bar.className="eq-progress"; bar.innerHTML='<i></i>';
    document.body.appendChild(bar);
    var fill=bar.firstChild, ticking=false;
    function updBar(){
      var h=document.documentElement.scrollHeight-window.innerHeight;
      fill.style.transform="scaleX("+(h>0?Math.min(1,window.scrollY/h):0)+")";
      ticking=false;
    }
    addEventListener("scroll",function(){ if(!ticking){ticking=true;requestAnimationFrame(updBar);} },{passive:true});
    updBar();
  }

  /* ---------- reparto escalonado dentro de las rejillas ---------- */
  var GRUPOS=".cards,.matrix,.docs,.grid4,.grid3,.errs,.chips,.gal,.faq,.tags";
  document.querySelectorAll(GRUPOS).forEach(function(cont){
    var hijos=Array.prototype.slice.call(cont.children);
    if(hijos.length<2) return;
    var rapido=cont.classList.contains("chips")||cont.classList.contains("tags");
    cont.classList.remove("rv","d1","d2","d3");
    hijos.forEach(function(h,i){
      h.classList.add("rv");
      h.style.transitionDelay=Math.min(i*(rapido?45:85),520)+"ms";
    });
  });

  /* ---------- aparición al hacer scroll ---------- */
  var els=document.querySelectorAll(".rv");
  function revelarTodo(){ els.forEach(function(e){e.classList.add("in")}); }
  function enPantalla(e){ var r=e.getBoundingClientRect(); return r.top < (innerHeight||0)*0.92 && r.bottom > 0; }

  if(RM || !("IntersectionObserver" in window)){
    revelarTodo();
  } else {
    var observoAlgo=false;
    var io=new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){
        if(e.isIntersecting){ observoAlgo=true; e.target.classList.add("in"); io.unobserve(e.target); }
      });
    },{threshold:0,rootMargin:"0px 0px -12% 0px"});
    els.forEach(function(e){io.observe(e)});
    // lo que ya está a la vista al cargar, sin esperar
    setTimeout(function(){ els.forEach(function(e){ if(!e.classList.contains("in") && enPantalla(e)) e.classList.add("in"); }); }, 90);
    // red de seguridad: solo si el observador nunca respondió
    setTimeout(function(){ if(!observoAlgo) revelarTodo(); }, 5000);
  }

  /* ---------- números que cuentan ---------- */
  function contar(el){
    var bruto=el.getAttribute("data-val") || el.textContent.trim();
    var m=bruto.match(/^(\D*)(\d+)(.*)$/);
    if(!m){ return; }
    el.setAttribute("data-val",bruto);
    var pre=m[1], fin=parseInt(m[2],10), post=m[3];
    if(fin===0){ return; }
    var ini=performance.now(), dur=1100;
    function paso(t){
      var k=Math.min(1,(t-ini)/dur), e=1-Math.pow(1-k,3);
      el.textContent=pre+Math.round(fin*e)+post;
      if(k<1) requestAnimationFrame(paso);
    }
    el.textContent=pre+"0"+post;
    requestAnimationFrame(paso);
  }
  var nums=document.querySelectorAll(".stats b, .ba .v");
  if(nums.length && !RM && "IntersectionObserver" in window){
    var io2=new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ contar(e.target); io2.unobserve(e.target); } });
    },{threshold:.6});
    nums.forEach(function(n){io2.observe(n)});
  }

  /* ---------- CTA fijo en móvil ---------- */
  var hero=document.querySelector('[data-cta="hero"]'),sb=document.getElementById("sticky"),fin=document.querySelector(".final");
  if(hero&&sb&&fin&&"IntersectionObserver" in window){
    var fuera=false,dentro=false;
    function upd(){ sb.classList.toggle("show",fuera&&!dentro) }
    new IntersectionObserver(function(e){fuera=!e[0].isIntersecting;upd()},{threshold:0}).observe(hero);
    new IntersectionObserver(function(e){dentro=e[0].isIntersecting;upd()},{threshold:.2}).observe(fin);
  }

  /* ---------- píxel ---------- */
  document.querySelectorAll("[data-cta]").forEach(function(a){
    a.addEventListener("click",function(){
      try{ fbq("trackCustom","ClickUnirme",{placement:a.getAttribute("data-cta"),landing:document.body.getAttribute("data-landing")||""}) }catch(e){}
    });
  });
})();
