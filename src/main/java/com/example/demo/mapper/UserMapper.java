package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Email;
import com.example.demo.entity.User;
import jdk.jfr.Threshold;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT * FROM user WHERE username = #{username}")
    User findByUsername(@Param("username") String username);

    @Select("select * from user where username=#{username} and password=#{password}")
    User selectByUsernameandPassword(@Param("username") String username,@Param("password") String password);

    @Update("update user set password=#{password} where id=#{id}")
    boolean updatepassageById(@Param("password") String password,@Param("id") Long id);

    @Select("select * from user where email= #{email}")
    User findByEmail(@Param("email") String email);

    @Select("select * from user where role= #{role}")
    List<User> listAdminUsers(@Param("role") String role);

    @Update("update user set password=#{newPassword} where email=#{email}")
    boolean updatepassage(@Param("newPassword")  String newPassword,@Param("email") String email);
}
