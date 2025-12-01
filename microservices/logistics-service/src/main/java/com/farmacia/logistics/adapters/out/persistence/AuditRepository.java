package com.farmacia.logistics.adapters.out.persistence;

import com.farmacia.logistics.domain.Audit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRepository extends JpaRepository<Audit, Long> {
}
