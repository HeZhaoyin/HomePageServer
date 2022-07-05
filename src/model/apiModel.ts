interface ApiDeleteAppOrCategoryData {
  uuid: string;
  type: string;
}

interface ApiDeleteUser {
  uuid: string;
}

interface ApiModifyUserData {
  uuid: string;
  userName: string;
  userPassword: string;
  userGroupUUID: string;
}

interface ApiModifyUserGroupData {
  uuid: string;
  groupName: string;
}

export {
  ApiDeleteAppOrCategoryData,
  ApiDeleteUser,
  ApiModifyUserData,
  ApiModifyUserGroupData,
};
