/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/record', 'N/log', 'N/search', './moment.js'], 

 function (record, log, s, moment) {

  function execute() {

    var search = s.load({
      type: record.Type.SALES_ORDER,
      id: 'customsearch435_2_5_4',
    });

    var resultSet = search.run();
    var results = resultSet.getRange({
      start: 0,
      end: 1000
    });

    for (var i = 0; i < results.length; i++) {

      try {
        
        var dateComplete = findCompleteDate();
        var internalID = results[i].getValue({
          name: "internalid",
          summary: "GROUP",
          label: "Internal ID"
        });
        var tranID = results[i].getValue({
          name: "tranid",
          summary: "GROUP",
          label: "SO Number"
        });
        var shipDate = results[i].getValue({
          name: "custcolshipdatecustom",
          summary: "MIN",
          label: "*ShipDate"
        });

        ////Create a PE (production embroidery) Record
        var newPERecord = record.create({
          type: 'customrecordproduction_embroidery',
          isDynamic: true
      })

        //Set the ‘Created From Sales Order’ field on the PE record to the related sales order.. use SETFIELDVALU and tie tranID to that.
        newPERecord.setValue({
          fieldId: 'custrecordcreatedfromso_prod_emb',
          value: internalID
        })

        //setting the dates
        if (shipDate) {
          newPERecord.setValue({
            fieldId: 'custrecordproduction_emb_sche_start_date',
            value: shipDate
          })
          newPERecord.setValue({
            fieldId: 'custrecordproduction_emb_complet_by_date',
            value: shipDate
          })
        } else {
          newPERecord.setValue({
            fieldId: 'custrecordproduction_emb_sche_start_date',
            value: dateComplete
          })
          newPERecord.setValue({
            fieldId: 'custrecordproduction_emb_complet_by_date',
            value: dateComplete
          })
        }

        //Submit Record
        var newID = newPERecord.save({
          enableSourcing: true,
          ignoreMandatoryFields: false
        });

        log.debug("PE Record " + newID +  " successfully updated");
      } catch (e) {
        log.error({
          title: e.code,
          details: e.message
        });
      }
    }
  }
  function findCompleteDate(){
    var today = new Date();
    var weekFromToday = new Date()
    weekFromToday.setDate(weekFromToday.getDate() + 7);
    var dateComplete = '';
    if (weekFromToday.getDay() == 6) {
      dateComplete = moment().add(6, 'days').format('L');
    } else if (weekFromToday.getDay() == 0) {
      dateComplete = moment().add(5, 'days').format('L');
    } else {
      dateComplete = moment().add(7, 'days').format('L');;
    }
    return dateComplete;
  }
  return {
    execute: execute
  };
});