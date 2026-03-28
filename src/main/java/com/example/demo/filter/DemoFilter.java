package com.example.demo.filter;

import com.example.demo.utils.CurrentHolder;
import com.example.demo.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
@Slf4j
@WebFilter(urlPatterns = "/*")
public class DemoFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException{
        log.info("提取uri");
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String uri = request.getRequestURI();

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, token"); // 允许自定义头（如 token）
        //
        // 关键修复：放行 OPTIONS 预检请求
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK); // 强制返回 200
            filterChain.doFilter(request, response);
            return;
        }

        log.info("检测是否为MQTT");
        if(uri.contains("/mqtt")||uri.contains("/send")||uri.contains("/ai")){
            filterChain.doFilter(servletRequest,servletResponse);
            return;
        }

        log.info("检测是否为登录,注册或修改密码");
        if(uri.contains("/login")||uri.contains("/register")||uri.contains("/user/update")){
            log.info("登录||注册||修改密码");
            filterChain.doFilter(servletRequest,servletResponse);
            return;
        }

        log.info("检测令牌—>");
        String token = request.getHeader("token");
        if(token == null|| token.isEmpty()){
            log.info("令牌为空");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        try {
            Claims claims=JwtUtils.parseToken(token);
            Integer userId = Integer.valueOf(claims.get("id").toString());
            CurrentHolder.setCurrentId(userId);
        }catch (Exception e){
            log.info("令牌非法");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        log.info("令牌通过，进行放行->");
        filterChain.doFilter(servletRequest,servletResponse);

    }

}
