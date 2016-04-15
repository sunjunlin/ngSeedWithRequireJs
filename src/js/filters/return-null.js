define(['filters/filters'],function(filters){
  'use strict';
  filters.filter('returnNull',function(){
    return function (input,threshold){
      return threshold ? input: '';
    };
  });
});
