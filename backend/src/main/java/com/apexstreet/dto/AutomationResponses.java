package com.apexstreet.dto;
import com.apexstreet.model.*; import java.time.*; import java.util.*;
public final class AutomationResponses { private AutomationResponses(){}
 public record AreaSummary(Long id,String name,String type,long totalLights,long faultCount,boolean enabled,AutomationMode mode){}
 public record Phase(Long id,LocalTime startTime,LocalTime endTime,AutomationAction action,Integer brightness,AutomationWeekType weekType,Integer priority,Integer phaseOrder){}
 public record Light(String id,Long databaseId,String area,StreetLightStatus status,StreetLightMode baseMode,AutomationOverrideMode mode,Integer brightness,boolean faultStatus,LocalDateTime expiresAt){}
 public record Event(Long id,String name,LocalDate eventDate,Integer brightness,boolean enabled){}
 public record Page(Long areaId,String areaName,String areaType,boolean enabled,AutomationMode mode,AutomationSeason season,boolean faultHoldEnabled,boolean preserveLastSafeCommand,long totalLights,long faultCount,List<Phase> phases,List<Light> lights,List<Event> events,List<Light> activeOverrides){}
}
