package com.example.demo.service.iml;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Environment;
import com.example.demo.entity.dto.ThresholdDto;
import com.example.demo.mapper.EvironmentMapper;
import com.example.demo.mapper.ThresholdMapper;
import com.example.demo.service.ICaptchaService;
import com.example.demo.service.IEnvironmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class EnvironmentService extends ServiceImpl<EvironmentMapper, Environment> implements IEnvironmentService {

    @Autowired
    private ICaptchaService captchaService;

    @Autowired
    private ThresholdMapper thresholdMapper;

    @Override
    public List<Environment> getAllEnvironment() {
        return baseMapper.getAllEnvironment();
    }

    @Override
    public  List<Environment> getAllEnvironmentOrderByTime() {
        return baseMapper.getAllEnvironmentOrderByTime();
    }

    @Override
    public void set(String payload,LocalDateTime now){
        String[] parts = payload.split(";");
        if (parts.length == 3) {
            Environment environment = new Environment();
            environment.setRecordTime(now);

            // 转换并设置温度
            try {
                double temperature = Double.parseDouble(parts[0]);
                if (temperature >= -50 && temperature <= 100) { // 添加温度有效范围检查
                    environment.setTemperature(Math.round(temperature * 100.0) / 100.0); // 四舍五入到两位小数
                } else {
                    log.warn("Temperature value {} is out of valid range.", temperature);
                    environment.setTemperature(null);
                }
            } catch (NumberFormatException e) {
                environment.setTemperature(null); // 如果无法解析则设为 null
            }

            // 转换并设置湿度
            try {
                double humidity = Double.parseDouble(parts[1]);
                if (humidity >= 0 && humidity <= 100) { // 添加湿度有效范围检查
                    environment.setHumidity(Math.round(humidity * 100.0) / 100.0); // 四舍五入到两位小数
                } else {
                    log.warn("Humidity value {} is out of valid range.", humidity);
                    environment.setHumidity(null);
                }
            } catch (NumberFormatException e) {
                environment.setHumidity(null);
            }

            // 转换并设置可燃气体
            try {
                double combustibleGas = Double.parseDouble(parts[2]);
                if (combustibleGas >= 0 && combustibleGas <= 1000) { // 添加可燃气体有效范围检查
                    environment.setCombustibleGas(Math.round(combustibleGas * 100.0) / 100.0); // 四舍五入到两位小数
                } else {
                    log.warn("Combustible gas value {} is out of valid range.", combustibleGas);
                    environment.setCombustibleGas(null);
                }
            } catch (NumberFormatException e) {
                environment.setCombustibleGas(null);
            }

            if (environment.getTemperature() != null && environment.getHumidity() != null && environment.getCombustibleGas() != null) {
                baseMapper.Insert(environment.getTemperature(),environment.getHumidity(),environment.getCombustibleGas(),environment.getRecordTime()); // 插入数据库
            } else {
                log.error("One or more values are invalid, not inserting into database.");
            }
        }
    }

    @Override
    public Environment selectBytime() {
        log.info("获取最新环境信息请求");
        return baseMapper.selectBytime();
    }

    @Override
    public ThresholdDto getLThreshold(){
        log.info("获取环境阈值请求");
        return thresholdMapper.selectBytime();
    }

    @Override
    public List<ThresholdDto> listThreshold() {
        return thresholdMapper.selectsBytime();
    }

    @Override
    public void deletebytime(){
        thresholdMapper.delete();
    }
}
