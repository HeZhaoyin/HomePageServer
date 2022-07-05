import { Injectable } from '@nestjs/common';
import { encryptPassword } from 'src/utils/cryptogram';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // 创建实例
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  // JWT验证-step 2：验证用户信息
  async validateUser(username: string, password: string): Promise<any> {
    console.log('Jwt验证 - Step 2：校验用户信息');
    const user = await this.usersService.findOne(username);
    if (user.code == 200) {
      const salt = user.data.user.salt;
      const hashedPassword = user.data.user.password;

      //通过密码盐加密传参，再和数据库的比较，判断是否相等
      const hashPassword = encryptPassword(password, salt);
      if (hashedPassword === hashPassword) {
        return {
          code: 1,
          user: user.data.user,
          msg: '密码正确',
        };
      } else {
        return {
          code: 2,
          user: null,
          msg: '密码错误',
        };
      }
    }
    // 查无此人
    return {
      code: 3,
      user: null,
      msg: '查无此人',
    };
  }

  // jwt验证-step 3：处理jwt签证
  async certificate(user: any) {
    const payload = {
      username: user.userName,
      userGroupUUID: user.userGroupUUID,
    };
    console.log('JWT验证 - Step 3: 处理 jwt 签证');
    try {
      const token = this.jwtService.sign(payload);
      return {
        status: 200,
        data: {
          token,
        },
        msg: '登录成功',
      };
    } catch (error) {
      return {
        status: 600,
        msg: '账号或者密码错误',
      };
    }
  }
}
