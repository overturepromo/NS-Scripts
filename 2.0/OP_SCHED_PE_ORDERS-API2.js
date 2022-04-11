/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/record','N/log', 'N/search'], 

function(record, log, s) {

    function execute() {
    
        var search = s.load({
          type: record.Type.SALES_ORDER,
          id: 'customsearch4813'
        });

        var resultSet = search.run();
        var results = resultSet.getRange({start: 0, end: 1000});
        
        for (var i = 0; i < results.length; i++) {

            try {
                
                var recID = results[i].getValue({
                    name: "internalid",
                    join: "CUSTBODY_PROD_EMBROIDERY_RECORD",
                    summary: "GROUP",
                    label: "PE Internal ID"
                });

                record.submitFields({
                    type: 'customrecordproduction_embroidery',
                    id: recID,
                    values: {
                        'custrecordemb_production_status': 18
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });

                log.debug(recID + ' successfully updated');
            } catch (e) {
                log.error({
                    title: e.code,
                    details: e.message
                });
            }
        }

    }
    return {
      execute: execute
    };
  });


//   require(['N/search'], function(search) {
//     function loadAndRunSearch() {
//         var mySearch = search.load({
//             id: 'customsearch_my_so_search'
//         });

//         mySearch.run().each(function(result) {
//             var entity = result.getValue({
//                 name: 'entity'
//             });
//             var subsidiary = result.getValue({
//                 name: 'subsidiary'
//             });

//             return true;
//         });
//     }

//     loadAndRunSearch();
// });


//execute(); <-- replace