package com.farmacia.offers.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppProperties {
  @Value("${backend.baseUrl:http://backend:8000/api}")
  private String backendBaseUrl;

  @Value("${service.apiKey:admin-agent-key}")
  private String serviceApiKey;

  public String getBackendBaseUrl() { return backendBaseUrl; }
  public String getServiceApiKey() { return serviceApiKey; }
}

