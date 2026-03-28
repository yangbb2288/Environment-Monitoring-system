package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("environment")
public class Environment {
    @TableField("temperature")
    private Double temperature;
    @TableField("humidity")
    private Double humidity;
    @TableField("combustibleGas")
    private Double combustibleGas;
    @TableField("recordTime")
    private LocalDateTime recordTime;
}
