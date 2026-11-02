package com.apexstreet.repository; import com.apexstreet.model.AutomationConfiguration; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface AutomationConfigurationRepository extends JpaRepository<AutomationConfiguration,Long>{Optional<AutomationConfiguration> findByAreaId(Long areaId);}
