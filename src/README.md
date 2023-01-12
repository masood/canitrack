CanITrack Source
=======

This directory is divided into two folders based on where we deployed them.

1. The `tests/` folder contains code hosted on the web server.
2. The `run/` folder contains scripts to run browsers on a client machine.

Browser Mechanisms
--------

Code relevant to the mechanism being tested can be added by creating a new directory under the `tests/storageModules` folder. The directory for a mechanism, `exampleMechanism`, need at least two files named accordingly.

1. `exampleMechanism_client.js`: Exports a class through a global `client` variable. The class comprises a `write` method and a `read` method, both of which are called on the client-side. The `write` method accepts a random input, `secret`, which it writes to using the mechanism. The `read` method accesses the mechanism and returns the `secret` value if found.
2. `exampleMechanism_server.js`: Exports a function, `handle`, that accepts incoming requests and handles any relevant server-side responses to assist the client-side methods.

Test Modules
--------

The directory structure for a test module is similar to that described for browser mechanisms above, and can be added to the `tests/testModules` directory. For example, tests for `exampleTest` can be made available under a new directory of the same name, and it includes at least two files described below.

1. `exampleTest_client.js`: Includes test code that execute on the client-side. They call the `read` and `write` methods of the mechanism being tested. They also send results back to the server.
2. `exampleTest_server.js`:  The server-side code relevant to the current test being performed. This script perfroms *Context Creation* by reading the config file to determine relevant domains for each frame. It also performs *Test Configuration* by creating relevant embedded frames and by including the client-side scripts for the mechanism and the test in the current evaluation. Finally, it accepts results sent from the client-side script and stores it in the `report.json` file.

Configuration File
--------

JSON file with information relevant to the domains used for tests, browsers to be tested, mechanisms being tested, and the tests to be performed.

Web Server
--------

The Web Server, under `tests/server.js` is the first point-of-entry for the hosted server. It directs all incoming requests to the relevant mechanism or test module. It additionally takes care of initial configuration for the report, adding configuration information for each subtest and generating a random 32-bit secret for each test.
