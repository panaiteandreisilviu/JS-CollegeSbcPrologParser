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
    interpretedData : "",
    queryResult : []
};

// __________________ XML Parsing __________________

$(function(){
    var xmlDoc;
    getXmlDoc().done(function(data) {
        xmlDoc = data;
        interpretPrologData(xmlDoc);
        factsToJson(xmlDoc);
        rulesToJson(xmlDoc);
        extractFactsFromRules();
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

    function extractFactsFromRules(){
        prologData.rulesJson.forEach(function(rule){
            var resultParams = []; // array of objects like {X:'andrei', Y:'adrian', Z:'alina'}

            var firstItem = true;
            rule.if.forEach(function(ifItem){ // iterate trough all if items

                // match with facts with the same predicate
                prologData.factsJson.forEach(function(factItem){

                    if(factItem.predicate == ifItem.predicate && factItem.params.length == ifItem.params.length){

                        /*console.log(ifItem.predicate);
                        console.log(ifItem.params);
                        console.log(factItem.predicate);
                        console.log(factItem.params);
                        console.log(firstItem);
                        console.log('----');*/

                        if(firstItem){ // for the first if item get all facts that match
                            var resultParamObj = {};
                            factItem.params.forEach(function(factParam){
                                var index = factItem.params.indexOf(factParam);
                                var key = ifItem.params[index];
                                resultParamObj[key] = factParam;
                            });
                            resultParams.push(resultParamObj);
                        }

                        else{
                            console.log(ifItem.params);
                            console.log(factItem.predicate);
                            console.log(factItem.params);

                            resultParams.forEach(function(resItem){
                                console.log(resItem);
                            });
                            console.log('--------------');

                        }
                    }
                });
                firstItem = false;
            });
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
        scrollToBottom();
    });

    function appendHistoryItem(query){
        var $queryHistory = $('#queryHistory');
        var $historyItem = $('<div>').addClass('history-item').html(query);
        $queryHistory.append($historyItem);
    }


    function parseQuery(query){
        var regex = /([^\(]+)\(([^\(]+)\).?/g;
        var queryElements = [];
        while(match = regex.exec(query)){
            queryElements.push(match);
        }

        var processedQuery = [];
        for(var i = 0; i< queryElements.length; i++){
            var item = queryElements[i];
            item.shift();
            var queryItem = {};
            queryItem.predicate = item[0].trim();
            item[1] = item[1].split(',');
            queryItem.params = item[1].map(function(elem){
                return elem.trim();
            });
            processedQuery.push(queryItem);
        }
        return processedQuery;
    }

    function processQuery(queryElements){
        var resultFound = false; // MUST BE SET TRUE IF RESULT FOUND !

        var primaryElement = queryElements[0];
        var fixedVars = getFixedVars(primaryElement);
        var findableVars = getFindableVars(primaryElement);

        console.log(findableVars);
        console.log(fixedVars);
        //Go trough all facts (change to all facts + facts derived from rules)
        for(var i = 0; i < prologData.factsJson.length; i++){
            var jumpToNextItem = false;
            var databaseItem = prologData.factsJson[i];
            // Unification
            if(primaryElement.predicate == databaseItem.predicate && primaryElement.params.length == databaseItem.params.length){

                // Check FixedVars
                for(var fixedVar in fixedVars){
                    if (fixedVars.hasOwnProperty(fixedVar)) {
                        var fixedIndex = fixedVars[fixedVar].index;
                        console.log('fixedVarCheck, database: ' + databaseItem.params[fixedIndex] + ' | queryItem: ' + fixedVar);
                        if(databaseItem.params[fixedIndex] != fixedVar){
                            jumpToNextItem = true;
                            break;
                        }
                    }
                }

                console.log("jumpToNextItem: " + jumpToNextItem);

                // STOP if there are no findableVariables (must return true or false)
                var fixedVarCheckOK = !jumpToNextItem;

                console.log(i + ' ' + prologData.factsJson.length + ' ' + fixedVarCheckOK);
                if (Object.keys(findableVars).length == 0){
                    if(fixedVarCheckOK){
                        // Match found, return true
                        resultFound = true;
                        break;
                    }
                }


                //Jump to next prolog database item if fixed variables are not satisfied
                if(jumpToNextItem == true){
                    jumpToNextItem = false;
                    continue;
                }



                //Get findableVars values
                for(var findableVar in findableVars){
                    if (findableVars.hasOwnProperty(findableVar)) {
                        var findableIndex = findableVars[findableVar].index;
                        var foundItem = databaseItem.params[findableIndex];
                        console.log('findableVar: ' + findableVar + ' = ' + foundItem);
                        findableVars[findableVar].results.push(foundItem);
                    }
                }
            }
        }


        console.log(findableVars);
        // Output found result
        var result = "";
         for(var foundVar in findableVars){
             if(findableVars.hasOwnProperty(foundVar)){
                 resultFound = true;
                 findableVars[foundVar].results.forEach(function(item){
                     result += foundVar + ": " + item + "\n";
                 });
             }
         }

        // If NO result has been found output false
        if(!resultFound){
            prologData.queryResult.push("FALSE");
        } else{
            if(result == ""){
                prologData.queryResult.push("TRUE");
            } else{
                prologData.queryResult.push(result);
            }
        }
    }

    function findUnifiedFacts(queryItem){
        var foundFacts = [];
        console.log(prologData.factsJson);
        prologData.factsJson.forEach(function(item){
            var itemParams = item.params;
            if(queryItem.predicate == item.predicate && count(queryItem.params) == count(itemParams)){
                foundFacts.push(item);
            }
        });

        return foundFacts;
    }

    function getFixedVars(item){
        var result = {};
        for(var i = 0; i<item.params.length; i++){
            var firstLetter = item.params[i][0];
            if(firstLetter == '_'){
                continue;
            }
            if(firstLetter != firstLetter.toUpperCase()){
                result[item.params[i]] = {
                    'index': i,
                    'results':[]
                };
            }
        }
        return result;
    }

    function getFindableVars(item){
        var result = {};
        for(var i = 0; i<item.params.length; i++){
            var firstLetter = item.params[i][0];
            if(firstLetter == '_'){
                continue;
            }
            if(firstLetter == firstLetter.toUpperCase()){
                result[item.params[i]] = {
                    'index': i,
                    'results':[]
                };
            }
        }
        return result;
    }

    function scrollToBottom(){
        setTimeout(function(){
            var $queryHistory = $('#queryHistory');
            var scrollHeight = $queryHistory[0].scrollHeight;
            $queryHistory.scrollTop(scrollHeight);

            var $queryResult = $('#queryResult');
            scrollHeight = $queryResult[0].scrollHeight;
            $queryResult.scrollTop(scrollHeight);
        },0)
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

