import { createWriteStream } from "node:fs";
import { Writable } from "node:stream";

/** @import { NetlifyPlugin } from "@netlify/build" */

const EMSDK_VERSION = "6.0.9";

/**
 * @satisfies {NetlifyPlugin}
 */
const plugin = {
  onPreBuild: async ({ utils, netlifyConfig }) => {
    const response = await fetch(
      `https://github.com/emscripten-core/emsdk/archive/${EMSDK_VERSION}.zip`,
    );

    if (!response.ok || response.body === null) {
      console.log(response);
      utils.build.failBuild("Could not fetch Emscripten");
    }

    await response.body.pipeTo(
      Writable.toWeb(createWriteStream(`/tmp/emsdk-${EMSDK_VERSION}.zip`)),
    );

    await utils.run("unzip", [
      "-d",
      "/opt/buildhome",
      `/tmp/emsdk-${EMSDK_VERSION}.zip`,
    ]);
    await utils.run("mv", [
      `/opt/buildhome/emsdk-${EMSDK_VERSION}`,
      "/opt/buildhome/.emsdk",
    ]);

    const emsdkFolder = "/opt/buildhome/.emsdk";

    netlifyConfig.build.environment["EMSDK"] = emsdkFolder;

    await utils.run(`${emsdkFolder}/emsdk`, ["update"]);
    await utils.run(`${emsdkFolder}/emsdk`, ["install", EMSDK_VERSION]);
    await utils.run(`${emsdkFolder}/emsdk`, ["activate", EMSDK_VERSION]);

    const envPromise = utils.run(`${emsdkFolder}/emsdk`, ["construct_env"], {
      stdout: "pipe",
    });
    console.log(envPromise);
    console.log(await envPromise);
  },
};

export default plugin;
