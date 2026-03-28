package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.dto.ThresholdDto;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ThresholdMapper extends BaseMapper<ThresholdDto> {
    @Select("SELECT * FROM thresholdDto ORDER BY time DESC LIMIT 1")
    ThresholdDto selectBytime();

    @Insert("INSERT INTO thresholdDto (humidity, temperature, combustibleGas, time) VALUES (#{humidity},#{temperature}, #{combustibleGas}, #{time})")
    void add(@Param("humidity") Double humidity,@Param("temperature") Double temperature, @Param("combustibleGas") Double combustibleGas, @Param("time") LocalDateTime time);

    @Select("SELECT * FROM thresholdDto ORDER BY time DESC")
    List<ThresholdDto> selectsBytime();

    @Delete("DELETE FROM thresholdDto ORDER BY time ASC LIMIT 1")
    void delete();
}
