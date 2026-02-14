package com.farmacia.logistics.adapters.out.http;

import com.farmacia.logistics.config.AppProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class InventoryReadClient {
    private final RestTemplate restTemplate;
    private final AppProperties props;
    public InventoryReadClient(RestTemplate restTemplate, AppProperties props) {
        this.restTemplate = restTemplate;
        this.props = props;
    }
    public Map<String, Object> summary(Long productId) {
        String url = props.getBackendUrl() + "/inventory/summary?productId=" + productId;
        Map resp = restTemplate.getForObject(url, Map.class);
        return resp == null ? Map.of("ok", false) : resp;
    }
}
