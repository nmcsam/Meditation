// ===== Phần "22 Quyền" (module gốc) =====
let currentView = 'sacdanh';
const viewOrder = ['sacdanh','coi','chiphap','duyen'];
const viewIcons = {sacdanh:'◐', coi:'◈', chiphap:'✳', duyen:'⇄'};

function renderQuyenNav(){
  const nav = document.getElementById('nav');
  nav.innerHTML = viewOrder.map(k=>
    `<button class="${k===currentView?'active':''}" onclick="switchQuyenView('${k}')">
      <span class="ico">${viewIcons[k]}</span>${VIEWS[k].title}
    </button>`
  ).join('');
}

function switchQuyenView(k){
  currentView = k;
  renderQuyenNav();
  renderQuyenGrid();
  document.getElementById('main').scrollTop = 0;
}

function renderQuyenGrid(){
  const v = VIEWS[currentView];
  const grid = document.getElementById('grid');
  grid.className = 'circle-grid';
  grid.style.display = 'grid';
  grid.innerHTML = QUYEN_DATA.map(d=>{
    const cat = v.colors[v.key(d)] || 'gray';
    return `<div class="circle cat-${cat}" onclick="openQuyenSheet(${d.id})">
      <div class="cp" style="font-weight:800">${d.id}</div>
      <div class="cn">${d.ten}</div>
      <div class="cp">${d.pali.split(' ')[0]}</div>
    </div>`;
  }).join('');
  const legend = document.getElementById('legend');
  legend.style.display = 'flex';
  legend.innerHTML = v.legend.map(([c,,label])=>
    `<div class="legend-item"><span class="dot cat-${c}"></span>${label}</div>`
  ).join('');
  document.getElementById('extra-content').innerHTML = (typeof tkQuyen==='function' ? tkQuyen() : '');
}

