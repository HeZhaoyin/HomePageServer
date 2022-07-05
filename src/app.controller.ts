import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { readFileSync, writeFileSync } from 'fs';
import {
  AppItem,
  CategoryItem,
  CategoryInfo,
  DataModel,
  ApiModifyCategoryInfo,
  UserGroupItem,
  UserInfo,
  ApiModifyAppGroupData,
} from './model/dataModel';
import { ApiDeleteAppOrCategoryData } from './model/apiModel';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 获取账户列表
  @UseGuards(AuthGuard('jwt'))
  @Get('getUserList')
  getUserList(): any {
    const userData = JSON.parse(
      readFileSync('./src/json/user.json').toString(),
    );
    return { status: 1, statusText: 'GetUserDataSuccess', data: userData };
  }

  // 获取用户组
  @UseGuards(AuthGuard('jwt'))
  @Get('getUserGroupList')
  getUserGroupList(@Req() req): any {
    // console.log(req.user);
    const userGroupData = JSON.parse(
      readFileSync('./src/json/userGroup.json').toString(),
    );
    return {
      status: 1,
      statusText: 'GetUserDataSuccess',
      data: userGroupData,
    };
  }

  // 创建用户组
  @UseGuards(AuthGuard('jwt'))
  @Post('createUserGroup')
  async createUserGroup(@Body() body: UserGroupItem): Promise<any> {
    // console.log(body);
    const userGroupData: Array<UserGroupItem> = JSON.parse(
      readFileSync('./src/json/userGroup.json').toString(),
    );

    const uuid = await this.getUuid();
    userGroupData.push({
      uuid: uuid,
      groupName: body.groupName,
    });

    const newUserGroupData = JSON.stringify(userGroupData);
    writeFileSync('./src/json/userGroup.json', newUserGroupData);
    return {
      status: 1,
      statusText: 'create userGroup success',
    };
  }

  // 获取导航页数据
  @Get('getDataList')
  getDataList(): any {
    const indexData = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );
    const resultData = { app: [], category: [] };
    indexData.app.forEach((element) => {
      console.log(element);
      if (!element.groupData || element.groupData.length == 0) {
        resultData.app.push(element);
      }
    });
    indexData.category.forEach((element) => {
      if (!element.groupData || element.groupData.length == 0) {
        const tempCategory = { ...element, category: [] };
        element.category.forEach((categoryItem) => {
          if (!categoryItem.groupData || categoryItem.groupData.length == 0) {
            tempCategory.category.push(categoryItem);
          }
        });
        resultData.category.push(tempCategory);
      }
    });
    return { status: 1, statusText: 'GetDataSuccess', data: resultData };
  }
  // 根据token获取导航页数据
  @UseGuards(AuthGuard('jwt'))
  @Get('getDataListWithToken')
  getDataListWithToken(@Req() req): any {
    console.log('获取数据触发守卫');
    console.log(req.user);

    const indexData = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );

    const resultData = { app: [], category: [] };
    indexData.app.forEach((element) => {
      console.log(element);
      if (
        !element.groupData ||
        element.groupData.findIndex((item) => item == req.user.userGroupUUID) >
          -1 ||
        element.groupData.length == 0
      ) {
        resultData.app.push(element);
      }
    });
    indexData.category.forEach((element) => {
      if (
        !element.groupData ||
        element.groupData.findIndex((item) => item == req.user.userGroupUUID) >
          -1 ||
        element.groupData.length == 0
      ) {
        const tempCategory = { ...element, category: [] };
        element.category.forEach((categoryItem) => {
          if (
            !categoryItem.groupData ||
            categoryItem.groupData.findIndex(
              (item) => item == req.user.userGroupUUID,
            ) > -1 ||
            categoryItem.groupData.length == 0
          ) {
            tempCategory.category.push(categoryItem);
          }
        });
        resultData.category.push(tempCategory);
      }
    });

    return { status: 1, statusText: 'GetDataSuccess', data: resultData };
  }
  // 获取所有导航页数据
  @UseGuards(AuthGuard('jwt'))
  @Get('getAllDataList')
  getAllDataList(@Req() req): any {
    const indexData = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );
    return { status: 1, statusText: 'GetDataSuccess', data: indexData };
  }

  // 创建/修改APP
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyApp')
  async modifyApp(@Body() body: AppItem): Promise<any> {
    const indexData: DataModel = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );
    if (body.uuid) {
      indexData.app.forEach((item) => {
        if (item.uuid == body.uuid) {
          item.name = body.name;
          item.href = body.href;
          item.iconType = body.iconType;
        }
      });
    } else {
      const uuid = await this.getUuid();

      const newAppData: AppItem = {
        uuid: uuid,
        name: body.name,
        href: body.href,
        iconType: body.iconType,
      };
      indexData.app.push(newAppData);
    }

    writeFileSync('./src/json/data.json', JSON.stringify(indexData));

    return {
      status: 1,
      statusText: 'Create APP success',
    };
  }

  // 修改APP显示的用户组
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyAppGroupData')
  async modifyAppGroupData(@Body() body: ApiModifyAppGroupData): Promise<any> {
    const indexData: DataModel = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );

    indexData.app.find((item) => item.uuid == body.uuid).groupData =
      body.groupData;

    writeFileSync('./src/json/data.json', JSON.stringify(indexData));

    return {
      status: 1,
      statusText: 'Modify APP GroupData success',
    };
  }

  // 修改书签显示的用户组
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyCategoryGroupData')
  async modifyCategoryGroupData(
    @Body() body: ApiModifyAppGroupData,
  ): Promise<any> {
    const indexData: DataModel = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );

    let tempCategory: CategoryInfo | CategoryItem = indexData.category.find(
      (item) => item.uuid == body.uuid,
    );
    if (!tempCategory) {
      indexData.category.forEach((categoryParent) => {
        categoryParent.category.forEach((categoryChildren) => {
          if (categoryChildren.uuid == body.uuid) {
            tempCategory = categoryChildren;
          }
        });
      });
    }

    tempCategory.groupData = body.groupData;

    writeFileSync('./src/json/data.json', JSON.stringify(indexData));

    return {
      status: 1,
      statusText: 'Modify APP GroupData success',
    };
  }

  // 新建/编辑书签
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyCategory')
  async modifyCategory(@Body() body: CategoryItem): Promise<any> {
    const indexData: DataModel = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );
    if (body.uuid) {
      indexData.category.forEach((item) => {
        if (item.uuid == body.categoryTypeUUID) {
          item.category.forEach((categoryItem) => {
            if (categoryItem.uuid == body.uuid) {
              categoryItem = { ...body };
            }
          });
        }
      });
    } else {
      const uuid = await this.getUuid();

      const newCategoryData: CategoryItem = { ...body, uuid: uuid };
      indexData.category.forEach((item) => {
        if (item.uuid == body.categoryTypeUUID) {
          item.category?.length > 0
            ? item.category.push(newCategoryData)
            : (item.category = [newCategoryData]);
        }
      });
    }

    writeFileSync('./src/json/data.json', JSON.stringify(indexData));

    return {
      status: 1,
      statusText: 'Create APP success',
    };
  }

  // 新建/编辑书签类
  @UseGuards(AuthGuard('jwt'))
  @Post('modifyCategoryType')
  async modifyCategoryType(@Body() body: ApiModifyCategoryInfo): Promise<any> {
    const indexData: DataModel = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );
    if (body.uuid) {
      indexData.category.forEach((item) => {
        if (item.uuid == body.uuid) {
          item.categoryName = body.categoryName;
        }
      });
    } else {
      const uuid = await this.getUuid();

      const newAppData: CategoryInfo = {
        uuid: uuid,
        categoryName: body.categoryName,
      };
      indexData.category.push(newAppData);
    }

    writeFileSync('./src/json/data.json', JSON.stringify(indexData));

    return {
      status: 1,
      statusText: 'Modify CategoryType success',
    };
  }

  // 删除APP/书签/书签类
  @UseGuards(AuthGuard('jwt'))
  @Post('deleteAppOrCategoryData')
  deleteAppOrCategoryData(@Body() body: ApiDeleteAppOrCategoryData): any {
    const indexData: DataModel = JSON.parse(
      readFileSync('./src/json/data.json').toString(),
    );
    switch (body.type.toUpperCase()) {
      case 'APP':
        const deleteAppIndex = indexData.app.findIndex(
          (item) => item.uuid == body.uuid,
        );
        indexData.app.splice(deleteAppIndex, 1);
        break;
      case 'CATEGORY':
        indexData.category.forEach((categoryType: CategoryInfo) => {
          const deleteCategoryIndex = categoryType.category.findIndex(
            (category) => category.uuid == body.uuid,
          );
          if (deleteCategoryIndex != -1) {
            categoryType.category.splice(deleteCategoryIndex, 1);
          }
        });
        break;
      case 'CATEGORYTYPE':
        const deleteCategoryTypeIndex = indexData.category.findIndex(
          (item) => item.uuid == body.uuid,
        );
        indexData.category.splice(deleteCategoryTypeIndex, 1);
        break;
      default:
        break;
    }

    writeFileSync('./src/json/data.json', JSON.stringify(indexData));
    return {
      status: 1,
      msg: 'success',
    };
  }

  // 生成UUID
  @Get('uuid')
  getUuid() {
    return this.appService.getUuid();
  }
}
