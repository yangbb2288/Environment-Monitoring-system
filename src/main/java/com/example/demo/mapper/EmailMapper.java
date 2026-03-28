package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Email;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;

@Mapper
public interface EmailMapper extends BaseMapper<Email> {
    @Select("SELECT * FROM email WHERE email = #{email}")
    Email findByEmail(@Param("email") String email);

    @Delete("delete FROM email WHERE email=#{email}")
    int deleteByIdVali(@Param("email") String email);

    @Insert("INSERT INTO email (id, email, code, time) VALUES (#{id}, #{email}, #{code}, #{time})")
    void insertVali(@Param("id") Integer id,@Param("email") String email, @Param("code") String code, @Param("time") LocalDateTime time);

}
