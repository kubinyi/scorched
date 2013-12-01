'use strict';

angular.module('scorchedApp')
	.controller('LogincontrollerCtrl', function($scope, $location, ParseService) {
			
    	$scope.go = function (path) {
  			$location.path( path );
		};
		$scope.goBack = function ()
  		{
  			history.back();
            
  		};

		$scope.init = function() {
			
			$scope.errorMsgs = [];
			$scope.msg = '';

			if (ParseService.getUser()) {
				$location.path('/home');
			}
		};
		
		$scope.logInUser = function() {
			//$scope.password = 'bob';
			//$scope.username = 'bob';
			var username = angular.lowercase($scope.username);
			ParseService.login(
				username, $scope.password, {
					success: function(user) {
						$scope.$apply(function() {
							$location.path("/home");
						});
					},

					error: function(user, error) {
						
					}
				});
		};

		$scope.logInFB = function() {
			ParseService.FB_login({
				success: function(user) {
					$scope.$apply(function() {

						$location.path("/home");
					});
				},

				error: function(user, error) {
					alert('Facebook Login Failed');
				}
			});
		};

		//Forgot Password Function
		$scope.resetPassword = function() {
			ParseService.resetPassword(
				$scope.email, {
					success: function(user) {
						$scope.$apply(function() {
							$location.path("/home");
						});
					},
					error: function(user, error) {
						alert('Invalid email.');
					}
				});
		};

		//Lookup username / email for login. If someone enters email instead of username make it work still
		$scope.lookupUsername = function() {

		}

		$scope.createUser = function() {
			$scope.errorMsgs = [];

				$scope.msg = 'Saving account...';

				ParseService.signUp(
					$scope.username, $scope.password, $scope.fullName, {
						success: function(user) {
							$scope.$apply(function() {
								$location.path("/home");
							});
						},

						error: function(user, error) {
							alert('There was a problem creating your account.  Please try again later.');
						}
					});

			
		};

		$scope.init();
	});


