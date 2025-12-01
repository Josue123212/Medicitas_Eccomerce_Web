package com.farmacia.logistics.adapters.in.web;

import com.farmacia.logistics.application.InventoryService;
import com.farmacia.logistics.adapters.out.http.AdminInventoryClient;
import com.farmacia.logistics.config.AppProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/webhooks")
public class OrderWebhookController {
    private final InventoryService inventoryService;
    private final AdminInventoryClient adminInventoryClient;
    private final AppProperties props;
    public OrderWebhookController(InventoryService inventoryService, AdminInventoryClient adminInventoryClient, AppProperties props) { this.inventoryService = inventoryService; this.adminInventoryClient = adminInventoryClient; this.props = props; }
    @PostMapping("/order")
    public ResponseEntity<Map<String, Object>> handle(@RequestHeader(value = "X-Service-Key", required = false) String key,
                                                      @RequestBody Map<String, Object> payload) {
        if (props.getServiceKey() != null && !props.getServiceKey().isEmpty() && (key == null || !key.equals(props.getServiceKey()))) {
            return ResponseEntity.status(403).body(Map.of("ok", false));
        }
        try {
            String type = String.valueOf(payload.getOrDefault("type", "unknown"));
            Object itemsObj = payload.get("items");
            Object orderIdObj = payload.get("order_id");
            Long orderId = orderIdObj == null ? null : Long.valueOf(String.valueOf(orderIdObj));
            if (itemsObj instanceof List && orderId != null) {
                List items = (List) itemsObj;
                boolean allOk = true;
                for (Object it : items) {
                    if (it instanceof Map) {
                        Map m = (Map) it;
                        Object pidObj = m.get("product_id");
                        Object qtyObj = m.get("quantity");
                        Long productId = pidObj == null ? null : Long.valueOf(String.valueOf(pidObj));
                        Integer qty = qtyObj == null ? null : Integer.valueOf(String.valueOf(qtyObj));
                        if ("created".equals(type) && productId != null && qty != null) {
                            var res = inventoryService.reserve(orderId, productId, qty);
                            try {
                                Map<String, Object> resp = adminInventoryClient.agentUpdateDelta(productId, res.getQuantity(), null, null, null, null);
                                if (resp == null || (!resp.containsKey("product") && !resp.containsKey("reserved_stock") && !resp.containsKey("stock"))) allOk = false;
                            } catch (Exception e) { allOk = false; }
                        }
                        if ("confirmed".equals(type) && productId != null) {
                            var res = inventoryService.confirm(orderId, productId);
                            Integer q = res.getQuantity();
                            if (q != null) {
                                try {
                                    Map<String, Object> resp = adminInventoryClient.agentUpdateDelta(productId, -q, -q, null, null, null);
                                    if (resp == null || (!resp.containsKey("product") && !resp.containsKey("reserved_stock") && !resp.containsKey("stock"))) allOk = false;
                                } catch (Exception e) { allOk = false; }
                            }
                        }
                        if ("cancelled".equals(type) && productId != null) {
                            var res = inventoryService.cancel(orderId, productId);
                            Integer q = res.getQuantity();
                            if (q != null) {
                                try {
                                    Map<String, Object> resp = adminInventoryClient.agentUpdateDelta(productId, -q, null, null, null, null);
                                    if (resp == null || (!resp.containsKey("product") && !resp.containsKey("reserved_stock") && !resp.containsKey("stock"))) allOk = false;
                                } catch (Exception e) { allOk = false; }
                            }
                        }
                    }
                }
                return ResponseEntity.ok(Map.of("ok", allOk, "event", type));
            }
        } catch (Exception ignored) {}
        Map<String, Object> res = inventoryService.handleEvent(payload);
        return ResponseEntity.ok(res);
    }
}
