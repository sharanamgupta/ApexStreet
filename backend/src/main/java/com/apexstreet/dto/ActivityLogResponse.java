package com.apexstreet.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ActivityLogResponse(String id, String action, String activity, String description, String module,
                                  String area, String userOrSystem, String target, String status, String type,
                                  LocalDateTime timestamp, Map<String, String> details) {
    public record SummaryCard(String id, String label, String value, String subtext, String trend, String tone, String icon) {}
    public record FilterOptions(List<DateRange> dateRanges, List<StatusOption> statusTypes, List<String> modules, List<String> areas) {}
    public record DateRange(String label, String value) {}
    public record StatusOption(String label, String value) {}
    public record Page(List<ActivityLogResponse> logs, List<SummaryCard> summaryCards, FilterOptions filterOptions) {}
}
