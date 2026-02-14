package com.farmacia.logistics.adapters.out.http;

import com.farmacia.logistics.config.AppProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class AdminInventoryClient {
    private final RestTemplate restTemplate;
    private final AppProperties props;
    public AdminInventoryClient(RestTemplate restTemplate, AppProperties props) {
        this.restTemplate = restTemplate;
        this.props = props;
    }
    public Map<String, Object> agentUpdate(Long productId, Integer delta, Integer stock, Integer min, String location) {
        StringBuilder u = new StringBuilder(props.getBackendUrl()).append("/ecommerce/admin/inventory/agent-update/");
        String sep = "?";
        if (productId != null) { u.append(sep).append("product_id=").append(productId); sep = "&"; }
        if (delta != null) { u.append(sep).append("delta=").append(delta); sep = "&"; }
        if (stock != null) { u.append(sep).append("stock=").append(stock); sep = "&"; }
        if (min != null) { u.append(sep).append("min=").append(min); sep = "&"; }
        if (location != null && !location.isBlank()) { u.append(sep).append("location=").append(location); }
        String url = u.toString();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (props.getServiceKey() != null && !props.getServiceKey().isEmpty()) {
            headers.set("X-Service-Key", props.getServiceKey());
        }
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("product_id", productId);
        body.put("product", productId);
        body.put("productId", productId);
        if (delta != null) {
            body.put("delta", delta);
            body.put("qty", delta);
            body.put("quantity", delta);
        }
        if (stock != null) body.put("stock", stock);
        if (min != null) body.put("min", min);
        if (location != null) body.put("location", location);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        try {
            Map resp = restTemplate.postForObject(url, req, Map.class);
            return resp == null ? Map.of("ok", false) : resp;
        } catch (Exception e) {
            return Map.of("ok", false, "error", String.valueOf(e));
        }
    }

    public Map<String, Object> agentUpdateDelta(Long productId, Integer delta, Integer stockDelta, Integer stock, Integer min, String location) {
        StringBuilder u = new StringBuilder(props.getBackendUrl()).append("/ecommerce/admin/inventory/agent-update/");
        String sep = "?";
        if (productId != null) { u.append(sep).append("product_id=").append(productId); sep = "&"; }
        if (delta != null) { u.append(sep).append("delta=").append(delta); sep = "&"; }
        if (stockDelta != null) { u.append(sep).append("stock_delta=").append(stockDelta); sep = "&"; }
        if (stock != null) { u.append(sep).append("stock=").append(stock); sep = "&"; }
        if (min != null) { u.append(sep).append("min=").append(min); sep = "&"; }
        if (location != null && !location.isBlank()) { u.append(sep).append("location=").append(location); }
        String url = u.toString();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (props.getServiceKey() != null && !props.getServiceKey().isEmpty()) {
            headers.set("X-Service-Key", props.getServiceKey());
        }
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("product_id", productId);
        body.put("product", productId);
        body.put("productId", productId);
        if (delta != null) {
            body.put("delta", delta);
            body.put("qty", delta);
            body.put("quantity", delta);
        }
        if (stockDelta != null) {
            body.put("stock_delta", stockDelta);
            body.put("stockChange", stockDelta);
            body.put("stockDelta", stockDelta);
        }
        if (stock != null) body.put("stock", stock);
        if (min != null) body.put("min", min);
        if (location != null) body.put("location", location);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        try {
            Map resp = restTemplate.postForObject(url, req, Map.class);
            return resp == null ? Map.of("ok", false) : resp;
        } catch (Exception e) {
            return Map.of("ok", false, "error", String.valueOf(e));
        }
    }
}
