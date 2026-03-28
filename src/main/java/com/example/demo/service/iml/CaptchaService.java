package com.example.demo.service.iml;

import cn.hutool.core.util.RandomUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Email;
import com.example.demo.entity.reasult.Result;
import com.example.demo.mapper.EmailMapper;
import com.example.demo.service.ICaptchaService;
import com.example.demo.utils.EmailApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class CaptchaService extends ServiceImpl<EmailMapper, Email> implements ICaptchaService {

    @Autowired
    private EmailApi emailApi;
    @Override
    public Result sendCaptcha(String email) {
        Email v = baseMapper.findByEmail(email);
        LocalDateTime now = LocalDateTime.now();
        if(v!=null){
            // 验证码未过期，不能重新发送
            if (now.isBefore(v.getTime())) {
                return Result.error("验证码尚未过期，请勿重复发送");
            } else {
                // 验证码已过期，删除旧记录
                baseMapper.deleteByIdVali(v.getEmail());
            }
        }
        String code = RandomUtil.randomNumbers(4);
        System.out.println("发送验证码");
        boolean send = emailApi.sendGeneralEmail("验证码", "您的验证码为：" + code, email);
        if (!send) {
            return Result.error("发送验证码失败");
        }
        baseMapper.insertVali(null, email, code, now.plusMinutes(10));
        return Result.success(email);
    }

    @Override
    public String checkCaptcha(String email, String code) {
        Email emailDto= baseMapper.findByEmail(email);
        if(emailDto==null){
            return "邮箱错误";
        }
        if(!emailDto.getCode().equals(code)){
            return "验证码错误";
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(emailDto.getTime())) {
            return "验证码已过期";
        }
        return "pass";
    }

}
