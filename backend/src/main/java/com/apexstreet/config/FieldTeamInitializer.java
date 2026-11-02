package com.apexstreet.config;

import com.apexstreet.model.Technician;
import com.apexstreet.model.TechnicianAvailability;
import com.apexstreet.model.Area;
import com.apexstreet.model.AreaType;
import com.apexstreet.repository.AreaRepository;
import com.apexstreet.repository.TechnicianRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Adds the initial field-team directory for a new ApexStreet database.
 * Existing technician records are preserved and never duplicated.
 */
@Component
public class FieldTeamInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(FieldTeamInitializer.class);

    private final TechnicianRepository technicianRepository;
    private final AreaRepository areaRepository;

    public FieldTeamInitializer(TechnicianRepository technicianRepository, AreaRepository areaRepository) {
        this.technicianRepository = technicianRepository;
        this.areaRepository = areaRepository;
    }

    @Override
    public void run(String... args) {
        ensureCommunityArea();
        int added = 0;
        List<Technician> existing = technicianRepository.findAll();
        for (Area area : areaRepository.findAll().stream().filter(Area::isActive).toList()) {
            Technician technician = existing.stream()
                    .filter(item -> item.getAreaReference() != null && item.getAreaReference().getId().equals(area.getId()))
                    .findFirst()
                    .orElseGet(() -> existing.stream().filter(item -> item.getAreaReference() == null).findFirst().orElse(null));

            if (technician == null) {
                technician = new Technician();
                technician.setName(area.getName() + " Field Technician");
                technician.setSpecialization("Physical street-light repair");
                technician.setAvailability(TechnicianAvailability.AVAILABLE);
                existing.add(technician);
                added++;
            }
            technician.setAreaReference(area);
            technicianRepository.save(technician);
        }

        if (added > 0) {
            logger.info("Initialized {} field-team technician record(s).", added);
        }
    }

    private void ensureCommunityArea() {
        if (areaRepository.existsByNameIgnoreCase("Community")) return;
        Area community = new Area();
        community.setName("Community");
        community.setDescription("Residential community street-light coverage.");
        community.setType(AreaType.RESIDENTIAL);
        community.setActive(true);
        community.setAutomationEnabled(true);
        areaRepository.save(community);
        logger.info("Initialized the Community area for field-team coverage.");
    }
}
