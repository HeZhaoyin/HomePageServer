// src/logical/user/user.controller.ts
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import {
  ApiDeleteUser,
  ApiModifyUserData,
  ApiModifyUserGroupData,
} from '../../model/apiModel';
import { UserInfo, UserGroupItem } from '../../model/dataModel';
import { readFileSync, writeFileSync } from 'fs';

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
  ) {}

  // JWT验证 - Step 1: 用户请求登录
  @Post('login')
  async login(@Body() loginParmas: any) {
    console.log('JWT验证 - Step 1: 用户请求登录');
    const authResult = await this.authService.validateUser(
      loginParmas.userName,
      loginParmas.userPassword,
    );
    console.log('状态码');
    console.log(authResult.code);
    switch (authResult.code) {
      case 1:
        return this.authService.certificate(authResult.user);
      case 2:
        return {
          code: 600,
          msg: `账号或密码不正确`,
        };
      default:
        return {
          code: 600,
          msg: `查无此人`,
        };
    }
  }

  // @UseGuards(AuthGuard('jwt')) //使用jwt进行验证
  @Post('registerUser')
  async register(@Body() body: any) {
    return await this.usersService.register(body);
  }

  // 删除用户
  @UseGuards(AuthGuard('jwt')) //使用jwt进行验证
  @Post('deleteUser')
  async deleteUser(@Body() body: ApiDeleteUser) {
    const userData: Array<UserInfo> = JSON.parse(
      readFileSync('./src/json/user.json').toString(),
    );
    const tempDeleteUserUUID = userData.findIndex(
      (user) => user.uuid == body.uuid,
    );
    userData.splice(tempDeleteUserUUID, 1);

    writeFileSync('./src/json/user.json', JSON.stringify(userData));
    return {
      status: 1,
      msg: 'success',
    };
  }

  // 删除用户组
  @UseGuards(AuthGuard('jwt')) //使用jwt进行验证
  @Post('deleteUserGroup')
  async deleteUserGroup(@Body() body: ApiDeleteUser) {
    // 检查是否存在被用户依赖的用户组
    const userData: Array<UserInfo> = JSON.parse(
      readFileSync('./src/json/user.json').toString(),
    );
    let isGroupUsed = false;
    const usedGroupUserNameList = [];
    userData.forEach((user) => {
      if (user.userGroupUUID == body.uuid) {
        isGroupUsed = true;
        usedGroupUserNameList.push(user.userName);
      }
    });
    if (isGroupUsed) {
      return {
        status: -1,
        statusText: `用户${usedGroupUserNameList}依赖着该用户组，请先删除用户或改变用户组`,
      };
    }

    const userGroupData: Array<UserGroupItem> = JSON.parse(
      readFileSync('./src/json/userGroup.json').toString(),
    );
    userGroupData.splice(
      userGroupData.findIndex((userGroup) => userGroup.uuid == body.uuid),
      1,
    );
    writeFileSync('./src/json/userGroup.json', JSON.stringify(userGroupData));
    return {
      status: 1,
      msg: 'success',
    };
  }

  // 编辑用户
  @UseGuards(AuthGuard('jwt')) //使用jwt进行验证
  @Post('modifyUser')
  async modifyUser(@Body() body: ApiModifyUserData) {
    return await this.usersService.modifyUser(body);
  }

  // 编辑用户组
  @UseGuards(AuthGuard('jwt')) //使用jwt进行验证
  @Post('modifyUserGroup')
  async modifyUserGroup(@Body() body: ApiModifyUserGroupData) {
    const userGroupData: Array<UserGroupItem> = JSON.parse(
      readFileSync('./src/json/userGroup.json').toString(),
    );

    const tempUserGroup = userGroupData.find(
      (group) => group.uuid == body.uuid,
    );
    tempUserGroup.groupName = body.groupName;

    writeFileSync('./src/json/userGroup.json', JSON.stringify(userGroupData));
    return {
      status: 1,
      statusText: 'Success',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('checkIsLogin')
  GetCheckIsLogin(): any {
    return {
      status: 200,
    };
  }
}
