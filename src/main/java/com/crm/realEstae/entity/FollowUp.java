package com.crm.realEstae.entity;

import com.crm.realEstae.entity.enums.FollowUpStatus;
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
@Table(name = "follow_ups")
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "lead_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Lead lead;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    private FollowUpStatus status;

    private LocalDateTime reminderTime;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = FollowUpStatus.PENDING;
        }
    }
}
