package com.example.demo.service.iml;

import cn.hutool.json.JSONObject;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.entity.reasult.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AnythingLLMService {

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Logger log = LoggerFactory.getLogger(AnythingLLMService.class);

    public String getai(String messageContent) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("message", messageContent);
        requestBody.put("model", "chat");
        requestBody.put("userId", 1);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("accept", "application/json");
        headers.set("Authorization", "Bearer " + "CSWE1F0-DVK4KVF-M1JCT4T-QTPC4A4");
        headers.set("Content-Type", "application/json");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        String url="http://localhost:3001/api/v1/workspace/kwon/thread/7a7f335e-f4fc-4746-8538-e841b2bed7bd/chat";
        String content = restTemplate.postForObject(url, request, String.class);
        // 将字符串响应转换为Map
        if (content != null) {
            content = content.replaceAll("<think>.*?</think>", "");
        }
        Map<String, Object> responseMap = new HashMap<>();
        try {
            responseMap = objectMapper.readValue(content, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("解析AI响应失败: {}", e.getMessage());
            return "解析AI响应失败";
        }
        return (String)responseMap.get("textResponse");
    }
}