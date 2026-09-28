document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('#publish-form');
  const list=document.querySelector('#published-list');
  function draw(){
    const items=RadarUtil.getUserOpportunities();
    list.innerHTML=items.map(op=>'<div class="published-item"><div><strong>'+op.titulo+'</strong><br><small>'+op.categoria+' · '+op.modalidad+' · Cierra '+RadarUtil.formatDate(op.fechaLimite)+'</small></div><button class="btn btn-danger js-delete" data-id="'+op.id+'"><i class="bi bi-trash"></i> Eliminar</button></div>').join('');
    list.querySelectorAll('.js-delete').forEach(b=>b.addEventListener('click',()=>{RadarUtil.deleteUserOpportunity(b.dataset.id);draw();RadarUtil.showToast('Publicación eliminada.')}));
  }
  function readImage(file){return new Promise(resolve=>{if(!file)return resolve('');const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>resolve('');r.readAsDataURL(file)})}
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    let ok=true;
    form.querySelectorAll('[required]').forEach(i=>{i.classList.remove('invalid');if(!i.value.trim()){i.classList.add('invalid');ok=false}});
    if(!ok){RadarUtil.showToast('Completa los campos obligatorios.');return}
    const fd=new FormData(form),obj={};
    fd.forEach((v,k)=>{if(k!=='imagen')obj[k]=v});
    obj.imagen=await readImage(form.imagen.files[0]);
    RadarUtil.createUserOpportunity(obj);
    form.reset();
    draw();
    RadarUtil.showToast('Oportunidad publicada correctamente.');
  });
  draw();
});