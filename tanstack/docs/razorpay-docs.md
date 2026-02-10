check if @tanstack/docs/razorpay-subscription-flow.md is correct based on these

About Subscriptions
Use Razorpay Curlec Subscriptions to accept recurring payments from your customers. Check the available billing models and supported currencies.

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

You can use Razorpay Curlec Subscriptions to set up and manage recurring payments. These recurring payments are payments that:

You can charge as per a billing model defined that you define.
Do not require any intervention from the customer as the process is automated.
You can automatically charge customers based on a billing cycle that you control. It allows you to easily create and manage Subscriptions and get instant alerts on payment activity as well as the status of Subscriptions.

Razorpay Curlec automatically handles the invoicing for all Subscriptions.

On-demand Feature: Recurring Payments

Razorpay offers an on-demand feature called Recurring Payments. This feature lets you manage subsequent payments of your customers and charge them depending on your business requirements. Contact our support team for more information.

Flash Checkout
You must enable the Flash Checkout feature from the Dashboard to proceed with Subscriptions.

To enable the Flash Checkout feature:

Log in to the Dashboard and click Account & Settings in the left menu.
Click Flash checkout under Checkout settings.
Enable the Flash Checkout feature.
Get Started
Log in to the Dashboard and click Subscriptions under PAYMENT PRODUCTS in the left menu. If you do not have a Razorpay Curlec account, sign up.

Below are the steps to get started with Subscriptions:

Create a Plan
A Plan is the base of a Subscription. A Plan contains all the information about the services, such as the amount and the billing cycle.

Create a Subscription
You can create a Subscription after creating a Plan. A Subscription contains Plan details, start date, number of billing cycles and other information.

Billing Models
Subscriptions supports three different billing models:

Fixed Schedule and Fixed Amount
The customer is charged a fixed amount at fixed intervals for a fixed quantity of goods or services. This is done by creating a Plan with a fixed amount and billing frequency and then creating a Subscription based on this Plan.

Fixed Schedule and Fixed Amount plus
The customer is charged a fixed amount at fixed intervals but can avail of extra goods or services by paying an extra charge for them. This is done by creating a Plan with a fixed amount and billing frequency and then creating a Subscription based on this Plan. The extra goods or services availed can be added to the Subscription.

Fixed Schedule and Variable Amount
The customer is charged at fixed intervals according to their usage in the defined time interval. Here, the Subscription amount and the quantity of the goods or services are not fixed. This is done by first creating a Plan with a fixed amount (this can be as low as RM 1) and a billing frequency. You proceed to create a Subscription based on this plan and charge the customer a variable amount based on their usage.

Subscriptions Workflow
Check the Plans, free trial period, upfront (delivery or set up) amount, Subscriptions, checkout integration for Subscriptions and Subscription links.

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

The following diagram depicts the Subscriptions life cycle:

Subscriptions Lifecycle stages and flow
The Subscription workflow involves the following:

Create a Plan.
After the Plan is created, you can then create a Subscription for your customer.
Customer makes the Authentication Transaction.
The Subscription becomes active when the billing cycle starts.
Handy Tips

You do not need to capture any Subscriptions-related payment. All payments related to Subscriptions (except the authorisation payment) are auto-captured. The authorisation payment used to validate a customer's card is auto-refunded.

There is no need to create a customer when using Razorpay Curlec Subscriptions. Razorpay Curlec automatically creates a customer when the authentication payment is made.

Authentication Transaction
The authentication transaction amount is the first amount you charge on the customer's card. The authentication transaction can either be a token amount that is refunded to the customer or an upfront amount or the plan amount that is not refunded to the customer. Based on your business needs, you can decide on the authentication transaction amount.

Immediate Start Dates

In the case of immediate start dates, the authentication transaction amount is not refunded and invoices are generated in all the three scenarios.

The table below explains what authentication amount is collected from customers for various combinations of start date and upfront amount.

Start Date Upfront Amount Authentication Amount
Immediate x Plan Amount
Future x RM 5 (auto refunded)
Immediate ✓ Upfront Amount + Plan Amount
Future ✓ Upfront Amount
You can collect the authentication transaction in one of the following ways:

Subscriptions via Checkout
Subscriptions via Links
Subscriptions via Checkout
Handy Tips

You can integrate Razorpay Curlec Subscriptions to your checkout only using APIs.

