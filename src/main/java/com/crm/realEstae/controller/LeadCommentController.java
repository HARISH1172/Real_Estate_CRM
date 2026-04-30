package com.crm.realEstae.controller;

import com.crm.realEstae.dto.LeadCommentDTO;
import com.crm.realEstae.service.LeadCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class LeadCommentController {

    private final LeadCommentService commentService;

    @PostMapping("/{leadId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public LeadCommentDTO addComment(@PathVariable UUID leadId, @RequestBody String content) {
        return commentService.addComment(leadId, content);
    }

    @GetMapping("/{leadId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    public List<LeadCommentDTO> getComments(@PathVariable UUID leadId) {
        return commentService.getCommentsByLead(leadId);
    }
}
