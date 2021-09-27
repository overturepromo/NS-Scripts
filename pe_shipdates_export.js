var salesorderSearch = nlapiSearchRecord("salesorder",null,
[
   ["type","anyof","SalesOrd"], 
   "AND", 
   ["mainline","is","F"], 
   "AND", 
   ["taxline","is","F"], 
   "AND", 
   ["shipping","is","F"], 
   "AND", 
   ["item","anyof","235631"], 
   "AND", 
   ["status","noneof","SalesOrd:C","SalesOrd:G","SalesOrd:H","SalesOrd:A"], 
   "AND", 
   ["custbody_rm_frm_prod_queue","is","F"], 
   "AND", 
   ["custbodyoverture_embroidery","is","T"], 
   "AND", 
   ["custbody_prod_embroidery_record","anyof","@NONE@"], 
   "AND", 
   ["datecreated","after","fiscalyearbeforelasttodate"]
], 
[
   new nlobjSearchColumn("internalid",null,"GROUP"), 
   new nlobjSearchColumn("tranid",null,"GROUP").setSort(true), 
   new nlobjSearchColumn("custcolshipdatecustom",null,"MIN")
]
);