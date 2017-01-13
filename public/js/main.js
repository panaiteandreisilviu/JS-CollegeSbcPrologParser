/**
 * Created by silviu on 12/12/16.
 */

// __________________ Constants and Vars __________________

var FACTS = 'Facts';
var RULES = 'Rule';

// __________________ Initial Data __________________

var prologData = {
    facts:[],
    rules: [],
    factsJson:[],
    rulesJson: [],
    interpretedData :""
};

// __________________ XML Parsing __________________

$(function(){
    var xmlDoc;
    getXmlDoc().done(function(data) {
        xmlDoc = data;
        interpretPrologData(xmlDoc);
        factsToJson(xmlDoc);
        rulesToJson(xmlDoc);
    });

    function getXmlDoc(){
        return $.ajax({
            'url': 'files/prolog.xml',
            'method': 'GET'
        });
    }

    function interpretPrologData(xmlDoc){
        getPrologFacts(xmlDoc);
        getPrologRules(xmlDoc);
    }

    function getPrologFacts(xmlDoc){
        var $facts = $(xmlDoc).find(FACTS).children();
        $facts.each(function(index, fact){

            var factName = $(fact).prop('tagName');
            
            var factParams = [];
            $(fact).children().each(function(indexTwo, item){
                var factParam = $(item).text();
                factParams.push(factParam);
            });
            factParams = factParams.join(', ');
            var interpretedFact = factName + '(' + factParams + ')' + '.';

            prologData.interpretedData += interpretedFact + '\n';
        });
        prologData.interpretedData += '\n';
    }

    function getPrologRules(xmlDoc){
        var $rules = $(xmlDoc).find(RULES);
        $rules.each(function(index, item){
            var thenParsedData = getPredicateAndVars($(item).find('then'));
            thenParsedData += ':- \n';
            var ifParsedData = getPredicateAndVars($(item).find('if'));
            var ifAndParsedArray = [ifParsedData];
            $(item).find('and').each(function(indexTwo,andItem){
                ifAndParsedArray.push(getPredicateAndVars($(andItem)));
            });
            var ifAndParsedData = ifAndParsedArray.join(', \n');
            prologData.interpretedData += thenParsedData + ifAndParsedData + '.' + '\n\n';
        });
    }

    function getPredicateAndVars(item){
        var predicate = $(item).find('predicate').text();
        var variables = $(item).find('variable');
        var varsArray = [];
        variables.each(function(index,item){
            varsArray.push($(item).text())
        });
        return predicate + '(' + varsArray.join(', ') + ')';
    }


    // __________________ XML TO JSON __________________

    function factsToJson(xmlDoc){
        var $facts = $(xmlDoc).find(FACTS).children();
        $facts.each(function(index, fact) {
            var jsonFact = {};
            jsonFact.predicate = $(fact).prop('tagName');
            jsonFact.params = [];
            $(fact).children().each(function(indexTwo, item){
                jsonFact.params.push($(item).text());
            });
            prologData.factsJson.push(jsonFact);
        });
    }


    function rulesToJson(xmlDoc){
        var $rules = $(xmlDoc).find(RULES);
        $rules.each(function(index, item){

            var then = $(item).find('then').eq(0);
            var jsonRule = getPredicateAndVariablesJSON(then);

            jsonRule.if = [];
            var ifRule = $(item).find('if').eq(0);
            jsonRule.if.push(getPredicateAndVariablesJSON(ifRule));

            var andRules = $(item).find('and');
            andRules.each(function(indexTwo, andRule){
                jsonRule.if.push(getPredicateAndVariablesJSON($(andRule)));
            });
            prologData.rulesJson.push(jsonRule);
        });
    }

    function getPredicateAndVariablesJSON(item){
        var returnObject = {};
        returnObject.predicate = $(item).find('predicate').text();

        var variables = $(item).find('variable');
        returnObject.params = [];
        variables.each(function(index,variable){
            returnObject.params.push($(variable).text());
        });

        return returnObject;
    }

// __________________ QUERY PARSING__________________

    $("#run").on('click',function(){
        var $query = $('#query');
        var prologQuery = $query.val();
        appendHistoryItem(prologQuery);
        var queryElements = parseQuery(prologQuery);
        processQuery(queryElements);

    });

    function appendHistoryItem(query){
        var $queryHistory = $('#queryHistory');
        var $historyItem = $('<div>').addClass('history-item').html(query);
        $queryHistory.append($historyItem);
        var scrollHeight = $queryHistory[0].scrollHeight;
        $queryHistory.scrollTop(scrollHeight);
    }


    function parseQuery(query){
        var regex = /([^\(]+)\(([^\(]+)\).?/g;
        var queryElements = [];
        while(match = regex.exec(query)){
            queryElements.push(match);
        }
        var processedQuery = [];
        queryElements.forEach(function(item){
            item.shift();
            var queryItem = {};
            queryItem.predicate = item[0].trim();
            item[1] = item[1].split(',');
            queryItem.params = item[1].map(function(elem){
                return elem.trim();
            });
            processedQuery.push(queryItem);
        });
        return processedQuery;
    }

    function processQuery(queryElements){
        var unknowns = [];
        queryElements.forEach(function(queryItem){
            console.log(queryItem);
            var unifiedFacts = findUnifiedFacts(queryItem);
            console.log(unifiedFacts);
        });
    }

    function findUnifiedFacts(queryItem){
        var foundFacts = [];
        prologData.factsJson.forEach(function(item){
            if(queryItem.predicate == item.predicate && count(queryItem.params) == count(item.params)){
                foundFacts.push(item);
            }
        });

        return foundFacts;
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

