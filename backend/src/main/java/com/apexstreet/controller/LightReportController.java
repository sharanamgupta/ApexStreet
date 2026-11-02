package com.apexstreet.controller;

import com.apexstreet.dto.*;
import com.apexstreet.service.LightReportService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/light-reports")
public class LightReportController {
    private final LightReportService service;
    public LightReportController(LightReportService service) { this.service = service; }
    @PostMapping @PreAuthorize("hasRole('USER')") public LightReportResponse create(@Valid @RequestBody LightReportRequest request) { return service.create(request); }
    @GetMapping("/mine") @PreAuthorize("hasRole('USER')") public List<LightReportResponse> mine() { return service.mine(); }
    @GetMapping("/open") @PreAuthorize("hasAnyRole('OPERATOR','ADMIN')") public List<LightReportResponse> open() { return service.open(); }
}
