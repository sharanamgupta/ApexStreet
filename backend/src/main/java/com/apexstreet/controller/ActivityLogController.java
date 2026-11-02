package com.apexstreet.controller;

import com.apexstreet.dto.ActivityLogResponse;
import com.apexstreet.service.ActivityLogService;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/activity-logs")
public class ActivityLogController {
    private final ActivityLogService service;
    public ActivityLogController(ActivityLogService service){this.service=service;}
    @GetMapping public ActivityLogResponse.Page get(@RequestParam(defaultValue="all") String dateRange,@RequestParam(defaultValue="all") String status,@RequestParam(defaultValue="All Modules") String module,@RequestParam(defaultValue="All Areas") String area,@RequestParam(defaultValue="") String search){return service.search(dateRange,status,module,area,search);}
}
