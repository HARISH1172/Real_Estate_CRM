package com.crm.realEstae.repository;

import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.Property;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    List<Lead> findByAssignedAgent(User agent);

    long countByStatus(LeadStatus status);

    List<Lead> findByCreatedBy(User user);
    long countByAssignedAgent(User agent);

    @org.springframework.data.jpa.repository.Query("SELECT l.assignedAgent.id, COUNT(l) FROM Lead l WHERE l.assignedAgent IN :agents GROUP BY l.assignedAgent.id")
    List<Object[]> countLeadsByAgents(@org.springframework.data.repository.query.Param("agents") List<User> agents);

    @org.springframework.data.jpa.repository.Query("SELECT l.assignedAgent.id, COUNT(l) FROM Lead l WHERE l.assignedAgent IN :agents AND l.status = 'BOOKING' GROUP BY l.assignedAgent.id")
    List<Object[]> countBookingsByAgents(@org.springframework.data.repository.query.Param("agents") List<User> agents);
}
