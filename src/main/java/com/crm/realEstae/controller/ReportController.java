package com.crm.realEstae.controller;

import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.SiteVisit;
import com.crm.realEstae.repository.LeadRepository;
import com.crm.realEstae.repository.SiteVisitRepository;
import com.crm.realEstae.service.PdfService;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173/")
public class ReportController {

    private final PdfService pdfService;
    private final LeadRepository leadRepository;
    private final SiteVisitRepository siteVisitRepository;

    @GetMapping("/leads")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public byte[] getLeadReport(HttpServletResponse response) {
        List<Lead> leads = leadRepository.findAll();
        byte[] pdfContent = pdfService.generateLeadReport(leads);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=lead_report.pdf");

        return pdfContent;
    }

    @GetMapping("/site-visits")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public byte[] getSiteVisitReport(HttpServletResponse response) {
        List<SiteVisit> visits = siteVisitRepository.findAll();
        byte[] pdfContent = pdfService.generateSiteVisitReport(visits);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=site_visit_report.pdf");

        return pdfContent;
    }

    @GetMapping("/brochure")
    @PreAuthorize("permitAll()")
    public byte[] getBrochure(@RequestParam String projectName, HttpServletResponse response) {
        String description = "Experience luxury living at its finest in our state-of-the-art " + projectName + ". " +
                "Featuring modern amenities, lush green spaces, and premium finishes.";
        List<String> highlights = Arrays.asList(
                "Spacious 2 & 3 BHK Apartments",
                "Fully Equipped Clubhouse & Gym",
                "Swimming Pool & Kids Play Area",
                "24/7 Security & CCTV Surveillance",
                "Excellent Connectivity to Major Hubs"
        );

        byte[] pdfContent = pdfService.generateBrochure(projectName, description, highlights);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=" + projectName + "_brochure.pdf");

        return pdfContent;
    }
}