You can integrate the Razorpay Curlec Subscription service with your Razorpay Curlec Checkout Form on your website or application. Customers can select their desired Subscription Plan on your website or application and proceed to make the authentication payment using Razorpay Curlec's Checkout.

Subscriptions Flow via Checkout
Create a Plan.
The customer selects the Plan from your website or application.
After the customer selects a Plan, a Subscription is created in Razorpay Curlec and the subscription_id received in the response, is passed on to the Razorpay Curlec Checkout via the checkout options.
On the Checkout form, the customer makes the payment using the card details.
This acts as an authentication transaction. On a successful payment, a customer is created and linked to the Subscription.
Automated charges on the Subscription are now made as per the schedule that you defined while creating the plan.
Know more about integrating Subscriptions in your checkout.

Subscriptions via Links
You can create a custom Subscription for a customer and send a Subscription link to them. Customers click the link and are taken to a checkout page hosted by Razorpay Curlec where they make the authentication payment via Razorpay Curlec's checkout page. There is no need to host the link on your website or application.

Subscriptions Flow via Links
Create a Plan.
You create a Subscription link by:
Selecting a Plan.
Adding an upfront amount.
Adding customer details.
The Subscription link is sent to the customer via email and/or SMS.
The customer click the link and is taken to the Razorpay Curlec Checkout form.
The customer enters the card details and clicks Pay to make the payment. This acts as an authentication transaction. On a successful payment, a customer is created and linked to the Subscription.
Automated charges on the Subscription are now made as per the schedule that you defined while creating the plan.
Know more about Subscription Links.

Subscriptions Actions
You can perform the following actions on Subscriptions that are active:

Update a Subscription
Pause and Resume a Subscription
Cancel a Subscription
Invoice
Invoices are automatically created for Subscriptions. Invoice includes details such as plan, amount, date of charge including merchant details. Invoices are created for every charge made on the customer's card for recurring payments, including the authentication transaction.

An invoice is generated at the beginning of each billing cycle for the defined plan and amount.

A charge is attempted on the invoice. The invoice is in issued state on your Dashboard.

If the charge is successful:

An email is sent to the customer.
The invoice is moved to paid state on your Dashboard.
The invoice.paid webhook is fired.
Watch Out!

Along with the invoice state, we recommend you check the Subscription charge status of the defined billing frequency before providing or continuing services to your customers.

Start Date Upfront Amount Invoice sent
Immediate x Yes
Future x No (Reason: Auth transaction)
Immediate ✓ Yes
Future ✓ Yes

Subscriptions States
List of states of Subscription and their significance.

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

You can track a Subscription through its various stages from creation to completion. While the life cycle for a Subscription includes creation, authentication, active and then completion, you also have the option to cancel a Subscription.

The stages that a Subscription is likely to go through are illustrated here:

subscription life cycle
Subscriptions States and Descriptions
During its life cycle, a Subscription can go through the below states.

Created
A Subscription attains the created state once it is created.

Authenticated
A Subscription goes to the authenticated state when the customer completes the authentication transaction.

Subscriptions with an Immediate Start Date

The Subscription with an immediate start date remains in the created state till the first charge is made and moves to the active state after the first charge.

Subscriptions with a Trial Period

The Subscription with an add-on amount remains in the created state and moves to the authenticated state after the add-on amount is processed.
The Subscription without an add-on amount moves to the authenticated state when the customer completes the authentication transaction.
Active
A Subscription goes to the active state when the billing cycle for the Subscription starts.

Action on Razorpay Curlec
When a Subscription moves to the active state from the authenticated state, we attempt to charge the authorized card against the invoice amount.

Pending
A Subscription goes to the pending state when an auto-charge on a payment is unsuccessful. We continue to retry the payment while it is in this state. In the meanwhile, you can ask the customer to authenticate another card, if required.
After all the retry attempts have been exhausted, the Subscription moves to the halted state.
Action on Razorpay Curlec
When the Subscription moves to the halted state from the pending state, invoices continue to be generated as per the billing cycles. However, no auto-charge is attempted. It is important to note that once the Subscription moves back to the active state, the previous charges will not be re-attempted. Only future billing cycles are charged automatically.
When the Subscription moves to the pending state from the active state, you are notified about the failed attempt via our webhooks. For Subscriptions authenticated via cards, we continue to automatically process a retry without you having to take any action. We also send the customer an email notifying them about the failure. This email has a call-to-action from the customer to change the card that is associated with the Subscription.
Action on Business or Customer
To move the Subscription back to the active state from the pending state, the customer needs to authenticate another card. This enables us to successfully perform a charge on it. You or the customer can also manually attempt a charge on the same card by attempting to charge any of the older unpaid invoices. If they go through successfully, the Subscription moves back to the active state.

