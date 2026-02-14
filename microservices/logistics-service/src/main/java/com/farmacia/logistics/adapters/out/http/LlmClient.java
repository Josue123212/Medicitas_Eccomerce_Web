package com.farmacia.logistics.adapters.out.http;

import com.farmacia.logistics.config.AppProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LlmClient {
    private final RestTemplate restTemplate;
    private final AppProperties props;
    public LlmClient(RestTemplate restTemplate, AppProperties props) {
        this.restTemplate = restTemplate;
        this.props = props;
    }
    public Map<String, Object> chat(String prompt) {
        String url = props.getLlmBaseUrl() + "/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String apiKey = props.getLlmApiKey();
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }
        String model = props.getLlmModel();
        if (model == null || model.isBlank()) model = firstModelId();
        if (model == null) return Map.of("ok", false, "error", "no_model_available");
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", new Object[]{ Map.of("role", "user", "content", prompt) }
        );
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        try {
            Map resp = restTemplate.postForObject(url, req, Map.class);
            return resp == null ? Map.of("ok", false) : resp;
        } catch (Exception e) {
            String fallback = firstModelId();
            if (fallback != null && !fallback.equals(model)) {
                Map<String, Object> body2 = Map.of(
                        "model", fallback,
                        "messages", new Object[]{ Map.of("role", "user", "content", prompt) }
                );
                HttpEntity<Map<String, Object>> req2 = new HttpEntity<>(body2, headers);
                try {
                    Map resp2 = restTemplate.postForObject(url, req2, Map.class);
                    return resp2 == null ? Map.of("ok", false) : resp2;
                } catch (Exception e2) {
                    return Map.of("ok", false, "error", String.valueOf(e2.getMessage()));
                }
            }
            return Map.of("ok", false, "error", String.valueOf(e.getMessage()));
        }
    }
    public String chatContent(String prompt) {
        Map<String, Object> resp = chat(prompt);
        try {
            Object choices = resp.get("choices");
            if (choices instanceof java.util.List) {
                Object first = ((java.util.List<?>) choices).isEmpty() ? null : ((java.util.List<?>) choices).get(0);
                if (first instanceof Map) {
                    Object msg = ((Map<?, ?>) first).get("message");
                    if (msg instanceof Map) {
                        Object content = ((Map<?, ?>) msg).get("content");
                        String c = content == null ? null : String.valueOf(content);
                        if (c == null) return null;
                        // Intento extraer el primer bloque JSON si el modelo añadió texto alrededor
                        Matcher m = Pattern.compile("(?s)\\{.*?\\}").matcher(c);
                        if (m.find()) return m.group();
                        return c;
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
    public String firstModelId() {
        try {
            String url = props.getLlmBaseUrl() + "/v1/models";
            Map resp = restTemplate.getForObject(url, Map.class);
            Object data = resp == null ? null : resp.get("data");
            if (data instanceof java.util.List && !((java.util.List<?>) data).isEmpty()) {
                Object first = ((java.util.List<?>) data).get(0);
                if (first instanceof Map) {
                    Object id = ((Map<?, ?>) first).get("id");
                    return id == null ? null : String.valueOf(id);
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
}
