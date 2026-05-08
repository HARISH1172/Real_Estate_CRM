package com.crm.realEstae.controller;

import com.crm.realEstae.dto.DashboardDTO;
import com.crm.realEstae.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public DashboardDTO getDashboardStats(java.security.Principal principal, 
                                        @org.springframework.web.bind.annotation.RequestParam(required = false) String city) {
        return dashboardService.getDashboardStats(principal.getName(), city);
    }

    @GetMapping("/daily-trend")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public java.util.List<com.crm.realEstae.dto.MonthlyTrendDTO> getDailyTrend(java.security.Principal principal, @org.springframework.web.bind.annotation.RequestParam String month) {
        return dashboardService.getDailyTrendForMonth(principal.getName(), month);
    }

    @GetMapping("/agent-stats/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public com.crm.realEstae.dto.AgentPerformanceDTO getAgentStats(@org.springframework.web.bind.annotation.PathVariable java.util.UUID agentId) {
        return dashboardService.getAgentPerformance(agentId);
    }
}
