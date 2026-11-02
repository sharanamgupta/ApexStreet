package com.apexstreet.repository;

import com.apexstreet.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface LightReportRepository extends JpaRepository<LightReport, Long> {
    void deleteByStreetLightLightId(String lightId);
    List<LightReport> findByReporterEmailOrderByCreatedAtDesc(String email);
    List<LightReport> findByStatusInOrderByCreatedAtDesc(Collection<LightReportStatus> statuses);
    Optional<LightReport> findFirstByStreetLightLightIdAndStatusInOrderByCreatedAtDesc(String lightId, Collection<LightReportStatus> statuses);
}
