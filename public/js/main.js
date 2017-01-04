/**
 * Created by silviu on 12/12/16.
 */

// __________________ Constants and Vars __________________

var FACTS = 'FACTS';
var RULES = 'RULES';

// __________________ Initial Data __________________

var prologData = {
    facts:[],
    rules: [],
    interpretedData :""
};

// __________________ XML Parsing __________________

$(function(){
    var xmlDoc;
    getXmlDoc().done(function(data) {
        xmlDoc = data;
        interpretPrologData(xmlDoc);
    });

    function getXmlDoc(){
        return $.ajax({
            'url': 'files/prolog.xml',
            'method': 'GET'
        });
    }

    function interpretPrologData(xmlDoc){
        getPrologRules(xmlDoc);
    }
    function getPrologRules(xmlDoc){
        var $facts = $(xmlDoc).find(FACTS).children();
        $facts.each(function(index, fact){

            var factName = $(fact).prop('tagName');
            factName = factName.capitalize();

            var factParams = [];
            $(fact).children().each(function(indexTwo, item){
                var factParam = $(item).text();
                factParams.push(factParam);
            });
            factParams = factParams.join(', ');
            var interpretedFact = factName + '(' + factParams + ')' + '.';

            prologData.interpretedData += interpretedFact + '\n';
        });
    }
});

// __________________ Vue Components __________________



var Table = {
    template : "#table-template",
    props: ["header","rows", "showIndex"]
};

var Panel = {
    template: '#panel-template',
    props: ["title","subtitle"]
};

// __________________ Vue JS __________________

var vue = new Vue({
    el: '#app',

    data:{
        prologData: prologData
    },

    components:{
        'table-component': Table,
        'panel-component': Panel
    },

    methods: {
        onSubmit: function (vueEvent) {
            var $form = $(vueEvent.target);
            var submittedData = $form.serializeArray();
            submittedData = submittedData.reduce(function(obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});

            vue.itemsTable.rows.push(submittedData);
            $form.trigger('reset');
        },
        deleteRow: function(param1,param2,param3){
            console.log(param1);
            console.log(param2);
            console.log(param3);
        },
        editRow: function(param1,param2,param3){
            console.log(param1);
            console.log(param2);
            console.log(param3);
        }
    }
});


// __________________ MISC __________________
String.prototype.capitalize = function(){
    return this.charAt(0).toUpperCase()  + this.slice(1).toLowerCase();
};

