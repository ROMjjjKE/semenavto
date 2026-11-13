
(function(){
  'use strict';
  /* ---------- меню ---------- */
  var drawer=document.getElementById('drawer'), burger=document.getElementById('burger'),
      closeBtn=document.getElementById('drawerClose'), lastFocus=null;
  function openDrawer(){
    if(!drawer||!burger) return;
    lastFocus=document.activeElement;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden','false');
    burger.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    var f=drawer.querySelector('a,button'); if(f) f.focus();
  }
  function closeDrawer(){
    if(!drawer||!burger) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden','true');
    burger.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    if(lastFocus&&lastFocus.focus) lastFocus.focus();
  }
  if(burger) burger.addEventListener('click',function(){
    drawer.classList.contains('is-open')?closeDrawer():openDrawer();
  });
  if(closeBtn) closeBtn.addEventListener('click',closeDrawer);
  if(drawer) drawer.addEventListener('click',function(e){
    if(e.target.tagName==='A') closeDrawer();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
    if(e.key==='Tab' && drawer && drawer.classList.contains('is-open')){
      var f=drawer.querySelectorAll('a,button'), first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize',function(){
    if(window.innerWidth>1049 && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* ---------- протокол замеров ---------- */
  /* норма: min,max (null = без границы); порог «проверить» — 5% от нормы */
  var ROWS=[
    {id:'p1',name:'АКБ, двигатель выключен',u:'В',min:12.4,max:12.8,warn:12.2},
    {id:'p2',name:'Зарядка при 2000 об/мин',u:'В',min:13.8,max:14.6,warn:13.2},
    {id:'p3',name:'Ток утечки, двери закрыты',u:'мА',min:0,max:40,warn:80},
    {id:'p4',name:'Падение на массе при прокрутке',u:'В',min:0,max:0.30,warn:0.50},
    {id:'p5',name:'Напряжение стартера при прокрутке',u:'В',min:9.5,max:null,warn:9.0}
  ];
  var proto=document.getElementById('proto');
  function verdictFor(r,v){
    if(isNaN(v)) return null;
    if(r.id==='p3'){ return v<=r.max?'ok':(v<=r.warn?'warn':'bad'); }
    if(r.id==='p5'){ return v>=r.min?'ok':(v>=r.warn?'warn':'bad'); }
    if(r.id==='p4'){ return v<=r.max?'ok':(v<=r.warn?'warn':'bad'); }
    if(r.id==='p1'){ return (v>=r.min&&v<=r.max)?'ok':(v>=r.warn?'warn':'bad'); }
    return (v>=r.min&&v<=r.max)?'ok':(v>=r.warn&&v<r.min?'warn':'bad');
  }
  var TXT={ok:'норма',warn:'проверить',bad:'неисправно'};
  function runProto(){
    if(!proto) return;
    var worst='ok', filled=0, lines=[];
    ROWS.forEach(function(r){
      var inp=document.getElementById(r.id), chip=document.getElementById('v'+r.id.slice(1));
      if(!inp||!chip) return;
      var v=parseFloat(String(inp.value).replace(',','.'));
      var res=verdictFor(r,v);
      chip.className='chip chip--ok'; chip.textContent='—';
      if(res){
        filled++;
        chip.className='chip chip--'+res; chip.textContent=TXT[res];
        if(res==='bad') worst='bad'; else if(res==='warn'&&worst!=='bad') worst='warn';
        lines.push(r.name+': '+v+' '+r.u+' — '+TXT[res]);
      }
    });
    var sum=document.getElementById('psum'), ver=document.getElementById('pverdict'),
        note=document.getElementById('pnote'), wa=document.getElementById('pwa');
    if(!filled){
      if(sum) sum.textContent='Введите хотя бы одно измерение';
      if(ver){ ver.className='chip'; ver.textContent='—'; }
      if(note) note.textContent='Нормы: АКБ 12,4–12,8 В · зарядка 13,8–14,6 В · утечка до 40 мА · падение на массе до 0,3 В · стартер от 9,5 В.';
      if(wa) wa.href='';
      return;
    }
    if(sum) sum.textContent='Заполнено '+filled+' из '+ROWS.length;
    if(ver){ ver.className='chip chip--'+worst; ver.textContent= worst==='ok'?'Все в норме':(worst==='warn'?'Есть отклонения':'Нужен ремонт'); }
    var text='';
    if(worst==='ok') text='Замеры в пределах нормы. Если проблема проявляется периодически — опишите symptoms, посмотрим на стенде.';
    else if(worst==='warn') text='Есть отклонения: возможно, пора менять щётки, регулятор напряжения или чистить контакты. Проверим на стенде.';
    else text='Отклонения серьёзные: вероятен ремонт стартера или генератора. Точный диагноз — после снятия и проверки на стенде.';
    if(note) note.textContent=text;
    if(wa) wa.href='https://wa.me/375333507120?text='+encodeURIComponent('Замеры по протоколу '+LEGAL_SAFE()+':\n'+lines.join('\n'));
  }
  function LEGAL_SAFE(){ return 'СемёнАвто'; }
  if(proto){
    proto.addEventListener('input',runProto);
    proto.addEventListener('change',runProto);
    runProto();
  }

  /* ---------- форма ---------- */
  var form=document.getElementById('lead-form');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var g=function(id){ var el=document.getElementById(id); return el?el.value.trim():''; };
      var name=g('lname'), phone=g('lphone'), task=g('ltask'), msg=g('lmsg');
      if(!name||!phone){ var ok0=document.getElementById('lead-ok');
        if(ok0){ ok0.textContent='Укажите имя и телефон'; ok0.classList.add('on'); } return; }
      var text='Заявка с сайта СемёнАвто\nИмя: '+name+'\nТелефон: '+phone+'\nРабота: '+task+(msg?'\nКомментарий: '+msg:'');
      var ok=document.getElementById('lead-ok');
      if(ok){ ok.textContent='Открываем WhatsApp с готовым сообщением…'; ok.classList.add('on'); }
      window.open('https://wa.me/375333507120?text='+encodeURIComponent(text),'_blank');
    });
  }
})();
