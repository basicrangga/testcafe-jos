const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner
            .src(["checkoutCases.js"])
            .browsers(["chrome:emulation:device=iphone X"])
            .video('artifacts/videos', {
                singleFile: true,
                // failedOnly: false,
                pathPattern: '${DATE}/${BROWSER}/${TIME}.mp4'
            },{
                // r: 20,
                // aspect: 1.7777
            })
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });