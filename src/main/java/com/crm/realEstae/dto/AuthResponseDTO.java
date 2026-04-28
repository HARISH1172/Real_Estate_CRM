package com.crm.realEstae.dto;

import com.crm.realEstae.entity.Address;
import com.crm.realEstae.entity.enums.Role;
import lombok.Data;

@Data
public class AuthResponseDTO {

    private String token;
    private Role role;
    private String name;
    private String email;
    private String phone;
    private Address address;


}
