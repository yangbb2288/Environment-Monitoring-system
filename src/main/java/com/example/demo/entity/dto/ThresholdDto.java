package com.example.demo.entity.dto;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("thresholdDto")
public class ThresholdDto {
    private Double humidity;
    private Double combustibleGas;
    private Double temperature;
    private LocalDateTime time;
}
