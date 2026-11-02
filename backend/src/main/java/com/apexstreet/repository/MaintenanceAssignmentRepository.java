package com.apexstreet.repository;

import com.apexstreet.model.MaintenanceAssignment;
import com.apexstreet.model.MaintenanceStatus;
import com.apexstreet.model.StreetLight;
import com.apexstreet.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MaintenanceAssignmentRepository extends JpaRepository<MaintenanceAssignment, Long> {
    void deleteByStreetLightLightId(String lightId);
    List<MaintenanceAssignment> findByStreetLightLightIdOrderByAssignedAtDesc(String lightId);
    Optional<MaintenanceAssignment> findFirstByStreetLightLightIdAndStatusInOrderByAssignedAtDesc(String lightId, Collection<MaintenanceStatus> statuses);
    long countByStatusIn(Collection<MaintenanceStatus> statuses);
    long countByTechnicianIdAndStatusIn(Long technicianId, Collection<MaintenanceStatus> statuses);
}
