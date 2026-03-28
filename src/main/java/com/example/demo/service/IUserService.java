package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.entity.dto.*;
import jdk.jfr.Threshold;

import java.util.List;

public interface IUserService {
    boolean register(RegisterDto user);

    UserDto login(LoginDto userDto);

    List<User> listAdminUsers();

    boolean threshold(ThresholdDto threshold);

    boolean changepassword(ChangePasswordDto userDto);
}
