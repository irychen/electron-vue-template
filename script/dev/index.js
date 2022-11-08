const vite = require("vite");
const vue = require("@vitejs/plugin-vue");
const esbuild = require("esbuild");
const { spawn } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

/**
 * 通过process.cwd() 来获取当前工程的根目录
 * 手动定义了开发环境http服务的端口号，并把这个端口号保存到当前dev对象内，
 * 因为接下来启动Electron客户端进程时，需要通过这个端口号来加载开发服务的首页。
 */

const dev = {
  // dev server vite 服务实例
  server: null,
  // dev server vite 服务端口
  serverPort: 1600,
  electronProcess: null,
  async createServer() {
    // like vue.config.js
    const options = {
      configFile: false,
      root: process.cwd(),
      server: {
        port: this.serverPort,
      },
      plugins: [vue()],
      devSourcemap: true,
    };
    // 创建 vite 服务
    this.server = await vite.createServer(options);
    // 监听端口
    await this.server.listen();
  },
  // 获取当前环境变量
  getEnvScript() {
    let env = require("./env.js");
    // 添加环境变量 WEB_PORT
    env.WEB_PORT = this.serverPort;
    // 添加环境变量 RES_DIR 会被原封不动复制到客户端电脑上的资源
    env.RES_DIR = path.join(process.cwd(), "resource/release");
    let script = "";
    for (let v in env) {
      script += `process.env.${v}="${env[v]}";`;
    }
    return script;
  },
  buildMain() {
    const entryFilePath = path.join(process.cwd(), "src/main/app.ts");
    const outfile = path.join(process.cwd(), "release/bundled/entry.js");
    esbuild.buildSync({
      entryPoints: [entryFilePath],
      outfile,
      minify: false,
      bundle: true,
      platform: "node",
      sourcemap: true,
      external: ["electron"],
    });
    // 环境变量 脚本文本
    const envScript = this.getEnvScript();
    // 组装 打包的electron主进程脚本
    const js = `${envScript}${os.EOL}${fs.readFileSync(outfile)}`;
    fs.writeFileSync(outfile, js);
  },
  // 创建electron客户端进程
  createElectronProcess() {
    // electron 客户端进程
    this.electronProcess = spawn(
      require("electron").toString(),
      [path.join(process.cwd(), "release/bundled/entry.js")],
      { cwd: process.cwd() }
    );
    this.electronProcess.on("close", () => {
      this.server.close();
      process.exit();
    });
    this.electronProcess.stdout.on("data", (data) => {
      data = data.toString();
      console.log(data);
    });
  },
  async start() {
    await this.createServer();
    await this.buildMain();
    this.createElectronProcess();
  },
};
dev.start();
