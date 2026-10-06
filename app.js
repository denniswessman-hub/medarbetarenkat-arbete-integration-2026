'use strict';
(() => {
  const { themes, voices, questions } = window.SURVEY_DATA;
  const actions = window.DEVELOPMENT_ACTIONS;
  const actionStart = themes.length + 1;
  const lastSlide = themes.length + actions.length + 1;
  const slideCount = lastSlide + 1;
  const $ = (id) => document.getElementById(id);
  const escape = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines = s => escape(s).replace(/\n/g,'<br>');
  const labels = ['Stämmer mycket bra','Stämmer ganska bra','Stämmer varken bra eller dåligt','Stämmer ganska dåligt','Stämmer mycket dåligt'];
  const shortLabels = ['Mycket bra','Ganska bra','Varken bra eller dåligt','Ganska dåligt','Mycket dåligt'];
  const categoryName = type => type === 'keep' ? 'Att behålla' : 'Att utveckla';
  let category = location.hash === '#konkreta-steg' ? 'develop' : 'keep';
  let returnFocus;
  let slide = 0;
  function renderThemes() {
    $('theme-grid').innerHTML = themes.filter(t => t.type === category).map((t,i) => `
      <article class="theme-card ${t.type}"><div class="card-top"><span class="card-number">0${i+1}</span><span class="card-type">${categoryName(t.type)}</span></div>
      <h3>${escape(t.title)}</h3><p>${escape(t.summary)}</p><button class="card-link" data-theme="${t.id}" aria-label="Läs förslagen om ${escape(t.title)}">${t.type === 'develop' ? 'Förslag, resultat & konkreta steg' : 'Läs förslagen & se resultat'} <span aria-hidden="true">+</span></button></article>`).join('');
    $('theme-panel').setAttribute('aria-labelledby',`tab-${category}`);
    $('konkreta-steg').hidden = category !== 'develop';
    document.querySelectorAll('[role="tab"]').forEach(tab => {const active = tab.dataset.category === category;tab.setAttribute('aria-selected',String(active));tab.tabIndex = active ? 0 : -1;});
  }
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    tab.addEventListener('click', () => {category = tab.dataset.category;renderThemes();});
    tab.addEventListener('keydown',e => {if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();category = e.key === 'Home' ? 'keep' : e.key === 'End' ? 'develop' : category === 'keep' ? 'develop' : 'keep';renderThemes();$(`tab-${category}`).focus();}});
  });
  $('voices-list').innerHTML = voices.map((v,i) => `<details class="voice"><summary><span class="voice-number">0${i+1}</span><span>${escape(v.title)}</span></summary><div class="voice-content"><div><h4>${escape(v.keepLabel)}</h4><ul>${v.keep.map(p=>`<li>${lines(p)}</li>`).join('')}</ul></div><div class="development"><h4>${escape(v.developLabel)}</h4><ul>${v.develop.map(p=>`<li>${lines(p)}</li>`).join('')}</ul></div><p class="context">Originalformuleringar från textavsnitt ${i+1}. ${escape(v.note || 'Rubriken i den stängda raden är tillagd för överblick.')}</p></div></details>`).join('');
  function actionMarkup(a, i) {
    return `<details class="action-plan"><summary><span class="action-index">0${i+1}</span><span class="action-heading"><span class="action-area">${escape(a.area)}</span><strong>${escape(a.title)}</strong><span class="action-description">${escape(a.summary)}</span><span class="action-time">Första steg: ${escape(a.start)}</span></span></summary><div class="action-content"><p class="action-result"><strong>Det ni tar fram:</strong> ${escape(a.result)}</p><h3>Gör så här, steg för steg</h3><ol class="action-steps">${a.steps.map(s=>`<li><h4>${escape(s.title)}</h4><p>${escape(s.text)}</p></li>`).join('')}</ol><div class="action-roles"><section><h3>Arbetsgivaren gör</h3><p>${escape(a.employer)}</p></section><section><h3>Medarbetarna gör</h3><p>${escape(a.employees)}</p></section></div><div class="action-example"><h3>Ett konkret exempel</h3><p>${escape(a.example)}</p></div><h3>Så följer ni upp</h3><p>${escape(a.followup)}</p><p class="action-boundary">${escape(a.boundary)}</p><div class="action-source"><p>${escape(a.sourceNote)}</p>${a.sources.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a>`).join('')}<p>Tiderna och det konkreta upplägget är förslag för er diskussion.</p></div></div></details>`;
  }
  $('action-list').innerHTML = actions.map(actionMarkup).join('');
  function chart(page) {
    const q = questions[page];
    return `<article class="chart"><h4>${escape(q.title)}</h4><p class="chart-meta">2026 · ${q.total} svar · PDF sida ${q.page}</p><div class="bar" role="img" aria-label="${escape(q.values.map((v,i)=>`${labels[i]}: ${v}`).join('. '))}">${q.values.map((v,i)=>v ? `<span class="response-${i}" style="flex:${v}" title="${labels[i]}: ${v}">${v}</span>` : '').join('')}</div><ul class="legend" aria-hidden="true">${q.values.map((v,i)=>`<li><i class="response-${i}"></i>${shortLabels[i]}: ${v}</li>`).join('')}</ul><details><summary>Visa svaren som tabell</summary><table class="chart-table"><thead><tr><th scope="col">Svarsalternativ</th><th scope="col">Antal</th></tr></thead><tbody>${q.values.map((v,i)=>`<tr><th scope="row">${labels[i]}</th><td>${v}</td></tr>`).join('')}</tbody></table></details></article>`;
  }
  function openTheme(id, button) {
    const t = themes.find(t=>t.id===id);
    if(!t) return;
    returnFocus = button;
    $('detail-label').textContent = `${categoryName(t.type)} · Sammanställt tema`;
    $('detail-content').innerHTML = `<div class="detail-header"><h2 id="detail-title">${escape(t.title)}</h2><p>${escape(t.summary)}</p></div><div class="detail-columns"><div><h3>Det här lyfts i förslagen</h3><ul>${t.points.map(p=>`<li>${escape(p)}</li>`).join('')}</ul><p class="section-note">Sammanfattat från Wordunderlaget. Originalformuleringarna finns under Alla inspel.</p></div><aside class="conversation"><h3>Att prata om tillsammans</h3><p>${escape(t.question)}</p>${t.extraQuestion?`<p style="margin-top:18px">${escape(t.extraQuestion)}</p>`:''}<small>${escape(t.questionSource)}</small></aside></div><section class="evidence"><h3>Så ser svaren ut i enkäten</h3><p class="evidence-intro">Antal svar per alternativ. Samtliga fem alternativ visas, även när antalet är noll.</p>${t.note?`<p class="evidence-intro">${escape(t.note)}</p>`:''}${t.pages.map(chart).join('')}</section>`;
    const actionIndex = actions.findIndex(a=>a.themeId===id);
    if(actionIndex>=0) {
      $('detail-content').querySelector('.evidence').insertAdjacentHTML('beforebegin',`<section class="detail-action"><p class="eyebrow">NYTT I VERSION 2</p><h3>Ett konkret arbetssätt att pröva</h3><p class="section-note">Ett nytt förslag som kompletterar er handledning. Upplägget är inte beslutat och ingår inte i originalinspel eller enkätresultat.</p>${actionMarkup(actions[actionIndex],actionIndex)}</section>`);
    }
    $('theme-dialog').showModal();
    $('theme-dialog').scrollTop=0;
    document.body.classList.add('modal-open');
    $('close-detail').focus();
  }
  $('theme-grid').addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b) openTheme(b.dataset.theme,b);});
  $('close-detail').addEventListener('click',()=>$('theme-dialog').close());
  $('theme-dialog').addEventListener('close',()=>{document.body.classList.remove('modal-open');returnFocus?.focus();});
  $('theme-dialog').addEventListener('click',e=>{if(e.target === $('theme-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  function renderSlide() {
    const focusedId = document.activeElement?.id;
    let content;
    if(slide===0) {
      content=`<p class="eyebrow">INFÖR VÅRT GEMENSAMMA VAL</p><h2 id="slide-title">Vår arbetsplats framåt.</h2><p class="slide-lead">Medarbetarenkät 2026 och medarbetarnas förslag.</p><div class="slide-cols"><div><h3>Tre områden att behålla</h3><p class="slide-lead">Vad fungerar bra och är viktigt att värna?</p></div><div><h3>Tre områden att utveckla</h3><p class="slide-lead">Vad vill vi arbeta vidare med tillsammans?</p></div></div><p class="slide-footnote">11 enkätsvar 2026. Temana på följande bilder är en sammanställning av förslagen. Inga områden är beslutade.</p>`;
    } else if(slide===lastSlide) {
      content=`<p class="eyebrow">DET GEMENSAMMA VALET ÅTERSTÅR</p><h2 id="slide-title">Vad tar vi vidare?</h2><div class="slide-cols"><div><h3>Förslag att behålla</h3><ul>${themes.filter(t=>t.type==='keep').map(t=>`<li>${escape(t.title)}</li>`).join('')}</ul></div><div><h3>Förslag att utveckla</h3><ul>${themes.filter(t=>t.type==='develop').map(t=>`<li>${escape(t.title)}</li>`).join('')}</ul></div></div><p class="slide-question">Enas om tre områden att behålla och tre att utveckla, med de enskilda förslagen som utgångspunkt.</p><p class="slide-footnote">Rubrikerna här är teman för överblick. Det gemensamma valet kan formuleras utifrån de enskilda punkterna.</p>`;
    } else if(slide>=actionStart) {
      const a=actions[slide-actionStart];
      content=`<p class="eyebrow">NYTT FÖRSLAG ATT PRÖVA · ${slide-actionStart+1} AV ${actions.length}</p><h2 id="slide-title" class="action-slide-title">${escape(a.title)}</h2><div class="slide-cols action-slide-cols"><div><h3>Tre konkreta steg</h3><ol>${a.slideSteps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol></div><div><h3>Arbetsgivaren</h3><p>${escape(a.employer)}</p><h3>Medarbetarna</h3><p>${escape(a.employees)}</p></div></div><p class="slide-question">${escape(a.slideCheck)}</p><p class="slide-footnote">Komplement till handledningen. Tider och upplägg är förslag för er diskussion. Källstöd: ${a.sources.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a>`).join(' · ')}.</p>`;
    } else {
      const t=themes[slide-1];
      content=`<p class="eyebrow">${categoryName(t.type).toUpperCase()} · TEMA ${((slide-1)%3)+1} AV 3</p><h2 id="slide-title">${escape(t.title)}</h2><div class="slide-cols"><div><h3>Medarbetarnas förslag</h3><ul>${t.points.map(p=>`<li>${escape(p)}</li>`).join('')}</ul></div><div><h3>Enkätresultat 2026</h3><p class="slide-lead">${escape(t.highlight)}</p><p class="slide-footnote">Källa: enkätens PDF, sida ${t.pages[0]}.</p></div></div><p class="slide-question">${escape(t.question)}</p><p class="slide-footnote">${escape(t.questionSource)} Sammanställt tema, inte ett beslutat område.</p>`;
    }
    $('slide-content').innerHTML=content;
    $('slide-content').classList.toggle('action-slide',slide>=actionStart && slide<lastSlide);
    $('slide-counter').textContent=`${slide+1} / ${slideCount}`;
    $('slide-progress').style.width=`${(slide+1)/slideCount*100}%`;
    $('prev-slide').disabled=slide===0;
    $('next-slide').disabled=slide===lastSlide;
    if(slide===lastSlide && focusedId==='next-slide') $('prev-slide').focus();
    if(slide===0 && focusedId==='prev-slide') $('next-slide').focus();
    $('presentation').scrollTop=0;
  }
  function startPresentation(e, startIndex=0){returnFocus=e.currentTarget;slide=startIndex;renderSlide();$('presentation').showModal();document.body.classList.add('modal-open');$('next-slide').focus();}
  $('present').addEventListener('click',e=>startPresentation(e));
  $('present-bottom').addEventListener('click',e=>startPresentation(e));
  $('present-actions').addEventListener('click',e=>startPresentation(e,actionStart));
  $('prev-slide').addEventListener('click',()=>{if(slide>0){slide--;renderSlide();}});
  $('next-slide').addEventListener('click',()=>{if(slide<lastSlide){slide++;renderSlide();}});
  $('exit-presentation').addEventListener('click',()=>$('presentation').close());
  $('presentation').addEventListener('close',()=>{document.body.classList.remove('modal-open');returnFocus?.focus();});
  $('presentation').addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&slide<lastSlide){e.preventDefault();slide++;renderSlide();}else if(e.key==='ArrowLeft'&&slide>0){e.preventDefault();slide--;renderSlide();}else if(e.key==='Home'){e.preventDefault();slide=0;renderSlide();}else if(e.key==='End'){e.preventDefault();slide=lastSlide;renderSlide();}});
  renderThemes();
  function revealActions(){if(location.hash==='#konkreta-steg'){category='develop';renderThemes();$('konkreta-steg').scrollIntoView({behavior:'instant',block:'start'});}}
  window.addEventListener('hashchange',revealActions);
  revealActions();
})();
