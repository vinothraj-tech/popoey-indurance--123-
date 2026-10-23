const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const toast = $('#toast');
let toastTimer;
function showToast(message){
  $('#toastMessage').textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('show'), 3000);
}
const pageContent = {
  dashboard: ['Dashboard','Good afternoon, Vinothraj','Here’s what’s happening with your insurance payments today.'],
  customers: ['Customers','Customer directory','Manage customer details, vehicle information, and renewal activity.'],
  payments: ['Payments','Payment centre','Create payment links and monitor payment collection status.'],
  policies: ['Policies','Policy management','Track policy renewals, expiry dates, and issuance status.'],
  transactions: ['Transactions','Transaction history','Review every payment attempt, status, and transaction reference.'],
  reports: ['Reports','Reports & insights','Review collection trends and export operational summaries.'],
  settings: ['Settings','Workspace settings','Manage workspace preferences, notifications, and integrations.']
};
$$('.nav-item').forEach(button => button.addEventListener('click', ()=>{
  $$('.nav-item').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  const key = button.dataset.page;
  const content = pageContent[key];
  $('#pageCrumb').textContent = content[0];
  $('#pageTitle').innerHTML = key === 'dashboard' ? 'Good afternoon, Vinothraj <span class="wave">✦</span>' : content[1];
  $('#pageSubtitle').textContent = content[2];
  if(key !== 'dashboard') showToast(`${content[0]} section selected — demo dashboard view`);
  $('#sidebar').classList.remove('open');
}));
$$('[data-goto]').forEach(button=>button.addEventListener('click', ()=>{
  const key=button.dataset.goto;
  const target=$(`[data-page="${key}"]`);
  if(target) target.click();
  $('#transactionsPanel').scrollIntoView({behavior:'smooth',block:'start'});
}));
$('#mobileMenu').addEventListener('click', ()=>$('#sidebar').classList.toggle('open'));
document.addEventListener('click', e=>{
  if(window.innerWidth<=900 && $('#sidebar').classList.contains('open') && !$('#sidebar').contains(e.target) && !$('#mobileMenu').contains(e.target)) $('#sidebar').classList.remove('open');
});

const modal = $('#modalBackdrop');
function openModal(){modal.classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>modal.querySelector('input')?.focus(),100)}
function closeModal(){modal.classList.remove('open');document.body.style.overflow=''}
$('#newPaymentBtn').addEventListener('click',openModal);
$('#modalClose').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus()}});
$('#paymentForm').addEventListener('submit',e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const name = String(data.get('customer')).trim();
  const amount = Number(data.get('amount'));
  if(!name || !Number.isFinite(amount) || amount<=0){showToast('Please enter valid customer and amount details.');return}
  closeModal();
  e.currentTarget.reset();
  showToast(`Demo payment link prepared for ${name} — ₹${amount.toLocaleString('en-IN')}`);
});

let currentFilter='All';
function filterRows(){
  const query = ($('#tableSearch').value || $('#globalSearch').value).toLowerCase().trim();
  let visible=0;
  $$('#transactionRows tr').forEach(row=>{
    const matchesStatus=currentFilter==='All'||row.dataset.status===currentFilter;
    const matchesQuery=row.textContent.toLowerCase().includes(query);
    row.hidden=!(matchesStatus&&matchesQuery);
    if(!row.hidden) visible++;
  });
  $('#tableCount').textContent=`Showing ${visible} transaction${visible===1?'':'s'} in this demo view`;
}
$$('.filter-tab').forEach(tab=>tab.addEventListener('click',()=>{
  $$('.filter-tab').forEach(t=>t.classList.remove('selected'));
  tab.classList.add('selected');
  currentFilter=tab.dataset.filter;
  filterRows();
}));
$('#tableSearch').addEventListener('input',filterRows);
$('#globalSearch').addEventListener('input',()=>{
  $('#tableSearch').value=$('#globalSearch').value;
  filterRows();
});
$('#periodSelect').addEventListener('change',e=>{
  const totals={week:'₹2,16,840',month:'₹8,42,650',year:'₹74,26,900'};
  $('#chartTotal').innerHTML=`${totals[e.target.value]} <small>+12.8%</small>`;
  showToast(`Collection chart updated: ${e.target.options[e.target.selectedIndex].text}`);
});
$('#exportBtn').addEventListener('click',()=>{
  const rows=[['Customer','Vehicle Number','Payment Date','Amount','Payment Method','Status']];
  $$('#transactionRows tr').filter(row=>!row.hidden).forEach(row=>{
    const cells=[...row.querySelectorAll('td')];
    rows.push([
      cells[0].innerText.replace(/\n/g,' | '),
      cells[1].innerText.replace(/\n/g,' | '),
      cells[2].innerText.replace(/\n/g,' '),
      cells[3].innerText,
      cells[4].innerText,
      cells[5].innerText
    ]);
  });
  const csv=rows.map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='popoye-transactions-demo.csv';a.click();
  URL.revokeObjectURL(url);
  showToast('Demo transaction report exported as CSV.');
});
$('#supportBtn').addEventListener('click',()=>showToast('Support centre is a demo placeholder.'));
$('#notificationBtn').addEventListener('click',()=>showToast('You’re all caught up — no new notifications.'));
$$('.row-more').forEach(button=>button.addEventListener('click',()=>{
  const row=button.closest('tr');
  showToast(`${row.querySelector('.customer-cell strong').textContent}: ${row.dataset.status} transaction (demo)`);
}));
$$('.pagination button:not(:disabled)').forEach(button=>button.addEventListener('click',()=>{
  showToast('Pagination is a visual demo. Connect an API to load more records.');
}));
