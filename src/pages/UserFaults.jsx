import React, { useEffect, useMemo, useState } from 'react';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { reportsApi } from '../utils/reportsApi.js';

function StatusBadge({ status }) {
  let badgeStyle = 'border-slate-500/30 bg-slate-500/10 text-slate-300';

  if (['Operational', 'Active', 'Completed', 'Success', 'High Efficiency'].includes(status)) {
    badgeStyle = 'border-[#73ffba]/30 bg-[#73ffba]/10 text-[#73ffba]';
  } else if (['Attention Required', 'Critical', 'High', 'Active'].includes(status)) {
    badgeStyle = 'border-[#ff9b8d]/30 bg-[#ff9b8d]/10 text-[#ff9b8d]';
  } else if (['In Progress', 'Medium', 'Exported', 'Flagged', 'Warning'].includes(status)) {
    badgeStyle = 'border-[#72e7ff]/30 bg-[#72e7ff]/10 text-[#72e7ff]';
  }

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-extrabold ${badgeStyle}`}>
      {status}
    </span>
  );
}

function UserFaults() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedFault, setSelectedFault] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi.get({ dateRange: '30d', area: 'All Areas', reportType: 'fault', search: '' })
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const rawFaults = report?.faults?.recentFaultRecords || [];

  const filteredFaults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawFaults.filter((item) => {
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.lightId.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.issueType.toLowerCase().includes(q);
      const matchSeverity = selectedSeverity === 'All' || item.severity === selectedSeverity;
      return matchSearch && matchSeverity;
    });
  }, [rawFaults, searchQuery, selectedSeverity]);

  const summary = report?.faults?.summary || { totalFaults: 0, activeFaults: 0, resolvedFaults: 0, criticalFaults: 0 };

  return (
    <AppShell activePage="Faults" title="Faults">
      <main className="p-4 sm:p-5 lg:p-8" aria-labelledby="user-faults-title">
        <header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-0.5 text-[0.7rem] font-black uppercase tracking-wider text-[#72e7ff]">
                View Only Access
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight text-slate-50 sm:text-4xl" id="user-faults-title">
              Fault Diagnostic Records
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Monitor active fault alerts, reported issues, fixture severity, and repair status across the street lighting network.
            </p>
          </div>
        </header>

        {loading ? <div className="mt-4 rounded-lg border border-cyan-200/12 bg-cyan-300/5 p-4 text-sm font-semibold text-slate-300">Loading fault records...</div> : null}
        {error ? <div className="mt-4 rounded-lg border border-[#ff9f91]/25 bg-[#ff9f91]/8 p-4 text-sm font-semibold text-[#ffb4a8]" role="alert">{error}</div> : null}

        {/* Summary Stat Cards */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Fault metrics">
          <div className="rounded-lg border border-cyan-200/10 bg-[#07131f]/82 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Logged</span>
            <p className="mt-2 text-3xl font-black text-slate-100">{summary.totalFaults}</p>
            <span className="mt-1 block text-xs font-semibold text-slate-400">All recorded tickets</span>
          </div>

          <div className="rounded-lg border border-[#ff9b8d]/20 bg-[#ff9b8d]/10 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff9b8d]">Active Faults</span>
            <p className="mt-2 text-3xl font-black text-[#ff9b8d]">{summary.activeFaults}</p>
            <span className="mt-1 block text-xs font-semibold text-[#ffb4a8]">Unresolved issues</span>
          </div>

          <div className="rounded-lg border border-[#73ffba]/20 bg-[#73ffba]/10 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#73ffba]">Resolved Tickets</span>
            <p className="mt-2 text-3xl font-black text-[#73ffba]">{summary.resolvedFaults}</p>
            <span className="mt-1 block text-xs font-semibold text-[#b1ffd3]">Completed repairs</span>
          </div>

          <div className="rounded-lg border border-[#ff9b8d]/20 bg-[#ff9b8d]/10 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff9b8d]">Critical Severity</span>
            <p className="mt-2 text-3xl font-black text-[#ff9b8d]">{summary.criticalFaults}</p>
            <span className="mt-1 block text-xs font-semibold text-[#ffb4a8]">Requires urgent attention</span>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="mt-4 rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_20px_54px_rgba(0,0,0,0.2)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="fault-search">
                Search Faults
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3.5 py-2.5 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-[#72e7ff] focus:outline-none"
                  id="fault-search"
                  type="text"
                  placeholder="Search Ticket ID, Light ID, Area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="fault-severity">
                Severity Level
              </label>
              <select
                className="w-full rounded-md border border-cyan-200/16 bg-[#09151f] px-3.5 py-2.5 text-xs font-semibold text-slate-100 focus:border-[#72e7ff] focus:outline-none"
                id="fault-severity"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                className="min-h-10 rounded-md border border-cyan-200/16 bg-cyan-300/8 px-4 text-xs font-bold text-[#91dff3] hover:bg-cyan-300/14 transition"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSeverity('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </section>

        {/* Fault Records Table */}
        <section className="mt-4 overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 shadow-[0_20px_54px_rgba(0,0,0,0.2)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-cyan-200/10 bg-white/[0.025] text-slate-400">
                <tr>
                  <th className="p-4 font-bold uppercase tracking-wider">Ticket ID</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Light ID</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Area</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Issue Description</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Severity</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Reported</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-200/8 text-slate-200">
                {filteredFaults.length > 0 ? (
                  filteredFaults.map((fault) => (
                    <tr className="transition hover:bg-cyan-300/5" key={fault.id}>
                      <td className="p-4 font-mono font-bold text-[#72e7ff]">{fault.id}</td>
                      <td className="p-4 font-extrabold text-slate-100">{fault.lightId}</td>
                      <td className="p-4 font-semibold text-slate-300">{fault.area}</td>
                      <td className="p-4 font-medium text-slate-300">{fault.issueType}</td>
                      <td className="p-4">
                        <StatusBadge status={fault.severity} />
                      </td>
                      <td className="p-4 font-medium text-slate-400">{fault.reportedTime}</td>
                      <td className="p-4">
                        <StatusBadge status={fault.status} />
                      </td>
                      <td className="p-4">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-md border border-cyan-200/14 bg-cyan-300/8 px-3 py-1.5 text-xs font-black text-[#91dff3] hover:bg-cyan-300/14 transition"
                          type="button"
                          onClick={() => setSelectedFault(fault)}
                        >
                          <DashboardIcon className="size-3.5" name="eye" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-8 text-center text-slate-400" colSpan={8}>
                      No fault records match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* View Fault Modal */}
      {selectedFault ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-cyan-200/12 bg-[#07131f] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-cyan-200/10 pb-4">
              <div>
                <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
                  Fault Diagnostic Details (View Only)
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-50">Ticket {selectedFault.id}</h2>
              </div>
              <button
                className="grid size-9 place-items-center rounded-md border border-cyan-200/14 bg-cyan-300/8 text-[#91dff3]"
                type="button"
                onClick={() => setSelectedFault(null)}
              >
                <DashboardIcon className="size-4" name="x" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3">
                  <span className="text-[0.68rem] font-black uppercase text-slate-500">Light ID</span>
                  <strong className="mt-1 block text-sm font-black text-slate-100">{selectedFault.lightId}</strong>
                </div>
                <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3">
                  <span className="text-[0.68rem] font-black uppercase text-slate-500">Area</span>
                  <strong className="mt-1 block text-sm font-black text-slate-100">{selectedFault.area}</strong>
                </div>
              </div>

              <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3">
                <span className="text-[0.68rem] font-black uppercase text-slate-500">Issue Description</span>
                <p className="mt-1 text-sm font-medium text-slate-200">{selectedFault.issueType}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3">
                  <span className="text-[0.68rem] font-black uppercase text-slate-500">Severity</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedFault.severity} />
                  </div>
                </div>
                <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3">
                  <span className="text-[0.68rem] font-black uppercase text-slate-500">Reported</span>
                  <strong className="mt-1 block text-xs font-bold text-slate-300">{selectedFault.reportedTime}</strong>
                </div>
                <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3">
                  <span className="text-[0.68rem] font-black uppercase text-slate-500">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedFault.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="min-h-10 rounded-md border border-cyan-200/16 bg-cyan-300/8 px-5 text-xs font-black text-[#91dff3] hover:bg-cyan-300/14"
                type="button"
                onClick={() => setSelectedFault(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

export default UserFaults;
