package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Environment;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface EvironmentMapper extends BaseMapper<Environment> {


    @Select("SELECT * FROM environment ORDER BY recordTime ASC LIMIT 10")
    List<Environment> getAllEnvironment();

    @Select("SELECT * FROM environment ORDER BY recordTime DESC LIMIT 1000")
    List<Environment> getAllEnvironmentOrderByTime();

    @Insert("INSERT INTO environment (temperature, humidity, combustibleGas, recordTime) VALUES (#{temperature}, #{humidity}, #{combustibleGas},#{recordTime})")
    void Insert(@Param("temperature") Double temperature,@Param("humidity") Double humidity,@Param("combustibleGas") Double combustibleGas,@Param("recordTime") LocalDateTime recordTime);

    @Select("SELECT * FROM environment ORDER BY recordTime DESC LIMIT 1")
    Environment selectBytime();
}
