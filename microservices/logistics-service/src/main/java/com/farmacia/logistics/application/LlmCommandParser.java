package com.farmacia.logistics.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class LlmCommandParser {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    public static Map<String, Object> parse(String content) {
        HashMap<String, Object> res = new HashMap<>();
        res.put("ok", false);
        if (content == null || content.trim().isEmpty()) return res;
        try {
            JsonNode node = MAPPER.readTree(content);
            String action = node.path("action").asText(null);
            Long productId = node.path("product_id").isNumber() ? node.path("product_id").asLong() : null;
            Integer quantity = node.path("quantity").isNumber() ? node.path("quantity").asInt() : null;
            Integer delta = node.path("delta").isNumber() ? node.path("delta").asInt() : null;
            Integer stock = node.path("stock").isNumber() ? node.path("stock").asInt() : null;
            Integer min = node.path("min").isNumber() ? node.path("min").asInt() : null;
            // Params nested
            JsonNode params = node.path("params");
            if (params != null && !params.isMissingNode()) {
                if (productId == null && params.path("product_id").isNumber()) productId = params.path("product_id").asLong();
                if (quantity == null && params.path("quantity").isNumber()) quantity = params.path("quantity").asInt();
                if (delta == null && params.path("delta").isNumber()) delta = params.path("delta").asInt();
                if (stock == null && params.path("stock").isNumber()) stock = params.path("stock").asInt();
                if (min == null && params.path("min").isNumber()) min = params.path("min").asInt();
            }
            if (action != null) res.put("action", action);
            if (productId != null) res.put("product_id", productId);
            if (quantity != null) res.put("quantity", quantity);
            if (delta != null) res.put("delta", delta);
            if (stock != null) res.put("stock", stock);
            if (min != null) res.put("min", min);
            res.put("ok", action != null);
            return res;
        } catch (Exception e) {
            return res;
        }
    }
}
