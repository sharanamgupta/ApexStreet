import React, { useEffect, useMemo, useState } from 'react';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { reportsApi } from '../utils/reportsApi.js';

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
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-extrabold ${badgeStyle}`}>
      {status}
    </span>
  );
}

function UserReports() {
  // Filter States (View Options)
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: '7d',
    area: 'All Areas',
    reportType: 'all',
    search: '',
  });
  const [report, setReport] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    reportsApi.get(appliedFilters).then((data) => {
      if (!cancelled) { setReport(data); setLoadError(''); }
    }).catch((error) => {
      if (!cancelled) { setReport(null); setLoadError(error.message); }
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [appliedFilters]);

  const reportSummaryCards = report?.summaryCards || [];
  const reportFilterOptions = report?.filterOptions || { dateRanges: [], areas: ['All Areas'], reportTypes: [] };
  const streetLightPerformanceData = report?.performance || { statusBreakdown: [], modeSplit: { autoPercentage: 0, autoCount: 0, manualPercentage: 0, manualCount: 0 }, averageBrightnessByHour: [] };
  const areaWiseReportData = report?.areaReports || [];
  const automationReportData = report?.automation || { automatedLightsCount: 0, totalActionsLogged: 0, autoTurnedOn: 0, brightnessAdjustments: 0, recentAutomationActions: [] };
  const faultReportData = report?.faults || { summary: { totalFaults: 0, activeFaults: 0, resolvedFaults: 0, criticalFaults: 0 }, recentFaultRecords: [] };
  const recentReportActivities = report?.activities || [];

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateRange: selectedDateRange,
      area: selectedArea,
      reportType: selectedReportType,
      search: searchQuery.trim().toLowerCase(),
    });
  };

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

  // Filtered Area Reports
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

  // Filtered Fault Records
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

  // Filtered Activity Logs
  const filteredActivities = useMemo(() => {
    return recentReportActivities.filter((item) => {
      const matchArea =
        appliedFilters.area === 'All Areas' ||
        item.area === 'All Areas' ||
        item.area === 'City-wide' ||
        item.area.includes(appliedFilters.area);
      const matchSearch =
        !appliedFilters.search ||
        item.activity.toLowerCase().includes(appliedFilters.search) ||
        item.area.toLowerCase().includes(appliedFilters.search) ||
        item.status.toLowerCase().includes(appliedFilters.search);
      return matchArea && matchSearch;
    });
  }, [appliedFilters]);

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
        
        {/* 1. REPORT HEADER (VIEW ONLY) */}
        <div className="flex flex-col gap-4 border-b border-cyan-200/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-300/10 text-[#72e7ff]">
                <DashboardIcon className="size-5" name="report" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
                System Reports
              </h1>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-400">
              View operational lighting statistics, area-wise performance metrics, automation insights, and fault diagnostic records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#72e7ff]">
              View Only
            </span>
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

        {/* 3. REPORT VIEW FILTERS */}
        <Panel className="p-5">
          <div className="mb-3">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
              Report View Controls
            </p>
            <h3 className="text-lg font-black text-slate-50">Filter Report View</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="user-filter-daterange">
                Date Range
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="user-filter-daterange"
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

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="user-filter-area">
                Area Scope
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="user-filter-area"
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

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="user-filter-type">
                Report Section
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="user-filter-type"
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

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="user-filter-search">
                Keyword Search
              </label>
              <input
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-[#72e7ff] focus:outline-none"
                id="user-filter-search"
                type="text"
                placeholder="Search area, light ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-cyan-200/20 bg-[#72e7ff] px-3 py-2 text-xs font-black uppercase text-[#041018] shadow-[0_0_20px_rgba(114,231,255,0.25)] transition hover:bg-[#8df0ff]"
                type="button"
                onClick={handleApplyFilters}
              >
                <DashboardIcon className="size-3.5" name="search" />
                <span>Filter</span>
              </button>
              <button
                className="flex items-center justify-center rounded-md border border-cyan-200/16 bg-[#09151f] px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                type="button"
                onClick={handleResetFilters}
                title="Reset View"
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
                    78% of the lighting grid is controlled by sunset/sunrise and sensor-driven schedules.
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-cyan-200/10 bg-[#09151f]/60 p-4">
                <h4 className="text-sm font-extrabold text-slate-200">Scheduled Hourly Brightness Curve</h4>
                <div className="flex h-36 items-end justify-between gap-2 border-b border-cyan-200/10 pb-2">
                  {streetLightPerformanceData.averageBrightnessByHour.map((pt) => (
                    <div className="flex flex-1 flex-col items-center gap-2" key={pt.hour}>
                      <span className="text-[0.65rem] font-bold text-slate-400">{pt.brightness}%</span>
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-cyan-600/30 to-[#72e7ff] transition-all duration-500"
                        style={{ height: `${Math.max(pt.brightness, 6)}%` }}
                      />
                      <span className="text-[0.65rem] font-semibold text-slate-400">{pt.hour}</span>
                    </div>
                  ))}
                </div>
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
                <p className="mt-1 text-xs text-slate-400">78% total network coverage</p>
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

        {/* 8. RECENT REPORT ACTIVITY */}
        <Panel className="p-5 lg:p-6">
          <SectionHeading
            kicker="System Log"
            title="Recent Report & Audit Activity"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyan-200/12 text-slate-400">
                  <th className="pb-3 font-bold uppercase tracking-wider">Log ID</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Date & Time</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Activity Description</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Scope / Area</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-200/8 text-slate-200">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((act) => (
                    <tr className="transition hover:bg-cyan-300/5" key={act.id}>
                      <td className="py-3.5 font-mono font-bold text-slate-400">{act.id}</td>
                      <td className="py-3.5 font-mono font-semibold text-[#72e7ff]">{act.dateTime}</td>
                      <td className="py-3.5 font-bold text-slate-100">{act.activity}</td>
                      <td className="py-3.5 font-semibold text-slate-300">{act.area}</td>
                      <td className="py-3.5">
                        <StatusBadge status={act.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-slate-400" colSpan={5}>
                      No recent activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

      </div>
    </AppShell>
  );
}

export default UserReports;
