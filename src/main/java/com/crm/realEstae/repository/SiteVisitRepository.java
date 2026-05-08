package com.crm.realEstae.repository;

import com.crm.realEstae.entity.Lead;
import com.crm.realEstae.entity.Property;
import com.crm.realEstae.entity.SiteVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SiteVisitRepository extends JpaRepository<SiteVisit, UUID> {
    List<SiteVisit> findByLead(Lead lead);
    void deleteByLead(Lead lead);
    void deleteByProperty(Property property);
}
