package com.crm.realEstae.entity;

import com.crm.realEstae.entity.enums.PropertyType;
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
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType type;

    @Embedded
    private Address address;

    @ManyToOne
    @JoinColumn(name = "assigned_manager_id", nullable = true)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User assignedManager;

    @ManyToOne
    @JoinColumn(name = "assigned_agent_id", nullable = true)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User assignedAgent;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
