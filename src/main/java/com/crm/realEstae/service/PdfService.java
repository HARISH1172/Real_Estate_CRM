package com.crm.realEstae.service;

import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.SiteVisit;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfService {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generateLeadReport(List<Lead> leads) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph header = new Paragraph("Lead Report", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 4, 3, 3, 4});

            String[] headers = {"Name", "Email", "Phone", "Status", "Agent"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            for (Lead lead : leads) {
                table.addCell(lead.getName());
                table.addCell(lead.getEmail() != null ? lead.getEmail() : "N/A");
                table.addCell(lead.getPhone());
                table.addCell(lead.getStatus().name());
                table.addCell(lead.getAssignedAgent() != null ? lead.getAssignedAgent().getName() : "Unassigned");
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generateSiteVisitReport(List<SiteVisit> visits) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph header = new Paragraph("Site Visit Report", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);

            String[] headers = {"Lead Name", "Visit Time", "Location", "Status", "Notes"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            for (SiteVisit visit : visits) {
                table.addCell(visit.getLead().getName());
                table.addCell(visit.getVisitTime().format(formatter));
                table.addCell(visit.getLocation() != null ? visit.getLocation() : "N/A");
                table.addCell(visit.getStatus().name());
                table.addCell(visit.getNotes() != null ? visit.getNotes() : "");
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generateBrochure(String projectName, String description, List<String> highlights) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Paragraph title = new Paragraph(projectName, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            Font descFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Paragraph desc = new Paragraph(description, descFont);
            document.add(desc);
            document.add(Chunk.NEWLINE);

            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            document.add(new Paragraph("Highlights:", subHeaderFont));
            
            com.lowagie.text.List list = new com.lowagie.text.List(true, 15);
            for (String h : highlights) {
                list.add(new ListItem(h));
            }
            document.add(list);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}
