/*
This file contains the Jest configuration for the application.
It specifies the reporters to use for test results, including the default reporter and jest-junit for generating JUnit XML reports.
*/

module.exports = {
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: './test-results',
            outputName: 'junit.xml'
        }]
    ]
  };