# in_d front end

This is the front end for the in_d system.

## orientation

Demos are initialised from `ind.js`.
Demo data models are in `models.js`.
Demo views are in `views.js` and use `templates.js`.
'Controller' event listeners are in `events.js`.
Global parameters are set in `params.js`.
Utility code is included in `components.js`.
System specific styling is in `ind.css`.

`in-d_test.html` is a basic page for local testing of the system.

`.minify.sh` is a bash shell script used for minification of project files for deployment.
These minified files are found in `mini/`.

`cypress/` includes the installation files for the Cypress end-to-end testing platform, which was set up and briefly trialled as part of this project.
Cypress config is in `cypress.config.js`.

## code dependencies

The following files are included in the project as code dependencies and are not my work (source locations in parentheses):

- JQuery was used as a framework to aid in DOM navigation, user interaction, and API requests
  - `jquery-3.6.0.js` (https://jquery.com/download/)
- Prism.js was used to colour highlight syntax in the code examples presented to users.
  - `prism.js` (https://prismjs.com/)
  - `prism.css` (https://prismjs.com/)