package com.crm.realEstae.service;

import com.crm.realEstae.dto.AgentPerformanceDTO;
import com.crm.realEstae.dto.DashboardDTO;
import com.crm.realEstae.dto.MonthlyTrendDTO;
import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.FollowUpStatus;
import com.crm.realEstae.entity.enums.LeadStatus;
import com.crm.realEstae.entity.enums.Role;
import com.crm.realEstae.repository.FollowUpRepository;
import com.crm.realEstae.repository.LeadRepository;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeadRepository leadRepository;
    private final FollowUpRepository followUpRepository;
    private final UserRepository userRepository;

    public DashboardDTO getDashboardStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DashboardDTO stats = new DashboardDTO();
        List<com.crm.realEstae.entity.Lead> relevantLeads;
        
        if (user.getRole() == Role.ADMIN) {
            relevantLeads = leadRepository.findAll();
            stats.setTotalLeads(relevantLeads.size());
            stats.setActiveLeads(relevantLeads.stream().filter(l -> l.getStatus() != LeadStatus.BOOKING).count());
            stats.setTotalConversions(relevantLeads.stream().filter(l -> l.getStatus() == LeadStatus.BOOKING).count());
            stats.setTotalFollowUps(followUpRepository.count());
            stats.setPendingFollowUps(followUpRepository.countByStatus(FollowUpStatus.PENDING));
            stats.setCompletedFollowUps(followUpRepository.countByStatus(FollowUpStatus.COMPLETED));
            stats.setTotalAgents(userRepository.countByRole(Role.AGENT));
            stats.setTotalManagers(userRepository.countByRole(Role.MANAGER));
            stats.setPendingAgents(userRepository.findByRoleAndApproved(Role.AGENT, false));
            
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
            relevantLeads = leadRepository.findByAssignedAgent(user);
            stats.setTotalLeads(relevantLeads.size());
            stats.setAssignedLeads(relevantLeads.stream().filter(l -> l.getStatus() != LeadStatus.BOOKING).count()); // Open leads
            stats.setTotalConversions(relevantLeads.stream().filter(l -> l.getStatus() == LeadStatus.BOOKING).count());
            stats.setTotalFollowUps(followUpRepository.countByLeadAssignedAgent(user));
        } else {
            relevantLeads = new java.util.ArrayList<>();
        }

        // Calculate Breakdown & Trend
        stats.setStatusBreakdown(relevantLeads.stream()
                .collect(java.util.stream.Collectors.groupingBy(l -> l.getStatus().name(), java.util.stream.Collectors.counting())));

        // Trend (last 6 months)
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        List<MonthlyTrendDTO> trend = new java.util.ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDateTime month = now.minusMonths(i);
            String label = month.getMonth().name().substring(0, 3);
            long count = relevantLeads.stream()
                    .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().getMonth() == month.getMonth() && l.getCreatedAt().getYear() == month.getYear())
                    .count();
            trend.add(new MonthlyTrendDTO(label, count));
        }
        stats.setMonthlyTrend(trend);

        return stats;
    }

    private List<AgentPerformanceDTO> calculatePerformance(List<User> agents) {
        List<AgentPerformanceDTO> performance = new ArrayList<>();
        for (User agent : agents) {
            List<Lead> agentLeads = leadRepository.findByAssignedAgent(agent);
            performance.add(new AgentPerformanceDTO(
                    agent.getId(),
                    agent.getName(),
                    (long) agentLeads.size(),
                    agentLeads.stream().filter(l -> l.getStatus() == LeadStatus.BOOKING).count()
            ));
        }
        return performance;
    }
}
