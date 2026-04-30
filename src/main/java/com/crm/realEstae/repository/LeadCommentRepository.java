package com.crm.realEstae.repository;

import com.crm.realEstae.entity.LeadComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LeadCommentRepository extends JpaRepository<LeadComment, UUID> {
    List<LeadComment> findByLeadIdOrderByCreatedAtDesc(UUID leadId);
}
