/*
 *Author: Jacob Goodall
 *Date: 09/22/2021
 *Description: If a PE or PS record result shows up on one of the below searches, change the Production Status from ‘Pending Goods’ on PE or PS Records to ‘Goods Partially Received’
 */

function checkBox() {

    //PE Orders Created from SO Saved Search
    var results = nlapiSearchRecord('salesorder', 'customsearch4813');

    if (results) {

        var checkGovernance = function () {

            var governanceThreshold = 500;
            var context = nlapiGetContext();

            if (context.getRemainingUsage() < governanceThreshold) {

                try {

                    var script = nlapiScheduleScript('customscript1764');

                    if (script == 'QUEUED') {
                        nlapiLogExecution('ERROR', 'Re-scheduling due to governance', 'Successful re-schedule.');
                        return true;
                    } else {
                        nlapiLogExecution('ERROR', 'Problem re-scheduling.', e.code + ' : ' + e.message);
                        return true;
                    }

                } catch (e) {
                    nlapiLogExecution('ERROR', 'Problem re-scheduling.', e.code + ' : ' + e.message);
                    return true;
                }
            } else {
                return false;
            }

        };

        for (var i = 0; i < results.length; i++) {

            try {
                
                var recID = results[i].getValue("internalid","CUSTBODY_PROD_EMBROIDERY_RECORD","GROUP");

                nlapiSubmitField('customrecordproduction_embroidery', recID, 'custrecordemb_production_status', 18);
                nlapiLogExecution('AUDIT','SUCCESS',recID +' successfully updated');


                if (i % 10 == 0) {
                    if (checkGovernance() == true) {
                        break;
                    }
                }
            } catch (e) {
                var error = e.code + ' :: ' + e.message;
                nlapiLogExecution('ERROR', 'Try / Catch Error', error);
                nlapiSendEmail(
                    '6',
                    'jacobg@overturepromo.com',
                    'PE Record Error Main Try/Catch Error',
                    error.toString(),
                    null,
                    null,
                    null,
                    null
                );
            }
        }
    }
}