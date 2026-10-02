/**
 * 全局环境配置
 * - Demo 阶段 useMock=true，全部内容读取本地结构化数据
 * - 赛后接入云开发：填入 cloudEnvId，并把 Repository 的数据源切换为云端
 */
export interface AppConfig {
  /** 微信云开发环境 ID；留空时不调用云能力 */
  cloudEnvId: string;
  /** 3D 模型 / 音频 / 大图源 CDN 前缀；留空时使用本地或占位资源 */
  cdnBase: string;
  /** 是否使用本地演示数据 */
  useMock: boolean;
  /** 当前版本号 */
  version: string;
}

const config: AppConfig = {
  cloudEnvId: '', // TODO: 在微信开发者工具-云开发中创建环境后填入
  cdnBase: '', // TODO: 配置静态资源托管域名后填入，并在小程序后台加入 downloadFile 合法域名
  useMock: true,
  version: '0.1.0',
};

export default config;
