//David Torroija


//this code is from a section that compare profiles
//there are a few DOM Manipulation this is thankfully to the knockout's magic and his correct separation of concerns
//we also used Deferred and promises to synchronize the ajax calls and callbacks and also to activaty busy indicators this create a great user experience, deferred is and incredible tool to decorate the callbacks with new functionality when you are inside of a inheritance
//I'm sending you the html code that is binded to this JS
//we encapsulate all the ajax calls in an object called 'dataservice'
//requireJS let us to bring JS files on demand(AMD), also applies the revealing module pattern, object specifiers, dependency injection and closure.
//to open several profiles at the time we implement a composite pattern 

define(['ko', 'toastr', 'dataservice', 'viewmodels/baseballcard'],
function (ko, toastr, dataservice, baseballcard) {

	function getVM(spec, privates) {
        
		privates = privates || {};
        privates.handleError = utils.handleError;
        spec = spec || {};
        spec.parent = spec.parent || {};
        privates.sourceProperty = spec.sourceProperty;
        var that = bbcSectionBase(spec, privates);

        that.ids = spec.ids || [];

        that.baseballCards = [];
        that.isLoading = ko.observable(false);
        that.bind = function (element) {
            that.isLoading(true);
            
            return that.loadData().then(function () {
                ko.applyBindings(that, $(element).get(0));
                that.educationLoaded(true);
                that.internationalExperienceLoaded(true);
                that.experienceLoaded(true);
                that.languagesLoaded(true);
                that.isLoading(false);                
                $('.comparerModules .accordion li:first').click();
            });
        };
        window.compare = that;

        that.loadData = function () {
            var callbackArray = [];
            for (i = 0; i < that.ids.length; i++) {
                var bbc = baseballcard.getVMCompare({ employeeId: that.ids[i] });
                that.baseballCards.push(bbc);
                callbackArray.push(bbc.loadPersonalInfo());                
            }
			//this when with apply is used to know when all the Sections are loaded and to desactivate "jquery.Activity"(loader)
			//this return a deferred so we can sync the calls to the services
            return $.when.apply($, callbackArray);
        };

		//implement composite pattern to load sections
        var composite = function (functionName, loaded, evnt) {
            
            var currentTarget = $(evnt.currentTarget);
            if (currentTarget.hasClass('active')) {
                $('.comparerModules .active').removeClass('active');
            }
            else {
                
                $('.comparerModules .active').removeClass('active');
                if (!loaded()) {
                    var functionArray = [];
                    loaded(false);
                    $.each(that.baseballCards, function (ix, el) {
                        var sel = '#compare' + ix + ' ' + currentTarget.attr('target');
                        
                        var elSelector = $(sel).attr('target');
                        functionArray.push(el[functionName](elSelector));
                    });
                    $.when.apply($, functionArray).done(function () {
                        loaded(true);
                        $(currentTarget.attr('target')).parent().addClass('active');                        
                    });
                }
                else {
                    console.log('hola cargue´');
                    $($(evnt.currentTarget).attr('target')).parent().addClass('active');
                }
            }
        };

        that.feedbackLoaded = ko.observable(false);
        that.educationLoaded = ko.observable(false);
        that.experienceLoaded = ko.observable(false);
        that.languagesLoaded = ko.observable(false);
        that.internationalExperienceLoaded = ko.observable(false);
        that.leadershipProgramsLoaded = ko.observable(false);
        that.successorsLoaded = ko.observable(false);
        that.notesLoaded = ko.observable(false);

        that.loadFeedback = function (vm, evnt) {
            composite('loadFeedback', that.feedbackLoaded, evnt);
        };
		
        that.loadEducation = function (vm, evnt) {
            composite('', that.educationLoaded, evnt);
        };

        that.loadExperience = function (vm, evnt) {
            composite('', that.experienceLoaded, evnt);
        };

        that.loadInternationalExperience = function (vm, evnt) {
            composite('', that.internationalExperienceLoaded, evnt);
        };
        that.loadLanguages = function (vm, evnt) {
            composite('', that.languagesLoaded, evnt);
        };

        that.loadLeadershipPrograms = function (vm, evnt) {
            composite('loadLeadershipPrograms', that.leadershipProgramsLoaded, evnt);
        };
        that.loadSuccessors = function (vm, evnt) {
            composite('loadSuccessors', that.successorsLoaded, evnt);
        };

        that.loadNotes = function (vm, evnt) {
            composite('loadNotes', that.notesLoaded, evnt);
        };
		//estas funciones que me cargan action items están modularizadas en otros js pero lo he traido 
		//a este js para que vean como usamos templates para inyectar dincamicamente componentes
		//"infuser" es el motor de template vos le ponés por ejemplo "template: pepe" y te busca un trozo de codigo con tag script
		// con ese ID dentro del html por ejemplo <script id="pepe" type="text/html">
		//si no lo encuentra en el html va y hace un request asincronico y se lo pide al servidor con la url q lo hallamos configurado
		//en este caso haria un request de ajax tipo  "http://localhost/views/templates/pepe" y lo trae lo inyecta en el html en donde
		//yo le indico mediante el "applyBindings" de Knockout
		that.actionItems = null;
        var toggleActionItems = function (viewmodel, evnt) {          
            if (!that.actionItems) {
                require(['viewmodels/actionItemsWall'], function (actionItems) {
                    console.log('wallid', that.Wall().WallId);

                    var vm = actionItems.getVM({ WallId: that.Wall().WallId });

                    ko.applyBindingsToNode($('#actionItems').get(0), { template: { name: 'ActionItems'} }, vm);
                    privates.selectVM(vm);

                    that.actionItems = vm;
                    //window.actioni = that.actionItems;
                    vm.loadData().then(function () { vm.isVisible(true); });
                });
            }
            else {
                if (that.Wall().WallId != that.actionItems.WallId) {
                    that.actionItems.WallId = that.Wall().WallId;
                    that.actionItems.loadData().then(function () { that.actionItems.isVisible(true); });
                }
                else {
                    if (!that.actionItems.isVisible()) {
                        privates.selectVM(that.actionItems);
                    } else {
                        privates.selectVM(null);
                        //that.actionItems.isVisible(false);
                    }
                }
            }

        };
		
        return that;
    }

    return {
        getViewModel: getVM
    };
});