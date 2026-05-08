package com.crm.realEstae.dto;

import com.crm.realEstae.entity.enums.LeadStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LeadDTO {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private LeadStatus status;
    private String propertyType;

    private String assignedAgentEmail;
    private String agentName;
    private String createdByEmail;
    private String createdByName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
