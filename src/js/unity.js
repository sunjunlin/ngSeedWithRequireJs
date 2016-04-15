/**
 * Created by jianping.liu on 2015/8/4.
 */

// all the wx js unity will be define in this module, including ui...
var wx = {};

(function(wx,window){
    var ui = {
        _alert: function (obj) {
            if (config.application.enableAlert) {
                window.alert(obj);
            }
        },
        _getParameterByName: function (name) {
            if (name != undefined) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            }
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }//get parameter from query string.
    }

    wx.ui = {
        alert:ui._alert,
        getParameterByName:ui._getParameterByName
    };

    return wx.ui;
}(wx||{},window));//wx.ui


