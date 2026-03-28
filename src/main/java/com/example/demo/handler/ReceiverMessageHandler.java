package com.example.demo.handler;

import com.example.demo.service.IEnvironmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Objects;

@Slf4j
@Component
public class ReceiverMessageHandler implements MessageHandler {

    @Autowired
    private IEnvironmentService environmentService;

    @Override
    public void handleMessage(Message<?> message) throws MessagingException {
        log.info("接收mqtt数据:{}",message);
        String payload = message.getPayload().toString();
        MessageHeaders headers = message.getHeaders();
        String topicName = headers.get("mqtt_receivedTopic").toString();
        LocalDateTime now=LocalDateTime.now();
        if(Objects.equals(topicName, "7_group_data")) {
            System.out.println("received headers: " + headers);
            System.out.println("received topic:   " + topicName);
            System.out.println("received payload: " + payload);
            environmentService.set(payload,now);
        }
    }
}
