package com.farmacia.logistics.adapters.in.web;

import com.farmacia.logistics.adapters.out.http.AdminInventoryClient;
import com.farmacia.logistics.adapters.out.http.LlmClient;
import com.farmacia.logistics.adapters.out.persistence.MovementRepository;
import com.farmacia.logistics.application.LlmCommandParser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/agent")
public class AgentController {
    private final AdminInventoryClient adminInventoryClient;
    private final MovementRepository movementRepository;
    private final LlmClient llmClient;
    public AgentController(AdminInventoryClient adminInventoryClient, MovementRepository movementRepository, LlmClient llmClient) {
        this.adminInventoryClient = adminInventoryClient;
        this.movementRepository = movementRepository;
        this.llmClient = llmClient;
    }
    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> execute(@RequestBody Map<String, Object> body) {
        String command = String.valueOf(body.getOrDefault("command", ""));
        HashMap<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("received", command);
        try {
            String prompt = "Eres un asistente de administración. Analiza el texto y devuelve solo un JSON con: action ('block'|'release'|'summary'), product_id (entero), quantity (entero opcional). Texto:" + command;
            String content = llmClient.chatContent(prompt);
            Map<String, Object> parsed = LlmCommandParser.parse(content);
            if (Boolean.TRUE.equals(parsed.get("ok"))) {
                String action = String.valueOf(parsed.get("action"));
                Long pid = parsed.get("product_id") == null ? null : Long.valueOf(String.valueOf(parsed.get("product_id")));
                Integer qty = parsed.get("quantity") == null ? null : Integer.valueOf(String.valueOf(parsed.get("quantity")));
                if ("block".equalsIgnoreCase(action) && pid != null && qty != null) {
                    Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, qty, null, null, null);
                    res.put("action", "block"); res.put("product_id", pid); res.put("quantity", qty); res.put("result", backend);
                    return ResponseEntity.ok(res);
                }
                if ("release".equalsIgnoreCase(action) && pid != null && qty != null) {
                    Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, -qty, null, null, null);
                    res.put("action", "release"); res.put("product_id", pid); res.put("quantity", qty); res.put("result", backend);
                    return ResponseEntity.ok(res);
                }
                if ("adjust_reserved".equalsIgnoreCase(action) && pid != null) {
                    Integer delta = parsed.get("delta") == null ? null : Integer.valueOf(String.valueOf(parsed.get("delta")));
                    if (delta != null) {
                        Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, delta, null, null, null);
                        res.put("action", "adjust_reserved"); res.put("product_id", pid); res.put("delta", delta); res.put("result", backend);
                        return ResponseEntity.ok(res);
                    }
                }
                if ("set_stock".equalsIgnoreCase(action) && pid != null) {
                    Integer stock = parsed.get("stock") == null ? null : Integer.valueOf(String.valueOf(parsed.get("stock")));
                    if (stock != null) {
                        Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, null, stock, null, null);
                        res.put("action", "set_stock"); res.put("product_id", pid); res.put("stock", stock); res.put("result", backend);
                        return ResponseEntity.ok(res);
                    }
                }
                if ("set_min_stock".equalsIgnoreCase(action) && pid != null) {
                    Integer min = parsed.get("min") == null ? null : Integer.valueOf(String.valueOf(parsed.get("min")));
                    if (min != null) {
                        Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, null, null, min, null);
                        res.put("action", "set_min_stock"); res.put("product_id", pid); res.put("min", min); res.put("result", backend);
                        return ResponseEntity.ok(res);
                    }
                }
                if ("summary".equalsIgnoreCase(action) && pid != null) {
                    long blocks = movementRepository.countByProductIdAndType(pid, "block");
                    long releases = movementRepository.countByProductIdAndType(pid, "release");
                    res.put("action", "summary"); res.put("product_id", pid); res.put("blocked", blocks); res.put("released", releases); res.put("blocked_total", blocks - releases);
                    return ResponseEntity.ok(res);
                }
            }
            Matcher mBlock = Pattern.compile(".*bloquear.*producto\\s+(\\d+).*cantidad\\s+(\\d+).*", Pattern.CASE_INSENSITIVE).matcher(command);
            Matcher mRelease = Pattern.compile(".*liberar.*producto\\s+(\\d+).*cantidad\\s+(\\d+).*", Pattern.CASE_INSENSITIVE).matcher(command);
            Matcher mSummary = Pattern.compile(".*resumen.*producto\\s+(\\d+).*", Pattern.CASE_INSENSITIVE).matcher(command);
            Matcher mAdjust = Pattern.compile(".*adjust_reserved.*producto\\s+(\\d+).*delta\\s+(-?\\d+).*", Pattern.CASE_INSENSITIVE).matcher(command);
            Matcher mSetStock = Pattern.compile(".*set_stock.*producto\\s+(\\d+).*stock\\s+(\\d+).*", Pattern.CASE_INSENSITIVE).matcher(command);
            Matcher mSetMin = Pattern.compile(".*set_min_stock.*producto\\s+(\\d+).*min\\s+(\\d+).*", Pattern.CASE_INSENSITIVE).matcher(command);
            if (mBlock.matches()) {
                Long pid = Long.valueOf(mBlock.group(1));
                Integer qty = Integer.valueOf(mBlock.group(2));
                Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, qty, null, null, null);
                res.put("action", "block");
                res.put("product_id", pid);
                res.put("quantity", qty);
                res.put("result", backend);
                return ResponseEntity.ok(res);
            }
            if (mRelease.matches()) {
                Long pid = Long.valueOf(mRelease.group(1));
                Integer qty = Integer.valueOf(mRelease.group(2));
                Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, -qty, null, null, null);
                res.put("action", "release");
                res.put("product_id", pid);
                res.put("quantity", qty);
                res.put("result", backend);
                return ResponseEntity.ok(res);
            }
            if (mSummary.matches()) {
                Long pid = Long.valueOf(mSummary.group(1));
                long blocks = movementRepository.countByProductIdAndType(pid, "block");
                long releases = movementRepository.countByProductIdAndType(pid, "release");
                res.put("action", "summary");
                res.put("product_id", pid);
                res.put("blocked", blocks);
                res.put("released", releases);
                res.put("blocked_total", blocks - releases);
                return ResponseEntity.ok(res);
            }
            if (mAdjust.matches()) {
                Long pid = Long.valueOf(mAdjust.group(1));
                Integer delta = Integer.valueOf(mAdjust.group(2));
                Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, delta, null, null, null);
                res.put("action", "adjust_reserved");
                res.put("product_id", pid);
                res.put("delta", delta);
                res.put("result", backend);
                return ResponseEntity.ok(res);
            }
            if (mSetStock.matches()) {
                Long pid = Long.valueOf(mSetStock.group(1));
                Integer stock = Integer.valueOf(mSetStock.group(2));
                Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, null, stock, null, null);
                res.put("action", "set_stock");
                res.put("product_id", pid);
                res.put("stock", stock);
                res.put("result", backend);
                return ResponseEntity.ok(res);
            }
            if (mSetMin.matches()) {
                Long pid = Long.valueOf(mSetMin.group(1));
                Integer min = Integer.valueOf(mSetMin.group(2));
                Map<String, Object> backend = adminInventoryClient.agentUpdate(pid, null, null, min, null);
                res.put("action", "set_min_stock");
                res.put("product_id", pid);
                res.put("min", min);
                res.put("result", backend);
                return ResponseEntity.ok(res);
            }
            res.put("action", "noop");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            res.put("ok", false);
            res.put("error", String.valueOf(e));
            return ResponseEntity.ok(res);
        }
    }
}