Halted
The Subscription goes to the halted state when the last auto-charge is unsuccessful and all retries are exhausted.

Handy Tips

It is possible for the Subscription to continue to remain in the halted state for more than one billing cycle. In such scenarios:

Invoices are generated for all billing cycles, but no auto-charge is attempted.
The customer needs to authenticate another card or you or the customer needs to manually attempt a charge on an older unpaid invoice. If the older invoice is successfully charged, the Subscription will automatically move to the active state.
The Subscription moves to the active state once the customer changes their card details and we are able to successfully perform a charge on it.

It can also move to the active state if a charge on an older invoice is attempted and it goes through successfully.
You can charge an older invoice from the Dashboard.
Watch Out!

Once the Subscription moves to the active state from the halted state, the previous charges are not re-attempted. Only future payments are charged automatically.

Cancelled
When you cancel a Subscription, it moves to the cancelled state. Once cancelled, a Subscription cannot be restarted.

A Subscription can be cancelled using the Cancel API or from the Dashboard.

Paused
Only Subscriptions in the active state can be paused.

You can pause a Subscription.

From the Dashboard.
Using API.
Watch Out!

If you pause a Subscription in the authenticated state, the Subscription goes to the cancelled state.

Expired
If the start_at time for the Subscription has been set and the authentication transaction has not been done by the start_at time, the Subscription moves to the expired state and cannot be used again.

Completed
A Subscription moves to the completed state when it reaches the end of its life cycle as per the end_date set for the Subscription.

Create a Subscription
POST
/v1/subscriptions
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to create a Subscription.

Is this page helpful?

Request Parameters

9

Response Parameters

24

Errors

4

Request Parameters
plan_id

-

string
The unique identifier of a plan that should be linked to the Subscription. For example, plan_00000000000001.

total_count

-

integer
The number of billing cycles for which the customer should be charged. For example, if a customer is buying a 1-year subscription billed on a bi-monthly basis, this value should be 6.

quantity
integer
The number of times the customer should be charged the plan amount per invoice. For example, a customer subscribes to use software. The charges are RM 100 /month/license. The customer wants 5 licenses. You should pass 5 as the quantity. The customer is charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

start_at
integer
Unix timestamp that indicates from when the Subscription should start. If not passed, the Subscription starts immediately after the authorisation payment. For example, 1581013800. For Subscriptions with a future start_date, frequency is considered as_presented.

expire_by
integer
Unix timestamp that indicates till when the customer can make the authorisation payment. For example, 1581013800. The default value is 30 years. Do not pass any value if you do not want to set an expiry date.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec. Possible values:
true (default): Communication handled by Razorpay Curlec.
false: Communication handled by businesses.

addons
object
Array that contains details of any upfront amount you want to collect as part of the authorisation transaction.

Show child parameters (1)

offer_id
string
The unique identifier of the offer that is linked to the Subscription. You can obtain this from the Dashboard. For example, offer_JHD834hjbxzhd38d.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
The requested URL was not found on the server.

Error Status: 400

This error occurs when the Subscriptions feature is not enabled.

Solution

The id provided does not exist

Error Status: 400

This error occurs when passing an incorrect plan_id.

Solution

Offer Not Found

Error Status: 400

This error occurs when you are linking an invalid/expired offer to a Subscription.

Solution

Offer not applicable for this Subscription

Error Status: 400

This error occurs when you are linking/passing an offer_id to a Subscription on which the offer doesn't apply.

Solution

Create a Subscription Link
POST
/v1/subscriptions
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to create a Subscription link.

Is this page helpful?

Request Parameters

10

Response Parameters

24

Errors

1

Request Parameters
plan_id

-

string
The unique identifier of a plan that should be linked to the Subscription. For example, plan_00000000000001.

total_count

-

integer
The number of billing cycles for which the customer should be charged. For example, if a customer is buying a 1-year subscription billed on a bi-monthly basis, this value should be 6.

