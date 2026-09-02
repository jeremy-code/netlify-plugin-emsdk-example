import { createWriteStream } from "node:fs";
import { Writable } from "node:stream";

/** @import { NetlifyPlugin } from "@netlify/build" */

const EMSDK_VERSION = "6.0.9";

// https://github.com/emscripten-core/setup-emsdk/blob/0822153d7a5488b70a269cfa0a631b2a86ab4da2/src/matchers.ts#L2
const ENV_REGEX = /(\S+)=(.+);/;

/**
 * @satisfies {NetlifyPlugin}
 */
const plugin = {
  onPreBuild: async ({ utils, netlifyConfig }) => {
    const response = await fetch(
      `https://github.com/emscripten-core/emsdk/archive/${EMSDK_VERSION}.tar.gz`,
    );

    if (!response.ok || response.body === null) {
      console.log(response);
      utils.build.failBuild("Could not fetch Emscripten");
    }

    await response.body.pipeTo(
      Writable.toWeb(createWriteStream(`/tmp/.emsdk.tar.gz`)),
    );

    await utils.run("mkdir", ["-p", "/opt/buildhome/.emsdk"]);
    await utils.run("tar", [
      "-x",
      "-f",
      "/tmp/.emsdk.tar.gz",
      "--strip-components=1",
      "--directory",
      "/opt/buildhome/.emsdk",
    ]);
    const emsdkFolder = "/opt/buildhome/.emsdk";

    netlifyConfig.build.environment["EMSDK"] = emsdkFolder;

    await utils.run(`${emsdkFolder}/emsdk`, ["update"]);
    await utils.run(`${emsdkFolder}/emsdk`, ["install", EMSDK_VERSION]);
    await utils.run(`${emsdkFolder}/emsdk`, ["activate", EMSDK_VERSION]);

    const env = await utils.run(`${emsdkFolder}/emsdk`, ["construct_env"]);
    if (env.stdout === "") {
      utils.build.failBuild("Somehow, an env was unable to be constructed");
    }

    env.stdout.split("\n").map((line) => {
      const envResult = ENV_REGEX.exec(line);
      console.log({ envResult, line });
      if (envResult !== null) {
        netlifyConfig.build.environment[envResult[1]] = envResult[2];
      }
    });
  },
};

export default plugin;
