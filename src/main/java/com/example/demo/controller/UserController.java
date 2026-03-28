package com.example.demo.controller;

import com.example.demo.entity.Environment;
import com.example.demo.entity.dto.ChangePasswordDto;
import com.example.demo.entity.dto.ThresholdDto;
import com.example.demo.entity.reasult.Result;
import com.example.demo.service.iml.AnythingLLMService;
import com.example.demo.service.iml.EnvironmentService;
import com.example.demo.service.iml.UserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private AnythingLLMService anythingLLMService;

    @Autowired
    private UserService userService;

    @Autowired
    private EnvironmentService environmentService;
    @PostMapping("/llmRag")
    public Result get(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        log.info("获取用户信息请求:{}", question);
        try {
            String mess =anythingLLMService.getai(question);
            log.info("获取用户信息成功: {}", mess);
            return Result.success(mess);
        }catch (Exception e){
            log.info("获取用户信息失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }
    @GetMapping("/getThreshold")
    public Result getThrough() {
        log.info("获取阈值信息请求");
        try {
            ThresholdDto mess =environmentService.getLThreshold();
            log.info("获取阈值信息成功: {}", mess);
            return Result.success(mess);
        }catch (Exception e){
            log.info("获取阈值信息失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

}
