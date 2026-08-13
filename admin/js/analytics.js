/* ============================================================
   VKREATE Admin — Analytics Module
   ============================================================ */

const Analytics = {

  _charts: {},
  _range: 30,

  render() {
    const data     = DB.analytics.last(this._range);
    const projStats = DB.projects.all();
    const revStats  = DB.reviews.stats();
    const inqStats  = DB.inquiries.stats();
    const summary  = DB.analytics.summary();

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Analytics</h1>
          <p class="page-subtitle">Website performance and engagement overview</p>
        </div>
        <div class="page-actions">
          <div style="display:flex;gap:4px;background:var(--card);border:1px solid var(--border);border-radius:var(--r-md);padding:4px">
            ${[7,14,30].map(d => `
              <button class="btn btn-sm ${this._range===d?'btn-primary':'btn-ghost'}"
                onclick="Analytics._range=${d};Analytics.render()">
                ${d}D
              </button>`).join('')}
          </div>
          <button class="btn btn-outline btn-sm" onclick="Analytics.exportPDF()">
            ${UI.icon('download')} Export
          </button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid mb-24">
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__label">Total Visitors</span>
            <div class="stat-card__icon" style="background:#EFF6FF">👁️</div>
          </div>
          <div class="stat-card__value">${summary.visitors30.toLocaleString()}</div>
          <div class="stat-card__trend up">↑ Last 30 days</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__label">Page Views</span>
            <div class="stat-card__icon" style="background:#F0FDF4">📄</div>
          </div>
          <div class="stat-card__value">${summary.pageViews30.toLocaleString()}</div>
          <div class="stat-card__trend up">↑ Last 30 days</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__label">Review Rate</span>
            <div class="stat-card__icon" style="background:#FFFBEB">⭐</div>
          </div>
          <div class="stat-card__value">${revStats.avgRating}/5</div>
          <div class="stat-card__trend up">↑ ${revStats.approved} approved</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__label">Won Inquiries</span>
            <div class="stat-card__icon" style="background:#F0FDF4">🏆</div>
          </div>
          <div class="stat-card__value">${inqStats.won}</div>
          <div class="stat-card__trend neutral">— All time</div>
        </div>
      </div>

      <!-- Traffic Chart + Review Distribution -->
      <div class="two-col mb-24">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Website Traffic</span>
            <span class="text-xs text-muted">Visitors & Page Views</span>
          </div>
          <div class="card-body">
            <div class="chart-wrap"><canvas id="traffic-chart"></canvas></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Review Ratings</span>
            <span class="text-xs text-muted">Distribution</span>
          </div>
          <div class="card-body">
            <div class="chart-wrap" style="height:220px"><canvas id="rating-chart"></canvas></div>
            <div style="text-align:center;margin-top:12px">
              <div style="font-family:var(--font-serif);font-size:2.5rem;font-weight:300;color:var(--gold)">${revStats.avgRating}</div>
              <div class="text-xs text-muted">${revStats.total} reviews · Average rating</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Engagement + Inquiry Funnel -->
      <div class="two-col mb-24">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Project Engagement</span>
            <span class="text-xs text-muted">Views by project</span>
          </div>
          <div class="card-body">
            <div class="chart-wrap"><canvas id="project-chart"></canvas></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Inquiry Funnel</span>
            <span class="text-xs text-muted">Lead conversion</span>
          </div>
          <div class="card-body">
            <div class="chart-wrap"><canvas id="funnel-chart"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Top Projects Table -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Top Projects by Engagement</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Project</th><th>Industry</th><th>Status</th>
              <th>Views</th><th>Clicks</th><th>Leads</th><th>Engagement</th>
            </tr></thead>
            <tbody>
              ${projStats.sort((a,b)=>(b.views||0)-(a.views||0)).map(p => {
                const rate = p.views ? ((p.clicks||0)/p.views*100).toFixed(1) : 0;
                return `<tr>
                  <td class="td-name">${p.name}</td>
                  <td class="text-sm text-muted">${p.industryLabel||p.industry}</td>
                  <td>${UI.badge(p.status)}</td>
                  <td class="fw-600">${(p.views||0).toLocaleString()}</td>
                  <td>${(p.clicks||0).toLocaleString()}</td>
                  <td>${p.leads||0}</td>
                  <td style="min-width:140px">
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="progress" style="flex:1">
                        <div class="progress-bar gold" style="width:${Math.min(100,rate)}%"></div>
                      </div>
                      <span class="text-xs text-muted">${rate}%</span>
                    </div>
                  </td>
                </tr>`;}).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render charts after DOM is ready
    requestAnimationFrame(() => this._renderCharts(data, revStats, projStats, inqStats));
  },

  _renderCharts(data, revStats, projStats, inqStats) {
    if (typeof Chart === 'undefined') {
      document.querySelectorAll('.chart-wrap').forEach(el => {
        el.innerHTML = '<div class="empty-state" style="height:100%"><div class="empty-state__text">Chart.js not loaded.</div></div>';
      });
      return;
    }

    const gold   = '#C9A96E';
    const green  = '#2E4A40';
    const green2 = '#3D5C50';
    const labels  = data.map(d => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-IN', { month:'short', day:'numeric' });
    });

    // Destroy existing charts
    Object.values(this._charts).forEach(c => { try { c.destroy(); } catch{} });
    this._charts = {};

    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#6B7B76';

    // Traffic line chart
    this._charts.traffic = new Chart(document.getElementById('traffic-chart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Visitors',
            data: data.map(d => d.visitors),
            borderColor: green,
            backgroundColor: 'rgba(46,74,64,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: green,
          },
          {
            label: 'Page Views',
            data: data.map(d => d.pageViews),
            borderColor: gold,
            backgroundColor: 'rgba(201,169,110,0.06)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: gold,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 10, usePointStyle: true } } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 20 }, beginAtZero: true }
        }
      }
    });

    // Rating doughnut
    const ratingCounts = [5,4,3,2,1].map(n => DB.reviews.all().filter(r=>r.rating===n).length);
    this._charts.rating = new Chart(document.getElementById('rating-chart'), {
      type: 'doughnut',
      data: {
        labels: ['5★','4★','3★','2★','1★'],
        datasets: [{
          data: ratingCounts,
          backgroundColor: ['#22C55E','#86EFAC','#F59E0B','#F97316','#EF4444'],
          borderWidth: 0,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } } }
      }
    });

    // Project bar chart
    const sortedProj = [...projStats].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,6);
    this._charts.projects = new Chart(document.getElementById('project-chart'), {
      type: 'bar',
      data: {
        labels: sortedProj.map(p => p.name.split('—')[0].trim().slice(0,16) + (p.name.length>16?'…':'')),
        datasets: [
          { label: 'Views',  data: sortedProj.map(p=>p.views||0),  backgroundColor: green, borderRadius: 6 },
          { label: 'Clicks', data: sortedProj.map(p=>p.clicks||0), backgroundColor: gold,  borderRadius: 6 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 10, usePointStyle: true } } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }
        }
      }
    });

    // Inquiry funnel horizontal bar
    const funnelStages = ['New','Contacted','Quoted','Won','Lost'];
    const funnelCounts = [inqStats.new, inqStats.contacted, inqStats.quoted, inqStats.won, inqStats.lost];
    this._charts.funnel = new Chart(document.getElementById('funnel-chart'), {
      type: 'bar',
      data: {
        labels: funnelStages,
        datasets: [{
          label: 'Inquiries',
          data: funnelCounts,
          backgroundColor: ['#3B82F6','#8B5CF6','#F59E0B','#22C55E','#EF4444'],
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 1 } },
          y: { grid: { display: false } }
        }
      }
    });
  },

  exportPDF() {
    UI.toast('Analytics export — print the page using Ctrl+P to save as PDF.', 'info');
    setTimeout(() => window.print(), 800);
  },
};
