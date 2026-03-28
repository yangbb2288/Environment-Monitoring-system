package com.example.demo.controller;
import com.example.demo.entity.dto.ChangePasswordDto;
import com.example.demo.entity.dto.LoginDto;
import com.example.demo.entity.dto.RegisterDto;
import com.example.demo.entity.dto.UserDto;
import com.example.demo.entity.reasult.Result;
import com.example.demo.service.iml.CaptchaService;
import com.example.demo.service.iml.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/*
*登录
 */
@Slf4j
@RestController
//@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class LoginController {
    @Autowired
    private UserService userService;
    @Autowired
    private CaptchaService captchaService;
    @PostMapping("/register")
    public Result createUser(@RequestBody RegisterDto user) {
        log.info("用户创建请求: {}", user);
        try {
            boolean success = userService.register(user);
            if (success) {
                log.info("用户创建成功: {}", user);
                return Result.success(user);
            }
            return Result.error("用户创建失败");
        }catch (Exception e){
            log.info("用户创建失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public Result login(@RequestBody LoginDto userDto) {
        log.info("用户登录请求: {}", userDto);
        try {
            UserDto user=userService.login(userDto);
            if (user!=null) {
                log.info("登录成功: {}", user);
                return Result.success(user);
            }
            else{
                log.info("登录失败");
                return Result.error("用户名或密码错误");
            }
        }catch(Exception e){
            log.info("登录失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/register/sendEmail")
    public Result sendmail(@RequestParam String email) {
        log.info("用户注册发送邮件请求: {}", email);
        return  captchaService.sendCaptcha(email);
    }

    @PostMapping("/user/update")
    public Result change(@RequestBody ChangePasswordDto userDto) {
        log.info("用户修改密码请求: {}", userDto);
        try {
            boolean success = userService.changepassword(userDto);
            if (success) {
                log.info("用户修改密码成功: {}", userDto);
                return Result.success("用户密码修改成功");
            }
            return Result.error("用户修改密码失败");
        }catch (Exception e){
            log.info("用户修改密码失败: {}", e.getMessage());
            return Result.error(e.getMessage());
        }
    }

}
