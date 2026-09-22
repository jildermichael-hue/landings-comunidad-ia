/* Equilibria · comportamiento común de las landings */
(function(){
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

  var els=document.querySelectorAll(".rv");
  function revelarTodo(){ els.forEach(function(e){e.classList.add("in")}) }
  if(!("IntersectionObserver" in window)){ revelarTodo(); }
  else{
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
    els.forEach(function(e){io.observe(e)});
    // red de seguridad: si el observador no responde, nada queda invisible
    setTimeout(function(){
      els.forEach(function(e){
        if(e.classList.contains("in")) return;
        var r=e.getBoundingClientRect();
        if(r.top < (window.innerHeight||0) && r.bottom > 0) e.classList.add("in");
      });
    },1200);
    setTimeout(revelarTodo,4000);
  }

  var hero=document.querySelector('[data-cta="hero"]'),bar=document.getElementById("sticky"),fin=document.querySelector(".final");
  if(hero&&bar&&fin&&"IntersectionObserver" in window){
    var fuera=false,dentro=false;
    function upd(){ bar.classList.toggle("show",fuera&&!dentro) }
    new IntersectionObserver(function(e){fuera=!e[0].isIntersecting;upd()},{threshold:0}).observe(hero);
    new IntersectionObserver(function(e){dentro=e[0].isIntersecting;upd()},{threshold:.2}).observe(fin);
  }

  document.querySelectorAll("[data-cta]").forEach(function(a){
    a.addEventListener("click",function(){
      try{ fbq("trackCustom","ClickUnirme",{placement:a.getAttribute("data-cta"),landing:document.body.getAttribute("data-landing")||""}) }catch(e){}
    });
  });
})();
