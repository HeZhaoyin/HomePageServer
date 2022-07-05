interface AppItem {
  uuid?: string;
  name: string;
  href: string;
  iconType: string;
  groupData?: Array<string>;
}

interface CategoryItem {
  uuid?: string;
  name: string;
  href: string;
  iconType: string;
  categoryTypeUUID: string;
  groupData?: Array<string>;
}

interface CategoryInfo {
  uuid?: string;
  categoryName: string;
  category?: Array<CategoryItem>;
  groupData?: Array<string>;
}

interface ApiModifyCategoryInfo {
  uuid?: string;
  categoryName: string;
}

interface DataModel {
  app: Array<AppItem>;
  category: Array<CategoryInfo>;
}

interface UserGroupItem {
  uuid?: string;
  groupName: string;
}

interface UserInfo {
  uuid?: string;
  userName: string;
  password: string;
  salt: string;
  userGroupUUID: string;
}

interface ApiModifyAppGroupData {
  uuid: string;
  groupData?: Array<string>;
}

export {
  AppItem,
  CategoryItem,
  CategoryInfo,
  DataModel,
  ApiModifyCategoryInfo,
  UserGroupItem,
  UserInfo,
  ApiModifyAppGroupData,
};
