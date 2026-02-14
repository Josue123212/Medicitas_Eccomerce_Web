package com.farmacia.logistics.adapters.in.web;

import com.farmacia.logistics.adapters.out.persistence.MovementRepository;
import com.farmacia.logistics.config.AppProperties;
import com.farmacia.logistics.domain.Movement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/movements")
public class MovementController {
    private final MovementRepository repo;
    private final AppProperties props;
    public MovementController(MovementRepository repo, AppProperties props) { this.repo = repo; this.props = props; }
    @PostMapping("/entry")
    public ResponseEntity<Map<String, Object>> entry(@RequestHeader(value = "X-Service-Key", required = false) String key,
                                                     @RequestBody Map<String, Object> body) {
        if (props.getServiceKey() != null && !props.getServiceKey().isEmpty() && (key == null || !key.equals(props.getServiceKey()))) {
            return ResponseEntity.status(403).body(Map.of("ok", false));
        }
        Movement m = new Movement();
        m.setType("entry");
        m.setProductId(Long.valueOf(String.valueOf(body.get("productId"))));
        m.setQuantity(Integer.valueOf(String.valueOf(body.get("qty"))));
        m.setCreatedAt(OffsetDateTime.now());
        repo.save(m);
        return ResponseEntity.ok(Map.of("ok", true));
    }
    @PostMapping("/exit")
    public ResponseEntity<Map<String, Object>> exit(@RequestHeader(value = "X-Service-Key", required = false) String key,
                                                    @RequestBody Map<String, Object> body) {
        if (props.getServiceKey() != null && !props.getServiceKey().isEmpty() && (key == null || !key.equals(props.getServiceKey()))) {
            return ResponseEntity.status(403).body(Map.of("ok", false));
        }
        Movement m = new Movement();
        m.setType("exit");
        m.setProductId(Long.valueOf(String.valueOf(body.get("productId"))));
        m.setQuantity(Integer.valueOf(String.valueOf(body.get("qty"))));
        m.setCreatedAt(OffsetDateTime.now());
        repo.save(m);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
