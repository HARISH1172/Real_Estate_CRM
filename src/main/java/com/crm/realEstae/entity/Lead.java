package com.crm.realEstae.entity;

import com.crm.realEstae.entity.enums.LeadStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String email;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    private LeadStatus status;

    private String propertyType;



    @ManyToOne
    @JoinColumn(name = "assigned_agent_id", nullable = true)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User assignedAgent;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = true)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User createdBy;

    @Column(length = 1000)
    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = LeadStatus.NEW;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
