package com.apexstreet.service;

import com.apexstreet.dto.ActivityLogResponse;
import com.apexstreet.model.ActivityLog;
import com.apexstreet.repository.ActivityLogRepository;
import com.apexstreet.repository.AreaRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class ActivityLogService {
    private final ActivityLogRepository repository; private final AreaRepository areas;
    public ActivityLogService(ActivityLogRepository repository, AreaRepository areas){this.repository=repository;this.areas=areas;}

    public ActivityLogResponse.Page search(String dateRange,String status,String module,String area,String search){
        LocalDate today=LocalDate.now(); LocalDate from=switch(dateRange==null?"all":dateRange.toLowerCase(Locale.ROOT)){case "today"->today;case "7d"->today.minusDays(6);case "30d"->today.minusDays(29);case "all"->null;default->throw new IllegalArgumentException("dateRange must be one of: all, today, 7d, 30d");};
        String q=search==null?"":search.trim().toLowerCase(Locale.ROOT); String selectedStatus=defaultValue(status,"all"), selectedModule=defaultValue(module,"All Modules"), selectedArea=defaultValue(area,"All Areas");
        List<ActivityLog> all=repository.findAllByOrderByTimestampDesc(); List<ActivityLog> filtered=all.stream().filter(l->from==null||!l.getTimestamp().toLocalDate().isBefore(from)).filter(l->"all".equalsIgnoreCase(selectedStatus)||selectedStatus.equalsIgnoreCase(l.getStatus())).filter(l->"All Modules".equalsIgnoreCase(selectedModule)||selectedModule.equalsIgnoreCase(l.getModule())).filter(l->"All Areas".equalsIgnoreCase(selectedArea)||"All Areas".equalsIgnoreCase(l.getArea())||selectedArea.equalsIgnoreCase(l.getArea())).filter(l->q.isBlank()||contains(q,l.getId()==null?null:"LOG-"+l.getId(),l.getAction(),l.getDescription(),l.getModule(),l.getArea(),l.getUserOrSystem(),l.getTarget())).toList();
        return new ActivityLogResponse.Page(filtered.stream().map(this::dto).toList(),summary(all),filters(all));
    }
    public void record(String action, String description, String module, String area, String target, String status, String type) {
        record(action, description, module, area, target, status, type, null);
    }
    public void record(String action, String description, String module, String area, String target, String status, String type, Map<String, String> details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication != null && authentication.isAuthenticated() ? authentication.getName() : "System";
        ActivityLog log = new ActivityLog();
        log.setAction(action); log.setDescription(description); log.setModule(module); log.setArea(area);
        log.setTarget(target); log.setStatus(status); log.setType(type); log.setUserOrSystem(actor);
        if (details != null && !details.isEmpty()) log.setDetails(details.entrySet().stream().map(entry -> entry.getKey() + "=" + entry.getValue()).collect(Collectors.joining("\n")));
        repository.save(log);
    }
    private String defaultValue(String v,String d){return v==null||v.isBlank()?d:v;}
    private boolean contains(String q,String... values){return Arrays.stream(values).filter(Objects::nonNull).anyMatch(v->v.toLowerCase(Locale.ROOT).contains(q));}
    private ActivityLogResponse dto(ActivityLog l){Map<String,String> details=new LinkedHashMap<>(); if(l.getDetails()!=null&&!l.getDetails().isBlank()) Arrays.stream(l.getDetails().split("\\n",-1)).forEach(item->{String[] p=item.split("=",2);if(p.length==2)details.put(p[0],p[1]);}); return new ActivityLogResponse("LOG-"+l.getId(),l.getAction(),l.getDescription(),l.getDescription(),l.getModule(),defaultValue(l.getArea(),"All Areas"),l.getUserOrSystem(),l.getTarget(),l.getStatus(),l.getType(),l.getTimestamp(),details.isEmpty()?null:details);}
    private List<ActivityLogResponse.SummaryCard> summary(List<ActivityLog> logs){long total=logs.size(),today=logs.stream().filter(l->l.getTimestamp().toLocalDate().equals(LocalDate.now())).count(),automation=logs.stream().filter(l->"Automation".equalsIgnoreCase(l.getModule())).count(),alerts=logs.stream().filter(l->"Warning".equalsIgnoreCase(l.getStatus())||"Error".equalsIgnoreCase(l.getStatus())).count();return List.of(card("total-activities","Total Activities",total,"Logged across all modules","Database records","network","activity"),card("today-activities","Today's Activities",today,"Recorded since midnight","Current day","success","clock"),card("automation-events","Automation Events",automation,"Automation module records",total==0?"0% of total":Math.round(automation*100.0/total)+"% of total events","energy","automation"),card("fault-alerts","Fault / Alert Events",alerts,"Warning and error records",alerts==0?"No active alerts":"Attention required","danger","warning"));}
    private ActivityLogResponse.SummaryCard card(String id,String label,long value,String sub,String trend,String tone,String icon){return new ActivityLogResponse.SummaryCard(id,label,String.valueOf(value),sub,trend,tone,icon);}
    private ActivityLogResponse.FilterOptions filters(List<ActivityLog> logs){List<ActivityLogResponse.DateRange> dates=List.of(new ActivityLogResponse.DateRange("All Time","all"),new ActivityLogResponse.DateRange("Today","today"),new ActivityLogResponse.DateRange("Last 7 Days","7d"),new ActivityLogResponse.DateRange("Last 30 Days","30d"));List<ActivityLogResponse.StatusOption> statuses=List.of(new ActivityLogResponse.StatusOption("All Statuses","all"),new ActivityLogResponse.StatusOption("Success","Success"),new ActivityLogResponse.StatusOption("Warning","Warning"),new ActivityLogResponse.StatusOption("Error","Error"),new ActivityLogResponse.StatusOption("Info","Info"));List<String> modules=new ArrayList<>(List.of("All Modules","Street Lights","Areas","Automation","Reports","System/Auth"));logs.stream().map(ActivityLog::getModule).filter(Objects::nonNull).filter(m->!modules.contains(m)).distinct().forEach(modules::add);List<String> areaNames=new ArrayList<>();areaNames.add("All Areas");areaNames.addAll(areas.findAll().stream().map(a->a.getName()).sorted(String.CASE_INSENSITIVE_ORDER).toList());return new ActivityLogResponse.FilterOptions(dates,statuses,modules,areaNames);}
}
