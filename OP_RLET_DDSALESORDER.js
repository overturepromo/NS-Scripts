/*
 *Author: Kevin Doss
 *Date: 06/30/2021
 *Description: RESTlet for DoorDash web orders (split off from main Sheehy RESTlet to see if performance improves)
 * 
 */
var Events = {

    POST: function(payload) {
  
      nlapiLogExecution('AUDIT', 'Payload', JSON.stringify(payload));
  
      var depositNeeded = function(expectedTotal) {
  
        if (payload.paymentmethod == '3' || payload.paymentmethod == '4' || payload.paymentmethod == '5' || payload.paymentmethod == '6') {
  
          if (payload.custbody_paid_in_full == 'T' && expectedTotal > 0) {
            return true;
          }
          else {
            return false;
          }
        }
        else {
          return false;
        }
      };
  
      var createSalesOrder = function(expectedTotal) {
  
        var record = nlapiCreateRecord('salesorder', {
          recordmode: 'dynamic'
        });
  
        /////////////////////
        // GENERAL DETAILS //
        /////////////////////
        record.setFieldValue('customform', payload.customform);
        record.setFieldValue('entity', payload.entity);
        record.setFieldValue('class', payload.class);
        if (payload.enddate) {
          record.setFieldValue('enddate', payload.enddate);
        }
        if (payload.custbody_special_instructions) {
          record.setFieldValue('custbody_special_instructions', payload.custbody_special_instructions);
        }
  
        if (payload.custbody_ordercustomfield1) {
          record.setFieldValue('custbody_ordercustomfield1', payload.custbody_ordercustomfield1);
        }
  
        if (payload.custbody_ordercustomfield2) {
          record.setFieldValue('custbody_ordercustomfield2', payload.custbody_ordercustomfield2);
        }
  
        if (payload.custbody_ordercustomfield3) {
          record.setFieldValue('custbody_ordercustomfield3', payload.custbody_ordercustomfield3);
        }
  
        if (payload.custbody_ordercustomfield4) {
          record.setFieldValue('custbody_ordercustomfield4', payload.custbody_ordercustomfield4);
        }
  
        if (payload.custbody_ordercustomfield5) {
          record.setFieldValue('custbody_ordercustomfield5', payload.custbody_ordercustomfield5);
        }
  
        if(payload.custbody_promo_code) {
          record.setFieldValue('custbody_promo_code',payload.custbody_promo_code);
        }
  
        if (payload.custbody_text_message_opt_in == "1") {
          record.setFieldValue('custbody_text_message_opt_in', 'T');
        }
  
        if (payload.custbody_ddcc_corona == 'T') {
          record.setFieldValue('custbody_ddcc_corona', 'T');
          record.setFieldValue('custbody_opac_do_not_reprocess', 'T');
          record.setFieldValue('excludecommission','T');
        }
        
        if(payload.custbody_dd_bike_safety) {
          record.setFieldValue('custbody_dd_bike_safety', payload.custbody_dd_bike_safety);
        }
  
        record.setFieldText('custbody_aa_order_type', null);
        
        if (payload.custbody_webstoreordernumber) {
          record.setFieldValue('custbody_webstoreordernumber', payload.custbody_webstoreordernumber);
          record.setFieldValue('otherrefnum', payload.custbody_webstoreordernumber);
          record.setFieldValue('externalid', payload.custbody_webstoreordernumber);
        }
  
        record.setFieldValue('custbody_paid_in_full', payload.custbody_paid_in_full);
  
        record.setFieldValue('custbody_expected_total', expectedTotal.toString());
  
        if (payload.discountitem) {
          record.setFieldText('discountitem', payload.discountitem);
        }
  
        if (payload.discountrate) {
          record.setFieldValue('discountrate', payload.discountrate);
        }
  
        if (payload.taxtotal) {
          var taxTotal = payload.taxtotal.replace(/\,/g, '');
          record.setFieldValue('custbody_expected_tax_total', taxTotal);
        }
  
        //DDCARD Orders at zero total, check opac do not reprocess
        if (payload.entity == '1046335' && Number(payload.total) == 0) {
          record.setFieldValue('custbody_opac_do_not_reprocess', 'T');
        }
  
        //if one of DD Canada customers, set location to Canada
        if (payload.entity == '4058654' || payload.entity == '3590226' || payload.entity == '3590224' || payload.entity == '4226158' || payload.entity == '3641888' || payload.entity == '5897102' || payload.entity == '4970539' || payload.entity == '4588325') {
          record.setFieldText('location', 'Canada');
        }
  
        //if one of DD Japan customers, set location to Japan
        if (payload.entity == '6953400' || payload.entity == '7007043' || payload.entity == '6171454' || payload.entity == '6171455') {
          record.setFieldText('location', 'Japan');
        }
  
        //if one of DD Australia customers, set location to Australia
        if (payload.entity == '2547921' || payload.entity == '3657429' || payload.entity == '3657430' || payload.entity == '4226055' || payload.entity == '3426249') {
          record.setFieldText('location', 'Australia');
        }
  
        //if customer is 14803, check excludecommission (6/23/2021 per Brian)
        if(payload.entity == '1046335') {
          record.setFieldValue('excludecommission','T');
        }
  
        //adding 9/15/2020 per Brian to catch any that slip through workflow. all webstore orders should default to T for shipcomplete
        record.setFieldValue('shipcomplete', 'T');
  
        //////////////////////
        // SHIPPING ADDRESS //
        //////////////////////
        //always country first!!
        record.setFieldValue('shipaddresslist', null);
        record.setFieldValue('shipcountry', payload.shipcountry);
        record.setFieldValue('shipzip', payload.shipzip);
        record.setFieldValue('shipstate', payload.shipstate);
        record.setFieldValue('shipcity', payload.shipcity);
  
        //set shipattention to shipaddressee (there was a reason for this originally)
        if (payload.shipaddressee) {
          record.setFieldValue('shipattention', payload.shipaddressee);
        }
  
        record.setFieldValue('shipaddr1', payload.shipaddr1);
        if (payload.shipaddr2) {
          record.setFieldValue('shipaddr2', payload.shipaddr2);
        }
        if (payload.shipaddr3) {
          record.setFieldValue('shipaddressee', payload.shipaddr3);
        }
        if (payload.shipphone) {
          record.setFieldValue('custbody_shiptophone', payload.shipphone);
          record.setFieldValue('shipphone', payload.shipphone);
        }
        if (payload.shipdate) {
          record.setFieldValue('shipdate', payload.shipdate);
        }
        if (payload.shipmethod) {
          record.setFieldValue('shipmethod', payload.shipmethod);
        }
        if (payload.shippingcost) {
          if (payload.handlingcost) {
            var shipAndHandling = Number(payload.shippingcost) + Number(payload.handlingcost);
            record.setFieldValue('shippingcost', Number(Math.round(shipAndHandling + 'e2') + 'e-2'));
          }
          else {
            record.setFieldValue('shippingcost', Number(Math.round(payload.shippingcost + 'e2') + 'e-2'));
          }
        }
  
        /////////////////////
        // BILLING ADDRESS //
        /////////////////////
        //always country first!!
        record.setFieldValue('billaddresslist', null);
        record.setFieldValue('billcountry', payload.billcountry);
        record.setFieldValue('billzip', payload.billzip);
        record.setFieldValue('billstate', payload.billstate);
        record.setFieldValue('billcity', payload.billcity);
  
        //set billattention to billaddressee (there was a reason for this originally)
        if (payload.billaddressee) {
          record.setFieldValue('billattention', payload.billaddressee);
        }
  
        record.setFieldValue('billaddr1', payload.billaddr1);
        if (payload.billaddr2) {
          record.setFieldValue('billaddr2', payload.billaddr2);
        }
        if (payload.billaddr3) {
          record.setFieldValue('billaddressee', payload.billaddr3);
        }
        if (payload.billphone) {
          record.setFieldValue('custbody_billtophone', payload.billphone);
          record.setFieldValue('billphone', payload.billphone);
        }
  
        //not sure why this is here
        if (payload.email) {
          record.setFieldValue('email', payload.email);
        }
  
        //////////////////
        // CONTACT INFO //
        //////////////////
        if (payload.purchaser_name) {
          record.setFieldValue('custbody_customer_name', payload.purchaser_name);
        }
        else if (payload.shipaddressee) {
          record.setFieldValue('custbody_customer_name', payload.shipaddressee);
        }
  
        if (payload.purchaser_email) {
          record.setFieldValue('custbody_customer_email', payload.purchaser_email);
        }
        else if (payload.email) {
          record.setFieldValue('custbody_customer_email', payload.email);
        }
  
        if (payload.purchaser_phone) {
          record.setFieldValue('custbody_customer_phone', payload.purchaser_phone);
        }
        else if (payload.shipphone) {
          record.setFieldValue('custbody_customer_phone', payload.shipphone);
        }
  
        ////////////////
        // LINE ITEMS //
        ////////////////
        var items = payload.item;
        var negLinesJSON = {
          items: []
        };
  
        for (var i = 0; i < items.length; i++) {
          var lineItem = items[i];
  
          //skip negative lines until order is created (so Avalara can calculate taxes)
          if (Number(lineItem.rate) >= 0) {
            record.selectNewLineItem('item');
            record.setCurrentLineItemValue('item', 'item', lineItem.item);
            if (lineItem.custcol_attempted_sku) {
              record.setCurrentLineItemValue('item','custcol_so_attempted_sku', lineItem.custcol_attempted_sku);
            }
            record.setCurrentLineItemValue('item', 'quantity', lineItem.quantity);
            record.setCurrentLineItemText('item', 'price', 'Custom');
            record.setCurrentLineItemValue('item', 'rate', lineItem.rate);
            if (lineItem.item === 285445) {
              record.setCurrentLineItemValue('item', 'porate', lineItem.rate);
            }
  
            //per Brian 11/26 2020 @10:41 am
            //if customer is 14804 DoorDash - Program - DDCC (18886) and payload.custbody_ddcc_corona is "T" - set tax code to "Not Taxable"
            //or customer is 14803 DDCARD and payload.total is zero
            //update 3/4/2021 from "Not Taxable" to "Exclude from Avalara"
            if((payload.entity == '18886' && payload.custbody_ddcc_corona == 'T') || (payload.entity == '1046335' && payload.total == '0.0000')) {
              record.setCurrentLineItemValue('item','taxcode','415671');
            }
  
            if (lineItem.custcol_extend_imprintsummary) {
              record.setCurrentLineItemValue('item', 'custcol_extend_imprintsummary', lineItem.custcol_extend_imprintsummary);
            }
  
            //new as of 10/03/2019 - custom generic fields at the line level
            if (lineItem.custcol_line_custom_field1) {
              record.setCurrentLineItemValue('item', 'custcol_line_custom_field1', lineItem.custcol_line_custom_field1);
            }
            if (lineItem.custcol_line_custom_field2) {
              record.setCurrentLineItemValue('item', 'custcol_line_custom_field2', lineItem.custcol_line_custom_field2);
            }
            if (lineItem.custcol_line_custom_field3) {
              record.setCurrentLineItemValue('item', 'custcol_line_custom_field3', lineItem.custcol_line_custom_field3);
            }
            if (lineItem.custcol_line_custom_field4) {
              record.setCurrentLineItemValue('item', 'custcol_line_custom_field4', lineItem.custcol_line_custom_field4);
            }
            if (lineItem.custcol_text_area_1) {
              record.setCurrentLineItemValue('item', 'custcol_text_area_1', lineItem.custcol_text_area_1);
            }
  
            record.commitLineItem('item');
          }
          else {
            //check custbody_negative_lines_pending
            record.setFieldValue('custbody_negative_lines_pending', 'T');
  
            //build out negative lines JSON
            negLinesJSON.items.push({
              item: lineItem.item,
              qty: lineItem.quantity,
              rate: lineItem.rate,
              custcol_line_custom_field1: lineItem.custcol_line_custom_field1,
              custcol_line_custom_field2: lineItem.custcol_line_custom_field2,
              custcol_line_custom_field3: lineItem.custcol_line_custom_field3,
              custcol_line_custom_field4: lineItem.custcol_line_custom_field4
            });
          }
        }
  
        //store negative lines, if present, in custbody_negative_line_data
        if (negLinesJSON.items.length > 0) {
          record.setFieldValue('custbody_negative_line_data', JSON.stringify(negLinesJSON));
        }
  
        //add freight cost adjustment if present
        if (payload.custbody_freight_adjustment) {
          record.selectNewLineItem('item');
          if (expectedTotal > 0.00) {
            //if 14811 Door Dash - DDAUSCC
            if (payload.entity == '3426249') {
              if (payload.item.length == 1 && payload.item[0] == '311171') {
                //DDH-Frt NON-Commissionable
                record.setCurrentLineItemValue('item', 'item', '345632');
              }
              else {
                //DDH-FRT
                record.setCurrentLineItemValue('item', 'item', '215188');
              }
            } 
            else {
              //DDH-FRT
              record.setCurrentLineItemValue('item', 'item', '215188');
            }
          }
          else {
            //DDH-FRT2
            record.setCurrentLineItemValue('item', 'item', '222323');
          }
          record.setCurrentLineItemValue('item', 'quantity', '1');
          record.setCurrentLineItemValue('item', 'porate', payload.custbody_freight_adjustment);
          record.setCurrentLineItemValue('item', 'rate', '0.00');
          record.commitLineItem('item');
        }
  
        //if DDH081, DDH0812, DDH019, DDH028, or DDH031A order with no other lines (aside from webstore discount)
        //check custom box for fulfillment via script
        if (items.length < 3) {
          if (items.length == 1) {
            if (items[0].item == '337651' || items[0].item == '210498' || items[0].item == '208289' || items[0].item == '374002' || items[0].item == '233690') {
              //for DDH028 & DDH0812, ensure quantity is 1, else ignore quantity
              if (items[0].item == '208289' || items[0].item == '374002') {
                if (items[0].quantity == 1) {
                  record.setFieldValue('custbody_ddh081_single', 'T');
                }
              }
              else {
                record.setFieldValue('custbody_ddh081_single', 'T');
              }
            }
          }
          else if (items[0].item == '337651' || items[0].item == '210498' || items[0].item == '208289' || items[0].item == '374002' || items[0].item == '233690') {
            if (items[1].item == '283013') {
              //for DDH028 & DDH0812, ensure quantity is 1, else ignore quantity
              if (items[0].item == '208289' || items[0].item == '374002') {
                if (items[0].quantity == 1) {
                  record.setFieldValue('custbody_ddh081_single', 'T');
                }
              }
              else {
                record.setFieldValue('custbody_ddh081_single', 'T');
              }
            }
          }
          else if (items[0].item == '283013') {
            if (items[1].item == '337651' || items[1].item == '210498' || items[1].item == '208289' || items[0].item == '374002' || items[0].item == '233690') {
              //for DDH028 & DDH0812, ensure quantity is 1, else ignore quantity
              if (items[0].item == '208289' || items[0].item == '374002') {
                if (items[0].quantity == 1) {
                  record.setFieldValue('custbody_ddh081_single', 'T');
                }
              }
              else {
                record.setFieldValue('custbody_ddh081_single', 'T');
              }
            }
          }
        }
  
        //if customer is DDCC and order is exclusive to DDH270 - DDH272
        //set Hold Reason to LTO/Pre-Order
        if(payload.entity == '18886') {
          var itemsPresent = false;
          var itemsExclusive = true;
          
          for(var z=0;z<items.length;z++) {
            if(items[z].item == '458923' || items[z].item == '458924' || items[z].item == '459027' || items[z].item == '459028' || items[z].item == '459029' || items[z].item == '459026' || items[z].item == '459025' || items[z].item == '459024') {
              itemsPresent = true;
            }
            else {
              itemsExclusive = false;
            }
          }
  
          if(itemsPresent) {
            if(itemsExclusive) {
              record.setFieldText('custbody47','LTO/Pre-order');
            }
          }
        }
  
        return nlapiSubmitRecord(record);
      };
  
      var createDeposit = function(entity, recordId, expectedTotal) {
  
        var deposit = nlapiCreateRecord('customerdeposit', {
          recordmode: 'dynamic'
        });
        deposit.setFieldValue('customer', entity);
        deposit.setFieldValue('salesorder', recordId);
        //per Brian 3/10/2021 set account to GL 1008 – Cash in Bank – TCF Collection Acct (search "page: accounts" in netsuite)
        //deposit.setFieldValue('account',869);
        deposit.setFieldValue('payment', expectedTotal);
        deposit.setFieldValue('paymentmethod', payload.paymentmethod);
        deposit.setFieldValue('ccexpiredate', payload.custbody_cc_expire_date);
        deposit.setFieldValue('authcode', payload.custbody_cc_auth_code);
        deposit.setFieldValue('pnrefnum', payload.pnrefnum);
        deposit.setFieldValue('ccapproved', 'T');
        deposit.setFieldValue('chargeit', 'F');
  
        var depositId = nlapiSubmitRecord(deposit);
  
        return depositId;
      };
  
      try {
  
        var expectedTotal = Number(payload.total.replace(/\,/g, ''));
  
        var recordId = createSalesOrder(expectedTotal);
  
        payload.newso = recordId;
  
        if (depositNeeded(expectedTotal)) {
          var depositId = createDeposit(payload.entity, recordId, expectedTotal);
        }
  
        return recordId;
  
      }
      catch (e) {
  
        nlapiLogExecution('ERROR', 'ERROR', e.code + ' :: ' + e.message);
  
        nlapiSendEmail(
          6,
          'kevind@overturepromo.com',
          'OP_RLET_DDSalesOrders.js error',
          e.toString(),
          null,
          null,
          null,
          true
        );
  
        return e.toString();
      }
    },
    GET: function(payload) {},
    PUT: function(payload) {},
    DELETE: function(payload) {}
  
  };