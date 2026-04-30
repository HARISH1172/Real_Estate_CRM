package com.crm.realEstae.service;

import com.crm.realEstae.dto.AgentPerformanceDTO;
import com.crm.realEstae.dto.DashboardDTO;
import com.crm.realEstae.dto.MonthlyTrendDTO;
import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.Property;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.FollowUpStatus;
import com.crm.realEstae.entity.enums.LeadStatus;
import com.crm.realEstae.entity.enums.Role;
import com.crm.realEstae.repository.FollowUpRepository;
import com.crm.realEstae.repository.LeadRepository;
import com.crm.realEstae.repository.PropertyRepository;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeadRepository leadRepository;
    private final FollowUpRepository followUpRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    public DashboardDTO getDashboardStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DashboardDTO stats = new DashboardDTO();
        List<Lead> relevantLeads;
        
        if (user.getRole() == Role.ADMIN) {
            stats.setTotalLeads(leadRepository.count());
            stats.setActiveLeads(leadRepository.count() - leadRepository.countByStatus(LeadStatus.BOOKING));
            stats.setTotalConversions(leadRepository.countByStatus(LeadStatus.BOOKING));
            stats.setTotalFollowUps(followUpRepository.count());
            stats.setPendingFollowUps(followUpRepository.countByStatus(FollowUpStatus.PENDING));
            stats.setCompletedFollowUps(followUpRepository.countByStatus(FollowUpStatus.COMPLETED));
            stats.setTotalAgents(userRepository.countByRole(Role.AGENT));
            stats.setTotalManagers(userRepository.countByRole(Role.MANAGER));
            stats.setPendingAgents(userRepository.findByRoleAndApproved(Role.AGENT, false));
            
            // For breakdowns and trends, we still need the list for now or use native queries
            relevantLeads = leadRepository.findAll(); 
            List<User> allAgents = userRepository.findByRole(Role.AGENT);
            stats.setAgentPerformance(calculatePerformance(allAgents));
        } else if (user.getRole() == Role.MANAGER) {
            relevantLeads = leadRepository.findByCreatedBy(user);
            stats.setTotalLeads(relevantLeads.size());
            stats.setActiveLeads(relevantLeads.stream().filter(l -> l.getStatus() != LeadStatus.BOOKING).count());
            stats.setTotalConversions(relevantLeads.stream().filter(l -> l.getStatus() == LeadStatus.BOOKING).count());
            
            List<User> myAgents = userRepository.findByAssignedManager(user);
            stats.setTotalAgents(myAgents.size());
            stats.setAgentPerformance(calculatePerformance(myAgents));
            
            stats.setAssignedLeads(relevantLeads.stream().filter(l -> l.getAssignedAgent() != null).count());
            stats.setUnassignedLeads(relevantLeads.stream().filter(l -> l.getAssignedAgent() == null).count());
        } else if (user.getRole() == Role.AGENT) {
            relevantLeads = user.getAssignedManager() == null ? new ArrayList<>() : leadRepository.findByAssignedAgent(user);
            stats.setTotalLeads(relevantLeads.size());
            stats.setAssignedLeads(relevantLeads.stream().filter(l -> l.getStatus() != LeadStatus.BOOKING).count());
            stats.setTotalConversions(relevantLeads.stream().filter(l -> l.getStatus() == LeadStatus.BOOKING).count());
            stats.setTotalFollowUps(user.getAssignedManager() == null ? 0 : followUpRepository.countByLeadAssignedAgent(user));
        } else {
            relevantLeads = new ArrayList<>();
        }

        // Calculate Breakdown & Trend
        stats.setStatusBreakdown(relevantLeads.stream()
                .collect(Collectors.groupingBy(l -> l.getStatus().name(), Collectors.counting())));

        // Property Stats
        if (user.getRole() == Role.ADMIN) {
            stats.setTotalProperties(propertyRepository.count());
        } else if (user.getRole() == Role.MANAGER) {
            stats.setTotalProperties(propertyRepository.countByAssignedManager(user));
        } else if (user.getRole() == Role.AGENT) {
            stats.setTotalProperties(user.getAssignedManager() == null ? 0 : propertyRepository.countByAssignedAgent(user));
        }

        stats.setPropertyTypeBreakdown(relevantLeads.stream()
                .filter(l -> l.getPropertyType() != null)
                .collect(Collectors.groupingBy(Lead::getPropertyType, Collectors.counting())));

        // Trend (last 6 months) - Optimized loop
        LocalDateTime now = LocalDateTime.now();
        List<MonthlyTrendDTO> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            String label = month.getMonth().name().substring(0, 3);
            long count = relevantLeads.stream()
                    .filter(l -> l.getCreatedAt() != null && 
                               l.getCreatedAt().getMonth() == month.getMonth() && 
                               l.getCreatedAt().getYear() == month.getYear())
                    .count();
            trend.add(new MonthlyTrendDTO(label, count));
        }
        stats.setMonthlyTrend(trend);

        // Daily Trend (last 30 days)
        List<MonthlyTrendDTO> dailyTrend = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDateTime day = now.minusDays(i);
            String label = day.getDayOfMonth() + " " + day.getMonth().name().substring(0, 3);
            long count = relevantLeads.stream()
                    .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().toLocalDate().equals(day.toLocalDate()))
                    .count();
            dailyTrend.add(new MonthlyTrendDTO(label, count));
        }
        stats.setDailyTrend(dailyTrend);

        // City Breakdown - Group by Manager's Jurisdiction
        stats.setCityBreakdown(relevantLeads.stream()
                .filter(l -> l.getCreatedBy() != null && l.getCreatedBy().getAssignedCity() != null)
                .collect(Collectors.groupingBy(l -> l.getCreatedBy().getAssignedCity(), Collectors.counting())));

        return stats;
    }

    public List<MonthlyTrendDTO> getDailyTrendForMonth(String email, String monthName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Lead> relevantLeads;
        if (user.getRole() == Role.ADMIN) {
            relevantLeads = leadRepository.findAll();
        } else if (user.getRole() == Role.MANAGER) {
            relevantLeads = leadRepository.findByCreatedBy(user);
        } else if (user.getRole() == Role.AGENT) {
            relevantLeads = leadRepository.findByAssignedAgent(user);
        } else {
            relevantLeads = new ArrayList<>();
        }

        LocalDateTime now = LocalDateTime.now();
        // Convert monthName (e.g. "Apr") to Month
        java.time.Month targetMonth = java.util.Arrays.stream(java.time.Month.values())
                .filter(m -> m.name().startsWith(monthName.toUpperCase()))
                .findFirst()
                .orElse(now.getMonth());
        
        int year = now.getYear();
        // If the month is in the future relative to now, it's likely from last year (since we show last 6 months)
        if (targetMonth.getValue() > now.getMonthValue()) {
            year--;
        }

        java.time.YearMonth yearMonth = java.time.YearMonth.of(year, targetMonth);
        List<MonthlyTrendDTO> dailyTrend = new ArrayList<>();
        
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDateTime date = yearMonth.atDay(day).atStartOfDay();
            String label = day + " " + monthName;
            long count = relevantLeads.stream()
                    .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().toLocalDate().equals(date.toLocalDate()))
                    .count();
            dailyTrend.add(new MonthlyTrendDTO(label, count));
        }
        
        return dailyTrend;
    }

    private List<AgentPerformanceDTO> calculatePerformance(List<User> agents) {
        if (agents.isEmpty()) return new ArrayList<>();
        
        java.util.Map<java.util.UUID, Long> leadCounts = leadRepository.countLeadsByAgents(agents).stream()
                .collect(Collectors.toMap(row -> (java.util.UUID) row[0], row -> (Long) row[1]));
        
        java.util.Map<java.util.UUID, Long> bookingCounts = leadRepository.countBookingsByAgents(agents).stream()
                .collect(Collectors.toMap(row -> (java.util.UUID) row[0], row -> (Long) row[1]));

        List<AgentPerformanceDTO> performance = new ArrayList<>();
        for (User agent : agents) {
            performance.add(new AgentPerformanceDTO(
                    agent.getId(),
                    agent.getName(),
                    leadCounts.getOrDefault(agent.getId(), 0L),
                    bookingCounts.getOrDefault(agent.getId(), 0L)
            ));
        }
        return performance;
    }
}
