/*
 *Author: Kevin Doss
 *Date: 01/06/2021
 *Description: Scheduled Script to create missing deposits for webstore orders, pulling data from a .csv file.
 * 
 */

function createDeposits() {

    var createDeposit = function(entity, recordId, tranDate, expectedTotal, paymentMethod, ccExpire, ccAuth, pnRef) {
  
      var deposit = nlapiCreateRecord('customerdeposit', {
        recordmode: 'dynamic'
      });
      deposit.setFieldValue('customer', entity);
      deposit.setFieldValue('salesorder', recordId);
      deposit.setFieldValue('trandate', tranDate);
      deposit.setFieldValue('payment', expectedTotal);
      deposit.setFieldValue('paymentmethod', paymentMethod);
      deposit.setFieldValue('ccexpiredate', ccExpire);
      deposit.setFieldValue('authcode', ccAuth);
      deposit.setFieldValue('pnrefnum', pnRef);
      deposit.setFieldValue('ccapproved', 'T');
      deposit.setFieldValue('chargeit', 'F');
    
      //Integration Payment Info (different from same fields on SO)
      // deposit.setFieldValue('custbody_payment_method_int_dep', paymentMethod);
      // var depPaymentInfo = '';
      // depPaymentInfo += 'IS PRE-AUTH: No' + '\r\n';
      // depPaymentInfo += 'EXPIRES (MM/YYYY) ' + ccExpire + '\r\n';
      // depPaymentInfo += 'AUTH. CODE: ' + ccAuth + '\r\n';
      // depPaymentInfo += 'P/N REF. ' + pnRef + '\r\n';
      // depPaymentInfo += 'CREDIT CARD APPROVED: Yes' + '\r\n';
      // depPaymentInfo += 'CUSTOMER CODE: 5199';
    
      // deposit.setFieldValue('custbody_payment_info_int_dep', depPaymentInfo);
    
      var depositId = nlapiSubmitRecord(deposit, false, true);
    
      return depositId;
    };
  
    
      var fileId = 11070573;
  
      //load file and get values
      var fileToParse = nlapiLoadFile(fileId);
      var fileContents = fileToParse.getValue();
  
      //parse file into JSON
      var parsedFile = Papa.parse(fileContents,{header:true, skipEmptyLines:true});
      var deposits = parsedFile.data;
  
      for(var i=0; i<deposits.length; i++) {
  
        try {
          var depId = createDeposit(deposits[i]['Customer Name'], deposits[i]['SO Internal ID'], deposits[i]['Transaction Date'], deposits[i]['Processed Transaction Amount'], deposits[i]['Card Type'], '01/2024', deposits[i]['Authorization Code'], deposits[i]['Invoice Number']);
  
          nlapiLogExecution('AUDIT','Deposit Created', depId);
        }
        catch(e) {
          nlapiLogExecution('ERROR','Problem creating deposit', e.code+' :: '+e.message);
        }
      }
  }
  
  