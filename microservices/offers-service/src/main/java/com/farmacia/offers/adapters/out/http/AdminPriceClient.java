package com.farmacia.offers.adapters.out.http;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmacia.offers.config.AppProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Component
public class AdminPriceClient {
  private final RestTemplate rt = new RestTemplate();
  private final ObjectMapper om = new ObjectMapper();
  private final AppProperties props;

  public AdminPriceClient(AppProperties props) { this.props = props; }

  public List<Map<String, Object>> listPrices() {
    String url = props.getBackendBaseUrl() + "/ecommerce/admin/prices/agent-list/";
    HttpHeaders h = new HttpHeaders();
    h.add("X-Service-Key", props.getServiceApiKey());
    String json = rt.exchange(url, org.springframework.http.HttpMethod.GET, new HttpEntity<>(h), String.class).getBody();
    try {
      Object data = om.readValue(json, Object.class);
      if (data instanceof List) {
        return om.convertValue(data, new TypeReference<List<Map<String,Object>>>(){});
      }
      Map<String,Object> paged = om.convertValue(data, new TypeReference<Map<String,Object>>(){});
      Object results = paged.get("results");
      return om.convertValue(results, new TypeReference<List<Map<String,Object>>>(){});
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void clearExpiredOffer(Map<String,Object> price) {
    Number idNum = (Number) price.get("id");
    if (idNum == null) return;
    String url = props.getBackendBaseUrl() + "/ecommerce/admin/prices/" + idNum.intValue() + "/agent-clear-expired/";
    HttpHeaders h = new HttpHeaders();
    h.setContentType(MediaType.APPLICATION_JSON);
    h.add("X-Service-Key", props.getServiceApiKey());
    rt.put(url, new HttpEntity<>(Map.of(), h));
  }

  public static boolean isExpired(Map<String,Object> p) {
    Object sale = p.get("sale_amount");
    if (sale == null) return false;
    Object validUntil = p.get("valid_until");
    if (validUntil == null) return false;
    try {
      Instant ends = Instant.parse(validUntil.toString());
      return Instant.now().isAfter(ends);
    } catch (Exception e) {
      return false;
    }
  }
}
