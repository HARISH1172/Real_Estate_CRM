package com.crm.realEstae.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgentPerformanceDTO {
    private UUID agentId;
    private String agentName;
    private long totalLeads;
    private long totalBookings;
}
