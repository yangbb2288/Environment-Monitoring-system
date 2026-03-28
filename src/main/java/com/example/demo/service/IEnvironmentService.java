package com.example.demo.service;

import com.example.demo.entity.Environment;
import com.example.demo.entity.dto.ThresholdDto;

import java.time.LocalDateTime;
import java.util.List;

public interface IEnvironmentService {
    List<Environment> getAllEnvironment();

    List<Environment> getAllEnvironmentOrderByTime();

    void set(String payload,LocalDateTime now);

    Environment selectBytime();

    ThresholdDto getLThreshold();

    List<ThresholdDto> listThreshold();

    void deletebytime();
}