quantity
integer
The number of times the customer should be charged the plan amount per invoice. For example, a customer subscribes to use software. The charges are RM 100 /month/license. The customer wants 5 licenses. You should pass 5 as the quantity. The customer is charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

start_at
integer
Unix timestamp that indicates from when the Subscription should start. If not passed, the Subscription starts immediately after the authorisation payment. For example, 1581013800. For Subscriptions with a future start_date, frequency is considered as_presented.

expire_by
integer
Unix timestamp that indicates till when the customer can make the authorisation payment. For example, 1581013800. The default value is 30 years. Do not pass any value if you do not want to set an expiry date.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec. Possible values:
true (default): Communication handled by Razorpay Curlec.
false: Communication handled by businesses.

addons
object
Array that contains details of any upfront amount you want to collect as part of the authorisation transaction.

Show child parameters (1)

offer_id
string
The unique identifier of the offer that is linked to the Subscription. You can obtain this from the Dashboard. For example, offer_JHD834hjbxzhd38d.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

notify_info
object
The customer's email and phone number to which notifications are to be sent. Use this array only if you have set the customer_notify parameter to true. That is, Razorpay sends notifications to the customer. The customer details entered in the API request are only to notify the customer about the Subscription. The same will not be prefilled in the checkout as per the government guidelines.

Show child parameters (2)

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
Link expire by cannot be lesser than the current time.

Error Status: 400

This error occurs when the time mentioned in the expire_by parameter has already passed. For example, if today's date is December 12, 2022, but the expiry date is mentioned as December 10, 2022.

Solution

Fetch All Subscriptions
GET
/v1/subscriptions
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to fetch all the created Subscriptions.

Is this page helpful?

Query Parameters

5

Response Parameters

24

Errors

1

Query Parameters
plan_id
string
The unique identifier of the plan for which you want to retrieve all the Subscriptions.

from
integer
The Unix timestamp from when Subscriptions are to be fetched.

to
integer
The Unix timestamp till when Subscriptions are to be fetched.

count
integer
The number of Subscriptions to be fetched. Default value is 10. Maximum value is 100. This can be used for pagination, in combination with skip.

skip
integer
The number of Subscriptions to be skipped. Default value is 0. This can be used for pagination, in combination with count.

Response Parameters
id
string
The unique identifier linked to a Subscription.

entity
string
The entity being created. Here, it is subscription.

plan_id
string
The unique identifier of a plan that should be linked to the Subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer who is subscribing to a plan. This is populated automatically after the customer completes the authorisation transaction.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, if a customer is buying a 1-year subscription billed on a bi-monthly basis, this value should be 6.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec. Possible values:
true (default): Communication handled by Razorpay Curlec.
false: Communication handled by businesses.

start_at
integer
The Unix timestamp, indicates from when the Subscription should start. If not passed, the Subscription starts immediately after the authorisation payment. For example, 1581013800. For Subscriptions with a future start_date, frequency is considered as_presented.

quantity
integer
The number of times the customer should be charged the plan amount per invoice. For example, a customer subscribes to use software. The charges are RM 100/month/license. The customer wants 5 licenses. You should pass 5 as the quantity. The customer is charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Object consisting of key value pairs as notes.

status
string
Status of the Subscription. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired
Know more about Subscriptions States.

paid_count
integer
Indicates the number of billing cycles the customer has already been charged.

current_start
integer
Indicates the start time of the current billing cycle of a Subscription.

current_end
integer
Indicates the end time of the current billing cycle of a Subscription.

ended_at
integer
The Unix timestamp of when the Subscription has completed its period or has been cancelled midway.

charge_at
integer
The Unix timestamp of when the next charge on the Subscription should be made.

auth_attempts
integer
The number of times the charge for the current billing cycle has been attempted on the card.

expire_by
integer
The Unix timestamp that indicates till when the customer can make the authorisation payment. For example, 1581013800. The default value is 30 years. Do not pass any value if you do not want to set an expiry date.

addons
array of objects
Array that contains details of any upfront amount you want to collect as part of the authorisation transaction.

Show child parameters (1)

offer_id
string
The unique identifier of the offer that is linked to the Subscription. You can obtain this from the Dashboard. For example, offer_JHD834hjbxzhd38d.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Gym Membership Plan.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the Subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the Subscription should be updated. Possible values:
now (default): Updates the Subscription immediately.
cycle_end: Updates the Subscription at the end of the current billing cycle.

