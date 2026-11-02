import React, { useEffect, useState, useMemo } from 'react';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { getActivityLogs } from '../utils/activityLogsApi.js';

const statToneClass = {
  danger: 'text-[#ff9b8d] bg-[#ff9b8d]/10 border-[#ff9b8d]/20',
  energy: 'text-[#73ffba] bg-[#73ffba]/10 border-[#73ffba]/20',
  network: 'text-[#72e7ff] bg-[#72e7ff]/10 border-[#72e7ff]/20',
  success: 'text-[#73ffba] bg-[#73ffba]/10 border-[#73ffba]/20',
};

const moduleIconName = {
  'Street Lights': 'street',
  Areas: 'map',
  Automation: 'automation',
  Reports: 'report',
  'System/Auth': 'settings',
};

function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-lg border border-cyan-200/12 bg-[#07131f]/82 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function StatusBadge({ status }) {
  let badgeStyle = 'border-slate-500/30 bg-slate-500/10 text-slate-300';

  if (status === 'Success') {
    badgeStyle = 'border-[#73ffba]/30 bg-[#73ffba]/10 text-[#73ffba]';
  } else if (status === 'Warning') {
    badgeStyle = 'border-amber-400/30 bg-amber-400/10 text-amber-300';
  } else if (status === 'Error') {
    badgeStyle = 'border-[#ff9b8d]/30 bg-[#ff9b8d]/10 text-[#ff9b8d]';
  } else if (status === 'Info') {
    badgeStyle = 'border-[#72e7ff]/30 bg-[#72e7ff]/10 text-[#72e7ff]';
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-extrabold ${badgeStyle}`}
    >
      {status}
    </span>
  );
}

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [activitySummaryCards, setActivitySummaryCards] = useState([]);
  const [activityFilterOptions, setActivityFilterOptions] = useState({ dateRanges: [], statusTypes: [], modules: [], areas: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Filter States
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [searchQuery, setSearchQuery] = useState('');

  // Applied Filter States
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: 'all',
    status: 'all',
    module: 'All Modules',
    area: 'All Areas',
    search: '',
  });

  // Modal States
  const [selectedLogForModal, setSelectedLogForModal] = useState(null);
  const [exportNotice, setExportNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getActivityLogs(appliedFilters).then((data) => {
      if (!cancelled) {
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setActivitySummaryCards(Array.isArray(data.summaryCards) ? data.summaryCards : []);
        setActivityFilterOptions(data.filterOptions || { dateRanges: [], statusTypes: [], modules: [], areas: [] });
        setLoadError('');
      }
    }).catch((error) => { if (!cancelled) { setLogs([]); setLoadError(error.message); } }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [appliedFilters]);

  useEffect(() => {
    const timer = window.setInterval(() => setAppliedFilters((current) => ({ ...current })), 15000);
    return () => window.clearInterval(timer);
  }, []);

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedFilters({
      dateRange: selectedDateRange,
      status: selectedStatus,
      module: selectedModule,
      area: selectedArea,
      search: searchQuery.trim().toLowerCase(),
    });
  };

  const handleResetFilters = () => {
    setSelectedDateRange('all');
    setSelectedStatus('all');
    setSelectedModule('All Modules');
    setSelectedArea('All Areas');
    setSearchQuery('');
    setAppliedFilters({
      dateRange: 'all',
      status: 'all',
      module: 'All Modules',
      area: 'All Areas',
      search: '',
    });
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchStatus =
        appliedFilters.status === 'all' || log.status === appliedFilters.status;
      const matchModule =
        appliedFilters.module === 'All Modules' || log.module === appliedFilters.module;
      const matchArea =
        appliedFilters.area === 'All Areas' ||
        log.area === appliedFilters.area ||
        log.area === 'All Areas';
      
      const matchSearch =
        !appliedFilters.search ||
        log.id.toLowerCase().includes(appliedFilters.search) ||
        log.activity.toLowerCase().includes(appliedFilters.search) ||
        log.module.toLowerCase().includes(appliedFilters.search) ||
        log.area.toLowerCase().includes(appliedFilters.search) ||
        log.userOrSystem.toLowerCase().includes(appliedFilters.search);

      return matchStatus && matchModule && matchArea && matchSearch;
    });
  }, [logs, appliedFilters]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Activity', 'Module', 'Area', 'Triggered By', 'Status'];
    const rows = filteredLogs.map((item) => [
      `"${item.id}"`,
      `"${item.timestamp}"`,
      `"${item.activity.replace(/"/g, '""')}"`,
      `"${item.module}"`,
      `"${item.area}"`,
      `"${item.userOrSystem}"`,
      `"${item.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ApexStreet_ActivityLogs_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Activity logs downloaded as CSV!');
    setTimeout(() => setExportNotice(''), 4000);
  };

  // Export JSON Handler
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ApexStreet_ActivityLogs_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Activity logs downloaded as JSON!');
    setTimeout(() => setExportNotice(''), 4000);
  };

  return (
    <AppShell activePage="Activity Logs" title="Activity Logs">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {isLoading ? <div className="rounded-md border border-cyan-200/12 bg-cyan-300/5 px-4 py-3 text-sm font-semibold text-slate-300">Loading activity logs…</div> : null}
        {loadError ? <div className="rounded-md border border-[#ff9b8d]/25 bg-[#ff9b8d]/10 px-4 py-3 text-sm font-semibold text-[#ffb4a8]">{loadError}</div> : null}
        
        {/* 1. PAGE HEADER */}
        <div className="flex flex-col gap-4 border-b border-cyan-200/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-300/10 text-[#72e7ff]">
                <DashboardIcon className="size-5" name="activity" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">System Activity Logs</h1>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-400">
              Audit trail recording automated triggers, user actions, system alerts, hardware events, and status updates.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {exportNotice ? (
              <span className="rounded-md border border-[#73ffba]/30 bg-[#73ffba]/10 px-3 py-1.5 text-xs font-extrabold text-[#73ffba]">
                {exportNotice}
              </span>
            ) : null}

            <span className="rounded-md border border-cyan-200/12 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
              Read-only audit trail
            </span>
            <div className="relative inline-flex rounded-md shadow-sm">
              <button
                className="flex items-center gap-2 rounded-l-md border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#72e7ff] transition hover:bg-cyan-300/20"
                type="button"
                onClick={handleExportCSV}
                disabled={filteredLogs.length === 0}
              >
                <DashboardIcon className="size-4" name="save" />
                <span>Export CSV</span>
              </button>
              <button
                className="flex items-center gap-2 rounded-r-md border border-l-0 border-cyan-200/20 bg-[#09151f] px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-cyan-300/10 hover:text-[#72e7ff]"
                type="button"
                onClick={handleExportJSON}
                disabled={filteredLogs.length === 0}
                title="Export as JSON"
              >
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activitySummaryCards.map((card) => (
            <Panel className="p-4" key={card.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <span
                  className={`grid size-9 place-items-center rounded-lg border ${
                    statToneClass[card.tone]
                  }`}
                >
                  <DashboardIcon className="size-4" name={card.icon} />
                </span>
              </div>
              <div className="mt-3">
                <strong className="text-2xl font-black text-slate-50">{card.value}</strong>
                <p className="mt-1 text-xs font-medium text-slate-400">{card.subtext}</p>
                <p className="mt-2 text-[0.72rem] font-bold text-[#72e7ff]">{card.trend}</p>
              </div>
            </Panel>
          ))}
        </div>

        {/* 5 & 6. SEARCH & FILTERS */}
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
                Audit Filters
              </p>
              <h3 className="text-lg font-black text-slate-50">Filter Activity Logs</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredLogs.length} of {logs.length} records
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="log-search">
                Keyword Search
              </label>
              <input
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-[#72e7ff] focus:outline-none"
                id="log-search"
                type="text"
                placeholder="Search activity, module, user, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="log-daterange">
                Date Range
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="log-daterange"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                {activityFilterOptions.dateRanges.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Type */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="log-status">
                Status / Level
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="log-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {activityFilterOptions.statusTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Module */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="log-module">
                Module
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="log-module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                {activityFilterOptions.modules.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="log-area">
                Area Scope
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="log-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                {activityFilterOptions.areas.map((areaName) => (
                  <option key={areaName} value={areaName}>
                    {areaName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="flex items-center gap-1.5 rounded-md border border-cyan-200/20 bg-[#72e7ff] px-4 py-2 text-xs font-black uppercase text-[#041018] shadow-[0_0_20px_rgba(114,231,255,0.25)] transition hover:bg-[#8df0ff]"
              type="button"
              onClick={handleApplyFilters}
            >
              <DashboardIcon className="size-3.5" name="search" />
              <span>Apply Filters</span>
            </button>
            <button
              className="rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
              type="button"
              onClick={handleResetFilters}
            >
              <span>Reset</span>
            </button>
          </div>
        </Panel>

        {/* 3 & 4. ACTIVITY LOG TABLE */}
        <Panel className="p-5 lg:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-50">Audit Trail Records</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyan-200/12 text-slate-400">
                  <th className="pb-3 font-bold uppercase tracking-wider">Log ID</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Date & Time</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Activity Description</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Module</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Area</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Triggered By</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-200/8 text-slate-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      className="group cursor-pointer transition hover:bg-cyan-300/5"
                      key={log.id}
                      onClick={() => setSelectedLogForModal(log)}
                    >
                      <td className="py-3.5 font-mono font-bold text-[#72e7ff]">{log.id}</td>
                      <td className="py-3.5 font-mono font-semibold text-slate-300">{log.timestamp}</td>
                      <td className="py-3.5 max-w-xs font-bold text-slate-100 sm:max-w-md">
                        {log.activity}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                          <DashboardIcon
                            className="size-3.5 text-[#72e7ff]"
                            name={moduleIconName[log.module] || 'grid'}
                          />
                          {log.module}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-300">{log.area}</td>
                      <td className="py-3.5 font-medium text-slate-400">{log.userOrSystem}</td>
                      <td className="py-3.5">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          className="rounded-md border border-cyan-200/16 bg-[#09151f] px-2.5 py-1 text-[0.7rem] font-extrabold text-[#72e7ff] transition hover:bg-cyan-300/10 group-hover:border-cyan-200/30"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLogForModal(log);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-8 text-center text-slate-400" colSpan={8}>
                      {logs.length === 0 ? (
                        <div>
                          <p className="text-sm font-bold text-slate-300">No activity logs recorded.</p>
                        </div>
                      ) : (
                        'No activity records match the selected filter parameters.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* 7. ACTIVITY DETAILS MODAL */}
        {selectedLogForModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-lg border border-cyan-200/20 bg-[#07131f] p-6 shadow-2xl">
              <div className="flex items-start justify-between border-b border-cyan-200/12 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#72e7ff]">
                      {selectedLogForModal.id}
                    </span>
                    <StatusBadge status={selectedLogForModal.status} />
                  </div>
                  <h3 className="mt-1 text-lg font-black text-slate-50">Activity Log Details</h3>
                </div>
                <button
                  className="grid size-8 place-items-center rounded-md border border-cyan-200/16 bg-[#09151f] text-slate-400 hover:text-slate-100"
                  type="button"
                  onClick={() => setSelectedLogForModal(null)}
                >
                  <DashboardIcon className="size-4" name="x" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* Full Description */}
                <div className="rounded-md border border-cyan-200/10 bg-[#09151f] p-3.5">
                  <span className="block text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-400">
                    Activity Description
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-100">{selectedLogForModal.activity}</p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-cyan-200/10 bg-[#09151f] p-3">
                    <span className="block text-[0.68rem] font-bold text-slate-400">Timestamp</span>
                    <span className="mt-0.5 block font-mono font-bold text-[#72e7ff]">
                      {selectedLogForModal.timestamp}
                    </span>
                  </div>

                  <div className="rounded-md border border-cyan-200/10 bg-[#09151f] p-3">
                    <span className="block text-[0.68rem] font-bold text-slate-400">Module</span>
                    <span className="mt-0.5 block font-bold text-slate-200">
                      {selectedLogForModal.module}
                    </span>
                  </div>

                  <div className="rounded-md border border-cyan-200/10 bg-[#09151f] p-3">
                    <span className="block text-[0.68rem] font-bold text-slate-400">Area Scope</span>
                    <span className="mt-0.5 block font-bold text-slate-200">
                      {selectedLogForModal.area}
                    </span>
                  </div>

                  <div className="rounded-md border border-cyan-200/10 bg-[#09151f] p-3">
                    <span className="block text-[0.68rem] font-bold text-slate-400">Triggered By</span>
                    <span className="mt-0.5 block font-bold text-slate-200">
                      {selectedLogForModal.userOrSystem}
                    </span>
                  </div>

                  <div className="rounded-md border border-cyan-200/10 bg-[#09151f] p-3">
                    <span className="block text-[0.68rem] font-bold text-slate-400">Affected Light</span>
                    <span className="mt-0.5 block font-mono font-bold text-[#72e7ff]">
                      {selectedLogForModal.target || selectedLogForModal.details?.lightId || 'Area-wide'}
                    </span>
                  </div>
                </div>

                {/* Technical Details / Payload */}
                {selectedLogForModal.details ? (
                  <div className="rounded-md border border-cyan-200/10 bg-[#09151f] p-3.5">
                    <span className="mb-2 block text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-400">
                      Technical Details & Payload
                    </span>
                    <div className="space-y-1.5 font-mono text-[0.72rem]">
                      {Object.entries(selectedLogForModal.details).map(([key, val]) => (
                        <div className="flex justify-between border-b border-cyan-200/6 pb-1" key={key}>
                          <span className="text-slate-400">{key}:</span>
                          <span className="font-semibold text-slate-200">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-md border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-[#72e7ff] transition hover:bg-cyan-300/20"
                  type="button"
                  onClick={() => setSelectedLogForModal(null)}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </AppShell>
  );
}

export default ActivityLogs;
