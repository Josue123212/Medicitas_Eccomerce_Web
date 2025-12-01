package com.farmacia.logistics.application;

import com.farmacia.logistics.adapters.out.persistence.ReservationRepository;
import com.farmacia.logistics.domain.Reservation;
import com.farmacia.logistics.domain.ReservationStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;

@Service
public class InventoryService {
    private final ReservationRepository reservationRepository;
    private final AuditService auditService;
    public InventoryService(ReservationRepository reservationRepository, AuditService auditService) {
        this.reservationRepository = reservationRepository;
        this.auditService = auditService;
    }
    public Reservation reserve(Long orderId, Long productId, Integer qty) {
        Reservation reservation = reservationRepository.findByOrderIdAndProductId(orderId, productId).orElseGet(Reservation::new);
        reservation.setOrderId(orderId);
        reservation.setProductId(productId);
        reservation.setQuantity(qty);
        reservation.setStatus(ReservationStatus.CREATED);
        reservation.setCreatedAt(reservation.getCreatedAt() == null ? OffsetDateTime.now() : reservation.getCreatedAt());
        reservation.setUpdatedAt(OffsetDateTime.now());
        Reservation saved = reservationRepository.save(reservation);
        auditService.log("reserve", "order=" + orderId + ", product=" + productId + ", qty=" + qty);
        return saved;
    }
    public Reservation confirm(Long orderId, Long productId) {
        Reservation reservation = reservationRepository.findByOrderIdAndProductId(orderId, productId).orElseThrow();
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setUpdatedAt(OffsetDateTime.now());
        Reservation saved = reservationRepository.save(reservation);
        auditService.log("confirm", "order=" + orderId + ", product=" + productId);
        return saved;
    }
    public Reservation cancel(Long orderId, Long productId) {
        Reservation reservation = reservationRepository.findByOrderIdAndProductId(orderId, productId).orElseThrow();
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setUpdatedAt(OffsetDateTime.now());
        Reservation saved = reservationRepository.save(reservation);
        auditService.log("cancel", "order=" + orderId + ", product=" + productId);
        return saved;
    }
    public Map<String, Object> handleEvent(Map<String, Object> payload) {
        String type = String.valueOf(payload.getOrDefault("type", "unknown"));
        Map<String, Object> data = (Map<String, Object>) payload.getOrDefault("data", Map.of());
        Long orderId = data.get("orderId") == null ? null : Long.valueOf(String.valueOf(data.get("orderId")));
        Long productId = data.get("productId") == null ? null : Long.valueOf(String.valueOf(data.get("productId")));
        Integer qty = data.get("qty") == null ? null : Integer.valueOf(String.valueOf(data.get("qty")));
        if ("order.created".equals(type) && orderId != null && productId != null && qty != null) reserve(orderId, productId, qty);
        if ("order.confirmed".equals(type) && orderId != null && productId != null) confirm(orderId, productId);
        if ("order.cancelled".equals(type) && orderId != null && productId != null) cancel(orderId, productId);
        return Map.of("ok", true, "event", type);
    }
}
