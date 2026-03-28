package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Email {
    @TableField("id")
    private Integer id;
    @TableField("email")
    private String email;
    @TableField("code")
    private String code;
    @TableField("time")
    private LocalDateTime time;
}
