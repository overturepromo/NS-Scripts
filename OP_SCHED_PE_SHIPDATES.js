/*
 *Author: Jacob Goodall
 *Date: 09/23/2021
 *Description: Creation of PE and PS Records, linking the sales order, and setting the Production Start and End Dates
 */

function changeDates() {

    //PE Orders Created from SO Saved Search
    var results = nlapiSearchRecord('salesorder', 'customsearch435_2_5_4');

    if (results) {

        var checkGovernance = function () {

            var governanceThreshold = 500;
            var context = nlapiGetContext();

            if (context.getRemainingUsage() < governanceThreshold) {

                try {

                    var script = nlapiScheduleScript('customscript_op_sched_pe_shipdates');

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
                
                var internalID = results[i].getValue("internalid",null,"GROUP");
                var trainID = results[i].getValue("tranid",null,"GROUP");
                var shipDate = results[i].getValue("custcolshipdatecustom",null,"MIN");
                var dateComplete = '';

                //Create a PE (production embroidery) Record
                var peRecord = nlapiCreateRecord ('customrecordproduction_embroidery' , {recordmode:'dynamic'} );

                //Set the ‘Created From Sales Order’ field on the PE record to the related sales order.. It HATES everything I've tried.. 
                peRecord.setFieldText('custrecordcreatedfromso_prod_emb', "Sales Order #" + trainID);

                //Set the Production Start & Production Complete by Date to equal the Ship Date field I have exposed on the saved search 
                //a.	In the event the Ship Date field is empty, then the default Dates should be Today + 7 (but not fall on a weekend).
                function findCompleteDate(){
                    var todayDate = new Date();
                    var weekFromtoday = nlapiAddDays(todayDate, 7);
                    var dateComplete = '';
                    if(weekFromtoday.getDay() == 6){
                        dateComplete = nlapiAddDays(todayDate, 6)
                    }else if (weekFromtoday.getDay() == 0){
                        dateComplete = nlapiAddDays(todayDate, 5)
                    }else {
                        dateComplete = nlapiAddDays(todayDate, 7)
                    }
                    return nlapiDateToString(dateComplete);
                }

                dateComplete = findCompleteDate();

                if(shipDate){
                    peRecord.setFieldValue('custrecordproduction_emb_sche_start_date', shipDate);
                    peRecord.setFieldValue('custrecordproduction_emb_complet_by_date', shipDate);
                }else {
                    peRecord.setFieldValue('custrecordproduction_emb_sche_start_date', dateComplete);
                    peRecord.setFieldValue('custrecordproduction_emb_complet_by_date', dateComplete);
                }

                //Submit Record
                nlapiSubmitRecord(peRecord, false, true);
                nlapiLogExecution('AUDIT','SUCCESS',internalID +' successfully updated');


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