import type { NetlifyPlugin } from "@netlify/build";
import { createWriteStream } from "node:fs";
import { Writable } from "node:stream";

const EMSDK_VERSION = "6.0.9";

const plugin: NetlifyPlugin = {
  onPreBuild: async ({ utils, netlifyConfig }) => {
    const response = await fetch(
      `https://github.com/emscripten/emsdk/archive/${EMSDK_VERSION}.zip`,
    );

    if (!response.ok || response.body === null) {
      utils.build.failBuild("Could not fetch Emscripten");
    }

    await response.body!.pipeTo(
      Writable.toWeb(
        createWriteStream(`/opt/buildhome/emsdk-${EMSDK_VERSION}.zip`),
      ),
    );

    await utils.run.command(`unzip -- ./emsdk-${EMSDK_VERSION}.zip`);
    await utils.run.command(`rm ./emsdk-${EMSDK_VERSION}.zip`);
    await utils.run.command(`mv ./emsdk-${EMSDK_VERSION} ./.emsdk`);
    const emsdkFolder = "/opt/buildhome/.emsdk";

    netlifyConfig.build.environment["EMSDK"] = emsdkFolder;

    await utils.run(`${emsdkFolder}/emsdk`, ["update"]);
    await utils.run(`${emsdkFolder}/emsdk`, ["install", EMSDK_VERSION]);
    await utils.run(`${emsdkFolder}/emsdk`, ["activate", EMSDK_VERSION]);
    await utils.run(`${emsdkFolder}/emsdk`, ["install", EMSDK_VERSION]);
  },
};

export default plugin;
