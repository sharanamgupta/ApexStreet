package com.apexstreet.controller;

import com.apexstreet.dto.StreetLightRequest;
import com.apexstreet.dto.StreetLightResponse;
import com.apexstreet.dto.StreetLightStatisticsResponse;
import com.apexstreet.model.StreetLightMode;
import com.apexstreet.model.StreetLightStatus;
import com.apexstreet.service.StreetLightService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/street-lights")
public class StreetLightController {
    private final StreetLightService service;

    public StreetLightController(StreetLightService service) {
        this.service = service;
    }

    @GetMapping
    public List<StreetLightResponse> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) StreetLightStatus status,
            @RequestParam(required = false) StreetLightMode mode) {
        return service.findAll(search, area, status, mode);
    }

    @GetMapping("/statistics")
    public StreetLightStatisticsResponse statistics() {
        return service.statistics();
    }

    @GetMapping("/{id}")
    public StreetLightResponse getById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<StreetLightResponse> create(@Valid @RequestBody StreetLightRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public StreetLightResponse update(@PathVariable String id, @Valid @RequestBody StreetLightRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
