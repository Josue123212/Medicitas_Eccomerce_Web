package com.farmacia.logistics.adapters.in.web;

import com.farmacia.logistics.adapters.out.persistence.AuditActionRepository;
import com.farmacia.logistics.adapters.out.persistence.AuditRepository;
import com.farmacia.logistics.adapters.out.persistence.MovementRepository;
import com.farmacia.logistics.adapters.out.http.AdminInventoryClient;
import com.farmacia.logistics.config.AppProperties;
import com.farmacia.logistics.domain.AuditAction;
import com.farmacia.logistics.domain.Audit;
import com.farmacia.logistics.domain.Movement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/audits")
public class AuditController {
    private final AuditRepository repo;
    private final AuditActionRepository actionRepo;
    private final MovementRepository movementRepo;
    private final AppProperties props;
    private final AdminInventoryClient adminInventoryClient;
    public AuditController(AuditRepository repo, AuditActionRepository actionRepo, MovementRepository movementRepo, AdminInventoryClient adminInventoryClient, AppProperties props) {
        this.repo = repo; this.actionRepo = actionRepo; this.movementRepo = movementRepo; this.adminInventoryClient = adminInventoryClient; this.props = props; }
    @GetMapping
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(actionRepo.findAll());
    }
    @GetMapping("/summary")
    public ResponseEntity<?> summary(@RequestParam("productId") Long productId) {
        long blocks = movementRepo.countByProductIdAndType(productId, "block");
        long releases = movementRepo.countByProductIdAndType(productId, "release");
        java.util.HashMap<String, Object> res = new java.util.HashMap<>();
        res.put("product_id", productId);
        res.put("blocked", blocks);
        res.put("released", releases);
        res.put("blocked_total", blocks - releases);
        return ResponseEntity.ok(res);
    }
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> create(@RequestHeader(value = "X-Service-Key", required = false) String key,
                                                      @RequestBody Map<String, Object> body) {
        if (props.getServiceKey() != null && !props.getServiceKey().isEmpty() && (key == null || !key.equals(props.getServiceKey()))) {
            return ResponseEntity.status(403).body(Map.of("ok", false));
        }
        Audit a = new Audit();
        a.setSubject(String.valueOf(body.get("subject")));
        a.setResult(String.valueOf(body.get("result")));
        a.setCreatedAt(OffsetDateTime.now());
        repo.save(a);
        return ResponseEntity.ok(Map.of("ok", true));
    }
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBase(@RequestBody Map<String, Object> body) {
        Long productId = body.get("product_id") == null ? null : Long.valueOf(String.valueOf(body.get("product_id")));
        Integer qty = body.get("quantity") == null ? 0 : Integer.valueOf(String.valueOf(body.get("quantity")));
        String action = String.valueOf(body.getOrDefault("action", "block"));
        String reason = body.get("reason") == null ? null : String.valueOf(body.get("reason"));

        if (productId == null) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "product_id requerido"));
        }
        if (qty <= 0) {
            qty = 1;
        }

        AuditAction aa = new AuditAction();
        aa.setProductId(productId);
        aa.setQuantity(qty);
        aa.setAction(action);
        aa.setReason(reason);
        aa.setStatus("ok");
        aa.setCreatedAt(OffsetDateTime.now());
        actionRepo.save(aa);

        Movement m = new Movement();
        m.setType("block".equalsIgnoreCase(action) ? "block" : "release");
        m.setProductId(productId);
        m.setQuantity(qty == null ? 0 : qty);
        m.setCreatedAt(OffsetDateTime.now());
        movementRepo.save(m);

        Integer delta = "block".equalsIgnoreCase(action) ? qty : -qty;
        Map<String, Object> backendRes;
        try {
            backendRes = adminInventoryClient.agentUpdate(productId, delta, null, null, null);
        } catch (Exception e) {
            java.util.HashMap<String, Object> err = new java.util.HashMap<>();
            err.put("ok", false);
            err.put("error", String.valueOf(e.getMessage()));
            backendRes = err;
        }

        java.util.HashMap<String, Object> res = new java.util.HashMap<>();
        res.put("ok", true);
        res.put("id", aa.getId());
        res.put("backend_update", backendRes);
        return ResponseEntity.ok(res);
    }
}
