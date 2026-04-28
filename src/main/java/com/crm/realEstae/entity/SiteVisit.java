package com.crm.realEstae.entity;

import com.crm.realEstae.entity.enums.VisitStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "site_visits")
public class SiteVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false)
    private LocalDateTime visitTime;

    private String location;

    @Enumerated(EnumType.STRING)
    private VisitStatus status;

    @Column(length = 1000)
    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = VisitStatus.SCHEDULED;
        }
    }
}
