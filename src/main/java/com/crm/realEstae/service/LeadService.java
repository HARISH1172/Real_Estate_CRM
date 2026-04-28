package com.crm.realEstae.service;

import com.crm.realEstae.dto.LeadDTO;
import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.LeadStatus;
import com.crm.realEstae.repository.LeadRepository;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    public LeadDTO createLead(LeadDTO dto) {
        Lead lead = new Lead();
        lead.setName(dto.getName());
        lead.setEmail(dto.getEmail());
        lead.setPhone(dto.getPhone());
        lead.setPropertyType(dto.getPropertyType());
        lead.setNotes(dto.getNotes());
        
        if (dto.getAssignedAgentEmail() != null) {
            User agent = userRepository.findByEmail(dto.getAssignedAgentEmail())
                    .orElseThrow(() -> new RuntimeException("Agent not found"));
            lead.setAssignedAgent(agent);
        }

        User currentUser = getCurrentUser();
        lead.setCreatedBy(currentUser);

        Lead saved = leadRepository.save(lead);
        return convertToDTO(saved);
    }

    public LeadDTO updateLead(UUID id, LeadDTO dto) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        
        User currentUser = getCurrentUser();
        if (!lead.getCreatedBy().getEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("You can only update leads created by you");
        }

        lead.setName(dto.getName());
        lead.setEmail(dto.getEmail());
        lead.setPhone(dto.getPhone());
        lead.setStatus(dto.getStatus());
        lead.setPropertyType(dto.getPropertyType());
        lead.setNotes(dto.getNotes());

        if (dto.getAssignedAgentEmail() != null) {
            User agent = userRepository.findByEmail(dto.getAssignedAgentEmail())
                    .orElseThrow(() -> new RuntimeException("Agent not found"));
            lead.setAssignedAgent(agent);
        }

        Lead updated = leadRepository.save(lead);
        return convertToDTO(updated);
    }

    public List<LeadDTO> getAllLeads() {
        return leadRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public LeadDTO getLeadById(UUID id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        return convertToDTO(lead);
    }

    public void assignLead(UUID leadId, String agentEmail) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        lead.setAssignedAgent(agent);
        leadRepository.save(lead);
    }

    private LeadDTO convertToDTO(Lead lead) {
        LeadDTO dto = new LeadDTO();
        dto.setId(lead.getId());
        dto.setName(lead.getName());
        dto.setEmail(lead.getEmail());
        dto.setPhone(lead.getPhone());
        dto.setStatus(lead.getStatus());
        dto.setPropertyType(lead.getPropertyType());
        dto.setNotes(lead.getNotes());
        dto.setCreatedAt(lead.getCreatedAt());
        dto.setUpdatedAt(lead.getUpdatedAt());
        
        if (lead.getAssignedAgent() != null) {
            dto.setAssignedAgentEmail(lead.getAssignedAgent().getEmail());
            dto.setAgentName(lead.getAssignedAgent().getName());
        }

        if (lead.getCreatedBy() != null) {
            dto.setCreatedByEmail(lead.getCreatedBy().getEmail());
        }
        
        return dto;
    }

    public void deleteLead(UUID id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        
        User currentUser = getCurrentUser();
        if (!lead.getCreatedBy().getEmail().equals(currentUser.getEmail())) {
            throw new RuntimeException("You can only delete leads created by you");
        }
        
        leadRepository.delete(lead);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    public LeadDTO updateLeadStatus(UUID id, LeadStatus status) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        User currentUser = getCurrentUser();
        boolean isCreator = lead.getCreatedBy().getEmail().equals(currentUser.getEmail());
        boolean isAssignedAgent = lead.getAssignedAgent() != null && lead.getAssignedAgent().getEmail().equals(currentUser.getEmail());

        if (!isCreator && !isAssignedAgent) {
            throw new RuntimeException("You are not authorized to update this lead's status");
        }

        lead.setStatus(status);
        Lead updated = leadRepository.save(lead);
        return convertToDTO(updated);
    }
}
