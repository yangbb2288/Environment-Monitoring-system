create table user
(
    id       bigint auto_increment comment '主键ID'
        primary key,
    username varchar(50)  not null comment '用户名',
    password varchar(128) null comment '密码',
    role     varchar(50)  not null comment '用户权限',
    email    varchar(128) not null comment '邮箱',
    constraint email
        unique (email),
    constraint username
        unique (username)
)
    comment '用户表' collate = utf8mb4_unicode_ci;


create table thresholddto
(
    combustibleGas double   null,
    time           datetime null,
    temperature    double   null,
    humidity       double   null
);


create table environment
(
    temperature    double   null comment '温度值（字符串格式）',
    humidity       double   null comment '湿度值（字符串格式）',
    combustibleGas double   null comment '可燃气体值（字符串格式）',
    recordTime     datetime null comment '记录时间'
)
    comment '环境数据表';


create table email
(
    id    bigint auto_increment
        primary key,
    email varchar(255) not null comment '用户邮箱',
    code  varchar(255) not null comment '验证码',
    time  timestamp    null comment '过期时间'
);