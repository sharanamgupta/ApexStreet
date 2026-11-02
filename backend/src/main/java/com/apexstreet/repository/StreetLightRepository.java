package com.apexstreet.repository;

import com.apexstreet.model.StreetLight;
import com.apexstreet.model.Area;
import com.apexstreet.model.StreetLightMode;
import com.apexstreet.model.StreetLightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StreetLightRepository extends JpaRepository<StreetLight, Long> {

    Optional<StreetLight> findByLightId(String lightId);

    boolean existsByLightId(String lightId);

    List<StreetLight> findByAreaIgnoreCase(String area);

    @Query("select s from StreetLight s where s.areaReference = :area or lower(s.area) = lower(:name) order by s.lightId")
    List<StreetLight> findForArea(@Param("area") Area area, @Param("name") String name);

    @Query("select s from StreetLight s " +
            "where (:search is null or lower(s.lightId) like lower(concat('%', :search, '%')) " +
            "or lower(s.area) like lower(concat('%', :search, '%'))) " +
            "and (:area is null or lower(s.area) = lower(:area)) " +
            "and (:status is null or s.status = :status) " +
            "and (:mode is null or s.mode = :mode) " +
            "order by s.lightId")
    List<StreetLight> search(@Param("search") String search,
                             @Param("area") String area,
                             @Param("status") StreetLightStatus status,
                             @Param("mode") StreetLightMode mode);

    long countByStatus(StreetLightStatus status);

    @Query("select count(s) from StreetLight s where s.faultStatus = true or s.status = com.apexstreet.model.StreetLightStatus.FAULT")
    long countFaulty();
}
