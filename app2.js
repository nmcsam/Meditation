// ===== Điều phối 3 phần chính của app =====
const APP_VERSION = 'v90'; // nhớ nâng cùng CACHE_NAME trong sw.js mỗi lần cập nhật
let currentSection = 'quyen22';
let tamsoMode = 'tam2so';

const CITTA_GROUP_COLOR = {vonhan:'gray', batthien:'coral', ducgioi_tinhhao:'teal', sacgioi:'blue', vosacgioi:'purple', sieuthe:'green'};
const CETASIKA_GROUP_COLOR = {bienhanh:'gray', toitha:'amber', batthien_bh:'coral', batthien_rieng:'pink', tinhhao_bh:'teal', tietche:'blue', voluong:'purple', tuequyen:'green'};
const CETASIKA_GROUP_LABEL = {bienhanh:'Biến hành (7)', toitha:'Tợ tha - Biệt cảnh (6)', batthien_bh:'Bất thiện Biến hành (4)', batthien_rieng:'Bất thiện Riêng biệt (10)', tinhhao_bh:'Tịnh hảo Biến hành (19)', tietche:'Tiết chế (3)', voluong:'Vô lượng (2)', tuequyen:'Tuệ quyền (1)'};
const CETASIKA_GROUP_ORDER = ['bienhanh','toitha','batthien_bh','batthien_rieng','tinhhao_bh','tietche','voluong','tuequyen'];

