package com.crm.realEstae.service;

import com.crm.realEstae.dto.SiteVisitDTO;
import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.SiteVisit;
import com.crm.realEstae.repository.LeadRepository;
import com.crm.realEstae.repository.SiteVisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteVisitService {

    private final SiteVisitRepository siteVisitRepository;
    private final LeadRepository leadRepository;

    public SiteVisitDTO scheduleVisit(SiteVisitDTO dto) {
        Lead lead = leadRepository.findById(dto.getLeadId())
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        SiteVisit visit = new SiteVisit();
        visit.setLead(lead);
        visit.setVisitTime(dto.getVisitTime());
        visit.setLocation(dto.getLocation());
        visit.setNotes(dto.getNotes());
        visit.setStatus(dto.getStatus());

        SiteVisit saved = siteVisitRepository.save(visit);
        return convertToDTO(saved);
    }

    public List<SiteVisitDTO> getVisitsByLead(UUID leadId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        return siteVisitRepository.findByLead(lead).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SiteVisitDTO updateVisitStatus(UUID id, com.crm.realEstae.entity.enums.VisitStatus status) {
        SiteVisit visit = siteVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site visit not found"));
        visit.setStatus(status);
        SiteVisit updated = siteVisitRepository.save(visit);
        return convertToDTO(updated);
    }

    private SiteVisitDTO convertToDTO(SiteVisit visit) {
        SiteVisitDTO dto = new SiteVisitDTO();
        dto.setId(visit.getId());
        dto.setLeadId(visit.getLead().getId());
        dto.setLeadName(visit.getLead().getName());
        dto.setVisitTime(visit.getVisitTime());
        dto.setLocation(visit.getLocation());
        dto.setNotes(visit.getNotes());
        dto.setStatus(visit.getStatus());
        return dto;
    }
}
