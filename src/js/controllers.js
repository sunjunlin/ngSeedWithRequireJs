'use strict';

/* Controllers */

var wxControllers = angular.module("wxControllers", []);

wxControllers.controller('ProcessListDetailCtrl', ['$scope', '$location', '$routeParams', '$sce', 'OAuth2', 'ProcessListDetail', 'ProcessStatus',
    function ($scope, $location, $routeParams, $sce, OAuth2, ProcessListDetail, ProcessStatus) {
        var wid = $routeParams.WID;
        var DefName = $routeParams.DefName;


        var userIdVal = config.application.testuser;
        if (config.application.mode == config.constants.MODE.LIVE) {

            var token = OAuth2.getToken();
            var defType = DefName + "WID";
            var currentUrl = config.application.getAppSettings(config.constants.APP.EP)[defType];//get url from config.
     
            var url = currentUrl.replace('{WID}', wid).replace('{DefName}', DefName);
      
            if (token == null || token == undefined || token.UserId == undefined) {
                var state = $routeParams.state;
                state += "@@" + url;//需要把#替换@
                OAuth2.auth(state);
            }
            userIdVal = token.UserId;

        }
        $scope.isWeiXinClient = false;
        $scope.processListDetail = {};
        $scope.processListDetailAttachment = {};
        $scope.processListDetailTable = {};
        $scope.processListDetailTableAccout = {};//出差行程
        $scope.processListDetailTablePlace = {};//费用预算
        $scope.processListDetailTableProject = {};//项目

        $scope.status;
        $scope.Comments = '';
        $scope.HasAttachment = false;
        $scope.isLoadingToast = false;
        $scope.showWarnToast = false;

        $scope.processStatusDetail = {};

        getProcess(wid, DefName);
        function getProcess(wid, DefName) {


            $scope.isLoadingToast = true;
            var is_weixin = (function () {
                return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1
            })();

            $scope.isWeiXinClient = is_weixin;

            var urlDetail = '';

            switch (DefName) {
                case 'InfoTransferProcess':
                    urlDetail = '/api/InformationTransfer/GetInformationTransfer/?wid=';
                    break;
                case 'SZLeaveRequest':
                    urlDetail = '/api/SZLeaveRequest/GetBasicByWID/?wid=';
                    break;
                case 'NBLeaveRequest':
                    urlDetail = '/api/SZLeaveRequest/GetBasicByWID/?wid=';
                    break;
                case 'HZLeaveProcess':
                    urlDetail = '/api/HZLeaveProcess/GetBasicByWID/?wid=';
                    break;
                case 'SHLeaveProcess':
                    urlDetail = '/api/SHLeaveProcess/GetBasicByWID/?wid=';
                    break;
                case 'CDLeaveProcess':
                    urlDetail = '/api/CDLeaveProcess/GetBasicByWID/?wid=';
                case 'SZOverTimeProcess':
                    urlDetail = '/api/SZOverTimeProcess/GetBasicByWID/?wid=';
                    break;
                case 'OverTimeProcess':
                    urlDetail = '/api/SZOverTimeProcess/GetBasicByWID/?wid=';
                    break;
                case 'HZOverTimeProcess':
                    urlDetail = '/api/HZOverTimeProcess/GetBasicByWID/?wid=';
                    break;
                case 'SHOverTimeProcess':
                    urlDetail = '/api/SHOverTimeProcess/GetBasicByWID/?wid=';
                    break;
                case 'CDOverTimeProcess':
                    urlDetail = '/api/CDOverTimeProcess/GetBasicByWID/?wid=';
                    break;

                case 'SZAttendanceProcess':
                    urlDetail = '/api/SZAttendanceProcess/GetBasicByWID/?wid=';
                    break;
                case 'SHAttendanceCorrectionProcess':
                    urlDetail = '/api/SHAttendanceCorrectionProcess/GetBasicByWID/?wid=';
                    break;
                case 'NBAttendanceProcess':
                    urlDetail = '/api/SZAttendanceProcess/GetBasicByWID/?wid=';
                    break;
                case 'HZAttendanceProcess':
                    urlDetail = '/api/HZAttendanceProcess/GetBasicByWID/?wid=';
                    break;
                case 'CDAttendanceProcess':
                    urlDetail = '/api/SZAttendanceProcess/GetBasicByWID/?wid=';
                    break;

                case 'SHTravelApplication':
                    urlDetail = '/api/SHTravelApplication/GetBasicByWID/?wid=';

                    break;
                case 'HZEmployeeTravel':
                    urlDetail = '/api/HZEmployeeTravel/GetBasicByWID/?wid=';
                    break;
                case 'CD_Travel_Application':
                    urlDetail = '/api/CD_Travel_Application/GetBasicByWID/?wid=';
                    break;
                case 'SZEmployeeTravel':
                    urlDetail = '/api/SZEmployeeTravel/GetBasicByWID/?wid=';
                    break;
                case 'CancelTravelProcess':
                    urlDetail = '/api/CancelTravelProcess/GetBasicByWID/?wid=';
                    break;
                case 'AttendanceAgainst':
                    urlDetail = '/api/AttendanceAgainst/GetBasicByWID/?wid=';
                    break;
                case 'CancelLeaveProcess':
                    urlDetail = '/api/CancelLeaveProcess/GetBasicByWID/?wid=';
                    break;

            }
            if (urlDetail != '') {
                var urlArg = urlDetail + wid;
                ProcessListDetail.queryDetail(urlArg).success(function (custs) {
                    $scope.processListDetail = custs;
                    // 需处理的work item(避免后退重复操作)
                    var isDataNull = false;
                    if (custs == null) {
                        $scope.isLoadingToast = false;
                        isDataNull = true;
                    }
                    else {
                        if (custs.WokrItemStatus == null) {
                            $scope.isLoadingToast = false;
                            isDataNull = true;
                        }
                    }
                    if (isDataNull)
                        return;

                    if (custs.WokrItemStatus == "Assigned" || custs.WokrItemStatus == "Overdue" || custs.WokrItemStatus == "New" || custs.WokrItemStatus == "Carbon")
                        $scope.IsShowControl = true;
                    else
                        $scope.IsShowControl = false;


                    $scope.deliberatelyTrustDangerousSnippet = function () {
                        return $sce.trustAsHtml($scope.processListDetail.Specify);
                    };

                    initTravelData(custs);
                    getProcessAttach($scope.processListDetail.ProcInsID);
                    getDetailTable($scope.processListDetail.ProcInsID, DefName);

                    getProcessStatus($scope.processListDetail.ProcInsID, DefName);

                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }

        };

        function initTravelData(processListDetail) {

            $scope.IsCard = processListDetail.IsCard == 'T' ? true : false;
            $scope.IsDoor = processListDetail.IsCard == 'T' ? true : false;

            var sites = processListDetail.Site;
            if (sites == null || sites == '') {
                $scope.IsCard = false;
                $scope.IsDoor = false;
                $scope.IsSZ = false;
                $scope.IsSH = false;
                $scope.IsCD = false;
                $scope.IsNB = false;
                $scope.IsHZPIC = false;
                $scope.IsBJMIE = false;
            }
            else {

                $scope.IsSZ = sites.indexOf('01') != -1 ? true : false;
                $scope.IsSH = sites.indexOf('02') != -1 ? true : false;
                $scope.IsCD = sites.indexOf('03') != -1 ? true : false;
                $scope.IsNB = sites.indexOf('04') != -1 ? true : false;
                $scope.IsHZPIC = sites.indexOf('05') != -1 ? true : false;
                $scope.IsBJMIE = sites.indexOf('06') != -1 ? true : false;
            }


        }
        function getProcessAttach(piid, DefName) {
            $scope.isLoadingToast = true;

            ProcessListDetail.queryDetailAttach(piid).success(function (custs) {
                if (custs.length > 0) {
                    $scope.processListDetailAttachment = custs;
                    $scope.HasAttachment = true;
                }
                $scope.isLoadingToast = false;

            }).error(function (error) {
                $scope.status = 'Unable to load customer data: ' + error.message;
                $scope.isLoadingToast = false;

            });

        };

        function getDetailTable(piid, DefName) {
            $scope.isLoadingToast = true;

            var urlDetailTable = '';
            var urlDetailPlace = '';
            var urlDetailAccout = '';
            var urlDetailProject = '';

            switch (DefName) {
                case 'SZLeaveRequest':
                    urlDetailTable = '/api/SZLeaveRequest/GetDetailByPIID/?piid=';
                    break;
                case 'NBLeaveRequest':
                    urlDetailTable = '/api/SZLeaveRequest/GetDetailByPIID/?piid=';
                    break;
                case 'HZLeaveProcess':
                    urlDetailTable = '/api/HZLeaveProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SHLeaveProcess':
                    urlDetailTable = '/api/SHLeaveProcess/GetDetailByPIID/?piid=';
                    break;
                case 'CDLeaveProcess':
                    urlDetailTable = '/api/CDLeaveProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SZOverTimeProcess':
                    urlDetailTable = '/api/SZOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'OverTimeProcess':
                    urlDetailTable = '/api/SZOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'HZOverTimeProcess':
                    urlDetailTable = '/api/HZOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SHOverTimeProcess':
                    urlDetailTable = '/api/SHOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'CDOverTimeProcess':
                    urlDetailTable = '/api/CDOverTimeProcess/GetDetailByPIID/?piid=';
                    break;



                case 'SZAttendanceProcess':
                    urlDetailTable = '/api/SZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SHAttendanceCorrectionProcess':
                    urlDetailTable = '/api/SHAttendanceCorrectionProcess/GetDetailByPIID/?piid=';
                    break;
                case 'NBAttendanceProcess':
                    urlDetailTable = '/api/SZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;
                case 'HZAttendanceProcess':
                    urlDetailTable = '/api/HZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;
                case 'CDAttendanceProcess':
                    urlDetailTable = '/api/SZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;


                case 'SHTravelApplication':

                    urlDetailPlace = '/api/SHTravelApplication/GetPlaceByPIID/?piid=';
                    urlDetailAccout = '/api/SHTravelApplication/GetAccoutByPIID/?piid=';
                    urlDetailProject = '/api/SHTravelApplication/GetProjectByPIID/?piid=';

                    break;
                case 'HZEmployeeTravel':
                    urlDetailTable = '/api/HZEmployeeTravel/GetDetailByPIID/?piid=';
                    break;
                case 'CD_Travel_Application':

                    urlDetailPlace = '/api/CD_Travel_Application/GetPlaceByPIID/?piid=';
                    urlDetailAccout = '/api/CD_Travel_Application/GetAccoutByPIID/?piid=';
                    urlDetailProject = '/api/CD_Travel_Application/GetProjectByPIID/?piid=';
                    break;

                case 'CancelLeaveProcess':
                    urlDetailTable = '/api/CancelLeaveProcess/GetDetailByPIID/?piid=';
                    break;

            }
            if (urlDetailTable != '') {
                var urlArg = urlDetailTable + piid;
                ProcessListDetail.queryDetailTable(urlArg).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTable = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }
            if (urlDetailPlace != '') {
                var urlArgurlDetailPlace = urlDetailPlace + piid;
                ProcessListDetail.queryDetailTable(urlArgurlDetailPlace).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTablePlace = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }
            if (urlDetailAccout != '') {
                var urlArgurlurlDetailAccout = urlDetailAccout + piid;
                ProcessListDetail.queryDetailTable(urlArgurlurlDetailAccout).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTableAccout = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }
            if (urlDetailProject != '') {
                var urlArgurlurlDetailProject = urlDetailProject + piid;
                ProcessListDetail.queryDetailTable(urlArgurlurlDetailProject).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTableProject = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }

        };

        // var action = "Approve";//              
        // var url = "/ProcessResult/" + wid + "/WorkFlowNumber/" + "ITNO" + "/Action/" + action;
        // $scope.isLoadingToast = false;
        // $location.path(url);
        $scope.ApproveTravel = function (Comments, IsDoor, IsCard, IsSZ, IsSH, IsCD, IsNB, IsHZPIC, IsBJMIE) {
            $scope.isLoadingToast = true;

            var urlTravel = "";
            switch (DefName) {
                case 'SHTravelApplication':
                    urlTravel = '/api/SHTravelApplication/UpdateTravel/?piid=';
                    break;
                case 'HZEmployeeTravel':
                    urlTravel = '/api/HZEmployeeTravel/UpdateTravel/?piid=';
                    break;
                case 'CD_Travel_Application':
                    urlTravel = '/api/CD_Travel_Application/UpdateTravel/?piid=';
                    break;
                case 'SZEmployeeTravel':
                    urlTravel = '/api/SZEmployeeTravel/UpdateTravel/?piid=';
                    break;
            }
            if (urlTravel != '') {
                var piid = $scope.processListDetail.ProcInsID;
                var IsDoortxt = IsDoor == true ? "T" : "F";
                var IsCardtxt = IsCard == true ? "T" : "F";

                var IsSZtxt = IsSZ == true ? "01;" : "";
                var IsNBtxt = IsNB == true ? "02;" : "";
                var IsCDtxt = IsCD == true ? "03;" : "";
                var IsSHtxt = IsSH == true ? "04;" : "";
                var IsHZPICtxt = IsHZPIC == true ? "05;" : "";
                var IsBJMIEtxt = IsBJMIE == true ? "06;" : "";
                var SiteCte = IsSZtxt + IsNBtxt + IsCDtxt + IsSHtxt + IsHZPICtxt + IsBJMIEtxt;

                ProcessListDetail.UpdateTravel(urlTravel, piid, IsDoortxt, IsCardtxt, SiteCte)
                     .success(function () {
                         $scope.status = 'UpdateTravel success.';
                         $scope.isLoadingToast = false;
                         $scope.Approve(Comments);
                     })
                     .error(function (error) {
                         $scope.status = 'Unable to UpdateTravel : ' + error.message;
                         $scope.isLoadingToast = false;
                     });
            }



        }
        $scope.RollBackTravel = function (Comments, IsDoor, IsCard, IsSZ, IsSH, IsCD, IsNB, IsHZPIC, IsBJMIE) {



            if (Comments != '' && Comments != null && Comments != undefined) {
                $scope.isLoadingToast = true;

                var urlTravel = "";
                switch (DefName) {
                    case 'SHTravelApplication':
                        urlTravel = '/api/SHTravelApplication/UpdateTravel/?piid=';
                        break;
                    case 'HZEmployeeTravel':
                        urlTravel = '/api/HZEmployeeTravel/UpdateTravel/?piid=';
                        break;
                    case 'CD_Travel_Application':
                        urlTravel = '/api/CD_Travel_Application/UpdateTravel/?piid=';
                        break;
                    case 'SZEmployeeTravel':
                        urlTravel = '/api/SZEmployeeTravel/UpdateTravel/?piid=';
                        break;
                }
                if (urlTravel != '') {
                    var piid = $scope.processListDetail.ProcInsID;
                    var IsDoortxt = "F";
                    var IsCardtxt = "F";
                    var SiteCte = "";

                    ProcessListDetail.UpdateTravel(urlTravel, piid, IsDoortxt, IsCardtxt, SiteCte)
                         .success(function () {
                             $scope.status = 'UpdateTravel success.';
                             $scope.isLoadingToast = false;
                             $scope.RollBack(Comments);
                         })
                         .error(function (error) {
                             $scope.status = 'Unable to UpdateTravel : ' + error.message;
                             $scope.isLoadingToast = false;
                         });
                }

            }
            else {
                $scope.showWarnToast = true;

            }

        }

        $scope.Approve = function (Comments) {
            $scope.isLoadingToast = true;
            ProcessListDetail.Approve(wid, Comments, userIdVal, DefName, $scope.processListDetail.UID)
                 .success(function () {
                     $scope.status = 'Approve success.';
                     var action = "Approve";//              
                     var url = "/ProcessResult/" + wid + "/WorkFlowNumber/" + $scope.processListDetail.ITNO + "/Action/" + action;
                     $scope.isLoadingToast = false;
                     $location.path(url);

                 })
                 .error(function (error) {
                     $scope.status = 'Unable to Approve : ' + error.message;
                     $scope.isLoadingToast = false;
                 });
        }

        $scope.OpenAttach = function (AttachID) {

            var url = "/Download/AttachID/" + AttachID;
            $location.path(url);
        };

        $scope.CloseAttach = function () {
            var tip = document.getElementById('weixin-tip');
            tip.style.display = 'none';
        };

        $scope.RollBack = function (RollBackComments) {

            // var action = "RollBack";//              
            // var url = "/ProcessResult/" + wid + "/WorkFlowNumber/" + "ITNO" + "/Action/" + action;
            // $location.path(url);

            if (RollBackComments != '' && RollBackComments != null && RollBackComments != undefined) {
                $scope.isLoadingToast = true;
                ProcessListDetail.RollBack(wid, RollBackComments, userIdVal, DefName, $scope.processListDetail.UID)
                  .success(function () {
                      $scope.isLoadingToast = false;
                      $scope.status = 'RollBack success.';
                      var action = "RollBack";//              
                      var url = "/ProcessResult/" + wid + "/WorkFlowNumber/" + $scope.processListDetail.ITNO + "/Action/" + action;
                      $location.path(url);

                  })
                  .error(function (error) {
                      $scope.status = 'Unable to Approve : ' + error.message;
                      $scope.isLoadingToast = false;
                  });
            }
            else {
                $scope.showWarnToast = true;

            }
        }

        function getProcessStatus(piid, defName) {
            $scope.isLoadingToast = true;

            ProcessStatus.queryDetail(piid, defName).success(function (custs) {

                $scope.processStatusDetail = custs;
                console.log(custs);
                $scope.isLoadingToast = false;

            }).error(function (error) {
                $scope.status = 'Unable to load customer data: ' + error.message;
                $scope.isLoadingToast = false;


            });
        }

        $scope.hideWarn = function () {
            $scope.showWarnToast = false;
        }
    }
]);


wxControllers.controller('ProDetailByPIIDCtrl', ['$scope', '$location', '$routeParams', '$sce', 'OAuth2', 'ProDetailByPIID', 'ProcessStatus',
    function ($scope, $location, $routeParams, $sce, OAuth2, ProDetailByPIID, ProcessStatus) {
        var piid = $routeParams.PIID;
        var DefName = $routeParams.DefName;


        var userIdVal = config.application.testuser;
        if (config.application.mode == config.constants.MODE.LIVE) {

            var token = OAuth2.getToken();

            var defType = DefName + "PIID";
            var currentUrl = config.application.getAppSettings(config.constants.APP.EP)[defType];//get url from config.
            var url = currentUrl.replace('{PIID}', piid).replace('{DefName}', DefName);
            
            if (token == null || token == undefined || token.UserId == undefined) {
                var state = $routeParams.state;
                state += "@@" + url;//需要把#替换@
                OAuth2.auth(state);
            }
            userIdVal = token.UserId;

        }
        $scope.isWeiXinClient = false;
        $scope.processListDetail = {};
        $scope.processListDetailAttachment = {};
        $scope.processListDetailTable = {};
        $scope.processListDetailTableAccout = {};//出差行程
        $scope.processListDetailTablePlace = {};//费用预算
        $scope.processListDetailTableProject = {};//项目

        $scope.status;
        $scope.Comments = '';
        $scope.HasAttachment = false;
        $scope.isLoadingToast = false;

        $scope.IsCard_disabled = true;
        $scope.IsDoor_disabled = true;
        $scope.IsSZ_disabled = true;
        $scope.IsSH_disabled = true;
        $scope.IsCD_disabled = true;
        $scope.IsNB_disabled = true;
        $scope.IsHZPIC_disabled = true;
        $scope.IsBJMIE_disabled = true;

        $scope.processStatusDetail = {};

        getProcess(piid, DefName);
        function getProcess(piid, DefName) {


            $scope.isLoadingToast = true;
            var is_weixin = (function () {
                return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1
            })();

            $scope.isWeiXinClient = is_weixin;

            var urlDetail = '';

            switch (DefName) {
                case 'InfoTransferProcess':
                    urlDetail = '/api/InformationTransfer/GetProcByPIID/?piid=';
                    break;
                case 'SZLeaveRequest':
                    urlDetail = '/api/SZLeaveRequest/GetProcByPIID/?piid=';
                    break;
                case 'NBLeaveRequest':
                    urlDetail = '/api/SZLeaveRequest/GetProcByPIID/?piid=';
                    break;
                case 'HZLeaveProcess':
                    urlDetail = '/api/HZLeaveProcess/GetProcByPIID/?piid=';
                    break;
                case 'SHLeaveProcess':
                    urlDetail = '/api/SHLeaveProcess/GetProcByPIID/?piid=';
                    break;
                case 'CDLeaveProcess':
                    urlDetail = '/api/CDLeaveProcess/GetProcByPIID/?piid=';
                case 'SZOverTimeProcess':
                    urlDetail = '/api/SZOverTimeProcess/GetProcByPIID/?piid=';
                    break;
                case 'OverTimeProcess':
                    urlDetail = '/api/SZOverTimeProcess/GetProcByPIID/?piid=';
                    break;
                case 'HZOverTimeProcess':
                    urlDetail = '/api/HZOverTimeProcess/GetProcByPIID/?piid=';
                    break;
                case 'SHOverTimeProcess':
                    urlDetail = '/api/SHOverTimeProcess/GetProcByPIID/?piid=';
                    break;
                case 'CDOverTimeProcess':
                    urlDetail = '/api/CDOverTimeProcess/GetProcByPIID/?piid=';
                    break;

                case 'SZAttendanceProcess':
                    urlDetail = '/api/SZAttendanceProcess/GetProcByPIID/?piid=';
                    break;
                case 'SHAttendanceCorrectionProcess':
                    urlDetail = '/api/SHAttendanceCorrectionProcess/GetProcByPIID/?piid=';
                    break;
                case 'NBAttendanceProcess':
                    urlDetail = '/api/SZAttendanceProcess/GetProcByPIID/?piid=';
                    break;
                case 'HZAttendanceProcess':
                    urlDetail = '/api/HZAttendanceProcess/GetProcByPIID/?piid=';
                    break;
                case 'CDAttendanceProcess':
                    urlDetail = '/api/SZAttendanceProcess/GetProcByPIID/?piid=';
                    break;

                case 'SHTravelApplication':
                    urlDetail = '/api/SHTravelApplication/GetProcByPIID/?piid=';

                    break;
                case 'HZEmployeeTravel':
                    urlDetail = '/api/HZEmployeeTravel/GetProcByPIID/?piid=';
                    break;
                case 'CD_Travel_Application':
                    urlDetail = '/api/CD_Travel_Application/GetProcByPIID/?piid=';
                    break;
                case 'SZEmployeeTravel':
                    urlDetail = '/api/SZEmployeeTravel/GetProcByPIID/?piid=';
                    break;
                case 'CancelTravelProcess':
                    urlDetail = '/api/CancelTravelProcess/GetProcByPIID/?piid=';
                    break;
                case 'AttendanceAgainst':
                    urlDetail = '/api/AttendanceAgainst/GetProcByPIID/?piid=';
                    break;
                case 'CancelLeaveProcess':
                    urlDetail = '/api/CancelLeaveProcess/GetProcByPIID/?piid=';
                    break;

            }
            if (urlDetail != '') {
                var urlArg = urlDetail + piid;
                ProDetailByPIID.queryDetail(urlArg).success(function (custs) {
                    $scope.processListDetail = custs;
                    // 需处理的work item(避免后退重复操作)

                    $scope.IsShowControl = false;
                     

                    $scope.deliberatelyTrustDangerousSnippet = function () {
                        return $sce.trustAsHtml($scope.processListDetail.Specify);
                    };

                    initTravelData(custs);
                    getProcessAttach($scope.processListDetail.ProcInsID);
                    getDetailTable($scope.processListDetail.ProcInsID, DefName);

                    getProcessStatus($scope.processListDetail.ProcInsID, DefName);

                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }

        };

        function initTravelData(processListDetail) {

            $scope.IsCard = processListDetail.IsCard == 'T' ? true : false;
            $scope.IsDoor = processListDetail.IsCard == 'T' ? true : false;

            var sites = processListDetail.Site;
            if (sites == null || sites == '') {
                $scope.IsCard = false;
                $scope.IsDoor = false;
                $scope.IsSZ = false;
                $scope.IsSH = false;
                $scope.IsCD = false;
                $scope.IsNB = false;
                $scope.IsHZPIC = false;
                $scope.IsBJMIE = false;
            }
            else {

                $scope.IsSZ = sites.indexOf('01') != -1 ? true : false;
                $scope.IsSH = sites.indexOf('02') != -1 ? true : false;
                $scope.IsCD = sites.indexOf('03') != -1 ? true : false;
                $scope.IsNB = sites.indexOf('04') != -1 ? true : false;
                $scope.IsHZPIC = sites.indexOf('05') != -1 ? true : false;
                $scope.IsBJMIE = sites.indexOf('06') != -1 ? true : false;
            }

        

        }
        function getProcessAttach(piid, DefName) {
            $scope.isLoadingToast = true;

            ProDetailByPIID.queryDetailAttach(piid).success(function (custs) {
                if (custs.length > 0) {
                    $scope.processListDetailAttachment = custs;
                    $scope.HasAttachment = true;
                }
                $scope.isLoadingToast = false;

            }).error(function (error) {
                $scope.status = 'Unable to load customer data: ' + error.message;
                $scope.isLoadingToast = false;

            });

        };

        function getDetailTable(piid, DefName) {
            $scope.isLoadingToast = true;

            var urlDetailTable = '';
            var urlDetailPlace = '';
            var urlDetailAccout = '';
            var urlDetailProject = '';

            switch (DefName) {
                case 'SZLeaveRequest':
                    urlDetailTable = '/api/SZLeaveRequest/GetDetailByPIID/?piid=';
                    break;
                case 'NBLeaveRequest':
                    urlDetailTable = '/api/SZLeaveRequest/GetDetailByPIID/?piid=';
                    break;
                case 'HZLeaveProcess':
                    urlDetailTable = '/api/HZLeaveProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SHLeaveProcess':
                    urlDetailTable = '/api/SHLeaveProcess/GetDetailByPIID/?piid=';
                    break;
                case 'CDLeaveProcess':
                    urlDetailTable = '/api/CDLeaveProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SZOverTimeProcess':
                    urlDetailTable = '/api/SZOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'OverTimeProcess':
                    urlDetailTable = '/api/SZOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'HZOverTimeProcess':
                    urlDetailTable = '/api/HZOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SHOverTimeProcess':
                    urlDetailTable = '/api/SHOverTimeProcess/GetDetailByPIID/?piid=';
                    break;
                case 'CDOverTimeProcess':
                    urlDetailTable = '/api/CDOverTimeProcess/GetDetailByPIID/?piid=';
                    break;

                case 'SZAttendanceProcess':
                    urlDetailTable = '/api/SZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;
                case 'SHAttendanceCorrectionProcess':
                    urlDetailTable = '/api/SHAttendanceCorrectionProcess/GetDetailByPIID/?piid=';
                    break;
                case 'NBAttendanceProcess':
                    urlDetailTable = '/api/SZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;
                case 'HZAttendanceProcess':
                    urlDetailTable = '/api/HZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;
                case 'CDAttendanceProcess':
                    urlDetailTable = '/api/SZAttendanceProcess/GetDetailByPIID/?piid=';
                    break;


                case 'SHTravelApplication':

                    urlDetailPlace = '/api/SHTravelApplication/GetPlaceByPIID/?piid=';
                    urlDetailAccout = '/api/SHTravelApplication/GetAccoutByPIID/?piid=';
                    urlDetailProject = '/api/SHTravelApplication/GetProjectByPIID/?piid=';

                    break;
                case 'HZEmployeeTravel':
                    urlDetailTable = '/api/HZEmployeeTravel/GetDetailByPIID/?piid=';
                    break;
                case 'CD_Travel_Application':

                    urlDetailPlace = '/api/CD_Travel_Application/GetPlaceByPIID/?piid=';
                    urlDetailAccout = '/api/CD_Travel_Application/GetAccoutByPIID/?piid=';
                    urlDetailProject = '/api/CD_Travel_Application/GetProjectByPIID/?piid=';
                    break;

                case 'CancelLeaveProcess':
                    urlDetailTable = '/api/CancelLeaveProcess/GetDetailByPIID/?piid=';
                    break;

            }
            if (urlDetailTable != '') {
                var urlArg = urlDetailTable + piid;
                ProDetailByPIID.queryDetailTable(urlArg).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTable = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }
            if (urlDetailPlace != '') {
                var urlArgurlDetailPlace = urlDetailPlace + piid;
                ProDetailByPIID.queryDetailTable(urlArgurlDetailPlace).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTablePlace = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }
            if (urlDetailAccout != '') {
                var urlArgurlurlDetailAccout = urlDetailAccout + piid;
                ProDetailByPIID.queryDetailTable(urlArgurlurlDetailAccout).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTableAccout = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }
            if (urlDetailProject != '') {
                var urlArgurlurlDetailProject = urlDetailProject + piid;
                ProDetailByPIID.queryDetailTable(urlArgurlurlDetailProject).success(function (custs) {
                    if (custs.length > 0) {
                        $scope.processListDetailTableProject = custs;
                    }
                    $scope.isLoadingToast = false;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;
                    $scope.isLoadingToast = false;

                });
            }
            else {
                $scope.isLoadingToast = false;

            }

        };




        $scope.OpenAttach = function (AttachID) {

            var url = "/Download/AttachID/" + AttachID;
            $location.path(url);
        };

        $scope.CloseAttach = function () {
            var tip = document.getElementById('weixin-tip');
            tip.style.display = 'none';
        };


        function getProcessStatus(piid, defName) {
            $scope.isLoadingToast = true;

            ProcessStatus.queryDetail(piid, defName).success(function (custs) {

                $scope.processStatusDetail = custs;
                console.log(custs);
                $scope.isLoadingToast = false;

            }).error(function (error) {
                $scope.status = 'Unable to load customer data: ' + error.message;
                $scope.isLoadingToast = false;


            });
        }


    }
]);

wxControllers.controller('ProcessStatusCtrl', ['$scope', '$routeParams', 'ProcessStatus', 'ProcessListDetail', 'OAuth2', 'usSpinnerService',
function ($scope, $routeParams, ProcessStatus, ProcessListDetail, OAuth2, usSpinnerService) {
    var piid = $routeParams.PIID;
    var wid = $routeParams.WID;


    $scope.processStatusDetail = {};
    $scope.status;
    getProcessStatus(piid);

    function getProcessStatus(piid) {
        ProcessStatus.queryDetail(piid).success(function (custs) {
            $scope.processStatusDetail = custs;
            console.log(custs);

        }).error(function (error) {
            $scope.status = 'Unable to load customer data: ' + error.message;

        });
    }

    $scope.processListDetail = {};
    getProcess(wid);
    function getProcess(wid) {
        ProcessListDetail.queryDetail(wid).success(function (custs) {
            $scope.processListDetail = custs;
        }).error(function (error) {
            $scope.status = 'Unable to load customer data: ' + error.message;
        });
    }
}
]);

wxControllers.controller('ProcessResultCtrl', ['$scope', '$routeParams', 'ProcessResult', '$location',
    function ($scope, $routeParams, ProcessResult, $location) {

        $scope.processResultDetail = {};
        getProcessResult();
        function getProcessResult() {

            $scope.processResultDetail.WorkFlowNumber = $routeParams.workFlowNumber;
            var date = new Date();
            $scope.processResultDetail.Date = date;       //获取日期与时间 
            $scope.processResultDetail.Action = $routeParams.action;
        }

        $scope.GoToPendingList = function () {
            var url = "/PendingList/";
            $location.path(url);
        }
    }
]);

wxControllers.controller('ReviewedListCtrl', ['$scope', '$location', '$routeParams', 'ReviewedList', 'OAuth2', 'usSpinnerService',
    function ($scope, $location, $routeParams, ReviewedList, OAuth2, usSpinnerService) {

        var userIdVal = config.application.testuser;

        if (config.application.mode == config.constants.MODE.LIVE) {
            var token = OAuth2.getToken();//get userId as token from cookie.
            var currentUrl = config.application.getAppSettings(config.constants.APP.EP)['ittReviewedList'];//config

            if (token == null || token == undefined || token.UserId == undefined) { // if token not exist, then transfer to Oauth2 page to  get userId.
                var state = $routeParams.state;
                state += "@@" + currentUrl;//add redirect url for Auth2
                OAuth2.auth(state);
            }
            //else if (token != undefined) {
            //    var isAdAuth = OAuth2.isAdAuth(); // determine need AD Authentication or not;

            //    if (isAdAuth == undefined || isAdAuth != true) {
            //        OAuth2.adAuth(token, currentUrl);
            //    }//needed Ad Anthentication, transfer to ADAuth.html page to Anthenticate.   
            //}
            userIdVal = token.UserId;
        }
        $scope.keyWord = '';
        $scope.pageSize = config.application.pagesize;
        $scope.status;
        $scope.ReviewedListData = [];
        $scope.pageCount = $scope.ReviewedListData == null ? 0 : $scope.ReviewedListData.length;

        var loaded = false; //关键变量，用于判断页面初始化是否完成，否则不去执行滚动事件，避免两次加载
        $scope.isLoadingToast = false;

        getReviewedList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);

        function getReviewedList(pageSize, pageCount, userIdVal, keyWord) {
            $scope.isLoadingToast = true;

            ReviewedList.queryGetReviewedTaskList(pageSize, pageCount, userIdVal, keyWord).success(function (custs) {

                if (custs.length > 0) {
                    for (var i = 0; i < custs.length; i++) {
                        $scope.ReviewedListData.push(custs[i]);
                    }
                }
                else {
                    console.log('没有更多数据');
                }
                $scope.isLoadingToast = false;
                loaded = true;
            }).error(function (error) {
                $scope.isLoadingToast = false;

                $scope.status = 'Unable to load customer data: ' + error.message;

            });
        }

        var setPageCount = function () {
            $scope.pageCount = $scope.ReviewedListData == null ? 0 : $scope.ReviewedListData.length;
        };


        $scope.showDetail = function (index, proName) {
            var model = $scope.ReviewedListData[index];
            var url = '';
            switch (proName) {
                case 'InfoTransferProcess':
                    url = "/DetailInformationTransfer/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'SZLeaveRequest':
                    url = "/DetailLeaveRequest/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'NBLeaveRequest':
                    url = "/DetailLeaveRequest/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'HZLeaveProcess':
                    url = "/DetailLeaveRequest/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'SHLeaveProcess':
                    url = "/DetailLeaveRequest/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'CDLeaveProcess':
                    url = "/DetailLeaveRequest/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'SZOverTimeProcess':
                    url = "/DetailOverTime/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'OverTimeProcess':
                    url = "/DetailOverTime/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'HZOverTimeProcess':
                    url = "/DetailOverTime/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'SHOverTimeProcess':
                    url = "/DetailOverTime/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'CDOverTimeProcess':
                    url = "/DetailOverTime/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;

                case 'SZAttendanceProcess':
                    url = "/DetailAttendCorret/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'SHAttendanceCorrectionProcess':
                    url = "/DetailAttendCorret/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'NBAttendanceProcess':
                    url = "/DetailAttendCorret/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'HZAttendanceProcess':
                    url = "/DetailAttendCorret/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'CDAttendanceProcess':
                    url = "/DetailAttendCorret/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;



                case 'SHTravelApplication':
                    url = "/DetailTravelSH/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'HZEmployeeTravel':
                    url = "/DetailTravel/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'CD_Travel_Application':
                    url = "/DetailTravelCD/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'SZEmployeeTravel':
                    url = "/DetailTravel/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;


                case 'CancelTravelProcess':
                    url = "/DetailCancelTravel/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'AttendanceAgainst':
                    url = "/DetailAttendanceAgainst/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;
                case 'CancelLeaveProcess':
                    url = "/DetailCancelLeave/PIID/" + model.PROC_INST_ID + "/DefName/" + proName;
                    break;


            }
            if (url != '') {
                $location.path(url);
            }
        };



        $scope.myPagingFunction = function () {
            if (loaded) {

                setPageCount();
                getReviewedList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
            }
        };

        $scope.loadMore = function () {

            setPageCount();
            getReviewedList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };

        $scope.txtKeyUp = function () {
            /* global alert: false; */
            $scope.pageCount = 0;
            $scope.ReviewedListData = [];
            getReviewedList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };

        $scope.search = function () {
            //usSpinnerService.spin('spinner-1');
            $scope.pageCount = 0;
            $scope.ReviewedListData = [];
            getReviewedList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };
        $scope.clear = function () {
            $scope.keyWord = '';
            //usSpinnerService.spin('spinner-1');
            $scope.pageCount = 0;
            $scope.ListData = [];
            getReviewedList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };

    }
]);

wxControllers.controller('PendingListCtrl', ['$scope', '$location', '$routeParams', 'PendingList', 'OAuth2', 
    function ($scope, $location, $routeParams, PendingList, OAuth2) {
        var userIdVal = config.application.testuser;

        if (config.application.mode == config.constants.MODE.LIVE) {
            var token = OAuth2.getToken();//get userId as token from cookie.
            var currentUrl = config.application.getAppSettings(config.constants.APP.EP)['ittPendingList'];//config

            if (token == null || token == undefined || token.UserId == undefined) { // if token not exist, then transfer to Oauth2 page to  get userId.

                var state = $routeParams.state;
                state += "@@" + currentUrl;//add redirect url for Auth2
                OAuth2.auth(state);
            }
            //else if (token != undefined) {

            //    var isAdAuth = OAuth2.isAdAuth(); // determine need AD Authentication or not;

            //    if (isAdAuth == undefined || isAdAuth != true) {
            //        OAuth2.adAuth(token, currentUrl);
            //    }
            //}
            userIdVal = token.UserId;
        }
        $scope.keyWord = '';
        $scope.pageSize = config.application.pagesize;

        $scope.status;
        $scope.ListData = [];
        $scope.pageCount = $scope.ListData == null ? 0 : $scope.ListData.length;
        var loaded = false;
        $scope.isLoadingToast = false;

        getList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        function getList(pageSize, pageCount, userIdVal, keyWord) {
            $scope.isLoadingToast = true;

            PendingList.queryPendingList(pageSize, pageCount, userIdVal, keyWord).success(function (custs) {
                if (custs.length > 0) {
                    for (var i = 0; i < custs.length; i++) {
                        $scope.ListData.push(custs[i]);
                    }
                }
                else {
                    console.log('没有更多数据');
                }

                loaded = true;
                $scope.isLoadingToast = false;

            }).error(function (error) {
                $scope.status = 'Unable to load customer data: ' + error.message;
                $scope.isLoadingToast = false;
            });
        };

        var setPageCount = function () {
            $scope.pageCount = $scope.ListData == null ? 0 : $scope.ListData.length;
        };

        $scope.showDetail = function (index, proName) {
            var model = $scope.ListData[index];
            var url = '';
            switch (proName) {

                case 'InfoTransferProcess':
                    url = "/DetailInformationTransfer/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'SZLeaveRequest':
                    url = "/DetailLeaveRequest/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'NBLeaveRequest':
                    url = "/DetailLeaveRequest/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'HZLeaveProcess':
                    url = "/DetailLeaveRequest/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'SHLeaveProcess':
                    url = "/DetailLeaveRequest/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'CDLeaveProcess':
                    url = "/DetailLeaveRequest/WID/" + model.WorkItemID + "/DefName/" + proName;
                case 'SZOverTimeProcess':
                    url = "/DetailOverTime/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'OverTimeProcess':
                    url = "/DetailOverTime/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'HZOverTimeProcess':
                    url = "/DetailOverTime/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'SHOverTimeProcess':
                    url = "/DetailOverTime/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'CDOverTimeProcess':
                    url = "/DetailOverTime/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;

                case 'SZAttendanceProcess':
                    url = "/DetailAttendCorret/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'SHAttendanceCorrectionProcess':
                    url = "/DetailAttendCorret/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'NBAttendanceProcess':
                    url = "/DetailAttendCorret/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'HZAttendanceProcess':
                    url = "/DetailAttendCorret/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'CDAttendanceProcess':
                    url = "/DetailAttendCorret/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;


                case 'SHTravelApplication':
                    url = "/DetailTravelSH/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'HZEmployeeTravel':
                    url = "/DetailTravel/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'CD_Travel_Application':
                    url = "/DetailTravelCD/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'SZEmployeeTravel':
                    url = "/DetailTravel/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'CancelTravelProcess':
                    url = "/DetailCancelTravel/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'AttendanceAgainst':
                    url = "/DetailAttendanceAgainst/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;
                case 'CancelLeaveProcess':
                    url = "/DetailCancelLeave/WID/" + model.WorkItemID + "/DefName/" + proName;
                    break;


            }
            if (url != '') {

                $location.path(url);
            }
        };

        $scope.myPagingFunction = function () {
            if (loaded) {
                //usSpinnerService.spin('spinner-1');
                setPageCount();
                getList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
            }
        };
        $scope.loadMore = function () {

            setPageCount();
            getList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };
        $scope.txtKeyUp = function () {
            /* global alert: false; */
            $scope.pageCount = 0;
            $scope.ListData = [];
            getList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };
        $scope.search = function () {
            /* global alert: false; */

            $scope.pageCount = 0;
            $scope.ListData = [];
            getList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };
        $scope.clear = function () {
            $scope.keyWord = '';

            $scope.pageCount = 0;
            $scope.ListData = [];
            getList($scope.pageSize, $scope.pageCount, userIdVal, $scope.keyWord);
        };

    }
]);
//Test:scroll
wxControllers.controller('InfCtrl', ['$scope', '$location', '$routeParams', 'ReviewedList', 'ngProgress', 'usSpinnerService',
    function ($scope, $location, $routeParams, ReviewedList, ngProgress, usSpinnerService) {

        var isRefresh = true;
        $scope.pageSize = 10;
        $scope.status;
        $scope.ReviewedListData = [];
        $scope.pageCount = $scope.ReviewedListData == null ? 0 : $scope.ReviewedListData.length;

        function getReviewedList(pageSize, pageCount, userIdVal) {
            ReviewedList.queryGetReviewedTaskList(pageSize, pageCount, userIdVal).success(function (custs) {
                if (custs.length > 0) {

                    for (var i = 0; i < custs.length; i++) {
                        $scope.ReviewedListData.push(custs[i]);
                    }
                    $scope.currentList = $scope.Reviewed;
                }
                else {

                    console.log('没有更多数据');
                }
                ngProgress.complete();


            }).error(function (error) {
                $scope.status = 'Unable to load customer data: ' + error.message;


            });
        }

        var setPageCount = function () {
            $scope.pageCount = $scope.ReviewedListData == null ? 0 : $scope.ReviewedListData.length;
        }

        $scope.showDetail = function (index) {
            var model = $scope.ReviewedListData[index];
            var url = "/ProcessListDetail/WID/" + model.WorkItemID;
            $location.path(url);
        };

        $scope.myPagingFunction = function () {
            if (!isRefresh) {
                isRefresh = false;

                ngProgress.start();
                setPageCount();
                var userIdVal = '01503020';

                getReviewedList($scope.pageSize, $scope.pageCount, userIdVal);
            }
        };
    }
]);

wxControllers.controller('DownloadCtrl', ['$scope', '$routeParams', 'Download',
    function ($scope, $routeParams, Download) {
        $scope.isWeiXinClient = false;

        getInfo();
        function getInfo() {

            var is_weixin = (function () { return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1 })();
            $scope.isWeiXinClient = is_weixin;
            if (!is_weixin) {
                var AttachID = $routeParams.AttachID;
                Download.queryAttachPath(AttachID).success(function (url) {
                    var oldURL = window.document.referrer;

                    window.location.href = url;

                }).error(function (error) {
                    $scope.status = 'Unable to load customer data: ' + error.message;


                });
            }
        }
    }
]);
