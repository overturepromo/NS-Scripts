/*
 *Author: Kevin Doss
 *Date: 09/22/2021
 *Description: Scheduled Script to create PE records from saved search: Embroidery Orders to Schedule – TEST
 */

function createPE() {

    //search: Embroidery Orders to Schedule – TEST
    var results = nlapiSearchRecord('salesorder','customsearch435_2_5_4');
  
    if(results) {
      try {
  
        for(var i=0; i<results.length; i++) {
  
          var rec = nlapiCreateRecord('customrecordproduction_embroidery',{recordmode: 'dynamic'});
  
          rec.setFieldValue('custrecord_createdfromso_prod_emb',results[i].getValue('internalid',null,'GROUP'));
  
          var shipDate = results[i].getValue('custcolshipdatecustom',null,'MIN');
  
          if(shipDate) {
            rec.setFieldValue('custrecordproduction_emb_sche_start_date',shipDate);
            rec.setFieldValue('custrecordproduction_emb_complet_by_date',shipDate);
          }
          else {
            var date = new Date();
            var newDate = nlapiAddDays(date,7);
  
            if(newDate.getDay() != 0 && newDate.getDay() != 6) {
              rec.setFieldValue('custrecordproduction_emb_sche_start_date',nlapiDateToString(newDate));
              rec.setFieldValue('custrecordproduction_emb_complet_by_date',nlapiDateToString(newDate));
            }
            else {
              if(newDate.getDay() == 0) {
                newDate = nlapiAddDays(newDate,5);
              }
              else {
                newDate = nlapiAddDays(newDate,6);
              }
              rec.setFieldValue('custrecordproduction_emb_sche_start_date',nlapiDateToString(newDate));
              rec.setFieldValue('custrecordproduction_emb_complet_by_date',nlapiDateToString(newDate));
            }
          }
  
          nlapiSubmitRecord(rec);
        }
      }
      catch(e) {
              var error = e.name+' '+e.message;
              nlapiLogExecution('ERROR','Try / Catch Error',error);
          }
    }
   }