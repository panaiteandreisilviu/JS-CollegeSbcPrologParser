/**
 * Created by silviu on 12/12/16.
 */

// --------------- Constants and Vars ---------------
var FACTS = 'FACTS';
var RULES = 'RULES';
var $prologRules = $("#prologRules");
// --------------- Initial Data ---------------

var prologData = {
    facts:['regula1', 'regula2'],
    rules: [],
    interpretedData :""
};

// --------------- XML Parsing ---------------

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
        $facts.each(function(index, item){
            var factName = $(item).prop('tagName');
            console.log(factName);
            prologData.interpretedData += factName + '\n';
        });

        console.log(prologData.interpretedData);
    }


});

// --------------- Vue Components ---------------

var Table = {
    template : "#table-template",
    props: ["header","rows", "showIndex"]
};

var Panel = {
    template: '#panel-template',
    props: ["title","subtitle"]
};

// --------------- Vue JS ---------------

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

