package com.example.demo.service.iml;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Email;
import com.example.demo.entity.User;
import com.example.demo.entity.dto.*;
import com.example.demo.mapper.EmailMapper;
import com.example.demo.mapper.ThresholdMapper;
import com.example.demo.mapper.UserMapper;
import com.example.demo.service.IUserService;
import com.example.demo.utils.CurrentHolder;
import com.example.demo.utils.JwtUtils;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
public class UserService extends ServiceImpl<UserMapper,User> implements IUserService {

    @Autowired
    UserMapper userMapper;
    @Autowired
    private CaptchaService captchaService;

    @Autowired
    private ThresholdMapper thresholdMapper;
    @Autowired
    private EmailMapper emailMapper;

    @Override
    public boolean register(RegisterDto user){
        // 用户名验证
        if(userMapper.findByUsername(user.getUsername())!=null){
            throw new RuntimeException("用户名已存在");
        }
        if(user.getUsername().length()<3||user.getUsername().length()>50){
            throw new RuntimeException("用户名长度必须在3-50个字符之间");
        }
        if(!StringUtils.hasText(user.getUsername()) || !user.getUsername().matches("^[a-z0-9_-]{3,50}$")){
            throw new RuntimeException("用户名格式错误，只能包含小写字母、数字、下划线或连字符");
        }
        // 密码验证
        if(user.getPassword().length()<8||user.getPassword().length()>128){  // 修正为8-128
            throw new RuntimeException("密码长度必须在8-128个字符之间");
        }
        if(!StringUtils.hasText(user.getPassword()) || !user.getPassword().matches("^[A-Za-z0-9!@#$%^&*]{8,128}$")){  // 修正转义字符
            throw new RuntimeException("密码格式错误，只能包含大小写字母、数字和特殊字符");
        }

        if(userMapper.findByEmail(user.getEmail())!=null){
            throw new RuntimeException("邮箱已存在");
        }
        String email = user.getEmail();
        String e=captchaService.checkCaptcha(email, user.getCode());
        String role= user.getRole();
        if(role==null){
            role="public";
        }
        if (Objects.equals(e, "pass")) {
            User user1=new User();
            user1.setUsername(user.getUsername());
            user1.setPassword(user.getPassword());
            user1.setEmail(user.getEmail());
            user1.setRole(role);
            return save(user1);
        } else {
            throw new RuntimeException(e);
        }
    }

    @Override
    public UserDto login(LoginDto userDto) {
        String email = userDto.getEmail();
        String password = userDto.getPassword();
        User users=userMapper.findByUsername(email);
        User user = userMapper.findByEmail(email);
        if(user==null&&users==null){
            throw new RuntimeException("用户不存在");
        }
        else {
            if (user != null) {
                if (!Objects.equals(user.getPassword(), password)) throw new RuntimeException("密码错误");
                if(!user.getRole().equals(userDto.getRole())) throw new RuntimeException("权限不对");
                Map<String, Object> map = new HashMap<>();
                map.put("id", user.getId());
                map.put("username", user.getUsername());
                String token = JwtUtils.generateToken(map);
                UserDto userDto1 = new UserDto();
                userDto1.setId(user.getId());
                userDto1.setUsername(user.getUsername());
                userDto1.setToken(token);
                return userDto1;
            } else if (users != null) {
                if (!Objects.equals(users.getPassword(), password)) throw new RuntimeException("密码错误");
                if(!users.getRole().equals(userDto.getRole())) throw new RuntimeException("权限不对");
                Map<String, Object> map = new HashMap<>();
                map.put("id", users.getId());
                map.put("username", users.getUsername());
                String token = JwtUtils.generateToken(map);
                UserDto userDto1 = new UserDto();
                userDto1.setId(users.getId());
                userDto1.setUsername(users.getUsername());
                userDto1.setToken(token);
                return userDto1;
            }
            return null;
        }
    }

    @Override
    public List<User> listAdminUsers() {
        return baseMapper.listAdminUsers("cityManager");
    }

    @Override
    public boolean threshold(ThresholdDto threshold)
    {
        Long userId = (long) CurrentHolder.getCurrentId();
        if (userId==null) {
            throw new RuntimeException("用户不存在");
        }
        User user=baseMapper.selectById(userId);
        if (!user.getRole().equals("cityManager")) {
            throw new RuntimeException("权限不足");
        }
        ThresholdDto thresholdDto=new ThresholdDto();
        thresholdDto.setHumidity(threshold.getHumidity());
        thresholdDto.setCombustibleGas(threshold.getCombustibleGas());
        thresholdDto.setTemperature(threshold.getTemperature());
        thresholdDto.setTime(LocalDateTime.now());
        thresholdMapper.add(thresholdDto.getHumidity(),thresholdDto.getTemperature(), thresholdDto.getCombustibleGas(),thresholdDto.getTime());
        return true;
    }

    @Override
    public boolean changepassword(ChangePasswordDto userDto) {
        User user=baseMapper.findByEmail(userDto.getEmail());
        Email email=emailMapper.findByEmail(userDto.getEmail());
        if(user==null){
            throw new RuntimeException("用户不存在");
        }
        if(!userDto.getCode().equals(email.getCode())){
            throw new RuntimeException("验证码错误");
        }
        String newPassword = userDto.getNewPassword();
        String confirm_password=userDto.getConfirm_password();
        if(!newPassword.equals(confirm_password)){
            throw new RuntimeException("新密码前后不一致");
        }
        if(newPassword.length()<8||newPassword.length()>128){  // 修正为8-128
            throw new RuntimeException("密码长度必须在8-128个字符之间");
        }
        if(!StringUtils.hasText(newPassword) || !newPassword.matches("^[A-Za-z0-9!@#$%^&*]{8,128}$")){  // 修正转义字符
            throw new RuntimeException("密码格式错误，只能包含大小写字母、数字和特殊字符");
        }
        return userMapper.updatepassage(newPassword,email.getEmail());
    }

}
