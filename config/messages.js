import { glob } from "glob";
import fs from "fs";
import _ from "lodash";

console.info("response messages are loading ...");
let routePath = "src/**/**/*.messages.json";
// initialising with common error message objects
var messages = {};

glob.sync(routePath).forEach(function (file) {
  _.extend(messages, JSON.parse(fs.readFileSync(file, "utf-8")));
});

export default messages;
