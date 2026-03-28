package com.example.demo.utils;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**
 * @author mijiupro
 */
@Component
public class EmailApi {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from ;// 发件人

    /**
     * 发送纯文本的邮件
     * @param to 收件人
     * @param subject 主题
     * @param content 内容
     * @return 是否成功
     */
    @SneakyThrows(Exception.class)
    public boolean sendGeneralEmail(String subject, String content, String to){
        // 解决本地DNS未配置 ip->域名场景下，邮件发送太慢的问题
        System.getProperties().setProperty("mail.mime.address.usecanonicalhostname", "false");
        System.out.println("开始发送邮件");
        // 获取 MimeMessage
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        Session session = mimeMessage.getSession();
        // 设置 日志打印控制器
        session.setDebug(false);
        //  解决本地DNS未配置 ip->域名场景下，邮件发送太慢的问题
        session.getProperties().setProperty("mail.smtp.localhost", "myComputer");
        // 创建邮件消息
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        // 设置收件人
        message.setTo(to);
        // 设置邮件主题
        message.setSubject(subject);
        // 设置邮件内容
        message.setText(content);
        // 发送邮件
        mailSender.send(message);

        return true;
    }

}
