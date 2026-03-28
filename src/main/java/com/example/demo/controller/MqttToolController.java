package com.example.demo.controller;

import com.example.demo.service.MqttMessageSender;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping(value = "/mqtt")
public class MqttToolController {

    @Autowired
    private MqttMessageSender mqttMessageSender ;

    @GetMapping(value = "/send")
    public String sendStatusLampMsg(@RequestParam(value = "topic") String topic , @RequestParam(value = "msg") String msg ) {
        log.info("发送消息：{}" , msg);
        mqttMessageSender.sendMsg(topic , msg);
        return "ok" ;
    }
}
