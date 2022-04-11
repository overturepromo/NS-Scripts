/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/record','N/file','N/runtime'], function(record,file,runtime) {

    function execute() {
  
      var fileId = runtime.getCurrentScript().getParameter('custscript_fileid');
  
      var fileObj = file.load({
        id: fileId
      });
  
      var jsonStr = fileObj.getContents();
      var jsonObj = JSON.parse(jsonStr);
      var soId = jsonObj.soId;
  
      var rec = record.load({
        type: record.Type.SALES_ORDER,
        id: soId,
        isDynamic: true,
      });
  
      for(var i=0; i<jsonObj.lines.length; i++) {
  
        var line = rec.selectLine({
          sublistId:'item',
          line:jsonObj.lines[i].line
        });
  
        // rec.setCurrentSublistValue({
        //   sublistId:'item',
        //   fieldId:'quantity',
        //   value:jsonObj.lines[i].quantity
        // });
  
        // rec.setCurrentSublistValue({
        //   sublistId:'item',
        //   fieldId:'porate',
        //   value:jsonObj.lines[i].cost
        // });
  
        if(jsonObj.lines[i].excludefrompe == 'T') {
          rec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'custcol_exclude_from_pe',
            value: true
          });
        }
        else {
          rec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'custcol_exclude_from_pe',
            value: false
          });
        }
        
        if(jsonObj.lines[i].excludefromps == 'T') {
          rec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'custcol_exclude_from_ps',
            value: true
          });
        }
        else {
          rec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'custcol_exclude_from_ps',
            value: false
          });
        }
  
        rec.commitLine({
          sublistId:'item'
        });
      }
  
      rec.save();
    }
    return {
      execute: execute
    };
  });