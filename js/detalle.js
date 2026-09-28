document.addEventListener('DOMContentLoaded',async()=>{
  const id=new URLSearchParams(location.search).get('id');
  const all=await RadarUtil.getAllOpportunities();
  const op=all.find(x=>String(x.id)===String(id))||all[0];
  document.title=op.titulo+' | Radar Útil';
  document.querySelector('#detail-category').textContent=op.categoria;
  document.querySelector('#detail-title').textContent=op.titulo;
  document.querySelector('#detail-pill').textContent=op.categoria;
  document.querySelector('#detail-image').src=op.id===1?'assets/detail-programming.svg':RadarUtil.imageForOpportunity(op);
  document.querySelector('#detail-image').alt=op.titulo;
  document.querySelector('#detail-description').textContent=op.descripcionCompleta||op.descripcion;
  document.querySelector('#detail-modality').textContent=op.modalidad;
  document.querySelector('#detail-cost').textContent=op.costo;
  document.querySelector('#detail-open').textContent=RadarUtil.formatDate(op.fechaApertura);
  document.querySelector('#detail-deadline').textContent=RadarUtil.formatDate(op.fechaLimite);
  document.querySelector('#detail-duration').textContent=op.duracion||'Por definir';
  document.querySelector('#sidebar-title').textContent=op.titulo;
  document.querySelector('#sidebar-desc').textContent=op.descripcion;
  document.querySelector('#side-modality').textContent=op.modalidad;
  document.querySelector('#side-cost').textContent=op.costo;
  document.querySelector('#side-open').textContent=RadarUtil.formatDate(op.fechaApertura);
  document.querySelector('#side-deadline').textContent=RadarUtil.formatDate(op.fechaLimite);
  document.querySelector('#side-duration').textContent=op.duracion||'Por definir';
  document.querySelector('#requirements').innerHTML=(op.requisitos||[]).map(r=>'<li><i class="bi bi-check-circle-fill"></i>'+r+'</li>').join('');
  const favs=document.querySelectorAll('.detail-favorite');
  function sync(){
    const saved=RadarUtil.isFavorite(op.id);
    favs.forEach(b=>b.innerHTML='<i class="bi '+(saved?'bi-bookmark-fill':'bi-bookmark')+'"></i> '+(saved?'Guardado en favoritos':'Agregar a favoritos'));
  }
  favs.forEach(b=>b.addEventListener('click',()=>{
    const added=RadarUtil.toggleFavorite(op.id);
    sync();
    RadarUtil.showToast(added?'Oportunidad agregada a favoritos.':'Oportunidad eliminada de favoritos.');
  }));
  sync();
  document.querySelectorAll('.apply-btn').forEach(a=>a.addEventListener('click',e=>{
    if(!op.url||op.url==='#'){e.preventDefault();RadarUtil.showToast('En esta versión académica la convocatoria es demostrativa.')}
    else a.href=op.url;
  }));
});