package com.apexstreet.service;

import com.apexstreet.dto.ReportResponse;
import com.apexstreet.model.*;
import com.apexstreet.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("hh:mm a");
    private final AreaRepository areas;
    private final StreetLightRepository lights;
    private final MaintenanceAssignmentRepository maintenance;
    private final AutomationConfigurationRepository configurations;
    private final AutomationSchedulePhaseRepository phases;
    private final AutomationEventPlanRepository events;
    private final ActivityLogRepository activityLogs;
    private final LightReportRepository lightReports;

    public ReportService(AreaRepository areas, StreetLightRepository lights,
                         MaintenanceAssignmentRepository maintenance,
                         AutomationConfigurationRepository configurations,
                         AutomationSchedulePhaseRepository phases,
                         AutomationEventPlanRepository events,
                         ActivityLogRepository activityLogs,
                         LightReportRepository lightReports) {
        this.areas = areas; this.lights = lights; this.maintenance = maintenance;
        this.configurations = configurations; this.phases = phases; this.events = events; this.activityLogs = activityLogs; this.lightReports = lightReports;
    }

    public ReportResponse generate(String dateRange, String area, String reportType, String search) {
        LocalDate today = LocalDate.now();
        LocalDate from = switch (dateRange == null ? "7d" : dateRange.toLowerCase(Locale.ROOT)) {
            case "today" -> today;
            case "month" -> today.withDayOfMonth(1);
            case "30d" -> today.minusDays(29);
            case "7d" -> today.minusDays(6);
            default -> throw new IllegalArgumentException("dateRange must be one of: today, 7d, 30d, month");
        };
        String selectedArea = area == null || area.isBlank() ? "All Areas" : area.trim();
        String keyword = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        List<StreetLight> allLights = lights.findAll();
        Predicate<StreetLight> areaFilter = l -> "All Areas".equalsIgnoreCase(selectedArea) || selectedArea.equalsIgnoreCase(l.getArea());
        List<StreetLight> scopedLights = allLights.stream().filter(areaFilter).toList();
        List<MaintenanceAssignment> scopedJobs = maintenance.findAll().stream().filter(j -> areaFilter.test(j.getStreetLight()) && inRange(j.getAssignedAt(), from, today)).toList();
        return new ReportResponse(summary(scopedLights, scopedJobs), filterOptions(), performance(scopedLights), areaReports(allLights, selectedArea, keyword), automation(scopedLights, selectedArea, from, today), faults(scopedLights, scopedJobs, from, today, keyword), activities(selectedArea, from, today));
    }

    private boolean inRange(LocalDateTime value, LocalDate from, LocalDate to) { return value == null || (!value.toLocalDate().isBefore(from) && !value.toLocalDate().isAfter(to)); }
    private ReportResponse.FilterOptions filterOptions() {
        List<ReportResponse.DateRange> ranges = List.of(new ReportResponse.DateRange("Last 7 Days", "7d"), new ReportResponse.DateRange("Last 30 Days", "30d"), new ReportResponse.DateRange("This Month", "month"), new ReportResponse.DateRange("Today", "today"));
        List<ReportResponse.ReportType> types = List.of(new ReportResponse.ReportType("All Reports", "all"), new ReportResponse.ReportType("Street Light Performance", "performance"), new ReportResponse.ReportType("Area-Wise Report", "area"), new ReportResponse.ReportType("Automation Report", "automation"), new ReportResponse.ReportType("Fault Report", "fault"));
        List<String> names = new ArrayList<>(); names.add("All Areas"); names.addAll(areas.findAll().stream().map(Area::getName).sorted(String.CASE_INSENSITIVE_ORDER).toList());
        return new ReportResponse.FilterOptions(ranges, names, types);
    }

    private List<ReportResponse.SummaryCard> summary(List<StreetLight> ls, List<MaintenanceAssignment> jobs) {
        long total=ls.size(), active=ls.stream().filter(l -> l.getStatus()!=StreetLightStatus.OFF && !fault(l)).count(), faulty=ls.stream().filter(this::fault).count();
        long avg=averageBrightness(ls); long automated=ls.stream().filter(l -> l.getMode()==StreetLightMode.AUTO || l.getMode()==StreetLightMode.SCHEDULED || l.getMode()==StreetLightMode.ENERGY_SAVING).count();
        return List.of(card("total-lights","Total Street Lights",String.valueOf(total),"From current database scope", "Live database data","network","grid"), card("active-lights","Active Lights",String.valueOf(active),total==0?"No lights in scope":percent(active,total)+"% active operational rate","Current status","success","power"), card("faulty-lights","Faulty Lights",String.valueOf(faulty),"Current fault flags and FAULT status",jobs.size()+" maintenance records in range","danger","warning"), card("avg-brightness","Average Brightness",avg+"%","Average stored brightness","Current database value","energy","bolt"), card("automation-activity","Automation Activity",total==0?"0%":percent(automated,total)+"%",automated+" automated fixtures","Current control modes","network","automation"));
    }
    private ReportResponse.SummaryCard card(String id,String label,String value,String sub,String trend,String tone,String icon){return new ReportResponse.SummaryCard(id,label,value,sub,trend,tone,icon);}

    private ReportResponse.Performance performance(List<StreetLight> ls) {
        long total=ls.size(), on=count(ls,StreetLightStatus.ON), dim=count(ls,StreetLightStatus.DIM), off=count(ls,StreetLightStatus.OFF), faults=ls.stream().filter(this::fault).count(), operational=total-faults;
        List<ReportResponse.StatusBreakdown> breakdown=List.of(new ReportResponse.StatusBreakdown("ON",on,percent(on,total),"#72e7ff"),new ReportResponse.StatusBreakdown("DIM",dim,percent(dim,total),"#4895ef"),new ReportResponse.StatusBreakdown("OFF",off,percent(off,total),"#64748b"),new ReportResponse.StatusBreakdown("FAULT",faults,percent(faults,total),"#ff9b8d"));
        long auto=ls.stream().filter(l->l.getMode()!=StreetLightMode.MANUAL).count(), manual=total-auto;
        List<ReportResponse.BrightnessPoint> points=List.of("06 PM","08 PM","10 PM","12 AM","02 AM","04 AM","06 AM").stream().map(h->new ReportResponse.BrightnessPoint(h,averageBrightness(ls))).toList();
        return new ReportResponse.Performance(total,operational,faults,breakdown,new ReportResponse.ModeSplit(auto,percent(auto,total),manual,percent(manual,total)),points);
    }
    private long count(List<StreetLight> ls, StreetLightStatus status){return ls.stream().filter(l->l.getStatus()==status&&!fault(l)).count();}
    private boolean fault(StreetLight l){return l.isFaultStatus()||l.getStatus()==StreetLightStatus.FAULT;}
    private long averageBrightness(List<StreetLight> ls){return ls.isEmpty()?0:Math.round(ls.stream().mapToInt(l->l.getBrightness()==null?0:l.getBrightness()).average().orElse(0));}
    private long percent(long n,long d){return d==0?0:Math.round(n*100.0/d);}

    private List<ReportResponse.AreaReport> areaReports(List<StreetLight> all, String selected, String search){
        return areas.findAll().stream().filter(a->"All Areas".equalsIgnoreCase(selected)||a.getName().equalsIgnoreCase(selected)).map(a->{List<StreetLight> ls=lights.findForArea(a,a.getName());long total=ls.size(), faults=ls.stream().filter(this::fault).count(), active=ls.stream().filter(l->l.getStatus()!=StreetLightStatus.OFF&&!fault(l)).count(), avg=averageBrightness(ls);String status=faults>0?"Attention Required":"Operational";long saved=Math.max(0,Math.round(total*(100-avg)*0.1));return new ReportResponse.AreaReport(String.valueOf(a.getId()),a.getName(),a.getType().getLabel(),total,active,faults,avg,saved+" kWh",status);}).filter(a->search.isBlank()||StreamText.contains(search,a.area(),a.type(),a.status())).toList();
    }
    private ReportResponse.AutomationReport automation(List<StreetLight> ls,String selected,LocalDate from,LocalDate to){
        long auto=ls.stream().filter(l->l.getMode()!=StreetLightMode.MANUAL).count();
        List<ActivityLog> logs=activityLogs.findAllByOrderByTimestampDesc().stream().filter(log->"Automation".equalsIgnoreCase(log.getModule())).filter(log->inRange(log.getTimestamp(),from,to)).filter(log->"All Areas".equalsIgnoreCase(selected)||selected.equalsIgnoreCase(log.getArea())).toList();
        List<ReportResponse.AutomationAction> actions=logs.stream().limit(8).map(log->new ReportResponse.AutomationAction("LOG-"+log.getId(),log.getTimestamp().format(TIME),log.getAction(),1,log.getArea()==null?"All Areas":log.getArea(),log.getStatus())).toList();
        long turnedOn=logs.stream().filter(log->log.getAction().toUpperCase(Locale.ROOT).contains(" ON")).count();
        long turnedOff=logs.stream().filter(log->log.getAction().toUpperCase(Locale.ROOT).contains(" OFF")).count();
        long dimmed=logs.stream().filter(log->log.getAction().toUpperCase(Locale.ROOT).contains(" DIM")).count();
        return new ReportResponse.AutomationReport(auto,logs.size(),turnedOn,turnedOff,dimmed,actions);
    }
    private ReportResponse.FaultReport faults(List<StreetLight> ls,List<MaintenanceAssignment> jobs,LocalDate from,LocalDate to,String search){
        List<ReportResponse.FaultRecord> allRecords=new ArrayList<>(); Set<Long> scopedIds=ls.stream().map(StreetLight::getId).collect(Collectors.toSet());
        lightReports.findAll().stream().filter(r->scopedIds.contains(r.getStreetLight().getId())).filter(r->inRange(r.getCreatedAt(),from,to)).forEach(r->{StreetLight l=r.getStreetLight(); allRecords.add(new ReportResponse.FaultRecord("FLT-"+r.getId(),l.getLightId(),l.getArea(),r.getIssue(),severity(l),r.getCreatedAt().toString(),r.getStatus().name()));});
        Set<Long> reportedLightIds=lightReports.findAll().stream().filter(r->scopedIds.contains(r.getStreetLight().getId())).map(r->r.getStreetLight().getId()).collect(Collectors.toSet());
        ls.stream().filter(this::fault).filter(l->!reportedLightIds.contains(l.getId())).forEach(l->allRecords.add(new ReportResponse.FaultRecord("FLT-"+l.getLightId(),l.getLightId(),l.getArea(),"Street light fault requires attention",severity(l),l.getUpdatedAt().toString(),"UNASSIGNED")));
        List<ReportResponse.FaultRecord> records=allRecords.stream().filter(r->search.isBlank()||StreamText.contains(search,r.lightId(),r.area(),r.issueType(),r.severity(),r.status())).toList();long active=records.stream().filter(r->!"RESOLVED".equals(r.status())).count(),resolved=records.stream().filter(r->"RESOLVED".equals(r.status())).count(),critical=records.stream().filter(r->"Critical".equals(r.severity())).count();Map<String,Long> byArea=records.stream().collect(Collectors.groupingBy(ReportResponse.FaultRecord::area,TreeMap::new,Collectors.counting()));return new ReportResponse.FaultReport(new ReportResponse.FaultSummary(records.size(),active,resolved,critical),byArea.entrySet().stream().map(e->new ReportResponse.FaultArea(e.getKey(),e.getValue())).toList(),records);
    }
    private String severity(StreetLight l){return l.getStatus()==StreetLightStatus.FAULT?"Critical":"High";}
    private List<ReportResponse.Activity> activities(String selected,LocalDate from,LocalDate to){List<ReportResponse.Activity> result=new ArrayList<>();configurations.findAll().stream().filter(c->"All Areas".equalsIgnoreCase(selected)||c.getArea().getName().equalsIgnoreCase(selected)).forEach(c->result.add(new ReportResponse.Activity("CFG-"+c.getId(),c.getArea().getName(),"Automation configuration "+(c.isEnabled()?"enabled":"paused"),c.getArea().getName(),"Completed")));maintenance.findAll().stream().filter(j->inRange(j.getAssignedAt(),from,to)&&("All Areas".equalsIgnoreCase(selected)||selected.equalsIgnoreCase(j.getStreetLight().getArea()))).limit(20).forEach(j->result.add(new ReportResponse.Activity("MAINT-"+j.getId(),j.getAssignedAt().toString(),"Maintenance record "+j.getStatus().name(),j.getStreetLight().getArea(),"Completed".equals(j.getStatus().name())?"Completed":"Flagged")));return result.stream().sorted(Comparator.comparing(ReportResponse.Activity::dateTime).reversed()).toList();}
    private static final class StreamText {static boolean contains(String q,String... values){return Arrays.stream(values).filter(Objects::nonNull).anyMatch(v->v.toLowerCase(Locale.ROOT).contains(q));}}
}
