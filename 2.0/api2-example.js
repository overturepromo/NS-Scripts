/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 *
 * Scheduled script to load JSON file
 * and fulfill DD Germany orders with tracking
 */
define(['N/file', 'N/record', 'N/email', 'N/runtime', 'N/log'],
function(file, record, email, runtime, log) {
  function execute(context) {
    try {

     var fileId = runtime.getCurrentScript().getParameter({
       name: 'custscript_json_file_id'
      });

      log.debug('file id', fileId);

      //load JSON file
      var fileObj = file.load({
        id: fileId
      });

      var json = JSON.parse(fileObj.getContents());
      var orders = json.orders;

      //loop through orders, fulfilling with tracking
      for(var i=0; i<orders.length; i++) {

       var fulfillment = record.transform({
         fromType: record.Type.SALES_ORDER,
         fromId: orders[i].internalid,
         toType: record.Type.ITEM_FULFILLMENT,
         isDynamic: true
       });

       fulfillment.setText({fieldId:'shipstatus',text:'Shipped'});

       for(var x=0; x<fulfillment.getLineCount({sublistId:'item'}); x++) {
         fulfillment.selectLine({sublistId:'item',line:x});
         fulfillment.setCurrentSublistValue({sublistId:'item',fieldId:'itemreceive',value:true});
         fulfillment.commitLine({sublistId:'item'});
       }

       fulfillment.selectNewLine({sublistId:'package'});
       fulfillment.setCurrentSublistValue({sublistId:'package',fieldId:'packageweight',value:'0.01'});
       fulfillment.setCurrentSublistValue({sublistId:'package',fieldId:'packagetrackingnumber',value:orders[i].tracking});
       fulfillment.commitLine('package');

       var newId = fulfillment.save();

       log.debug('new fulfillment created: ',newId);

      }
    } 
    catch (e) {
       log.error({
         title: e.code,
         details: e.message
       });
      var subject = 'ERROR Fulfilling DD Germany';
      var authorId = 6;
      var recipientEmail = 'kevind@overturepromo.com';
      email.send({
        author: authorId,
        recipients: recipientEmail,
        subject: subject,
        body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
      });
    }
  }
  return {
    execute: execute
  };
});