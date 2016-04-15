'use strict';

/* Services */

var wxServices = angular.module('wxServices', ['ngResource']);

wxServices.factory('Announcement', ['$resource', '$http',
  function ($resource, $http) {
      var announcement = {};
      announcement.query = function () {
          $resource('json/:announcementId.json', {}, {
              query: {
                  method: 'GET',
                  params: {
                      announcementId: 'announcements'
                  },
                  isArray: true
              }
          });
      };

      announcement.Authenticate = function () {
          var baseUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc02cb1b8b09bbd18&redirect_uri=Authentication&response_type=code&scope=snsapi_base#wechat_redirect';
          return $http.get(baseUrl);
      };
      return announcement;
  }]);

wxServices.factory('ProcessList', ['$resource', '$http',
  function ($resource, $http) {
      var ProcessList = {};

      ProcessList.query = function (pageSize, pageCount, userIdVal) {
          var urlBase = '/api/WorkFlow/GetTaskList/' + userIdVal + '?pageNum=' + pageCount + '&pagesize=' + pageSize + '&key=';
          return $http.get(urlBase);
      };

      ProcessList.queryGetReviewedTaskList = function (pageSize, pageCount, userIdVal) {
          var urlGetReviewedTaskList = '/api/WorkFlow/GetReviewedTaskList/' + userIdVal + '?pageNum=' + pageCount + '&pagesize=' + pageSize + '&key=';
          return $http.get(urlGetReviewedTaskList);
      };

      ProcessList.Approve = function (wid, comment, userIdVal) {
          var urlApprove = '/api/WorkFlow/InformationTransferApprove/' + userIdVal;
          //  return $http.post(urlArg, comment);
          return $http({
              method: "post",
              url: urlApprove,
              data: {
                  "WorkItemId": wid,
                  "Comment": comment
              }
          });
      };

      ProcessList.RollBack = function (wid, comment, userIdVal) {
          var urlRollBack = '/api/WorkFlow/InformationTransferReject/' + userIdVal;

          var urlArg = urlRollBack;
          //  return $http.post(urlArg, {'':comment});
          return $http({
              method: "post",
              url: urlArg,
              data: { "WorkItemId": wid, "Comment": comment }
          });
      };
      return ProcessList;
  }]);

wxServices.factory('ProcessStatus', ['$resource', '$http',
  function ($resource, $http) {
      var ProcessStatus = {};
      var urlDetail = '/api/WorkFlow/GetWFCommentList/?piid=';

      ProcessStatus.queryDetail = function (piid,defname) {
          var urlArg = urlDetail + piid;
          //return $http.get(urlArg);
          return $http({
              method: "get",
              url: urlArg,
              data: { "defname": defname }
          });
      };

      ProcessStatus.queryUserInfo = function (sapid) {
          var urlDetail = '/api/WorkFlow/GetUserInfoBySapId/?sapId=' + sapid;
          return $http.get(urlDetail);
      };
      return ProcessStatus;
  }]);

wxServices.factory('ProcessResult', ['$resource', '$http',
    function ($resource, $http) {
        var ProcessResult = {};

        ProcessResult.Approve = function (wid, userIdVal) {
            var urlApprove = '/api/WorkFlow/InformationTransferApprove/' + userIdVal + '?wid=' + wid;
            return $http.post(urlApprove);
        };
        return ProcessResult;
    }]);

wxServices.factory('OAuth2', ['$http', 'ipCookie',
    function ($http, ipCookie) {
        var service = {};
        var _redirectUrl = 'http://weixinqy.tclcom.com/MobilePage/OAuth2.html';
        var _adAuthUrl = 'http://weixinqy.tclcom.com/MobilePage/ADAuth.html';
        var _appid = 'wxc02cb1b8b09bbd18';//TODO
        var _wxUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?';
        var _cookieKey = 'wxToken';

        var _generateUrl = function (state) {
            //alert('_generateUrl called.');
            var url = _wxUrl;
            url += "appid=" + _appid;
            url += "&redirect_uri=" + _redirectUrl;
            url += "&response_type=code&scope=snsapi_base";
            url += '&state=' + encodeURI(state);
            url += '#wechat_redirect';
            //console.log(url);
            return url;
        }
        service.auth = function (state) {
            //alert('auth called.');
            var url = _generateUrl(state);
            //alert(encodeURI(url));
            window.location.href = encodeURI(url);
        }

        service.getToken = function () {
            var token = ipCookie(_cookieKey);
            //ipCookie.remove(_cookieKey);//just for test.
            return token;
        }

        service.isAdAuth = function () {
         
            var isAuth = ipCookie('isAdAuth');
            //ipCookie.remove('isAdAuth');//just used once.
            return isAuth;
        };

        service.adAuth = function (token, redirectUrl) {
            //alert("adAuth called.");
            var url = _adAuthUrl += '?userId=' + token.UserId;
            url += '&redirectUrl=' + redirectUrl;
            window.location.href = encodeURI(url);
        }

        return service;
    }]);

