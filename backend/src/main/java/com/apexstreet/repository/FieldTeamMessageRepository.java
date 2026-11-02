package com.apexstreet.repository;

import com.apexstreet.model.FieldTeamMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FieldTeamMessageRepository extends JpaRepository<FieldTeamMessage, Long> {
    void deleteByStreetLightLightId(String lightId);
    List<FieldTeamMessage> findByStreetLightLightIdOrderByCreatedAtAsc(String lightId);
}
