package com.farmacia.logistics.adapters.out.persistence;

import com.farmacia.logistics.domain.Movement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovementRepository extends JpaRepository<Movement, Long> {
    long countByProductIdAndType(Long productId, String type);
}
