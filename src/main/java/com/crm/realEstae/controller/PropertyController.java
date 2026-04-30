package com.crm.realEstae.controller;

import com.crm.realEstae.dto.PropertyDTO;
import com.crm.realEstae.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PropertyDTO createProperty(@RequestBody PropertyDTO dto) {
        return propertyService.createProperty(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public List<PropertyDTO> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public List<PropertyDTO> getMyProperties(Principal principal) {
        return propertyService.getPropertiesByManager(principal.getName());
    }

    @GetMapping("/agent")
    @PreAuthorize("hasRole('AGENT')")
    public List<PropertyDTO> getAgentProperties(Principal principal) {
        return propertyService.getPropertiesByAgent(principal.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public PropertyDTO updateProperty(@PathVariable UUID id, @RequestBody PropertyDTO dto) {
        return propertyService.updateProperty(id, dto);
    }

    @PatchMapping("/{id}/assign-manager")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void assignToManager(@PathVariable UUID id, @RequestParam(required = false) String managerEmail) {
        propertyService.assignToManager(id, managerEmail);
    }

    @PatchMapping("/{id}/assign-agent")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void assignToAgent(@PathVariable UUID id, @RequestParam(required = false) String agentEmail) {
        propertyService.assignToAgent(id, agentEmail);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProperty(@PathVariable UUID id) {
        propertyService.deleteProperty(id);
    }
}