function renderSectionSwitch(){
  const sections = [['home','Trang đầu'],['daolo','Đạo Lộ Tu Tập'],['xugioi','12 Xứ · 18 Giới'],['canh','21 Cảnh'],['quyen22','22 Quyền'],['duyenhe','24 Duyên hệ'],['coi31','31 Cõi'],['trodao','37 Trợ đạo'],['tamso','Tâm ↔ Tâm sở'],['dactinh','Pháp thực tính'],['duyenkhoi','Duyên khởi'],['demucthien','Đề mục thiền'],['anduc','Ân Đức Tam Bảo']];
  const cur = sections.find(x=>x[0]===currentSection);
  const pct = Math.round(((typeof fontScales!=='undefined' && fontScales[currentSection])||1)*100) + '%';
  document.getElementById('section-switch').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;min-width:0">
      <div class="ddwrap">
        <button class="ddbtn" onclick="toggleDD('dd-pages',event)">☰ Chức năng <span class="caret">▾</span></button>
        <div class="ddmenu" id="dd-pages">
          ${sections.map(([k,label])=>`<button class="dditem ${k===currentSection?'on':''}" onclick="closeAllDD();switchSection('${k}')">${label}</button>`).join('')}
        </div>
      </div>
      <span class="cur-page">${cur?cur[1]:''}</span>
    </div>
    <button class="ddbtn2" onclick="openSettingsSheet()" aria-label="Cài đặt">⚙ Cài đặt<span id="ab-sync-dot"></span></button>`;
  try{ abUpdateSyncBtn(); }catch(e){} // module đồng bộ nằm cuối file — lần vẽ đầu tiên lúc khởi động sẽ bỏ qua, abInitSync sẽ cập nhật lại sau
}

// ===== Trình đơn sổ xuống dùng chung =====
function toggleDD(id, ev){
  if(ev) ev.stopPropagation();
  const m = document.getElementById(id);
  if(!m) return;
  const wasOpen = m.classList.contains('open');
  closeAllDD();
  if(!wasOpen) m.classList.add('open');
}
function closeAllDD(){
  document.querySelectorAll('.ddmenu.open').forEach(function(m){ m.classList.remove('open'); });
}
document.addEventListener('click', function(e){
  if(!e.target.closest || !e.target.closest('.ddwrap')) closeAllDD();
});

// ===== Ô vuông: ấn lần 1 lún xuống, ấn lần 2 mới mở nội dung =====
document.addEventListener('click', function(e){
  const c = e.target.closest && e.target.closest('.circle');
  if(!c) return;
  if(!c.classList.contains('pressed')){
    e.stopPropagation();
    e.preventDefault();
    document.querySelectorAll('.circle.pressed').forEach(function(x){ x.classList.remove('pressed'); });
    c.classList.add('pressed');
    try{ closeAllDD(); }catch(err){}
  }else{
    c.classList.remove('pressed');
    // không chặn — sự kiện đi tiếp tới onclick của ô để mở nội dung
  }
}, true);

const PAGE_ACTIONS = {
  quyen22: `<button class="qbtn" onclick="openQuyenDanhSac()">Danh · Sắc quyền</button>
    <button class="qbtn" onclick="openQuyenCoi()">Địa vức (Cõi)</button>
    <button class="qbtn" onclick="openQuyenChiPhap16()">16 chi pháp chân đế</button>
    <button class="qbtn" onclick="openQuyenDuyenTQ()">Quyền duyên</button>`,
  xugioi: `<button class="qbtn" onclick="openXGDoiChieu()">Đối chiếu Xứ ↔ Giới</button>
    <button class="qbtn" onclick="openXGTomTat()">Tóm tắt số pháp</button>`,
  trodao: `<button class="qbtn" onclick="openTDChiPhap14()">Chi pháp: 14 tâm sở</button>
    <button class="qbtn" onclick="openTD7TT()">7 Thanh tịnh</button>
    <button class="qbtn" onclick="openTDMinhHanh()">Minh · Hạnh · 4 hạng người</button>`
};

function switchSection(s){
  if(typeof hideTapInfo==='function') hideTapInfo();
  currentSection = s;
  try{ localStorage.setItem('quyen22-section', s); }catch(e){}
  if(typeof applyFontScale==='function') applyFontScale();
  const pa = document.getElementById('page-actions');
  if(pa) pa.innerHTML = PAGE_ACTIONS[s] || '';
  renderSectionSwitch();
  closeSheet();
  const grid = document.getElementById('grid');
  const legend = document.getElementById('legend');
  const extra = document.getElementById('extra-content');
  const vp = document.getElementById('viewport-meta');
  if(s==='tamso'||s==='duyenkhoi'){
    vp.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
  } else {
    vp.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }
  if(s==='home'){
    document.getElementById('page-subtitle').textContent = 'Thắng Pháp — Vi Diệu Pháp · mở ☰ Chức năng để chọn trang';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderHomePage();
  } else if(s==='quyen22'){
    document.getElementById('page-subtitle').textContent = '22 Quyền (Bāvīsatindriya) · chạm vào một quyền để xem chi tiết';
    document.getElementById('nav').innerHTML = '';
    currentView = 'sacdanh';
    renderQuyenGrid();
  } else if(s==='tamso'){
    document.getElementById('page-subtitle').textContent = 'Tâm ↔ Tâm sở · chạm vào một ô để xem phối hợp';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderTamSoPage();
  } else if(s==='dactinh'){
    document.getElementById('page-subtitle').textContent = 'Pháp thực tính (Sabhāvadhamma) · chạm để xem 4 khía cạnh';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderDacTinhPage();
  } else if(s==='canh'){
    document.getElementById('page-subtitle').textContent = '21 Cảnh (Ārammaṇa) · chạm để xem những tâm biết cảnh';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderCanhPage();
  } else if(s==='duyenkhoi'){
    document.getElementById('page-subtitle').textContent = 'Duyên khởi (Paṭiccasamuppāda) · chạm vào một chi để xem chi pháp';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderDuyenKhoiPage();
  } else if(s==='duyenhe'){
    document.getElementById('page-subtitle').textContent = '24 Duyên hệ (Paṭṭhāna) · chạm để xem định nghĩa và chi pháp';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderDuyenHePage();
  } else if(s==='xugioi'){
    document.getElementById('page-subtitle').textContent = '12 Xứ (Āyatana) · 18 Giới (Dhātu) — chạm để xem chi pháp';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderXuGioiPage();
  } else if(s==='trodao'){
    document.getElementById('page-subtitle').textContent = '37 Phẩm Trợ Đạo (Bodhipakkhiyadhamma) · chạm một phẩm để xem chi tiết';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderTroDaoPage();
  } else if(s==='coi31'){
    document.getElementById('page-subtitle').textContent = '31 Cõi (Bhūmi) · chạm vào một cõi để xem tục sinh và hạng người';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderCoi31Page();
  } else if(s==='daolo'){
    document.getElementById('page-subtitle').textContent = 'Đạo lộ tu tập · chạm vào từng tầng tháp để xem chi tiết';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderDaoLoPage();
  } else if(s==='anduc'){
    document.getElementById('page-subtitle').textContent = 'Ân Đức Tam Bảo · chọn Phật · Pháp · Tăng rồi chạm "chi tiết" ở mỗi ân đức';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderAnDucPage();
  } else if(s==='demucthien'){
    document.getElementById('page-subtitle').textContent = '40 Đề mục thiền chỉ (Kammaṭṭhāna) · chạm để xem mức định, ấn tướng, tánh nết';
    grid.style.display='none';
    legend.style.display='none';
    document.getElementById('nav').innerHTML = '';
    renderDeMucThienPage();
  }
  document.getElementById('main').scrollTop = 0;
}

const VEDANA_COLOR = {kho:'#232323', lac:'#eec22b', uu:'#7a3030', hy:'#d13b3b', xa:'#2f7d46'};
const VEDANA_ORDER = ['kho','lac','uu','hy','xa'];

// Trường hợp đặc biệt: các tâm sở bất định (chỉ khởi tùy hoàn cảnh) không nằm cố định
// trong danh sách ceta của tâm, nên tính riêng phạm vi Thọ dựa trên tâm mà chúng có thể khởi cùng.
const VEDANA_OVERRIDE = {
  man: ['hy','xa'], tat: ['uu'], lan: ['uu'], hoi: ['uu'], bi: ['hy','xa'], tuyhy: ['hy','xa']
};

function vedanaSetOf(cetaId){
  if(VEDANA_OVERRIDE[cetaId]) return VEDANA_OVERRIDE[cetaId];
  const set = new Set();
  for(const cit of CITTA_DATA){ if(cit.ceta.includes(cetaId)) set.add(cit.vedana); }
  return VEDANA_ORDER.filter(v=>set.has(v));
}

function dotBackgroundStyle(colors){
  if(colors.length<=1){
    return `background:${VEDANA_COLOR[colors[0]]||'#999'}`;
  }
  if(colors.length===2){
    return `background:linear-gradient(180deg, ${VEDANA_COLOR[colors[0]]} 50%, ${VEDANA_COLOR[colors[1]]} 50%)`;
  }
  const n = colors.length;
  const stops = colors.map((c,i)=> `${VEDANA_COLOR[c]} ${Math.round(i/n*100)}% ${Math.round((i+1)/n*100)}%`).join(', ');
  return `background:conic-gradient(${stops})`;
}

function renderTamSoPage(){
  const extra = document.getElementById('extra-content');

  // center:true => hàng này được canh giữa dưới bề ngang 8 cột (theo đúng bản NÊU)
  // groupGap:true => có khoảng cách lớn hơn phía trên (bắt đầu nhóm tâm mới)
  const cittaChunks = [
    {count:8, cols:8},                                          // Tham
    {count:2, cols:2, center:true},                             // Sân
    {count:2, cols:2, center:true},                             // Si
    {count:7, cols:7, groupGap:true},                           // Vô nhân: Quả Bất Thiện
    {count:8, cols:8},                                          // Vô nhân: Quả Thiện
    {count:3, cols:3, center:true},                             // Vô nhân: Duy Tác
    {count:8, cols:8, groupGap:true},                           // Dục giới tịnh hảo: Thiện
    {count:8, cols:8},                                          // Dục giới tịnh hảo: Quả
    {count:8, cols:8},                                          // Dục giới tịnh hảo: Duy Tác
    {count:5, cols:5, thanthong:true, groupGap:true},           // Sắc giới: Thiện (+Thần thông)
    {count:5, cols:5},                                          // Sắc giới: Quả
    {count:5, cols:5, thanthong:true},                          // Sắc giới: Duy Tác (+Thần thông)
    {count:4, cols:4, groupGap:true, indent:4},                 // Vô Sắc giới: Thiện (thụt vào — cột 5→8)
    {count:4, cols:4, indent:4},                                // Vô Sắc giới: Quả
    {count:4, cols:4, indent:4},                                // Vô Sắc giới: Duy Tác
    {count:20, cols:5, groupGap:true},                          // Siêu thế: Đạo
    {count:20, cols:5},                                         // Siêu thế: Quả
  ];
  const cetaChunks = [
    {count:7, cols:7}, {count:6, cols:6},
    {count:4, cols:4, groupGap:true}, {count:3, cols:3}, {count:4, cols:4}, {count:2, cols:2}, {count:1, cols:1},
    {count:7, cols:7, groupGap:true}, {count:12, cols:6},
    {count:3, cols:3, groupGap:true}, {count:2, cols:2}, {count:1, cols:1},
  ];

  let ci = 0;
  let cittaHtml = '';
  const REFW = `calc(8 * var(--dot) + 14px)`; // bề ngang chuẩn 8 cột (ô + 7 khe 2px), khung quy chiếu để canh giữa
  for(const chunk of cittaChunks){
    const items = CITTA_DATA.slice(ci, ci+chunk.count);
    ci += chunk.count;
    const dashedDot = chunk.thanthong ? `<div class="pdot-sm pdot-dashed" onclick="openThanThongSheet()"></div>` : '';
    const cols2 = chunk.cols + (chunk.thanthong?1:0);
    const rowW = `calc(${cols2} * var(--dot) + ${(cols2-1)*2}px)`;
    let rowStyle = `width:${rowW}`;
    if(chunk.center) rowStyle += ';margin:0 auto';
    else if(chunk.indent) rowStyle += `;margin-left:calc(${chunk.indent} * (var(--dot) + 2px))`;
    cittaHtml += `<div class="pblock${chunk.groupGap?' pblock-gap':''}" style="width:${REFW}">
      <div class="prow" style="grid-template-columns:repeat(${cols2},var(--dot));${rowStyle}">
        ${items.map(c=>`<div class="pdot-sm" data-k="ci-${c.id}" style="background:${VEDANA_COLOR[c.vedana]}" onclick="tapNeuCitta(${c.id})"></div>`).join('')}${dashedDot}
      </div>
    </div>`;
  }

  let ei = 0;
  let cetaHtml = '';
  for(const chunk of cetaChunks){
    const items = CETASIKA_DATA.slice(ei, ei+chunk.count);
    ei += chunk.count;
    const cls = 'pblock' + (chunk.groupGap?' pblock-gap':'');
    cetaHtml += `<div class="${cls}">
      <div class="prow" style="grid-template-columns:repeat(${chunk.cols},var(--dot))">
        ${items.map(c=>`<div class="pdot-sm" data-k="ce-${c.id}" style="${dotBackgroundStyle(vedanaSetOf(c.id))}" onclick="tapNeuCet('${c.id}')"></div>`).join('')}
      </div>
    </div>`;
  }

  // ---- Sắc pháp (28) — 4 Đại hiển đặc biệt + 24 sắc còn lại ----
  const rupaSpecialColor = {pathavi:'#a9784f', apo:'#3f9fd6', tejo:'#d4501e', vayo:'#6fa9c4'};
  const dai4 = RUPA_DATA.slice(0,4);
  const rupaRest = RUPA_DATA.slice(4);
  let rupaHtml = `<div class="pblock"><div class="prow" style="grid-template-columns:repeat(4,var(--dot))">
    ${dai4.map(r=>`<div class="pdot-sm" style="background:${rupaSpecialColor[r.id]}" onclick="openDacTinhRupa('${r.id}')"></div>`).join('')}
  </div></div>`;
  const rupaRowSizes = [5,4,2,4,2,3,4];
  let ri = 0;
  for(const sz of rupaRowSizes){
    const items = rupaRest.slice(ri, ri+sz);
    ri += sz;
    rupaHtml += `<div class="pblock"><div class="prow" style="grid-template-columns:repeat(${sz},var(--dot))">
      ${items.map(r=>`<div class="pdot-sm" style="background:#8b5fbf" onclick="openDacTinhRupa('${r.id}')"></div>`).join('')}
    </div></div>`;
  }

  // ---- 13 Pháp chế định: 6 Danh + 7 Nghĩa, gộp thành MỘT hàng duy nhất ----
  const namaColors = ['#4b3f8f','#5fa8d3','split-pb','split-bp','split-pb','split-bp'];
  const namaP = PANNATTI_DATA.filter(p=>p.nhom==='nama');
  const atthaP = PANNATTI_DATA.filter(p=>p.nhom==='attha');
  function pannattiDotStyle(colorKey){
    if(colorKey==='split-pb') return 'background:linear-gradient(180deg, #4b3f8f 50%, #5fa8d3 50%)';
    if(colorKey==='split-bp') return 'background:linear-gradient(180deg, #5fa8d3 50%, #4b3f8f 50%)';
    return `background:${colorKey}`;
  }
  const pannattiHtml = `<div class="pblock" style="display:flex;justify-content:space-between;width:100%">
    <div class="prow" style="grid-template-columns:repeat(7,var(--dot))">
      ${atthaP.map(p=>`<div class="pdot-sm" style="background:#4b3f8f" onclick="openPannattiSheet('${p.id}')"></div>`).join('')}
    </div>
    <div class="prow" style="grid-template-columns:repeat(6,var(--dot))">
      ${namaP.map((p,i)=>`<div class="pdot-sm" style="${pannattiDotStyle(namaColors[i])}" onclick="openPannattiSheet('${p.id}')"></div>`).join('')}
    </div>
  </div>`;

  extra.innerHTML = `
    <div class="poster-cols">
      <div class="poster-col">
        <div class="poster-col-title">TÂM (121)</div>
        ${cittaHtml}
      </div>
      <div class="poster-col">
        <div class="poster-col-title">TÂM SỞ (52)</div>
        ${cetaHtml}
        <div class="poster-col-title" style="margin-top:14px">SẮC PHÁP (28) &amp; NÍP-BÀN</div>
        <div style="display:flex;gap:10px;align-items:flex-end">
          <div style="flex:1">${rupaHtml}</div>
          <div class="pdot-ring-big" style="margin-right:4px" onclick="openNibbanaSheet()"></div>
        </div>
      </div>
    </div>
    <div class="poster-col-title" style="margin-top:14px">PHÁP CHẾ ĐỊNH (13) — 7 Nghĩa (trái) · 6 Danh (phải)</div>
    ${pannattiHtml}
    ${tkTamSo()}
  `;
}

function openThanThongSheet(){
  const html = `
    <div class="sheet-head"><h2>Thần thông</h2></div>
    <p class="sheet-pali">Abhiññā</p>
    <div class="sec"><div class="sec-label">Giải thích</div><div class="sec-body">Năng lực thần thông (như thiên nhãn, thiên nhĩ, tha tâm thông...) chỉ có thể phát triển từ nền tảng Tâm <b>Thiện Sắc giới</b> và Tâm <b>Duy Tác Sắc giới</b> (của bậc đã ly dục nhiễm, đắc các tầng thiền) — không phát triển được từ Tâm Quả Sắc giới, vì Tâm Quả chỉ là kết quả thọ hưởng, không có khả năng chủ động vận dụng thần lực.</div></div>
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function openNibbanaSheet(){
  const n = NIBBANA_DATA;
  const html = `
    <div class="sheet-head"><h2>${n.ten}</h2></div>
    <p class="sheet-pali">${n.pali}</p>
    <div class="sec"><div class="sec-label">Giải thích</div><div class="sec-body">${n.mota}</div></div>
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function openPannattiSheet(id){
  const p = PANNATTI_DATA.find(x=>x.id===id);
  const html = `
    <div class="sheet-head"><h2>${p.ten}</h2></div>
    <p class="sheet-pali">${p.pali} · ${p.nhom==='nama'?'Danh chế định':'Nghĩa chế định'}</p>
    <div class="sec"><div class="sec-label">Giải thích</div><div class="sec-body">${p.mota}</div></div>
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function openCittaSheet(id){
  const c = CITTA_DATA.find(x=>x.id===id);
  // Công thức theo nhóm: "36 = 13 Tợ tha + 23 Tịnh hảo"
  const byGroup = {};
  const groupOrder = [];
  c.ceta.forEach(cid=>{
    const ces = CETASIKA_DATA.find(x=>x.id===cid);
    if(!ces) return;
    if(!byGroup[ces.nhom]){ byGroup[ces.nhom]=[]; groupOrder.push(ces.nhom); }
    byGroup[ces.nhom].push(ces);
  });
  const NHOM_LABEL = {bienhanh:'Biến hành', toitha:'Biệt cảnh', batthien_bh:'Bất thiện biến hành', batthien_rieng:'Bất thiện', tinhhao_bh:'Tịnh hảo biến hành', tietche:'Tiết chế', voluong:'Vô lượng phần', tuequyen:'Trí tuệ'};
  const groupFormula = groupOrder.map(g=>`${byGroup[g].length} ${NHOM_LABEL[g]||g}`).join(' + ');
  // Công thức đầy đủ: "36 tâm sở = (An tịnh tâm + An tịnh thân + Cần + ...)" — xếp theo vần
  // theo đúng thứ tự Bảng Nêu (thứ tự trong CETASIKA_DATA)
  const names = CETASIKA_DATA.filter(x=>c.ceta.includes(x.id)).map(x=>x.ten.replace(/ \(sở hữu\)/,''));
  const html = `
    <div class="sheet-head"><h2>${cittaFullName(c)} <span style="font-weight:600;font-size:.62em;color:var(--ink-soft)">(${glossCitta(c)})</span></h2></div>
    <p class="sheet-pali">${c.groupLabel} · Cảm thọ: ${c.vedanaLabel}</p>
    <div class="big-count"><span class="big-num">${c.ceta.length}</span><span class="big-unit">tâm sở phối hợp</span></div>
    ${c.note ? `<div class="info-note"><b>Trường hợp đặc biệt:</b> ${c.note}</div>` : ''}
    <div class="sec" style="margin-top:14px">
      <div class="sec-label">Tâm sở phối hợp cố định (niyata)</div>
      <div class="sec-body"><b>${c.ceta.length}</b> = ${groupFormula}</div>
      <div class="sec-body" style="margin-top:8px"><b>${c.ceta.length}</b> = (${names.join(' + ')})</div>
    </div>
    ${(function(){
      const ani = aniyataOfCitta(id);
      if(!ani.length) return '';
      return `<div class="sec" style="margin-top:14px">
        <div class="sec-label">+ ${ani.length} tâm sở BẤT ĐỊNH (aniyata) — khi có chỉ có một, đôi khi không có</div>
        <div class="sec-body">${ani.join(' · ')}</div>
        <div class="info-note" style="margin-top:8px">Các tâm sở bất định chỉ khởi khi có cảnh tương ứng (Giới phần khi gặp đối tượng cần tiết chế; Bi khi thấy chúng sinh khổ; Tùy hỷ khi thấy chúng sinh hạnh phúc) và trong một sát-na <b>chỉ có tối đa một</b> trong số này. Tính tổng quát: ${c.ceta.length} + ${ani.length} = <b>${c.ceta.length + ani.length}</b> tâm sở. — <i>Đường Vào Thắng Pháp, Tỳ khưu Chánh Minh.</i></div>
      </div>`;
    })()}
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

// Tâm sở BẤT ĐỊNH (aniyatayogī): không nằm cố định trong danh sách tâm sở của tâm nào,
// nhưng CÓ THỂ khởi cùng một số tâm nhất định khi có dịp. Danh sách "tâm có thể phối hợp"
// được khai báo riêng ở đây (dữ liệu ceta của tâm chỉ chứa các tâm sở nhất định — niyata).
const APPAMANNA_CITTAS = [31,32,33,34,35,36,37,38, 47,48,49,50,51,52,53,54, 55,56,57,58, 60,61,62,63, 65,66,67,68];
const ANIYATA_INFO = {
  man:   {cittas:[3,4,7,8],  note:'Mạn là tâm sở <b>bất định</b> (aniyatayogī): chỉ có thể khởi cùng 4 tâm Tham <b>ly tà kiến</b>, và cũng chỉ khởi khi có dịp so sánh hơn–kém–bằng, không phải lúc nào cũng có mặt.'},
  tat:   {cittas:[9,10],     note:'Tật là tâm sở <b>bất định</b> (aniyatayogī): chỉ có thể khởi cùng 2 tâm Sân (khi ganh tỵ, tâm luôn kèm thọ Ưu và sự chống đối). Khởi <b>riêng lẻ</b> — trong một sát-na không đồng sinh cùng Lận hay Hối, vì mỗi pháp bắt một loại cảnh khác nhau.'},
  lan:   {cittas:[9,10],     note:'Lận là tâm sở <b>bất định</b> (aniyatayogī): chỉ có thể khởi cùng 2 tâm Sân. Khởi <b>riêng lẻ</b> — không đồng sinh cùng Tật hay Hối trong cùng một sát-na.'},
  hoi:   {cittas:[9,10],     note:'Hối là tâm sở <b>bất định</b> (aniyatayogī): chỉ có thể khởi cùng 2 tâm Sân. Khởi <b>riêng lẻ</b> — không đồng sinh cùng Tật hay Lận trong cùng một sát-na.'},
  bi:    {cittas:APPAMANNA_CITTAS, note:'Bi là tâm sở <b>bất định</b>: chỉ khởi khi lấy chúng sinh đang khổ làm cảnh — trong 16 tâm Đại thiện + Đại duy tác và 12 tâm Sắc giới từ Sơ thiền đến Tứ thiền (không có ở Ngũ thiền vì tầng này thuần Xả vi tế). Không đồng sinh cùng Tùy hỷ trong cùng sát-na.'},
  tuyhy: {cittas:APPAMANNA_CITTAS, note:'Tùy hỷ là tâm sở <b>bất định</b>: chỉ khởi khi lấy chúng sinh đang hạnh phúc/thành công làm cảnh — trong 16 tâm Đại thiện + Đại duy tác và 12 tâm Sắc giới từ Sơ thiền đến Tứ thiền. Không đồng sinh cùng Bi trong cùng sát-na.'},
  chanhngu:    {cittas:[31,32,33,34,35,36,37,38], note:'Ngoài 40 tâm Siêu thế (phối hợp <b>cố định</b>, cả 3 Tiết chế cùng khởi một lượt), Chánh ngữ còn khởi <b>bất định, riêng lẻ</b> trong 8 tâm Đại thiện — khi có dịp thực sự tránh xa ác ngữ.'},
  chanhnghiep: {cittas:[31,32,33,34,35,36,37,38], note:'Ngoài 40 tâm Siêu thế (phối hợp <b>cố định</b>), Chánh nghiệp còn khởi <b>bất định, riêng lẻ</b> trong 8 tâm Đại thiện — khi có dịp thực sự tránh xa thân ác hạnh.'},
  chanhmang:   {cittas:[31,32,33,34,35,36,37,38], note:'Ngoài 40 tâm Siêu thế (phối hợp <b>cố định</b>), Chánh mạng còn khởi <b>bất định, riêng lẻ</b> trong 8 tâm Đại thiện — khi có dịp thực sự tránh xa nuôi mạng sai trái.'}
};

function buildCittaGroupList(list){
  // Kiểu công thức: "91 tâm = 24 Dục giới tịnh hảo + 15 Sắc giới + 12 Vô sắc giới + 40 Siêu thế"
  const groupsPresent = [];
  for(const m of list){ if(!groupsPresent.includes(m.group)) groupsPresent.push(m.group); }
  const parts = [];
  const partials = [];
  for(const g of groupsPresent){
    const sub = list.filter(m=>m.group===g);
    const total = CITTA_DATA.filter(m=>m.group===g).length;
    parts.push(`${sub.length} ${sub[0].groupLabel}`);
    if(sub.length < total){
      partials.push(`<b>${sub.length} ${sub[0].groupLabel}</b> (trong ${total}): ${sub.map(m=>'Tâm '+m.name).join('; ')}`);
    }
  }
  let html = `<div class="sec-body"><b>${list.length}</b> = ${parts.join(' + ')}</div>`;
  if(partials.length){
    html += `<div class="sec-body" style="margin-top:8px;font-size:calc(15px * var(--fontscale))">${partials.join('<br><br>')}</div>`;
  }
  return html;
}

function openCetasikaSheet(id){
  const ces = CETASIKA_DATA.find(x=>x.id===id);
  const matching = CITTA_DATA.filter(c=>c.ceta.includes(id));
  const ani = ANIYATA_INFO[id];
  const aniCittas = ani ? ani.cittas.map(cid=>CITTA_DATA.find(c=>c.id===cid)).filter(Boolean) : [];

  let bigNum, bigUnit;
  if(ani && matching.length>0){ bigNum = `${matching.length} + ${aniCittas.length}`; bigUnit = 'tâm cố định + tâm bất định'; }
  else if(ani){ bigNum = aniCittas.length; bigUnit = 'tâm có thể phối hợp (bất định)'; }
  else { bigNum = matching.length; bigUnit = 'tâm phối hợp'; }

  let listHtml = '';
  if(matching.length>0){
    listHtml += `<div class="sec" style="margin-top:14px">
      <div class="sec-label">${matching.length} tâm phối hợp${ani?' cố định (niyata)':''}</div>
      ${buildCittaGroupList(matching)}
    </div>`;
  }
  if(aniCittas.length>0){
    listHtml += `<div class="sec" style="margin-top:14px">
      <div class="sec-label">${aniCittas.length} tâm có thể phối hợp — bất định (aniyata), chỉ khởi khi có dịp</div>
      ${buildCittaGroupList(aniCittas)}
    </div>`;
  }

  const dn4 = (typeof DACTINH_DATA!=='undefined' && DACTINH_DATA[id]) ? DACTINH_DATA[id].dt : '';
  const tenDay = 'Tâm sở ' + ces.ten.replace(/ \(sở hữu\)/,'');
  const html = `
    <div class="sheet-head"><h2>${tenDay}${dn4?` <span style="font-weight:600;font-size:.62em;color:var(--ink-soft)">(${dn4.charAt(0).toLowerCase()+dn4.slice(1)})</span>`:''}</h2></div>
    <p class="sheet-pali">${ces.pali}</p>
    <div class="big-count"><span class="big-num">${bigNum}</span><span class="big-unit">${bigUnit}</span></div>
    <div class="sec">
      <div class="sec-label">Giải thích / Vì sao phối hợp được, trường hợp đặc biệt</div>
      <div class="sec-body">${ces.giaithich}</div>
    </div>
    ${ani ? `<div class="info-note">${ani.note}</div>` : ''}
    ${ces.quyluat ? `<div class="info-note"><b>Công thức tính số tâm:</b> ${ces.quyluat}</div>` : ''}
    ${listHtml}
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

// (khởi tạo chuyển xuống cuối file — sau khi mọi dữ liệu đã khai báo)

// ===== Phần "Đặc tính · Chức năng · Thể hiện · Nhân gần" (Aṭṭhasālinī) =====

function plainCircleHTML(id, label, pali, opener, cls){
  return `<div class="circle ${cls||'circle-plain'}" onclick="${opener}('${id}')"><div class="cn">${label}</div>${pali?`<div class="cp">${pali}</div>`:''}</div>`;
}

function renderDacTinhGroup(title, items){
  let html = `<div class="group-head">${title}</div><div class="circle-grid">`;
  html += items.join('');
  html += `</div>`;
  return html;
}

// Níp-bàn (pháp thực tính thứ 80) — theo Vi Diệu Pháp Sơ Cấp (Sư Giác Giới)
const NIPBAN_DT = {
  dt:'Sự vắng lặng tuyệt đối', dtp:'Santi',
  cn:'Sự bất tử; tạo sự an ổn', cnp:'Accuti, Assāsakaraṇa',
  th:'Vô tướng; không còn hý luận', thp:'Animitta, Nippapañca',
  ng:'Không có — Níp-bàn là pháp vô vi, không bị tạo tác nên không có nhân cần thiết.', ngp:''
};

// 6 cặp tâm sở Tịnh hảo "thân – tâm" (kể chung 1 pháp thực tính mỗi cặp)
const DT_PAIRS = [
  {id1:'antinhthan', id2:'antinhtam', ten:'Tịnh thân · Tịnh tâm', pali:'Kāyapassaddhi · Cittapassaddhi'},
  {id1:'khinhthan', id2:'khinhtam', ten:'Khinh thân · Khinh tâm', pali:'Kāyalahutā · Cittalahutā'},
  {id1:'nhuthan', id2:'nhutam', ten:'Nhu thân · Nhu tâm', pali:'Kāyamudutā · Cittamudutā'},
  {id1:'thichthan', id2:'thichtam', ten:'Thích thân · Thích tâm', pali:'Kāyakammaññatā · Cittakammaññatā'},
  {id1:'thuanthan', id2:'thuantam', ten:'Thuần thân · Thuần tâm', pali:'Kāyapāguññatā · Cittapāguññatā'},
  {id1:'chanhthan', id2:'chanhtam', ten:'Chánh thân · Chánh tâm', pali:'Kāyujukatā · Cittujukatā'}
];

function renderDacTinhPage(){
  const extra = document.getElementById('extra-content');
  let n = 0;
  const groupsHtml = DACTINH_TL.map((g, gi)=>{
    const first = n + 1;
    const circles = g.items.map((it, ii)=>{
      n++;
      return `<div class="circle ${g.cls||'circle-plain'}" onclick="openDacTinhTL(${gi},${ii})"><div class="cn">${n}. ${it.ten}</div><div class="cp">${it.pali}</div></div>`;
    }).join('');
    const range = first===n ? `${first}.` : `${first}–${n} ·`;
    return `<div class="group-head">${range} ${g.ten}</div><div class="circle-grid">${circles}</div>`;
  }).join('');

  extra.innerHTML = `
    <p class="info-note" style="margin-bottom:12px"><b>Bốn khía cạnh thực tính (Sabhāvadhamma) của các pháp chân đế (Paramattha)</b> — trình bày đầy đủ theo tài liệu (tr. 531–551): mỗi pháp có <b>Đặc tính (Lakkhaṇā)</b>, <b>Chức năng (Rasā)</b>, <b>Sự thể hiện (Paccupaṭṭhānā)</b> và <b>Nhân gần (Padaṭṭhānā)</b> riêng — tổng cộng <b>135 mục</b>: Tâm, Ngũ Uẩn, Ngũ Song Thức – Ý Giới – Ý Thức Giới – 2 Tâm Tố vô nhân, 52 Tâm sở (Thọ chia 5, 6 cặp thân·tâm), 28 Sắc pháp, 12 chi Duyên khởi cùng Sầu·Bi·Khổ·Ưu·Não, ba loại Khổ, Tứ Đế, Tứ Vô Lượng Tâm, Thập Độ và Níp-bàn. Chạm vào từng pháp để xem 4 khía cạnh kèm Pāli.</p>
    ${groupsHtml}
    ${renderDacTinhGroup('Phụ lục · 14 chức năng của Tâm (Đường Vào Thắng Pháp — TK Chánh Minh)', [CHUCNANG_TAM_14.map((c,i)=>`<div class="circle circle-vt" onclick="openChucNangTam(${i})"><div class="cn">${i+1}. ${c.ten}</div><div class="cp">${c.pali}</div></div>`).join('')])}
    <p class="info-note">Nguồn: bảng "Bốn khía cạnh thực tính (Sabhāvadhamma) của các pháp chân đế (Paramattha)" theo <i>Milindapañhā, Visuddhimagga</i> và <i>Aṭṭhasālinī</i>; riêng phần giải thích về Thập Độ trích từ <i>Sīlakkhandhaṭīkā</i> và <i>Cariyapiṭaka-Aṭṭhakathā</i> (tài liệu tr. 531–551). Ô Nhân gần của Gió: tài liệu in "Nước, Lửa, Gió", đã sửa thành "Đất, Nước, Lửa" cho đúng ba Đại còn lại. Toàn bộ thuật ngữ Pāli và các ô đặc tính – phận sự – thành tựu – nhân gần đã được đối chiếu và hiệu đính theo <i>Visuddhimagga</i> (XIV, XVI) và <i>Aṭṭhasālinī</i> bản VRI.</p>
    ${tkDacTinh()}
  `;
}

function openDacTinhTL(gi, ii){
  const it = DACTINH_TL[gi].items[ii];
  showAttrSheet(attrSheetHTML(it.ten, it.pali, it));
}

function openChucNangTam(i){
  const c = CHUCNANG_TAM_14[i];
  showAttrSheet(`
    <div class="sheet-head"><h2>Chức năng ${i+1}: ${c.ten}</h2></div>
    <p class="sheet-pali">${c.pali}</p>
    <div class="sec">
      <div class="sec-label">Giải thích</div>
      <div class="sec-body">${c.giaithich}</div>
    </div>
    <div class="sec">
      <div class="sec-label">Tâm đảm nhận chức năng này</div>
      <div class="sec-body">${c.tam}</div>
    </div>
  `);
}

function openDacTinhPairByIdx(key){
  const i = parseInt(String(key).replace('pair',''),10);
  const p = DT_PAIRS[i];
  const a = DACTINH_DATA[p.id1], b = DACTINH_DATA[p.id2];
  const ca = CETASIKA_DATA.find(x=>x.id===p.id1), cb = CETASIKA_DATA.find(x=>x.id===p.id2);
  showAttrSheet(`
    <div class="sheet-head"><h2>${p.ten}</h2></div>
    <p class="sheet-pali">${p.pali} — một pháp thực tính, hai mặt: nhóm tâm sở ("thân") và tâm</p>
    <div class="group-head">${ca.ten} (${ca.pali})</div>
    ${attrBlocksOnly(a)}
    <div class="group-head" style="margin-top:14px">${cb.ten} (${cb.pali})</div>
    ${attrBlocksOnly(b)}
  `);
}

function openDacTinhNipban(){
  showAttrSheet(attrSheetHTML('Níp-bàn', 'Nibbāna — pháp thực tính thứ 80, pháp vô vi', NIPBAN_DT));
}

function attrBlocksOnly(item){
  return `
    <div class="attr-block attr-dt"><div class="attr-label">Đặc tính (Lakkhaṇā)</div><div class="sec-body">${item.dt}</div><div class="attr-pali">${item.dtp||''}</div></div>
    <div class="attr-block attr-cn"><div class="attr-label">Chức năng (Rasā)</div><div class="sec-body">${item.cn}</div><div class="attr-pali">${item.cnp||''}</div></div>
    <div class="attr-block attr-th"><div class="attr-label">Sự thể hiện (Paccupaṭṭhānā)</div><div class="sec-body">${item.th}</div><div class="attr-pali">${item.thp||''}</div></div>
    <div class="attr-block attr-ng"><div class="attr-label">Nhân gần (Padaṭṭhānā)</div><div class="sec-body">${item.ng}</div><div class="attr-pali">${item.ngp||''}</div></div>
  `;
}

function attrSheetHTML(headTitle, headSub, item){
  return `
    <div class="sheet-head"><h2>${headTitle}</h2></div>
    <p class="sheet-pali">${headSub}</p>
    <div class="attr-block attr-dt"><div class="attr-label">Đặc tính (Lakkhaṇā)</div><div class="sec-body">${item.dt}</div><div class="attr-pali">${item.dtp||''}</div></div>
    <div class="attr-block attr-cn"><div class="attr-label">Chức năng (Rasā)</div><div class="sec-body">${item.cn}</div><div class="attr-pali">${item.cnp||''}</div></div>
    <div class="attr-block attr-th"><div class="attr-label">Sự thể hiện (Paccupaṭṭhānā)</div><div class="sec-body">${item.th}</div><div class="attr-pali">${item.thp||''}</div></div>
    <div class="attr-block attr-ng"><div class="attr-label">Nhân gần (Padaṭṭhānā)</div><div class="sec-body">${item.ng}</div><div class="attr-pali">${item.ngp||''}</div></div>
  `;
}

function showAttrSheet(html){
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function openDacTinhCetasika(id){
  const c = CETASIKA_DATA.find(x=>x.id===id);
  const a = DACTINH_DATA[id];
  showAttrSheet(attrSheetHTML(c.ten, c.pali, a));
}

function openDacTinhRupa(id){
  const r = RUPA_DATA.find(x=>x.id===id);
  const a = DACTINH_DATA[id];
  showAttrSheet(attrSheetHTML(r.ten, r.pali, a));
}

function openDacTinhVaitro(id){
  const v = VAITRO_TAM_DATA.find(x=>x.id===id);
  showAttrSheet(attrSheetHTML(v.ten, v.pali, v));
}

function openDacTinhTho(id){
  const t = THO_CHITIET_DATA.find(x=>x.id===id);
  showAttrSheet(attrSheetHTML(t.ten, t.pali, t));
}

// ===== Phần "21 Cảnh" (Ārammaṇa) =====

function renderCanhPage(){
  const extra = document.getElementById('extra-content');
  const circles = CANH_DATA.map((c,i)=> plainCircleHTML(c.id, `${i+1}. ${c.ten}`, c.pali, 'openCanhSheet', 'circle-canh'));
  extra.innerHTML = `
    <p class="info-note" style="margin-bottom:12px">21 cách phân loại đối tượng (cảnh) mà Tâm có thể biết. Một số mục (6, 21) là cách gọi gộp chung các cảnh khác, không phải cảnh độc lập riêng biệt. Chạm vào từng cảnh để xem những tâm nào biết được nó, và những tâm nào biết cảnh ấy một cách "cố định" (không biết cảnh nào khác ngoài cảnh này).</p>
    <div class="circle-grid">${circles.join('')}</div>
    <p class="info-note" style="margin-top:14px">Nguồn: tổng hợp theo bài giảng Thắng Pháp Abhidhamma — chuaphapluan.com (Bài 69); đối chiếu tài liệu "6 Cảnh · 21 Cảnh · 7 Nhóm Tâm Biết Cảnh".</p>
    ${tkCanh()}
  `;
}

function openCanhSheet(id){
  const c = CANH_DATA.find(x=>x.id===id);
  const html = `
    <div class="sheet-head"><h2>${c.ten}</h2></div>
    <p class="sheet-pali">${c.pali}</p>
    ${c.biet ? `<div class="sec"><div class="sec-label">Tâm biết cảnh này</div><div class="sec-body">${c.biet}</div></div>` : ''}
    ${c.codinh ? `<div class="sec"><div class="sec-label">Tâm biết cảnh này cố định</div><div class="sec-body">${c.codinh}</div></div>` : ''}
    ${c.ghichu ? `<div class="info-note"><b>Ghi chú:</b> ${c.ghichu}</div>` : ''}
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

// ===== Trang "Duyên khởi" — bánh xe 12 chi Paṭiccasamuppāda =====
// Chi pháp theo bảng "Chi pháp pháp duyên khởi" (Đường Vào Thắng Pháp — TK Chánh Minh)

const DUYENKHOI_DATA = [
 {ten:'Vô minh', pali:'Avijjā',
  duyen:'Vô minh duyên Hành — Avijjāpaccayā saṅkhārā',
  chiphap:'Tâm sở <b>Si</b> hợp trong <b>12 tâm bất thiện</b>.',
  mogok:'Trạng thái không sáng suốt, bị si mê che lấp, không thấy rõ thực tánh của các pháp: bất tri trong <b>Tam tướng</b> (vô thường xem là trường tồn, khổ xem là hạnh phúc, vô ngã xem là "tôi, của tôi") và bất tri trong <b>Tứ Diệu Đế</b>. Vô minh có mặt do đời sống thất niệm — chính vì Vô minh nên làm duyên cho Hành có mặt.'},
 {ten:'Hành', pali:'Saṅkhāra',
  duyen:'Hành duyên Thức — Saṅkhārapaccayā viññāṇaṃ',
  chiphap:'Tâm sở <b>Tư</b> hợp trong <b>12 tâm bất thiện</b> + <b>17 tâm thiện hiệp thế</b> (gom thành <b>29 Tư</b>).',
  mogok:'Sự chủ ý tạo tác nghiệp thiện, bất thiện, bất động, dẫn đến tái sanh trong ba giới bốn loài. Có 3 kiểu: <b>Phúc hành</b> (Puññābhisaṅkhāra — làm thiện, sanh cõi người, trời Dục giới, Sắc giới), <b>Phi phúc hành</b> (Apuññābhisaṅkhāra — làm bất thiện, sanh 4 đường ác đạo), <b>Bất động hành</b> (Āneñjābhisaṅkhāra — tu thiền Vô sắc, sanh cõi Vô sắc, thọ tối đa 84.000 đại kiếp).'},
 {ten:'Thức', pali:'Viññāṇa',
  duyen:'Thức duyên Danh sắc — Viññāṇapaccayā nāmarūpaṃ',
  chiphap:'<b>32 tâm quả hiệp thế</b>.',
  mogok:'Thức tái sanh do chủ ý: mỗi chủ ý tạo tác thiện – bất thiện là sự quyết định tái sanh trong các cõi. Thức quy tụ năng lực ở chặng tư tưởng cuối cùng (cận tử) để quyết định tái sanh vào cảnh giới tương ứng. Thức (danh) luôn nương tựa sắc pháp, không thể đi riêng lẻ.'},
 {ten:'Danh sắc', pali:'Nāma-rūpa',
  duyen:'Danh sắc duyên Lục nhập — Nāmarūpapaccayā saḷāyatanaṃ',
  chiphap:'<b>Danh:</b> 35 tâm sở hợp trong 32 tâm quả hiệp thế.<br><b>Sắc:</b> sắc nghiệp tái tục, sắc nghiệp bình nhật, sắc tâm.',
  mogok:'Thức tái sanh thì tiếp tục có một Danh-Sắc mới để duy trì. Chết không phải là hết — chết là sự bắt đầu cho một hình hài mới, đời sống mới. Có 4 kiểu tái sanh: <b>Thai sanh, Noãn sanh, Hoá sanh, Thấp sanh</b>.'},
 {ten:'Lục nhập', pali:'Saḷāyatana',
  duyen:'Lục nhập duyên Xúc — Saḷāyatanapaccayā phasso',
  chiphap:'<b>6 nội xứ:</b> 5 sắc thần kinh + 32 tâm quả hiệp thế (ý xứ).',
  mogok:'Khi có Danh-Sắc thì hình thành 6 căn (6 nội xứ). <b>6 căn</b>: mắt, tai, mũi, lưỡi, thân, ý; <b>6 trần</b>: sắc, thanh, khí, vị, xúc, pháp; <b>6 thức</b>: nhãn, nhĩ, tỷ, thiệt, thân, ý. Khi 6 căn tiếp xúc 6 trần lập tức làm duyên cho 6 Xúc phát sanh.'},
 {ten:'Xúc', pali:'Phassa',
  duyen:'Xúc duyên Thọ — Phassapaccayā vedanā',
  chiphap:'Tâm sở <b>Xúc</b> hợp trong <b>32 tâm quả hiệp thế</b>.',
  mogok:'Sự giao tiếp, va chạm của 6 căn và 6 trần: 6 nội xứ tiếp xúc 6 ngoại xứ sinh ra 6 Xúc (nhãn xúc, nhĩ xúc, tỷ xúc, thiệt xúc, thân xúc, ý xúc). Do có 6 Xúc mà làm duyên cho 6 Thọ phát sanh.'},
 {ten:'Thọ', pali:'Vedanā',
  duyen:'Thọ duyên Ái — Vedanāpaccayā taṇhā',
  chiphap:'Tâm sở <b>Thọ</b> hợp trong <b>32 tâm quả hiệp thế</b>.',
  mogok:'Cảm giác tích cực, tiêu cực, trung tính của Thân – Tâm trước 6 trần cảnh: 3 loại (khổ, lạc, xả) hay 5 loại (khổ, lạc, hỷ, ưu, xả); theo môn có 6 thọ (nhãn thọ... ý thọ). Theo Mogok: <b>6 cảm thọ ngoại khách</b> (thọ xả nơi nhãn – nhĩ – tỷ – thiệt thức, thọ lạc và khổ nơi thân thức), <b>3 cảm thọ nội khách</b> (hỷ, ưu, xả sanh nơi tâm), <b>3 cảm thọ chủ</b> (hỷ, ưu, xả đi cùng hơi thở vô – ra). Do 6 Thọ dẫn đến 6 Ái.'},
 {ten:'Ái', pali:'Taṇhā',
  duyen:'Ái duyên Thủ — Taṇhāpaccayā upādānaṃ',
  chiphap:'Tâm sở <b>Tham</b> hợp trong <b>8 tâm tham</b> (<b>6 ái</b>).',
  mogok:'Sự thích thú, đam mê trên 6 trần cảnh — thèm khát không bao giờ thấy đủ. 6 ái: sắc ái... pháp ái. Có 3 loại: <b>Dục ái</b> (Kāmataṇhā — tham đắm trong 6 trần), <b>Hữu ái</b> (Bhavataṇhā — tham đắm hợp Thường kiến: tin cái tôi vĩnh cửu, đấng bề trên tối thượng, sự cứu cánh ngược lý nhân quả), <b>Phi hữu ái</b> (Vibhavataṇhā — tham đắm hợp Đoạn kiến: vô nhân kiến, vô hành kiến, vô hữu kiến). "Thọ duyên Ái" chính là mắt xích then chốt của vòng luân hồi.'},
 {ten:'Thủ', pali:'Upādāna',
  duyen:'Thủ duyên Hữu — Upādānapaccayā bhavo',
  chiphap:'Tâm sở <b>Tham</b> + tâm sở <b>Tà kiến</b> hợp trong <b>8 tâm tham</b> (<b>4 thủ</b>).',
  mogok:'Nắm giữ, chấp chặt vào đối tượng, gắn liền với tà kiến. <b>4 loại Thủ</b>: Dục thủ (Kāmupādāna — bám víu 5 trần cảnh), Kiến thủ (Diṭṭhupādāna — chấp chặt quan điểm sai lầm), Giới cấm thủ (Sīlabbatupādāna — chấp pháp hành sai lạc ngược Đạo Đế, mê tín lễ lạy cúng kiếng cầu xin), Ngã chấp thủ (Attavādupādāna — chấp "cái tôi" thường còn; thật ra chỉ có sự buồn, sự khổ chứ không có "tôi buồn, tôi khổ"). Chính 4 Thủ làm duyên cho Hữu có mặt.'},
 {ten:'Hữu', pali:'Bhava',
  duyen:'Hữu duyên Sanh — Bhavapaccayā jāti',
  chiphap:'<b>Nghiệp hữu:</b> tâm sở Tư hợp trong 12 tâm bất thiện + 17 tâm thiện hiệp thế (gom thành 29 Tư).<br><b>Sanh hữu:</b> 32 tâm quả hiệp thế, 35 tâm sở hợp, 20 sắc nghiệp.',
  mogok:'Tiến trình tạo tác và tái sanh. <b>2 loại</b>: <b>Nghiệp hữu</b> (Kammabhava — nhân: tiến trình tạo nghiệp thiện, bất thiện, bất động) và <b>Sanh hữu</b> (Upapattibhava — quả: Danh-Sắc của kiếp sống mới). Sanh hữu gồm 3 cảnh giới tái sanh: Dục hữu, Sắc hữu, Vô sắc hữu.'},
 {ten:'Sanh', pali:'Jāti',
  duyen:'Sanh duyên Già chết, sầu, bi, khổ, ưu, não — Jātipaccayā jarāmaraṇaṃ soka-parideva-dukkha-domanass-upāyāsā',
  chiphap:'<b>Danh sanh (nāmajāti):</b> sự sanh lên của 32 tâm quả hiệp thế, 35 tâm sở hợp.<br><b>Sắc sanh (rūpajāti):</b> sự hiện khởi của 20 sắc nghiệp.',
  mogok:'Tiến trình tái sanh kế tiếp trong tương lai do nghiệp tạo tác trong quá khứ — nghiệp làm duyên cho Thức tái sanh qua một cảnh giới khác (Tục Sanh). Khi tái sanh qua cảnh giới khác thì Sanh làm duyên cho Lão, Tử.'},
 {ten:'Già chết', pali:'Jarā-maraṇa',
  duyen:'Vòng luân hồi tiếp nối: sầu, bi, khổ, ưu, não nuôi dưỡng Vô minh',
  chiphap:'<b>Già (jarā):</b> sự già của 32 tâm quả hiệp thế, 35 tâm sở hợp (sát-na trụ).<br><b>Chết (maraṇa):</b> sự diệt của 32 tâm quả hiệp thế, 35 tâm sở hợp (sát-na diệt).',
  mogok:'Có Sanh thì có già, chết — quả đương nhiên của Sanh. Từ Sanh đến Lão Tử thường kéo theo: <b>Sầu, Bi, Khổ, Ưu, Não</b>. Thập Nhị Nhân Duyên là chuỗi mắt xích dính liền bởi 12 khoen liên tục, tạo nên vòng tròn luân hồi tái sanh; muốn thấu hiểu, chấm dứt sinh tử và thoát khỏi vòng tròn trôi lăn này chỉ có thiền <b>Tứ Niệm Xứ</b>, tu tập Chánh Niệm và Trí Tuệ.',
  extra:[
   ['Sầu','Soka','Ưu thọ đồng sanh trong 2 tâm sân (sanh lên từ 5 sự suy vong).'],
   ['Bi','Parideva','Tâm bấn loạn, than vãn — âm thanh do tâm sinh (cittajavippallāsasadda).'],
   ['Khổ','Dukkha','Khổ thân đồng sanh với tâm Thân thức thọ khổ.'],
   ['Ưu','Domanassa','Tâm sở Thọ đồng sanh với 2 tâm sân (tâm sở khổ thọ).'],
   ['Não','Upāyāsa','Tâm sở Sân đồng sanh với 2 tâm sân.']
  ]}
];

function dkArc(r,a1,a2,sweep){
  const c=360, rad=d=>d*Math.PI/180;
  const x1=c+r*Math.cos(rad(a1)), y1=c+r*Math.sin(rad(a1));
  const x2=c+r*Math.cos(rad(a2)), y2=c+r*Math.sin(rad(a2));
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
let dkPid = 0;
function dkArcText(r,a1,a2,sweep,txt,{fill='#111',size=15,weight=600,click=null}={}){
  const id = 'dkp'+(dkPid++);
  const hit = click!==null ? `<path d="${dkArc(r,a1,a2,sweep)}" stroke="rgba(0,0,0,0)" stroke-width="46" fill="none"/>` : '';
  const inner = `<path id="${id}" d="${dkArc(r,a1,a2,sweep)}" fill="none"/>${hit}
    <text font-size="${size}" font-weight="${weight}" fill="${fill}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${txt}</textPath></text>`;
  return click!==null ? `<g class="dkc" onclick="${click}">${inner}</g>` : inner;
}
function dkNode(a,r,label,idx,w){
  const c=360, rad=a*Math.PI/180;
  const x=c+r*Math.cos(rad), y=c+r*Math.sin(rad);
  const rot = Math.sin(rad)>0 ? a-90 : a+90;
  return `<g class="dkc" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)})" onclick="openDuyenKhoiSheet(${idx})">
    <rect x="${-w/2}" y="-22" width="${w}" height="44" rx="22" fill="#fffdf2" stroke="#d21" stroke-width="3" class="dk-shape"/>
    <rect x="${-w/2-4}" y="-26" width="${w+8}" height="52" rx="26" fill="none" stroke="#f0c419" stroke-width="2.5" opacity=".9"/>
    <text text-anchor="middle" dominant-baseline="central" font-size="21" font-weight="800" fill="#111">${label}</text>
  </g>`;
}

function renderDuyenKhoiPage(){
  dkPid = 0;
  const extra = document.getElementById('extra-content');
  // 4 phần theo truyền thống Mogok: màu nền từng chi
  const PHAN = [
    {chis:[0,1],       fill:'#fbe3dc', stroke:'#b34a32', ink:'#6d2413', label:'Nhân quá khứ'},
    {chis:[2,3,4,5,6], fill:'#e2f2da', stroke:'#4c7a3a', ink:'#274617', label:'Quả hiện tại'},
    {chis:[7,8,9],     fill:'#fdecca', stroke:'#b07a1f', ink:'#5f3e08', label:'Nhân hiện tại'},
    {chis:[10,11],     fill:'#e5dcf5', stroke:'#6b4fa0', ink:'#392564', label:'Quả vị lai'}
  ];
  const phanOf = i => PHAN.find(p=>p.chis.includes(i));
  // Tên hiển thị (tối đa 2 dòng)
  const NAMES = [['Vô minh'],['Hành'],['Thức'],['Danh','sắc'],['Lục','nhập'],['Xúc'],['Thọ'],['Ái'],['Thủ'],['Hữu'],['Sanh'],['Già','chết']];

  const C=360, R=284, NR=49;
  let nodes='', arrows='';
  for(let i=0;i<12;i++){
    const a=(-90+i*30)*Math.PI/180;
    const x=C+R*Math.cos(a), y=C+R*Math.sin(a);
    const p=phanOf(i);
    const lines=NAMES[i];
    const texts = lines.length===1
      ? `<text x="0" y="8" text-anchor="middle" font-size="21" font-weight="800" fill="${p.ink}">${lines[0]}</text>`
      : `<text x="0" y="-2" text-anchor="middle" font-size="20" font-weight="800" fill="${p.ink}">${lines[0]}</text>
         <text x="0" y="20" text-anchor="middle" font-size="20" font-weight="800" fill="${p.ink}">${lines[1]}</text>`;
    nodes += `<g class="dkc" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" onclick="openDuyenKhoiSheet(${i})">
      <circle r="${NR}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="3.5" class="dk-shape"/>
      <text x="0" y="-26" text-anchor="middle" font-size="15" font-weight="700" fill="${p.stroke}">${i+1}</text>
      ${texts}
    </g>`;
    // mũi tên nối chi i -> i+1 (cung ngắn giữa 2 nút)
    const a1=-90+i*30+11.5, a2=-90+i*30+18;
    arrows += `<path d="${dkArc(R,a1,a2,1)}" stroke="#c8471f" stroke-width="8" fill="none" marker-end="url(#dkarr)"/>`;
  }

  extra.innerHTML = `
    <p class="info-note" style="margin-bottom:6px">Vòng Thập Nhị Nhân Duyên — chạm 1 lần để chọn, chạm lần 2 để xem chi pháp và giảng giải. Chạm <b>tâm vòng tròn</b> để xem các yếu tố chính (2 gốc rễ, 2 đế, 3 mối nối, 3 luân, 20 yếu tố...).</p>
    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
    <svg viewBox="0 0 720 720" style="width:calc(min(100%, 560px) * var(--fontscale,1));height:auto;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="dkarr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#c8471f"/>
        </marker>
      </defs>
      <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#d8c9b2" stroke-width="2.5" stroke-dasharray="3 7"/>
      ${arrows}
      ${nodes}
      <g class="dkc" onclick="openDKCenterSheet()">
        <circle cx="${C}" cy="${C}" r="118" fill="#96651f" stroke="#7a5218" stroke-width="3" class="dk-shape"/>
        <text x="${C}" y="${C-30}" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">VÔ MINH · ÁI</text>
        <text x="${C}" y="${C+2}" text-anchor="middle" font-size="15.5" fill="#f5e4c3">hai gốc rễ của luân hồi</text>
        <text x="${C}" y="${C+34}" text-anchor="middle" font-size="15.5" fill="#f5e4c3">Paṭicca-samuppāda</text>
        <text x="${C}" y="${C+62}" text-anchor="middle" font-size="13.5" fill="#e8d1a5">(chạm để xem các yếu tố chính)</text>
      </g>
    </svg>
    </div>
    <div class="qbtn-row" style="justify-content:center">
      <button class="qbtn" style="border-color:#b34a32;color:#8a2f18" onclick="openDKQuarterSheet(1)">P1 · 5 nhân quá khứ</button>
      <button class="qbtn" style="border-color:#4c7a3a;color:#33591f" onclick="openDKQuarterSheet(2)">P2 · 5 quả hiện tại</button>
      <button class="qbtn" style="border-color:#b07a1f;color:#7c550e" onclick="openDKQuarterSheet(3)">P3 · 5 nhân hiện tại</button>
      <button class="qbtn" style="border-color:#6b4fa0;color:#4b3380" onclick="openDKQuarterSheet(4)">P4 · 5 quả vị lai</button>
    </div>
    <p class="info-note" style="margin-top:4px"><b>Màu 4 phần:</b> <span style="color:#b34a32">■</span> Nhân quá khứ (Vô minh, Hành) · <span style="color:#4c7a3a">■</span> Quả hiện tại (Thức → Thọ) · <span style="color:#b07a1f">■</span> Nhân hiện tại (Ái, Thủ, Hữu) · <span style="color:#6b4fa0">■</span> Quả vị lai (Sanh, Già chết).<br>Chi pháp theo Đường Vào Thắng Pháp (TK Chánh Minh); giảng giải theo tài liệu truyền thống Mogok.</p>
    ${tkDuyenKhoi()}
  `;
}

const DK_QUARTER = {
 1:{ten:'Phần 1 · 5 Nhân quá khứ tương tục', de:'Thuộc Tập Đế (Samudayasaccā) · thời quá khứ',
    chis:[0,1],
    body:'Năm nhân trong kiếp quá khứ đã tạo nên kiếp sống hiện tại: <b>Vô Minh, Hành, Ái, Thủ, Nghiệp Hữu</b>.<br><br>Trên vòng tròn chỉ vẽ 2 chi <b>Vô Minh</b> và <b>Hành</b>, nhưng kể đủ phải gồm cả <b>Ái, Thủ, Nghiệp Hữu</b> — vì hễ tạo nghiệp (Hành) thì luôn có Vô Minh dẫn đầu và Ái – Thủ nuôi dưỡng: 5 pháp này đồng đẳng, cùng là "3 phiền não luân + 2 nghiệp luân" của quá khứ.<br><br>5 nhân quá khứ → sinh ra 5 quả hiện tại (Phần 2).'},
 2:{ten:'Phần 2 · 5 Quả hiện tại tương tục', de:'Thuộc Khổ Đế (Dukkhasaccā) · thời hiện tại',
    chis:[2,3,4,5,6],
    body:'Năm quả dị thục đang diễn ra trong kiếp hiện tại, do 5 nhân quá khứ tạo nên: <b>Thức, Danh-Sắc, Lục Nhập, Xúc, Thọ</b>.<br><br>Đây chính là thân – tâm này: thức tái sanh, danh sắc, 6 căn, sự xúc chạm và cảm thọ. Tất cả thuộc <b>Quả luân</b> (vipākavaṭṭa) — quả thì không thiện không bất thiện, chỉ là sự chín muồi của nghiệp cũ.<br><br>Mối nối quan trọng: <b>Thọ → Ái</b> (chuyển từ Phần 2 sang Phần 3) — "Thọ duyên Ái là con đường luân hồi; Thọ diệt, Ái diệt là đường thoát khỏi luân hồi". Chính tại đây thiền quán cảm thọ (vedanānupassanā) cắt đứt vòng xoay.'},
 3:{ten:'Phần 3 · 5 Nhân hiện tại tương tục', de:'Thuộc Tập Đế (Samudayasaccā) · thời hiện tại',
    chis:[7,8,9],
    body:'Năm nhân đang được tạo trong kiếp hiện tại, sẽ cho quả vị lai: <b>Ái, Thủ, Nghiệp Hữu, Vô Minh, Hành</b>.<br><br>Trên vòng tròn chỉ vẽ 3 chi <b>Ái, Thủ, Hữu</b> (nghiệp hữu), nhưng kể đủ gồm cả <b>Vô Minh và Hành</b> ngầm đi theo — hưởng thọ rồi ái, ái rồi thủ, thủ rồi tạo nghiệp: đó là cách chúng sinh đang gieo nhân mới ngay bây giờ.<br><br>5 nhân hiện tại → sinh ra 5 quả vị lai (Phần 4).'},
 4:{ten:'Phần 4 · 5 Quả vị lai tương tục', de:'Thuộc Khổ Đế (Dukkhasaccā) · thời vị lai',
    chis:[10,11],
    body:'Năm quả sẽ sinh trong kiếp tương lai nếu nhân hiện tại không được đoạn tận: <b>Thức, Danh-Sắc, Lục Nhập, Xúc, Thọ</b> (của kiếp sau).<br><br>Trên vòng tròn vẽ 2 chi <b>Sanh (Sanh hữu)</b> và <b>Già chết</b>: "Sanh" chính là sự sinh khởi của 5 quả ấy, "Già chết" là sự già – diệt của chúng, kéo theo sầu, bi, khổ, ưu, não.<br><br>Toàn bộ 4 phần = <b>20 yếu tố</b> (5 nhân quá khứ + 5 quả hiện tại + 5 nhân hiện tại + 5 quả vị lai), 3 mối nối, 3 luân, 3 thời — vòng tròn khép kín không điểm khởi đầu.'}
};

function openDKQuarterSheet(q){
  const d = DK_QUARTER[q];
  const chiBtns = d.chis.map(i=>{
    const c = DUYENKHOI_DATA[i];
    return `<button class="qbtn" onclick="openDuyenKhoiSheet(${i})">${i+1}. ${c.ten}</button>`;
  }).join(' ');
  document.getElementById('sheet-content').innerHTML = `
    <div class="sheet-head"><h2>${d.ten}</h2></div>
    <p class="sheet-pali">${d.de}</p>
    <div class="sec"><div class="sec-label">Nội dung</div><div class="sec-body">${d.body}</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Xem chi pháp từng chi trong phần này</div>
      <div class="qbtn-row" style="margin-top:8px">${chiBtns}</div></div>
  `;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function openDKCenterSheet(){
  document.getElementById('sheet-content').innerHTML = `
    <div class="sheet-head"><h2>Vô Minh – Ái: hai gốc rễ</h2></div>
    <p class="sheet-pali">Avijjā · Taṇhā — Các yếu tố chính trong lược đồ</p>
    <div class="sec"><div class="sec-label">1 · Hai gốc rễ</div><div class="sec-body"><b>Vô Minh</b> (Avijjā) — gốc rễ của quá khứ, và <b>Tham Ái</b> (Taṇhā) — gốc rễ của hiện tại.</div></div>
    <div class="sec"><div class="sec-label">2 · Hai đế</div><div class="sec-body"><b>Tập Đế</b> (Samudaya Saccā): phần 1 và 3 (nhân). <b>Khổ Đế</b> (Dukkha Saccā): phần 2 và 4 (quả).</div></div>
    <div class="sec"><div class="sec-label">3 · Bốn phần</div><div class="sec-body">Nhân Quá Khứ → Quả Hiện Tại; Nhân Hiện Tại → Quả Tương Lai.</div></div>
    <div class="sec"><div class="sec-label">4 · Ba mối nối</div><div class="sec-body">Hành – Thức · Thọ – Ái · Nghiệp Hữu – Sanh.</div></div>
    <div class="sec"><div class="sec-label">5 · Ba luân</div><div class="sec-body"><b>Phiền Não Luân</b> (Kilesavaṭṭa): Vô Minh, Lục Ái, Tứ Thủ.<br><b>Nghiệp Luân</b> (Kammavaṭṭa): Nghiệp Hữu và Hành.<br><b>Quả Luân</b> (Vipākavaṭṭa) — 8: Sanh Hữu, Thức, Danh-Sắc, Lục Nhập, Lục Xúc, Lục Thọ, Sanh, Già Chết.</div></div>
    <div class="sec"><div class="sec-label">6 · Ba thời</div><div class="sec-body">Quá Khứ · Hiện Tại · Tương Lai.</div></div>
    <div class="sec"><div class="sec-label">7 · Hai mươi yếu tố</div><div class="sec-body"><b>5 nhân quá khứ:</b> Vô Minh, Hành, Ái, Thủ, Nghiệp Hữu.<br><b>5 quả hiện tại:</b> Thức, Danh-Sắc, Lục Nhập, Xúc, Thọ.<br><b>5 nhân hiện tại:</b> Ái, Thủ, Nghiệp Hữu, Vô Minh, Hành.<br><b>5 quả tương lai:</b> Thức, Danh-Sắc, Lục Nhập, Xúc, Thọ.</div></div>
  `;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function openDuyenKhoiSheet(i){
  const d = DUYENKHOI_DATA[i];
  let extraHtml = '';
  if(d.extra){
    extraHtml = `<div class="sec" style="margin-top:14px"><div class="sec-label">Sanh duyên sầu · bi · khổ · ưu · não</div><div class="sec-body">` +
      d.extra.map(([t,p,c])=>`<div style="margin-bottom:7px"><b>${t}</b> <i>(${p})</i>: ${c}</div>`).join('') +
      `</div></div>`;
  }
  const html = `
    <div class="sheet-head"><h2>${i+1}. ${d.ten}</h2></div>
    <p class="sheet-pali">${d.pali}</p>
    <div class="sec"><div class="sec-label">Chi pháp</div><div class="sec-body">${d.chiphap}</div></div>
    ${d.mogok ? `<div class="sec" style="margin-top:12px"><div class="sec-label">Giảng giải (truyền thống Mogok)</div><div class="sec-body">${d.mogok}</div></div>` : ''}
    <div class="info-note" style="margin-top:10px"><b>Duyên:</b> ${d.duyen}</div>
    ${extraHtml}
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

// ===== Trang "24 Duyên hệ" (Paṭṭhāna) =====
// Định nghĩa tóm tắt + chi pháp năng duyên / sở duyên (kèm phi sở duyên)
// theo "Khái lược Duyên Hệ" — Tỳ khưu Chánh Minh.

const DUYENHE_DATA = [
 {ten:'Nhân duyên', pali:'Hetupaccaya',
  dn:'Trợ sinh, giúp đỡ bằng <b>nhân tương ưng</b> — ủng hộ các pháp như <b>gốc rễ</b> làm cây vững vàng.',
  nang:'6 nhân: Tham, Sân, Si, Vô tham, Vô sân, Vô si (phân rộng: 9 nhân — 3 bất thiện, 3 thiện, 3 vô ký).',
  so:'103 tâm hữu nhân + 52 tâm sở (trừ Si trong 2 tâm Si) + sắc nghiệp tục sinh + sắc tâm hữu nhân.',
  phiso:'18 tâm vô nhân + 12 tâm sở hợp; Si trong 2 tâm Si; sắc tâm vô nhân, sắc nghiệp bình nhật, sắc nghiệp Vô tưởng, sắc khí hậu, sắc vật thực.'},
 {ten:'Cảnh duyên', pali:'Ārammaṇapaccaya',
  dn:'Trợ sinh bằng cách <b>làm cảnh</b> cho tâm nhận biết — pháp nào bị tâm biết, pháp ấy là cảnh.',
  nang:'Tất cả pháp khi bị tâm biết: 121 tâm + 52 tâm sở + 28 sắc pháp + Níp-bàn + chế định.',
  so:'Tâm + tâm sở khi biết cảnh.',
  phiso:'Sắc pháp + Níp-bàn + chế định (không biết cảnh).'},
 {ten:'Trưởng duyên', pali:'Adhipatipaccaya',
  dn:'Trợ sinh và ủng hộ bằng cách <b>lớn trội, dẫn đầu</b> — ví như Đức vua với quần thần.',
  subs:[
   {ten:'Cảnh trưởng duyên', pali:'Ārammaṇādhipatipaccaya',
    dn:'Cảnh rất tốt "dẫn dắt" tâm, tâm bị cảnh ràng buộc.',
    nang:'Níp-bàn + 18 sắc thành tựu thành cảnh tốt + 116 tâm (trừ 2 Sân, 2 Si, Thân thức thọ khổ) + 47 tâm sở (trừ 4 Sân phần + Hoài nghi).',
    so:'40 tâm Siêu thế + 8 tâm Tham + 8 Đại thiện + 4 Đại hạnh hợp trí + 45 tâm sở hợp.'},
   {ten:'Đồng sinh trưởng duyên', pali:'Sahajātādhipatipaccaya',
    dn:'Một trong 4 pháp trưởng (Dục, Cần, Tâm, Thẩm/Trí) làm chủ đạo — mỗi thời điểm chỉ một pháp làm trưởng.',
    nang:'Tâm sở Dục / tâm sở Cần / Tâm (84 đổng lực đa nhân) / tâm sở Trí — pháp đang làm trưởng.',
    so:'52 tâm đổng lực nhị–tam nhân + 52 tâm sở (trừ pháp đang làm trưởng) + sắc tâm trưởng.'}
  ]},
 {ten:'Vô gián duyên', pali:'Anantarapaccaya',
  dn:'Tâm + tâm sở vừa diệt trợ cho tâm + tâm sở kế tiếp sinh lên, <b>không có kẽ hở</b>.',
  nang:'Tâm + tâm sở sinh trước vừa diệt (trừ tâm Tử của vị Alahán).',
  so:'Tâm + tâm sở sinh kế sau.',
  phiso:'Sắc pháp + Níp-bàn + chế định.'},
 {ten:'Đẳng vô gián duyên', pali:'Samanantarapaccaya',
  dn:'Như Vô gián duyên, nhấn mạnh sự <b>khít khao hoàn toàn</b> — <b>trùng chi pháp với Vô gián duyên</b>.',
  nang:'Tâm + tâm sở sinh trước (trừ tâm Tử vị Alahán).',
  so:'Tâm + tâm sở sinh sau.',
  phiso:'Sắc pháp.'},
 {ten:'Đồng sinh duyên', pali:'Sahajātapaccaya',
  dn:'Trợ giúp bằng cách <b>cùng sinh lên</b> — như ngọn lửa với ánh sáng. 4 cách: danh trợ danh, danh trợ sắc, sắc trợ sắc, sắc trợ danh.',
  nang:'Tất cả pháp hữu vi (tục sinh: 15 tâm tục sinh + sắc tục sinh; 4 quả Vô sắc; đoàn sắc mạng quyền cõi Vô tưởng. Bình nhật: tâm + tâm sở + sắc pháp).',
  so:'Tất cả pháp hữu vi (như năng).',
  phiso:'Níp-bàn + chế định.'},
 {ten:'Hổ tương duyên', pali:'Aññamaññapaccaya',
  dn:'Trợ giúp <b>qua lại</b>: năng trợ sở, sở trợ lại năng — như ba cây chụm đầu nương nhau.',
  nang:'Tâm + tâm sở + sắc Tứ đại + sắc Ý vật (tái tục).',
  so:'Như năng duyên.',
  phiso:'Sắc y sinh (nhất định); sắc Ý vật thời bình nhật (bất định).'},
 {ten:'Y duyên', pali:'Nissayapaccaya',
  dn:'Trợ giúp bằng cách làm <b>chỗ nương nhờ</b> vững vàng — như đất cho cây nương.',
  nang:'Tứ danh uẩn + 6 sắc vật.',
  so:'Tứ danh uẩn.',
  phiso:'Sắc pháp.',
  subs:[
   {ten:'Đồng sinh y duyên', pali:'Sahajātanissayapaccaya', dn:'Nương pháp cùng sinh — <b>trùng Đồng sinh duyên</b>.'},
   {ten:'Vật sinh tiền y duyên', pali:'Vatthupurejātanissayapaccaya',
    dn:'Sắc vật sinh trước làm chỗ nương cho tâm sinh sau.',
    nang:'6 sắc vật sinh trước, đang hiện hữu.',
    so:'Tâm nương vật sinh sau (117 tâm, trừ 4 quả Vô sắc).'},
   {ten:'Vật-cảnh sinh tiền y duyên', pali:'Vatthārammaṇapurejātanissayapaccaya',
    dn:'Trong lộ cận tử: sắc Ý vật vừa là chỗ nương vừa là cảnh.',
    nang:'Sắc Ý vật sinh ở sát-na sinh của hữu phần thứ 16 kể từ tâm Tử lui lại.',
    so:'32 tâm khách lộ tử (Hướng ý môn + 29 đổng lực dục giới + 2 tâm thông) + 44 tâm sở.'}
  ]},
 {ten:'Cận y duyên', pali:'Upanissayapaccaya',
  dn:'Làm chỗ nương <b>rất vững chắc, có sức mạnh lớn</b> — Y duyên như đất, Cận y như mưa thuận gió hòa giúp cây lớn mạnh.',
  subs:[
   {ten:'Cảnh cận y duyên', pali:'Ārammaṇūpanissayapaccaya', dn:'Cảnh rất vững mạnh — <b>chi pháp giống Cảnh trưởng duyên</b> (trưởng: khía cạnh quan trọng; cận y: khía cạnh sức mạnh).'},
   {ten:'Vô gián cận y duyên', pali:'Anantarūpanissayapaccaya', dn:'Liên tiếp rất vững mạnh — <b>chi pháp giống Vô gián duyên</b>, như dòng nước chảy xiết.'},
   {ten:'Thường cận y duyên', pali:'Pakatūpanissayapaccaya',
    dn:'Trợ giúp vững mạnh theo <b>thói quen tự nhiên</b> do thường làm — duyên có phạm vi rộng nhất.',
    nang:'Tâm + tâm sở + sắc pháp + chế định có sức mạnh, cả 3 thời (trừ chế định nghiệp xứ).',
    so:'Tâm + tâm sở sinh sau.',
    phiso:'Sắc pháp.'}
  ]},
 {ten:'Sinh tiền duyên', pali:'Purejātapaccaya',
  dn:'Trợ giúp bằng cách <b>sinh ra trước và đang hiện hữu</b> (sát-na trụ).',
  subs:[
   {ten:'Vật sinh tiền duyên', pali:'Vatthupurejātapaccaya', dn:'<b>Như Vật sinh tiền y duyên</b> (xem Y duyên).'},
   {ten:'Vật-cảnh sinh tiền duyên', pali:'Vatthārammaṇapurejātapaccaya', dn:'<b>Như Vật-cảnh sinh tiền y duyên</b> (xem Y duyên).'},
   {ten:'Cảnh sinh tiền duyên', pali:'Ārammaṇapurejātapaccaya',
    dn:'Sắc sinh trước, đang hiện hữu, làm <b>cảnh</b> cho tâm sinh sau.',
    nang:'18 sắc thành tựu sinh trước, đang làm cảnh hiện tại.',
    so:'Nhất định: ngũ song thức + Ý giới. Bất định: 41 tâm Dục giới + 2 tâm thông + 50 tâm sở (trừ Vô lượng phần).',
    phiso:'Nhất định: sắc pháp + 27 tâm Đáo đại + 40 Siêu thế. Bất định: 41 tâm Dục giới khi không bắt 18 sắc làm cảnh.'}
  ]},
 {ten:'Sinh hậu duyên', pali:'Pacchājātapaccaya',
  dn:'Tâm <b>sinh sau</b> trợ cho sắc sinh trước được vững mạnh — như mưa đến sau giúp cây gieo trước.',
  nang:'117 tâm sinh sau (từ hữu phần thứ 1; trừ 4 quả Vô sắc) + tâm sở hợp.',
  so:'Sắc do 3–4 nhân sinh đang ở sát-na trụ, đồng sinh với tâm trước.',
  phiso:'121 tâm + tâm sở; sắc ở sát-na sinh; sắc tâm + sắc nghiệp tục sinh; sắc ngoại, sắc nghiệp Vô tưởng.'},
 {ten:'Tập hành duyên', pali:'Āsevanapaccaya',
  dn:'Trợ giúp bằng cách <b>lập đi lập lại</b> làm thuần thục — chỉ nơi các sát-na <b>đổng lực</b> thiện, bất thiện, duy tác.',
  nang:'47 đổng lực hiệp thế sát-na trước (trừ đổng lực cuối của lộ).',
  so:'67 đổng lực sinh nối tiếp — 47 hiệp thế + 20 tâm Đạo (trừ đổng lực thứ nhất).',
  phiso:'Đổng lực thứ 1; 2 tâm hướng môn; 52 tâm quả; sắc pháp.'},
 {ten:'Nghiệp duyên', pali:'Kammapaccaya',
  dn:'Trợ giúp bằng cách <b>tạo tác</b> — nghiệp chính là <b>tâm sở Tư</b> (cetanā).',
  subs:[
   {ten:'Đồng sinh nghiệp duyên', pali:'Sahajātakammapaccaya',
    dn:'Tâm sở Tư điều phối các pháp đồng sinh.',
    nang:'Tâm sở Tư trong tất cả tâm.',
    so:'Tâm + 51 tâm sở (trừ Tư) + sắc tâm + sắc nghiệp tục sinh.'},
   {ten:'Vô gián nghiệp duyên', pali:'Anantarakammapaccaya',
    dn:'Tư trong tâm Đạo trợ liền cho quả Siêu thế, không gián đoạn.',
    nang:'Tâm sở Tư trong 20 tâm Đạo.',
    so:'20 tâm quả Siêu thế + 36 tâm sở, sinh kế tục tâm Đạo.'},
   {ten:'Dị thời nghiệp duyên', pali:'Nānakkhaṇikakammapaccaya',
    dn:'Tư đã diệt trợ quả <b>khác thời</b> — "nghiệp báo nhân quả" thông thường.',
    nang:'Tâm sở Tư trong tâm thiện, bất thiện (quá khứ).',
    so:'Sắc nghiệp + tâm quả và tâm sở hợp (trừ Tư).',
    phiso:'Tâm thiện, bất thiện, duy tác + sắc tâm, sắc ngoại, sắc vật thực, sắc khí hậu.'}
  ]},
 {ten:'Quả duyên', pali:'Vipākapaccaya',
  dn:'Pháp <b>quả của nghiệp</b> trợ giúp bằng sự "thành tựu yên lặng", không cần nỗ lực.',
  nang:'52 tâm quả + 38 tâm sở hợp.',
  so:'52 tâm quả + 38 tâm sở (khi không làm năng) + sắc nghiệp tục sinh + sắc tâm quả (trừ 2 sắc biểu tri).',
  phiso:'Tâm thiện, bất thiện, duy tác + tâm sở; sắc nghiệp bình nhật, sắc nghiệp Vô tưởng, sắc ngoại, sắc khí hậu, sắc vật thực.'},
 {ten:'Vật thực duyên', pali:'Āhārapaccaya',
  dn:'Trợ giúp bằng cách <b>mang dưỡng tố vào, nuôi dưỡng cho tồn tại vững mạnh</b> (Tứ thực).',
  subs:[
   {ten:'Sắc vật thực duyên', pali:'Rūpāhārapaccaya',
    dn:'Dưỡng tố (ojā) nuôi dưỡng sắc pháp.',
    nang:'Sắc vật thực nội và ngoại.',
    so:'Sắc do vật thực tạo + các sắc đồng nhóm.'},
   {ten:'Danh vật thực duyên', pali:'Nāmāhārapaccaya',
    dn:'3 danh thực trợ các danh pháp đồng sinh.',
    nang:'Xúc thực (tâm sở Xúc), Thức thực (tâm), Tư niệm thực (tâm sở Tư).',
    so:'Tâm + tâm sở + sắc tâm + sắc nghiệp tục sinh.'}
  ]},
 {ten:'Quyền duyên', pali:'Indriyapaccaya',
  dn:'Trợ giúp bằng cách <b>cai quản, điều hành</b> trong lãnh vực riêng — năng duyên là 20 quyền (trừ Nữ, Nam quyền).',
  subs:[
   {ten:'Đồng sinh quyền duyên', pali:'Sahajātindriyapaccaya',
    dn:'8 danh quyền kiểm soát pháp đồng sinh.',
    nang:'Tâm (ý quyền) + Thọ + Mạng quyền danh + Tín, Cần, Niệm, Nhất hành, Trí.',
    so:'Tâm + 52 tâm sở + sắc tục sinh + sắc tâm.'},
   {ten:'Quyền sinh tiền duyên', pali:'Purejātindriyapaccaya',
    dn:'5 sắc thần kinh sinh trước cai quản tâm nương.',
    nang:'5 sắc thần kinh ở sát-na thứ 26 (trung thọ).',
    so:'Ngũ song thức + 7 tâm sở hợp.'},
   {ten:'Sắc mạng quyền duyên', pali:'Rūpajīvitindriyapaccaya',
    dn:'Sắc Mạng quyền duy trì tuổi thọ sắc nghiệp đồng bọn.',
    nang:'Tất cả sắc Mạng quyền.',
    so:'Các bọn sắc nghiệp sinh chung (9 bọn).'}
  ]},
 {ten:'Thiền duyên', pali:'Jhānapaccaya',
  dn:'Trợ giúp bằng cách <b>chăm chú vào đối tượng</b> hay <b>thiêu đốt pháp nghịch</b> (7 chi thiền, thực tính 5 pháp).',
  nang:'Tầm, Tứ, Hỷ, Thọ, Nhất hành trong 103 tâm (trừ 18 tâm vô nhân).',
  so:'103 tâm + 52 tâm sở (trừ chi thiền đang làm năng) + sắc nghiệp tục sinh + sắc tâm.',
  phiso:'Ngũ song thức + 7 tâm sở + sắc nghiệp bình nhật + sắc ngoại + sắc vật thực + sắc âm dương + sắc nghiệp Vô tưởng.'},
 {ten:'Đạo duyên', pali:'Maggapaccaya',
  dn:'Trợ giúp <b>như con đường</b> — tà đạo dẫn khổ cảnh, chánh đạo dẫn lạc cảnh và Níp-bàn (9 chi pháp thực tính).',
  nang:'Trí, Tầm, Chánh ngữ, Chánh nghiệp, Chánh mạng, Cần, Niệm, Nhất hành, Tà kiến — trong tâm hữu nhân.',
  so:'103 tâm hữu nhân + 52 tâm sở + sắc tâm hữu nhân + sắc nghiệp tục sinh với tâm hữu nhân.',
  phiso:'18 tâm vô nhân + 12 tâm sở + sắc ngoại, sắc âm dương, sắc vật thực, sắc nghiệp bình nhật, sắc nghiệp Vô tưởng, sắc tâm vô nhân.'},
 {ten:'Tương ưng duyên', pali:'Sampayuttapaccaya',
  dn:'Trợ giúp theo cách <b>hòa hợp</b> (đồng sinh, đồng diệt, đồng cảnh, đồng vật) — chỉ danh với danh, như nước hòa sữa.',
  nang:'Tất cả tâm và tâm sở đồng sinh.',
  so:'Như năng duyên.',
  phiso:'Sắc pháp + Níp-bàn + chế định.'},
 {ten:'Bất tương ưng duyên', pali:'Vippayuttapaccaya',
  dn:'Trợ giúp bằng cách <b>không hòa hợp</b> — giữa danh và sắc, như nước trên lá sen.',
  subs:[
   {ten:'Đồng sinh bất tương ưng duyên', pali:'Sahajātavippayuttapaccaya',
    dn:'Danh trợ sắc cùng sinh (và Ý vật tái tục trợ tâm tái tục).',
    nang:'107 tâm (trừ ngũ song thức + 4 quả Vô sắc) + tâm sở; sắc Ý vật tái tục.',
    so:'Sắc tâm, sắc nghiệp tục sinh; tâm tái tục cõi ngũ uẩn.'},
   {ten:'Sinh hậu bất tương ưng duyên', pali:'Pacchājātavippayuttapaccaya', dn:'<b>Như Sinh hậu duyên</b>.'},
   {ten:'Vật sinh tiền bất tương ưng duyên', pali:'Vatthupurejātavippayuttapaccaya', dn:'<b>Như Vật sinh tiền (y) duyên</b>.'},
   {ten:'Vật-cảnh sinh tiền bất tương ưng duyên', pali:'Vatthārammaṇapurejātavippayuttapaccaya', dn:'<b>Như Vật-cảnh sinh tiền (y) duyên</b>.'}
  ]},
 {ten:'Hiện hữu duyên', pali:'Atthipaccaya',
  dn:'Trợ giúp theo phương cách <b>"đang tồn tại"</b> — năng và sở cùng hiện hữu (7 trường hợp).',
  nang:'Tổng hợp năng duyên của 6 duyên thành phần.',
  so:'Tổng hợp sở duyên của 6 duyên thành phần.',
  subs:[
   {ten:'Đồng sinh hiện hữu duyên', pali:'Sahajātatthipaccaya', dn:'<b>Tức Đồng sinh duyên</b>.'},
   {ten:'Cảnh sinh tiền hiện hữu duyên', pali:'Ārammaṇapurejātatthipaccaya', dn:'<b>Tức Cảnh sinh tiền duyên</b>.'},
   {ten:'Vật sinh tiền hiện hữu duyên', pali:'Vatthupurejātatthipaccaya', dn:'<b>Tức Vật sinh tiền y duyên</b>.'},
   {ten:'Sinh hậu hiện hữu duyên', pali:'Pacchājātatthipaccaya', dn:'<b>Tức Sinh hậu duyên</b>.'},
   {ten:'Vật thực hiện hữu duyên', pali:'Āhāratthipaccaya', dn:'<b>Tức Sắc vật thực duyên</b>.'},
   {ten:'Quyền hiện hữu duyên', pali:'Indriyatthipaccaya', dn:'<b>Tức Sắc mạng quyền duyên</b>.'}
  ]},
 {ten:'Vô hữu duyên', pali:'Natthipaccaya',
  dn:'Trợ giúp bằng cách <b>"vắng mặt"</b>: pháp vô sắc vừa diệt nhường chỗ cho pháp mới sinh — <b>trùng chi pháp Vô gián duyên</b>.',
  nang:'Tâm + tâm sở vừa diệt (trừ tâm Tử vị Alahán).',
  so:'Tâm + tâm sở sinh kế sau.',
  phiso:'Sắc pháp.'},
 {ten:'Ly duyên', pali:'Vigatapaccaya',
  dn:'Trợ giúp bằng cách <b>"lìa nhau, diệt mất"</b> — <b>chi pháp tương tự Vô hữu duyên</b>.',
  nang:'Tâm + tâm sở vừa diệt, lìa đi (trừ tâm Tử vị Alahán).',
  so:'Tâm + tâm sở sinh kế sau.',
  phiso:'Sắc pháp.'},
 {ten:'Bất ly duyên', pali:'Avigatapaccaya',
  dn:'Trợ giúp bằng cách <b>"không xa lìa"</b> — pháp đang còn, không diệt mất — <b>chi pháp tương tự Hiện hữu duyên</b>.',
  nang:'Như Hiện hữu duyên.',
  so:'Như Hiện hữu duyên.'}
];

function dhChiphapRows(d){
  let h = '';
  if(d.nang) h += `<div style="margin-bottom:6px"><b>Năng duyên:</b> ${d.nang}</div>`;
  if(d.so) h += `<div style="margin-bottom:6px"><b>Sở duyên:</b> ${d.so}</div>`;
  if(d.phiso) h += `<div style="margin-bottom:6px"><b>Phi sở duyên:</b> ${d.phiso}</div>`;
  return h;
}

function renderDuyenHePage(){
  const extra = document.getElementById('extra-content');
  let circles = '';
  DUYENHE_DATA.forEach((d,i)=>{
    circles += `<div class="circle circle-dh" onclick="openDuyenHeSheet(${i})">
      <div class="cp" style="font-weight:800">${i+1}</div>
      <div class="cn">${d.ten}</div>
      <div class="cp">${d.pali.replace('paccaya','').replace('paccayo','')}</div>
    </div>`;
  });
  extra.innerHTML = `
    <p class="info-note" style="margin-bottom:8px">24 duyên trong bộ Paṭṭhāna. Chạm 1 lần để chọn, chạm lần 2 để xem <b>định nghĩa tóm tắt</b> và <b>chi pháp năng duyên – sở duyên</b> (kèm phi sở duyên). Duyên nào phân rộng sẽ có chi pháp của từng duyên phụ.</p>
    <div class="circle-grid">${circles}</div>
    <p class="info-note" style="margin-top:10px"><b>5 đôi đặc trưng:</b> Vô gián – Đẳng vô gián (nghĩa lý đồng nhau) · Y – Cận y (âm thanh đồng nhau) · Sinh tiền – Sinh hậu (nghịch thời) · Tương ưng – Bất tương ưng (nghịch cách) · Nhân – Quả (nhân quả).<br>Nguồn: "Khái lược Duyên Hệ" — Tỳ khưu Chánh Minh.</p>
    ${renderDuyenHeTomLuoc()}
  `;
}

let tomluocScale = (function(){ try{ const v=parseFloat(localStorage.getItem('quyen22-tomluoc-scale')); return (v>=0.6&&v<=2.0)?v:1; }catch(e){ return 1; } })();
function adjustTomLuocScale(d){
  tomluocScale = Math.round(Math.min(2.0, Math.max(0.6, tomluocScale + d))*10)/10;
  try{ localStorage.setItem('quyen22-tomluoc-scale', String(tomluocScale)); }catch(e){}
  const w = document.getElementById('tomluoc-wrap');
  if(w) w.style.setProperty('--tlscale', tomluocScale);
  const p = document.getElementById('tomluoc-pct');
  if(p) p.textContent = Math.round(tomluocScale*100) + '%';
}

function renderDuyenHeTomLuoc(){
  const rows = DUYENHE_TOMLUOC.map((d,i)=>{
    const pali = (DUYENHE_DATA[i] && DUYENHE_DATA[i].pali) ? DUYENHE_DATA[i].pali : '';
    const appTen = (DUYENHE_DATA[i] && DUYENHE_DATA[i].ten) ? DUYENHE_DATA[i].ten : '';
    const alt = (appTen && appTen.toLowerCase() !== d.ten.toLowerCase()) ? ` <span style="color:var(--ink-soft);font-weight:600">= ${appTen}</span>` : '';
    const stt = String(i+1).padStart(2,'0');
    let head = `<div style="padding:7px 10px;border-top:1px solid rgba(128,128,128,.22);display:flex;gap:8px;align-items:baseline;flex-wrap:wrap">
      <span style="font-weight:800;min-width:26px">${stt}</span>
      <span style="flex:1;min-width:180px"><b>${d.ten}</b>${alt}<br><span class="cpali" style="font-style:italic;color:#1c5b9e;font-size:.92em">${pali}</span></span>
      ${d.so ? `<span style="font-weight:800;background:rgba(192,140,34,.18);border-radius:6px;padding:1px 8px">${d.so}</span>` : `<span style="color:var(--ink-soft);font-size:.92em">phân ${d.phu.length} duyên phụ ↓</span>`}
    </div>`;
    if(d.phu.length){
      head += d.phu.map(p=>`<div style="padding:3px 10px 3px 44px;display:flex;gap:8px;align-items:baseline">
        <span style="flex:1">↳ ${p[0]}</span>
        <span style="font-weight:700;background:rgba(192,140,34,.12);border-radius:6px;padding:0 8px">${p[1]}</span>
      </div>`).join('');
      head += `<div style="height:5px"></div>`;
    }
    return head;
  }).join('');
  const tongPhu = DUYENHE_TOMLUOC.reduce((s,d)=>s+d.phu.length,0);
  const soPhanRong = DUYENHE_TOMLUOC.filter(d=>d.phu.length).length;
  const zbtn = 'height:28px;min-width:32px;padding:0 7px;border-radius:8px;border:1px solid rgba(128,128,128,.35);background:var(--card);color:var(--ink);font-size:13px;font-weight:700;font-family:inherit';
  return `
    <div class="group-head" style="margin-top:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="flex:1;min-width:200px">Bản tóm lược 24 duyên chính trong Đại Phát Thú</span>
      <span style="display:inline-flex;gap:4px;align-items:center;font-weight:600">
        <button style="${zbtn}" onclick="adjustTomLuocScale(-0.1)" aria-label="Thu nhỏ bản tóm lược">A−</button>
        <span id="tomluoc-pct" style="font-size:12px;color:var(--ink-soft);min-width:38px;text-align:center">${Math.round(tomluocScale*100)}%</span>
        <button style="${zbtn}" onclick="adjustTomLuocScale(0.1)" aria-label="Phóng to bản tóm lược">A+</button>
      </span>
    </div>
    <div id="tomluoc-wrap" style="--tlscale:${tomluocScale}">
      <p class="info-note" style="margin-bottom:8px;font-size:calc(14px * var(--tlscale));line-height:1.5"><b>24 duyên chính</b>, trong đó <b>${soPhanRong} duyên phân rộng</b> thành <b>${tongPhu} duyên phụ</b> (ghi thụt vào ↳ dưới duyên chính sinh ra nó). Số bên phải là <b>số kể 01–48</b> theo bảng: duyên không phân rộng mang một số; duyên phân rộng thì các duyên phụ mang số. Riêng <b>Đẳng Vô Gián Duyên</b> nghĩa lý đồng với Vô Gián Duyên nên kể chung số <b>06*</b>.</p>
      <div style="background:var(--card);border:1px solid rgba(128,128,128,.25);border-radius:12px;overflow:hidden;font-size:calc(14.5px * var(--tlscale));line-height:1.45">${rows}</div>
      <p class="info-note" style="margin-top:8px;font-size:calc(13px * var(--tlscale));line-height:1.5">Tên gọi theo "Bản tóm lược 24 duyên chính trong Đại Phát Thú"; tên khác trên các ô tròn phía trên được ghi kèm sau dấu "=".</p>
    </div>
  `;
}

// ===== Bảng "Tổng kết" dùng chung cho các trang (kiểu như bản tóm lược 24 duyên) =====
let tkScale = (function(){ try{ const v=parseFloat(localStorage.getItem('quyen22-tk-scale')); return (v>=0.6&&v<=2.0)?v:1; }catch(e){ return 1; } })();
function adjustTkScale(d){
  tkScale = Math.round(Math.min(2.0, Math.max(0.6, tkScale + d))*10)/10;
  try{ localStorage.setItem('quyen22-tk-scale', String(tkScale)); }catch(e){}
  const w = document.getElementById('tk-wrap'); if(w) w.style.setProperty('--tkscale', tkScale);
  const p = document.getElementById('tk-pct'); if(p) p.textContent = Math.round(tkScale*100) + '%';
}
function tkRow(stt, ten, pali, badge, desc){
  return `<div style="padding:7px 10px;border-top:1px solid rgba(128,128,128,.22)">
    <div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap">
      <span style="font-weight:800;min-width:26px">${stt}</span>
      <span style="flex:1;min-width:150px"><b>${ten}</b>${pali?` <span style="font-style:italic;color:#1c5b9e;font-size:.92em">${pali}</span>`:''}</span>
      ${badge!==''&&badge!=null?`<span style="font-weight:700;background:rgba(192,140,34,.15);border-radius:6px;padding:1px 8px;white-space:nowrap">${badge}</span>`:''}
    </div>
    ${desc?`<div style="padding:2px 0 1px 34px;opacity:.92;font-size:.95em">${desc}</div>`:''}
  </div>`;
}
function tkBlock(title, intro, rowsHtml, note){
  const zbtn = 'height:28px;min-width:32px;padding:0 7px;border-radius:8px;border:1px solid rgba(128,128,128,.35);background:var(--card);color:var(--ink);font-size:13px;font-weight:700;font-family:inherit';
  return `
    <div class="group-head" style="margin-top:20px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="flex:1;min-width:140px">${title}</span>
      <span style="display:inline-flex;gap:4px;align-items:center;font-weight:600">
        <button style="${zbtn}" onclick="adjustTkScale(-0.1)" aria-label="Thu nhỏ bảng tổng kết">A−</button>
        <span id="tk-pct" style="font-size:12px;color:var(--ink-soft);min-width:38px;text-align:center">${Math.round(tkScale*100)}%</span>
        <button style="${zbtn}" onclick="adjustTkScale(0.1)" aria-label="Phóng to bảng tổng kết">A+</button>
      </span>
    </div>
    <div id="tk-wrap" style="--tkscale:${tkScale}">
      ${intro?`<p class="info-note" style="margin-bottom:8px;font-size:calc(14px * var(--tkscale));line-height:1.5">${intro}</p>`:''}
      <div style="background:var(--card);border:1px solid rgba(128,128,128,.25);border-radius:12px;overflow:hidden;font-size:calc(14.5px * var(--tkscale));line-height:1.45">${rowsHtml}</div>
      ${note?`<p class="info-note" style="margin-top:8px;font-size:calc(13px * var(--tkscale));line-height:1.5">${note}</p>`:''}
    </div>`;
}

// ---- Tổng kết 21 Cảnh: số tâm biết mỗi cảnh + 7 nhóm tâm biết cảnh ----
function tkCanh(){
  const SO = {canh_sac:[48,2],canh_thinh:[48,2],canh_khi:[48,2],canh_vi:[48,2],canh_xuc:[48,2],canh_ngu:[56,3],canh_phap:[108,67],canh_chonde:[102,71],canh_thithiet:[50,21],canh_ducgioi:[56,25],canh_daodai:[37,6],canh_nietban:[51,40],canh_danhphap:[89,46],canh_sacphap:[56,13],canh_quakhu:[49,6],canh_hientai:[56,13],canh_vilai:[43,0],canh_ngoaithoi:[90,46],canh_noiphan:[62,6],canh_ngoaiphan:[112,58]};
  const rows = CANH_DATA.map((c,i)=>{
    const so = SO[c.id];
    const badge = so ? `${so[0]} · ${so[1]}` : '— gộp —';
    return tkRow(i+1, c.ten, c.pali, badge, '');
  }).join('');
  const NHOM7 = [
    ['25 tâm chỉ biết cảnh Dục giới','23 tâm quả Dục giới (10 Ngũ song thức + 2 Tiếp thâu + 3 Quan sát + 8 Đại quả) + tâm Khai ngũ môn + tâm Tiếu sinh.'],
    ['20 tâm biết cảnh Dục giới, Đáo đại, Chế định — không biết cảnh Siêu thế','12 tâm Bất thiện + 4 Đại thiện ly trí + 4 Đại tố ly trí.'],
    ['5 tâm biết mọi cảnh — trừ Đạo và Quả A-la-hán','4 Đại thiện hợp trí + tâm Diệu trí thiện (thông thiện).'],
    ['6 tâm biết tất cả 21 cảnh','4 Đại tố hợp trí + tâm Diệu trí tố (thông tố) + tâm Khai ý môn.'],
    ['6 tâm chỉ biết cảnh Đáo đại','3 tâm Thức vô biên xứ + 3 tâm Phi tưởng phi phi tưởng xứ.'],
    ['21 tâm chỉ biết cảnh Chế định','15 tâm Sắc giới + 3 tâm Không vô biên xứ + 3 tâm Vô sở hữu xứ.'],
    ['8 (40) tâm chỉ biết cảnh Níp-bàn','Toàn bộ tâm Siêu thế (4 Đạo + 4 Quả; kể theo 5 tầng thiền thành 40).']
  ];
  const rows2 = NHOM7.map((n,i)=>tkRow(i+1, n[0], '', '', n[1])).join('');
  return tkBlock('Tổng kết', 'Cột số bên phải: <b>số tâm biết được cảnh</b> · <b>số tâm biết cảnh ấy cố định</b> (nhất định — không biết cảnh nào khác). Kể tâm theo 121; hai tâm Diệu trí (Abhiññā) đếm riêng với 15 tâm Sắc giới.', rows,
    '')
  + tkBlock('7 nhóm tâm biết cảnh', 'Gom 121 tâm (cùng 2 tâm Diệu trí kể riêng) theo phạm vi cảnh sở tri — theo tài liệu "6 Cảnh · 21 Cảnh · 7 Nhóm Tâm Biết Cảnh" và Abhidhammatthasaṅgaha (Ārammaṇasaṅgaha).', rows2,
    'Kệ tổng kết trong Saṅgaha: <i>Pañcavīsa parittamhi, cha cittāni mahaggate; ekavīsati vohāre, aṭṭha nibbānagocarā. Vīsānuttaramuttamhi, aggamaggaphalujjhite; pañca sabbattha chacceti, sattadhā tattha saṅgaho.</i>');
}

// ---- Tổng kết 22 Quyền ----
function tkQuyen(){
  if(typeof QUYEN_DATA==='undefined') return '';
  const rows = QUYEN_DATA.map(d=>tkRow(d.id, d.ten, d.pali.split(' ')[0], d.sacdanh==='sac'?'Sắc':(d.sacdanh==='danh'?'Danh':'Sắc·Danh'), d.chiphap)).join('');
  return tkBlock('Tổng kết 22 Quyền', 'Mỗi quyền kèm <b>chi pháp</b> và phân loại <b>Sắc quyền – Danh quyền</b>. 22 quyền quy nạp về <b>16 chi pháp chân đế</b>: 5 sắc thần kinh, 2 sắc tính, sắc mạng quyền + tâm sở Mạng quyền, Tâm (121), tâm sở Thọ (5 thọ quyền), Tín, Cần, Niệm, Nhất hành, Trí tuệ (4 quyền tuệ).', rows,
    'Phân cõi và vai trò Quyền duyên: xem 4 bảng tổng quát ở các nút phía trên. Nguồn: Visuddhimagga XVI (Indriyasaccaniddesa) — đã đối chiếu bản VRI.');
}

// ---- Tổng kết Tâm – Tâm sở ----
function tkTamSo(){
  const rows = [
    tkRow(1,'Tâm','Citta','121 (89)','12 Bất thiện (8 Tham · 2 Sân · 2 Si) + 18 Vô nhân (7 quả bất thiện · 8 quả thiện · 3 duy tác) + 24 Dục giới tịnh hảo (8 Thiện · 8 Quả · 8 Duy tác) + 15 Sắc giới (5·5·5) + 12 Vô sắc giới (4·4·4) + 8 Siêu thế (4 Đạo · 4 Quả — kể theo 5 tầng thiền thành 40, ra tổng 121).'),
    tkRow(2,'Tâm sở','Cetasika','52','13 Tợ tha (7 Biến hành + 6 Biệt cảnh) + 14 Bất thiện (4 Si phần · 3 Tham phần · 4 Sân phần · 2 Hôn phần · 1 Hoài nghi) + 25 Tịnh hảo (19 Biến hành tịnh hảo + 3 Giới phần + 2 Vô lượng phần + 1 Tuệ quyền).'),
    tkRow(3,'Sắc pháp','Rūpa','28','4 Sắc đại hiển (Đất · Nước · Lửa · Gió) + 24 sắc y sinh. Chia cách khác: 12 sắc thô + 16 sắc tế.'),
    tkRow(4,'Níp-bàn','Nibbāna','1','Pháp vô vi — đối tượng của tâm Siêu thế.'),
    tkRow(5,'Pháp chế định','Paññatti','13','7 Nghĩa chế định (attha-paññatti) + 6 Danh chế định (nāma-paññatti) — pháp mượn gọi, không phải chân đế.')
  ].join('');
  return tkBlock('Tổng kết', '<b>4 pháp chân đế</b> (Paramattha): Tâm · Tâm sở · Sắc pháp · Níp-bàn = 121 + 52 + 28 + 1; Pháp chế định (13) là pháp giả lập để trình bày, không thuộc chân đế.', rows, '');
}

// ---- Tổng kết Pháp thực tính ----
function tkDacTinh(){
  if(typeof DACTINH_TL==='undefined') return '';
  let tong=0;
  const rows = DACTINH_TL.map((g,i)=>{ tong+=g.items.length; return tkRow(i+1, g.ten, '', `${g.items.length} mục`, ''); }).join('');
  return tkBlock('Tổng kết', `<b>${tong} mục</b> pháp thực tính, mỗi mục trình bày đủ 4 khía cạnh: Đặc tính (Lakkhaṇā) · Chức năng (Rasā) · Sự thể hiện (Paccupaṭṭhānā) · Nhân gần (Padaṭṭhānā), kèm Pāli đã hiệu đính theo Visuddhimagga &amp; Aṭṭhasālinī (VRI).`, rows, '');
}

// ---- Tổng kết Duyên khởi ----
function tkDuyenKhoi(){
  const rows = DUYENKHOI_DATA.map((d,i)=>tkRow(i+1, d.ten, d.pali, '', d.chiphap)).join('');
  const CS = [
    ['12 Chi phần','aṅga','Vô minh → Già chết.'],
    ['3 Thời','addhā','Quá khứ: Vô minh, Hành · Hiện tại: Thức → Hữu · Vị lai: Sanh, Già chết.'],
    ['4 Gom (yếu lược)','saṅgaha','Nhân quá khứ · Quả hiện tại · Nhân hiện tại · Quả vị lai.'],
    ['20 Hành tướng','ākāra','5 nhân quá khứ (Vô minh, Hành, Ái, Thủ, Nghiệp hữu) + 5 quả hiện tại (Thức, Danh sắc, Lục nhập, Xúc, Thọ) + 5 nhân hiện tại (Ái, Thủ, Nghiệp hữu, Vô minh, Hành) + 5 quả vị lai (Thức, Danh sắc, Lục nhập, Xúc, Thọ).'],
    ['3 Mối nối','sandhi','Hành – Thức (nhân QK ↔ quả HT) · Thọ – Ái (quả HT ↔ nhân HT) · Hữu – Sanh (nhân HT ↔ quả VL).'],
    ['3 Luân chuyển','vaṭṭa','Phiền não luân (Vô minh, Ái, Thủ) · Nghiệp luân (Hành, Nghiệp hữu) · Quả luân (Thức, Danh sắc, Lục nhập, Xúc, Thọ, Sanh hữu, Sanh, Già chết).'],
    ['2 Gốc rễ','mūla','Vô minh (từ quá khứ vươn tới Thọ) · Ái (từ hiện tại vươn tới Già chết).'],
    ['2 Đế chi phối','sacca','Tập Đế (các chi thuộc nhân) · Khổ Đế (các chi thuộc quả).']
  ];
  const rows2 = CS.map((c,i)=>tkRow(i+1, c[0], c[1], '', c[2])).join('');
  return tkBlock('Tổng kết chi pháp 12 chi', 'Chi pháp chân đế của từng chi phần theo bảng "Chi pháp pháp duyên khởi" (Đường Vào Thắng Pháp — TK Chánh Minh).', rows,'')
  + tkBlock('Các con số của giáo lý Duyên khởi', 'Theo cách tổng kết truyền thống trong Visuddhimagga XVII (Paññābhūminiddesa).', rows2,'');
}

// ---- Tổng kết 18 Giới ----
function tkXuGioi(){
  const SO = [1,1,2,1,1,2,1,1,2,1,1,2,1,3,2,3,69,76];
  const rows = GIOI_DATA.map((d,i)=>tkRow(i+1, d.ten, d.pali, `${SO[i]} pháp`, d.chiphap)).join('');
  return tkBlock('Tổng kết 18 Giới', 'Số pháp chân đế của từng giới. Cộng toàn bộ: <b>12 sắc thô</b> (5 căn + 7 cảnh, trong đó Xúc giới = 3 pháp) + <b>89 tâm</b> (10 Ngũ song thức + 3 Ý giới + 76 Ý thức giới) + <b>69 pháp thuộc Pháp giới</b> (52 tâm sở + 16 sắc tế + Níp-bàn) — trọn vẹn 28 sắc + 89 tâm + 52 tâm sở + Níp-bàn.', rows, '');
}

function openDuyenHeSheet(i){
  const d = DUYENHE_DATA[i];
  let html = `
    <div class="sheet-head"><h2>${i+1}. ${d.ten}</h2></div>
    <p class="sheet-pali">${d.pali}</p>
    <div class="sec"><div class="sec-label">Định nghĩa</div><div class="sec-body">${d.dn}</div></div>
  `;
  if(d.nang || d.so || d.phiso){
    html += `<div class="sec" style="margin-top:12px"><div class="sec-label">Chi pháp</div><div class="sec-body">${dhChiphapRows(d)}</div></div>`;
  }
  if(d.subs){
    html += `<div class="sec" style="margin-top:12px"><div class="sec-label">Phân rộng thành ${d.subs.length} duyên</div></div>`;
    for(const s of d.subs){
      html += `<div class="group-head" style="margin-top:10px">${s.ten} <i style="font-weight:400">(${s.pali})</i></div>
        <div class="sec-body" style="margin-top:4px">${s.dn}</div>`;
      if(s.nang || s.so || s.phiso){
        html += `<div class="sec-body" style="margin-top:6px">${dhChiphapRows(s)}</div>`;
      }
    }
  }
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

// ===== (Trang 22 Quyền) 4 bảng tổng quát =====
function qList(arr){ return arr.map(d=>`${d.id}. ${d.ten} <i style="color:var(--ink-soft)">(${d.pali.split(' ')[0]})</i>`).join('<br>'); }

function openQuyenDanhSac(){
  const sac = QUYEN_DATA.filter(d=>d.sacdanh==='sac');
  const danh = QUYEN_DATA.filter(d=>d.sacdanh==='danh');
  const dacbiet = QUYEN_DATA.filter(d=>d.sacdanh!=='sac' && d.sacdanh!=='danh');
  showAttrSheet(`
    <div class="sheet-head"><h2>Danh quyền · Sắc quyền</h2></div>
    <p class="sheet-pali">Phân 22 quyền theo Danh – Sắc</p>
    <div class="sec"><div class="sec-label">Sắc quyền (${sac.length})</div><div class="sec-body">${qList(sac)}</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Danh quyền (${danh.length})</div><div class="sec-body">${qList(danh)}</div></div>
    ${dacbiet.length?`<div class="sec" style="margin-top:12px"><div class="sec-label">Đặc biệt: cả Sắc lẫn Danh (${dacbiet.length})</div><div class="sec-body">${qList(dacbiet)} — Mạng quyền có 2 chi pháp: sắc mạng quyền và danh mạng quyền (tâm sở Mạng quyền).</div></div>`:''}
  `);
}

function openQuyenCoi(){
  const groups = {};
  QUYEN_DATA.forEach(d=>{ (groups[d.coi_label]=groups[d.coi_label]||[]).push(d); });
  let html = `<div class="sheet-head"><h2>Địa vức (Cõi)</h2></div><p class="sheet-pali">Phạm vi có mặt và hoạt động của 22 quyền</p>`;
  for(const [label, arr] of Object.entries(groups)){
    html += `<div class="sec" style="margin-top:12px"><div class="sec-label">${label} (${arr.length})</div><div class="sec-body">${qList(arr)}</div></div>`;
  }
  showAttrSheet(html);
}

function openQuyenChiPhap16(){
  showAttrSheet(`
    <div class="sheet-head"><h2>16 chi pháp chân đế</h2></div>
    <p class="sheet-pali">22 quyền quy nạp về 16 pháp chân đế</p>
    <div class="sec"><div class="sec-body">
      <b>1–5.</b> 5 sắc thần kinh (pasāda-rūpa) — chi pháp của Nhãn, Nhĩ, Tỷ, Thiệt, Thân quyền.<br><br>
      <b>6.</b> Sắc nữ tính (itthibhāva-rūpa) — chi pháp của Nữ quyền.<br><br>
      <b>7.</b> Sắc nam tính (purisabhāva-rūpa) — chi pháp của Nam quyền.<br><br>
      <b>8–9.</b> Sắc mạng quyền (jīvitindriya-rūpa) và tâm sở Mạng quyền (danh) — 2 chi pháp của Mạng quyền.<br><br>
      <b>10.</b> Tâm (citta, cả 121 thứ tâm) — chi pháp của Ý quyền.<br><br>
      <b>11.</b> Tâm sở Thọ (vedanā) — chi pháp của 5 quyền: Lạc, Khổ, Hỷ, Ưu, Xả quyền.<br><br>
      <b>12.</b> Tâm sở Tín — chi pháp của Tín quyền.<br><br>
      <b>13.</b> Tâm sở Cần — chi pháp của Tấn quyền.<br><br>
      <b>14.</b> Tâm sở Niệm — chi pháp của Niệm quyền.<br><br>
      <b>15.</b> Tâm sở Nhất hành (ekaggatā) — chi pháp của Định quyền.<br><br>
      <b>16.</b> Tâm sở Trí tuệ (paññā) — chi pháp của 4 quyền: Tuệ quyền, Tri vị tri quyền, Tri dĩ tri quyền, Tri cụ tri quyền.
    </div></div>
    <p class="info-note">22 quyền nhưng chi pháp chân đế chỉ có 16: vì 5 thọ quyền cùng là tâm sở Thọ, 4 quyền tuệ cùng là tâm sở Trí, và Mạng quyền gồm 2 chi pháp sắc + danh.</p>
  `);
}

function openQuyenDuyenTQ(){
  const groups = {};
  QUYEN_DATA.forEach(d=>{ const k = d.duyen_loai || 'Không làm năng Quyền duyên (Nữ quyền, Nam quyền)'; (groups[k]=groups[k]||[]).push(d); });
  let html = `<div class="sheet-head"><h2>Quyền duyên</h2></div><p class="sheet-pali">Indriyapaccaya — vai trò năng duyên của 22 quyền</p>`;
  for(const [label, arr] of Object.entries(groups)){
    html += `<div class="sec" style="margin-top:12px"><div class="sec-label">${label} (${arr.length})</div><div class="sec-body">${qList(arr)}</div></div>`;
  }
  html += `<p class="info-note">Nữ quyền và Nam quyền không làm năng duyên trong Quyền duyên vì không có 3 chức năng: tạo ra – hỗ trợ – duy trì (ví như khuôn bánh không sinh ra, không nuôi bánh).</p>`;
  showAttrSheet(html);
}

// ===== Trang "12 Xứ · 18 Giới" (Āyatana – Dhātu) =====
// Nguồn: tài liệu "12 Xứ & 18 Giới" (Abhidhammattha Saṅgaha — Āyatana-saṅgaha, Dhātu-saṅgaha)

const XU_DATA = [
 {ten:'Nhãn xứ', pali:'Cakkhāyatana', nhom:'noi', chiphap:'Nhãn tịnh sắc (cakkhu-pasāda) — sắc thần kinh nhãn.'},
 {ten:'Nhĩ xứ', pali:'Sotāyatana', nhom:'noi', chiphap:'Nhĩ tịnh sắc (sota-pasāda) — sắc thần kinh nhĩ.'},
 {ten:'Tỷ xứ', pali:'Ghānāyatana', nhom:'noi', chiphap:'Tỷ tịnh sắc (ghāna-pasāda) — sắc thần kinh tỷ.'},
 {ten:'Thiệt xứ', pali:'Jivhāyatana', nhom:'noi', chiphap:'Thiệt tịnh sắc (jivhā-pasāda) — sắc thần kinh thiệt.'},
 {ten:'Thân xứ', pali:'Kāyāyatana', nhom:'noi', chiphap:'Thân tịnh sắc (kāya-pasāda) — sắc thần kinh thân.'},
 {ten:'Ý xứ', pali:'Manāyatana', nhom:'noi', chiphap:'Toàn bộ <b>89 (hay 121) tâm</b>. Trong 18 Giới, Ý xứ được tách thành 7 giới về thức: 5 đôi thức giới + Ý giới + Ý thức giới.'},
 {ten:'Sắc xứ', pali:'Rūpāyatana', nhom:'ngoai', chiphap:'Sắc cảnh — hình sắc, màu sắc (đối tượng của nhãn thức).'},
 {ten:'Thinh xứ', pali:'Saddāyatana', nhom:'ngoai', chiphap:'Thinh cảnh — âm thanh (đối tượng của nhĩ thức).'},
 {ten:'Khí xứ', pali:'Gandhāyatana', nhom:'ngoai', chiphap:'Khí cảnh — mùi (đối tượng của tỷ thức).'},
 {ten:'Vị xứ', pali:'Rasāyatana', nhom:'ngoai', chiphap:'Vị cảnh — mùi vị (đối tượng của thiệt thức).'},
 {ten:'Xúc xứ', pali:'Phoṭṭhabbāyatana', nhom:'ngoai', chiphap:'3 pháp: <b>địa đại, hỏa đại, phong đại</b> (đất – lửa – gió), đối tượng của thân thức. (Thủy đại thuộc sắc tế, không xúc chạm được.)'},
 {ten:'Pháp xứ', pali:'Dhammāyatana', nhom:'ngoai', chiphap:'<b>69 pháp</b>: 52 tâm sở + 16 sắc tế (sukhuma-rūpa) + Níp-bàn — đồng phạm vi với Pháp giới.'}
];

const GIOI_DATA = [
 {ten:'Nhãn giới', pali:'Cakkhu-dhātu', nhom:'can', chiphap:'1 pháp: nhãn tịnh sắc (cakkhu-pasāda).'},
 {ten:'Sắc giới', pali:'Rūpa-dhātu', nhom:'canh', chiphap:'1 pháp: sắc cảnh (hình sắc, màu sắc).'},
 {ten:'Nhãn thức giới', pali:'Cakkhu-viññāṇa-dhātu', nhom:'thuc', chiphap:'2 tâm: Nhãn thức quả thiện + Nhãn thức quả bất thiện.'},
 {ten:'Nhĩ giới', pali:'Sota-dhātu', nhom:'can', chiphap:'1 pháp: nhĩ tịnh sắc (sota-pasāda).'},
 {ten:'Thinh giới', pali:'Sadda-dhātu', nhom:'canh', chiphap:'1 pháp: thinh cảnh (âm thanh).'},
 {ten:'Nhĩ thức giới', pali:'Sota-viññāṇa-dhātu', nhom:'thuc', chiphap:'2 tâm: Nhĩ thức quả thiện + Nhĩ thức quả bất thiện.'},
 {ten:'Tỷ giới', pali:'Ghāna-dhātu', nhom:'can', chiphap:'1 pháp: tỷ tịnh sắc (ghāna-pasāda).'},
 {ten:'Khí giới', pali:'Gandha-dhātu', nhom:'canh', chiphap:'1 pháp: khí cảnh (mùi).'},
 {ten:'Tỷ thức giới', pali:'Ghāna-viññāṇa-dhātu', nhom:'thuc', chiphap:'2 tâm: Tỷ thức quả thiện + Tỷ thức quả bất thiện.'},
 {ten:'Thiệt giới', pali:'Jivhā-dhātu', nhom:'can', chiphap:'1 pháp: thiệt tịnh sắc (jivhā-pasāda).'},
 {ten:'Vị giới', pali:'Rasa-dhātu', nhom:'canh', chiphap:'1 pháp: vị cảnh (mùi vị).'},
 {ten:'Thiệt thức giới', pali:'Jivhā-viññāṇa-dhātu', nhom:'thuc', chiphap:'2 tâm: Thiệt thức quả thiện + Thiệt thức quả bất thiện.'},
 {ten:'Thân giới', pali:'Kāya-dhātu', nhom:'can', chiphap:'1 pháp: thân tịnh sắc (kāya-pasāda).'},
 {ten:'Xúc giới', pali:'Phoṭṭhabba-dhātu', nhom:'canh', chiphap:'3 pháp: địa đại, hỏa đại, phong đại (đất – lửa – gió).'},
 {ten:'Thân thức giới', pali:'Kāya-viññāṇa-dhātu', nhom:'thuc', chiphap:'2 tâm: Thân thức quả thiện (thọ lạc) + Thân thức quả bất thiện (thọ khổ).'},
 {ten:'Ý giới', pali:'Mano-dhātu', nhom:'thuc', chiphap:'<b>3 tâm</b> tiếp nhận cảnh nơi ngũ môn: tâm Hướng ngũ môn (pañcadvārāvajjana) + 2 tâm Tiếp thâu (sampaṭicchana quả thiện và quả bất thiện).'},
 {ten:'Pháp giới', pali:'Dhamma-dhātu', nhom:'canh', chiphap:'<b>69 pháp</b>: 52 tâm sở + 16 sắc tế (sukhuma-rūpa) + Níp-bàn. Không gồm 12 sắc thô (đã có ở các giới căn – cảnh) và không gồm tâm (đã thuộc 7 giới về thức).'},
 {ten:'Ý thức giới', pali:'Mano-viññāṇa-dhātu', nhom:'thuc', chiphap:'<b>76 tâm</b>: tất cả tâm còn lại = 89 tâm − 10 tâm ngũ song thức (giới 3, 6, 9, 12, 15) − 3 tâm Ý giới (giới 16).'}
];

function renderXuGioiPage(){
  const extra = document.getElementById('extra-content');
  const XGC = {noi:'circle-sac', ngoai:'circle-canh', can:'circle-sac', canh:'circle-canh', thuc:'circle-vt'};
  const xu = (arr, from) => arr.map((d,i)=>{
    const idx = from + i;
    return `<div class="circle ${XGC[d.nhom]}" onclick="openXuSheet(${XU_DATA.indexOf(d)})">
      <div class="cp" style="font-weight:800">${idx}</div><div class="cn">${d.ten}</div><div class="cp">${d.pali.replace('āyatana','')}</div></div>`;
  }).join('');
  const gioi = GIOI_DATA.map((d,i)=>`<div class="circle ${XGC[d.nhom]}" onclick="openGioiSheet(${i})">
      <div class="cp" style="font-weight:800">${i+1}</div><div class="cn">${d.ten}</div><div class="cp">${d.pali.replace('-dhātu','')}</div></div>`).join('');

  extra.innerHTML = `
    <p class="info-note" style="margin-bottom:10px"><b>Xứ (āyatana)</b> và <b>Giới (dhātu)</b> là hai cách phân loại các pháp chân đế (tâm, tâm sở, sắc pháp) nhìn dưới góc độ "cửa ngõ tiếp xúc" và "yếu tố cấu thành kinh nghiệm". 12 Xứ nhóm theo 6 cặp căn – cảnh (nội xứ – ngoại xứ); 18 Giới tách rõ thêm phần <b>thức</b>: phân biệt riêng các loại tâm sinh khởi nơi mỗi căn.</p>
    <div class="group-head">12 Xứ · 6 Nội xứ (ajjhattikāyatana)</div>
    <div class="circle-grid">${xu(XU_DATA.filter(d=>d.nhom==='noi'), 1)}</div>
    <div class="group-head">12 Xứ · 6 Ngoại xứ (bāhirāyatana)</div>
    <div class="circle-grid">${xu(XU_DATA.filter(d=>d.nhom==='ngoai'), 7)}</div>
    <div class="group-head">18 Giới (Dhātu)</div>
    <p class="info-note" style="margin:4px 0 8px">Cấu trúc: 5 nhóm <b>Căn – Cảnh – Thức</b> (giới 1–15, mỗi căn 3 giới) + <b>Ý giới</b> (16) + <b>Pháp giới</b> (17) + <b>Ý thức giới</b> (18). Màu: <span style="color:#3f7cb8">■</span> căn (tịnh sắc) · <span style="color:#2f8d7c">■</span> cảnh · <span style="color:#8258b8">■</span> thức (tâm).</p>
    <div class="circle-grid">${gioi}</div>
    <p class="info-note" style="margin-top:10px">Nguồn: Abhidhammattha Saṅgaha — chương Āyatana-saṅgaha, Dhātu-saṅgaha (tài liệu "12 Xứ & 18 Giới").</p>
    ${tkXuGioi()}
  `;
}

function openXuSheet(i){
  const d = XU_DATA[i];
  const nhomLabel = d.nhom==='noi' ? 'Nội xứ (ajjhattikāyatana) — căn bên trong' : 'Ngoại xứ (bāhirāyatana) — cảnh bên ngoài';
  let doichieu = '';
  if(d.ten==='Ý xứ') doichieu = 'Trong 18 Giới, Ý xứ bao quát cả <b>7 giới thuộc về tâm</b>: 5 đôi thức giới (3, 6, 9, 12, 15) + Ý giới (16) + Ý thức giới (18) — tức toàn bộ 89 tâm.';
  else if(d.ten==='Pháp xứ') doichieu = 'Đồng nhất phạm vi với <b>Pháp giới</b> (giới 17): 52 tâm sở + 16 sắc tế + Níp-bàn.';
  else doichieu = 'Tương ứng trực tiếp với giới cùng tên trong 18 Giới (chỉ gồm căn và cảnh, KHÔNG bao gồm thức).';
  showAttrSheet(`
    <div class="sheet-head"><span class="num">${i+1}</span><h2>${d.ten}</h2></div>
    <p class="sheet-pali">${d.pali} · ${nhomLabel}</p>
    <div class="sec"><div class="sec-label">Chi pháp</div><div class="sec-body">${d.chiphap}</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Đối chiếu với 18 Giới</div><div class="sec-body">${doichieu}</div></div>
  `);
}

function openGioiSheet(i){
  const d = GIOI_DATA[i];
  const NL = {can:'Giới thuộc căn (tịnh sắc)', canh:'Giới thuộc cảnh', thuc:'Giới thuộc thức (tâm)'};
  showAttrSheet(`
    <div class="sheet-head"><span class="num">${i+1}</span><h2>${d.ten}</h2></div>
    <p class="sheet-pali">${d.pali} · ${NL[d.nhom]}</p>
    <div class="sec"><div class="sec-label">Chi pháp / Số pháp</div><div class="sec-body">${d.chiphap}</div></div>
  `);
}

function openXGDoiChieu(){
  showAttrSheet(`
    <div class="sheet-head"><h2>Đối chiếu 12 Xứ ↔ 18 Giới</h2></div>
    <p class="sheet-pali">Āyatana ↔ Dhātu</p>
    <div class="sec"><div class="sec-label">10 xứ căn – cảnh</div><div class="sec-body">Nhãn, Nhĩ, Tỷ, Thiệt, Thân xứ và Sắc, Thinh, Khí, Vị, Xúc xứ tương ứng <b>trực tiếp</b> với 10 giới cùng tên (giới 1, 2, 4, 5, 7, 8, 10, 11, 13, 14) — chỉ gồm căn và cảnh, KHÔNG bao gồm thức.</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Ý xứ (1 xứ → 7 giới)</div><div class="sec-body">Bao quát cả 7 giới thuộc về tâm: 5 đôi thức giới (3, 6, 9, 12, 15) + Ý giới (16) + Ý thức giới (18) — tức toàn bộ 89 tâm.</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Pháp xứ (1 xứ = 1 giới)</div><div class="sec-body">Đồng nhất phạm vi với Pháp giới (17): 52 tâm sở + 16 sắc tế + Níp-bàn (69 pháp).</div></div>
    <p class="info-note">Như vậy 12 Xứ mở rộng thành 18 Giới bằng cách tách Ý xứ thành 7 giới về thức: 12 − 1 + 7 = 18.</p>
  `);
}

function openXGTomTat(){
  showAttrSheet(`
    <div class="sheet-head"><h2>Tóm tắt số pháp</h2></div>
    <p class="sheet-pali">Bảng tổng số pháp của hai hệ thống</p>
    <div class="sec"><div class="sec-label">18 Giới → tổng số pháp</div><div class="sec-body">10 sắc thô làm căn + cảnh (giới 1–2, 4–5, 7–8, 10–11, 13) + 3 pháp Xúc giới (giới 14: đất – lửa – gió) + <b>89 tâm</b> (10 ngũ song thức + 3 Ý giới + 76 Ý thức giới) + 52 tâm sở + 16 sắc tế + Níp-bàn (Pháp giới).</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">12 Xứ → tổng số pháp</div><div class="sec-body">10 xứ sắc thô (nội xứ 1–5 + ngoại xứ 7–11, trong đó Xúc xứ gồm 3 pháp) + <b>89 tâm</b> (Ý xứ) + 52 tâm sở + 16 sắc tế + Níp-bàn (Pháp xứ).</div></div>
    <p class="info-note">Cả hai hệ thống đều bao quát toàn bộ thực tại: 28 sắc pháp (12 sắc thô + 16 sắc tế) + 89 tâm + 52 tâm sở + Níp-bàn — chỉ khác cách nhóm.</p>
  `);
}


// ===== Cài đặt: ngôn ngữ hiển thị + xuất dữ liệu =====
function getLangMode(){ try{ return localStorage.getItem('quyen22-lang') || 'both'; }catch(e){ return 'both'; } }
function applyLangMode(){
  const m = getLangMode();
  document.body.classList.toggle('lang-vi', m==='vi');
  document.body.classList.toggle('lang-pali', m==='pali');
}
function setLangMode(m){
  try{ localStorage.setItem('quyen22-lang', m); }catch(e){}
  applyLangMode();
  openSettingsSheet(); // vẽ lại để cập nhật nút đang chọn
}

function openSettingsSheet(){
  const m = getLangMode();
  const btn = (val,label)=>`<button class="qbtn ${m===val?'on':''}" onclick="setLangMode('${val}')">${label}</button>`;
  document.getElementById('sheet-content').innerHTML = `
    <div class="sheet-head"><h2>Cài đặt</h2></div>
    <p class="sheet-pali">Thắng Pháp — Abhidhamma · phiên bản ${APP_VERSION}</p>
    <div class="sec"><div class="sec-label">Đồng bộ nhiều thiết bị</div>
      <div class="setopt">
        <button class="qbtn" onclick="openSyncSheet()">☁️ ${abSyncCode ? 'Đang đồng bộ — mã: '+abSyncCode : 'Bật đồng bộ đám mây'}</button>
      </div>
      <div class="sec-body" style="margin-top:8px;font-size:calc(14px * var(--fontscale));color:var(--ink-soft)">Đồng bộ các mục đã chỉnh sửa và cài đặt hiển thị giữa điện thoại – máy tính, kèm bản lưu dự phòng trên đám mây.</div>
    </div>
    <div class="sec" style="margin-top:14px"><div class="sec-label">Xuất / Nhập dữ liệu</div>
      <div class="setopt">
        <button class="qbtn" onclick="exportAppData()">⬇ Xuất dữ liệu (JSON)</button>
        <button class="qbtn" onclick="document.getElementById('import-file').click()">⬆ Nhập dữ liệu (JSON)</button>
        <input type="file" id="import-file" accept=".json,application/json" style="display:none" onchange="importAppData(this)">
      </div>
      <div class="sec-body" style="margin-top:8px;font-size:calc(14px * var(--fontscale));color:var(--ink-soft)"><b>Xuất:</b> tải về tệp JSON gồm toàn bộ dữ liệu các trang + cài đặt và các nội dung bạn đã sửa.<br><b>Nhập:</b> chọn tệp JSON đã xuất trước đó để khôi phục cài đặt và các nội dung đã sửa.</div>
    </div>
    <div class="sec" style="margin-top:14px"><div class="sec-label">Sao lưu định kỳ lên đám mây</div>
      <div class="setopt">
        <button class="qbtn ${abBkFreq()==='off'?'on':''}" onclick="abBkSetFreq('off')">Tắt</button>
        <button class="qbtn ${abBkFreq()==='d'?'on':''}" onclick="abBkSetFreq('d')">Ngày</button>
        <button class="qbtn ${abBkFreq()==='w'?'on':''}" onclick="abBkSetFreq('w')">Tuần</button>
        <button class="qbtn ${abBkFreq()==='m'?'on':''}" onclick="abBkSetFreq('m')">Tháng</button>
      </div>
      <div id="ab-bk-status" class="sec-body" style="margin-top:8px;font-size:calc(13px * var(--fontscale));color:var(--ink-soft)">${abBkStatusText()}</div>
      <div class="setopt" style="margin-top:8px">
        <button class="qbtn" onclick="abBkNow(true)">💾 Sao lưu ngay</button>
        <button class="qbtn" onclick="abBkShowList()">🕘 Bản sao lưu</button>
      </div>
      <div id="ab-bk-list" style="margin-top:8px;font-size:calc(13.5px * var(--fontscale))"></div>
      <div class="sec-body" style="margin-top:8px;font-size:calc(13px * var(--fontscale));color:var(--ink-soft)">Tự động lưu một bản chụp (các mục đã sửa + cài đặt) lên đám mây theo chu kỳ, giữ 4 bản gần nhất. Cần đang bật Đồng bộ.</div>
    </div>
    <div class="sec" style="margin-top:14px"><div class="sec-label">Ngôn ngữ hiển thị (tên trên các ô)</div>
      <div class="setopt">
        ${btn('vi','Tiếng Việt')}
        ${btn('both','Việt – Pāli')}
        ${btn('pali','Pāli')}
      </div>
      <div class="sec-body" style="margin-top:8px;font-size:calc(14px * var(--fontscale));color:var(--ink-soft)">Áp dụng cho các ô tròn/thẻ trên các trang. Trong bảng chi tiết luôn hiển thị đầy đủ cả Việt lẫn Pāli.</div>
    </div>
    <div class="sec" style="margin-top:14px"><div class="sec-label">Phóng to / thu nhỏ trang (các ô &amp; chữ)</div>
      <div class="setopt" style="display:flex;align-items:center;gap:10px">
        <button class="qbtn" onclick="adjustFontScale(-0.05);const p=document.getElementById('fontscale-pct');if(p)p.textContent=Math.round((fontScales[currentSection]||1)*100)+'%'">A−</button>
        <span id="fontscale-pct" style="font-weight:700;min-width:48px;text-align:center">${Math.round(((typeof fontScales!=='undefined' && fontScales[currentSection])||1)*100)}%</span>
        <button class="qbtn" onclick="adjustFontScale(0.05);const p=document.getElementById('fontscale-pct');if(p)p.textContent=Math.round((fontScales[currentSection]||1)*100)+'%'">A+</button>
      </div>
      <div class="sec-body" style="font-size:calc(13px * var(--fontscale));color:var(--ink-soft)">Các ô vuông và chữ của trang đang xem sẽ to/nhỏ theo (mỗi trang nhớ mức riêng). Nút A−/A+ ở góc trên các bảng cũng điều khiển mức zoom này.</div>
    </div>
    <div class="sec" style="margin-top:14px"><div class="sec-label">Chỉnh sửa nội dung</div>
      <div class="setopt"><button class="qbtn" onclick="closeSheet();startEdit('page')">✎ Sửa nội dung trang hiện tại</button></div>
      <div class="sec-body" style="font-size:calc(14px * var(--fontscale))">Hoặc nhấn nút <b>✎</b> ở góc trên trái bảng chi tiết để sửa riêng bảng đó → sửa chữ trực tiếp → <b>✔ Lưu</b>. Nút <b>↺</b> khôi phục nội dung gốc. Đang có <b>${Object.keys(contentEdits).length}</b> mục đã sửa.</div>
    </div>
  `;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function exportAppData(){
  const pick = name => (typeof window[name] !== 'undefined') ? window[name] : undefined;
  const data = {
    app: 'Thắng Pháp — Abhidhamma',
    xuat_ngay: new Date().toISOString(),
    quyen22: typeof QUYEN_DATA!=='undefined'?QUYEN_DATA:undefined,
    citta: typeof CITTA_DATA!=='undefined'?CITTA_DATA:undefined,
    cetasika: typeof CETASIKA_DATA!=='undefined'?CETASIKA_DATA:undefined,
    dactinh_4khiacanh: typeof DACTINH_DATA!=='undefined'?DACTINH_DATA:undefined,
    dactinh_tailieu_135phap: typeof DACTINH_TL!=='undefined'?DACTINH_TL:undefined,
    chucnang_tam_14: typeof CHUCNANG_TAM_14!=='undefined'?CHUCNANG_TAM_14:undefined,
    sacphap: typeof RUPA_DATA!=='undefined'?RUPA_DATA:undefined,
    tho_chitiet: typeof THO_CHITIET_DATA!=='undefined'?THO_CHITIET_DATA:undefined,
    vaitro_tam: typeof VAITRO_TAM_DATA!=='undefined'?VAITRO_TAM_DATA:undefined,
    nipban: typeof NIPBAN_DT!=='undefined'?NIPBAN_DT:undefined,
    canh21: typeof CANH_DATA!=='undefined'?CANH_DATA:undefined,
    phapchedinh: typeof PANNATTI_DATA!=='undefined'?PANNATTI_DATA:undefined,
    duyenkhoi: typeof DUYENKHOI_DATA!=='undefined'?DUYENKHOI_DATA:undefined,
    duyenkhoi_4phan: typeof DK_QUARTER!=='undefined'?DK_QUARTER:undefined,
    duyenhe24: typeof DUYENHE_DATA!=='undefined'?DUYENHE_DATA:undefined,
    duyenhe_tomluoc_48: typeof DUYENHE_TOMLUOC!=='undefined'?DUYENHE_TOMLUOC:undefined,
    demucthien_40: typeof DEMUC_THIEN!=='undefined'?DEMUC_THIEN:undefined,
    xu12: typeof XU_DATA!=='undefined'?XU_DATA:undefined,
    gioi18: typeof GIOI_DATA!=='undefined'?GIOI_DATA:undefined,
    aniyata: typeof ANIYATA_INFO!=='undefined'?ANIYATA_INFO:undefined,
    cai_dat: {
      ngon_ngu: getLangMode(),
      co_chu_tung_trang: (typeof fontScales!=='undefined')?fontScales:{},
      co_chu_bang_chi_tiet: (typeof sheetScale!=='undefined')?sheetScale:1,
      co_chu_tom_luoc_duyen: (typeof tomluocScale!=='undefined')?tomluocScale:1,
      co_chu_tong_ket_de_muc: (typeof dmtScale!=='undefined')?dmtScale:1,
      trang_hien_tai: currentSection
    },
    noi_dung_da_sua: contentEdits
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json;charset=utf-8'});
  abSaveFileAs('thang-phap-abhidhamma-' + new Date().toISOString().slice(0,10) + '.json', blob);
}

async function abSaveFileAs(fname, blob){
  if(window.showSaveFilePicker){
    try{
      const h=await window.showSaveFilePicker({suggestedName:fname, types:[{description:'Tệp JSON', accept:{'application/json':['.json']}}]});
      const w=await h.createWritable(); await w.write(blob); await w.close();
      abToast('✓ Đã lưu vào vị trí bạn chọn'); return;
    }catch(e){ if(e&&e.name==='AbortError'){ abToast('Đã hủy'); return; } console.error(e); }
  }
  try{
    const file=new File([blob], fname, {type:'application/json'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title:fname});
      abToast('✓ Đã chuyển tới nơi bạn chọn'); return;
    }
  }catch(e){ if(e&&e.name==='AbortError'){ abToast('Đã hủy'); return; } console.error(e); }
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=fname;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); },500);
  abToast('Trình duyệt không hỗ trợ chọn vị trí — đã tải về thư mục Tải xuống');
}




// ===== 40 Đề mục thiền chỉ (Kammaṭṭhāna) =====
const DMT_MUC_LABEL = {
  '0':  'Chỉ đạt <b>Cận định</b> (Upacāra-samādhi) — không lên an chỉ định',
  '1':  'Cận định → An chỉ định: đắc <b>Sơ thiền</b>',
  '1-4':'Cận định → An chỉ định: đắc <b>Sơ thiền đến Tứ thiền</b> (4 tầng đầu, hệ 5 bậc)',
  '5':  'Cận định → An chỉ định: chỉ đắc <b>Ngũ thiền</b>',
  '1-5':'Cận định → An chỉ định: đắc đủ <b>Sơ, Nhị, Tam, Tứ, Ngũ thiền</b>',
  'vs1':'Cận định → An chỉ định: đắc thiền Vô sắc thứ nhất — <b>Không vô biên xứ</b>',
  'vs2':'Cận định → An chỉ định: đắc thiền Vô sắc thứ hai — <b>Thức vô biên xứ</b>',
  'vs3':'Cận định → An chỉ định: đắc thiền Vô sắc thứ ba — <b>Vô sở hữu xứ</b>',
  'vs4':'Cận định → An chỉ định: đắc thiền Vô sắc thứ tư — <b>Phi tưởng phi phi tưởng xứ</b>'
};
const DMT_NIMITTA_LABEL = {
  'pt': '<b>CÓ tợ tướng</b> (paṭibhāganimitta — quang tướng). Đề mục có đủ 3 ấn tướng: chuẩn bị tướng (parikammanimitta) → học tướng (uggahanimitta) → tợ tướng (paṭibhāganimitta); hành giả an trú trên tợ tướng để đắc định.',
  'tt': '<b>KHÔNG có tợ tướng</b> — đề mục lấy <b>pháp có thực tính riêng</b> (sabhāvadhamma) làm cảnh (Thanh Tịnh Đạo, đv. 117).',
  'kx': '<b>KHÔNG có tợ tướng</b> — cảnh của đề mục không xếp vào loại có quang tướng hay pháp thực tính (Thanh Tịnh Đạo, đv. 117).'
};
let dmtScale = (function(){ try{ const v=parseFloat(localStorage.getItem('quyen22-dmt-scale')); return (v>=0.6&&v<=2.0)?v:1; }catch(e){ return 1; } })();
function adjustDmtScale(d){
  dmtScale = Math.round(Math.min(2.0, Math.max(0.6, dmtScale + d))*10)/10;
  try{ localStorage.setItem('quyen22-dmt-scale', String(dmtScale)); }catch(e){}
  const w = document.getElementById('dmt-sum-wrap');
  if(w) w.style.setProperty('--dmtscale', dmtScale);
  const p = document.getElementById('dmt-sum-pct');
  if(p) p.textContent = Math.round(dmtScale*100) + '%';
}

function renderDeMucThienPage(){
  const extra = document.getElementById('extra-content');
  let n = 0;
  const groupsHtml = DEMUC_THIEN.map((g, gi)=>{
    const first = n + 1;
    const circles = g.items.map((it, ii)=>{
      n++;
      const label = it.ten.replace(/^Đề mục /,'');
      return `<div class="circle ${g.cls}" onclick="openDeMucThien(${gi},${ii})"><div class="cn">${n}. ${label}</div><div class="cp">${it.pali}</div></div>`;
    }).join('');
    return `<div class="group-head">${first}–${n} · ${g.ten}</div><div class="circle-grid">${circles}</div>`;
  }).join('');

  const zbtn = 'height:28px;min-width:32px;padding:0 7px;border-radius:8px;border:1px solid rgba(128,128,128,.35);background:var(--card);color:var(--ink);font-size:13px;font-weight:700;font-family:inherit';
  const td = 'border:1px solid #555;padding:5px 8px;vertical-align:top';
  const tdNum = td + ';text-align:center;font-weight:800;background:rgba(230,150,60,.28);white-space:nowrap';
  const th = td + ';font-weight:800;background:rgba(128,128,128,.16);text-align:center';
  const secRow = c => `<tr><td colspan="3" style="${td};font-weight:800;background:rgba(63,124,184,.16)">${c}</td></tr>`;
  const row = (label, num, items) => `<tr><td style="${td}">${label}</td><td style="${tdNum}">${num}</td><td style="${td}">${items}</td></tr>`;

  const bangTongKet = `
  <table style="border-collapse:collapse;width:100%;background:var(--card)">
    <tr><th style="${th};width:34%">Phân loại</th><th style="${th};width:12%">Số lượng</th><th style="${th}">Các đề mục</th></tr>
    ${secRow('① Theo mức định chứng đắc (theo cột x trong bảng gốc)')}
    ${row('Chỉ đạt <b>Cận định</b> (không lên an chỉ)','10','6 tùy niệm (Phật, Pháp, Tăng, Giới, Thí, Thiên) + niệm Níp-bàn + niệm tử + quán 4 giới + vật thực bất tịnh tưởng')}
    ${row('Đắc <b>Sơ thiền</b>','25','10 hoàn tịnh (kasiṇa) + 10 tử thi + thân hành niệm + niệm hơi thở + từ, bi, hỷ')}
    ${row('Đắc <b>Nhị thiền</b>','14','10 hoàn tịnh + niệm hơi thở + từ, bi, hỷ')}
    ${row('Đắc <b>Tam thiền</b>','14','10 hoàn tịnh + niệm hơi thở + từ, bi, hỷ')}
    ${row('Đắc <b>Tứ thiền</b>','14','10 hoàn tịnh + niệm hơi thở + từ, bi, hỷ')}
    ${row('Đắc <b>Ngũ thiền</b>','12','10 hoàn tịnh + niệm hơi thở + xả')}
    ${row('Đắc <b>Không vô biên xứ</b>','1','đề mục Không vô biên xứ')}
    ${row('Đắc <b>Thức vô biên xứ</b>','1','đề mục Thức vô biên xứ')}
    ${row('Đắc <b>Vô sở hữu xứ</b>','1','đề mục Vô sở hữu xứ')}
    ${row('Đắc <b>Phi tưởng phi phi tưởng xứ</b>','1','đề mục Phi tưởng phi phi tưởng xứ')}
    ${secRow('② Theo ấn tướng (Nimitta)')}
    ${row('<b>CÓ tợ tướng</b> (paṭibhāganimitta)','22','10 hoàn tịnh + 10 tử thi + niệm hơi thở + thân hành niệm')}
    ${row('<b>KHÔNG có tợ tướng</b> — cảnh là pháp thực tính','12','niệm Phật, Pháp, Tăng, Giới, Thí, Thiên, Níp-bàn, tử + quán 4 giới + vật thực + Thức vô biên xứ + Phi tưởng phi phi tưởng xứ')}
    ${row('<b>KHÔNG có tợ tướng</b> — cảnh không xếp loại như vậy','6','từ, bi, hỷ, xả + Không vô biên xứ + Vô sở hữu xứ')}
    ${row('→ Cộng KHÔNG có tợ tướng','18','12 + 6 đề mục trên')}
    ${secRow('③ Theo tánh nết phù hợp')}
    ${row('Phổ cập các tánh','10','đất, nước, lửa, gió, hư không, ánh sáng + 4 đề mục Vô sắc')}
    ${row('Tánh ái tình (tham)','11','10 tử thi + thân hành niệm')}
    ${row('Tánh sân','8','4 kasiṇa màu (xanh, vàng, đỏ, trắng) + từ, bi, hỷ, xả')}
    ${row('Tánh tầm và si','1','niệm hơi thở')}
    ${row('Tánh đức tin','6','niệm Phật, Pháp, Tăng, Giới, Thí, Thiên')}
    ${row('Tánh giác','4','niệm Níp-bàn + niệm tử + quán 4 giới + vật thực bất tịnh tưởng <i>(bảng gốc đánh dấu 4 đề mục Vô sắc cả Phổ cập lẫn Tánh giác — ở đây xếp vào Phổ cập)</i>')}
  </table>`;

  extra.innerHTML = `
    <p class="info-note" style="margin-bottom:12px"><b>40 đề mục thiền chỉ (Samatha-kammaṭṭhāna)</b> phân theo mức thiền chứng đắc và tánh nết phù hợp — theo Abhidhammatthasaṅgaha chương IX: Kammaṭṭhāna (Nghiệp Xứ). Phần ấn tướng (nimitta) theo Thanh Tịnh Đạo Giảng Giải — Giới và Định (Sayadaw U Sīlānanda, Pháp Triều dịch), đoạn văn 117. Chạm vào từng đề mục để xem chi tiết.</p>
    ${groupsHtml}
    <div class="group-head" style="margin-top:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="flex:1;min-width:120px">Tổng kết</span>
      <span style="display:inline-flex;gap:4px;align-items:center;font-weight:600">
        <button style="${zbtn}" onclick="adjustDmtScale(-0.1)" aria-label="Thu nhỏ bảng tổng kết">A−</button>
        <span id="dmt-sum-pct" style="font-size:12px;color:var(--ink-soft);min-width:38px;text-align:center">${Math.round(dmtScale*100)}%</span>
        <button style="${zbtn}" onclick="adjustDmtScale(0.1)" aria-label="Phóng to bảng tổng kết">A+</button>
      </span>
    </div>
    <div id="dmt-sum-wrap" style="--dmtscale:${dmtScale};font-size:calc(14.5px * var(--dmtscale));line-height:1.5;overflow-x:auto">
      ${bangTongKet}
      <p class="info-note" style="margin-top:10px;font-size:calc(13px * var(--dmtscale));line-height:1.5">Nguồn: bảng "40 đề mục thiền chỉ phân theo thiền và tánh nết" — Abhidhammatthasaṅgaha ch. IX (tr. 545); "Thanh Tịnh Đạo Giảng Giải — Giới và Định" đv. 117 (22 đề mục có quang tướng; 12 đề mục lấy pháp thực tính làm cảnh; 6 đề mục còn lại cảnh không xếp loại như vậy). Số lượng mục ① đếm theo dấu x từng cột thiền trong bảng gốc: một đề mục đắc nhiều tầng được tính ở mọi tầng nó đạt tới.</p>
    </div>
  `;
}
function openDeMucThien(gi, ii){
  const g = DEMUC_THIEN[gi], it = g.items[ii];
  let stt = 0;
  for(let i=0;i<gi;i++) stt += DEMUC_THIEN[i].items.length;
  stt += ii + 1;
  showAttrSheet(`
    <div class="sheet-head"><h2>${stt}. ${it.ten}</h2></div>
    <p class="sheet-pali">${it.pali}</p>
    <div class="sec"><div class="sec-label">Nhóm đề mục</div><div class="sec-body">${g.ten}</div></div>
    <div class="sec"><div class="sec-label">Mức định chứng đắc</div><div class="sec-body">${DMT_MUC_LABEL[it.muc]}.</div></div>
    <div class="sec"><div class="sec-label">Ấn tướng (Nimitta)</div><div class="sec-body">${DMT_NIMITTA_LABEL[it.nimitta]}</div></div>
    <div class="sec"><div class="sec-label">Tánh nết phù hợp</div><div class="sec-body">${it.tanh}.</div></div>
  `);
}


// ===== Chỉnh sửa nội dung (bảng chi tiết + trang) =====
let contentEdits = (function(){ try{ return JSON.parse(localStorage.getItem('quyen22-edits')||'{}'); }catch(e){ return {}; } })();
function saveEditsStore(){ try{ localStorage.setItem('quyen22-edits', JSON.stringify(contentEdits)); }catch(e){ alert('Không lưu được chỉnh sửa (bộ nhớ trình duyệt có thể đã đầy).'); } }
let editingTarget = null;      // 'sheet' | 'page' | null
let editBackupHTML = '';
let sheetOriginalHTML = '';    // HTML gốc của bảng chi tiết đang mở (trước khi áp bản sửa)
let pageOriginalHTML = '';     // HTML gốc của trang hiện tại (trước khi áp bản sửa)
let applyingOverride = false;

function editTargetEl(t){ return t==='sheet' ? document.getElementById('sheet-content') : document.getElementById('extra-content'); }
function sheetEditKey(){
  const sc = document.getElementById('sheet-content');
  const h2 = sc.querySelector('h2');
  const t = h2 ? h2.textContent.trim() : sc.textContent.trim().slice(0,60);
  return 'sheet:' + currentSection + ':' + t;
}
function pageEditKey(){ return 'page:' + currentSection; }
function currentEditKey(t){ return t==='sheet' ? sheetEditKey() : pageEditKey(); }

function updateEditCtrls(){
  const cfg = [
    ['sheet', document.getElementById('sheet-content')],
    ['page', document.getElementById('extra-content')]
  ];
  cfg.forEach(([t, el])=>{
    const ed = document.getElementById(t+'-edit-btn');
    const rs = document.getElementById(t+'-restore-btn');
    const sv = document.getElementById(t+'-save-btn');
    const cc = document.getElementById(t+'-cancel-btn');
    if(!ed) return;
    const editing = editingTarget===t;
    ed.style.display = editing ? 'none' : '';
    sv.style.display = editing ? '' : 'none';
    cc.style.display = editing ? '' : 'none';
    const hasOverride = !editing && el && el.innerHTML.trim() && contentEdits[currentEditKey(t)]!==undefined;
    rs.style.display = hasOverride ? '' : 'none';
    ed.classList.toggle('edited-dot', !!hasOverride);
  });
}

function startEdit(t){
  if(editingTarget) return;
  const el = editTargetEl(t);
  if(!el || !el.innerHTML.trim()){ alert('Trang này không có nội dung văn bản để sửa trực tiếp.'); return; }
  editingTarget = t;
  editBackupHTML = el.innerHTML;
  el.setAttribute('contenteditable','true');
  el.classList.add('editing-content');
  el.focus();
  updateEditCtrls();
}
function finishEditUI(el){
  el.removeAttribute('contenteditable');
  el.classList.remove('editing-content');
  editingTarget = null;
  updateEditCtrls();
}
function saveEdit(){
  if(!editingTarget) return;
  const t = editingTarget, el = editTargetEl(t);
  const k = currentEditKey(t);
  if(el.innerHTML === (t==='sheet' ? sheetOriginalHTML : pageOriginalHTML) && contentEdits[k]===undefined){
    finishEditUI(el); return; // không đổi gì
  }
  contentEdits[k] = el.innerHTML;
  saveEditsStore();
  finishEditUI(el);
}
function cancelEdit(){
  if(!editingTarget) return;
  const el = editTargetEl(editingTarget);
  el.innerHTML = editBackupHTML;
  finishEditUI(el);
}
function restoreEdit(t){
  const k = currentEditKey(t);
  if(contentEdits[k]===undefined) return;
  if(!confirm('Khôi phục nội dung gốc của ' + (t==='sheet'?'bảng này':'trang này') + '? Bản sửa sẽ bị xóa.')) return;
  delete contentEdits[k];
  saveEditsStore();
  const el = editTargetEl(t);
  const orig = t==='sheet' ? sheetOriginalHTML : pageOriginalHTML;
  if(orig){ applyingOverride = true; el.innerHTML = orig; applyingOverride = false; }
  updateEditCtrls();
}

// Áp bản sửa cho bảng chi tiết mỗi khi nội dung mới được đổ vào
(function(){
  const sc = document.getElementById('sheet-content');
  new MutationObserver(()=>{
    if(applyingOverride || editingTarget==='sheet') return;
    const k = sheetEditKey();
    if(contentEdits[k]!==undefined && sc.innerHTML===contentEdits[k]){ updateEditCtrls(); return; }
    sheetOriginalHTML = sc.innerHTML;
    if(contentEdits[k]!==undefined){
      applyingOverride = true;
      sc.innerHTML = contentEdits[k];
      applyingOverride = false;
    }
    updateEditCtrls();
  }).observe(sc, {childList:true});
})();

// Áp bản sửa cho trang (gọi sau mỗi lần render trang)
function applyPageOverride(){
  const el = document.getElementById('extra-content');
  if(!el) return;
  if(editingTarget==='page') return;
  pageOriginalHTML = el.innerHTML;
  const k = pageEditKey();
  if(el.innerHTML.trim() && contentEdits[k]!==undefined && el.innerHTML!==contentEdits[k]){
    applyingOverride = true;
    el.innerHTML = contentEdits[k];
    applyingOverride = false;
  }
  updateEditCtrls();
}

// Khi đang sửa: chặn các thao tác chạm (mở bảng, nút bấm) bên trong vùng sửa
document.addEventListener('click', function(e){
  if(!editingTarget) return;
  const container = editTargetEl(editingTarget);
  if(container && container.contains(e.target) && e.target.closest('[onclick]')){
    e.preventDefault(); e.stopPropagation();
  }
}, true);

// Đóng bảng khi đang sửa → hỏi trước
const _origCloseSheet = closeSheet;
closeSheet = function(){
  if(editingTarget==='sheet'){
    if(!confirm('Đang sửa nội dung — đóng và bỏ thay đổi chưa lưu?')) return;
    cancelEdit();
  }
  _origCloseSheet();
};

function clearAllEdits(){
  const n = Object.keys(contentEdits).length;
  if(!n){ alert('Chưa có mục nào được sửa.'); return; }
  if(!confirm('Xóa tất cả ' + n + ' mục đã sửa và trở về nội dung gốc?')) return;
  contentEdits = {};
  saveEditsStore();
  switchSection(currentSection);
  alert('Đã xóa toàn bộ chỉnh sửa.');
}


// Bọc switchSection để áp bản sửa trang sau mỗi lần render
const _origSwitchSection = switchSection;
switchSection = function(s){
  _origSwitchSection(s);
  if(typeof applyPageOverride==='function') applyPageOverride();
};

// ===== Khởi tạo app (đặt cuối file để mọi const dữ liệu đã sẵn sàng) =====
renderSectionSwitch();
applyLangMode();
switchSection('home'); // Luôn mở app ở Trang đầu


// ===== Tên đầy đủ + định nghĩa ngắn cho Tâm =====
function cittaFullName(c){
  return 'Tâm ' + c.name;
}
function glossCitta(c){
  const n = c.name, g = c.groupLabel || '';
  if(g.startsWith('Bất thiện')){
    const goc = n.startsWith('Tham') ? 'gốc Tham' : n.startsWith('Sân') ? 'gốc Sân' : 'gốc Si';
    return 'tâm bất thiện ' + goc + ', tạo nghiệp xấu';
  }
  if(g.startsWith('Vô nhân')){
    if(n.includes('quả')) return 'tâm quả vô nhân — kết quả của nghiệp, không có nhân tương ưng';
    return 'tâm duy tác vô nhân — chỉ làm phận sự, không tạo nghiệp';
  }
  if(g.startsWith('Dục giới Tịnh hảo')){
    if(n.startsWith('Thiện')) return 'tâm đại thiện dục giới, tạo nghiệp lành';
    if(n.startsWith('Quả')) return 'tâm đại quả dục giới — quả của đại thiện';
    return 'tâm đại duy tác dục giới — tâm của bậc Alahán';
  }
  if(g.startsWith('Sắc giới')){
    const loai = n.startsWith('Thiện') ? 'thiện' : n.startsWith('Quả') ? 'quả' : 'duy tác';
    return 'tâm thiền Sắc giới (' + loai + '), chứng đắc bằng thiền định';
  }
  if(g.startsWith('Vô Sắc giới')){
    const loai = n.startsWith('Thiện') ? 'thiện' : n.startsWith('Quả') ? 'quả' : 'duy tác';
    return 'tâm thiền Vô sắc giới (' + loai + '), lấy cảnh vô sắc';
  }
  if(g.startsWith('Siêu thế')){
    return n.includes('Đạo') ? 'tâm Đạo siêu thế — sát-na đoạn trừ phiền não, lấy Níp-bàn làm cảnh'
                             : 'tâm Quả siêu thế — hưởng quả giải thoát, lấy Níp-bàn làm cảnh';
  }
  return 'tâm';
}


function importAppData(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const data = JSON.parse(ev.target.result);
      let applied = [];
      const cd = data.cai_dat || {};
      if(cd.ngon_ngu){
        try{ localStorage.setItem('quyen22-lang', cd.ngon_ngu); }catch(e){}
        applyLangMode(); applied.push('ngôn ngữ');
      }
      if(cd.co_chu_tung_trang && typeof fontScales!=='undefined'){
        Object.assign(fontScales, cd.co_chu_tung_trang);
        try{ localStorage.setItem('quyen22-fontscales', JSON.stringify(fontScales)); }catch(e){}
        applyFontScale(); applied.push('cỡ chữ từng trang');
      }
      if(cd.co_chu_bang_chi_tiet && typeof sheetScale!=='undefined'){
        sheetScale = cd.co_chu_bang_chi_tiet; applySheetScale(); applied.push('cỡ chữ bảng chi tiết');
      }
      if(cd.co_chu_tom_luoc_duyen && typeof tomluocScale!=='undefined'){
        tomluocScale = cd.co_chu_tom_luoc_duyen;
        try{ localStorage.setItem('quyen22-tomluoc-scale', String(tomluocScale)); }catch(e){}
        applied.push('cỡ chữ bản tóm lược duyên');
      }
      if(cd.co_chu_tong_ket_de_muc && typeof dmtScale!=='undefined'){
        dmtScale = cd.co_chu_tong_ket_de_muc;
        try{ localStorage.setItem('quyen22-dmt-scale', String(dmtScale)); }catch(e){}
        applied.push('cỡ chữ bảng tổng kết đề mục thiền');
      }
      if(cd.trang_hien_tai){
        try{ localStorage.setItem('quyen22-section', cd.trang_hien_tai); }catch(e){}
      }
      if(data.noi_dung_da_sua && typeof data.noi_dung_da_sua==='object'){
        Object.assign(contentEdits, data.noi_dung_da_sua);
        saveEditsStore();
        applyPageOverride();
        applied.push('các nội dung đã sửa (' + Object.keys(data.noi_dung_da_sua).length + ' mục)');
      }
      alert(applied.length ? ('Đã nhập và khôi phục: ' + applied.join(', ') + '.')
        : 'Tệp hợp lệ nhưng không có phần cài đặt để khôi phục (dữ liệu giáo pháp của app là bản dựng sẵn, không bị ghi đè).');
      openSettingsSheet();
    }catch(err){
      alert('Tệp không hợp lệ — cần tệp JSON đã xuất từ app này.');
    }
    input.value = '';
  };
  reader.readAsText(file, 'utf-8');
}

// ===== ĐỒNG BỘ ĐÁM MÂY (Firebase Firestore) — đồng bộ các mục đã chỉnh sửa + cài đặt giữa các thiết bị =====
// Dùng chung Firebase project với app Thiền / Cúng dường; document có tiền tố AB- trong collection 'syncs'.
const AB_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDvIFgBq0PmZ4fjWu0RUSZAgh_V5N58G0",
  authDomain: "daily-meditation-d6bdf.firebaseapp.com",
  projectId: "daily-meditation-d6bdf",
  storageBucket: "daily-meditation-d6bdf.firebasestorage.app",
  messagingSenderId: "619038884675",
  appId: "1:619038884675:web:4db3c469bb5f70c899a5f6"
};
let abDb=null, abUnsub=null, abSyncCode='', abEcho=false, abTimer=null, abConflict=null, abUpdatedAt=0, abLastPayload='', abApplying=false;
try{ abSyncCode = localStorage.getItem('quyen22-sync-code') || ''; }catch(e){}
try{ abUpdatedAt = parseInt(localStorage.getItem('quyen22-updated-at')||'0',10) || 0; }catch(e){}

function abToast(msg){
  let t = document.getElementById('ab-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'ab-toast';
    t.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);background:#2c2620;color:#fff8ec;padding:10px 18px;border-radius:24px;font-size:13px;font-weight:600;z-index:999;max-width:88vw;text-align:center;opacity:0;transition:.25s;pointer-events:none';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(abToast._t);
  abToast._t = setTimeout(()=>{ t.style.opacity='0'; }, 2600);
}
function abErr(msg){
  const st = document.getElementById('ab-sync-status');
  if(st){ st.textContent = msg; st.style.color = '#b3261e'; }
  abToast(msg);
}
function abInitFirebase(){
  if(typeof firebase==='undefined') return false;
  try{ if(!abDb){ if(!firebase.apps.length) firebase.initializeApp(AB_FIREBASE_CONFIG); abDb = firebase.firestore(); } return true; }
  catch(e){ console.error(e); return false; }
}
function abPackState(){
  return JSON.stringify({
    edits: contentEdits,
    caiDat: {
      ngon_ngu: getLangMode(),
      co_chu_tung_trang: (typeof fontScales!=='undefined')?fontScales:{},
      co_chu_bang_chi_tiet: (typeof sheetScale!=='undefined')?sheetScale:1,
      co_chu_tom_luoc_duyen: (typeof tomluocScale!=='undefined')?tomluocScale:1,
      co_chu_tong_ket: (typeof tkScale!=='undefined')?tkScale:1,
      co_chu_tong_ket_de_muc: (typeof dmtScale!=='undefined')?dmtScale:1
    }
  });
}
function abSummary(st){
  const n = st && st.edits ? Object.keys(st.edits).length : 0;
  const lang = st && st.caiDat && st.caiDat.ngon_ngu ? st.caiDat.ngon_ngu : '—';
  return {count:n, lang:lang};
}
function abStamp(t){ abUpdatedAt = t || Date.now(); try{ localStorage.setItem('quyen22-updated-at', String(abUpdatedAt)); }catch(e){} }
function abApplyRemote(remote, updatedAt){
  abApplying = true;
  try{
  contentEdits = (remote && remote.edits) || {};
  try{ localStorage.setItem('quyen22-edits', JSON.stringify(contentEdits)); }catch(e){}
  const cd = (remote && remote.caiDat) || {};
  try{
    if(cd.ngon_ngu){ localStorage.setItem('quyen22-lang', cd.ngon_ngu); applyLangMode(); }
    if(cd.co_chu_tung_trang && typeof fontScales!=='undefined'){ fontScales = cd.co_chu_tung_trang; localStorage.setItem('quyen22-fontscales', JSON.stringify(fontScales)); }
    if(cd.co_chu_bang_chi_tiet && typeof sheetScale!=='undefined'){ sheetScale = cd.co_chu_bang_chi_tiet; }
    if(cd.co_chu_tom_luoc_duyen && typeof tomluocScale!=='undefined'){ tomluocScale = cd.co_chu_tom_luoc_duyen; try{localStorage.setItem('quyen22-tomluoc-scale',String(tomluocScale));}catch(e){} }
    if(cd.co_chu_tong_ket && typeof tkScale!=='undefined'){ tkScale = cd.co_chu_tong_ket; try{localStorage.setItem('quyen22-tk-scale',String(tkScale));}catch(e){} }
    if(cd.co_chu_tong_ket_de_muc && typeof dmtScale!=='undefined'){ dmtScale = cd.co_chu_tong_ket_de_muc; try{localStorage.setItem('quyen22-dmt-scale',String(dmtScale));}catch(e){} }
    if(typeof applyFontScale==='function') applyFontScale();
    if(typeof applySheetScale==='function') applySheetScale();
  }catch(e){ console.error(e); }
  abStamp(updatedAt);
  abLastPayload = abPackState();
  try{ switchSection(currentSection); }catch(e){}
  } finally { abApplying = false; }
}
function abPush(){
  if(!abSyncCode||!abDb) return;
  const payload = abPackState();
  if(payload===abLastPayload && abUpdatedAt>0) return; // không có gì mới thì không đẩy
  abStamp();
  abLastPayload = payload;
  abEcho = true;
  abDb.collection('syncs').doc('AB-'+abSyncCode).set({payload:payload, updatedAt:abUpdatedAt},{merge:true})
    .catch(function(e){ console.error(e); abErr('Lỗi ghi đám mây: '+(e&&e.message||e)); });
}
function queueCloudSave(){
  if(!abSyncCode||abConflict||abApplying) return;
  clearTimeout(abTimer);
  abTimer = setTimeout(abPush, 900);
}
function abAttach(ref){
  abUpdateSyncBtn();
  abUnsub = ref.onSnapshot(function(doc){
    if(!doc.exists || abConflict) return;
    if(abEcho){ abEcho=false; return; }
    const remote = doc.data();
    if(!remote || !remote.updatedAt || remote.updatedAt<=abUpdatedAt) return;
    let remoteST=null;
    try{ remoteST=JSON.parse(remote.payload); }catch(e){ return; }
    const l=abSummary(JSON.parse(abPackState())), r=abSummary(remoteST);
    if(r.count===0 && l.count>0){
      abConflict={remoteST:remoteST, ref:ref};
      abUpdateSyncBtn();
      abToast('⚠️ Đám mây báo không có mục chỉnh sửa nào — đã CHẶN để bảo vệ dữ liệu máy này. Mở phần Đồng bộ để xử lý.');
      return;
    }
    abApplyRemote(remoteST, remote.updatedAt);
    abToast('☁️ Đã nhận cập nhật từ thiết bị khác');
  }, function(err){ console.error(err); abErr('Lỗi đồng bộ: '+(err&&err.message||err)); });
}
function abConnect(code, silent){
  code=(code||'').trim().toUpperCase();
  if(!code){ if(!silent)abToast('Nhập hoặc tạo mã trước'); return; }
  if(!abInitFirebase()){ abErr('⚠️ Không tải được Firebase — kiểm tra kết nối mạng rồi thử lại'); return; }
  abSyncCode=code; try{ localStorage.setItem('quyen22-sync-code', abSyncCode); }catch(e){}
  if(abUnsub){ abUnsub(); abUnsub=null; }
  abConflict=null;
  const st0=document.getElementById('ab-sync-status'); if(st0){ st0.style.color=''; st0.textContent='Đang kết nối…'; }
  const ref = abDb.collection('syncs').doc('AB-'+abSyncCode);
  ref.get().then(function(doc){
    if(!doc.exists){
      abLastPayload=''; abPush(); abAttach(ref);
      if(!silent){ abToast('✓ Đã kết nối — đã tải dữ liệu máy này lên đám mây'); openSyncSheet(); }
      return;
    }
    let remoteST=null;
    try{ remoteST=JSON.parse(doc.data().payload); }catch(e){ remoteST={edits:{}}; }
    const l=abSummary(JSON.parse(abPackState())), r=abSummary(remoteST);
    if(l.count===0 && r.count>0){
      abApplyRemote(remoteST, doc.data().updatedAt); abAttach(ref);
      if(!silent){ abToast('☁️ Đã tải dữ liệu từ đám mây về máy này'); openSyncSheet(); }
    }else if(l.count>0 && r.count===0){
      abLastPayload=''; abPush(); abAttach(ref);
      if(!silent){ abToast('✓ Đã đẩy dữ liệu máy này lên đám mây'); openSyncSheet(); }
    }else if(l.count===0 && r.count===0){
      abApplyRemote(remoteST, doc.data().updatedAt); abAttach(ref);
      if(!silent){ abToast('✓ Đã kết nối'); openSyncSheet(); }
    }else{
      // Cả hai bên đều có dữ liệu — so sánh trước, KHÔNG hỏi nếu không thật sự khác nhau
      const remoteUp = doc.data().updatedAt || 0;
      if(doc.data().payload === abPackState()){
        // Giống hệt nhau -> chỉ kết nối
        abStamp(Math.max(abUpdatedAt, remoteUp));
        abLastPayload = abPackState();
        abAttach(ref);
        if(!silent){ abToast('✓ Đã kết nối — dữ liệu hai bên giống nhau'); openSyncSheet(); }
      }else if(remoteUp > abUpdatedAt){
        // Mây mới hơn (thiết bị khác vừa sửa) -> tải về
        abApplyRemote(remoteST, remoteUp); abAttach(ref);
        if(!silent){ abToast('☁️ Đã nhận bản mới hơn từ đám mây'); openSyncSheet(); }
      }else if(remoteUp < abUpdatedAt){
        // Máy này mới hơn -> đẩy lên
        abLastPayload=''; abPush(); abAttach(ref);
        if(!silent){ abToast('✓ Đã đẩy bản mới hơn của máy này lên đám mây'); openSyncSheet(); }
      }else{
        // Cùng mốc thời gian mà nội dung khác -> xung đột thật, mới cần hỏi
        abConflict={remoteST:remoteST, ref:ref};
        abUpdateSyncBtn();
        if(silent){ abToast('⚠️ Dữ liệu máy và đám mây khác nhau — mở ⚙ Cài đặt → Đồng bộ để chọn bên giữ lại'); }
        else openSyncSheet();
      }
    }
  }).catch(function(err){
    console.error(err);
    let m=(err&&err.message)||String(err);
    if(err&&err.code==='permission-denied') m='Bị từ chối quyền (permission-denied) — cần mở quyền ghi trong Firestore Rules.';
    abErr('Lỗi kết nối: '+m);
  });
}
function abKeepLocal(){
  if(!abConflict)return;
  const ref=abConflict.ref;
  abConflict=null;
  abLastPayload=''; abPush(); abAttach(ref);
  abToast('✓ Đã giữ dữ liệu máy này — đã ghi đè lên đám mây');
  openSyncSheet();
}
function abKeepRemote(){
  if(!abConflict)return;
  const ref=abConflict.ref, remoteST=abConflict.remoteST;
  abConflict=null;
  abApplyRemote(remoteST, Date.now());
  abLastPayload=''; abPush();
  abAttach(ref);
  abToast('✓ Đã dùng dữ liệu từ đám mây');
  openSyncSheet();
}
function abDisconnect(){
  if(abUnsub){ abUnsub(); abUnsub=null; }
  setTimeout(abUpdateSyncBtn,0);
  abSyncCode=''; abConflict=null;
  try{ localStorage.removeItem('quyen22-sync-code'); }catch(e){}
  abToast('Đã ngắt đồng bộ — dữ liệu trên đám mây vẫn còn');
  openSyncSheet();
}
function abUpdateSyncBtn(){
  const it=document.getElementById('ab-sync-item');
  const dot=document.getElementById('ab-sync-dot');
  const st = abConflict ? 'warn' : (abSyncCode&&abDb ? 'on' : '');
  if(it){
    it.classList.remove('on','warn');
    if(st) it.classList.add(st);
    it.textContent = st==='warn' ? '⚠️ Đồng bộ — cần xử lý' : (st==='on' ? '☁️ Đồng bộ — Đang bật' : '☁️ Đồng bộ đám mây');
    it.title = st==='warn' ? 'Có khác biệt dữ liệu — chạm để xử lý' : (st==='on' ? ('Đang đồng bộ — mã: '+abSyncCode) : 'Đồng bộ đám mây (chưa bật)');
  }
  if(dot){
    dot.classList.remove('on','warn');
    if(st) dot.classList.add(st);
  }
}
function abGenCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c='';
  for(let i=0;i<10;i++)c+=chars[Math.floor(Math.random()*chars.length)];
  const inp=document.getElementById('ab-sync-code-input'); if(inp) inp.value=c;
}
function openSyncSheet(){
  const qb='padding:9px 6px;border:none;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit';
  let conflictHtml='';
  if(abConflict){
    const l=abSummary(JSON.parse(abPackState())), r=abSummary(abConflict.remoteST);
    conflictHtml=`<div style="margin-top:12px;padding:12px;border:1.5px solid #c0503e;border-radius:10px;background:rgba(192,80,62,.1)">
      <div style="font-size:13px;line-height:1.55">⚠️ <b>Phát hiện khác biệt dữ liệu</b> — chưa tự động đồng bộ để tránh mất dữ liệu.<br><br>
      Máy này: <b>${l.count}</b> mục đã sửa · ngôn ngữ: ${l.lang}<br>
      Đám mây: <b>${r.count}</b> mục đã sửa · ngôn ngữ: ${r.lang}<br><br>
      Chọn bên bạn muốn <b>giữ lại</b> (bên còn lại sẽ bị thay thế):</div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button style="${qb};flex:1;background:var(--card);color:var(--ink);border:1px solid rgba(128,128,128,.4)" onclick="abKeepLocal()">📱 Giữ máy này</button>
        <button style="${qb};flex:1;background:var(--card);color:var(--ink);border:1px solid rgba(128,128,128,.4)" onclick="abKeepRemote()">☁️ Giữ đám mây</button>
      </div>
    </div>`;
  }
  const status = abConflict ? '' : (abSyncCode ? ('✓ Đang đồng bộ — mã: '+abSyncCode) : 'Chưa kết nối');
  document.getElementById('sheet-content').innerHTML = `
    <div class="sheet-head"><h2>☁️ Đồng bộ nhiều thiết bị</h2></div>
    <p class="sheet-pali">Đồng bộ các mục bạn đã chỉnh sửa và cài đặt hiển thị giữa các thiết bị, kèm bản lưu dự phòng trên đám mây.</p>
    <div class="sec"><div class="sec-label">Mã đồng bộ</div>
      <input type="text" id="ab-sync-code-input" value="${abSyncCode}" placeholder="VD: SAM2026AB" maxlength="14"
        style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid rgba(128,128,128,.5);border-radius:10px;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:var(--card);color:var(--ink);font-family:inherit">
      <div style="display:flex;gap:8px;margin-top:10px">
        <button style="${qb};flex:1;background:var(--card);color:var(--ink);border:1px solid rgba(128,128,128,.4)" onclick="abGenCode()">🎲 Tạo mã mới</button>
        <button style="${qb};flex:1;background:#1c5b9e;color:#fff" onclick="abConnect(document.getElementById('ab-sync-code-input').value,false)">✓ Kết nối</button>
      </div>
      <div id="ab-sync-status" style="font-size:12.5px;color:var(--ink-soft);margin-top:12px;text-align:center">${status}</div>
      ${conflictHtml}
      <div style="display:flex;gap:8px;margin-top:14px">
        <button style="${qb};flex:1;background:var(--card);color:var(--ink);border:1px solid rgba(128,128,128,.4)" onclick="abDisconnect()">Ngắt kết nối</button>
        <button style="${qb};flex:1;background:var(--card);color:var(--ink);border:1px solid rgba(128,128,128,.4)" onclick="closeSheet()">Đóng</button>
      </div>
    </div>
  `;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}
async function abRequestPersist(){ try{ if(navigator.storage&&navigator.storage.persist){ await navigator.storage.persist(); } }catch(e){} }
function abInitSync(){ if(abSyncCode && abInitFirebase()) abConnect(abSyncCode, true); }
// Nối các thao tác lưu vào hàng đợi đồng bộ
(function(){
  function wrap(name){
    const f = window[name];
    if(typeof f!=='function') return;
    window[name] = function(){ const r=f.apply(this,arguments); try{ queueCloudSave(); }catch(e){} return r; };
  }
  ['saveEditsStore','setLangMode','applyFontScale','applySheetScale','adjustTomLuocScale','adjustTkScale','adjustDmtScale'].forEach(wrap);
})();
abRequestPersist();
setTimeout(abInitSync, 400);
setTimeout(abUpdateSyncBtn, 600);

// ===== SAO LƯU ĐỊNH KỲ LÊN ĐÁM MÂY =====
function abBkFreq(){ try{ return localStorage.getItem('quyen22-bk-freq')||'off'; }catch(e){ return 'off'; } }
function abBkLast(){ try{ return parseInt(localStorage.getItem('quyen22-bk-last')||'0',10)||0; }catch(e){ return 0; } }
function abBkMs(f){ return f==='d'?86400000 : f==='w'?604800000 : f==='m'?2592000000 : 0; }
function abBkFreqLabel(f){ return f==='d'?'hàng ngày' : f==='w'?'hàng tuần' : f==='m'?'hàng tháng' : 'đang tắt'; }
function abBkStatusText(){
  const l=abBkLast();
  return 'Chu kỳ: '+abBkFreqLabel(abBkFreq())+(l?(' · Lần gần nhất: '+new Date(l).toLocaleString('vi-VN')):' · Chưa sao lưu lần nào');
}
function abBkSetFreq(f){
  try{ localStorage.setItem('quyen22-bk-freq',f); }catch(e){}
  openSettingsSheet();
  if(f!=='off') abBkCheckAuto();
}
function abBkDocRef(){ return abDb.collection('syncs').doc('AB-'+abSyncCode+'-BK'); }
function abBkNow(manual){
  if(!abSyncCode||!abDb){ if(manual)abToast('Cần bật Đồng bộ đám mây trước (mục Đồng bộ nhiều thiết bị)'); return; }
  const day=new Date().toISOString().slice(0,10);
  abBkDocRef().get().then(function(doc){
    const sn=(doc.exists&&doc.data().snapshots)||{};
    sn[day]=abPackState();
    const ks=Object.keys(sn).sort();
    while(ks.length>4){ delete sn[ks.shift()]; }
    return abBkDocRef().set({snapshots:sn,updatedAt:Date.now()});
  }).then(function(){
    try{ localStorage.setItem('quyen22-bk-last',String(Date.now())); }catch(e){}
    abToast('✓ Đã sao lưu lên đám mây ('+day+')');
    const st=document.getElementById('ab-bk-status'); if(st) st.textContent=abBkStatusText();
  }).catch(function(e){ abToast('Lỗi sao lưu: '+(e&&e.message||e)); });
}
function abBkCheckAuto(){
  const f=abBkFreq(); if(f==='off')return;
  if(Date.now()-abBkLast() < abBkMs(f)) return;
  if(abSyncCode&&abDb) abBkNow(false);
  else abToast('⏰ Đến hạn sao lưu định kỳ — hãy bật Đồng bộ đám mây hoặc Xuất dữ liệu trong ⚙ Cài đặt');
}
function abBkShowList(){
  if(!abSyncCode||!abDb){ abToast('Cần bật Đồng bộ đám mây trước'); return; }
  const box=document.getElementById('ab-bk-list');
  if(!box) return;
  box.innerHTML='<span style="color:var(--ink-soft)">Đang tải…</span>';
  abBkDocRef().get().then(function(doc){
    const sn=(doc.exists&&doc.data().snapshots)||{};
    const ks=Object.keys(sn).sort().reverse();
    if(!ks.length){ box.innerHTML='<span style="color:var(--ink-soft)">Chưa có bản sao lưu nào.</span>'; return; }
    box.innerHTML=ks.map(function(d){
      let n=0; try{ n=Object.keys(JSON.parse(sn[d]).edits||{}).length; }catch(e){}
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid rgba(128,128,128,.25)">'+
        '<span style="flex:1">📅 '+d+' <span style="color:var(--ink-soft);font-size:.88em">('+n+' mục đã sửa)</span></span>'+
        '<button class="qbtn" style="margin:0" onclick="abBkRestore(\''+d+'\')">Khôi phục</button></div>';
    }).join('');
  }).catch(function(e){ box.innerHTML=''; abToast('Lỗi: '+(e&&e.message||e)); });
}
function abBkRestore(day){
  if(!confirm('Khôi phục từ bản sao lưu ngày '+day+'?\nCác mục đã sửa và cài đặt hiện tại (trên máy và trên đám mây) sẽ bị thay thế bằng bản này.'))return;
  abBkDocRef().get().then(function(doc){
    const sn=(doc.exists&&doc.data().snapshots)||{};
    if(!sn[day]){ abToast('Không tìm thấy bản sao lưu'); return; }
    let st=null; try{ st=JSON.parse(sn[day]); }catch(e){ abToast('Bản sao lưu bị lỗi'); return; }
    abApplyRemote(st, Date.now());
    abLastPayload=''; abPush();
    abToast('✓ Đã khôi phục bản sao lưu '+day);
    openSettingsSheet();
  }).catch(function(e){ abToast('Lỗi: '+(e&&e.message||e)); });
}
setTimeout(abBkCheckAuto, 4500);

// ===== Trang "31 Cõi" (Bhūmi) =====
// Nguồn: "31 Cõi.pdf" + "Tử Sinh Luân Hồi Trong 31 Cõi" + "Ma trận 12 hạng người & cõi giới" (Google Drive)
// Đối chiếu Vīthimuttasaṅgaha — Abhidhammatthasaṅgaha chương V.
const C31_HANG = {
  kho:  {so:1,  ds:'Người Khổ (duggatyahetukapuggala).'},
  vui11:{so:11, ds:'Người Lạc vô nhân, người Nhị nhân, người Tam nhân; 4 người Đạo (Sơ đạo, Nhị đạo, Tam đạo, Tứ đạo); 4 người Quả (Sơ quả, Nhị quả, Tam quả, Tứ quả).'},
  vui10:{so:10, ds:'Người Nhị nhân, người Tam nhân; 4 người Đạo; 4 người Quả. (Không có người Lạc vô nhân — hạng này chỉ có ở cõi Người, Tứ Thiên Vương và Vô tưởng.)'},
  sac9: {so:9,  ds:'Người Tam nhân; 4 người Đạo; 4 người Quả.'},
  votuong:{so:1,ds:'Người Lạc vô nhân (sugatyahetukapuggala) — chúng sinh chỉ có Sắc, không có Danh.'},
  tinhcu:{so:3, ds:'Người Tứ đạo, người Tam quả (Bất lai), người Tứ quả (A-la-hán).'},
  vosac8:{so:8, ds:'Người Tam nhân; người Nhị đạo, Tam đạo, Tứ đạo; 4 người Quả. (Không có người Sơ đạo — vì Sơ đạo phải nương nghe pháp, không sinh khởi lần đầu ở cõi Vô sắc.)'}
};
const C31_NHAN_KHO = 'Ác nghiệp trong 11 tâm bất thiện (trừ tâm Si hợp phóng dật) cho quả tái tục 4 cõi khổ. ';
const C31_NHAN_VUI = 'Đại thiện nghiệp trong 8 tâm Đại thiện dục giới (bố thí, trì giới, tu tiến…). Thiện nghiệp bậc thấp/ly trí → tục sinh người Lạc vô nhân hoặc Nhị nhân; thiện nghiệp hợp trí (tam tư đầy đủ) → tục sinh người Tam nhân.';
const C31_TS_VUI9 = '1 trong 9 tâm: Quan sát thọ xả quả thiện (→ người Lạc vô nhân) hoặc 8 tâm Đại quả — 4 ly trí (→ người Nhị nhân), 4 hợp trí (→ người Tam nhân).';
const C31_TS_VUI8 = '1 trong 8 tâm Đại quả dục giới: 4 ly trí (→ người Nhị nhân), 4 hợp trí (→ người Tam nhân).';
const C31_GHICHU_APAYA = 'Theo tài liệu "31 Cõi": trừ chúng sinh địa ngục (chỉ sống ở địa ngục), 3 loài đọa xứ còn lại (bàng sanh, ngạ quỷ, a-tu-la) có mặt khắp 3 cõi: Tứ Thiên Vương, Nhân loại và Địa ngục.';

const COI31_DATA = [
 // ---- 4 CÕI KHỔ ----
 {ten:'Địa ngục', pali:'Niraya', nhom:'kho',
  gioi:'Dục giới — Khổ cảnh (Apāyabhūmi), cõi thứ 1 trong 4 cõi khổ.',
  tucsinh:'Tâm Quan sát thọ xả quả bất thiện (santīraṇa akusalavipāka upekkhāsahagata) — chỉ 1 tâm.',
  nhan:C31_NHAN_KHO+'Theo TK Hộ Pháp ("Tìm hiểu kiếp kế tiếp"): ác nghiệp trong 2 tâm Sân có khuynh hướng cho quả hóa sinh vào cõi Địa ngục.',
  hang:'kho', ghichu:C31_GHICHU_APAYA},
 {ten:'Bàng sanh', pali:'Tiracchānayoni', nhom:'kho',
  gioi:'Dục giới — Khổ cảnh (Apāyabhūmi), cõi thứ 2 trong 4 cõi khổ.',
  tucsinh:'Tâm Quan sát thọ xả quả bất thiện — chỉ 1 tâm.',
  nhan:C31_NHAN_KHO+'Theo TK Hộ Pháp: ác nghiệp trong tâm Si hợp hoài nghi có khuynh hướng cho quả sinh làm loài bàng sanh (súc sinh).',
  hang:'kho', ghichu:C31_GHICHU_APAYA},
 {ten:'Ngạ quỷ', pali:'Pettivisaya', nhom:'kho',
  gioi:'Dục giới — Khổ cảnh (Apāyabhūmi), cõi thứ 3 trong 4 cõi khổ.',
  tucsinh:'Tâm Quan sát thọ xả quả bất thiện — chỉ 1 tâm.',
  nhan:C31_NHAN_KHO+'Theo TK Hộ Pháp: ác nghiệp trong 8 tâm Tham có khuynh hướng cho quả hóa sinh vào cõi Ngạ quỷ.',
  hang:'kho', ghichu:C31_GHICHU_APAYA},
 {ten:'A-tu-la', pali:'Asurakāya', nhom:'kho',
  gioi:'Dục giới — Khổ cảnh (Apāyabhūmi), cõi thứ 4 trong 4 cõi khổ.',
  tucsinh:'Tâm Quan sát thọ xả quả bất thiện — chỉ 1 tâm.',
  nhan:C31_NHAN_KHO+'Theo TK Hộ Pháp: ác nghiệp trong 8 tâm Tham có khuynh hướng cho quả hóa sinh vào cõi A-tu-la.',
  hang:'kho', ghichu:C31_GHICHU_APAYA},
 // ---- 7 CÕI VUI DỤC GIỚI ----
 {ten:'Nhân loại', pali:'Manussa', nhom:'vui',
  gioi:'Dục giới — Thiện thú (Kāmasugatibhūmi), cõi thứ 1 trong 7 cõi vui Dục giới.',
  tucsinh:C31_TS_VUI9, nhan:C31_NHAN_VUI, hang:'vui11',
  ghichu:'Người Lạc vô nhân ở cõi người là người tục sinh bằng quả thiện vô nhân (đui, điếc, khuyết tật bẩm sinh…).'},
 {ten:'Tứ Thiên Vương', pali:'Cātummahārājikā', nhom:'vui',
  gioi:'Dục giới — Thiện thú, cõi trời thứ 1 trong 6 cõi trời Dục giới.',
  tucsinh:C31_TS_VUI9, nhan:C31_NHAN_VUI, hang:'vui11',
  ghichu:'Cùng với cõi Người, đây là cõi trời duy nhất có người Lạc vô nhân (chư thiên địa cư bậc thấp).'},
 {ten:'Đao Lợi', pali:'Tāvatiṃsā', nhom:'vui',
  gioi:'Dục giới — Thiện thú, cõi trời thứ 2 trong 6 cõi trời Dục giới.',
  tucsinh:C31_TS_VUI8, nhan:C31_NHAN_VUI, hang:'vui10', ghichu:''},
 {ten:'Dạ Ma', pali:'Yāmā', nhom:'vui',
  gioi:'Dục giới — Thiện thú, cõi trời thứ 3 trong 6 cõi trời Dục giới.',
  tucsinh:C31_TS_VUI8, nhan:C31_NHAN_VUI, hang:'vui10', ghichu:''},
 {ten:'Đâu Suất', pali:'Tusitā', nhom:'vui',
  gioi:'Dục giới — Thiện thú, cõi trời thứ 4 trong 6 cõi trời Dục giới.',
  tucsinh:C31_TS_VUI8, nhan:C31_NHAN_VUI, hang:'vui10', ghichu:''},
 {ten:'Hóa Lạc thiên', pali:'Nimmānarati', nhom:'vui',
  gioi:'Dục giới — Thiện thú, cõi trời thứ 5 trong 6 cõi trời Dục giới.',
  tucsinh:C31_TS_VUI8, nhan:C31_NHAN_VUI, hang:'vui10', ghichu:''},
 {ten:'Tha Hóa Tự Tại', pali:'Paranimmitavasavattī', nhom:'vui',
  gioi:'Dục giới — Thiện thú, cõi trời thứ 6 (cao nhất) trong 6 cõi trời Dục giới.',
  tucsinh:C31_TS_VUI8, nhan:C31_NHAN_VUI, hang:'vui10', ghichu:''},
 // ---- 16 CÕI SẮC GIỚI ----
 {ten:'Phạm Chúng thiên', pali:'Brahmapārisajjā', nhom:'sac',
  gioi:'Sắc giới (Rūpāvacarabhūmi) — tầng Sơ thiền, cõi thứ 1 trong 3 cõi Sơ thiền.',
  tucsinh:'Tâm Quả Sơ thiền sắc giới — bậc hạ.',
  nhan:'Đắc Sơ thiền sắc giới bậc hạ (parittā).', hang:'sac9', ghichu:''},
 {ten:'Phạm Phụ thiên', pali:'Brahmapurohitā', nhom:'sac',
  gioi:'Sắc giới — tầng Sơ thiền, cõi thứ 2 trong 3 cõi Sơ thiền.',
  tucsinh:'Tâm Quả Sơ thiền sắc giới — bậc trung.',
  nhan:'Đắc Sơ thiền sắc giới bậc trung (majjhimā).', hang:'sac9', ghichu:''},
 {ten:'Đại Phạm thiên', pali:'Mahābrahmā', nhom:'sac',
  gioi:'Sắc giới — tầng Sơ thiền, cõi thứ 3 trong 3 cõi Sơ thiền.',
  tucsinh:'Tâm Quả Sơ thiền sắc giới — bậc thượng.',
  nhan:'Đắc Sơ thiền sắc giới bậc thượng (paṇītā).', hang:'sac9', ghichu:''},
 {ten:'Thiểu Quang thiên', pali:'Parittābhā', nhom:'sac',
  gioi:'Sắc giới — tầng Nhị thiền, cõi thứ 1 trong 3 cõi Nhị thiền.',
  tucsinh:'Tâm Quả Nhị thiền hoặc Quả Tam thiền sắc giới — bậc hạ (hai thiện nghiệp Nhị thiền và Tam thiền hợp chung cho quả về tầng này).',
  nhan:'Đắc Nhị thiền hoặc Tam thiền sắc giới bậc hạ.', hang:'sac9', ghichu:''},
 {ten:'Vô Lượng Quang thiên', pali:'Appamāṇābhā', nhom:'sac',
  gioi:'Sắc giới — tầng Nhị thiền, cõi thứ 2 trong 3 cõi Nhị thiền.',
  tucsinh:'Tâm Quả Nhị thiền hoặc Quả Tam thiền sắc giới — bậc trung.',
  nhan:'Đắc Nhị thiền hoặc Tam thiền sắc giới bậc trung.', hang:'sac9', ghichu:''},
 {ten:'Quang Âm thiên', pali:'Ābhassarā', nhom:'sac',
  gioi:'Sắc giới — tầng Nhị thiền, cõi thứ 3 trong 3 cõi Nhị thiền.',
  tucsinh:'Tâm Quả Nhị thiền hoặc Quả Tam thiền sắc giới — bậc thượng.',
  nhan:'Đắc Nhị thiền hoặc Tam thiền sắc giới bậc thượng.', hang:'sac9', ghichu:''},
 {ten:'Thiểu Tịnh thiên', pali:'Parittasubhā', nhom:'sac',
  gioi:'Sắc giới — tầng Tam thiền, cõi thứ 1 trong 3 cõi Tam thiền.',
  tucsinh:'Tâm Quả Tứ thiền sắc giới — bậc hạ (theo hệ 5 bậc thiền).',
  nhan:'Đắc Tứ thiền sắc giới bậc hạ.', hang:'sac9', ghichu:''},
 {ten:'Vô Lượng Tịnh thiên', pali:'Appamāṇasubhā', nhom:'sac',
  gioi:'Sắc giới — tầng Tam thiền, cõi thứ 2 trong 3 cõi Tam thiền.',
  tucsinh:'Tâm Quả Tứ thiền sắc giới — bậc trung.',
  nhan:'Đắc Tứ thiền sắc giới bậc trung.', hang:'sac9', ghichu:''},
 {ten:'Biến Tịnh thiên', pali:'Subhakiṇhā', nhom:'sac',
  gioi:'Sắc giới — tầng Tam thiền, cõi thứ 3 trong 3 cõi Tam thiền.',
  tucsinh:'Tâm Quả Tứ thiền sắc giới — bậc thượng.',
  nhan:'Đắc Tứ thiền sắc giới bậc thượng.', hang:'sac9', ghichu:''},
 {ten:'Quảng Quả thiên', pali:'Vehapphalā', nhom:'sac',
  gioi:'Sắc giới — tầng Tứ thiền, 1 trong 7 cõi thuộc tầng Tứ thiền.',
  tucsinh:'Tâm Quả Ngũ thiền sắc giới (theo hệ 5 bậc thiền).',
  nhan:'Đắc Ngũ thiền sắc giới.', hang:'sac9', ghichu:''},
 {ten:'Vô Tưởng thiên', pali:'Asaññasattā', nhom:'sac',
  gioi:'Sắc giới — tầng Tứ thiền, 1 trong 7 cõi thuộc tầng Tứ thiền.',
  tucsinh:'KHÔNG có tâm tục sinh — tục sinh bằng sắc pháp (bọn sắc mạng quyền chín pháp, jīvitanavakakalāpa). Cõi này chỉ có Sắc, không có Danh.',
  nhan:'Đắc Ngũ thiền sắc giới rồi tu tập ly tham đối với tưởng — nhàm chán danh pháp (saññāvirāgabhāvanā), nguyện đời sống không còn tâm.',
  hang:'votuong', ghichu:'Hết tuổi thọ, tưởng khởi lên trở lại thì mệnh chung, tái tục xuống cõi Dục giới.'},
 {ten:'Vô Phiền', pali:'Avihā', nhom:'sac',
  gioi:'Sắc giới — tầng Tứ thiền, cõi thứ 1 trong 5 cõi Tịnh cư (Suddhāvāsa).',
  tucsinh:'Tâm Quả Ngũ thiền sắc giới (của bậc Thánh Bất lai).',
  nhan:'Bậc Thánh Bất lai (Tam quả) đắc Ngũ thiền, có Tín quyền (saddhindriya) trội hơn cả → sinh về cõi Vô Phiền.',
  hang:'tinhcu', ghichu:'Ngũ Tịnh cư là chỗ sinh riêng của bậc Bất lai; đã sinh vào đây không còn trở lui cõi thấp, tuần tự viên tịch tại đây.'},
 {ten:'Vô Nhiệt', pali:'Atappā', nhom:'sac',
  gioi:'Sắc giới — tầng Tứ thiền, cõi thứ 2 trong 5 cõi Tịnh cư.',
  tucsinh:'Tâm Quả Ngũ thiền sắc giới (của bậc Thánh Bất lai).',
  nhan:'Bậc Bất lai đắc Ngũ thiền, có Tấn quyền (vīriyindriya) trội hơn cả → sinh về cõi Vô Nhiệt.',
  hang:'tinhcu', ghichu:''},
 {ten:'Thiện Hiện', pali:'Sudassā', nhom:'sac',
  gioi:'Sắc giới — tầng Tứ thiền, cõi thứ 3 trong 5 cõi Tịnh cư.',
  tucsinh:'Tâm Quả Ngũ thiền sắc giới (của bậc Thánh Bất lai).',
  nhan:'Bậc Bất lai đắc Ngũ thiền, có Niệm quyền (satindriya) trội hơn cả → sinh về cõi Thiện Hiện.',
  hang:'tinhcu', ghichu:''},
 {ten:'Thiện Kiến', pali:'Sudassī', nhom:'sac',
  gioi:'Sắc giới — tầng Tứ thiền, cõi thứ 4 trong 5 cõi Tịnh cư.',
  tucsinh:'Tâm Quả Ngũ thiền sắc giới (của bậc Thánh Bất lai).',
  nhan:'Bậc Bất lai đắc Ngũ thiền, có Định quyền (samādhindriya) trội hơn cả → sinh về cõi Thiện Kiến.',
  hang:'tinhcu', ghichu:''},
 {ten:'Sắc Cứu Cánh', pali:'Akaniṭṭhā', nhom:'sac',
  gioi:'Sắc giới — tầng Tứ thiền, cõi thứ 5 (cao nhất) trong 5 cõi Tịnh cư.',
  tucsinh:'Tâm Quả Ngũ thiền sắc giới (của bậc Thánh Bất lai).',
  nhan:'Bậc Bất lai đắc Ngũ thiền, có Tuệ quyền (paññindriya) trội hơn cả → sinh về cõi Sắc Cứu Cánh.',
  hang:'tinhcu', ghichu:''},
 // ---- 4 CÕI VÔ SẮC ----
 {ten:'Không Vô Biên Xứ', pali:'Ākāsānañcāyatana', nhom:'vosac',
  gioi:'Vô sắc giới (Arūpāvacarabhūmi), cõi thứ 1 trong 4 cõi Vô sắc.',
  tucsinh:'Tâm Quả Không vô biên xứ (1 trong 4 tâm Quả vô sắc).',
  nhan:'Đắc Ngũ thiền sắc giới, nhàm chán sắc pháp, tu đề mục vô sắc và đắc thiền Không vô biên xứ.',
  hang:'vosac8', ghichu:''},
 {ten:'Thức Vô Biên Xứ', pali:'Viññāṇañcāyatana', nhom:'vosac',
  gioi:'Vô sắc giới, cõi thứ 2 trong 4 cõi Vô sắc.',
  tucsinh:'Tâm Quả Thức vô biên xứ.',
  nhan:'Đắc thiền Thức vô biên xứ (sau khi vượt qua Không vô biên xứ).',
  hang:'vosac8', ghichu:''},
 {ten:'Vô Sở Hữu Xứ', pali:'Ākiñcaññāyatana', nhom:'vosac',
  gioi:'Vô sắc giới, cõi thứ 3 trong 4 cõi Vô sắc.',
  tucsinh:'Tâm Quả Vô sở hữu xứ.',
  nhan:'Đắc thiền Vô sở hữu xứ.',
  hang:'vosac8', ghichu:''},
 {ten:'Phi Tưởng Phi Phi Tưởng Xứ', pali:'Nevasaññānāsaññāyatana', nhom:'vosac',
  gioi:'Vô sắc giới, cõi thứ 4 (cao nhất trong 31 cõi) trong 4 cõi Vô sắc.',
  tucsinh:'Tâm Quả Phi tưởng phi phi tưởng xứ.',
  nhan:'Đắc thiền Phi tưởng phi phi tưởng xứ.',
  hang:'vosac8', ghichu:''}
];

function renderCoi31Page(){
  const extra = document.getElementById('extra-content');
  const CLS = {kho:'circle-bt', vui:'circle-tt', sac:'circle-sac', vosac:'circle-vt'};
  const circle = (d,i)=>`<div class="circle ${CLS[d.nhom]}" onclick="openCoi31Sheet(${i})">
    <div class="cp" style="font-weight:800">${i+1}</div><div class="cn">${d.ten}</div><div class="cp">${d.pali}</div></div>`;
  const group = (title, from, to)=>`
    <div class="group-head">${title}</div>
    <div class="circle-grid">${COI31_DATA.slice(from,to).map((d,k)=>circle(d,from+k)).join('')}</div>`;
  extra.innerHTML = `
    <p class="info-note" style="margin-bottom:12px">31 cõi (bhūmi) chia theo 3 giới: 11 cõi Dục giới (4 khổ cảnh + 7 thiện thú), 16 cõi Sắc giới (theo tầng thiền) và 4 cõi Vô sắc giới. Chạm vào từng cõi để xem: thuộc cõi giới nào · tâm tục sinh · nguyên nhân tái tục · những hạng người có mặt (trong 12 hạng người).</p>
    ${group('4 Cõi Khổ — Apāyabhūmi (Dục giới)', 0, 4)}
    ${group('7 Cõi Vui Dục Giới — Kāmasugatibhūmi', 4, 11)}
    ${group('16 Cõi Sắc Giới — Rūpāvacarabhūmi · Sơ thiền (1–3), Nhị thiền (4–6), Tam thiền (7–9), Tứ thiền (10–16)', 11, 27)}
    ${group('4 Cõi Vô Sắc Giới — Arūpāvacarabhūmi', 27, 31)}
    <p class="info-note" style="margin-top:14px">Nguồn: tổng hợp theo tài liệu "31 Cõi", "Tử Sinh Luân Hồi Trong 31 Cõi" và "Ma trận 12 hạng người &amp; cõi giới" (tư liệu cá nhân); đối chiếu Vīthimuttasaṅgaha — Abhidhammatthasaṅgaha chương V.</p>
    ${tkCoi31()}
  `;
}

function openCoi31Sheet(i){
  const d = COI31_DATA[i];
  const h = C31_HANG[d.hang];
  const html = `
    <div class="sheet-head"><h2>${i+1}. ${d.ten}</h2></div>
    <p class="sheet-pali">${d.pali}</p>
    <div class="sec"><div class="sec-label">Thuộc cõi giới nào</div><div class="sec-body">${d.gioi}</div></div>
    <div class="sec"><div class="sec-label">Tâm tục sinh (Paṭisandhicitta)</div><div class="sec-body">${d.tucsinh}</div></div>
    <div class="sec"><div class="sec-label">Nguyên nhân tái tục về cõi này</div><div class="sec-body">${d.nhan}</div></div>
    <div class="sec"><div class="sec-label">Hạng người — có ${h.so}/12 hạng</div><div class="sec-body">${h.ds}</div></div>
    ${d.ghichu ? `<div class="info-note"><b>Ghi chú:</b> ${d.ghichu}</div>` : ''}
  `;
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet').classList.add('show');
  document.getElementById('sheet-backdrop').classList.add('show');
}

function tkCoi31(){
  const rows =
    tkRow('1','4 cõi Khổ','Apāya — Dục giới','1 tâm','Tục sinh: Quan sát thọ xả quả bất thiện. Nhân: ác nghiệp trong 11 tâm bất thiện. Hạng người: 1 (Người Khổ).')+
    tkRow('2','Người · Tứ Thiên Vương','Kāmasugati','9 tâm','Tục sinh: Quan sát thọ xả quả thiện + 8 Đại quả. Nhân: 8 đại thiện nghiệp dục giới. Hạng người: 11 (trừ Người Khổ).')+
    tkRow('3','5 cõi trời Dục còn lại','Đao Lợi → Tha Hóa Tự Tại','8 tâm','Tục sinh: 8 Đại quả. Nhân: 8 đại thiện nghiệp dục giới. Hạng người: 10 (trừ Người Khổ, Lạc vô nhân).')+
    tkRow('4','3 cõi Sơ thiền','Pathamajjhānabhūmi','1 tâm','Tục sinh: Quả Sơ thiền (bậc hạ/trung/thượng → 3 cõi). Nhân: đắc Sơ thiền. Hạng người: 9 (Tam nhân + 8 Thánh).')+
    tkRow('5','3 cõi Nhị thiền','Dutiyajjhānabhūmi','2 tâm','Tục sinh: Quả Nhị thiền &amp; Quả Tam thiền (bậc hạ/trung/thượng). Nhân: đắc Nhị hoặc Tam thiền. Hạng người: 9.')+
    tkRow('6','3 cõi Tam thiền','Tatiyajjhānabhūmi','1 tâm','Tục sinh: Quả Tứ thiền (bậc hạ/trung/thượng). Nhân: đắc Tứ thiền. Hạng người: 9.')+
    tkRow('7','Quảng Quả','Vehapphalā','1 tâm','Tục sinh: Quả Ngũ thiền. Nhân: đắc Ngũ thiền. Hạng người: 9.')+
    tkRow('8','Vô Tưởng','Asaññasattā','0 tâm','Tục sinh bằng SẮC (bọn sắc mạng quyền), không có tâm. Nhân: Ngũ thiền + ly tham tưởng. Hạng người: 1 (Lạc vô nhân).')+
    tkRow('9','5 cõi Tịnh Cư','Suddhāvāsa','1 tâm','Tục sinh: Quả Ngũ thiền của bậc Bất lai; chia 5 cõi theo quyền trội (Tín·Tấn·Niệm·Định·Tuệ). Hạng người: 3 (Tứ đạo, Tam quả, Tứ quả).')+
    tkRow('10','4 cõi Vô sắc','Arūpāvacarabhūmi','4 tâm','Tục sinh: 4 tâm Quả vô sắc tương ứng từng cõi. Nhân: đắc thiền Vô sắc tương ứng. Hạng người: 8 (Tam nhân + 7 Thánh, trừ Sơ đạo).');
  return tkBlock('Tổng kết — 31 Cõi', 'Tổng cộng 19 tâm tục sinh (2 Quan sát + 8 Đại quả + 5 Quả sắc giới + 4 Quả vô sắc) dẫn về 30 cõi hữu tâm, cùng 1 lối tục sinh bằng sắc về cõi Vô tưởng.', rows,
    'Bậc quả thiền chia hạ/trung/thượng quyết định sinh về cõi thấp/giữa/cao của mỗi tầng thiền (theo "Tử Sinh Luân Hồi Trong 31 Cõi").');
}

// ===== Trang đầu (Home) =====
function renderHomePage(){
  const extra = document.getElementById('extra-content');
  extra.innerHTML = `
    <div style="min-height:56vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:24px 16px">
      <div style="position:relative;width:210px;height:210px;border-radius:50%;overflow:hidden;border:2.5px solid rgba(176,106,40,.6);box-shadow:0 18px 34px rgba(60,40,10,.4),0 4px 12px rgba(255,255,255,.5) inset">
        <img src="home-buddha4.jpg" alt="Abhidhamma" style="width:100%;height:100%;object-fit:cover;display:block">
        <div style="position:absolute;inset:0;border-radius:50%;pointer-events:none;background:radial-gradient(ellipse 62% 40% at 38% 16%,rgba(255,255,255,.85) 0%,rgba(255,255,255,.35) 42%,rgba(255,255,255,0) 68%),radial-gradient(circle 9% at 25% 13%,rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%),radial-gradient(ellipse 68% 24% at 50% 100%,rgba(255,255,255,.5) 0%,rgba(255,255,255,.16) 45%,rgba(255,255,255,0) 68%),radial-gradient(circle at 50% 34%,rgba(0,0,0,0) 52%,rgba(50,32,8,.22) 82%,rgba(30,18,4,.5) 100%)"></div>
      </div>
      <div>
        <div style="font-size:calc(34px * var(--fontscale));font-weight:800;letter-spacing:.5px">Abhidhamma</div>
        <div style="font-size:calc(15px * var(--fontscale));color:var(--ink-soft);margin-top:6px">Thắng Pháp — Vi Diệu Pháp</div>
      </div>
      <div style="font-size:calc(13px * var(--fontscale));color:var(--ink-soft)">Bấm <b>☰ Chức năng</b> phía trên để chọn trang</div>
    </div>`;
}

// ===== Trang "37 Phẩm Trợ Đạo" (Bodhipakkhiyadhamma) =====
// Nguồn: Bodhipakkhiya Dīpanī — Ngài Ledi Sayadaw (Phạm Kim Khánh dịch, "37 Phẩm Trợ Đạo");
// quy nạp chi pháp theo Abhidhammattha Saṅgaha (chương VII).

const TD_GROUPS = [
 {ten:'Tứ Niệm Xứ', pali:'Satipaṭṭhāna', cls:'circle-sac', range:'1–4',
  body:`<b>Định nghĩa:</b> <i>"Bhusaṃ tiṭṭhatī'ti paṭṭhānaṃ; sati eva paṭṭhānaṃ satipaṭṭhānaṃ"</i> — cái gì được kiên cố thiết lập, vững chắc áp đặt vào (đề mục), đó là niệm xứ. "Vững chắc" nghĩa là muốn an trú tâm vào hơi thở một giờ, hai giờ thì giữ được trọn thời gian ấy.<br><br>
  <b>Bốn ví dụ trứ danh:</b><br>
  • <b>Người mất trí</b>: ăn năm sáu miếng rồi bỏ đi, nói đầu quên đuôi — như người ngồi thiền mà tâm phóng dật, tụng "Iti'pi so" mãi không hết bài.<br>
  • <b>Người lái thuyền không biết lèo lái</b>: thuyền trôi qua bao bến đậu mà không cặp được, cuối cùng trôi ra biển khơi — như chúng sanh trôi qua nhiều thời kỳ có Phật Pháp mà không dừng lại được.<br>
  • <b>Luyện bò tơ</b>: nhập bầy, vào chuồng = Giới tịnh; xỏ vàm, cột vào trụ = Niệm thân; gác ách kéo cày = samatha–vipassanā.<br>
  • <b>Luyện voi rừng</b>: rừng = dục lạc; bãi luyện = Giáo Pháp; hàng rào = Giới tịnh; trụ cột = thân/hơi thở; dây cột = Niệm thân.<br><br>
  <i>"Amataṃ tesaṃ paribhuttaṃ, yesaṃ kāyagatā sati paribhuttā"</i> — ai thọ hưởng pháp Niệm thân là thọ hưởng trạng thái Bất Diệt. Chỉ khi tâm tán loạn lắng xuống, ta mới lần đầu nhận ra "sức nóng" của cái tâm khuấy động — như con sâu trong trái ớt không biết ớt cay.<br><br>
  <b>Thời gian:</b> có thể cần 7 ngày, 15 ngày, một tháng… cho đến 2–4 năm, tùy mức tinh tấn. Người thuần quán (sukkhavipassaka), sau khi vững Niệm thân, có thể vào thẳng minh sát.`},
 {ten:'Tứ Chánh Cần', pali:'Sammappadhāna', cls:'circle-bt', range:'5–8',
  body:`Chánh cần là nỗ lực mang bốn đặc tính, diễn tả bằng lời nguyện trứ danh:<br><i>"Hãy để cho da, gân và xương, thịt còn lại, máu trong thân tôi khô cạn dần, tôi sẽ không chấm dứt chuyên cần tinh tấn cho đến khi thành đạt những gì mà khả năng, tánh chuyên cần và sự cố gắng của con người có thể thành đạt."</i><br>
  Đó là mức tinh tấn của Đại đức Soṇa (không nằm suốt ba tháng an cư), Đại đức Cakkhupāla, Đại đức Phussadeva (25 năm), Đại đức Mahāsiva (30 năm). Lập luận của Ngài: ba mươi năm khổ nhọc tu tập không bằng ba giờ trong địa ngục — vậy tại sao lại tính toán, trì hoãn?<br><br>
  <b>Nghiệp "đã sanh" và "chưa sanh":</b> <i>uppanna akusala kamma</i> là kho nghiệp bất thiện tích tụ từ quá khứ vô thủy đang chờ trổ quả; <i>anuppanna akusala kamma</i> là vô lượng nghiệp bất thiện sẽ tạo trong tương lai. Chúng sanh bị kẹp giữa hai ngọn lửa — cả hai đều bắt nguồn từ <b>Thân kiến (sakkāya-diṭṭhi)</b>. Nhổ tận gốc Thân kiến thì cả hai đồng thời tắt hẳn — vĩnh viễn không còn tái sanh khổ cảnh, dầu chỉ trong giấc mộng.<br><br>
  <b>Ba tầng lớp của phiền não — ví dụ hộp diêm:</b><br>
  • <b>Vītikkama</b> (thô, vượt ra thân – khẩu) — như lửa lan sang vật khác → đối trị bằng <b>Giới</b>.<br>
  • <b>Pariyuṭṭhāna</b> (trung, quấy nhiễu trong ý) — như lửa cháy trên cây diêm → đối trị bằng <b>Định</b>.<br>
  • <b>Anusaya</b> (tế, ngủ ngầm trong luồng nghiệp) — như lửa ngủ trong hộp diêm → chỉ <b>Tuệ</b> quán vô ngã mới cắt đứt.<br><br>
  <b>Niyāma – Aniyāma:</b> Giới của bậc Thánh là ổn định (bậc Nhập Lưu không còn vi phạm ājīvaṭṭhamaka-sīla dầu trong giấc mơ); giới – định – tuệ của phàm nhân là bất ổn định. Mục tiêu của toàn tác phẩm: chuyển cái "bất ổn định" thành "ổn định" ngay trong thời kỳ còn Giáo Pháp.`},
 {ten:'Tứ Như Ý Túc', pali:'Iddhipāda', cls:'circle-tho', range:'9–12',
  body:`Trong Giáo Pháp có năm <i>iddhi</i> (thành tựu): thắng tri danh–sắc; liễu tri Khổ đế; đoạn trừ Tập đế; chứng ngộ Diệt đế; tu tập Đạo đế. <b>Iddhipāda là nền tảng để đạt các thành tựu ấy.</b><br><br>
  Ví dụ: người không có Như Ý Túc nào giống như con của hạng caṇḍāla — không có "căn bản" để mong làm hoàng đế; người có Như Ý Túc giống như con của hoàng đế — luôn có cơ sở để hy vọng.<br><br>
  Ai chỉ nói "tôi không làm được" là người chưa từng có một Như Ý Túc nào; <b>thuốc chữa</b> là học hỏi kinh sách để khơi dậy ước muốn (chanda) và nương tựa một vị thầy có thể khích lệ mình.`},
 {ten:'Ngũ Căn', pali:'Indriya', cls:'circle-th', range:'13–17',
  body:`Mỗi căn có hai tầng: <b>pakati</b> (thông thường, chưa qua tu tập) và <b>bhāvanā</b> (được trau giồi qua thiền tập). Đức tin thông thường chỉ đủ đưa đến bố thí, trì giới, bắt đầu tập thiền; chỉ đức tin được trau giồi mới đủ sức kiểm soát tâm trong pháp hành — cả năm căn đều như vậy.<br><br>
  <b>Kinh dạy tìm mỗi căn ở đâu:</b><br>
  • Tín căn → bốn chi phần của bậc Nhập Lưu (bất động tín nơi Phật – Pháp – Tăng và viên mãn Giới tịnh).<br>
  • Tấn căn → Tứ Chánh Cần.<br>
  • Niệm căn → Tứ Niệm Xứ.<br>
  • Định căn → Tứ Thiền.<br>
  • Tuệ căn → Tứ Diệu Đế.<br><br>
  Người không tu tập Ngũ Căn giống như một quốc gia không vua, một rừng hoang không luật lệ, kẻ yếu làm mồi cho kẻ mạnh; nghe bàn về tri túc hay pháp hành thì lập tức tìm cớ chê bai — như người bị ma nhập không chịu nổi lời kinh.`},
 {ten:'Ngũ Lực', pali:'Bala', cls:'circle-dh', range:'18–22',
  body:`Năm lực và <b>năm pháp đối nghịch</b> mà mỗi lực phải khắc chế:<br>
  • <b>Tín lực</b> khắc chế <i>taṇhā</i> (tham ái) — đưa về "bốn Thánh Chủng" (ariya-vaṃsa): tri túc với thực, y, trú xứ và hoan hỷ trong thiền tập.<br>
  • <b>Tấn lực</b> khắc chế <i>kosajja</i> (lười biếng) — sống viễn ly, khất thực, đầu đà, niệm thân.<br>
  • <b>Niệm lực</b> khắc chế <i>muṭṭhasacca</i> (thất niệm).<br>
  • <b>Định lực</b> khắc chế <i>vikkhepa</i> (loạn động).<br>
  • <b>Tuệ lực</b> khắc chế <i>sammoha</i> (si mê) — thông suốt cả Tam Tạng vẫn chưa đủ, phải là tuệ do thiền tập.<br><br>
  Hễ một lực yếu thì không vượt được pháp đối nghịch tương ứng. Riêng <b>Tấn và Tuệ</b> đồng thời cũng là Như Ý Túc, nên nếu hai lực này dũng mãnh và quân bình thì không có chuyện thất bại.<br><br>
  <b>Ví dụ con bò usabha:</b> giống bò quý gấp ngàn lần bò thường, nhưng nếu chủ không biết giá trị mà cứ bắt kéo cày như bò thường thì nó sống chết y hệt bò thường. Hạng neyya là người chủ; Ngũ Lực là con bò usabha; các bộ Vibhaṅga và Saṃyutta tương ứng là sách hướng dẫn nuôi dưỡng.`},
 {ten:'Thất Giác Chi', pali:'Bojjhaṅga', cls:'circle-vt', range:'23–29',
  body:`<b>Ví dụ con chim:</b> sanh lần đầu là quả trứng; sanh lần hai khi trứng nở; đủ lông cánh thì bay đi tự tại. Hành giả cũng vậy — (1) vững Niệm thân / thành tựu samatha thì thoát tâm loạn động; (2) đắc minh sát về danh–sắc–uẩn thì thoát vô minh thô; (3) <b>Thất Giác Chi thuần thục thì thoát phàm tánh, đạt Đạo Tuệ siêu thế</b>.<br><br>
  Về việc tụng kinh Bojjhaṅga chữa bệnh: chỉ hiệu nghiệm khi người nghe hiểu rõ ý nghĩa các giác chi và do đó phát sanh đức tin rộng lớn, rõ ràng nơi lời kinh.`},
 {ten:'Bát Chánh Đạo', pali:'Maggaṅga', cls:'circle-canh', range:'30–37',
  body:`Ba nhóm: <b>Tuệ</b> (Chánh kiến, Chánh tư duy) — <b>Giới</b> (Chánh ngữ, Chánh nghiệp, Chánh mạng) — <b>Định</b> (Chánh tinh tấn, Chánh niệm, Chánh định). Cả tám chi chỉ đồng thời có mặt ở <b>Tri Kiến Tịnh siêu thế</b>; ở các giai đoạn trước, ba chi Giới chỉ có trong Giới tịnh.<br><br>
  Phân biệt Giới <i>vaṭṭa-nissita</i> (hướng về phước báu trong luân hồi) và Giới <i>vivaṭṭa-nissita</i> (hướng về chấm dứt luân hồi) — chỉ loại sau mới thật sự là ādibrahmacariyaka-sīla, thuộc hàng trợ đạo.<br><br>
  <b>Vì sao gọi là Nhập Lưu?</b> Như nước năm con sông lớn và năm trăm dòng sông nhỏ từ Hi-mã-lạp-sơn không bao giờ chảy ngược về nguồn, bậc Thánh không bao giờ rơi trở lại phàm tánh. <i>"Sotaṃ ādito pajjiṃsu pāpuṇiṃsū'ti sotāpannā."</i><br><br>
  <b>Chuỗi nhân quả tiếp nối</b> (Magga Saṃyutta): nơi người có Chánh kiến, Chánh tư duy tăng trưởng; từ Chánh tư duy sanh Chánh ngữ; rồi Chánh nghiệp, Chánh mạng, Chánh tinh tấn, Chánh niệm, Chánh định — mỗi chi kiên cố hơn qua từng kiếp, cho đến Vô Dư Niết Bàn. (Truyền thống Miến gọi hạng Nhập Lưu tiến dần qua nhiều kiếp cao thượng liên tục đến A-La-Hán là "Bon-sin-san".)`}
];

const TRODAO_DATA = [
 // 1–4 Tứ Niệm Xứ
 {ten:'Niệm thân', pali:'Kāyānupassanā-satipaṭṭhāna', g:0, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Niệm vững chắc an trú trên thân: hơi thở (ānāpāna), bốn oai nghi, tỉnh giác các động tác, 32 thể trược (hoặc "nhóm năm phần da"), niệm xương. Ngài Ledi Sayadaw xem Niệm thân là cửa ngõ hoàn tất Tâm tịnh — cột chặt con voi tâm vào trụ cột đề mục.'},
 {ten:'Niệm thọ', pali:'Vedanānupassanā-satipaṭṭhāna', g:0, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Niệm vững chắc an trú trên các cảm thọ: lạc, khổ, hỷ, ưu, xả — thấy thọ chỉ là thọ, không phải "tôi cảm nhận".'},
 {ten:'Niệm tâm', pali:'Cittānupassanā-satipaṭṭhāna', g:0, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Niệm vững chắc an trú trên tâm: tâm có tham biết có tham, tâm không sân biết không sân… — thấy tâm chỉ là dòng sanh diệt.'},
 {ten:'Niệm pháp', pali:'Dhammānupassanā-satipaṭṭhāna', g:0, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Niệm vững chắc an trú trên các pháp: triền cái, ngũ uẩn, xứ, giác chi, Tứ đế — nền tảng đưa thẳng vào minh sát.'},
 // 5–8 Tứ Chánh Cần
 {ten:'Tinh tấn diệt ác đã sanh', pali:'Uppannānaṃ pahānāya vāyāma', g:1, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Nỗ lực đoạn trừ các bất thiện pháp đã sanh — kho nghiệp bất thiện tích tụ từ quá khứ vô thủy (uppanna akusala) chỉ thật sự "tắt" khi nhổ tận gốc Thân kiến.'},
 {ten:'Tinh tấn ngăn ác chưa sanh', pali:'Anuppannānaṃ anuppādāya vāyāma', g:1, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Nỗ lực ngăn không cho các bất thiện pháp chưa sanh được sanh khởi — chận đứng vô lượng nghiệp bất thiện lẽ ra sẽ tạo trong tương lai (anuppanna akusala).'},
 {ten:'Tinh tấn sanh thiện chưa sanh', pali:'Anuppannānaṃ uppādāya vāyāma', g:1, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Nỗ lực làm sanh khởi các thiện pháp chưa từng sanh — đặc biệt là Giới tịnh, Niệm thân, thiền định và tuệ minh sát chưa từng có trong dòng luân hồi.'},
 {ten:'Tinh tấn tăng thiện đã sanh', pali:'Uppannānaṃ bhiyyobhāvāya vāyāma', g:1, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Nỗ lực làm cho các thiện pháp đã sanh tăng trưởng đến viên mãn — chuyển giới – định – tuệ "bất ổn định" (aniyāma) của phàm nhân thành "ổn định" (niyāma) của bậc Thánh.'},
 // 9–12 Tứ Như Ý Túc
 {ten:'Dục như ý túc', pali:'Chandiddhipāda', g:2, chiphap:'Tâm sở <b>Dục</b> (Chanda)', dn:'Nhiệt tâm mãnh liệt: "Nếu không thành đạt trong kiếp này thì thà chết còn hơn" — như vua Dhammasoṇḍa bỏ ngai vàng chỉ để nghe một câu kệ của Đức Phật Kassapa.'},
 {ten:'Tấn như ý túc', pali:'Viriyiddhipāda', g:2, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Không rủn chí trước trăm ngàn khó nhọc, không sờn lòng dù phải tinh tấn nhiều năm.'},
 {ten:'Tâm như ý túc', pali:'Cittiddhipāda', g:2, chiphap:'<b>Tâm</b> (Citta)', dn:'Tâm bám chặt vào pháp hành như nhà luyện kim chăm chú vào vàng bạc, quên cả ăn ngủ.'},
 {ten:'Trạch quán như ý túc', pali:'Vīmaṃsiddhipāda', g:2, chiphap:'Tâm sở <b>Trí tuệ</b> (Paññā)', dn:'Trí sáng suốt thấy rõ hiểm họa luân hồi; pháp càng thâm sâu, nguyện vọng càng mạnh.'},
 // 13–17 Ngũ Căn
 {ten:'Tín căn', pali:'Saddhindriya', g:3, chiphap:'Tâm sở <b>Tín</b> (Saddhā)', dn:'Đức tin cai quản tâm, tìm ở <b>bốn chi phần của bậc Nhập Lưu</b>: bất động tín nơi Phật, Pháp, Tăng và viên mãn Giới tịnh. Tín pakati chỉ đủ đưa đến bố thí – trì giới; tín bhāvanā mới kiểm soát được tâm trong pháp hành.'},
 {ten:'Tấn căn', pali:'Viriyindriya', g:3, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Tinh tấn cai quản tâm, tìm ở <b>Tứ Chánh Cần</b> — nỗ lực được trau giồi qua thiền tập, không phải sự siêng năng thông thường.'},
 {ten:'Niệm căn', pali:'Satindriya', g:3, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Niệm cai quản tâm, tìm ở <b>Tứ Niệm Xứ</b> — niệm đủ sức an trú vững chắc trên đề mục hàng giờ.'},
 {ten:'Định căn', pali:'Samādhindriya', g:3, chiphap:'Tâm sở <b>Nhất hành</b> (Ekaggatā)', dn:'Định cai quản tâm, tìm ở <b>Tứ Thiền</b> — từ cận định đến toàn định.'},
 {ten:'Tuệ căn', pali:'Paññindriya', g:3, chiphap:'Tâm sở <b>Trí tuệ</b> (Paññā)', dn:'Tuệ cai quản tâm, tìm ở <b>Tứ Diệu Đế</b> — hiểu biết do thiền tập soi thấu Khổ, Tập, Diệt, Đạo.'},
 // 18–22 Ngũ Lực
 {ten:'Tín lực', pali:'Saddhābala', g:4, chiphap:'Tâm sở <b>Tín</b> (Saddhā)', dn:'Đức tin ở tầng lực, không lay chuyển, <b>khắc chế tham ái (taṇhā)</b> — đưa về bốn Thánh Chủng: tri túc với thực, y, trú xứ và hoan hỷ trong thiền tập.'},
 {ten:'Tấn lực', pali:'Viriyabala', g:4, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Tinh tấn ở tầng lực, <b>khắc chế lười biếng (kosajja)</b> — sống viễn ly, khất thực, đầu đà, niệm thân.'},
 {ten:'Niệm lực', pali:'Satibala', g:4, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Niệm ở tầng lực, <b>khắc chế thất niệm (muṭṭhasacca)</b> — tâm không còn để tuột mất đề mục.'},
 {ten:'Định lực', pali:'Samādhibala', g:4, chiphap:'Tâm sở <b>Nhất hành</b> (Ekaggatā)', dn:'Định ở tầng lực, <b>khắc chế loạn động (vikkhepa)</b> — ý nghĩ không còn bay nhảy vô định.'},
 {ten:'Tuệ lực', pali:'Paññābala', g:4, chiphap:'Tâm sở <b>Trí tuệ</b> (Paññā)', dn:'Tuệ ở tầng lực, <b>khắc chế si mê (sammoha)</b> — thông suốt cả Tam Tạng vẫn chưa đủ, phải là tuệ do thiền tập.'},
 // 23–29 Thất Giác Chi
 {ten:'Niệm giác chi', pali:'Sati-sambojjhaṅga', g:5, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Chính là niệm xứ, niệm căn, niệm lực, chánh niệm — nay ở vai trò một chi phần của sự Giác ngộ.'},
 {ten:'Trạch pháp giác chi', pali:'Dhammavicaya-sambojjhaṅga', g:5, chiphap:'Tâm sở <b>Trí tuệ</b> (Paññā)', dn:'Như hột bông vải được xay đi xay lại — tiến trình quán ngũ uẩn lặp đi lặp lại dưới ánh sáng tuệ minh sát.'},
 {ten:'Tinh tấn giác chi', pali:'Viriya-sambojjhaṅga', g:5, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Nỗ lực nâng đỡ các giác chi khác cùng tiến trên đường minh sát.'},
 {ten:'Phỉ giác chi', pali:'Pīti-sambojjhaṅga', g:5, chiphap:'Tâm sở <b>Hỷ</b> (Pīti)', dn:'Niềm vui khi tiến trình thấy – biết thật sự tăng trưởng.'},
 {ten:'Khinh an giác chi', pali:'Passaddhi-sambojjhaṅga', g:5, chiphap:'Tâm sở <b>Tịnh thân · Tịnh tâm</b> (Kāyapassaddhi · Cittapassaddhi)', dn:'Thân và tâm an tĩnh khi suy tư lắng đọng.'},
 {ten:'Định giác chi', pali:'Samādhi-sambojjhaṅga', g:5, chiphap:'Tâm sở <b>Nhất hành</b> (Ekaggatā)', dn:'Từ tạm định, cận định, toàn định đến không tánh định, vô tướng định, vô nguyện định.'},
 {ten:'Xả giác chi', pali:'Upekkhā-sambojjhaṅga', g:5, chiphap:'Tâm sở <b>Hành xả</b> (Tatramajjhattatā)', dn:'Khi pháp hành đã đúng phương pháp, không còn phải gắng sức nhiều nữa — trạng thái quân bình tự vận hành.'},
 // 30–37 Bát Chánh Đạo
 {ten:'Chánh kiến', pali:'Sammādiṭṭhi', g:6, chiphap:'Tâm sở <b>Trí tuệ</b> (Paññā)', dn:'Thấy đúng Tứ Diệu Đế — thuộc nhóm Tuệ của Con Đường.'},
 {ten:'Chánh tư duy', pali:'Sammāsaṅkappa', g:6, chiphap:'Tâm sở <b>Tầm</b> (Vitakka)', dn:'Suy nghĩ ly dục, vô sân, bất hại — hướng tâm về đúng đối tượng; thuộc nhóm Tuệ.'},
 {ten:'Chánh ngữ', pali:'Sammāvācā', g:6, chiphap:'Tâm sở <b>Chánh ngữ</b> (Sammāvācā — tiết chế)', dn:'Từ bỏ nói dối, nói chia rẽ, nói thô ác, nói phù phiếm — thuộc nhóm Giới; trọn vẹn trong ājīvaṭṭhamaka-sīla.'},
 {ten:'Chánh nghiệp', pali:'Sammākammanta', g:6, chiphap:'Tâm sở <b>Chánh nghiệp</b> (Sammākammanta — tiết chế)', dn:'Từ bỏ sát sanh, trộm cắp, tà hạnh — thuộc nhóm Giới.'},
 {ten:'Chánh mạng', pali:'Sammā-ājīva', g:6, chiphap:'Tâm sở <b>Chánh mạng</b> (Sammā-ājīva — tiết chế)', dn:'Nuôi mạng chân chánh — chi thứ tám khép lại ājīvaṭṭhamaka-sīla (tám giới chấm dứt bằng Chánh mạng), nền tảng Giới tịnh.'},
 {ten:'Chánh tinh tấn', pali:'Sammāvāyāma', g:6, chiphap:'Tâm sở <b>Cần</b> (Viriya)', dn:'Chính là Tứ Chánh Cần ở vai trò chi đạo — thuộc nhóm Định.'},
 {ten:'Chánh niệm', pali:'Sammāsati', g:6, chiphap:'Tâm sở <b>Niệm</b> (Sati)', dn:'Chính là Tứ Niệm Xứ ở vai trò chi đạo — thuộc nhóm Định.'},
 {ten:'Chánh định', pali:'Sammāsamādhi', g:6, chiphap:'Tâm sở <b>Nhất hành</b> (Ekaggatā)', dn:'Bốn tầng thiền — thuộc nhóm Định. Cả tám chi đồng thời có mặt trọn vẹn ở sát-na Đạo siêu thế.'}
];

function renderTroDaoPage(){
  const extra = document.getElementById('extra-content');
  let html = `<p class="info-note" style="margin-bottom:10px">Gọi là <b>bodhipakkhiya</b> vì đó là những thành phần (pakkhiya) của sự Giác Ngộ (bodhi), giữ vai trò <b>nhân kế cận</b> (padaṭṭhāna), <b>thành phần thiết yếu</b> (sambhāra) và <b>nền tảng đầy đủ</b> (upanissaya) của Đạo Tuệ. Luận đề trung tâm của Ngài Ledi Sayadaw: cô đọng 45 hạ thuyết pháp, cốt tủy Tam Tạng chính là <b>37 Phẩm Trợ Đạo</b>; cô đọng nữa thành <b>7 giai đoạn Thanh tịnh</b>, rồi thành <b>Giới – Định – Tuệ</b>.<br>37 = 4 Niệm xứ + 4 Chánh cần + 4 Như ý túc + 5 Căn + 5 Lực + 7 Giác chi + 8 Đạo chi.</p>`;
  let n = 0;
  TD_GROUPS.forEach((gr, gi)=>{
    const items = TRODAO_DATA.map((d,i)=>({d,i})).filter(x=>x.d.g===gi);
    html += `<div class="group-head">${gr.ten} · ${gr.pali} (${gr.range}) <span onclick="openTDGroupSheet(${gi})" style="cursor:pointer;color:#b06a28;font-weight:800;padding:2px 6px">ⓘ chi tiết</span></div>`;
    html += `<div class="circle-grid">`;
    items.forEach(x=>{
      n++;
      html += `<div class="circle ${gr.cls}" onclick="openTroDaoSheet(${x.i})"><div class="cp" style="font-weight:800">${n}</div><div class="cn">${x.d.ten}</div><div class="cp">${x.d.pali.split('-')[0].split(' ')[0]}</div></div>`;
    });
    html += `</div>`;
  });
  html += `<p class="info-note" style="margin-top:10px"><b>Lời khuyên kết thúc của Ngài:</b> người có trí, muốn trở thành "thừa kế ổn định" (niyata) ngay trong kiếp này hay kiếp kế, hãy: (1) vững chắc trong <b>ājīvaṭṭhamaka-sīla</b>; (2) kiên cố trong <b>Niệm thân</b>; (3) tận lực — tối thiểu ba giờ mỗi ngày — để chứng ngộ <b>ba đặc tướng nơi năm uẩn</b>. Chỉ cần thấy được một trong ba đặc tướng, vị ấy đã bước vào dòng Thánh.<br>Nguồn: <i>Bodhipakkhiya Dīpanī</i> — Ngài Ledi Sayadaw (bản dịch Phạm Kim Khánh); quy nạp chi pháp theo Abhidhammattha Saṅgaha.</p>`;
  extra.innerHTML = html;
}

function openTroDaoSheet(i){
  const d = TRODAO_DATA[i];
  const gr = TD_GROUPS[d.g];
  showAttrSheet(`
    <div class="sheet-head"><span class="num">${i+1}</span><h2>${d.ten}</h2></div>
    <p class="sheet-pali">${d.pali} · thuộc nhóm ${gr.ten} (${gr.pali})</p>
    <div class="sec"><div class="sec-label">Chi pháp (pháp thực tính)</div><div class="sec-body">${d.chiphap}</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Nội dung</div><div class="sec-body">${d.dn}</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Về nhóm ${gr.ten}</div>
      <div class="qbtn-row" style="margin-top:6px"><button class="qbtn" onclick="openTDGroupSheet(${d.g})">Xem giảng giải nhóm ${gr.ten}</button></div></div>
  `);
}

function openTDGroupSheet(gi){
  const gr = TD_GROUPS[gi];
  const items = TRODAO_DATA.map((d,i)=>({d,i})).filter(x=>x.d.g===gi);
  const btns = items.map(x=>`<button class="qbtn" onclick="openTroDaoSheet(${x.i})">${x.i+1}. ${x.d.ten}</button>`).join(' ');
  showAttrSheet(`
    <div class="sheet-head"><h2>${gr.ten}</h2></div>
    <p class="sheet-pali">${gr.pali} · phẩm ${gr.range} trong 37 Phẩm Trợ Đạo</p>
    <div class="sec"><div class="sec-label">Giảng giải (Bodhipakkhiya Dīpanī — Ledi Sayadaw)</div><div class="sec-body">${gr.body}</div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Các phẩm trong nhóm</div>
      <div class="qbtn-row" style="margin-top:6px">${btns}</div></div>
  `);
}

function openTDChiPhap14(){
  showAttrSheet(`
    <div class="sheet-head"><h2>Chi pháp: 14 tâm sở</h2></div>
    <p class="sheet-pali">37 phẩm trợ đạo quy nạp về 14 pháp thực tính (Abhidhammattha Saṅgaha)</p>
    <div class="sec"><div class="sec-body">
      <b>1. Cần (Viriya) — 9 phẩm:</b> 4 Chánh cần + Tấn như ý túc + Tấn căn + Tấn lực + Tinh tấn giác chi + Chánh tinh tấn.<br><br>
      <b>2. Niệm (Sati) — 8 phẩm:</b> 4 Niệm xứ + Niệm căn + Niệm lực + Niệm giác chi + Chánh niệm.<br><br>
      <b>3. Trí tuệ (Paññā) — 5 phẩm:</b> Trạch quán như ý túc + Tuệ căn + Tuệ lực + Trạch pháp giác chi + Chánh kiến.<br><br>
      <b>4. Nhất hành (Ekaggatā) — 4 phẩm:</b> Định căn + Định lực + Định giác chi + Chánh định.<br><br>
      <b>5. Tín (Saddhā) — 2 phẩm:</b> Tín căn + Tín lực.<br><br>
      <b>6. Tầm (Vitakka) — 1:</b> Chánh tư duy.
      &nbsp;&nbsp;<b>7. Hỷ (Pīti) — 1:</b> Phỉ giác chi.<br>
      <b>8. Tịnh thân · Tịnh tâm (Passaddhi) — 1:</b> Khinh an giác chi.
      &nbsp;&nbsp;<b>9. Hành xả (Tatramajjhattatā) — 1:</b> Xả giác chi.<br>
      <b>10. Dục (Chanda) — 1:</b> Dục như ý túc.
      &nbsp;&nbsp;<b>11. Tâm (Citta) — 1:</b> Tâm như ý túc.<br>
      <b>12–14. Ba Tiết chế (Virati):</b> Chánh ngữ, Chánh nghiệp, Chánh mạng.
    </div></div>
    <p class="info-note">Cộng: 9 + 8 + 5 + 4 + 2 + 1×5 + 3 = 37 phẩm · 14 chi pháp (1 Tâm + 13 tâm sở).</p>
  `);
}

function openTD7TT(){
  showAttrSheet(`
    <div class="sheet-head"><h2>Bảy giai đoạn Thanh tịnh</h2></div>
    <p class="sheet-pali">Thực hành 37 Phẩm Trợ Đạo chính là thực hành 7 Thanh tịnh (Visuddhi)</p>
    <div class="sec"><div class="sec-body">
      <b>1. Giới tịnh</b> — trong sạch hành trì ājīvaṭṭhamaka-sīla (tám giới chấm dứt bằng Chánh mạng).<br><br>
      <b>2. Tâm tịnh</b> — qua Niệm thân: niệm hơi thở, bốn oai nghi, tỉnh giác các động tác, 32 thể trược (hoặc "nhóm năm phần da"), niệm xương.<br><br>
      <b>3. Kiến tịnh</b> — phân tách và nhận rõ sáu giới: đất, nước, lửa, gió, không gian, thức.<br><br>
      <b>4. Đoạn nghi tịnh</b> — thấy rõ nhân của sáu giới (nghiệp, tâm, thời tiết, vật thực) và nhân của sáu thức là các cảnh tương ứng.<br><br>
      <b>5. Đạo phi đạo tri kiến tịnh</b> — chỉ cần cho người nhiều ngã mạn (adhimānika), tưởng đã chứng mà thật chưa.<br><br>
      <b>6. Đạo tri kiến tịnh</b> — thấy rõ ba đặc tướng vô thường – khổ – vô ngã nơi sáu giới ấy.<br><br>
      <b>7. Tri kiến tịnh</b> — siêu thế: chứng ngộ bốn Thánh Đạo.
    </div></div>
    <p class="info-note">Tâm tịnh theo nghĩa riêng chỉ cần cho hành giả đi đường samatha; hành giả thuần quán sau khi vững Giới tịnh và Niệm thân thì vào thẳng Kiến tịnh, Đoạn nghi tịnh…</p>
  `);
}

function openTDMinhHanh(){
  showAttrSheet(`
    <div class="sheet-head"><h2>Minh · Hạnh · Bốn hạng người</h2></div>
    <p class="sheet-pali">Vijjā – Caraṇa · bối cảnh của Bodhipakkhiya Dīpanī</p>
    <div class="sec"><div class="sec-label">Bốn hạng người gặp Phật Pháp</div><div class="sec-body">
      Theo Puggala-paññatti và Aṅguttara Nikāya:<br>
      • <b>Ugghāṭitaññū</b> — hiểu tức khắc, đắc Đạo Quả chỉ sau một thời pháp ngắn.<br>
      • <b>Vipañcitaññū</b> — hiểu khi được giảng rộng.<br>
      • <b>Neyya</b> — cần được hướng dẫn: phải học, ghi nhớ, suy tư và hành trì nhiều ngày – nhiều năm.<br>
      • <b>Padaparama</b> — tối đa chỉ đến ngôn từ, kiếp này chỉ tích trữ vāsanā (tiềm năng).<br>
      Sau một ngàn năm đầu của Giáo Pháp, chỉ còn hai hạng <b>Neyya và Padaparama</b> — toàn bộ chỉ dẫn pháp hành trong Kinh điển là dành cho hai hạng này. Hạng neyya như người bệnh "lành nếu đúng thuốc, chết nếu không": giải thoát hay không hoàn toàn tùy nơi nỗ lực.
    </div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Hai loại hột giống: Minh (Vijjā) và Hạnh (Caraṇa)</div><div class="sec-body">
      Giới và Định hợp thành <b>Hạnh</b>; Tuệ là <b>Minh</b>. Minh như đôi mắt, Hạnh như đôi chân; Minh như mắt chim, Hạnh như đôi cánh.<br>
      • Chỉ có Hạnh, thiếu Minh: nhiều duyên gặp vị Phật tương lai nhưng nghe pháp không giác ngộ.<br>
      • Chỉ có Minh, thiếu Hạnh: đủ khả năng giác ngộ nhưng rất khó gặp được Giáo Pháp.<br>
      • Đủ cả hai: vừa gặp được Giáo Pháp, vừa có thể giải thoát.<br>
      Hột giống Tuệ (sắc, danh, uẩn, xứ, giới, đế, duyên khởi) chỉ gieo được trong thời có Giáo Pháp — nên <b>tối thiểu phải cố hiểu thấu đáo Tứ Đại</b> cấu thành thân này.<br><br>
      <b>15 Caraṇa-dhamma:</b> (1) Giới; (2) Thu thúc lục căn; (3) Tiết độ ẩm thực; (4) Tỉnh thức; (5–11) bảy saddhamma: tín, niệm, tàm, quý, đa văn, tấn, tuệ; (12–15) bốn tầng Thiền Sắc giới. Hành giả thuần quán cần 11 pháp đầu.
    </div></div>
    <div class="sec" style="margin-top:12px"><div class="sec-label">Cảnh giác: chướng ngại Giáo Pháp (dhammantarāya)</div><div class="sec-body">
      Không nên dạy rằng phải hoàn tất trọn vẹn Giới tịnh rồi mới được hành thiền; không nên bảo người thợ săn, thợ chài rằng bỏ nghề mới được hành samatha–vipassanā — nên khuyến khích họ niệm ân đức Tam Bảo (gieo hột giống Hạnh) và quán ba đặc tướng (gieo hột giống Minh).<br>
      <b>Các giáo huấn sai lầm</b> (micchā-dhamma): không thấy hiểm họa luân hồi; tin thời nay không ai chứng được Đạo Quả; trì hoãn chờ ba-la-mật chín muồi; tin người nay chỉ sanh hai nhân; tin các bậc đại sư không còn nữa. Phản biện của Ngài: <b>không một thiện nghiệp nào là vô ích</b> — người dvi-hetuka tinh tấn có thể thành ti-hetuka kiếp sau; làm nản lòng người tu là dhammantarāya, quả báo kém phước, kém trí trong các kiếp vị lai.
    </div></div>
  `);
}


// ===== BẢNG ĐỘNG mô tả nút vừa chạm trên Bảng Nêu (chạm lần 2 mở bảng đầy đủ) =====
var _neuLastTap = null;
function hideTapInfo(){
  const p = document.getElementById('tap-info');
  if(p) p.classList.remove('show');
  _neuLastTap = null;
}
function _showTapInfo(html){
  const p = document.getElementById('tap-info');
  if(!p) return;
  document.getElementById('tap-info-body').innerHTML = html;
  p.classList.add('show');
}
function showTapInfoByKey(key){
  const kind = key.slice(0,2), rawId = key.slice(3);
  if(kind==='ci') showTapInfoCitta(parseInt(rawId,10));
  else if(kind==='ce') showTapInfoCet(rawId);
}
function tapNeuCitta(id){
  // tới được đây nghĩa là ô đã được chọn từ lần chạm 1 (capture đã hiện bảng động) -> mở bảng đầy đủ
  hideTapInfo(); openCittaSheet(id);
}
function aniyataOfCitta(id){
  const out = [];
  if(typeof ANIYATA_INFO!=='undefined'){
    for(const [cid,info] of Object.entries(ANIYATA_INFO)){
      if(info.cittas.includes(id)){
        const ce = CETASIKA_DATA.find(x=>x.id===cid);
        if(ce) out.push(ce.ten.replace(/ \(sở hữu\)/,''));
      }
    }
  }
  return out;
}
function showTapInfoCitta(id){
  _neuLastTap = 'ci'+id;
  const c = CITTA_DATA.find(x=>x.id===id);
  const names = CETASIKA_DATA.filter(x=>c.ceta.includes(x.id)).map(x=>x.ten.replace(/ \(sở hữu\)/,''));
  const aniNames = aniyataOfCitta(id);
  const aniLine = aniNames.length
    ? `<br><b>+ ${aniNames.length} bất định</b> <span class="ti-gloss">(aniyata — khi có chỉ có một, đôi khi không có)</span>: ${aniNames.join(', ')}.`
    : '';
  _showTapInfo(`
    <div class="ti-name">${cittaFullName(c)} <span class="ti-gloss">(${glossCitta(c)})</span></div>
    <div class="ti-sub">${c.groupLabel} · Cảm thọ: ${c.vedanaLabel}</div>
    <div class="ti-list"><b>${c.ceta.length} tâm sở cố định:</b> ${names.join(', ')}.${aniLine}</div>
    <button class="ti-more" onclick="hideTapInfo();openCittaSheet(${id})">Mở bảng đầy đủ »</button>
  `);
}
function tapNeuCet(id){
  hideTapInfo(); openCetasikaSheet(id);
}
function showTapInfoCet(id){
  _neuLastTap = 'ce'+id;
  const ces = CETASIKA_DATA.find(x=>x.id===id);
  const matching = CITTA_DATA.filter(c=>c.ceta.includes(id));
  const ani = ANIYATA_INFO[id];
  const aniN = ani ? ani.cittas.length : 0;
  const dn4 = (typeof DACTINH_DATA!=='undefined' && DACTINH_DATA[id]) ? DACTINH_DATA[id].dt : '';
  // công thức nhóm ngắn gọn
  const gp = []; const seen = [];
  for(const m of matching){ if(!seen.includes(m.group)){ seen.push(m.group); gp.push(`${matching.filter(x=>x.group===m.group).length} ${m.groupLabel}`);} }
  let body = matching.length ? `<b>${matching.length} tâm phối hợp${ani?' cố định':''}:</b> ${gp.join(' + ')}.` : '';
  if(aniN) body += `${body?'<br>':''}<b>${aniN} tâm bất định</b> (chỉ khởi khi có dịp).`;
  _showTapInfo(`
    <div class="ti-name">Tâm sở ${ces.ten.replace(/ \(sở hữu\)/,'')}${dn4?` <span class="ti-gloss">(${dn4.charAt(0).toLowerCase()+dn4.slice(1)})</span>`:''}</div>
    <div class="ti-sub">${ces.pali}</div>
    <div class="ti-list">${body}</div>
    <button class="ti-more" onclick="hideTapInfo();openCetasikaSheet('${id}')">Mở bảng đầy đủ »</button>
  `);
}
