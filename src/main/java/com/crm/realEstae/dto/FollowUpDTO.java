package com.crm.realEstae.dto;

import com.crm.realEstae.entity.enums.FollowUpStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class FollowUpDTO {
    private UUID id;
    private UUID leadId;
    private String leadName;
    private LocalDateTime scheduledTime;
    private String notes;
    private FollowUpStatus status;
    private LocalDateTime reminderTime;
}
