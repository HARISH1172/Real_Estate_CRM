package com.crm.realEstae.repository;

import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, java.util.UUID> {
    java.util.Optional<User> findById(java.util.UUID id);
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    java.util.List<User> findByRole(Role role);
    java.util.List<User> findByRoleAndApproved(Role role, boolean approved);
    long countByRole(Role role);
    java.util.List<User> findByAssignedManager(User manager);


}
