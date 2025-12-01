package com.farmacia.logistics.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppProperties {
    @Value("${app.backendUrl:http://localhost:8000/api}")
    private String backendUrl;
    @Value("${app.serviceKey:}")
    private String serviceKey;
    @Value("${app.llm.baseUrl:http://localhost:11964}")
    private String llmBaseUrl;
    @Value("${app.llm.model:admin}")
    private String llmModel;
    @Value("${app.llm.apiKey:}")
    private String llmApiKey;
    public String getBackendUrl() { return backendUrl; }
    public String getServiceKey() { return serviceKey; }
    public String getLlmBaseUrl() { return llmBaseUrl; }
    public String getLlmModel() { return llmModel; }
    public String getLlmApiKey() { return llmApiKey; }
}
