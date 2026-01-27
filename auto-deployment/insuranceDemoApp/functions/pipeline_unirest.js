exports = async function(changeEvent){

  // Get endpoint URL and authorization token from environment variables
  const ENDPOINT_URL = context.values.get("DATABRICKS_ENDPOINT_URL");
  const AUTH_TOKEN = context.values.get("DATABRICKS_AUTH_TOKEN");
  
  const {updateDescription, fullDocument} = changeEvent;
 
  var collection = context.services.get("mongodb-atlas").db("digital_underwriting").collection("customerTripMonthly");
  const policy_coll = context.services.get("mongodb-atlas").db("digital_underwriting").collection("customerPolicy");
  
  const totalDistance = parseFloat(fullDocument.totalDistance);
  const policyDoc = await policy_coll.findOne({"customerId": fullDocument._id.customerId});
 
  
  const basePremium = parseFloat(policyDoc.baseMonthlyPremium);
  
  const data = {"inputs": [basePremium, totalDistance]}
  
  const res = await context.http.post({
    "url": ENDPOINT_URL,
    "body": JSON.stringify(data),
    "encodeBodyAsJSON": false,
    "headers": {
      "Authorization": [AUTH_TOKEN],
      "Content-Type": [ "application/json" ]
    }
  })

  
  let calculated_premium = EJSON.parse(res.body.text()).predictions;
  
  const month = fullDocument._id.month;
  policy_coll.updateOne({"_id":policyDoc._id}, {$push:{"premium":{"month":month,"calculatedPremium": calculated_premium}}});
  

 };
