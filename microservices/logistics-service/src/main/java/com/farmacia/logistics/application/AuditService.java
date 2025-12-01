package com.farmacia.logistics.application;

import com.farmacia.logistics.adapters.out.persistence.AuditLogRepository;
import com.farmacia.logistics.domain.AuditLog;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    public void log(String action, String details) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setDetails(details);
        log.setCreatedAt(OffsetDateTime.now());
        auditLogRepository.save(log);
    }
}
