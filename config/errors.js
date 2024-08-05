import { glob } from "glob";
import fs from "fs";
import _ from "lodash";

console.info("error messages are loading ...");
let routePath = "src/**/**/*.errors.json";
// initialising with common error message objects
var errors = {};

glob.sync(routePath).forEach(function (file) {
  _.extend(errors, JSON.parse(fs.readFileSync(file, "utf-8")));
  console.info(file + " is loaded");
});

export default errors;
