package com.crm.realEstae.controller;

import com.crm.realEstae.dto.FollowUpDTO;
import com.crm.realEstae.entity.enums.FollowUpStatus;
import com.crm.realEstae.service.FollowUpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/follow-ups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173/")
public class FollowUpController {

    private final FollowUpService followUpService;

    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT')")
    public FollowUpDTO scheduleFollowUp(@RequestBody FollowUpDTO dto) {
        return followUpService.scheduleFollowUp(dto);
    }

    @GetMapping("/lead/{leadId}")
    @PreAuthorize("hasAnyRole('AGENT', 'MANAGER', 'ADMIN')")
    public List<FollowUpDTO> getFollowUpsByLead(@PathVariable UUID leadId) {
        return followUpService.getFollowUpsByLead(leadId);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT')")
    public FollowUpDTO updateStatus(@PathVariable UUID id, @RequestParam FollowUpStatus status) {
        return followUpService.updateFollowUpStatus(id, status);
    }
}
