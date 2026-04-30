package com.crm.realEstae.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LeadCommentDTO {
    private UUID id;
    private UUID leadId;
    private String authorName;
    private String authorEmail;
    private String content;
    private LocalDateTime createdAt;
}