remaining_count
integer
Indicates the number of billing cycles remaining on the Subscription. For example, 2.

Errors
The API key/secret provided is invalid.

Error Status: 4xx

This error occurs due to a mismatch between the API credentials passed in the API call and those generated on the Dashboard.

Solution

Api

Payments

Subscriptions

Fetch Subscription Id

API Test Keys

Fetch a Subscription With ID
GET
/v1/subscriptions/:id
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to fetch a Subscription by the unique identifier.

Is this page helpful?

Path Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
ub_id%7D is not a valid id

Error Status: 400

This error occurs when you are not passing the right subscription_id in the API endpoint to fetch a plan based on the id.

Solution

Api

Payments

Subscriptions

Cancel Subscription

API Test Keys

Cancel a Subscription
POST
/v1/subscriptions/:id/cancel
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to cancel a Subscription. You can either cancel the Subscription immediately or at the end of the current billing cycle. Once cancelled, you cannot renew or reactivate it.

When you cancel a Subscription, the status changes to cancelled.
If you choose to cancel a Subscription at the end of a billing cycle, its status changes to cancelled only at the end of the current billing cycle.

Is this page helpful?

Path Parameters

1

Request Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Request Parameters
cancel_at_cycle_end
boolean
Use this parameter to cancel a Subscription at the end of a billing cycle. Possible values:
true: Cancel the subscription at the end of the current billing cycle.
false (default): Cancel the subscription immediately.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
Subscription is not cancellable in expired status.

Error Status: 400

This error occurs when you are trying to cancel a Subscription which is in the expired state.

Solution

Api

Payments

Subscriptions

Fetch Subscription Id

API Test Keys

Fetch a Subscription With ID
GET
/v1/subscriptions/:id
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to fetch a Subscription by the unique identifier.

Is this page helpful?

Path Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
ub_id%7D is not a valid id

Error Status: 400

This error occurs when you are not passing the right subscription_id in the API endpoint to fetch a plan based on the id.

Solution

Api

Payments

Subscriptions

Cancel Subscription

API Test Keys

Cancel a Subscription
POST
/v1/subscriptions/:id/cancel
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to cancel a Subscription. You can either cancel the Subscription immediately or at the end of the current billing cycle. Once cancelled, you cannot renew or reactivate it.

When you cancel a Subscription, the status changes to cancelled.
If you choose to cancel a Subscription at the end of a billing cycle, its status changes to cancelled only at the end of the current billing cycle.

Is this page helpful?

Path Parameters

1

Request Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Request Parameters
cancel_at_cycle_end
boolean
Use this parameter to cancel a Subscription at the end of a billing cycle. Possible values:
true: Cancel the subscription at the end of the current billing cycle.
false (default): Cancel the subscription immediately.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
Subscription is not cancellable in expired status.

Error Status: 400

This error occurs when you are trying to cancel a Subscription which is in the expired state.

Solution

Api

Payments

Subscriptions

Update Subscription

API Test Keys

Update a Subscription
PATCH
/v1/subscriptions/:id
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to update a Subscription.

Is this page helpful?

Path Parameters

1

Request Parameters

7

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Request Parameters
plan_id
string
The unique identifier of the new plan that should be linked to the Subscription. For example, plan_00000000000001.

offer_id
string
The unique identifier of the offer that should be linked to the Subscription. You can obtain this from the Dashboard. For example, offer_JHD834hjbxzhd38d.

quantity
integer
The number of times the plan should be linked to the Subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

remaining_count
integer
This parameter is used to update the total_count for a Subscription. For example, let us consider a monthly Subscription with 12 billing cycles. The Subscription has been charged successfully 4 times and 3 more invoices have been issued, but have not been charged. The remaining count in such cases is 5. However, you can overwrite this value using this parameter.

start_at
integer
Unix timestamp. The new start date for the Subscription.

schedule_change_at
string
Represents when the Subscription should be updated.
now (default): Updates the Subscription immediately.
cycle_end: Updates the Subscription at the end of the current billing cycle.

customer_notify
boolean
Represents who sends notifications to the customer. Possible values:
true (default): Notifications sent by Razorpay Curlec.
false: Notifications sent by you.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
Can't update Subscription when Subscription is not in Authenticated or Active state

Error Status: 400

This error occurs when you are trying to update a Subscription in the created state.

Solution

Api

Payments

