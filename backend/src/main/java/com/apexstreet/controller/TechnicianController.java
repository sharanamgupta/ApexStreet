package com.apexstreet.controller;

import com.apexstreet.dto.TechnicianResponse;
import com.apexstreet.service.MonitorLightService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {
    private final MonitorLightService service;
    public TechnicianController(MonitorLightService service) { this.service = service; }

    @GetMapping
    public List<TechnicianResponse> all() { return service.technicians(null); }
}
