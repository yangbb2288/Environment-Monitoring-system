package com.example.demo.entity.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChangePasswordDto {
    private String newPassword;
    private String email;
    private String confirm_password;
    private String code;

    @Override
    public String toString() {
        return "ChangePasswordDto{" +
                "newPassword='" + newPassword + '\'' +
                ", email='" + email + '\'' +
                ", confirm_password='" + confirm_password + '\'' +
                ", code='" + code + '\'' +
                '}';
    }
}
