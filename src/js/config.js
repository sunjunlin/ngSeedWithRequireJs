'use strict';

var config = {};

// All the constants definition.
(function(config){
    config.constants = config.constants || {};

    config.constants.MODE = {
        DEV:'DEV',
        TEST:'TEST',
        LIVE:'LIVE'
    };//Application Mode

    config.constants.APP = {
        EP:'EP',
        PLM:'PLM'
    };//all business app

    return config;
}(config||{}));

//The setting object definition.
(function(config){
    config.settings = config.settings || {};

    config.settings.getSettings = function (app) {
        if (app != undefined) {
           
            var appSettings = config.settings[app];
            if(appSettings == undefined){
                throw 'Could find the settings of ' + app + '.'
            }else{
                return appSettings;
            }
        }else{
            throw 'You need to specify the app name.'
        }
    };
    return config;
}(config||{}));

//EP Settings goes here
(function(config){
    config.settings = config.settings || {};
    var wxSiteURL = "http://weixinqy.tclcom.com";
    var wxAPPID = "4";

    var urlWID = wxSiteURL + "/MobilePage/index.html@/{URL}/WID/{WID}/DefName/{DefName}";
    var urlPIID = wxSiteURL + "/MobilePage/index.html@/{URL}/PIID/{PIID}/DefName/{DefName}";

  
    config.settings[config.constants.APP.EP] = {
        name: config.constants.APP.EP,
     
        InfoTransferProcessWID: urlWID.replace('{URL}', 'DetailInformationTransfer'),
        SZLeaveRequestWID: urlWID.replace('{URL}', 'DetailLeaveRequest'),
        NBLeaveRequestWID: urlWID.replace('{URL}', 'DetailLeaveRequest'),
        HZLeaveProcessWID: urlWID.replace('{URL}', 'DetailLeaveRequest'),
        SHLeaveProcessWID: urlWID.replace('{URL}', 'DetailLeaveRequest'),
        CDLeaveProcessWID: urlWID.replace('{URL}', 'DetailLeaveRequest'),

        SZOverTimeProcessWID: urlWID.replace('{URL}', 'DetailOverTime'),
        OverTimeProcessWID:   urlWID.replace('{URL}', 'DetailOverTime'),
        HZOverTimeProcessWID: urlWID.replace('{URL}', 'DetailOverTime'),
        SHOverTimeProcessWID: urlWID.replace('{URL}', 'DetailOverTime'),
        CDOverTimeProcessWID: urlWID.replace('{URL}', 'DetailOverTime'),

        SZAttendanceProcessWID: urlWID.replace('{URL}', 'DetailAttendCorret'),
        SHAttendanceCorrectionProcessWID: urlWID.replace('{URL}', 'DetailAttendCorret'),
        NBAttendanceProcessWID: urlWID.replace('{URL}', 'DetailAttendCorret'),
        HZAttendanceProcessWID: urlWID.replace('{URL}', 'DetailAttendCorret'),
        CDAttendanceProcessWID: urlWID.replace('{URL}', 'DetailAttendCorret'),
      
        SHTravelApplicationWID: urlWID.replace('{URL}', 'DetailTravelSH'),
        HZEmployeeTravelWID:   urlWID.replace('{URL}', 'DetailTravel'), 
        CD_Travel_ApplicationWID:  urlWID.replace('{URL}', 'DetailTravelCD'),
        SZEmployeeTravelWID: urlWID.replace('{URL}', 'DetailTravel'),
       
        CancelTravelProcessWID:   urlWID.replace('{URL}', 'DetailCancelTravel'),  
        AttendanceAgainstWID: urlWID.replace('{URL}', 'DetailAttendanceAgainst'),  
        CancelLeaveProcessWID: urlWID.replace('{URL}', 'DetailCancelLeave'),


        InfoTransferProcessPIID: urlPIID.replace('{URL}', 'DetailInformationTransfer'),
        SZLeaveRequestPIID: urlPIID.replace('{URL}', 'DetailLeaveRequest'),
        NBLeaveRequestPIID: urlPIID.replace('{URL}', 'DetailLeaveRequest'),
        HZLeaveProcessPIID: urlPIID.replace('{URL}', 'DetailLeaveRequest'),
        SHLeaveProcessPIID: urlPIID.replace('{URL}', 'DetailLeaveRequest'),
        CDLeaveProcessPIID: urlPIID.replace('{URL}', 'DetailLeaveRequest'),

        SZOverTimeProcessPIID: urlPIID.replace('{URL}', 'DetailOverTime'),
        OverTimeProcessPIID: urlPIID.replace('{URL}', 'DetailOverTime'),
        HZOverTimeProcessPIID: urlPIID.replace('{URL}', 'DetailOverTime'),
        SHOverTimeProcessPIID: urlPIID.replace('{URL}', 'DetailOverTime'),
        CDOverTimeProcessPIID: urlPIID.replace('{URL}', 'DetailOverTime'),

        SZAttendanceProcessPIID: urlPIID.replace('{URL}', 'DetailAttendCorret'),
        SHAttendanceCorrectionProcessPIID: urlPIID.replace('{URL}', 'DetailAttendCorret'),
        NBAttendanceProcessPIID: urlPIID.replace('{URL}', 'DetailAttendCorret'),
        HZAttendanceProcessPIID: urlPIID.replace('{URL}', 'DetailAttendCorret'),
        CDAttendanceProcessPIID: urlPIID.replace('{URL}', 'DetailAttendCorret'),

        SHTravelApplicationPIID: urlPIID.replace('{URL}', 'DetailTravelSH'),
        HZEmployeeTravelPIID: urlPIID.replace('{URL}', 'DetailTravel'),
        CD_Travel_ApplicationPIID: urlPIID.replace('{URL}', 'DetailTravelCD'),
        SZEmployeeTravelPIID: urlPIID.replace('{URL}', 'DetailTravel'),

        CancelTravelProcessPIID: urlPIID.replace('{URL}', 'DetailCancelTravel'),
        AttendanceAgainstPIID: urlPIID.replace('{URL}', 'DetailAttendanceAgainst'),
        CancelLeaveProcessPIID: urlPIID.replace('{URL}', 'DetailCancelLeave'),

        ittPendingList: wxSiteURL + "/MobilePage/@/PendingList/state/" + wxAPPID,
        ittReviewedList: wxSiteURL + '/MobilePage/@/ReviewedList/state/' + wxAPPID
    };

    return config;
}(config||{}));

//PLM Settings goes here
(function(config){
    config.settings = config.settings || {};

    config.settings[config.constants.APP.PLM] = {
        name:'PLM'
    };

    return config;
}(config||{}));


//All the application definition.
(function(config){
    config.application = config.application||{};

    var application = {
        testuser: '01503020',
        pagesize: '10',
        mode : config.constants.MODE.LIVE,//default value is test
        enableAlert:false,
        getUserApiUrl:'../api/WeiXinCorp/GetUser',
        adAuthUrl:'/MobilePage/ADAuth.html',
        wxTokenExpires:10,
        setMode :function(mode){
            this.mode = mode;
            this.init(mode);
        },
        sysSettings:{},
        init:function(mode){
            if(mode===undefined){
                mode = this.mode;
            }
            //this.sysSettings = config.settings.getSettings(mode);
        },
        getAppSettings:function(appName){
            return config.settings.getSettings(appName);
        }
    };

    config.application = application;
    return config;
}(config||{}));







