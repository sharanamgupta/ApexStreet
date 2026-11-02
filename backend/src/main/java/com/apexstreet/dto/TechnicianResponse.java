package com.apexstreet.dto;

import com.apexstreet.model.Technician;
import com.apexstreet.model.TechnicianAvailability;

public record TechnicianResponse(Long id, String name, String specialization,
                                 TechnicianAvailability availability, long workload, String area) {
    public static TechnicianResponse from(Technician technician, long workload) {
        return new TechnicianResponse(technician.getId(), technician.getName(), technician.getSpecialization(), technician.getAvailability(), workload,
                technician.getAreaReference() == null ? null : technician.getAreaReference().getName());
    }
}
