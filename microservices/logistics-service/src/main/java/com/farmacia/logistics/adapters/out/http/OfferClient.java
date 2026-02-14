package com.farmacia.logistics.adapters.out.http;

import com.farmacia.logistics.config.AppProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class OfferClient {
    private final RestTemplate restTemplate;
    private final AppProperties props;
    public OfferClient(RestTemplate restTemplate, AppProperties props) {
        this.restTemplate = restTemplate;
        this.props = props;
    }
    public Map<String, Object> activate(Long productId, Integer discountPct) {
        String url = props.getBackendUrl() + "/admin/offers/activate";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Service-Key", props.getServiceKey());
        Map<String, Object> body = Map.of("productId", productId, "discountPct", discountPct);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        Map resp = restTemplate.postForObject(url, req, Map.class);
        return resp == null ? Map.of("ok", false) : resp;
    }
}
