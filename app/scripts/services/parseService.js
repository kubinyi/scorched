'use strict';

/* Services */

angular.module('scorchedApp', ['ngResource'])
  .factory('ParseService', function($resource) {
    // Initialize Parse API and objects.
    Parse.initialize("", "");

    // Add FB javascript

    window.fbAsyncInit = function() {
      // init the FB JS SDK
      Parse.FacebookUtils.init({
        appId: '', // App ID from the app dashboard
        channelUrl: '//beta.yomo.us/channel.html', // Channel file for x-domain comms
        status: false, // Check Facebook Login status
        cookie: true, // enable cookies to allow Parse to access the session
        xfbml: true // Look for social plugins on the page
      });


      // Additional initialization code such as adding Event Listeners goes here
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));


    // Cache current logged in user
    var loggedInUser;

    /**
     * ParseService Object
     * This is what is used by the controllers to save and retrieve data from Parse.com.
     * Moving all the Parse.com specific stuff into a service allows me to later swap it out
     * with another back-end service provider without modifying my controller much, if at all.
     */
    var ParseService = {
      name: "Parse",

      // Login a user
      login: function login(username, password, options) {
        Parse.User.logIn(username, password, {
          success: function(user) {
            loggedInUser = user;
            if (options.success) {
              options.success(user);
            }
          },
          error: function(user, error) {
            alert("Error: " + error.message);
            if (options.error) {
              options.error();
            }
          }
        });
      },

      // Login a user
      logout: function logout() {
        Parse.User.logOut();
        loggedInUser = null;
      },

      // Reset Password
      resetPassword: function resetPassword(email, options) {
        Parse.User.requestPasswordReset(email, {
          success: function() {
            // Password reset request was sent successfully
            if (options.success) {
              options.success();
            }
          },
          error: function(error) {
            // Show the error message somewhere
            alert("Error: " + error.code + " " + error.message);
            if (options.error) {
              options.error();
            }
          }
        });

      },


      // Login a user using Facebook
      FB_login: function FB_login(options) {
        Parse.FacebookUtils.logIn("user_likes,email", {
          success: function(user) {
            if (!user.existed()) {
              alert("User signed up and logged in through Facebook!");
              FB.api('/me?fields=name,email,link,picture.type(small)', function(response) {
                if (!response.error) {

                  console.log("response.picture.data.url =" + response.picture.data.url);
                  Parse.Cloud.run('httpRequest', {
                    url: response.picture.data.url
                  }, {
                    success: function(result) {

                      user.set("avatar", result);
                      user.save(null, {
                        success: function(user) {
                          //do anything after save
                        },
                        error: function(user, error) {
                          console.log("Oops, something went wrong saving your name.");

                          if (options.error) {
                            options.error();
                          }
                        }
                      });
                      console.log("parseFile saved.");
                    },
                    error: function(error) {
                      console.log("parse.html - the file either could not be read, or could not be saved to Parse.");
                      // The file either could not be read, or could not be saved to Parse.
                    }
                  });


                  user.set("fullName", response.name);
                  user.set("email", response.email);
                  user.set("username", response.email);
                  user.set("facebook", response.link);
                  user.set("ACL", new Parse.ACL(Parse.User.current()));

                  user.save(null, {
                    success: function(user) {
                      // do anything need after save
                      loggedInUser = user;
                      if (options.success) {
                        options.success(user);
                      }

                    },
                    error: function(user, error) {
                      if (options.error) {
                        options.error();
                      }
                      console.log("Oops, something went wrong saving your name.");
                    }
                  });
                } else {
                  if (options.error) {
                    options.error();
                  }
                  console.log("Oops something went wrong with facebook.");
                }
              });
            } else {
              alert("User logged in through Facebook!");
              loggedInUser = user;
              if (options.success) {
                options.success(user);
              }

            }

          },
          error: function(user, error) {
            if (options.error) {
              options.error();
            }
            alert("User cancelled the Facebook login or did not fully authorize.");
          }
        });
      },

      // Update a user
      updateUser: function updateUser(user, options) {

        user.save(null, {
          success: function(user) {

            loggedInUser = user;
            if (options.success) {
              options.success(user);
            }

            // Execute any logic that should take place after the object is saved.
            alert('Updated user with Id: ' + user.id);
          },
          error: function(user, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and description.
            if (options.error) {
              options.error();
            }
            alert('Failed to update user, with error code: ' + error.description);
          }
        });

      },

      // Register a user
      signUp: function signUp(username, password, fullName, options) {
        Parse.User.signUp(username, password, {
          fullName: fullName,
          ACL: new Parse.ACL()
        }, {
          success: function(user) {
            loggedInUser = user;
            if (options.success) {
              options.success(user);
            }
          },

          error: function(user, error) {
            alert("Error: " + error.message);
            if (options.error) {
              options.error();
            }

          }
        });
      }

    };

    // The factory function returns ParseService, which is injected into controllers.
    return ParseService;
  });


