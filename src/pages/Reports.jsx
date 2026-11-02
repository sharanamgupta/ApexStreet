import React, { useEffect, useState, useMemo } from 'react';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { reportsApi } from '../utils/reportsApi.js';

const emptyReport = {
  summaryCards: [],
  filterOptions: { dateRanges: [], areas: ['All Areas'], reportTypes: [] },
  performance: { totalLights: 0, operationalLights: 0, faultyLights: 0, statusBreakdown: [], modeSplit: { autoCount: 0, autoPercentage: 0, manualCount: 0, manualPercentage: 0 }, averageBrightnessByHour: [] },
  areaReports: [],
  automation: { automatedLightsCount: 0, totalActionsLogged: 0, autoTurnedOn: 0, autoTurnedOff: 0, brightnessAdjustments: 0, recentAutomationActions: [] },
  faults: { summary: { totalFaults: 0, activeFaults: 0, resolvedFaults: 0, criticalFaults: 0 }, faultsByArea: [], recentFaultRecords: [] },
  activities: [],
};

const statToneClass = {
  danger: 'text-[#ff9b8d] bg-[#ff9b8d]/10 border-[#ff9b8d]/20',
  energy: 'text-[#73ffba] bg-[#73ffba]/10 border-[#73ffba]/20',
  muted: 'text-slate-300 bg-slate-400/10 border-slate-300/15',
  network: 'text-[#72e7ff] bg-[#72e7ff]/10 border-[#72e7ff]/20',
  success: 'text-[#73ffba] bg-[#73ffba]/10 border-[#73ffba]/20',
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

function SectionHeading({ kicker, title, action }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <p className="mb-1 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
          {kicker}
        </p>
        <h2 className="text-xl font-black leading-tight text-slate-50">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }) {
  let badgeStyle = 'border-slate-500/30 bg-slate-500/10 text-slate-300';

  if (['Operational', 'Active', 'Completed', 'Success', 'High Efficiency'].includes(status)) {
    badgeStyle = 'border-[#73ffba]/30 bg-[#73ffba]/10 text-[#73ffba]';
  } else if (['Attention Required', 'Critical', 'High', 'Active'].includes(status)) {
    badgeStyle = 'border-[#ff9b8d]/30 bg-[#ff9b8d]/10 text-[#ff9b8d]';
  } else if (['In Progress', 'Medium', 'Exported', 'Flagged'].includes(status)) {
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

function BrightnessCurve({ points }) {
  if (!Array.isArray(points) || points.length === 0) {
    return <div className="grid h-52 place-items-center rounded-md border border-dashed border-cyan-200/12 text-xs font-semibold text-slate-500">No brightness data available for the selected report scope.</div>;
  }

  const width = 360;
  const height = 190;
  const padding = { top: 18, right: 14, bottom: 34, left: 28 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const coords = points.map((point, index) => ({
    ...point,
    x: padding.left + (index / Math.max(points.length - 1, 1)) * plotWidth,
    y: padding.top + (1 - point.brightness / 100) * plotHeight,
  }));
  const linePath = coords.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = coords[index - 1];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
  }, '');
  const areaPath = `${linePath} L ${coords.at(-1).x} ${height - padding.bottom} L ${coords[0].x} ${height - padding.bottom} Z`;

  return (
    <div className="relative h-52" aria-label="Scheduled brightness curve from 6 PM to 6 AM">
      <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Brightness percentage across the scheduled hours">
        {[0, 25, 50, 75, 100].map((value) => {
          const y = padding.top + (1 - value / 100) * plotHeight;
          return <g key={value}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="3 4" /><text x="0" y={y + 3} fill="#94a3b8" fontSize="8">{value}</text></g>;
        })}
        <path d={areaPath} fill="#72e7ff" fillOpacity="0.12" />
        <path d={linePath} fill="none" stroke="#72e7ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((point) => <g key={point.hour}><circle cx={point.x} cy={point.y} r="4.5" fill="#07131f" stroke="#72e7ff" strokeWidth="2" /><text x={point.x} y={height - 8} fill="#94a3b8" fontSize="8" fontWeight="700" textAnchor="middle">{point.hour}</text><text x={point.x} y={point.y - 9} fill="#d7f8ff" fontSize="8" fontWeight="700" textAnchor="middle">{point.brightness}%</text></g>)}
      </svg>
    </div>
  );
}

function AreaAnalytics({ areas }) {
  if (areas.length === 0) return null;

  const maxLights = Math.max(...areas.map((area) => area.totalLights), 1);
  const maxEnergy = Math.max(...areas.map((area) => Number.parseFloat(area.energySaved)), 1);

  return (
    <div className="mb-6 grid gap-4 xl:grid-cols-2">
      <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100">Operational Coverage by Area</h4>
            <p className="mt-1 text-xs text-slate-400">Active fixtures against each zone's installed lights.</p>
          </div>
          <DashboardIcon className="size-5 text-[#72e7ff]" name="chart" />
        </div>
        <div className="mt-5 space-y-4">
          {areas.map((area) => {
            const activePercent = Math.round((area.activeLights / area.totalLights) * 100);
            return (
              <div key={area.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <strong className="truncate text-slate-200">{area.area}</strong>
                  <span className="shrink-0 font-black text-[#73ffba]">{activePercent}% <span className="font-semibold text-slate-500">({area.activeLights}/{area.totalLights})</span></span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/7">
                  <span className="block h-full rounded-full bg-[#73ffba]" style={{ width: `${(area.activeLights / maxLights) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-slate-100">Energy Savings by Area</h4>
            <p className="mt-1 text-xs text-slate-400">Estimated kWh saved by dimming and schedules.</p>
          </div>
          <DashboardIcon className="size-5 text-[#73ffba]" name="bolt" />
        </div>
        <div className="mt-5 flex h-48 items-end gap-3 border-b border-cyan-200/10 px-2 pb-2">
          {areas.map((area) => {
            const energy = Number.parseFloat(area.energySaved);
            return (
              <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2" key={area.id}>
                <span className="text-[0.65rem] font-black text-[#73ffba]">{energy}</span>
                <div className="flex h-32 w-full items-end rounded-t-md bg-white/[0.025] px-1">
                  <span className="w-full rounded-t-sm bg-[#72e7ff] shadow-[0_0_18px_rgba(114,231,255,0.2)]" style={{ height: `${Math.max((energy / maxEnergy) * 100, 7)}%` }} />
                </div>
                <span className="w-full truncate text-center text-[0.62rem] font-bold text-slate-400" title={area.area}>{area.area.replace(' ', '\n')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FaultAnalytics({ faults }) {
  if (faults.length === 0) return null;

  const byArea = faults.reduce((counts, fault) => ({ ...counts, [fault.area]: (counts[fault.area] || 0) + 1 }), {});
  const bySeverity = faults.reduce((counts, fault) => ({ ...counts, [fault.severity]: (counts[fault.severity] || 0) + 1 }), {});
  const areaEntries = Object.entries(byArea);
  const severityEntries = Object.entries(bySeverity);
  const maxAreaCount = Math.max(...areaEntries.map(([, count]) => count), 1);
  const severityTone = { Critical: 'bg-[#ff9b8d]', High: 'bg-[#ffcd78]', Medium: 'bg-[#72e7ff]' };

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-lg border border-[#ff9b8d]/15 bg-[#09151f]/60 p-4">
        <div className="flex items-center justify-between"><div><h4 className="text-sm font-extrabold text-slate-100">Fault Concentration</h4><p className="mt-1 text-xs text-slate-400">Open and recent tickets grouped by area.</p></div><DashboardIcon className="size-5 text-[#ffb4a8]" name="warning" /></div>
        <div className="mt-5 space-y-4">{areaEntries.map(([area, count]) => <div key={area}><div className="mb-1.5 flex justify-between gap-3 text-xs"><strong className="text-slate-200">{area}</strong><span className="font-black text-[#ffb4a8]">{count} ticket{count > 1 ? 's' : ''}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-white/7"><span className="block h-full rounded-full bg-[#ff9b8d]" style={{ width: `${(count / maxAreaCount) * 100}%` }} /></div></div>)}</div>
      </div>
      <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4"><h4 className="text-sm font-extrabold text-slate-100">Severity Mix</h4><p className="mt-1 text-xs text-slate-400">Current report scope.</p><div className="mt-5 space-y-4">{severityEntries.map(([severity, count]) => <div className="flex items-center justify-between rounded-md border border-cyan-200/8 bg-white/[0.02] p-3" key={severity}><span className="flex items-center gap-2 text-sm font-bold text-slate-200"><span className={`size-2.5 rounded-full ${severityTone[severity] || 'bg-slate-400'}`} />{severity}</span><strong className="text-lg font-black text-slate-50">{count}</strong></div>)}</div></div>
    </div>
  );
}

function Reports() {
  // Filter States
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Applied Filter States
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: '7d',
    area: 'All Areas',
    reportType: 'all',
    search: '',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState('');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    reportsApi.get(appliedFilters).then((data) => {
      if (!cancelled) { setReport({ ...emptyReport, ...data }); setLoadError(''); }
    }).catch((error) => {
      if (!cancelled) { setLoadError(error.message); setReport(null); }
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [appliedFilters]);

  const currentReport = report || emptyReport;
  const reportSummaryCards = Array.isArray(currentReport.summaryCards) ? currentReport.summaryCards : [];
  const reportFilterOptions = currentReport.filterOptions || emptyReport.filterOptions;
  const streetLightPerformanceData = currentReport.performance || emptyReport.performance;
  const areaWiseReportData = Array.isArray(currentReport.areaReports) ? currentReport.areaReports : [];
  const automationReportData = currentReport.automation || emptyReport.automation;
  const faultReportData = currentReport.faults || emptyReport.faults;
  const recentReportActivities = Array.isArray(currentReport.activities) ? currentReport.activities : [];

  // Handle Apply Filters
  const handleApplyFilters = () => {
    setAppliedFilters({
      dateRange: selectedDateRange,
      area: selectedArea,
      reportType: selectedReportType,
      search: searchQuery.trim().toLowerCase(),
    });
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSelectedDateRange('7d');
    setSelectedArea('All Areas');
    setSelectedReportType('all');
    setSearchQuery('');
    setAppliedFilters({
      dateRange: '7d',
      area: 'All Areas',
      reportType: 'all',
      search: '',
    });
  };

  // Dynamic Area Wise Report Filtered Data
  const filteredAreaReports = useMemo(() => {
    return areaWiseReportData.filter((item) => {
      const matchArea =
        appliedFilters.area === 'All Areas' || item.area === appliedFilters.area;
      const matchSearch =
        !appliedFilters.search ||
        item.area.toLowerCase().includes(appliedFilters.search) ||
        item.type.toLowerCase().includes(appliedFilters.search) ||
        item.status.toLowerCase().includes(appliedFilters.search);
      return matchArea && matchSearch;
    });
  }, [appliedFilters]);

  // Dynamic Fault Records Filtered Data
  const filteredFaultRecords = useMemo(() => {
    return faultReportData.recentFaultRecords.filter((item) => {
      const matchArea =
        appliedFilters.area === 'All Areas' || item.area === appliedFilters.area;
      const matchSearch =
        !appliedFilters.search ||
        item.lightId.toLowerCase().includes(appliedFilters.search) ||
        item.area.toLowerCase().includes(appliedFilters.search) ||
        item.issueType.toLowerCase().includes(appliedFilters.search) ||
        item.status.toLowerCase().includes(appliedFilters.search);
      return matchArea && matchSearch;
    });
  }, [appliedFilters]);

  // Export Report Functionality (CSV Download)
  const handleExportCSV = () => {
    setIsExporting(true);

    const headers = ['Area Name', 'Type', 'Total Lights', 'Active Lights', 'Faulty Lights', 'Avg Brightness', 'Energy Saved', 'Status'];
    const rows = filteredAreaReports.map((row) => [
      `"${row.area}"`,
      `"${row.type}"`,
      row.totalLights,
      row.activeLights,
      row.faultyLights,
      `"${row.avgBrightness}%"`,
      `"${row.energySaved}"`,
      `"${row.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ApexStreet_Report_${appliedFilters.area.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      setExportNotice('Report downloaded successfully as CSV!');
      setTimeout(() => setExportNotice(''), 4000);
    }, 400);
  };

  // Export JSON Report Functionality
  const handleExportJSON = () => {
    setIsExporting(true);

    const reportPayload = {
      generatedAt: new Date().toISOString(),
      appliedFilters,
      summary: reportSummaryCards,
      areaReports: filteredAreaReports,
      faultRecords: filteredFaultRecords,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ApexStreet_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setTimeout(() => {
      setIsExporting(false);
      setExportNotice('Report downloaded successfully as JSON!');
      setTimeout(() => setExportNotice(''), 4000);
    }, 400);
  };

  // Report Section Visibility Helpers
  const showAll = appliedFilters.reportType === 'all';
  const showPerformance = showAll || appliedFilters.reportType === 'performance';
  const showArea = showAll || appliedFilters.reportType === 'area';
  const showAutomation = showAll || appliedFilters.reportType === 'automation';
  const showFault = showAll || appliedFilters.reportType === 'fault';

  return (
    <AppShell activePage="Reports" title="Reports">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {isLoading ? <div className="rounded-md border border-cyan-200/12 bg-cyan-300/5 px-4 py-3 text-sm font-semibold text-slate-300">Loading report data…</div> : null}
        {loadError ? <div className="rounded-md border border-[#ff9b8d]/25 bg-[#ff9b8d]/10 px-4 py-3 text-sm font-semibold text-[#ffb4a8]">{loadError}</div> : null}
        
        {/* 1. REPORT HEADER */}
        <div className="flex flex-col gap-4 border-b border-cyan-200/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-300/10 text-[#72e7ff]">
                <DashboardIcon className="size-5" name="report" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">System Reports</h1>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-400">
              Comprehensive analytics, operational lighting statistics, area-wise performance metrics, and fault logs.
            </p>
          </div>

          {/* 9. EXPORT UI TOOLBAR */}
          <div className="flex flex-wrap items-center gap-3">
            {exportNotice ? (
              <span className="rounded-md border border-[#73ffba]/30 bg-[#73ffba]/10 px-3 py-1.5 text-xs font-extrabold text-[#73ffba]">
                {exportNotice}
              </span>
            ) : null}
            <div className="relative inline-flex rounded-md shadow-sm">
              <button
                className="flex items-center gap-2 rounded-l-md border border-cyan-200/20 bg-cyan-300/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#72e7ff] transition hover:bg-cyan-300/20 disabled:opacity-50"
                type="button"
                onClick={handleExportCSV}
                disabled={isExporting}
              >
                <DashboardIcon className="size-4" name="save" />
                <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
              <button
                className="flex items-center gap-2 rounded-r-md border border-l-0 border-cyan-200/20 bg-[#09151f] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-cyan-300/10 hover:text-[#72e7ff] disabled:opacity-50"
                type="button"
                onClick={handleExportJSON}
                disabled={isExporting}
                title="Export as JSON"
              >
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {reportSummaryCards.map((card) => (
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

        {/* 3. REPORT FILTERS */}
        <Panel className="p-5">
          <div className="mb-3">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
              Filter Controls
            </p>
            <h3 className="text-lg font-black text-slate-50">Generate Custom Report</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Date Range Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="filter-daterange">
                Date Range
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="filter-daterange"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                {reportFilterOptions.dateRanges.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Area Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="filter-area">
                Area Scope
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="filter-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                {reportFilterOptions.areas.map((areaName) => (
                  <option key={areaName} value={areaName}>
                    {areaName}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Type Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="filter-type">
                Report Type
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="filter-type"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
              >
                {reportFilterOptions.reportTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="filter-search">
                Keyword Search
              </label>
              <input
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-[#72e7ff] focus:outline-none"
                id="filter-search"
                type="text"
                placeholder="Search area, light ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <button
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-cyan-200/20 bg-[#72e7ff] px-3 py-2 text-xs font-black uppercase text-[#041018] shadow-[0_0_20px_rgba(114,231,255,0.25)] transition hover:bg-[#8df0ff]"
                type="button"
                onClick={handleApplyFilters}
              >
                <DashboardIcon className="size-3.5" name="search" />
                <span>Apply</span>
              </button>
              <button
                className="flex items-center justify-center rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                type="button"
                onClick={handleResetFilters}
                title="Reset Filters"
              >
                <span>Reset</span>
              </button>
            </div>
          </div>
        </Panel>

        {/* 4. STREET LIGHT PERFORMANCE REPORT */}
        {showPerformance ? (
          <Panel className="p-5 lg:p-6">
            <SectionHeading
              kicker="Street Light Performance"
              title="Operational & Status Statistics"
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Status Breakdown Visualization */}
              <div className="space-y-4 rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <h4 className="text-sm font-extrabold text-slate-200">Light Status Distribution</h4>
                <div className="space-y-3">
                  {streetLightPerformanceData.statusBreakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>{item.label}</span>
                        <span>{item.count} lights ({item.percentage}%)</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto vs Manual Mode Split */}
              <div className="space-y-4 rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <h4 className="text-sm font-extrabold text-slate-200">Control Mode Split</h4>
                <div className="flex h-full flex-col justify-center space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-[#72e7ff]" />
                        Automatic Mode ({streetLightPerformanceData.modeSplit.autoPercentage}%)
                      </span>
                      <span>{streetLightPerformanceData.modeSplit.autoCount} lights</span>
                    </div>
                    <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-[#72e7ff] transition-all duration-500"
                        style={{ width: `${streetLightPerformanceData.modeSplit.autoPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-amber-400" />
                        Manual Override ({streetLightPerformanceData.modeSplit.manualPercentage}%)
                      </span>
                      <span>{streetLightPerformanceData.modeSplit.manualCount} lights</span>
                    </div>
                    <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${streetLightPerformanceData.modeSplit.manualPercentage}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    {streetLightPerformanceData.modeSplit.autoPercentage}% of lights are currently in automatic control mode.
                  </p>
                </div>
              </div>

              {/* Hourly Brightness Curve */}
              <div className="space-y-4 rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <h4 className="text-sm font-extrabold text-slate-200">Scheduled Hourly Brightness Curve</h4>
                <BrightnessCurve points={streetLightPerformanceData.averageBrightnessByHour} />
              </div>
            </div>
          </Panel>
        ) : null}

        {/* 5. AREA-WISE REPORT */}
        {showArea ? (
          <Panel className="p-5 lg:p-6">
            <SectionHeading
              kicker="Area-Wise Statistics"
              title="Zone Performance & Health Report"
            />

            <AreaAnalytics areas={filteredAreaReports} />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyan-200/12 text-slate-400">
                    <th className="pb-3 font-bold uppercase tracking-wider">Area Name</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Type</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Total Lights</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Active</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Faulty</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Avg Brightness</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Energy Saved</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-200/8 text-slate-200">
                  {filteredAreaReports.length > 0 ? (
                    filteredAreaReports.map((row) => (
                      <tr className="transition hover:bg-cyan-300/5" key={row.id}>
                        <td className="py-3.5 font-black text-slate-100">{row.area}</td>
                        <td className="py-3.5 font-semibold text-slate-400">{row.type}</td>
                        <td className="py-3.5 font-extrabold">{row.totalLights}</td>
                        <td className="py-3.5 font-bold text-[#73ffba]">{row.activeLights}</td>
                        <td className="py-3.5 font-bold text-[#ff9b8d]">{row.faultyLights}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#72e7ff]">{row.avgBrightness}%</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full bg-[#72e7ff]"
                                style={{ width: `${row.avgBrightness}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-300">{row.energySaved}</td>
                        <td className="py-3.5">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-center text-slate-400" colSpan={8}>
                        No area records matching current filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}

        {/* 6. AUTOMATION REPORT */}
        {showAutomation ? (
          <Panel className="p-5 lg:p-6">
            <SectionHeading
              kicker="Automation Report"
              title="Automated Controls & Schedule Insights"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <span className="text-xs font-bold text-slate-400">Automated Fixtures</span>
                <p className="mt-2 text-2xl font-black text-[#72e7ff]">
                  {automationReportData.automatedLightsCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">{automationReportData.automatedLightsCount} of {streetLightPerformanceData.totalLights} lights</p>
              </div>

              <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <span className="text-xs font-bold text-slate-400">Automation Actions Logged</span>
                <p className="mt-2 text-2xl font-black text-[#73ffba]">
                  {automationReportData.totalActionsLogged}
                </p>
                <p className="mt-1 text-xs text-slate-400">Past 30 days execution count</p>
              </div>

              <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <span className="text-xs font-bold text-slate-400">Auto Sunset ON Triggers</span>
                <p className="mt-2 text-2xl font-black text-slate-100">
                  {automationReportData.autoTurnedOn}
                </p>
                <p className="mt-1 text-xs text-slate-400">100% successful execution</p>
              </div>

              <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <span className="text-xs font-bold text-slate-400">Auto Dimming Adjustments</span>
                <p className="mt-2 text-2xl font-black text-[#72e7ff]">
                  {automationReportData.brightnessAdjustments}
                </p>
                <p className="mt-1 text-xs text-slate-400">Late-night energy saving events</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-extrabold text-slate-200">Recent Automated Activity Stream</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {automationReportData.recentAutomationActions.map((act) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-cyan-200/10 bg-[#09151f]/40 p-3"
                    key={act.id}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-md border border-cyan-200/20 bg-cyan-300/10 text-[#72e7ff]">
                        <DashboardIcon className="size-4" name="automation" />
                      </span>
                      <div>
                        <strong className="block text-xs font-bold text-slate-100">{act.action}</strong>
                        <span className="text-[0.7rem] text-slate-400">
                          {act.scope} • {act.affectedLights} lights
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-[#72e7ff]">{act.time}</span>
                      <StatusBadge status={act.result} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        ) : null}

        {/* 7. FAULT REPORT */}
        {showFault ? (
          <Panel className="p-5 lg:p-6">
            <SectionHeading
              kicker="Fault Summary & Maintenance"
              title="System Error Diagnostics & Ticket Log"
            />

            {/* Fault Metric Pills */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <span className="text-xs font-bold text-slate-400">Total Logged Faults</span>
                <p className="mt-1 text-2xl font-black text-slate-100">{faultReportData.summary.totalFaults}</p>
              </div>
              <div className="rounded-lg border border-[#ff9b8d]/20 bg-[#ff9b8d]/10 p-4">
                <span className="text-xs font-bold text-[#ff9b8d]">Active Unresolved Faults</span>
                <p className="mt-1 text-2xl font-black text-[#ff9b8d]">{faultReportData.summary.activeFaults}</p>
              </div>
              <div className="rounded-lg border border-[#73ffba]/20 bg-[#73ffba]/10 p-4">
                <span className="text-xs font-bold text-[#73ffba]">Resolved Tickets</span>
                <p className="mt-1 text-2xl font-black text-[#73ffba]">{faultReportData.summary.resolvedFaults}</p>
              </div>
              <div className="rounded-lg border border-[#ff9b8d]/20 bg-[#ff9b8d]/10 p-4">
                <span className="text-xs font-bold text-[#ff9b8d]">Critical High Severity</span>
                <p className="mt-1 text-2xl font-black text-[#ff9b8d]">{faultReportData.summary.criticalFaults}</p>
              </div>
            </div>

            <FaultAnalytics faults={filteredFaultRecords} />

            {/* Fault Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyan-200/12 text-slate-400">
                    <th className="pb-3 font-bold uppercase tracking-wider">Ticket ID</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Light ID</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Area</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Issue Description</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Severity</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Reported</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-200/8 text-slate-200">
                  {filteredFaultRecords.length > 0 ? (
                    filteredFaultRecords.map((fault) => (
                      <tr className="transition hover:bg-cyan-300/5" key={fault.id}>
                        <td className="py-3.5 font-mono font-bold text-[#72e7ff]">{fault.id}</td>
                        <td className="py-3.5 font-extrabold text-slate-100">{fault.lightId}</td>
                        <td className="py-3.5 font-semibold text-slate-300">{fault.area}</td>
                        <td className="py-3.5 font-medium text-slate-300">{fault.issueType}</td>
                        <td className="py-3.5">
                          <StatusBadge status={fault.severity} />
                        </td>
                        <td className="py-3.5 font-medium text-slate-400">{fault.reportedTime}</td>
                        <td className="py-3.5">
                          <StatusBadge status={fault.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-center text-slate-400" colSpan={7}>
                        No fault records match the specified area filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}

      </div>
    </AppShell>
  );
}

export default Reports;
