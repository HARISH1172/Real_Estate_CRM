package com.crm.realEstae.dto;

import com.crm.realEstae.entity.enums.VisitStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SiteVisitDTO {
    private UUID id;
    private UUID leadId;
    private String leadName;
    private LocalDateTime visitTime;
    private String location;
    private VisitStatus status;
    private String notes;
}