Subscriptions

Fetch Pending Update Details

API Test Keys

Fetch Details of a Pending Update
GET
/v1/subscriptions/:id/retrieve_scheduled_changes
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to retrieve details of a pending update. This happens when a Subscription is updated using the end of cycle option for the schedule_change_at parameter.

Example

A Subscription is to be charged on the 1st of every month. It was charged on January 01, 2021. On January 15, 2021, it was updated using the end of cycle option for the schedule_change_at parameter. In this case, the update goes live after the Subscription is charged on February 01, 2021. Such updates are said to be scheduled updates and details of such updates can be fetched using this API.

Is this page helpful?

Path Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
The API key/secret provided is invalid.

Error Status: 4xx

This error occurs due to a mismatch between the API credentials passed in the API call and those generated on the Dashboard.

Solution

Api

Payments

Subscriptions

Cancel Update

API Test Keys

Cancel an Update
POST
/v1/subscriptions/:id/cancel_scheduled_changes
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to cancel a pending update. This happens when a Subscription is updated using the end of cycle option for the schedule_change_at parameter.

Example

A Subscription is to be charged on the 1st of every month. It was charged on January 01, 2021. On January 15, 2021, it was updated using the end of cycle option for the schedule_change_at parameter. In this case, the update goes live after the Subscription is charged on February 01, 2021. Such updates are said to be scheduled updates and can be cancelled using this API.

Handy Tips

You can only cancel a pending update for a subscription. You cannot cancel an update once it is live.

Is this page helpful?

Path Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
The API key/secret provided is invalid.

Error Status: 4xx

This error occurs due to a mismatch between the API credentials passed in the API call and those generated on the Dashboard.

Solution

Api

Payments

Subscriptions

Pause Subscription

API Test Keys

Pause a Subscription
POST
/v1/subscriptions/:id/pause
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to pause a Subscription.

Watch Out!

You can only pause a Subscriptions in the active state.
If you pause a Subscription in the authenticated state, it goes to the cancelled state.

Is this page helpful?

Path Parameters

1

Request Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Request Parameters
pause_at
string
The value should be now to pause a Subscription immediately.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
The API key/secret provided is invalid.

Error Status: 4xx

This error occurs due to a mismatch between the API credentials passed in the API call and those generated on the Dashboard.

Solution

Api

Payments

Subscriptions

Resume Subscription

API Test Keys

Resume a Subscription
POST
/v1/subscriptions/:id/resume
Click to copy

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Use this endpoint to resume a Subscription.

Is this page helpful?

Path Parameters

1

Request Parameters

1

Response Parameters

24

Errors

1

Path Parameters
id

-

string
The unique identifier linked to a Subscription. For example, sub_00000000000001.

Request Parameters
resume_at
string
The value should be now to resume a Subscription immediately.

Response Parameters
id
string
The unique identifier of the subscription created. For example, sub_00000000000001.

entity
string
The entity being created. Here, it will be subscription.

plan_id
string
The unique identifier for a plan that is linked to the created subscription. For example, plan_00000000000001.

customer_id
string
The unique identifier of the customer linked to the subscription. This is populated automatically once the customer completes the authorisation transaction. For example, cust_00000000000001.

status
string
Status of the subscription. Refer to the life cycle section for more details. Possible values:
created
authenticated
active
pending
halted
cancelled
completed
expired

current_start
integer
Unix timestamp. The start time of the current billing cycle of the subscription. For example, 1581013800.

current_end
integer
Unix timestamp. The end time of the current billing cycle of the subscription. For example, 1581013800.

ended_at
integer
The timestamp, in Unix format, when the subscription was completed or was cancelled. For example, 1581013800.

quantity
integer
The number of times the plan should be linked to the subscription. For example, if the plan is RM 100/user/month and the customer has 5 users, you should pass 5 as the quantity to have the customer charged RM 500 (5 x RM 100) monthly. By default, this value is set to 1.

notes
object
Notes you can enter for the contact for future reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, "note_key": "Beam me up Scotty”.

charge_at
integer
Unix timestamp. This indicates when the next charge on the subscription should be made. For example, 1581013800.

offer_id
string
The unique identifier of the offer that should be linked to the subscription. For example, offer_JHD834hjbxzhd38d.

start_at
integer
The timestamp, in Unix format, when the subscription should start. If not passed, the subscription starts immediately after the authorisation payment. For example, 1581013800.

