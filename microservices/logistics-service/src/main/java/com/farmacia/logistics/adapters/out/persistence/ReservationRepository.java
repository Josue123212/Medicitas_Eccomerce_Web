package com.farmacia.logistics.adapters.out.persistence;

import com.farmacia.logistics.domain.Reservation;
import com.farmacia.logistics.domain.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByOrderIdAndProductId(Long orderId, Long productId);
    long countByProductIdAndStatus(Long productId, ReservationStatus status);
}
