package com.crm.realEstae.controller;

import com.crm.realEstae.dto.LeadDTO;
import com.crm.realEstae.entity.enums.LeadStatus;
import com.crm.realEstae.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173/")
public class LeadController {

    private final LeadService leadService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public LeadDTO createLead(@RequestBody LeadDTO dto) {
        return leadService.createLead(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public List<LeadDTO> getAllLeads() {
        return leadService.getAllLeads();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public LeadDTO getLeadById(@PathVariable UUID id) {
        return leadService.getLeadById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public LeadDTO updateLead(@PathVariable UUID id, @RequestBody LeadDTO dto) {
        return leadService.updateLead(id, dto);
    }

    @PatchMapping("/{id}/assign/{agentEmail}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void assignLead(@PathVariable UUID id, @PathVariable String agentEmail) {
        leadService.assignLead(id, agentEmail);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public void deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'AGENT')")
    public LeadDTO updateLeadStatus(@PathVariable UUID id, @RequestParam LeadStatus status) {
        return leadService.updateLeadStatus(id, status);
    }
}
