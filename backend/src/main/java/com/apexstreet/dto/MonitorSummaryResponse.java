package com.apexstreet.dto;

public record MonitorSummaryResponse(long connected, long faults, long assignedJobs, long unassigned) {
}
