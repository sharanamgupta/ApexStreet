package com.apexstreet.dto;

import com.apexstreet.model.LightReport;
import java.time.LocalDateTime;

public record LightReportResponse(Long id, String lightId, String area, String issue, String status, String reporter, LocalDateTime createdAt, LocalDateTime resolvedAt) {
    public static LightReportResponse from(LightReport report) {
        return new LightReportResponse(report.getId(), report.getStreetLight().getLightId(), report.getStreetLight().getArea(), report.getIssue(), report.getStatus().name(), report.getReporter().getName(), report.getCreatedAt(), report.getResolvedAt());
    }
}
