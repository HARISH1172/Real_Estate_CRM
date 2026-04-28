package com.crm.realEstae.repository;

import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    List<Lead> findByAssignedAgent(User agent);
    long countByStatus(com.crm.realEstae.entity.enums.LeadStatus status);

    List<Lead> findByCreatedBy(User user);
}
