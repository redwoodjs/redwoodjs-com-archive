// See https://cameronjs.com/js for more info

import { Application } from "stimulus";
import { definitionsFromContext } from "stimulus/webpack-helpers";

const application = Application.start();
const context = require.context("./controllers", true, /\.js$/);
application.load(definitionsFromContext(context));

// Custom JS can go here, or put it in a separate file and `import` it at the top of this file
