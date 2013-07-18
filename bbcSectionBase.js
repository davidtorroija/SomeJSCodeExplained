
//the big thing about this js is the Douglas CrockFord's "Functional inheritance" taked from the "GOOD PARTS" book, we used object specifier.
//the motivation of this object augmentation is for code re-use and is more intuitiva than the prototype inheritance also we don't use the "new" word because if you forget this your scope changes and app still working but in a bad way and this error is hard to track
//we use closures and the reveal module pattern for the privacy and encapsulation.
//we can separate this classes in multiples files but for this examples we used on the same js for easy reading.

define(['ko', 'toastr', 'dataservice', 'utils', 'viewmodels/editBase'],
function (ko, toastr, dataservice, utils, editBase) {
    //pre: spec must contain parent reference
    function bbcSectionBase(spec, privates) {
        privates = privates || {};

        privates.handleError = utils.handleError;

        spec = spec || {};

        var that = {};

        privates.parent = spec.parent;
        privates.repository = spec.repository;

        that.employeeId = 0;
        that.isLoading = ko.observable(false);
        that.isVisible = ko.observable(false);
        that.data = ko.observable();

        var loadData = function () {
            that.isLoading(true);
            return dataservice[privates.repository].Get(that.employeeId)
                .then(function (data) {
                    that.data(data);
                    that.isLoading(false);
                    //console.log('');
                });
        };
        that.loadData = loadData;

        return that;
    }
    function bbcEditSection(spec, privates) {
        privates = privates || {};
        privates.handleError = utils.handleError;
        spec = spec || {};

        var that = bbcSectionBase(spec, privates);
        that = editBase.injectEditProperties(that);

        return that;
    }
    function bbcExternalSection(spec, privates) {
        privates = privates || {};
        privates.handleError = utils.handleError;
        spec = spec || {};
        spec.parent = spec.parent || {};
        privates.sourceProperty = spec.sourceProperty;
        var that = bbcSectionBase(spec, privates);

        var loadData = function () {
            //console.log(privates.sourceProperty);
            if (spec.parent.Employee && spec.parent.Employee() && spec.parent.Employee()[privates.sourceProperty]) {
                that.data(spec.parent.Employee()[privates.sourceProperty]);
            }
            
            return $.Deferred(function (def) {
                def.resolve();
            }).promise();
        };
        that.loadData = loadData;


        return that;
    }
    return {
        getBase: bbcSectionBase,
        getEditBase: bbcEditSection,
        getExternalBase: bbcExternalSection
    };
});

