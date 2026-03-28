package com.example.demo.task;

import com.example.demo.controller.MqttToolController;
import com.example.demo.entity.Environment;
import com.example.demo.entity.User;
import com.example.demo.entity.dto.ThresholdDto;
import com.example.demo.service.IEnvironmentService;
import com.example.demo.service.IUserService;
import com.example.demo.utils.EmailApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

/**
 * 定时任务的使用
 * @author pan_junbiao
 **/
@Slf4j
@Component
public class Task {

    @Autowired
    private IEnvironmentService environmentService;
    @Autowired
    private EmailApi emailApi;
    @Autowired
    private IUserService userService;
    @Autowired
    private MqttToolController mqttToolController;

    // 每天中午12点执行
    @Scheduled(cron = "0 0 12 * * ?")
    public void execute() {
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); // 设置日期格式
        List<Environment> environments = environmentService.getAllEnvironment(); // 获取 Environment 数据
        log.info("当前时间: {}", df.format(new Date()));
        List<ThresholdDto> thresholds = environmentService.listThreshold();
        if(thresholds.size() > 10){
            environmentService.deletebytime();
        }
        ThresholdDto threshold = environmentService.getLThreshold(); // 可燃气体阈值
        Double thresholdValue = threshold.getCombustibleGas();
        Double temperature = threshold.getTemperature();
        Double humidity = threshold.getHumidity();
        // 查询所有 role 为 admin 的用户
        List<User> admins = userService.listAdminUsers();
        log.info("阈值: {}", thresholdValue);
        for (Environment env : environments) {
            log.info("当前环境：{}", env);
            if (env.getCombustibleGas() != null && env.getCombustibleGas() > thresholdValue) {
                log.info("发送邮件给管理员：{}", admins);
                for (User admin : admins) {
                    if (admin.getEmail() != null && admin.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+\\.)+[a-zA-Z]{2,}$")) {
                        String to = admin.getEmail().trim(); // 去除前后空格
                        String subject = "WARRING：可燃气体超标警告";
                        String content = String.format("您好 %s,\n\n系统检测到可燃气体浓度异常：%.2f (> %.2f)\n时间：%s\n位置：未知（请根据实际业务补充）\n\n请及时处理。",
                                admin.getUsername(), env.getCombustibleGas(), thresholdValue, df.format(new Date()));
                        emailApi.sendGeneralEmail(subject, content, to);
                        mqttToolController.sendStatusLampMsg("7_group_data_send", "{\"combustibleGas\": " + env.getCombustibleGas() + "}");
                    } else {
                        // 可选：记录无效邮箱的日志
                        System.err.println("无效邮箱地址，跳过发送给用户：" + admin.getUsername());
                    }
                }
            }
            if (env.getTemperature() != null && env.getTemperature() > temperature) {
                log.info("发送邮件给管理员：{}", admins);
                for (User admin : admins) {
                    if (admin.getEmail() != null && admin.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+\\.)+[a-zA-Z]{2,}$")) {
                        String to = admin.getEmail().trim(); // 去除前后空格
                        String subject = "WARRING：温度过高警告";
                        String content = String.format("您好 %s,\n\n系统检测到温度异常：%.2f (> %.2f)\n时间：%s\n位置：未知（请根据实际业务补充）\n\n请及时处理。",
                                admin.getUsername(), env.getTemperature(), temperature, df.format(new Date()));
                        emailApi.sendGeneralEmail(subject, content, to);
                        mqttToolController.sendStatusLampMsg("7_group_data_send", "{\"temperature\": " + env.getTemperature() + "}");
                    }else {
                        // 可选：记录无效邮箱的日志
                        System.err.println("无效邮箱地址，跳过发送给用户：" + admin.getUsername());
                    }
                }
            }
            if (env.getHumidity() != null && env.getHumidity() > humidity) {
                log.info("发送邮件给管理员：{}", admins);
                for (User admin : admins) {
                    if (admin.getEmail() != null && admin.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+\\.)+[a-zA-Z]{2,}$")) {
                        String to = admin.getEmail().trim(); // 去除前后空格
                        String subject = "WARRING：湿度过高警告";
                        String content = String.format("您好 %s,\n\n系统检测到湿度异常：%.2f (> %.2f)\n时间：%s\n位置：未知（请根据实际业务补充）\n\n请及时处理。",
                                admin.getUsername(), env.getHumidity(), humidity, df.format(new Date()));
                        emailApi.sendGeneralEmail(subject, content, to);
                        mqttToolController.sendStatusLampMsg("7_group_data_send", "{\"humidity\": " + env.getHumidity() + "}");
                    }else{
                        // 可选：记录无效邮箱的日志
                        System.err.println("无效邮箱地址，跳过发送给用户：" + admin.getUsername());
                    }
                }
            }
        }
    }
}
