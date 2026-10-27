
// Database dummy: wisata.json. Pemesanan/favorit disimpan di localStorage perangkat.
let wisata=[];
const read=k=>{try{return JSON.parse(localStorage.getItem('pb_demo_'+k))||[]}catch{return []}};
const save=(k,v)=>localStorage.setItem('pb_demo_'+k,JSON.stringify(v));
const rupiah=n=>'Rp '+Number(n).toLocaleString('id-ID');
function toggle(k,id){
  let a=read(k);a=a.includes(id)?a.filter(x=>x!==id):[...a,id];
  save(k,a);render();renderDetail();
}
function card(w){
  let fav=read('favorit').includes(w.id),cart=read('keranjang').includes(w.id);
  return `<article class="card"><a href="detail.html?id=${w.id}"><img src="${w.gambar}" alt="${w.nama}" loading="lazy"></a><div class="card-body"><span class="tag">${w.kategori}</span><p class="location">⌖ ${w.lokasi}</p><h3>${w.nama}</h3><p class="description">${w.deskripsi}</p><p><strong>${rupiah(w.harga)}</strong> <small>(harga demo)</small></p><div class="card-bottom"><a class="btn" href="detail.html?id=${w.id}">Detail →</a></div><div class="toolbar"><button class="pill ${fav?'active':''}" onclick="toggle('favorit',${w.id})">${fav?'❤️ Tersimpan':'🤍 Favorit'}</button><button class="pill ${cart?'active':''}" onclick="toggle('keranjang',${w.id})">${cart?'✓ Di keranjang':'🛒 Keranjang'}</button></div></div></article>`;
}
function render(){
 let el=document.getElementById('cards');if(!el)return;
 let list=wisata,path=location.pathname;
 if(path.endsWith('favorit.html'))list=list.filter(w=>read('favorit').includes(w.id));
 else if(path.endsWith('keranjang.html'))list=list.filter(w=>read('keranjang').includes(w.id));
 else{
  let q=(document.getElementById('q')?.value||'').toLowerCase(),cat=document.getElementById('category')?.value||'';
  list=list.filter(w=>(w.nama+' '+w.lokasi+' '+w.kategori).toLowerCase().includes(q)&&(!cat||w.kategori===cat));
 }
 el.innerHTML=list.map(card).join('')||'<p>Belum ada wisata di sini.</p>';
 renderCartSummary();
}
function renderDetail(){
 let el=document.getElementById('detail');if(!el)return;
 let id=Number(new URLSearchParams(location.search).get('id')),w=wisata.find(x=>x.id===id);
 el.innerHTML=w?`<a href="index.html">← Kembali</a><h1>${w.nama}</h1><img src="${w.gambar}" alt="${w.nama}"><p>📍 ${w.lokasi} · ${w.kategori}</p><p>${w.deskripsi}</p><p><strong>${rupiah(w.harga)}</strong> (harga simulasi)</p><button class="pill" onclick="toggle('favorit',${w.id})">${read('favorit').includes(w.id)?'❤️ Favorit tersimpan':'🤍 Simpan favorit'}</button> <button class="pill" onclick="toggle('keranjang',${w.id})">${read('keranjang').includes(w.id)?'✓ Di keranjang':'🛒 Tambah ke keranjang'}</button>`:'<p>Wisata tidak ditemukan.</p>';
}
function renderCartSummary(){
 let el=document.getElementById('cart-summary');if(!el)return;
 let selected=wisata.filter(w=>read('keranjang').includes(w.id)),total=selected.reduce((n,w)=>n+w.harga,0);
 el.innerHTML=selected.length?`<p><strong>${selected.length} destinasi — Total simulasi ${rupiah(total)}</strong></p><label>Nama pemesan (demo): <input id="namaPemesan" maxlength="60" placeholder="Nama untuk tiket demo" required></label> <button class="btn" onclick="checkoutDemo()">Buat pesanan demo</button><p><small>Tidak ada pembayaran asli. Data hanya tersimpan di browser ini.</small></p>`:'<p>Tambahkan wisata untuk membuat pesanan demo.</p>';
}
function checkoutDemo(){
 const name=document.getElementById('namaPemesan')?.value.trim();
 const ids=read('keranjang');
 if(!name){alert('Isi nama pemesan dulu ya.');return}
 if(!ids.length)return;
 let orders=read('pesanan');
 const order={kode:'DEMO-'+Date.now().toString(36).toUpperCase(),nama:name,ids,tanggal:new Date().toLocaleString('id-ID'),total:wisata.filter(w=>ids.includes(w.id)).reduce((s,w)=>s+w.harga,0)};
 orders.unshift(order);save('pesanan',orders);save('keranjang',[]);
 render();renderOrders();
 alert('Pesanan demo berhasil dibuat. Tidak ada pembayaran asli.');
}
function renderOrders(){
 let el=document.getElementById('orders');if(!el)return;
 let orders=read('pesanan');
 el.innerHTML=orders.length?orders.map(o=>`<div class="demo-order"><strong>${o.kode}</strong><p>Pemesan: ${escapeHTML(o.nama)} · ${o.tanggal}</p><p>${o.ids.map(id=>wisata.find(w=>w.id===id)?.nama).filter(Boolean).join(', ')}</p><p>Total demo: ${rupiah(o.total)}</p><p>Status: Simulasi / belum dibayar</p></div>`).join(''):'<p>Belum ada pesanan demo.</p>';
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function init(){
 try{
  let res=await fetch('./wisata.json',{cache:'no-store'});
  if(!res.ok)throw Error('HTTP '+res.status);
  wisata=await res.json();
  render();renderDetail();renderOrders();
 }catch(e){
  document.querySelectorAll('#cards,#detail,#cart-summary,#orders').forEach(el=>el.innerHTML='<p>Data wisata.json belum bisa dimuat. Jalankan lewat Netlify atau server lokal, bukan membuka file HTML langsung.</p>');
  console.error(e);
 }
}
document.getElementById('q')?.addEventListener('input',render);
document.getElementById('category')?.addEventListener('change',render);
document.getElementById('heroSearch')?.addEventListener('submit',e=>{
 e.preventDefault();
 document.getElementById('q').value=document.getElementById('heroQ').value;
 render();document.getElementById('wisata').scrollIntoView({behavior:'smooth'});
});
init();
