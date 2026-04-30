package com.crm.realEstae.repository;
// Trigger recompile

import com.crm.realEstae.entity.FollowUp;
import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.FollowUpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, UUID> {
    List<FollowUp> findByLead(Lead lead);
    long countByStatus(FollowUpStatus status);
    long countByLeadAssignedAgent(User user);
}