wxServices.factory('ProcessListDetail', ['$resource', '$http',
  function ($resource, $http) {
      var ProcessListDetail = {};
      ProcessListDetail.queryDetail = function (urlArg) {       
          return $http.get(urlArg);
      };

      ProcessListDetail.queryDetailTable = function (urlArg) {

          return $http.get(urlArg);
      };
 

      var urlDetailAttach = '/api/WorkFlow/GetAttachementsList/?piid=';
      ProcessListDetail.queryDetailAttach = function (piid) {
          var urlArg = urlDetailAttach + piid;
          return $http.get(urlArg);
      };



      ProcessListDetail.Approve = function (wid, comment, userIdVal,defName,uid) {
          //var urlArg = urlApprove;
          //  return $http.post(urlArg, comment);
          alert('test');

          var urlApprove = '/api/WorkFlow/ProcCommonApprove/' + userIdVal;
          return $http({
              method: "post",
              url: urlApprove,
              data: { "WorkItemId": wid, "Comment": comment, "DefName": defName ,"uid":uid}
          });
      };

      ProcessListDetail.RollBack = function (wid, comment, userIdVal, defName, uid) {

          var urlRollBack = '/api/WorkFlow/ProcCommonReject/' + userIdVal;
         
          return $http({
              method: "post",
              url: urlRollBack,
              data: { "WorkItemId": wid, "Comment": comment, "DefName": defName, "uid": uid }
          });
      };
      ProcessListDetail.UpdateTravel = function (url,piid, IsDoortxt, IsCardtxt, SiteCte) {
 
          var urlTravel= url + piid;
          return $http({
              method: "post",
              url: urlTravel,
              data: { "IsCard": IsCardtxt, "IsDoor": IsDoortxt, "Site": SiteCte }
          });
      };




      return ProcessListDetail;
  }]);


wxServices.factory('ProDetailByPIID', ['$resource', '$http',
  function ($resource, $http) {
      var ProDetailByPIID = {};
      ProDetailByPIID.queryDetail = function (urlArg) {
          return $http.get(urlArg);
      };

      ProDetailByPIID.queryDetailTable = function (urlArg) {
          return $http.get(urlArg);
      };

      var urlDetailAttach = '/api/WorkFlow/GetAttachementsList/?piid=';
      ProDetailByPIID.queryDetailAttach = function (piid) {
          var urlArg = urlDetailAttach + piid;
          return $http.get(urlArg);
      };
      
      return ProDetailByPIID;
  }]);




wxServices.factory('Scroll', ['$resource', '$http',
  function ($resource, $http) {
      var Scroll = {};
      return Scroll;
  }]);

wxServices.factory('Home', ['$resource', '$http',
  function ($resource, $http) {
      var Home = {};
      return Home;
  }]);

wxServices.factory('ReviewedList', ['$resource', '$http',
  function ($resource, $http) {
      var ReviewedList = {};

      ReviewedList.queryGetReviewedTaskList = function (pageSize, pageCount, userIdVal, keyWord) {
          var urlGetReviewedTaskList = '/api/WorkFlow/GetReviewedTaskList/' + userIdVal + '?pageNum=' + pageCount + '&pagesize=' + pageSize + '&key=' + keyWord;

          return $http.get(urlGetReviewedTaskList);
      };
      return ReviewedList;
  }]);

wxServices.factory('PendingList', ['$resource', '$http',
  function ($resource, $http) {
      var PendingList = {};

      PendingList.queryPendingList = function (pageSize, pageCount, userIdVal, keyWord) {
          var urlBase = '/api/WorkFlow/GetTaskList/' + userIdVal + '?pageNum=' + pageCount + '&pagesize=' + pageSize + '&key=' + keyWord;
          return $http.get(urlBase);
      };

      return PendingList;
  }]);

wxServices.factory('PeoplePicker', ['$resource', '$http',
  function ($resource, $http) {
      var PeoplePicker = {};

      PeoplePicker.queryList = function (pageSize, pageCount, keyword) {
          var urlBase = '/api/WorkFlow/GetUsers/?key=' + keyword + '&pageNum=' + pageCount + '&pagesize=' + pageSize;
          ///api/WorkFlow/GetUsers?key=胡&pageNum=0&pagesize=10
          return $http.get(urlBase);
      };

      return PeoplePicker;
  }]);
wxServices.factory('Download', ['$resource', '$http',
  function ($resource, $http) {
      var Download = {};

      Download.queryAttachPath = function (id) {
          var urlBase = '/api/WorkFlow/GetAttachementPath/?id=' + id;

          return $http.get(urlBase);
      };

      return Download;
  }]);
