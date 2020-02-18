// See https://cameronjs.com/stimulus for more info

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    console.log(`
                    Welcome to
            ┌─┐┌─┐┌┬┐┌─┐┬─┐┌─┐┌┐┌ ╦╔═╗
            │  ├─┤│││├┤ ├┬┘│ ││││ ║╚═╗
            └─┘┴ ┴┴ ┴└─┘┴└─└─┘┘└┘╚╝╚═╝

                    Find me in
code/javascripts/controllers/application_controller.js

    `);
  }
}
