(function() {
  goog.provide('gn_inspire_editor');

  goog.require('gn');
  goog.require('inspire_contact_directive');
  goog.require('inspire_multilingual_text_directive');
  goog.require('inspire_get_shared_users_factory');
  goog.require('inspire_get_keywords_factory');
  goog.require('inspire_get_extents_factory');
  goog.require('inspire_date_picker_directive');
  goog.require('inspire_edit_delete_directive');

  goog.require('inspire_mock_full_metadata_factory');

  var module = angular.module('gn_inspire_editor',
    [ 'gn', 'inspire_contact_directive', 'inspire_multilingual_text_directive', 'inspire_metadata_factory',
      'inspire_get_shared_users_factory', 'inspire_get_keywords_factory', 'inspire_get_extents_factory',
      'inspire_date_picker_directive', 'inspire_edit_delete_directive']);

  // Define the translation files to load
  module.constant('$LOCALES', ['core', 'editor', 'inspire']);

  module.config(['$translateProvider', '$LOCALES',
    function($translateProvider, $LOCALES) {
      $translateProvider.useLoader('localeLoader', {
        locales: $LOCALES,
        prefix: '../../catalog/locales/',
        suffix: '.json'
      });

      var lang = location.href.split('/')[5].substring(0, 2) || 'en';
      $translateProvider.preferredLanguage(lang);
      moment.lang(lang);
    }]);

  module.controller('GnInspireController', [
    '$scope', 'inspireMetadataLoader', 'inspireGetSharedUsersFactory', '$translate',
    function($scope, inspireMetadataLoader, inspireGetSharedUsersFactory, $translate) {
      window.onbeforeunload = function() {
        return $translate('beforeUnloadEditor');
      };
      $scope.languages = ['ger', 'fre', 'ita', 'eng'];

      var params = window.location.search;
      var mdId = params.substring(params.indexOf("id=") + 3);
      var indexOfAmp = mdId.indexOf('&');
      if (indexOfAmp > -1) {
        mdId = mdId.substring(0, indexOfAmp);
      }

      inspireMetadataLoader($scope.url, mdId).then(function (data) {
        $scope.data = data;
      });

      $scope.$watch("data.language", function (newVal, oldVal) {
        var langs =  $scope.data.otherLanguages;
        var i = langs.indexOf(oldVal);
        if (i > -1) {
          langs.splice(i, 1);
        }
        if (langs.indexOf(newVal) < 0) {
          langs.push(newVal);
        }
      });
      $scope.$watchCollection("data.otherLanguages", function() {
        var langs =  $scope.data.otherLanguages;
        langs.sort(function(a,b) {
          if (a == $scope.data.language) {
            return -1;
          }
          if (b == $scope.data.language) {
            return 1;
          }
          return $scope.languages.indexOf(a) - $scope.languages.indexOf(b);
        });

      });
      $scope.isOtherLanguage = function (lang) {
        var langs =  $scope.data.otherLanguages;
        var i = 0;
        for (i = 0; i < langs.length; i++) {
          if (lang === langs[i]) {
            return true;
          }
        }
      };
      $scope.toggleLanguage = function (lang) {
        var langs =  $scope.data.otherLanguages;
        if (lang !== $scope.data.language) {
          var i = langs.indexOf(lang);
          if (i > -1) {
            langs.splice(i, 1);
          } else {
            langs.push(lang);
          }
        }
      };

      $scope.editContact = function(title, contact) {
        $scope.contactUnderEdit = contact;
        $scope.contactUnderEdit.title = title;
        $scope.selectedSharedUser = {};
        var modal = $('#editContactModal');
        modal.modal('show');
      };
      $scope.deleteContact = function(model, contactToRemove) {
        var i = model.indexOf(contactToRemove);
        if (i > -1) {
          model.splice(i, 1);
        }
      }

  }]);


  module.controller('InspireKeywordController', [
    '$scope', 'inspireGetKeywordsFactory',
    function($scope, inspireGetKeywordsFactory) {
      $scope.editKeyword = function(keyword) {
        $scope.keywordUnderEdit = keyword;
        $scope.selectedKeyword = {};
        var modal = $('#editKeywordModal');
        modal.modal('show');
      };
      $scope.deleteKeyword = function(keyword) {
        var keywords = $scope.data.identification.descriptiveKeywords;
        keywords.splice(keywords.indexOf(keyword), 1);
      };

      $scope.keywords = {
        data: {},
        service: {}
      };
      inspireGetKeywordsFactory($scope.url, 'external.theme.inspire-theme').then (function (keywords) {
        $scope.keywords.data = keywords;
      });
      inspireGetKeywordsFactory($scope.url, 'external.theme.inspire-service-taxonomy').then (function (keywords) {
        $scope.keywords.service = keywords;
      });

      $scope.selectKeyword = function(keyword) {
        $scope.selectedKeyword = keyword;
      };

      $scope.linkToOtherKeyword = function() {
        var keyword = $scope.selectedKeyword;
        $scope.keywordUnderEdit.uri = keyword.uri;
        $scope.keywordUnderEdit.words = keyword.words;
        var modal = $('#editKeywordModal');
        modal.modal('hide');
      }
    }]);


  module.controller('InspireExtentController', [
    '$scope', 'inspireGetExtentsFactory',
    function($scope, inspireGetExtentsFactory) {

      $scope.extentImgSrc = function (width, extent) {
        return $scope.url + 'region.getmap.png?mapsrs=EPSG:21781&background=geocat&width=' + width + '&id=' + extent.geom;
      };
      $scope.editExtent = function(extent) {
        $scope.extentUnderEdit = extent;
        $scope.selectedExtent = {};
        var modal = $('#editExtentModal');
        modal.modal('show');
      };
      $scope.deleteExtent = function(extent) {
        var extents = $scope.data.identification.extents;
        extents.splice(extents.indexOf(extent), 1);
      };

      $scope.selectExtent = function (extent) {
        $scope.selectedExtent = extent;
      };

      $scope.searchExtents = function (query) {
        inspireGetExtentsFactory($scope.url, query).then (function (extents){
          $scope.extents = extents;
        });

        $scope.linkToOtherExtent = function () {
          $scope.extentUnderEdit.geom = $scope.selectedExtent.geom;
          $scope.extentUnderEdit.description = $scope.selectedExtent.description;
          var modal = $('#editExtentModal');
          modal.modal('hide');
        };
      }
    }]);

})();
