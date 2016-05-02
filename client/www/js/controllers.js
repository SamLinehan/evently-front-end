angular.module('capstone.controllers', [])

.controller('HomeController', HomeController)

.controller('PictureController', PictureController)

.controller('FavoritesController', FavoritesController)

.controller('LiveController', LiveController);



function HomeController($scope, $http, $ionicModal){
   $scope.search = function(value){
     $scope.results = []
     $http.get('https://infinite-waters-87993.herokuapp.com/events').then(function(response){
       for(var i = 0; i < response.data.length; i++){
         if(value === response.data[i].name){
           console.log("Event Name Match");
           $scope.results.push(response.data[i]);
         } else if(value === response.data[i].venue.name){
           console.log("Venue name match");
           $scope.results.push(response.data[i]);
         }
         $scope.noMatches = false;
       }
       if($scope.results.length > 0){
         console.log(results);
       } else {
         $scope.noMatches = true;
         console.log("No Matches");
       }
     })
   }
   $scope.createEvent = function(eventName, venueName, venueCity, venueState, $cordovaVibration){
     var data = {
         eventName: eventName,
         venueName: venueName,
         venueCity: venueCity,
         venueState: venueState
     }
     $http.post('https://infinite-waters-87993.herokuapp.com/create_event', data).then(function(response){
       console.log(data);
       return
     })
   }

   $ionicModal.fromTemplateUrl('templates/eventModal.html', {
     scope: $scope,
     animation: 'slide-in-up'
   }).then(function(modal) {
     $scope.modal = modal;
   });

   $scope.showEventModal = function(){
     console.log("test show event modal")
     $scope.modal.show();
   }

   $scope.hideEventModal = function(){
     $scope.modal.hide();
   }
}


function PictureController($scope, $cordovaCamera, $cordovaFile, $http){
  $scope.images = [];

  $scope.addImage = function() {
      var options = {
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
          allowEdit : false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {

          onImageSuccess(imageData);

          function onImageSuccess(fileURI) {
              createFileEntry(fileURI);
          }

          function createFileEntry(fileURI) {
              window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
          }

          function copyFile(fileEntry) {
              var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
              var newName = makeid() + name;

              window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                  fileEntry.copyTo(
                      fileSystem2,
                      newName,
                      onCopySuccess,
                      fail
                  );
              },
              fail);
          }

          function onCopySuccess(entry) {
              $scope.$apply(function () {
                  $scope.images.push(entry.nativeURL);
              });
          }

          function fail(error) {
              console.log("fail: " + error.code);
          }

          function makeid() {
              var text = "";
              var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

              for (var i=0; i < 5; i++) {
                  text += possible.charAt(Math.floor(Math.random() * possible.length));
              }
              return text;
          }

      }, function(err) {
          console.log(err);
      });
      }

    $scope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        return trueOrigin;
    }
}


function FavoritesController($scope){
  $scope.liveActive = true;

  $scope.toggleFav = function(){
    // window.history.back()
    $scope.favActive = true
    $scope.liveActive = false
  }
  $scope.toggleLive = function(){
    $scope.liveActive = true
    $scope.favActive = false
  }

  $scope.favoritePosts = JSON.parse(window.localStorage.getItem("posts"));

}


function LiveController($scope, $stateParams, $http, $ionicModal, $cordovaVibration){
  var socket = io.connect('https://safe-hollows-28081.herokuapp.com');
  $scope.id = $stateParams.id
  $http.get('https://infinite-waters-87993.herokuapp.com/events').then(function(response){
    $scope.postResults = []
    for(var i = 0; i < response.data.length; i++){
      if($scope.id === response.data[i]._id.$oid){
        for(var j = 0; j < response.data[i].posts.length; j++){
          $scope.postResults.unshift(response.data[i].posts[j]);
        }
      }
    }
  });

  $scope.showModal = function(){
    $scope.modal.show();
  };

  $scope.hideModal = function() {
    $scope.modal.hide();
  };

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.createPost = function(postBody, postName, postImage) {
    if(postImage === undefined){
      var postData = {
        id: $scope.id,
        body: postBody,
        name: postName
      }
    } else {
      var postData = {
        id: $scope.id,
        body: postBody,
        name: postName,
        image: postImage
      }
    }
    socket.emit('post event', postData);

    $http.post("https://infinite-waters-87993.herokuapp.com/create_post", postData).then(function(response){
      return
    })
  };

  var favPosts = [];
  window.localStorage.setItem("posts", JSON.stringify(favPosts));

    socket.on('display event', function(message){
      console.log(message);
      $scope.postResults.unshift(message);
      $scope.$apply();
    })

  $scope.isActive = null
  $scope.favoritesButton = function(result, index){
    $scope.result = result
    $scope.isActive = index
    postArray = JSON.parse(window.localStorage.posts);
    console.log($scope.result);
    postArray.push($scope.result);
    window.localStorage.setItem("posts", JSON.stringify(postArray));
  }

  $scope.startingView = true;
  $scope.nextView = false;

  $scope.favActive = true;
  $scope.liveActive = false;

  $scope.toggleFav = function(){
    $scope.favActive = true
    $scope.liveActive = false

    $scope.startingView = true;
    $scope.nextView = false;
  }

  $scope.toggleLive = function(){
    $scope.liveActive = true
    $scope.favActive = false

    $scope.nextView = true;
    $scope.startingView = false;
  }
}
