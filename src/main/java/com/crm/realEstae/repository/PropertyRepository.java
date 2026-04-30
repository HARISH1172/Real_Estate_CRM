package com.crm.realEstae.repository;

import com.crm.realEstae.entity.Property;
import com.crm.realEstae.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findByAssignedManager(User manager);
    List<Property> findByAssignedAgent(User agent);
    long countByAssignedManager(User manager);
    long countByAssignedAgent(User agent);
}
