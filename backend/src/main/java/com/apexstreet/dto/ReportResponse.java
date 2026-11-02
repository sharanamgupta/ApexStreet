package com.apexstreet.dto;

import java.util.List;

public record ReportResponse(
        List<SummaryCard> summaryCards,
        FilterOptions filterOptions,
        Performance performance,
        List<AreaReport> areaReports,
        AutomationReport automation,
        FaultReport faults,
        List<Activity> activities) {
    public record SummaryCard(String id, String label, String value, String subtext, String trend, String tone, String icon) {}
    public record FilterOptions(List<DateRange> dateRanges, List<String> areas, List<ReportType> reportTypes) {}
    public record DateRange(String label, String value) {}
    public record ReportType(String label, String value) {}
    public record Performance(long totalLights, long operationalLights, long faultyLights, List<StatusBreakdown> statusBreakdown, ModeSplit modeSplit, List<BrightnessPoint> averageBrightnessByHour) {}
    public record StatusBreakdown(String label, long count, long percentage, String color) {}
    public record ModeSplit(long autoCount, long autoPercentage, long manualCount, long manualPercentage) {}
    public record BrightnessPoint(String hour, long brightness) {}
    public record AreaReport(String id, String area, String type, long totalLights, long activeLights, long faultyLights, long avgBrightness, String energySaved, String status) {}
    public record AutomationReport(long automatedLightsCount, long totalActionsLogged, long autoTurnedOn, long autoTurnedOff, long brightnessAdjustments, List<AutomationAction> recentAutomationActions) {}
    public record AutomationAction(String id, String time, String action, long affectedLights, String scope, String result) {}
    public record FaultReport(FaultSummary summary, List<FaultArea> faultsByArea, List<FaultRecord> recentFaultRecords) {}
    public record FaultSummary(long totalFaults, long activeFaults, long resolvedFaults, long criticalFaults) {}
    public record FaultArea(String area, long count) {}
    public record FaultRecord(String id, String lightId, String area, String issueType, String severity, String reportedTime, String status) {}
    public record Activity(String id, String dateTime, String activity, String area, String status) {}
}
