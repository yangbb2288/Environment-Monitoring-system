# ***接口说明***
(数据库建立表代码在resources的db文件夹下)
(除了登录和注册接口，其他接口都需要在header里添加token,token有效时间12h，密码用户名合法检测已经注释便于调试，验证码有效时间10min)
***
前端发送信息到mqtt服务端（测试）
```
http://localhost:8080/mqtt/send?topic=""&msg=""
```
***
自动报警功能：当最新的可燃气体数据超过150时，向所有ADMIN用户发送警报邮件
***
## 1. 注册账号
**接口地址**: `/register`
**请求方式**: `POST`
**请求参数**:
    body:
        ```
        {
            "username": "string",
            "email": "string",
            "password": "string"
            "role": "string",
            "code": "string"        
        }```
**返回参数**:

        {
          "code" : number,
          "msg" : "string",
          "data" : {
            "userId" : number,
            "email" : "string",
            "role" : "string",
            "token" : "string"
          }
        }
        
## 2. 登录
**接口地址**: `/login`
**请求方式**: `POST`
**请求参数**:
    body:
        ```
        {
            "email": "string",
            "password": "string"
        }```
**返回参数**:

        {
          "code" : number,
          "msg" : "string",
          "data" : {
            "userId" : number,
            "email" : "string",
            "role" : "string",
            "token" : "string"
          }
        }


## 3. 发送验证码
**接口地址**: `/register/sendEmail`
**请求方式**: `GET`
**请求参数**: ?email=your_email@example.com
**返回参数**: 

        {
        "code" : 1,
        "msg" : "success",
        "data" : null
        }

## 4. 前端获取开发板记录数据
**接口地址**: `/historyData`            
**请求方式**: `GET`
**请求参数**: 无
**返回参数**:

    {
        "code" : 1,
        "msg" : "success",
        "data" : [ {
        "temperature" : 31.0,
        "humidity" : 12.0,
        "combustibleGas" : 31.0,
        "recordTime" : "2025-06-28T12:42:01"
        }, {
        "temperature" : 71.0,
        "humidity" : 99.0,
        "combustibleGas" : 12.0,
        "recordTime" : "2025-06-28T14:13:56"
        } ]
    }

## 5. 获取最新数据
**接口地址**: `/getLatestData`
**请求方式**: `GET`
**请求参数**: 无
**返回参数**:

    {
        "code" : 1,
        "msg" : "success",
        "data" : {
        "temperature" : 31.0,
        "humidity" : 12.0,
        "combustibleGas" : 90.0,
        "recordTime" : "2025-06-28T15:17:33"
        }
    }
## 6.ai问答
（prompt:"这是以前历史信息：" + userHistory + "\n\n现在用户问：" + prompt）
**接口地址**: `/chat`
**请求方式**: `GET`
**请求参数**: /chat?prompt=告诉我你获取的信息
**返回参数**:

    {
    "code": 1,
    "msg": "success",
    "data": "ai的回答内容"
    }

## 7. 获取警告阈值
**接口地址**: `/user/getThreshold`
**请求方式**: `GET`
**请求参数**: 无
**返回参数**:

    {
        "code" : 1,
        "msg" : "success",
        "data" :{
            "temperature" : 848.981,
            "humidity" : 2301.93,
            "combustibleGas" : 876.48,
            "recordTime" : "2025-07-02T11:48:39"
            }
    }

## 8. 修改警告阈值
**接口地址**: `/threshold`
**请求方式**: `Post`
**请求参数**:

     {
      "humidity": Double,
      "combustibleGas" : Double,
      "temperature" : Double
     }

**返回参数**:

    {
    "code" : 1,
    "msg" : "success",
    "data" : "阈值设置成功"
    }

## 9. ai分析数据
(prompt: 这是近期10条的环境数据：\n" + latestData.toString() + "\n\n请简单地分析)
**接口地址**: `/analysisChat`
**请求方式**: `GET`
**请求参数**: 无
**返回参数**:

    {
    "code": 1,
    "msg": "success",
    "data": "ai的回答内容"
    }
## 10. 忘记密码时修改代码
**接口地址**: `/user/update`
**请求方式**: `POST`
**请求参数**:
    body:
        ```
        {
            "code": "string"
            "newPassword": "string",
            "email": "string",
            "confirm_password":"string",
        }
        ```
## 11. 调用知识库
**接口地址**: `/user/llmRag`
**请求方式**: `POST`
**请求参数**:
    body:
        ```
        {
            “question”: “string”
        }
        ```
**返回参数**:

`   {
        "code": 1,
        "msg": "success",
        "data": "回答内容"
    }`