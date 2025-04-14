# Hong Seng Group Mobile App

一个专为Hong Seng集团开发的移动应用程序，提供用户登录功能和对重量证书(Weight Certificate)和计划(Plan)的访问。

<div align="center">
  <img src="./screenshots/login.jpg" alt="Login Screen" width="250" />
  <img src="./screenshots/home.jpg" alt="Home Screen" width="250" />
</div>

## 功能特点

- 用户认证（登录）
- 主页面提供Weight Cert和Plan功能入口
- 专业的UI/UX设计
- 响应式布局
- 流畅的过渡动画
- 支持各种屏幕尺寸

## 技术栈

- React Native
- Expo
- React Navigation
- Expo Linear Gradient
- React Native Gesture Handler
- 安全的用户认证

## 项目结构

```
hongsenghq/
├── app/                  # Expo应用程序入口
├── assets/               # 静态资源（图片等）
├── src/                  # 源代码目录
│   ├── components/       # 可复用UI组件
│   ├── constants/        # 常量和主题定义
│   ├── navigation/       # 导航配置
│   ├── screens/          # 屏幕组件
│   │   ├── Login.js      # 登录屏幕
│   │   └── Home.js       # 主屏幕
│   └── assets/           # 组件使用资源
├── package.json          # 依赖和脚本
└── README.md             # 项目文档
```

## 开始使用

### 前置要求

- Node.js (>= 14.x)
- npm 或 yarn
- Expo CLI

### 安装

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器
```bash
npm start
# 或
yarn start
```

4. 按照终端中的说明在设备或模拟器上打开应用程序

## 开发信息

- **设计规范**: 应用程序遵循专业的设计规范，使用一致的颜色、排版和间距
- **状态管理**: 使用React的useState和useContext进行状态管理
- **导航**: 使用React Navigation堆栈导航实现屏幕之间的过渡
- **样式**: 使用StyleSheet API和Flex布局实现响应式界面

## 未来功能

- 实现Weight Certificate系统
- 实现Plan系统
- 添加多语言支持
- 添加深色模式

## 贡献

欢迎通过Pull请求贡献代码。对于重大更改，请先提出问题，以讨论您希望更改的内容。

## API Connection Setup

This app connects to a local Node.js API server. Follow these instructions to ensure proper connection:

### Development Environment Setup

1. Make sure your Node.js API server (hsaapi) is running on port 5000
2. Configure API connection based on your development environment:

#### For Emulators/Simulators

- iOS Simulator: The default configuration should work with `localhost:5000`
- Android Emulator: The default configuration should work with `10.0.2.2:5000` (Android's special IP for host machine)

#### For Physical Devices

When testing on physical devices, you'll need to:

1. Open the file `src/constants/config.js`
2. Uncomment the line with `API_URL` for physical devices
3. Replace `192.168.x.x` with your computer's actual IP address on your network
4. Make sure your phone and computer are on the same network
5. Make sure no firewall is blocking connections to your API server

### Troubleshooting Connection Issues

If you encounter "Network request failed" errors:

1. Check if the API server is running (`npm start` in the hsaapi directory)
2. Verify your IP address configuration
3. Make sure your device can reach the API server (try accessing it from a browser)
4. For quick testing, you can enable Test Mode in `src/constants/config.js`

### Test Mode

For development and testing without an API server:

1. Open `src/constants/config.js`
2. Set `ENABLE_TEST_MODE: true`
3. Use one of the test credentials (listed in the config file) with password "password"

## Running the App

```
npx expo start
```

This will start the Expo development server. You can then:
- Press 'a' to open in an Android emulator
- Press 'i' to open in iOS simulator 
- Scan the QR code with the Expo Go app on your physical device
