package com.apexstreet.dto;
import com.apexstreet.model.*; import jakarta.validation.constraints.*; import java.time.*;
public final class AutomationRequests { private AutomationRequests(){}
 public record ConfigurationRequest(Boolean enabled, AutomationMode mode, Boolean faultHoldEnabled, Boolean preserveLastSafeCommand, AutomationSeason season){}
 public record PhaseRequest(@NotNull LocalTime startTime,@NotNull LocalTime endTime,@NotNull AutomationAction action,@NotNull @Min(0) @Max(100) Integer brightness,@NotNull AutomationWeekType weekType,@Min(0) Integer priority,@Min(0) Integer phaseOrder){}
 public record OverrideRequest(@NotNull AutomationOverrideMode mode,@NotNull @Min(0) @Max(100) Integer brightness,@Min(1) Integer durationMinutes){}
 public record GroupCommandRequest(@NotNull AutomationOverrideMode mode,@NotNull @Min(0) @Max(100) Integer brightness,@Min(1) Integer durationMinutes){}
 public record EventRequest(@NotBlank @Size(max=150) String name,@NotNull LocalDate eventDate,@NotNull @Min(0) @Max(100) Integer brightness,Boolean enabled){}
}
