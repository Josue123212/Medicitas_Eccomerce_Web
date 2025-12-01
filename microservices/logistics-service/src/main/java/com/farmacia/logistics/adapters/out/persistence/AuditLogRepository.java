package com.farmacia.logistics.adapters.out.persistence;

import com.farmacia.logistics.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {}

