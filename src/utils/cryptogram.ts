// crypto模块的目的是为了提供通用的加密和哈希算法。用纯JavaScript代码实现这些功能不是不可能，
// 但速度会非常慢。Nodejs用C / C++实现这些算法后，通过cypto这个模块暴露为JavaScript接口，
// 这样用起来方便，运行速度也快。
import * as crypto from 'crypto';

// 制作随机盐
export function makeSalt(): string {
  // crypto.randomBytes(3)生成3字节的随机数，作为盐值
  return crypto.randomBytes(3).toString('base64');
}

// 使用盐来加密
export function encryptPassword(password: string, salt: string): string {
  if (!password || !salt) {
    return '';
  }
  // 创建用于包含 盐 的指定字符串，编码为base64
  const tempSalt = Buffer.from(salt, 'base64');
  return crypto
    .pbkdf2Sync(password, tempSalt, 10000, 16, 'sha1')
    .toString('base64');
}