end_at
integer
The timestamp, in Unix format, when the subscription should end. For example, 1581013800.

auth_attempts
integer
The number of times that the charge for the current billing cycle has been attempted on the card. For example, 2.

total_count
integer
The number of billing cycles for which the customer should be charged. For example, 2. We support subscriptions for a maximum duration of 100 years. The number of billing cycles depends if the subscription is daily, weekly, monthly or yearly.

paid_count
integer
This indicates the number of billing cycles for which the customer has already been charged. For example, 2.

customer_notify
boolean
Indicates whether the communication to the customer would be handled by businesses or Razorpay Curlec.
true: Communication handled by Razorpay Curlec. Defaults to true.
false: Communication handled by businesses.

created_at
integer
The timestamp, in Unix format, when the subscription was created. For example, 1581013800.

expire_by
integer
The timestamp, in Unix format, till when the customer can make the authorisation payment. For example, 1581013800.

short_url
string
URL that can be used to make the authorisation payment. For example, https://rzp.io/i/PWtAiEo.

has_scheduled_changes
boolean
Indicates if the subscription has any scheduled changes. Possible values:
true: Subscription has scheduled changes.
false: Subscription does not have scheduled changes.

schedule_change_at
string
Represents when the subscription should be updated. Possible values:
now (default): Updates the subscription immediately.
cycle_end: Updates the subscription at the end of the current billing cycle.

remaining_count
integer
This indicates the number of billing cycles remaining on the subscription. For example, 2.

Errors
The API key/secret provided is invalid.

Error Status: 4xx

This error occurs due to a mismatch between the API credentials passed in the API call and those generated on the Dashboard.

Solution

Create Subscriptions
Create Razorpay Curlec Subscriptions plan for your customers. Check the Trial Period and Upfront Amount.

Available in

IN
India

MY
Malaysia

SG
Singapore

US
United States

Follow the below steps to create Subscriptions for your customers:

Create a Plan
Create a Subscription
Plan
A Plan is a foundation on which a Subscription is built. It acts as a reusable template and contains details of the goods or services offered with the amount to be charged and the frequency at which the customer should be charged (billing cycle). Depending upon your business, you can create multiple Plans with different billing cycles and pricing.

You should create a Plan before creating a Subscription via your checkout or using the Subscription Links.

You can create Plans from the Dashboard or using APIs.

Subscription
A Subscription contains details like the Plan, the start date, total number of billing cycles, free trial period (if any) and upfront amount to be collected.

Subscriptions can be created from the Dashboard or using APIs.

Trial Period
You can create a fully-customised trial period of Subscriptions that does not have to follow the typical 1-week or 1-month trial template.

To create a trial period for your customers, provide a future start date when creating the Subscription. The actual billing cycle automatically starts at the specified date, creating a free trial period.

Example
Acme Corp. provides video streaming services and wants to offer a 1-month free trial.
The customer selects the Plan on March 5, 2025 and completes the authentication transaction.
During the authentication transaction, Acme Corp. creates a Subscription with start date of April 5, 2025.
Now, although the authentication transaction was done on March 5, 2025, the customer’s card will be charged only from April 5, 2025.
The customer or the business can decide to cancel the Subscription at any time before that. The time between March 5, 2025 and April 5, 2025 is treated as the trial period.
Handy Tips

When creating a Subscription link from the Dashboard, you can add a trial period by setting the start date to any future date.
When creating a Subscription or a Subscription link using APIs, you can add a trial period by passing a future start date for the start-at parameter in the request.
Upfront Amount
There might be scenarios where you want to charge the customers an extra amount either at the start of the Subscription or even before the Subscription starts. For example, you might want to charge the customer a delivery fee or a setup fee. You can add this to the Subscription as an upfront amount as part of the authentication transaction.

Example
Acme Corp. provides furniture on rent.
Acme Corp. charges RM 50 as security deposit. This needs to be collected before the furniture is delivered.
While creating a Subscription for the customer, Acme Corp. adds an upfront amount of RM 50.
When the customer subscribes to the service (during authentication transaction), RM 50 is collected from the customer.
Handy Tips

When creating a Subscription link from the Dashboard, you can add an upfront amount by selecting the I want to add an upfront amount check box and following the instructions on screen.
When creating a Subscription or a Subscription link using APIs, you can add an upfront amount by passing an addons key in the request.
