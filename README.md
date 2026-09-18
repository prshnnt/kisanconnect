user[registered_apmc , first name,middle name ,  last name , s/o d/o w/o , date of birth , gender , mobile number , alternate phone number , email id , permanent address(address line 1 , address line 2 , pincode , state , district , tehsil , city ) ]
bank_details[account number , ifsc code , ]

user_preference[sellers,buyers, service_providers]

sellers_types[farmer , fpo]
seller[preferred selling commodities , preferred loactions (preferred selling state , preferred selling apmc )]

buyer[preferred comodities , preferred location (  preferred buying state , preferred buying apmc ),trade licences]
trade_licence[issued state , issued apmc , operational state , license type (single , unified), APMC type (enam apmc , non enam apmc) , operational APMC , trading license number , attachment(file-> image , pdf) , issue date , expiry date]

services[weightment_service , warehouse_service , logistic_service , assaying_service , assurance_service , packaging , grading & sorting , labour_services]

weightment_service[shopname ,apmctype(inside,outside),weightmenttype(wright_brigde ,weighing scale, certificates(files->images,pdfs)),states]
warehouse_service[states,district,tehsil,city/village,godown name ,warehouse_type , storage_capacity, services_offered,rental_models ,response time,prefered commodities , wdra accredition , attachments , preferred communication methods[phone, email]]
logistic_service[service model[door-to-door , first mile pickup , last mile pickup , inter state , intra state , hub and spoke] , route details , base location , vehical type , vehical capacity , services offered , goods speacialisation , speacial equipment and features , reponse time , preferred communication type(phone , email) ]
assaying service[testing_type(physical, chemical ) , shop name , commodity expertise , sample pickup facility , accredition ,attachments , special equiment and feature , response time , preferred communication type(phone , email)]