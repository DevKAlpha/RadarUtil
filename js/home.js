document.addEventListener('DOMContentLoaded',async()=>{
  const data=await RadarUtil.getAllOpportunities();
  const grid=document.querySelector('#featured-grid');
  const featuredIds=['1','2','3','4','5','6'];
  const items=featuredIds.map(id=>data.find(x=>String(x.id)===id)).filter(Boolean);
  grid.innerHTML=items.map(op=>RadarUtil.renderOpportunityCard(op,'home')).join('');
  RadarUtil.bindFavoriteButtons(grid);
  document.querySelector('#home-search').addEventListener('submit',e=>{
    e.preventDefault();
    const q=e.currentTarget.querySelector('input').value.trim();
    location.href='explorar.html'+(q?'?q='+encodeURIComponent(q):'');
  });
});