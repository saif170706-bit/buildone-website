document.addEventListener("DOMContentLoaded",function(){
  var burger=document.querySelector(".burger");
  var nav=document.querySelector(".navlinks");
  if(burger&&nav){
    burger.addEventListener("click",function(){nav.classList.toggle("open")});
    nav.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){nav.classList.remove("open")})});
  }
  var form=document.getElementById("contact-form");
  if(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var btn=form.querySelector("button[type=submit]");
      btn.textContent="Skickat! Vi hör av oss inom 24h ✓";
      btn.disabled=true;
      form.reset();
    });
  }
});
