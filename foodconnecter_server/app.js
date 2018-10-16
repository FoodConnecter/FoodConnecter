// ----------------------------------------------------------------------------
// Copyright (c) 2015 Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

// This is a base-level Azure Mobile App SDK.
var express = require('express'),
    azureMobileApps = require('azure-mobile-apps'),
    //foodpostApi = require('./custom_api_routes/foodpost'),
    photopostApi = require('./custom_api_routes/photopost'),
    foodlearnApi=require('./custom_api_routes/foodlearn2');
// Set up a standard Express app
var app = express();

var bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//imageディレクトリ内の画像の静的アクセスをできるようにする
app.use(express.static('image'));
// If you are producing a combined Web + Mobile app, then you should handle
// anything like logging, registering middleware, etc. here

// Configuration of the Azure Mobile Apps can be done via an object, the
// environment or an auxiliary file.  For more information, see
// http://azure.github.io/azure-mobile-apps-node/global.html#configuration
var mobile = azureMobileApps({
    // Explicitly enable the Azure Mobile Apps home page
    homePage: true
});

// Import the files from the tables directory to configure the /tables endpoint
mobile.tables.import('./tables');

// Import the files from the api directory to configure the /api endpoint
mobile.api.import('./api');

//カスタムAPI作成
//mobile.use('/api/foodpost', foodpostApi());
mobile.use('/api/photopost',photopostApi());
mobile.use('/api/foodlearn',foodlearnApi());
// Initialize the database before listening for incoming requests
// The tables.initialize() method does the initialization asynchronously
// and returns a Promise.
mobile.tables.initialize()
    .then(function () {
        app.use(mobile);    // Register the Azure Mobile Apps middleware
        app.listen(process.env.PORT || 3000);   // Listen for requests
    });
