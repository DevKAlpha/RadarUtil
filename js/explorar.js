document.addEventListener('DOMContentLoaded',async()=>{
  const all=await RadarUtil.getAllOpportunities();
  let selected=new URLSearchParams(location.search).get('categoria')||'Todas';
  const search=document.querySelector('#explore-search-input');
  const grid=document.querySelector('#explore-grid');
  const sort=document.querySelector('#sort-select');
  const count=document.querySelector('#result-count');
  search.value=new URLSearchParams(location.search).get('q')||'';
  function draw(){
    const q=search.value.trim().toLowerCase();
    let items=all.filter(op=>(selected==='Todas'||op.categoria===selected)&&(!q||((op.titulo+' '+op.descripcion+' '+op.categoria).toLowerCase().includes(q))));
    items.sort((a,b)=>sort.value==='antiguas'?a.fechaPublicacion.localeCompare(b.fechaPublicacion):b.fechaPublicacion.localeCompare(a.fechaPublicacion));
    count.textContent='Mostrando '+items.length+' oportunidades';
    grid.innerHTML=items.length?items.map(op=>RadarUtil.renderOpportunityCard(op,'explore')).join(''):'<div class="empty-state" style="grid-column:1/-1"><h3>No encontramos oportunidades con esos filtros.</h3></div>';
    RadarUtil.bindFavoriteButtons(grid);
  }
  document.querySelectorAll('.filter-chip').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.category===selected);
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selected=btn.dataset.category;
      draw();
    });
  });
  document.querySelector('#explore-search-form').addEventListener('submit',e=>{e.preventDefault();draw()});
  sort.addEventListener('change',draw);
  draw();
});