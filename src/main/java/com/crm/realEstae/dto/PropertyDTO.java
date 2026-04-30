package com.crm.realEstae.dto;

import com.crm.realEstae.entity.Address;
import com.crm.realEstae.entity.enums.PropertyType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PropertyDTO {
    private UUID id;
    private String name;
    private String description;
    private Double price;
    private PropertyType type;
    private Address address;
    private UUID assignedManagerId;
    private String assignedManagerName;
    private UUID assignedAgentId;
    private String assignedAgentName;
    private LocalDateTime createdAt;
}
