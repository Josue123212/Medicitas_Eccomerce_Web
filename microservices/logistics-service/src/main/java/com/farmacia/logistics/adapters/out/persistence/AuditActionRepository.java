package com.farmacia.logistics.adapters.out.persistence;

import com.farmacia.logistics.domain.AuditAction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditActionRepository extends JpaRepository<AuditAction, Long> {
}
