package com.crm.realEstae.controller;

import com.crm.realEstae.dto.SiteVisitDTO;
import com.crm.realEstae.entity.enums.VisitStatus;
import com.crm.realEstae.service.SiteVisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/site-visits")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173/")
public class SiteVisitController {

    private final SiteVisitService siteVisitService;

    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT')")
    public SiteVisitDTO scheduleVisit(@RequestBody SiteVisitDTO dto) {
        return siteVisitService.scheduleVisit(dto);
    }

    @GetMapping("/lead/{leadId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public List<SiteVisitDTO> getVisitsByLead(@PathVariable UUID leadId) {
        return siteVisitService.getVisitsByLead(leadId);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT')")
    public SiteVisitDTO updateStatus(@PathVariable UUID id, @RequestParam VisitStatus status) {
        return siteVisitService.updateVisitStatus(id, status);
    }
}
