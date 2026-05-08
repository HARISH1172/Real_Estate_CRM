package com.crm.realEstae.dto;

import com.crm.realEstae.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
public class DashboardDTO {
    private long totalLeads;
    private long activeLeads;
    private long totalConversions; // Leads with status BOOKING
    private long totalFollowUps;
    private long pendingFollowUps;
    private long completedFollowUps;
    private long totalAgents;
    private long totalManagers;
    private long assignedLeads;
    private long unassignedLeads;
    private List<User> pendingAgents;
    private List<AgentPerformanceDTO> agentPerformance;
    private Map<String, Long> statusBreakdown;
    private List<MonthlyTrendDTO> monthlyTrend;

    private long totalProperties;
    private Map<String, Long> propertyTypeBreakdown; // This is for leads currently, keep for compatibility
    private Map<String, Long> propertiesByType;     // Actual property breakdown
    private Map<String, Long> propertiesByCity;     // Actual property breakdown by city
    private Map<String, Long> cityBreakdown;
    private List<MonthlyTrendDTO> dailyTrend;
}
