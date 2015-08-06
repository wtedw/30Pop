#!/bin/env node

var ObjectID = require('mongodb').ObjectID;
var express = require('express')
  , fs = require('fs')
  , io
  , MongoClient = require('mongodb').MongoClient
  , MONGODB_ITEMS_TO_LOAD_LIMIT = 50

var MyApp = function() {

    var self = this;
    self.setupVariables = function() {
        self.appname = process.env.OPENSHIFT_APP_NAME || 'rtwc';
        self.ipaddress = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8082;
        self.dbport = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
        self.dbname = 'mytest';

        if (typeof self.ipaddress === "undefined") {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };

        if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
          console.log("We are in OpenShift");
          self.connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
          process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
          process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
          self.dbport + '/' +
          self.dbname;
        } else {
            console.log("We are in localhost");
            self.connection_string = self.ipaddress + ':' + self.dbport + '/' + self.dbname;
        }
    };
    
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./public/index.html'); // < ---- THIS WAS EDITED TO INCLUDE /public
    };
    
    
     /**
     *  Retrieve entry (content) from cache. 
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        };
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        
        process.on('exit', function() { self.terminator(); });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };
    
    
    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

    };
        
    /**
     *  Initialize the server (express), create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use(express.static(__dirname + '/public')); // < ---- THIS WAS ADDED
        
        // [TED]

        
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };
        
    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
        self.initializeServer();

    };
    
    /**
    *
    *   Helper Methods
    *
    */
    
    var replaceChars = function(data) {
        var returnString = "";
        if (typeof data !== 'undefined') {
            returnString = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");   
        }
        return returnString;
    }
    
    var truncate = function(data) {
        var returnString = "";
        if (typeof data !== 'undefined') {
            returnString = data.substring(0, 150);
        }
        return returnString;
    }
    
    var getColor = function(code) {
        
        // Test for codes and colors
        var color = "noob"; // Default color, does nothing when I put into <div class="noob"></div>
        // Test for codes and colors
        if (code === "mellon") {
            color = "lava";
        } else if (code === "thylie") {
            color = "bomb";
        } else if (code === "mario") {
            color = "red-mush";
        } else if (code === "luigi") {
            color = "green-mush";
        } else if (code === "dancedance") {
            color = "question-block";
        } else if (code === "clap") {
            color = "batman";   
        }

        return color;
    }
    
    /**
    *
    *   Vars
    *
    */
    
    var whitespacePattern = /^\s*$/;


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        
        io = require('socket.io').listen(
            self.app.listen(self.port, self.ipaddress, function() {
                console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddress, self.port);
            }));
        
        /*
        Update 100:
        - HTML Injection protection by replacing < and > characters
        - Image max-height is set to 200 pixels, no long vertical pictures
        - Bureaucrat protection (can't pop their posts)
        */
        
        MongoClient.connect('mongodb://' + self.connection_string, function(err, db) {
            var col = db.collection('posts');
            
            io.sockets.on('connection', function (socket) {
                
                console.log("===> Socket connected");
                
                // Send posts already in database
                col.find().limit(50).sort({_id: -1}).toArray(function(err, res) {
                   if (err) throw err;
                    socket.emit('output', res);
                });

                // Wait for somebody to push onto the main feed
                // User might send a code, but we will not record it (since it'll show in source)
                socket.on('mainPush', function(data) {      
                    
                    var title = replaceChars(truncate(data.title)),
                        name = replaceChars(truncate(data.name)),
                        link = replaceChars(truncate(data.link)),
                        code = replaceChars(truncate(data.code));

                    if (whitespacePattern.test(title) || 
                        whitespacePattern.test(name) || 
                        whitespacePattern.test(link)) {
   
                        socket.emit('invalid');
                    } else {

                        /* We send an array (jsonData), so underscore.js can just 
                        find vars like data.title instead of title which may not exist */
                        var jsonData = { 
                            "details" : {
                                title: title, 
                                name: name, 
                                link: link, 
                                color: getColor(code)
                            }
                        };
                        
                        col.insert(jsonData, function(err) {
                            
                            // Emits latest post to all clients
                            io.sockets.emit('output', [jsonData]);                            
                            console.log('Inserted');   
                        });
                    }  
                });
                
                
                // Wait for somebody to pop off main feed
                socket.on('mainPop', function() {
                    
                    // Only removes most recent post
                    function mainPop() {
                        col.findAndModify(
                            {},             // Query
                            {'_id': -1},    // Sort order , this also works, this is standard? [['_id', -1]]
                            {},             // Replacement
                            {remove: true}, // Options

                            function() {
                                io.sockets.emit('mainPopOff');
                            }
                        );     
                    }
                    
                    col.findOne(
                        {}, 
                        { sort: { $natural: -1 } },
                        function(err, document) {
                            
                            console.log(document.details.color);
                            
                            // Will only pop if it's a noob post, bureaucrats are immune
                            if (document.details.color === "noob") {
                                mainPop();
                            } else {
                                socket.emit('invalid-bureaucrat');
                            }
                        }
                    );
                });
                
                // Wait for somebody to push a comment
                socket.on('push', function(data) {
                    
                    var postId = replaceChars(truncate(data.postId)),
                        title = replaceChars(truncate(data.title)),
                        name = replaceChars(truncate(data.name)),
                        link = replaceChars(truncate(data.link)),
                        code = replaceChars(truncate(data.code));
                    
                    if (whitespacePattern.test(title) || 
                        whitespacePattern.test(name) || 
                        whitespacePattern.test(link)) {
                        
                        socket.emit('invalid');
                    } else {
                            
                        var jsonData = {
                            "details": { 
                                postId: postId, 
                                title: title, 
                                name: name, 
                                link: link, 
                                color: getColor(code)
                            }
                        };
                        
                        col.update(
                            { _id : ObjectID(data.postId) }, 
                            { $push: { comments : jsonData }},
                            {},
                            function(err, doc) {
                                io.sockets.emit('pushOn', jsonData);
                            }
                        );
                    }
                });
                
                // Wait for somebody to pop a comment
                socket.on('pop', function(id) {
                    function popComment() {
                        col.update(
                            { _id : ObjectID(id) }, 
                            { $pop: { comments : 1 }},
                            {},
                            function(err, doc) {
                                console.log('=== ==> Comment popped from MongoDB');
                            }
                        );
                        io.sockets.emit('popOff', id);
                    }                    
                    
                    col.findOne(
                        { _id : ObjectID(id) }, 
                        {},
                        function(err, document) {
                            var indexRecentComment = document.comments.length - 1;
                            var commentToPop = document.comments[indexRecentComment];
                            var commentColor = commentToPop.details.color;
                            
                            if (commentColor === "noob") {
                                popComment();
                            } else {
                                socket.emit('invalid-bureaucrat');
                            }
                        }
                    );
                });       
            });
        });
    };
};   /*  End of application.  */

/**
 *  main():  Main code.
 */
var server = new MyApp();
server.initialize();
server.start();