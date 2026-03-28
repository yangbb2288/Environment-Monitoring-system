package com.example.demo.controller;

import com.example.demo.entity.Environment;
import com.example.demo.entity.reasult.Result;
import com.example.demo.service.IEnvironmentService;
import com.example.demo.utils.CurrentHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@RestController
@RequestMapping("*")
public class ChatController {

    private final ChatClient chatClient;
    private final IEnvironmentService environmentService;

    // 使用 ConcurrentHashMap 实现线程安全的用户级历史记录存储
    private static final ConcurrentHashMap<String, List<String>> userHistoryMap = new ConcurrentHashMap<>();
    private static final int MAX_HISTORY_SIZE = 10; // 历史记录最大条目数

    @RequestMapping("/chat")
    public Result chat(@RequestParam("prompt") String prompt) {
        Long userId = (long) CurrentHolder.getCurrentId();
        // 获取或初始化用户的聊天历史
        List<String> userHistory = userHistoryMap.computeIfAbsent(String.valueOf(userId), k -> new ArrayList<>());
        // 控制历史记录大小，保留最新的对话
        if (userHistory.size() >= MAX_HISTORY_SIZE) {
            userHistory.remove(0); // 移除最旧的一条记录
        }
        userHistory.add(prompt); // 添加新的提示词
        // 构建包含数据库信息的提示词
        String context = "这是以前聊天历史信息：" + userHistory + "\n\n现在用户问：" + prompt;
        if(prompt.contains("数据")){
            context = context + "\n\n这是近期10条的环境数据" +environmentService.getAllEnvironment().toString();
        }
        if(prompt.contains("阈值")){
            context = context + "\n\n这是最新的阈值信息" +environmentService.getLThreshold().toString();
        }
        System.out.println(context);
        String message = chatClient.prompt()
                .user(context)
                .call()
                .content();
        return Result.success(message);
    }


    @RequestMapping("/analysisChat")
    public Result analysisChat() {
        List<Environment> data = environmentService.getAllEnvironment();
        // 构建包含数据库信息的提示词
        String context = "这是近期10条的环境数据：\n" + data.toString() +"\n\n请简单地分析这些数据";
        System.out.println(context);
        String message= chatClient.prompt()
                .user(context)
                .call()
                .content();
        return Result.success(message);
    }
}