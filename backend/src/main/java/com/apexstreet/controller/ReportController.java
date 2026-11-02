package com.apexstreet.controller;

import com.apexstreet.dto.ReportResponse;
import com.apexstreet.service.ReportService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reports;
    public ReportController(ReportService reports) { this.reports = reports; }

    @GetMapping
    public ReportResponse generate(@RequestParam(defaultValue="7d") String dateRange,
                                   @RequestParam(defaultValue="All Areas") String area,
                                   @RequestParam(defaultValue="all") String reportType,
                                   @RequestParam(defaultValue="") String search) {
        return reports.generate(dateRange, area, reportType, search);
    }
}
