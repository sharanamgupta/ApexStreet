package com.apexstreet.repository;

import com.apexstreet.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    boolean existsByNameIgnoreCase(String name);
}
