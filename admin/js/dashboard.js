/* ============================================================
   VKREATE Admin — Dashboard Page
   ============================================================ */

const Dashboard = {

  render() {
    const projects  = DB.projects.all();
    const revStats  = DB.reviews.stats();
    const inqStats  = DB.inquiries.stats();
    const analytics = DB.analytics.summary();
    const recent    = this._recentActivity();

    const content = document.getElementById('main-content');
    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back, ${DB.auth.session.get()?.email?.split('@')[0] || 'Admin'} — here's what's happening</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="App.navigate('analytics')">
            ${UI.icon('chart')} View Analytics
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('projects-add')">
            ${UI.icon('plus')} New Project
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        ${this._statCard('Total Projects', projects.length, '🏗️', '#EFF6FF', revStats.total > 0 ? '+' + projects.length + ' total' : '', 'neutral', 'Projects in portfolio')}
        ${this._statCard('Pending Reviews', revStats.pending, '⏳', '#FFFBEB', revStats.pending > 0 ? 'Action needed' : 'All clear', revStats.pending > 0 ? 'down' : 'up', 'Awaiting your approval')}
        ${this._statCard('Monthly Visitors', analytics.visitors30.toLocaleString(), '👁', '#F0FDF4', '+12% vs last month', 'up', 'Unique website visitors')}
        ${this._statCard('Open Inquiries', inqStats.new + inqStats.contacted, '📬', '#FFF7ED', inqStats.won + ' won this month', 'up', 'Leads in pipeline')}
      </div>

      <!-- Quick Actions -->
      <div class="mb-24">
        <h3 class="fw-600 text-sm text-muted mb-16" style="text-transform:uppercase;letter-spacing:.08em">Quick Actions</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
          ${this._quickCard('➕', 'Add Project', 'Upload a new portfolio project', 'projects-add', '#EFF6FF')}
          ${this._quickCard('⭐', 'Review Queue', revStats.pending + ' pending approval', 'reviews', '#FFFBEB')}
          ${this._quickCard('📬', 'Inquiries', inqStats.new + ' new messages', 'inquiries', '#F0FDF4')}
          ${this._quickCard('📊', 'Analytics', 'View traffic & engagement', 'analytics', '#FFF7ED')}
        </div>
      </div>

      <!-- Two column: Activity + Pipeline -->
      <div class="two-col mb-24">
        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Recent Activity</span>
            <span class="text-xs text-muted">Last 10 events</span>
          </div>
          <div class="card-body" style="padding-top:8px;padding-bottom:8px">
            ${recent.length ? recent.map(a => `
              <div class="activity-item">
                <div class="activity-dot" style="background:${a.color}"></div>
                <div>
                  <div class="activity-text">${a.text}</div>
                  <div class="activity-time">${UI.timeAgo(a.date)}</div>
                </div>
              </div>`).join('') : '<div class="empty-state"><div class="empty-state__icon">📋</div><p class="empty-state__text">No recent activity</p></div>'}
          </div>
        </div>

        <!-- Inquiry Pipeline -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Inquiry Pipeline</span>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('inquiries')">View All</button>
          </div>
          <div class="card-body">
            ${this._pipelineCard(inqStats)}
          </div>
        </div>
      </div>

      <!-- Projects Overview + Review Snapshot -->
      <div class="two-col">
        <!-- Top Projects -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Projects Overview</span>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('projects')">Manage</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>Project</th><th>Status</th><th>Views</th><th>Leads</th>
              </tr></thead>
              <tbody>
                ${projects.slice(0,5).map(p => `
                  <tr>
                    <td class="td-name">${p.name}</td>
                    <td>${UI.badge(p.status)}</td>
                    <td>${(p.views||0).toLocaleString()}</td>
                    <td>${p.leads||0}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Review Stats -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Reviews Snapshot</span>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('reviews')">Manage</button>
          </div>
          <div class="card-body">
            ${this._reviewSnapshot(revStats)}
          </div>
        </div>
      </div>
    `;
  },

  _statCard(label, value, icon, iconBg, trend, trendDir, sub) {
    return `
      <div class="stat-card">
        <div class="stat-card__top">
          <span class="stat-card__label">${label}</span>
          <div class="stat-card__icon" style="background:${iconBg}">${icon}</div>
        </div>
        <div class="stat-card__value">${value}</div>
        <div class="stat-card__trend ${trendDir}">
          ${trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '—'}
          <span>${trend}</span>
        </div>
      </div>`;
  },

  _quickCard(icon, title, sub, page, bg) {
    return `
      <div class="quick-card" onclick="App.navigate('${page}')">
        <div class="quick-card__icon" style="background:${bg};font-size:1.35rem">${icon}</div>
        <div>
          <div class="quick-card__title">${title}</div>
          <div class="quick-card__sub">${sub}</div>
        </div>
      </div>`;
  },

  _pipelineCard(stats) {
    const stages = [
      { key: 'new',       label: 'New',       color: '#3B82F6' },
      { key: 'contacted', label: 'Contacted', color: '#8B5CF6' },
      { key: 'quoted',    label: 'Quoted',    color: '#F59E0B' },
      { key: 'won',       label: 'Won',       color: '#22C55E' },
      { key: 'lost',      label: 'Lost',      color: '#EF4444' },
    ];
    return `
      <div style="display:flex;flex-direction:column;gap:12px">
        ${stages.map(s => `
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:70px;font-size:.75rem;color:var(--text-3);font-weight:600;text-transform:uppercase;letter-spacing:.06em">${s.label}</div>
            <div class="progress" style="flex:1">
              <div class="progress-bar" style="background:${s.color};width:${Math.min(100, (stats[s.key]||0) * 25)}%"></div>
            </div>
            <div style="width:20px;text-align:right;font-weight:700;font-size:.875rem;color:var(--text-1)">${stats[s.key]||0}</div>
          </div>`).join('')}
      </div>`;
  },

  _reviewSnapshot(stats) {
    const bars = [
      { label: '5 ★', color: '#22C55E', count: DB.reviews.all().filter(r=>r.rating===5).length },
      { label: '4 ★', color: '#86EFAC', count: DB.reviews.all().filter(r=>r.rating===4).length },
      { label: '3 ★', color: '#F59E0B', count: DB.reviews.all().filter(r=>r.rating===3).length },
      { label: '2 ★', color: '#F97316', count: DB.reviews.all().filter(r=>r.rating===2).length },
      { label: '1 ★', color: '#EF4444', count: DB.reviews.all().filter(r=>r.rating===1).length },
    ];
    const total = bars.reduce((s,b)=>s+b.count,0) || 1;
    return `
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:20px">
        <div style="text-align:center">
          <div style="font-family:var(--font-serif);font-size:3rem;font-weight:300;line-height:1;color:var(--gold)">${stats.avgRating}</div>
          <div style="color:var(--text-3);font-size:.75rem;margin-top:4px">Avg Rating</div>
          <div style="color:var(--text-4);font-size:.7rem">${stats.total} reviews</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          ${bars.map(b => `
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:28px;font-size:.7rem;color:var(--text-3)">${b.label}</div>
              <div class="progress" style="flex:1"><div class="progress-bar" style="background:${b.color};width:${Math.round(b.count/total*100)}%"></div></div>
              <div style="width:16px;font-size:.75rem;font-weight:600;color:var(--text-2);text-align:right">${b.count}</div>
            </div>`).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        ${[
          { label: 'Pending', val: stats.pending, color: '#F59E0B' },
          { label: 'Approved', val: stats.approved, color: '#22C55E' },
          { label: 'Rejected', val: stats.rejected, color: '#EF4444' },
        ].map(s => `
          <div style="background:var(--bg);border-radius:var(--r-md);padding:12px;text-align:center">
            <div style="font-family:var(--font-serif);font-size:1.5rem;font-weight:300;color:${s.color}">${s.val}</div>
            <div style="font-size:.7rem;color:var(--text-3);margin-top:2px">${s.label}</div>
          </div>`).join('')}
      </div>
    `;
  },

  _recentActivity() {
    const events = [];
    DB.reviews.all().slice(0,3).forEach(r => {
      events.push({
        text: `Review by <strong>${r.clientName}</strong> — "${r.reviewText.slice(0,50)}..."`,
        date: r.createdAt,
        color: r.status === 'approved' ? '#22C55E' : r.status === 'rejected' ? '#EF4444' : '#F59E0B',
      });
    });
    DB.inquiries.all().slice(0,3).forEach(i => {
      events.push({
        text: `New inquiry from <strong>${i.name}</strong> — ${i.industry}`,
        date: i.createdAt,
        color: '#3B82F6',
      });
    });
    DB.projects.all().slice(0,2).forEach(p => {
      events.push({
        text: `Project <strong>${p.name}</strong> — ${p.status}`,
        date: p.updatedAt,
        color: '#C9A96E',
      });
    });
    return events.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,10);
  },
};
