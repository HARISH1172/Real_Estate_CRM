package com.crm.realEstae.dto;

import com.crm.realEstae.entity.Address;
import com.crm.realEstae.entity.enums.Role;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Address address;
    private String assignedCity;
    private boolean approved;
    private String status; // PENDING or APPROVED
    private String managerEmail;
    private String managerName;
    private LocalDateTime createdAt;
    private long agentCount;
    private long leadCount;
}
