package com.example.demo.controller;

import com.example.demo.entity.Environment;
import com.example.demo.entity.dto.ThresholdDto;
import com.example.demo.entity.reasult.Result;
import com.example.demo.service.IEnvironmentService;
import com.example.demo.service.iml.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("*")
public class EnvironmentController {
    @Autowired
    private IEnvironmentService environmentService;
    @Autowired
    private UserService userService;

    @GetMapping("/historyData")
    public Result getEnvironment() {
        log.info("获取环境信息请求");
        try {
            List<Environment> environment = environmentService.getAllEnvironmentOrderByTime();
            log.info("环境信息获取成功: {}", environment);
            return Result.success(environment);
        } catch (Exception e) {
            log.info("环境信息获取失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/getLatestData")
    public Result getLastestEnvironment(){
        log.info("获取最新环境信息请求");
        try {
            Environment environment = environmentService.selectBytime();
            log.info("最新环境信息获取成功: {}", environment);
            return Result.success(environment);
        } catch (Exception e) {
            log.info("最新环境信息获取失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/threshold")
    public Result threshold(@RequestBody ThresholdDto threshold) {
        log.info("阈值设置请求: {}", threshold);
        try {
            boolean user=userService.threshold(threshold);
            if (user) {
                log.info("阈值设置成功: {}", threshold);
                return Result.success("阈值设置成功");
            }
            else{
                log.info("阈值设置失败");
                return Result.error("阈值设置失败");
            }
        }catch (Exception e){
            log.info("阈值设置失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/getLThreshold")
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
