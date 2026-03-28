package com.example.demo.service;

import com.example.demo.entity.reasult.Result;

public interface ICaptchaService {
    Result sendCaptcha(String email);

    String checkCaptcha(String email, String code);
}
