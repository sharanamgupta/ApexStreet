package com.apexstreet.service;

import com.apexstreet.dto.*;
import com.apexstreet.model.*;
import com.apexstreet.repository.AreaRepository;
import com.apexstreet.repository.StreetLightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class AreaService {
    private final AreaRepository areas;
    private final StreetLightRepository lights;
    private final ActivityLogService activityLogs;
    public AreaService(AreaRepository areas, StreetLightRepository lights, ActivityLogService activityLogs) { this.areas = areas; this.lights = lights; this.activityLogs = activityLogs; }

    @Transactional(readOnly = true)
    public List<AreaResponse> findAll(String search, String type, Boolean automation) {
        AreaType parsed = type == null || type.isBlank() || type.equalsIgnoreCase("All Areas") ? null : AreaType.fromLabel(type);
        return areas.findAll().stream().filter(a -> search == null || search.isBlank() || a.getName().toLowerCase().contains(search.trim().toLowerCase()))
                .filter(a -> parsed == null || a.getType() == parsed).filter(a -> automation == null || a.isAutomationEnabled() == automation).map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AreaSummaryResponse summary() {
        List<AreaResponse> values = areas.findAll().stream().map(this::toResponse).toList();
        return new AreaSummaryResponse(values.size(), values.stream().mapToLong(AreaResponse::totalLights).sum(), values.stream().filter(AreaResponse::active).count(), values.stream().filter(a -> a.faultLights() > 0).count());
    }

    @Transactional(readOnly = true)
    public AreaResponse findById(Long id) { return toResponse(get(id)); }

    @Transactional
    public AreaResponse create(AreaRequest request) { Area area = new Area(); apply(area, request); Area saved = areas.save(area); activityLogs.record("Area created", "Created area " + saved.getName(), "Areas", saved.getName(), String.valueOf(saved.getId()), "Success", "User Action"); return toResponse(saved); }

    @Transactional
    public AreaResponse update(Long id, AreaRequest request) { Area area = get(id); String oldName = area.getName(); apply(area, request); if (!oldName.equalsIgnoreCase(area.getName())) lights.findByAreaIgnoreCase(oldName).forEach(light -> { light.setArea(area.getName()); light.setAreaReference(area); lights.save(light); }); Area saved = areas.save(area); activityLogs.record("Area updated", "Updated area " + saved.getName(), "Areas", saved.getName(), String.valueOf(saved.getId()), "Success", "User Action"); return toResponse(saved); }

    @Transactional
    public void delete(Long id) { Area area = get(id); if (!lights.findForArea(area, area.getName()).isEmpty()) throw new IllegalStateException("Area cannot be deleted while Street Lights are associated with it."); areas.delete(area); activityLogs.record("Area deleted", "Deleted area " + area.getName(), "Areas", area.getName(), String.valueOf(id), "Success", "User Action"); }

    private void apply(Area area, AreaRequest request) {
        String name = request.name().trim();
        areas.findByNameIgnoreCase(name).filter(existing -> !existing.equals(area)).ifPresent(existing -> { throw new DuplicateAreaException(name); });
        area.setName(name); area.setDescription(request.description() == null ? "" : request.description().trim()); area.setType(AreaType.fromLabel(request.type()));
        if (request.active() != null) area.setActive(request.active());
        if (request.automationEnabled() != null) area.setAutomationEnabled(request.automationEnabled());
    }

    private AreaResponse toResponse(Area area) {
        List<StreetLight> related = lights.findForArea(area, area.getName());
        long on = related.stream().filter(l -> l.getStatus() == StreetLightStatus.ON && !l.isFaultStatus()).count();
        long dim = related.stream().filter(l -> l.getStatus() == StreetLightStatus.DIM && !l.isFaultStatus()).count();
        long off = related.stream().filter(l -> l.getStatus() == StreetLightStatus.OFF && !l.isFaultStatus()).count();
        long faults = related.stream().filter(l -> l.isFaultStatus() || l.getStatus() == StreetLightStatus.FAULT).count();
        long total = related.size(); double responding = total == 0 ? 0 : ((on + dim) * 100.0) / total;
        double energy = related.stream().map(l -> BigDecimal.valueOf(l.getPowerRating().doubleValue() * l.getBrightness() / 100.0 / 1000.0)).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP).doubleValue();
        List<AreaLightResponse> lightResponses = related.stream().map(l -> new AreaLightResponse(l.getLightId(), l.getArea(), l.getStatus(), l.getBrightness(), l.getPowerRating(), l.isFaultStatus())).toList();
        double averageBrightness = total == 0 ? 0 : related.stream().mapToInt(StreetLight::getBrightness).average().orElse(0);
        return new AreaResponse(area.getId(), area.getName(), area.getDescription(), area.getType().getLabel(), area.isActive(), area.isAutomationEnabled(), total, on, dim, off, faults, round(responding), round(responding), energy, 0, round(averageBrightness), area.getCreatedAt(), area.getUpdatedAt(), lightResponses);
    }
    private double round(double value) { return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue(); }
    private Area get(Long id) { return areas.findById(id).orElseThrow(() -> new AreaNotFoundException(id)); }
}
