package com.apexstreet.repository;

import com.apexstreet.model.Area;
import com.apexstreet.model.AreaType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AreaRepository extends JpaRepository<Area, Long> {
    Optional<Area> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Area> findByNameContainingIgnoreCase(String name);
    List<Area> findByType(AreaType type);
    List<Area> findByAutomationEnabled(boolean enabled);
}