function openQuyenSheet(id){
  const d = QUYEN_DATA.find(x=>x.id===id);
  const html = `
    <div class="sheet-head"><span class="num">${d.id}</span><h2>${d.ten}</h2></div>
    <p class="sheet-pali">${d.pali}</p>

    <div class="sec">
      <div class="sec-label">Cai quản (phận sự)</div>
      <div class="sec-body">${d.canquan}</div>
    </div>

    <div class="sec">
      <div class="sec-label">Chi pháp</div>
      <div class="sec-body">${d.chiphap}</div>
    </div>

    <div class="sec">
      <div class="sec-label">Thuộc về 4 Thực tính pháp</div>
      <div class="pill-row">${d.paramattha.map(p=>`<span class="pill cat-${p==='tam'?'purple':p==='sohuu'?'amber':'teal'}">${PARAMATTHA_LABELS[p]}</span>`).join('')}</div>
      <div class="sec-body" style="margin-top:6px">${d.paramattha_detail}</div>
    </div>

    <div class="sec">
      <div class="sec-label">Nhóm Sắc / Danh</div>
      <div class="pill-row"><span class="pill cat-${d.sacdanh==='sac'?'purple':d.sacdanh==='danh'?'teal':'coral'}">${d.sacdanh_label}</span></div>
    </div>

    <div class="sec">
      <div class="sec-label">Địa vực (Cõi)</div>
      <div class="pill-row"><span class="pill cat-${d.coi==='duc'?'coral':d.coi==='bacoi'?'amber':d.coi==='sieuthe'?'purple':'teal'}">${d.coi_label}</span></div>
      <div class="sec-body" style="margin-top:6px">${d.coi_detail}</div>
    </div>

    <div class="sec">
      <div class="sec-label">Quy nạp Chi pháp Chân đế</div>
      <div class="pill-row"><span class="pill cat-gray">${d.chiphapchande_label}</span></div>
      <div class="sec-body" style="margin-top:6px">${d.chiphapchande_cung}</div>
    </div>

    <div class="sec">
      <div class="sec-label">Vai trò trong Quyền Duyên (Paṭṭhāna)</div>
      <div class="pill-row"><span class="pill cat-${d.duyen?'teal':'gray'}">${d.duyen?'Có làm năng duyên':'Không làm năng duyên'}</span></div>
      ${d.duyen_loai ? `<div class="sec-body" style="margin-top:6px"><b>${d.duyen_loai}</b></div>` : ''}
      <div class="sec-body" style="margin-top:4px">${d.duyen_detail}</div>
    </div>
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function closeSheet(){
  document.getElementById('sheet').classList.remove('show');
  document.getElementById('sheet-backdrop').classList.remove('show');
  document.querySelectorAll('.pdot-selected').forEach(x=>x.classList.remove('pdot-selected'));
  if(typeof clearTamsoLit==='function') clearTamsoLit();
}

// Chạm 2 bước: chạm LẦN 1 vào ô tròn → ô phóng to + viền xanh (xác nhận đã chọn đúng ô);
// chạm LẦN 2 vào đúng ô đó → mới mở trang chi tiết. Chạm sang ô khác → chuyển chọn sang ô đó.
// (Dùng capture-phase để chặn onclick mở trang ở lần chạm đầu tiên.)
document.addEventListener('click', function(e){
  const dot = e.target.closest('.pdot-sm,.pdot-ring-big,.circle,.dkc');
  if(!dot) return;
  if(dot.classList.contains('pdot-selected')) return; // lần 2: cho onclick chạy, mở chi tiết
  e.stopPropagation();
  e.preventDefault();
  document.querySelectorAll('.pdot-selected').forEach(x=>x.classList.remove('pdot-selected'));
  clearTamsoLit();
  dot.classList.add('pdot-selected');
  if(dot.dataset.k){
    tamsoHighlight(dot.dataset.k); // trang Tâm↔Tâm sở: sáng các ô phối hợp
    if(typeof showTapInfoByKey==='function') showTapInfoByKey(dot.dataset.k); // + bảng động mô tả
  }
}, true);

// ===== (Trang Tâm ↔ Tâm sở) Chạm lần 1: làm MỜ các ô không phối hợp =====
function clearTamsoLit(){
  document.querySelectorAll('.pdot-dim,.pdot-lit,.pdot-lit-ani').forEach(x=>x.classList.remove('pdot-dim','pdot-lit','pdot-lit-ani'));
}
function tamsoHighlight(key){
  const kind = key.slice(0,2), rawId = key.slice(3);
  const partners = new Set([key]);
  const aniSet = new Set();
  if(kind==='ci'){
    const c = CITTA_DATA.find(x=>x.id===parseInt(rawId,10));
    if(!c) return;
    c.ceta.forEach(cid=>partners.add('ce-'+cid));
    if(typeof ANIYATA_INFO!=='undefined'){
      for(const [cid,info] of Object.entries(ANIYATA_INFO)){
        if(info.cittas.includes(c.id)){ partners.add('ce-'+cid); aniSet.add('ce-'+cid); }
      }
    }
  } else if(kind==='ce'){
    CITTA_DATA.forEach(c=>{ if(c.ceta.includes(rawId)) partners.add('ci-'+c.id); });
    if(typeof ANIYATA_INFO!=='undefined' && ANIYATA_INFO[rawId]){
      ANIYATA_INFO[rawId].cittas.forEach(cid=>{ partners.add('ci-'+cid); aniSet.add('ci-'+cid); });
    }
  } else return;
  document.querySelectorAll('[data-k]').forEach(el=>{
    const k = el.dataset.k;
    if(!partners.has(k)) el.classList.add('pdot-dim');
    else if(aniSet.has(k) && k!==key) el.classList.add('pdot-lit-ani'); // bất định: viền đứt, sáng nửa
  });
  // các ô ngoài phạm vi phối hợp (sắc pháp, Níp-bàn, chế định...) cũng mờ đi
  document.querySelectorAll('#extra-content .pdot-sm:not([data-k]), #extra-content .pdot-ring-big').forEach(el=>el.classList.add('pdot-dim'));
}

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg=>{
      // Chủ động kiểm tra bản mới: ngay khi mở app, mỗi lần quay lại app, và mỗi 30 phút
      const check = ()=>{ try{ reg.update(); }catch(e){} };
      check();
      document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') check(); });
      setInterval(check, 30*60*1000);
    }).catch(()=>{});
    // Khi service worker mới tiếp quản → tự tải lại trang một lần để nhận ngay bản mới
    let reloadedOnce = false;
    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      if(!hadController || reloadedOnce) return;
      reloadedOnce = true;
      location.reload();
    });
  });
}

// ===== Điều chỉnh cỡ chữ RIÊNG CHO TỪNG TRANG (lưu lại giữa các lần mở app) =====
let fontScales = {};
try{ fontScales = JSON.parse(localStorage.getItem('quyen22-fontscales')) || {}; }catch(e){ fontScales = {}; }

function applyFontScale(){
  const sc = fontScales[currentSection] || 1;
  document.documentElement.style.setProperty('--fontscale', sc.toFixed(2));
  const p = document.getElementById('fontscale-pct');
  if(p) p.textContent = Math.round(sc*100) + '%';
  const z = document.getElementById('zf-pct');
  if(z) z.textContent = Math.round(sc*100) + '%';
  localStorage.setItem('quyen22-fontscales', JSON.stringify(fontScales));
}

function openZoomFloat(delta){
  try{ closeSheet(); }catch(e){}
  const f=document.getElementById('zoom-float');
  if(f) f.style.display='flex';
  adjustFontScale(delta||0);
  applySheetScale();
}
function zfAdjust(delta){ try{ closeSheet(); }catch(e){} adjustFontScale(delta); }
function zfSheetAdjust(delta){
  const sh=document.getElementById('sheet'); if(sh) sh.classList.add('show');
  const bd=document.getElementById('sheet-backdrop'); if(bd) bd.classList.add('show');
  adjustSheetScale(delta);
}
function closeZoomFloat(){
  const f=document.getElementById('zoom-float');
  if(f) f.style.display='none';
}
function adjustFontScale(delta){
  const sc = fontScales[currentSection] || 1;
  fontScales[currentSection] = Math.min(1.6, Math.max(0.5, sc + delta));
  applyFontScale();
}

window.addEventListener('load', applyFontScale);


// ===== Cỡ chữ RIÊNG của bảng chi tiết (độc lập với zoom từng trang) =====
let sheetScale = 1;
try{ sheetScale = parseFloat(localStorage.getItem('quyen22-sheetscale')) || 1; }catch(e){}
function applySheetScale(){
  document.documentElement.style.setProperty('--sheetscale', sheetScale.toFixed(2));
  try{ localStorage.setItem('quyen22-sheetscale', sheetScale.toFixed(2)); }catch(e){}
  const z = document.getElementById('zf-sheet-pct');
  if(z) z.textContent = Math.round(sheetScale*100) + '%';
}
function adjustSheetScale(delta){
  sheetScale = Math.min(1.7, Math.max(0.9, sheetScale + delta));
  applySheetScale();
}
applySheetScale();
