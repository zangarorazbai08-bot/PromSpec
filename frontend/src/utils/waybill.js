/**
 * Generates and opens a printable waybill (накладная/жүк құжаты)
 * Opens in a new browser tab ready to print
 */
export function printWaybill(request) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('kk-KZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' });

  const itemsHTML = request.items.map((item, idx) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${idx + 1}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;">${item.material_name}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${item.category || '—'}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;">${item.unit}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-weight:700;">${parseFloat(item.quantity).toLocaleString('kk-KZ')}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;"></td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="kk">
<head>
<meta charset="UTF-8">
<title>Жүк құжаты ${request.request_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #111; background: #fff; padding: 20px; }
  .doc { max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #913831; }
  .company { }
  .company-name { font-size: 18px; font-weight: 800; color: #111; }
  .company-name span { color: #913831; }
  .company-sub { font-size: 10px; color: #666; margin-top: 2px; }
  .doc-info { text-align: right; }
  .doc-title { font-size: 16px; font-weight: 800; color: #913831; }
  .doc-num { font-size: 11px; color: #666; margin-top: 2px; }
  
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background: #f8f8f8; padding: 16px; border-radius: 8px; border: 1px solid #eee; }
  .info-row { }
  .info-label { font-size: 10px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-value { font-size: 12px; font-weight: 600; margin-top: 2px; }
  
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #913831; margin-bottom: 8px; }
  
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #913831; color: #fff; }
  thead th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #7a2e28; }
  tbody tr:nth-child(even) { background: #fafafa; }
  
  .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 32px; }
  .sig-block { border-top: 1px solid #333; padding-top: 8px; }
  .sig-label { font-size: 10px; color: #666; margin-bottom: 4px; }
  .sig-name { font-size: 11px; font-weight: 600; }
  .sig-line { border-bottom: 1px solid #aaa; margin: 20px 0 4px; }
  
  .stamp-area { border: 2px dashed #ddd; border-radius: 8px; padding: 16px; text-align: center; color: #ccc; font-size: 10px; margin-top: 16px; height: 80px; display: flex; align-items: center; justify-content: center; }
  
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
  
  .status-tag { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; }
  
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
    .doc { max-width: 100%; }
  }
</style>
</head>
<body>
<div class="doc">
  <!-- Print button -->
  <div class="no-print" style="margin-bottom:16px;display:flex;gap:10px;">
    <button onclick="window.print()" style="background:#913831;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">🖨️ Басып шығару</button>
    <button onclick="window.close()" style="background:#f3f4f6;color:#333;border:1px solid #ddd;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;">Жабу</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="company">
      <div class="company-name">PRO<span>M</span> SPECSTROY</div>
      <div class="company-sub">Құрылыс компаниясы | Строительная компания</div>
    </div>
    <div class="doc-info">
      <div class="doc-title">ЖҮК ҚҰЖАТЫ (НАКЛАДНАЯ)</div>
      <div class="doc-num">№ ${request.request_number}</div>
      <div class="doc-num">${dateStr}, ${timeStr}</div>
      <div style="margin-top:6px;"><span class="status-tag">✓ Расталды</span></div>
    </div>
  </div>

  <!-- Info -->
  <div class="info-grid">
    <div class="info-row">
      <div class="info-label">Нысан (Объект)</div>
      <div class="info-value">${request.project_name}</div>
      ${request.project_location ? `<div style="font-size:10px;color:#888;margin-top:2px;">${request.project_location}</div>` : ''}
    </div>
    <div class="info-row">
      <div class="info-label">Заявка түрі</div>
      <div class="info-value">${request.request_type === 'issuance' ? 'Қоймадан беру' : 'Закуп (Сатып алу)'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Жұмыс жүргізуші (Прораб)</div>
      <div class="info-value">${request.foreman_name}</div>
      ${request.foreman_phone ? `<div style="font-size:10px;color:#888;">${request.foreman_phone}</div>` : ''}
    </div>
    <div class="info-row">
      <div class="info-label">Растаған уақыты</div>
      <div class="info-value">${request.foreman_confirmed_at ? new Date(request.foreman_confirmed_at).toLocaleString('kk-KZ') : dateStr}</div>
    </div>
    ${request.storekeeper_name ? `
    <div class="info-row">
      <div class="info-label">Қоймашы (Кладовщик)</div>
      <div class="info-value">${request.storekeeper_name}</div>
    </div>` : ''}
    ${request.notes ? `
    <div class="info-row">
      <div class="info-label">Ескертпе</div>
      <div class="info-value">${request.notes}</div>
    </div>` : ''}
  </div>

  <!-- Materials table -->
  <div class="section-title">Материалдар тізімі</div>
  <table>
    <thead>
      <tr>
        <th style="width:40px;">№</th>
        <th>Материал атауы</th>
        <th style="width:120px;">Санат</th>
        <th style="width:80px;">Өлшем</th>
        <th style="width:80px;">Саны</th>
        <th style="width:100px;">Ескертпе</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-label">Берген (Кладовщик):</div>
      <div class="sig-name">${request.storekeeper_name || '________________'}</div>
      <div class="sig-line"></div>
      <div style="font-size:10px;color:#888;">Қолы / Подпись</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Алған (Прораб):</div>
      <div class="sig-name">${request.foreman_name}</div>
      <div class="sig-line"></div>
      <div style="font-size:10px;color:#888;">Қолы / Подпись</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Бекітті (Директор):</div>
      <div class="sig-name">________________</div>
      <div class="sig-line"></div>
      <div style="font-size:10px;color:#888;">Қолы / Подпись</div>
    </div>
  </div>

  <div class="footer">
    <span>Prom Spec Stroy ERP — ${dateStr}</span>
    <span>Заявка № ${request.request_number} | Құжат жасалды: ${timeStr}</span>
  </div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
