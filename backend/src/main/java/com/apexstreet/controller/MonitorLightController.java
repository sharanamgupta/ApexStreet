package com.apexstreet.controller;

import com.apexstreet.dto.*;
import com.apexstreet.service.MonitorLightService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/monitor-lights")
public class MonitorLightController {
    private final MonitorLightService service;
    public MonitorLightController(MonitorLightService service) { this.service = service; }

    @GetMapping public List<MonitorLightResponse> all(@RequestParam(required = false) String search, @RequestParam(required = false) String area, @RequestParam(required = false) String status, @RequestParam(required = false, name = "health") String health) { return service.findAll(search, area, status != null ? status : health); }
    @GetMapping("/summary") public MonitorSummaryResponse summary() { return service.summary(); }
    @GetMapping("/{lightId}") public MonitorLightResponse one(@PathVariable String lightId) { return service.findById(lightId); }
    @GetMapping("/{lightId}/maintenance") public List<MaintenanceJobResponse> history(@PathVariable String lightId) { return service.history(lightId); }
    @GetMapping("/{lightId}/messages") public List<FieldTeamMessageResponse> messages(@PathVariable String lightId) { return service.messages(lightId); }
    @PostMapping("/{lightId}/messages") @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')") public FieldTeamMessageResponse sendMessage(@PathVariable String lightId, @Valid @RequestBody FieldTeamMessageRequest request) { return service.sendMessage(lightId, request); }

    @GetMapping("/technicians") public List<TechnicianResponse> technicians(@RequestParam(required = false) String area) { return service.technicians(area); }

    @PostMapping("/{lightId}/assign") @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public MonitorLightResponse assign(@PathVariable String lightId, @Valid @RequestBody AssignTechnicianRequest request) { return service.assign(lightId, request); }
    @PatchMapping("/{lightId}/maintenance") @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public MonitorLightResponse update(@PathVariable String lightId, @Valid @RequestBody MaintenanceUpdateRequest request) { return service.updateMaintenance(lightId, request); }
    @PostMapping("/{lightId}/resolve") @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public MonitorLightResponse resolve(@PathVariable String lightId) { return service.resolve(lightId); }
}
