package com.crm.realEstae.service;

import com.crm.realEstae.dto.LeadCommentDTO;
import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.LeadComment;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.repository.LeadCommentRepository;
import com.crm.realEstae.repository.LeadRepository;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadCommentService {

    private final LeadCommentRepository commentRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    public LeadCommentDTO addComment(UUID leadId, String content) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeadComment comment = new LeadComment();
        comment.setLead(lead);
        comment.setAuthor(currentUser);
        comment.setContent(content);

        LeadComment saved = commentRepository.save(comment);
        return mapToDTO(saved);
    }

    public List<LeadCommentDTO> getCommentsByLead(UUID leadId) {
        return commentRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private LeadCommentDTO mapToDTO(LeadComment comment) {
        LeadCommentDTO dto = new LeadCommentDTO();
        dto.setId(comment.getId());
        dto.setLeadId(comment.getLead().getId());
        dto.setAuthorName(comment.getAuthor().getName());
        dto.setAuthorEmail(comment.getAuthor().getEmail());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }
}
