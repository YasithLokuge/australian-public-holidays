const API_URL = 'https://data.gov.au/data/api/action/datastore_search?resource_id=33673aca-0857-42e5-b8f0-9981b4755686&limit=10000';
const yearSelect = document.getElementById('yearSelect');
const jurisdictionSelect = document.getElementById('jurisdictionSelect');
const holidaysTableBody = document.querySelector('#holidaysTable tbody');
const refreshBtn = document.getElementById('refreshBtn');
const statusEl = document.getElementById('status');
let holidays = [];

async function fetchHolidays() {
  setStatus('Fetching data...');
  try {
    const res = await fetch(API_URL, {cache: 'no-store'});
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!data || !data.result || !Array.isArray(data.result.records)) throw new Error('Unexpected API response');
    holidays = data.result.records;
    populateFilters();
    displayHolidays();
    setStatus(`Loaded ${holidays.length} records`);
  } catch (err) {
    console.error(err);
    holidays = [];
    holidaysTableBody.innerHTML = '<tr><td colspan="4" class="center">Error loading data</td></tr>';
    setStatus('Error: ' + err.message);
  }
}

function populateFilters() {
  // years: extract YYYY from Date if present and valid
  const years = [...new Set(holidays.map(h => (h.Date && typeof h.Date === 'string' && h.Date.length >= 4) ? h.Date.slice(0,4) : null).filter(Boolean))].sort();
  const jurisdictions = [...new Set(holidays.map(h => h.Jurisdiction).filter(Boolean))].sort();

  // reset selects but keep the first "All" option
  clearSelect(yearSelect);
  clearSelect(jurisdictionSelect);

  years.forEach(y => yearSelect.appendChild(optionFor(y, y)));
  jurisdictions.forEach(j => yearSelect.ownerDocument && jurisdictionSelect.appendChild(optionFor(j, j.toUpperCase())));
}

function clearSelect(sel){
  sel.innerHTML = '';
  const opt = document.createElement('option'); opt.value=''; opt.textContent='All'; sel.appendChild(opt);
}

function optionFor(value, text){
  const o = document.createElement('option'); o.value = value; o.textContent = text; return o;
}

function displayHolidays(){
  const selectedYear = yearSelect.value;
  const selectedJur = jurisdictionSelect.value;

  const filtered = holidays.filter(h => {
    const yearMatch = !selectedYear || (h.Date && h.Date.startsWith(selectedYear));
    const jurMatch = !selectedJur || (h.Jurisdiction === selectedJur);
    return yearMatch && jurMatch;
  });

  if (filtered.length === 0) {
    holidaysTableBody.innerHTML = '<tr><td colspan="4" class="center">No holidays found</td></tr>';
    return;
  }

  holidaysTableBody.innerHTML = filtered.map(h => {
    const dateCell = formatDateHuman(h.Date);
    const name = escapeHtml(h['Holiday Name']) || 'N/A';
    const info = escapeHtml(h['Information']) || 'N/A';
    const more = h['More Information'] ? `<a href="${escapeAttr(h['More Information'])}" target="_blank" rel="noopener">More Info</a>` : 'N/A';

    return `<tr>\n<td>${dateCell}</td>\n<td>${name}</td>\n<td>${info}</td>\n<td>${more}</td>\n</tr>`;
  }).join('');
}

function formatDateHuman(dateStr){
  if (!dateStr || typeof dateStr !== 'string') return 'N/A';
  // accept YYYYMMDD or YYYY-MM-DD or similar
  let y,m,d;
  if (/^\d{8}$/.test(dateStr)){
    y = parseInt(dateStr.slice(0,4),10);
    m = parseInt(dateStr.slice(4,6),10) - 1;
    d = parseInt(dateStr.slice(6,8),10);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)){
    [y,m,d] = dateStr.split('-').map(Number);
    m = m - 1;
  } else {
    // try parsing loosely
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())){
      return parsed.toLocaleDateString('en-AU', {weekday:'long', day:'numeric', month:'long'});
    }
    return 'N/A';
  }

  const date = new Date(y,m,d);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-AU', {weekday:'long', day:'numeric', month:'long'});
}

function escapeHtml(s){ if (!s && s !== 0) return ''; return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s){ return encodeURI(s); }

// event listeners
yearSelect.addEventListener('change', displayHolidays);
jurisdictionSelect.addEventListener('change', displayHolidays);
refreshBtn.addEventListener('click', fetchHolidays);

// helpers
function setStatus(msg){ if (statusEl) statusEl.textContent = msg; }

// initial load
fetchHolidays();
