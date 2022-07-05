import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'node:fs';
import { UserInfo } from 'src/model/dataModel';
// import * as Sequelize from 'sequelize';
import { encryptPassword, makeSalt } from 'src/utils/cryptogram';
import { v4 as uuidv4 } from 'uuid';
import { ApiModifyUserData } from '../../model/apiModel';
// import sequelize from '../../database/sequelize';

@Injectable()
export class UserService {
  /*
  检查是否有该用户
  @param username 用户名
  
  */
  async findOne(username: string): Promise<any | undefined> {
    try {
      const userData = JSON.parse(
        readFileSync('./src/json/user.json').toString(),
      );
      let user;
      userData.forEach((item) => {
        if (item.userName == username) {
          user = item;
        }
      });

      if (user) {
        return {
          code: 200, //返回的状态码，可以自定义
          data: {
            user,
          },
          msg: 'Success',
        };
      } else {
        return {
          code: 600,
          msg: '查询失败！请确认用户名！',
        };
      }
    } catch (error) {
      return {
        code: 503,
        msg: `Service error:${error}`,
      };
    }
  }

  /**
   * 注册
   * @param requestBody请求体
   */

  async register(requestBody: any): Promise<any> {
    //这里的参数：用户名，密码
    const { userName, userPassword, userGroupUUID } = requestBody;
    console.log(requestBody);
    const user = await this.findOne(userName);
    if (user.code == 200) {
      return {
        status: -1,
        statusText: '用户已存在!',
      };
    }
    // 制作盐
    const salt = makeSalt();
    // 加密
    const hashPwd = encryptPassword(userPassword, salt);

    console.log('================' + requestBody);
    const userData: Array<UserInfo> = JSON.parse(
      readFileSync('./src/json/user.json').toString(),
    );
    console.log(userData);

    const uuid = await this.getUuid();
    userData.push({
      uuid: uuid,
      userName: userName,
      password: hashPwd,
      userGroupUUID: userGroupUUID,
      salt: salt,
    });

    const newUserData = JSON.stringify(userData);
    writeFileSync('./src/json/user.json', newUserData);

    try {
      return {
        status: 200,
        msg: 'Success',
      };
    } catch (error) {
      return {
        status: 500,
        msg: `Service error:${error}`,
      };
    }
  }

  async modifyUser(body: ApiModifyUserData): Promise<any> {
    const userData: Array<UserInfo> = JSON.parse(
      readFileSync('./src/json/user.json').toString(),
    );
    const tempUser = userData.find((user) => user.uuid == body.uuid);
    tempUser.userName = body.userName;
    tempUser.userGroupUUID = body.userGroupUUID;
    // 制作盐
    const salt = makeSalt();
    // 加密
    const hashPwd = encryptPassword(body.userPassword, salt);
    tempUser.password = hashPwd;
    tempUser.salt = salt;

    writeFileSync('./src/json/user.json', JSON.stringify(userData));
    return {
      status: 1,
      statusText: 'Success',
    };
  }

  async getUuid(): Promise<any> {
    try {
      const data = uuidv4();
      return data;
    } catch (error) {
      return {
        code: 503,
        msg: `Service error: ${error}`,
      };
    }
  }
}
