package com.crm.realEstae.service;
// Trigger recompile

import com.crm.realEstae.dto.FollowUpDTO;
import com.crm.realEstae.entity.FollowUp;
import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.repository.FollowUpRepository;
import com.crm.realEstae.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final LeadRepository leadRepository;

    public FollowUpDTO scheduleFollowUp(FollowUpDTO dto) {
        Lead lead = leadRepository.findById(dto.getLeadId())
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        FollowUp followUp = new FollowUp();
        followUp.setLead(lead);
        followUp.setScheduledTime(dto.getScheduledTime());
        followUp.setNotes(dto.getNotes());
        followUp.setStatus(dto.getStatus());
        followUp.setReminderTime(dto.getReminderTime());

        FollowUp saved = followUpRepository.save(followUp);
        return convertToDTO(saved);
    }

    public List<FollowUpDTO> getFollowUpsByLead(UUID leadId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        return followUpRepository.findByLead(lead).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FollowUpDTO updateFollowUpStatus(UUID id, com.crm.realEstae.entity.enums.FollowUpStatus status) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Follow-up not found"));
        followUp.setStatus(status);
        FollowUp updated = followUpRepository.save(followUp);
        return convertToDTO(updated);
    }

    private FollowUpDTO convertToDTO(FollowUp followUp) {
        FollowUpDTO dto = new FollowUpDTO();
        dto.setId(followUp.getId());
        dto.setLeadId(followUp.getLead().getId());
        dto.setLeadName(followUp.getLead().getName());
        dto.setScheduledTime(followUp.getScheduledTime());
        dto.setNotes(followUp.getNotes());
        dto.setStatus(followUp.getStatus());
        dto.setReminderTime(followUp.getReminderTime());
        return dto;
    }
}
