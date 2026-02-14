package com.farmacia.offers.application;

import com.farmacia.offers.adapters.out.http.AdminPriceClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@EnableScheduling
@Component
public class OfferScheduler {
  private final AdminPriceClient client;
  public OfferScheduler(AdminPriceClient client) { this.client = client; }

  @Scheduled(cron = "${offers.cron:0 */1 * * * *}")
  public void sweepExpiredOffers() {
    try {
      List<Map<String,Object>> prices = client.listPrices();
      for (Map<String,Object> p : prices) {
        if (AdminPriceClient.isExpired(p)) {
          client.clearExpiredOffer(p);
        }
      }
    } catch (Exception ignored) {}
  }
}

