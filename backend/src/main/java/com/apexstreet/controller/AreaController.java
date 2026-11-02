package com.apexstreet.controller;

import com.apexstreet.dto.*;
import com.apexstreet.service.AreaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class AreaController {
    private final AreaService service;
    public AreaController(AreaService service) { this.service = service; }
    @GetMapping public List<AreaResponse> all(@RequestParam(required = false) String search, @RequestParam(required = false) String type, @RequestParam(required = false) Boolean automation) { return service.findAll(search, type, automation); }
    @GetMapping("/summary") public AreaSummaryResponse summary() { return service.summary(); }
    @GetMapping("/{id}") public AreaResponse one(@PathVariable Long id) { return service.findById(id); }
    @PostMapping @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')") public ResponseEntity<AreaResponse> create(@Valid @RequestBody AreaRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request)); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')") public AreaResponse update(@PathVariable Long id, @Valid @RequestBody AreaRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
