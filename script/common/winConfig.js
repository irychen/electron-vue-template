if (process.platform === "darwin") module.exports = {};
else
  module.exports = {
    icon: "../resource/unrelease/icon.ico",
    target: [
      {
        target: "nsis",
        arch: ["ia32"],
      },
    ],
    sign: async (config) => {
      //应用签名逻辑后文详细介绍
    },
  };
