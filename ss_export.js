var salesorderSearch = nlapiSearchRecord("salesorder",null,
[
   ["datecreated","after","lastyeartodate"], 
   "AND", 
   ["type","anyof","SalesOrd"], 
   "AND", 
   ["status","noneof","SalesOrd:G","SalesOrd:C","SalesOrd:H","SalesOrd:F","SalesOrd:A"], 
   "AND", 
   ["custcol_exclude_from_pe","is","F"], 
   "AND", 
   ["mainline","is","F"], 
   "AND", 
   ["taxline","is","F"], 
   "AND", 
   ["shipping","is","F"], 
   "AND", 
   ["custbodyoverture_embroidery","is","T"], 
   "AND", 
   ["custbody_prod_embroidery_record.custrecordemb_production_status","anyof","1"], 
   "AND", 
   ["formulanumeric: {purchaseorder.quantity}-{purchaseorder.quantityshiprecv}","greaterthan","0"], 
   "AND", 
   ["purchaseorder.quantityshiprecv","greaterthan","0"]
], 
[
   new nlobjSearchColumn("tranid",null,"GROUP"), 
   new nlobjSearchColumn("internalid","CUSTBODY_PROD_EMBROIDERY_RECORD","GROUP"), 
   new nlobjSearchColumn("name","CUSTBODY_PROD_EMBROIDERY_RECORD","GROUP"), 
   new nlobjSearchColumn("custrecordemb_production_status","CUSTBODY_PROD_EMBROIDERY_RECORD","GROUP"), 
   new nlobjSearchColumn("formulanumeric",null,"SUM").setFormula("{purchaseorder.quantity}-{purchaseorder.quantityshiprecv}"), 
   new nlobjSearchColumn("purchaseorder",null,"GROUP")
]
);